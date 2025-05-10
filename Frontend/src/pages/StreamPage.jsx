import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

export default function StreamPage() {
  const location = useLocation(); // Get state passed from TeacherHome
  const navigate = useNavigate(); // For navigation
  const { classroomId } = useParams(); // Get classroom ID from URL
  const { streamTitle } = location.state || {}; // Get stream title from state
  const localStreamRef = useRef(null); // For teacher's local stream
  const videoRef = useRef(null); // For student's video stream
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // State to track pause/resume
  const [error, setError] = useState(null); // State to handle errors

  // Determine if the user is a teacher
  useEffect(() => {
    const role = localStorage.getItem("role"); // Assuming role is stored in localStorage
    setIsTeacher(role === "teacher");
  }, []);

  // Initialize WebRTC and capture video for teachers
  useEffect(() => {
    const initializeStream = async () => {
      console.log("Initializing stream...");
      if (isTeacher) {
        console.log("User is a teacher. Accessing media devices...");
        try {
          const localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          console.log("Media devices accessed successfully.");
          localStreamRef.current.srcObject = localStream; // Set the teacher's local stream
        } catch (err) {
          console.error("Error accessing media devices:", err);
          setError(
            "Unable to access your camera or microphone. Please check your browser settings."
          );
        }
      } else {
        console.log("User is a student. Waiting for the stream...");
      }
    };

    initializeStream();

    return () => {
      // Cleanup: Stop all tracks when the component unmounts
      const stream = localStreamRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        localStreamRef.current.srcObject = null;
      }
    };
  }, [isTeacher]);

  // Listen for stream status updates
  useEffect(() => {
    socket.on("streamStatus", ({ classroomId: id, isLive }) => {
      if (id === classroomId) {
        setIsLive(isLive);
        if (!isTeacher && isLive) {
          fetchStream(); // Fetch the stream when it goes live
        }
      }
    });

    return () => {
      socket.off("streamStatus"); // Clean up the listener
    };
  }, [classroomId, isTeacher]);

  // Fetch the stream for students
  const fetchStream = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/classrooms/${classroomId}/stream`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch the stream");
      }
      const mediaStream = await res.body.getReader().read(); 
      console.log('media',mediaStream);
      const blob = new Blob([mediaStream], { type: "video/webm" });
      const streamUrl = URL.createObjectURL(blob);
      videoRef.current.srcObject = streamUrl; // Set the student's video stream
      console.log("Stream fetched successfully.");
    } catch (err) {
      console.error("Error fetching stream:", err);
      setError("Failed to fetch the stream. Please try again later.");
    }
  };

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
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">{streamTitle || "Live Stream"}</h1>
      </div>

      {/* Video Section */}
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : isTeacher ? (
          <video
            ref={localStreamRef}
            autoPlay
            muted
            className="w-3/4 h-3/4 bg-black rounded-lg"
          ></video>
        ) : isLive ? (
          <video
            ref={videoRef}
            autoPlay
            controls
            className="w-3/4 h-3/4 bg-black rounded-lg"
          ></video>
        ) : (
          <p className="text-gray-600">The stream is not live yet.</p>
        )}
      </div>

      {/* Teacher Controls */}
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