import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
const socket = io(`${import.meta.env.VITE_BASE_URL}`);

export default function TeacherHome() {
  const name = localStorage.getItem("name");
  const teacherId = localStorage.getItem("id");
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [streamLink, setStreamLink] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ name: "", subject: "" });

  // Fetch classrooms created by the teacher
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/classrooms/teacher/${teacherId}`
        );
        setClassrooms(res.data);
      } catch (err) {
        console.error("Error fetching classrooms:", err);
      }
    };

    fetchClassrooms();
  }, [teacherId]);


  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/classrooms/create`,
        { ...newClassroom, teacherId }
      );
      setClassrooms([...classrooms, res.data]);
      setNewClassroom({ name: "", subject: "" });
      setShowForm(false);
      alert("Classroom created successfully!");
    } catch (err) {
      console.error("Error creating classroom:", err);
      alert(err.response?.data?.message || "Failed to create classroom");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    alert("Logged out successfully!");
    navigate("/teacher-login");
  };

  const handleGenerateLink = () => {
    if (!streamTitle) {
      alert("Please enter a stream title.");
      return;
    }
    const generatedLink = `${window.location.origin}/stream/${
      selectedClassroom._id
    }?title=${encodeURIComponent(streamTitle)}`;
    setStreamLink(generatedLink);
  };

  const handleStartStream = () => {
    if (!streamTitle) {
      alert("Please enter a stream title.");
      return;
    }
    navigate(`/stream/${selectedClassroom._id}`, { state: { streamTitle } });
    socket.emit("startStream", selectedClassroom._id); // Notify students
  };

  const handleStopStream = () => {
    socket.emit("stopStream", selectedClassroom._id); // Notify students
  };

  const handleAddStudent = async () => {
    if (!studentEmail) {
      alert("Please enter a valid email.");
      return;
    }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/classrooms/${
          selectedClassroom._id
        }/add-student`,
        { email: studentEmail }
      );
      alert("Student added successfully!");
      setShowAddStudentModal(false);
      setStudentEmail("");
    } catch (err) {
      console.error("Error adding student:", err);
      alert(err.response?.data?.message || "Failed to add student");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-50 to-orange-100">
      <h1 className="text-4xl font-bold text-orange-700">
        Welcome, {name}! This is your Teacher Dashboard.
      </h1>
    </div>
  );
}