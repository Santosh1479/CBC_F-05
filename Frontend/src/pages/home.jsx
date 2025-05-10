import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [classLink, setClassLink] = useState(""); // State to store the class link
  const [classrooms, setClassrooms] = useState([]); // State to store the classrooms

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    alert("Logged out successfully!");
    navigate("/login");
  };

  // Handle joining a class
  const handleJoinClass = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to join a class.");
      navigate("/login");
      return;
    }

    if (!classLink) {
      alert("Please enter a valid class link.");
      return;
    }

    // Extract class ID from the link (assuming the link contains a class ID)
    const classId = classLink.split("/").pop(); // Adjust based on your link structure
    navigate(`/classroom/${classId}`);
  };

  // Fetch classrooms where the student is enrolled
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/classrooms/student/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClassrooms(res.data);
      } catch (err) {
        console.error("Error fetching classrooms:", err);
        alert("Failed to fetch classrooms.");
      }
    };

    fetchClassrooms();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Logout Button */}
      <div className="p-4 flex justify-end bg-white shadow-md">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Top Section: Join Class */}
      <div className="p-4 flex justify-center items-center bg-white shadow-md">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter Class Link"
            value={classLink}
            onChange={(e) => setClassLink(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleJoinClass}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Join Class
          </button>
        </div>
      </div>

      {/* Bottom Section: Your Classrooms */}
      <div className="flex-1 p-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Your Classrooms:</h2>
        {classrooms.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {classrooms.map((classroom) => (
              <div
                key={classroom._id}
                className="p-4 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/classroom/${classroom._id}`)}
              >
                <h3 className="text-lg font-bold text-gray-800">{classroom.name}</h3>
                <p className="text-sm text-gray-600">Subject: {classroom.subject}</p>
                <p className="text-sm text-gray-600">
                  Teacher: {classroom.teacher?.name || "Unknown"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You are not enrolled in any classrooms.</p>
        )}
      </div>
    </div>
  );
};

export default Home;