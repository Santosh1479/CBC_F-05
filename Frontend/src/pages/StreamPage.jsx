import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { FaDownload } from "react-icons/fa";

const EMOTION_MAP = {
  Angry: "confused",
  Disgust: "confused",
  Fear: "confused",
  Sad: "bored",
  Surprise: "bored",
  Happy: "attentive",
  Neutral: "attentive",
  // Add "looking away" if you have a way to detect it
};

export default function StreamPage() {
  const location = useLocation();
  const { classroomId } = useParams();
  const { streamTitle } = location.state || {};
  const localStreamRef = useRef(null);
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const negotiatingRef = useRef(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(""); // For sending to teacher
  const [messages, setMessages] = useState([]);
  const [studentEmotion, setStudentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [confirmedEmotion, setConfirmedEmotion] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [attendanceClass, setAttendanceClass] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(null);
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const socket = useSocket();
  const navigate = useNavigate();

  const handleStopStream = () => {
    socket.emit("stopStream", selectedClassroom?._id || classroomId);
    setAttendanceClass(selectedClassroom || { _id: classroomId, name: streamTitle || "Class" });
    setAttendanceDate(new Date().toISOString().slice(0, 10));
    setShowAttendancePopup(true);
    setShowStreamModal(false);
    setSelectedClassroom(null);
    // Do NOT navigate here!
  };

  const handleExitClassroom = () => {
    navigate("/user-home");
  };

  // Set role, userId, and userName from localStorage
  useEffect(() => {
    setIsTeacher(localStorage.getItem("role") === "teacher");
    setUserId(localStorage.getItem("userId"));
    setUserName(localStorage.getItem("name") || "Unknown");
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Cleanup previous connection if any
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (isTeacher) {
      // TEACHER: Capture and stream video
      let pc;
      let watcherHandler, answerHandler, iceHandler;

      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        localStreamRef.current.srcObject = stream;
        pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });
        pcRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", { candidate: event.candidate, classroomId, userId });
          }
        };

        // When a student joins, create and send an offer
        watcherHandler = async ({ watcherId }) => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { offer, classroomId, to: watcherId });
        };
        socket.on("watcher", watcherHandler);

        // Receive answer from student
        answerHandler = async ({ answer, from }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        };
        socket.on("answer", answerHandler);

        // ICE from student
        iceHandler = async ({ candidate, from }) => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {}
        };
        socket.on("ice-candidate", iceHandler);

        socket.emit("broadcaster", { classroomId, userId });
      });

      // Cleanup
      return () => {
        if (pc) pc.close();
        socket.off("watcher", watcherHandler);
        socket.off("answer", answerHandler);
        socket.off("ice-candidate", iceHandler);
      };
    } else {
      // STUDENT: Only view stream
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      pcRef.current = pc;

      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, classroomId, userId });
        }
      };

      // Receive offer from teacher, send answer
      const offerHandler = async ({ offer, from }) => {
        if (pc.signalingState !== "stable" || negotiatingRef.current) {
          return;
        }
        negotiatingRef.current = true;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { answer, classroomId, to: from });
        } finally {
          negotiatingRef.current = false;
        }
      };
      socket.on("offer", offerHandler);

      // ICE from teacher
      const iceHandler = async ({ candidate, from }) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      };
      socket.on("ice-candidate", iceHandler);

      // Announce as watcher
      socket.emit("watcher", { classroomId, watcherId: userId });

      // Cleanup
      return () => {
        pc.close();
        socket.off("offer", offerHandler);
        socket.off("ice-candidate", iceHandler);
      };
    }
  }, [isTeacher, classroomId, socket, userId]);

  // Student: Capture and send frame every 2 seconds, classify, and send to teacher if needed
  useEffect(() => {
    if (isTeacher) return;

    let intervalId;
    const captureAndSend = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append("image", blob, "frame.jpg");
        try {
          const res = await fetch(`${import.meta.env.VITE_ML_URI}/predict-state`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.state) {
            setEmotionHistory((prev) => {
              const newHistory = [...prev, data.state].slice(-5);
              if (newHistory.length === 5 && newHistory.every((e) => e === newHistory[0])) {
                if (confirmedEmotion !== newHistory[0]) {
                  setConfirmedEmotion(newHistory[0]);
                  setStudentEmotion(newHistory[0]);
                  if (["confused", "bored", "looking away"].includes(newHistory[0])) {
                    socket.emit("student-emotion", {
                      classroomId,
                      userId,
                      name: userName,
                      emotion: newHistory[0],
                    });
                  }
                }
              }
              return newHistory;
            });
          }
        } catch (e) {
          setStudentEmotion("Error");
        }
      }, "image/jpeg");
    };

    intervalId = setInterval(captureAndSend, 2000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, [isTeacher, confirmedEmotion, userName, classroomId, socket, userId]);

  // Teacher: Listen for student emotion events
  useEffect(() => {
    if (!isTeacher) return;
    const handler = ({ name, emotion }) => {
      setMessages((prev) => [
        ...prev,
        `${name} is ${emotion}`,
      ]);
    };
    socket.on("student-emotion", handler);
    return () => socket.off("student-emotion", handler);
  }, [isTeacher, socket]);

  return (
    <div style={{ paddingTop: "64px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Video Section */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {isTeacher ? (
          <video
            ref={localStreamRef}
            autoPlay
            muted
            controls
            style={{ width: "80vw", maxWidth: "800px", borderRadius: "12px", background: "#000" }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            controls
            style={{ width: "80vw", maxWidth: "800px", borderRadius: "12px", background: "#000" }}
          />
        )}
      </div>

      {/* Monitor Section */}
      <div style={{ marginTop: "32px", width: "80vw", maxWidth: "800px" }}>
        <h2>Emotion Monitoring</h2>
        {isTeacher ? (
          <div style={{ background: "#222", color: "#fff", borderRadius: "8px", padding: "12px", minHeight: "60px" }}>
            {messages.length === 0
              ? <span>No emotion data yet.</span>
              : messages.map((msg, idx) => <div key={idx}>{msg}</div>)
            }
          </div>
        ) : (
          <div style={{ background: "#222", color: "#fff", borderRadius: "8px", padding: "12px", minHeight: "60px" }}>
            {confirmedEmotion ? `Detected Emotion: ${confirmedEmotion}` : "Detecting..."}
          </div>
        )}
      </div>

      {/* Stream control buttons */}
      <div style={{ margin: "24px 0" }}>
        {isTeacher ? (
          <button
            onClick={handleStopStream}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-bold"
          >
            Stop Stream ;
          </button>
        ) : (
          <button
            onClick={handleExitClassroom}
            className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition font-bold"
          >
            Exit Classroom
          </button>
        )}
      </div>

      {/* Attendance Download Popup */}
      {showAttendancePopup && attendanceClass && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white/90 text-black rounded-2xl shadow-2xl p-8 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Attendance Download</h2>
            <p className="mb-4">
              <span className="font-semibold">Class:</span> {attendanceClass.name}<br />
              <span className="font-semibold">Date:</span> {attendanceDate}
            </p>
            <a
              href={`http://localhost:3000/classrooms/${attendanceClass._id}/attendance`}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition mb-4"
            >
              <FaDownload /> Download CSV
            </a>
            <button
              onClick={() => {
                setShowAttendancePopup(false);
                navigate("/teacher-home");
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
