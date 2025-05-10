import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TeacherHome() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const [classrooms, setClassrooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ name: "", subject: "" });

  // Fetch created classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClassrooms(res.data);
      } catch (err) {
        console.error("Error fetching classrooms:", err);
      }
    };

    fetchClassrooms();
  }, []);

  // Handle form submission to create a new classroom
  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/classrooms`,
        newClassroom,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setClassrooms([...classrooms, res.data]); // Add the new classroom to the list
      setNewClassroom({ name: "", subject: "" }); // Reset the form
      setShowForm(false); // Close the form
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
    alert("Logged out successfully!");
    navigate("/teacher-login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {name}!</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Section: Create Classroom */}
        <div className="w-1/4 bg-gray-100 flex flex-col items-center justify-center p-4">
          {!showForm ? (
            <div
              className="w-24 h-24 bg-white shadow-lg rounded-full flex items-center justify-center text-4xl font-bold text-green-600 cursor-pointer hover:bg-green-100"
              onClick={() => setShowForm(true)}
            >
              +
            </div>
          ) : (
            <form
              onSubmit={handleCreateClassroom}
              className="bg-white shadow-lg rounded-lg p-4 w-full"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Create Classroom
              </h3>
              <input
                type="text"
                placeholder="Classroom Name"
                value={newClassroom.name}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                required
              />
              <input
                type="text"
                placeholder="Subject"
                value={newClassroom.subject}
                onChange={(e) =>
                  setNewClassroom({ ...newClassroom, subject: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                required
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Section: Display Created Classrooms */}
        <div className="w-3/4 bg-white p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Your Created Classrooms:
          </h2>

          {classrooms.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {classrooms.map((classroom) => (
                <div
                  key={classroom._id}
                  className="p-4 bg-gray-100 shadow-md rounded-lg"
                >
                  <h3 className="text-lg font-bold text-gray-800">
                    {classroom.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Subject: {classroom.subject}
                  </p>
                  <p className="text-sm text-gray-600">
                    Students: {classroom.students?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No classrooms created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}