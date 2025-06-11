import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

export default function StreamPage() {
  const location = useLocation(); // Get state passed from TeacherHome
  const navigate = useNavigate(); // For navigation
  const { classroomId } = useParams(); // Get classroom ID from URL
  const { streamTitle } = location.state || {}; // Get stream title from state
  const localStreamRef = useRef(null); // For teacher's local stream
  const videoRef = useRef(null); // For student's video stream
  const pcRef = useRef(null); // Use a top-level ref!
  const negotiatingRef = useRef(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // State to track pause/resume
  const [error, setError] = useState(null); // State to handle errors
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const socket = useSocket();

  // Determine if the user is a teacher
  useEffect(() => {
    const role = localStorage.getItem("role"); // Assuming role is stored in localStorage
    setIsTeacher(role === "teacher");
  }, []);

  // Initialize WebRTC and capture video for teachers
  useEffect(() => {
    let isMounted = true;

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (isTeacher) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        if (!isMounted) return;
        localStreamRef.current.srcObject = stream;
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });
        pcRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", { candidate: event.candidate, classroomId });
          }
        };

        const watcherHandler = async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { offer, classroomId });
        };
        socket.on("watcher", watcherHandler);

        const answerHandler = async ({ answer }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        };
        socket.on("answer", answerHandler);

        const iceHandler = async ({ candidate }) => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {}
        };
        socket.on("ice-candidate", iceHandler);

        socket.emit("broadcaster", classroomId);

        // Cleanup
        return () => {
          pc.close();
          socket.off("watcher", watcherHandler);
          socket.off("answer", answerHandler);
          socket.off("ice-candidate", iceHandler);
        };
      });
    } else {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      pcRef.current = pc;
      pc.ontrack = (event) => {
        videoRef.current.srcObject = event.streams[0];
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, classroomId });
        }
      };

      const offerHandler = async ({ offer }) => {
        if (pc.signalingState !== "stable" || negotiatingRef.current) {
          console.warn("Offer ignored: signalingState is", pc.signalingState, "negotiating:", negotiatingRef.current);
          return;
        }
        negotiatingRef.current = true;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { answer, classroomId });
        } finally {
          negotiatingRef.current = false;
        }
      };
      socket.on("offer", offerHandler);

      const iceHandler = async ({ candidate }) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      };
      socket.on("ice-candidate", iceHandler);

      socket.emit("watcher", classroomId);

      // Cleanup
      return () => {
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
        socket.off("offer", offerHandler);
        socket.off("ice-candidate", iceHandler);
      };
    }

    return () => {
      isMounted = false;
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      socket.removeAllListeners();
    };
  }, [isTeacher, classroomId, socket]);

  // Pause or Resume the stream (for teachers only)
  const toggleStream = () => {
    const stream = localStreamRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => {
        if (track.enabled) {
          track.enabled = false; // Pause the track
          setIsPaused(true);
        } else {
          track.enabled = true; // Resume the track
          setIsPaused(false);
        }
      });
    }
  };

  // Handle stop stream and navigate back to Teacher Home
  const handleStopAndNavigate = async () => {
    const stream = localStreamRef.current?.srcObject;
    if (stream) {
      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop());
      localStreamRef.current.srcObject = null;
    }
    socket.emit("stopStream", classroomId); // Notify students that the stream has stopped
    navigate("/teacher-home"); // Redirect to Teacher Home
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1d0036] to-[#6A29FF] text-white">
      {/* Header Section */}
      <div className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">{streamTitle || "Live Stream"}</h1>
      </div>

      <div className="flex-1 flex flex-col items-center bg-gray-100 p-6">
        {/* Teacher: Show their own camera stream */}
        {isTeacher ? (
          <video
            ref={localStreamRef}
            autoPlay
            muted
            controls
            className="w-full h-1/2 max-w-5xl bg-black rounded-lg"
          ></video>
        ) : (
          // Student: Show the live stream if available
          <video
            ref={videoRef}
            autoPlay
            controls
            className="w-full h-1/2 max-w-5xl bg-black rounded-lg"
          ></video>
        )}
      </div>

      {/* Message Box Section */}
      <div className="p-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-md rounded-lg w-full max-w-4xl mx-auto">
        <h2 className="text-lg font-bold mb-4">Emotion Monitoring</h2>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <p key={index} className="text-gray-300 bg-gray-800 p-2 rounded-lg">
                {msg}
              </p>
            ))
          ) : (
            <p className="text-gray-400">No emotions detected yet.</p>
          )}
        </div>
      </div>
      {isTeacher && (
        <div className="p-4 flex justify-between">
          <button
            onClick={toggleStream}
            className={`${
              isPaused
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white px-4 py-2 rounded-lg`}
          >
            {isPaused ? "Resume Stream" : "Pause Stream"}
          </button>
          <button
            onClick={handleStopAndNavigate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Stop and Go to Teacher Home
          </button>
        </div>
      )}
    </div>
  );
}
