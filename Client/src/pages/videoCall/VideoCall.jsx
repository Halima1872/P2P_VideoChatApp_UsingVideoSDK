import { useParams, useNavigate } from "react-router-dom";
import { authToken } from '../../API';
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./videoCall.css"

import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";


function Controls() {
  const { leave, toggleMic, toggleWebcam } = useMeeting();
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const { meetingId } = useParams();

  const handleCameraClick = () => {
    toggleWebcam();
    setIsCameraOff((prevIsCameraOff) => !prevIsCameraOff);
  };

  const handleMicClick = () => {
    toggleMic();
    setIsMicMuted((prevIsMicMuted) => !prevIsMicMuted);
  };

  return (
    <>
      <div id="controls">
      <div className={isCameraOff ? "OFF" : "control-container"} onClick={handleCameraClick} id="camera-btn">
        <img src="/icons/camera.png" alt="Camera" />
      </div>
      <div className={isMicMuted ? "OFF" : "control-container"} onClick={handleMicClick} id="mic-btn">
        <img src="/icons/mic.png" alt="Microphone" />
      </div>
      <div className="control-container" id="leave-btn" onClick={() => leave()}>
        <img src="/icons/phone.png" alt="Hang Up" />
      </div>
    </div>
    <div>
    <p className="mid"  >Meeting Id: {meetingId}</p>
    </div>
    </>
    
    
  );
}
function ParticipantView(props) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(props.participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div className="participant-view">
      
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      <div className="participant-video">
      {webcamOn && (
        <ReactPlayer
          //
          playsinline // very very imp prop
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          //
          url={videoStream}
          //
          height={"100%"}
          width={"100%"}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      )}
      </div>
      <p className="participant-name">
        {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic:{" "}
        {micOn ? "ON" : "OFF"} 
      </p>
      
    </div>
  );
}

function MeetingView(props) {
  const [joined, setJoined] = useState(null);
  const navigate = useNavigate();
  //Get the method which will be used to join the meeting.
  //We will also get the participants list to display all participants
  const { join, participants } = useMeeting({
    //callback for when meeting is joined successfully
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    //callback for when meeting is left
    onMeetingLeft: () => {
      //props.onMeetingLeave();
      navigate("/");
    },
  });
  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
    <div className="container">
      
      {joined && joined == "JOINED" ? (
        <div className="participant-container">
          
          {[...participants.keys()].map((participantId) => (
            <ParticipantView
              participantId={participantId}
              key={participantId}
            />
          ))}
          <Controls />
          
        </div>
      ) : joined && joined == "JOINING" ? (
        <p>Joining the meeting...</p>
      ) : (
        <>
        <p className="noRemote" >Meeting Id: {props.meetingId}</p>
        <button className="startCall" onClick={joinMeeting}>Join</button>
        </>
        
      )}
    </div>
  );
}


const VideoCall = () =>{
  const { meetingId } = useParams();
  const { user } = useContext(AuthContext);
  const username = user
  console.log(username)

  return authToken &&  (
    <>
    <div className="video-call-container">
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: username,
      }}
      token={authToken}
    >
      <MeetingView meetingId={meetingId}  />
    </MeetingProvider>

    </div>



    </>
  )

}
export default VideoCall