import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

export default function TeacherHome() {
  const navigate = useNavigate();
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
    navigate(`/classroom/${selectedClassroom._id}`, { state: { streamTitle } }); // Ensure this matches the route in App.jsx
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
        `${import.meta.env.VITE_BASE_URL}/classrooms/${selectedClassroom._id}/add-student`,
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
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {name}!</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Create Classroom Section */}
        <div className="p-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Create Classroom
            </button>
          ) : (
            <form
              onSubmit={handleCreateClassroom}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <h3 className="text-lg font-bold mb-2">Create Classroom</h3>
              <input
                type="text"
                placeholder="Classroom Name"
                value={newClassroom.name}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg mb-2"
                required
              />
              <input
                type="text"
                placeholder="Subject"
                value={newClassroom.subject}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, subject: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg mb-2"
                required
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Display Classrooms Section */}
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Your Created Classrooms</h2>
          {classrooms.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {classrooms.map((classroom) => (
                <div
                  key={classroom._id}
                  className="p-4 bg-gray-100 rounded-lg shadow-md relative"
                  onClick={() => {
                    setSelectedClassroom(classroom);
                    setShowStreamModal(true); }
                  }
                >
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => {
                        setSelectedClassroom(classroom);
                        setShowAddStudentModal(true); // Open Add Student Modal
                      }}
                      className="bg-green-600 text-white px-2 py-1 rounded-full hover:bg-green-700 transition"
                      title="Add Student"
                    >
                      +
                    </button>
                  </div>
                  <h3 className="text-lg font-bold">{classroom.name}</h3>
                  <p className="text-sm">Subject: {classroom.subject}</p>
                  <p className="text-sm">
                    Students: {classroom.students?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No classrooms created yet.</p>
          )}
        </div>
      </div>

      {/* Stream Modal */}
      {showStreamModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowStreamModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg z-60"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Start Stream</h3>
            <input
              type="text"
              placeholder="Enter Stream Title"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
              required
            />
            <div className="flex justify-between">
              <button
                onClick={handleGenerateLink}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Generate Link
              </button>
              <button
                onClick={handleStartStream}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Start Stream
              </button>
              <button
                onClick={() => setShowStreamModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
            {streamLink && (
              <p className="mt-4 text-sm text-gray-600">
                Stream Link: <a href={streamLink}>{streamLink}</a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Add Student</h3>
            <input
              type="email"
              placeholder="Enter student email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
              required
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleAddStudent}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}