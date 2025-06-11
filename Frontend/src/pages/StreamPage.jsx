import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

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
  const [messages, setMessages] = useState([]);
  const [loadingEmotion, setLoadingEmotion] = useState(false);
  const socket = useSocket();

  // Set role and userId from localStorage
  useEffect(() => {
    setIsTeacher(localStorage.getItem("role") === "teacher");
    setUserId(localStorage.getItem("userId"));
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

  // Handler to fetch emotion data from Flask API (on button click)
  const fetchEmotion = async () => {
    setLoadingEmotion(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/monitor");
      const data = await response.json();
      if (data.emotion) {
        setMessages((prev) => [...prev, `Emotion: ${data.emotion}`]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, "Error fetching emotion data"]);
    }
    setLoadingEmotion(false);
  };

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
          <>
            <button onClick={fetchEmotion} disabled={loadingEmotion} style={{ marginBottom: "12px" }}>
              {loadingEmotion ? "Checking..." : "Check Emotion"}
            </button>
            <div style={{ background: "#222", color: "#fff", borderRadius: "8px", padding: "12px", minHeight: "60px" }}>
              {messages.length === 0
                ? <span>No emotion data yet.</span>
                : messages.map((msg, idx) => <div key={idx}>{msg}</div>)
              }
            </div>
          </>
        ) : (
          <div style={{ width: "100%" }} />
        )}
      </div>
    </div>
  );
}
