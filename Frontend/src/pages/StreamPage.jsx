import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

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
  const socket = useSocket();

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
          const res = await fetch("http://127.0.0.1:5000/predict-emotion", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.emotion) {
            const mapped = EMOTION_MAP[data.emotion] || "attentive";
            setEmotionHistory((prev) => {
              const newHistory = [...prev, mapped].slice(-5); // Keep last 5
              // If last 5 are the same, confirm emotion
              if (newHistory.length === 5 && newHistory.every((e) => e === newHistory[0])) {
                if (confirmedEmotion !== newHistory[0]) {
                  setConfirmedEmotion(newHistory[0]);
                  setStudentEmotion(newHistory[0]);
                  // Send to teacher if not attentive
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
    </div>
  );
}
