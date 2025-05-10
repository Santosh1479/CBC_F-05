import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function StreamPage() {
  const location = useLocation(); // Get state passed from TeacherHome
  const navigate = useNavigate(); // For navigation
  const { streamTitle } = location.state || {}; // Get stream title from state
  const localStreamRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false); // State to track pause/resume

  // Initialize WebRTC and capture video
  useEffect(() => {
    const initializeStream = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current.srcObject = localStream;
      } catch (err) {
        console.error("Error accessing media devices:", err);
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
  }, []);

  // Pause or Resume the stream
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
      // Stop all tracks and wait for them to stop
      await Promise.all(
        stream.getTracks().map((track) => {
          track.stop();
          return new Promise((resolve) => {
            track.onended = resolve; // Wait for the track to end
          });
        })
      );
      localStreamRef.current.srcObject = null;
    }
    navigate("/teacher-home"); // Redirect to Teacher Home
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">{streamTitle}</h1>
      </div>

      {/* Video Section */}
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <video
          ref={localStreamRef}
          autoPlay
          muted
          className="w-3/4 h-3/4 bg-black rounded-lg"
        ></video>
      </div>

      {/* Pause/Resume and Navigate Button */}
      <div className="p-4 flex justify-between">
        <button
          onClick={toggleStream}
          className={`${
            isPaused ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
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
    </div>
  );
}