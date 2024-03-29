import './App.css'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from './pages/register/Register';
import VideoCall from "./pages/videoCall/VideoCall";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/meeting/:meetingId" element={<VideoCall />} />
        
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App