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


function Controls({ toggleScreenShare }) {
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

  const handleToggleScreenShare = () => {
    toggleScreenShare();
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
        <div className="control-container" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }} onClick={handleToggleScreenShare} >
          <img src="/icons/screen.png" alt="Hang Up" />
        </div>
        <div className="control-container" id="leave-btn" onClick={() => leave()}>
          <img src="/icons/phone.png" alt="Hang Up" />
        </div>

      </div>
      <div>
        <p className="mid">Meeting Id: {meetingId}</p>
      </div>
    </>


  );
}
//Responsible for rendering the audio and video of each participant on our page
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
    <div className={isLocal ? "local-video" : "participant-view"}>

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
      { !isLocal && <p className="participant-name">
        {displayName} | Webcam: {webcamOn ? "ON" : "OFF"} | Mic:{" "}
        {micOn ? "ON" : "OFF"}
      </p>}

    </div>
  );
}

const PresenterView = ({ presenterId }) => {
  const { screenShareAudioStream, isLocal, screenShareStream, screenShareOn, displayName } = useParticipant(presenterId);

  //Creating a media stream from the screen share stream
  const mediaStream = useMemo(() => {
    if (screenShareOn && screenShareStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareStream.track);
      return mediaStream;
    }
  }, [screenShareStream, screenShareOn]);

  const audioPlayer = useRef();

  useEffect(() => {
    if (
      !isLocal &&
      audioPlayer.current &&
      screenShareOn &&
      screenShareAudioStream
    ) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareAudioStream.track);

      audioPlayer.current.srcObject = mediaStream;
      audioPlayer.current.play().catch((err) => {
        if (
          err.message ===
          "play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD"
        ) {
          console.error("audio" + err.message);
        }
      });
    } else {
      audioPlayer.current.srcObject = null;
    }
  }, [screenShareAudioStream, screenShareOn, isLocal]);

  return (
    <>
      <div className="participant-view">
        <div className="participant-video">
          <ReactPlayer
            //
            playsinline // very very imp prop
            playIcon={<></>}
            //
            pip={false}
            light={false}
            controls={false}
            muted={true}
            playing={true}
            //
            url={mediaStream} // passing mediastream here
            //
            height={"100%"}
            width={"100%"}
            
            onError={(err) => {
              console.log(err, "presenter video error");
            }}
          />
        </div>
        <p className="participant-name">
        {displayName} is currently presenting
      </p>
      </div>
      <audio autoPlay playsInline controls={false} ref={audioPlayer} />
    </>
  );
};


function MeetingView(props) {
  const [joined, setJoined] = useState(null);
  const navigate = useNavigate();

  function onPresenterChanged(presenterId) {
    if (presenterId) {
      console.log(presenterId, "started screen share");
      
    } else {
      console.log("someone stopped screen share");
      
    }
  }
  //Get the method which will be used to join the meeting.
  //We will also get the participants list to display all participants
  const { join, participants, toggleScreenShare, presenterId } = useMeeting({

    onPresenterChanged,

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
          {presenterId && <PresenterView presenterId={presenterId} />}
          <Controls toggleScreenShare={toggleScreenShare} />

        </div>
      ) : joined && joined == "JOINING" ? (
        <p className="noRemote">Joining the meeting...</p>
      ) : (
        <>
          <p className="noRemote" >Meeting Id: {props.meetingId}</p>
          <button className="startCall" onClick={joinMeeting}>Join</button>
        </>

      )}
    </div>
  );
}


const VideoCall = () => {
  const { meetingId } = useParams();
  const { user } = useContext(AuthContext);
  const username = user
  console.log(username)

  return authToken && (
    <>
      
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: true,
            webcamEnabled: true,
            name: username,
          }}
          token={authToken}
        >
          <MeetingView meetingId={meetingId} />
        </MeetingProvider>
        

    </>
  )

}
export default VideoCall