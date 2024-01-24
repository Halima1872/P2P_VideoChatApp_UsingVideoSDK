import "./homePageContent.css"
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authToken, createMeeting,validateMeeting } from '../../API';


function JoinScreen({ user }) {
    const [meetingId, setMeetingId] = useState(null);
    const navigate = useNavigate();

    const onJoinMeeting = async () => {
        if (meetingId === null) {
            toast.error("Please Enter Meeting ID!", {
                position: "top-center",
            });
        }
        else {
            const res = await validateMeeting({ meetingId: meetingId , token: authToken })
            if(res){
                if (!user) {
                    navigate("/login");
                }
                else {
                    navigate(`/meeting/${meetingId}`);
                }
            }
            else{
                toast.error("Invalid Meeting ID!", {
                    position: "top-center",
                });
            }
            
        }
    };
    const onCreateMeeting = async() => {
        const mId = await createMeeting({ token: authToken })
        setMeetingId(mId)
        if (!user) {
            navigate("/login");
        }
        else {
            navigate(`/meeting/${mId}`);
        }
    }

    return (
        <div>
            <input
                type="text"
                className="roomID"
                placeholder="Enter Meeting Id"
                onChange={(e) => {
                    setMeetingId(e.target.value);
                }}
            />
            <br></br>
            <button className="joinBtn" onClick={onJoinMeeting}>Join</button>
            {" or "}
            <button className="joinBtn" onClick={onCreateMeeting}>Create Meeting</button>
        </div>
    );
}

const HomePageContent = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="home-page-content">
            <h1>Connect Instantly, <br></br> Chat Seamlessly.</h1>
            <p>Experience the Power of Peer-to-Peer <br></br> Communication with our Secure and User-Friendly <br></br>Chat App.
                Create or Join a Meeting Using Meeting ID</p>
            <JoinScreen user={user} />
            <ToastContainer />
        </div>

    );
};
export default HomePageContent;