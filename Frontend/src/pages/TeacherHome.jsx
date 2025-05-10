// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export default function TeacherHome() {
//   const navigate = useNavigate();
//   const name = localStorage.getItem("name");
//   const teacherId = localStorage.getItem("id");
//   const [classrooms, setClassrooms] = useState([]);
//   const [selectedClassroom, setSelectedClassroom] = useState(null);
//   const [streamTitle, setStreamTitle] = useState("");
//   const [streamLink, setStreamLink] = useState("");
//   const [showForm, setShowForm] = useState(false); // Define showForm state
//   const [newClassroom, setNewClassroom] = useState({ name: "", subject: "" }); // Define newClassroom state

//   // Fetch classrooms created by the teacher
//   useEffect(() => {
//     const fetchClassrooms = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await axios.get(
//           `${import.meta.env.VITE_BASE_URL}/classrooms?teacherId=${teacherId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setClassrooms(res.data);
//       } catch (err) {
//         console.error("Error fetching classrooms:", err);
//       }
//       setClassrooms([
//         {
//           _id: "dummy1",
//           name: "Math 101",
//           subject: "Mathematics",
//           teacher: teacherId,
//           students: [],
//           streamUrl: null,
//         },
//         {
//           _id: "dummy2",
//           name: "Physics 201",
//           subject: "Physics",
//           teacher: teacherId,
//           students: [],
//           streamUrl: null,
//         },
//       ]);
//     };

//     fetchClassrooms();
//   }, [teacherId]);

//   const handleCreateClassroom = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.post(
//         `${import.meta.env.VITE_BASE_URL}/classrooms`,
//         newClassroom,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setClassrooms([...classrooms, res.data]); // Add the new classroom to the list
//       setNewClassroom({ name: "", subject: "" }); // Reset the form
//       setShowForm(false); // Close the form
//       alert("Classroom created successfully!");
//     } catch (err) {
//       console.error("Error creating classroom:", err);
//       alert(err.response?.data?.message || "Failed to create classroom");
//     }
//   };

//   // Handle logout
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("id");
//     localStorage.removeItem("name");
//     alert("Logged out successfully!");
//     navigate("/teacher-login");
//   };

//   // Generate Stream Link
//   const handleGenerateLink = () => {
//     if (!streamTitle) {
//       alert("Please enter a stream title.");
//       return;
//     }
//     const generatedLink = `${window.location.origin}/stream/${
//       selectedClassroom._id
//     }?title=${encodeURIComponent(streamTitle)}`;
//     setStreamLink(generatedLink);
//   };

//   // Handle starting the stream
//   const handleStartStream = () => {
//     if (!streamTitle || !streamLink) {
//       alert(
//         "Please complete all fields and generate the link before starting the stream."
//       );
//       return;
//     }

//     // Redirect to the stream page
//     navigate(`/stream/${selectedClassroom._id}`, { state: { streamTitle } });
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Header Section */}
//       <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Welcome, {name}!</h1>
//         <button
//           onClick={() => {
//             localStorage.clear();
//             navigate("/teacher-login");
//           }}
//           className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
//         >
//           Logout
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="flex flex-col flex-1">
//         {/* Left Section: Create Classroom */}
//         <div className="w-1/4 bg-gray-100 flex flex-col items-center justify-center p-4">
//           {!showForm ? (
//             <div
//               className="w-24 h-24 bg-white shadow-lg rounded-full flex items-center justify-center text-4xl font-bold text-green-600 cursor-pointer hover:bg-green-100"
//               onClick={() => setShowForm(true)}
//             >
//               +
//             </div>
//           ) : (
//             <form
//               onSubmit={handleCreateClassroom}
//               className="bg-white shadow-lg rounded-lg p-4 w-full"
//             >
//               <h3 className="text-lg font-bold text-gray-800 mb-2">
//                 Create Classroom
//               </h3>
//               <input
//                 type="text"
//                 placeholder="Classroom Name"
//                 value={newClassroom.name}
//                 onChange={(e) =>
//                   setNewClassroom({ ...newClassroom, name: e.target.value })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
//                 required
//               />
//               <input
//                 type="text"
//                 placeholder="Subject"
//                 value={newClassroom.subject}
//                 onChange={(e) =>
//                   setNewClassroom({ ...newClassroom, subject: e.target.value })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
//                 required
//               />
//               <div className="flex justify-between">
//                 <button
//                   type="submit"
//                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
//                 >
//                   Create
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>

//         {/* Bottom Section: Display Created Classrooms */}
//         <div className="flex-1 bg-white p-8">
//           <h2 className="text-xl font-semibold text-gray-700 mb-6">
//             Your Created Classrooms:
//           </h2>

//           {classrooms.length > 0 ? (
//             <div className="grid grid-cols-3 gap-4">
//               {classrooms.map((classroom) => (
//                 <div
//                   key={classroom._id}
//                   className="p-4 bg-gray-100 shadow-md rounded-lg cursor-pointer hover:bg-gray-200"
//                   onClick={() => {
//                     setSelectedClassroom(classroom);
//                     setStreamTitle("");
//                     setStreamLink("");
//                   }}
//                 >
//                   <h3 className="text-lg font-bold text-gray-800">
//                     {classroom.name}
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     Subject: {classroom.subject}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Students: {classroom.students?.length || 0}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-600">No classrooms created yet.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TeacherHome() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const teacherId = localStorage.getItem("id");
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamLink, setStreamLink] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newClassroom, setNewClassroom] = useState({
    name: "",
    subject: "",
    teacher: "",
  });

  // Fetch classrooms created by the teacher
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const Id = localStorage.getItem("id");
        setNewClassroom({ ...newClassroom, teacher: Id });
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/classrooms/teacher/${teacherId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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
      const token = localStorage.getItem("token");
      const teacherId = localStorage.getItem("id"); // Get teacher ID from localStorage
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/classrooms/create`,
        {
          ...newClassroom,
          teacherId, // Explicitly include teacher ID
          students: [], // Optional: Add student IDs here if needed
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Optional: Include token if needed
        }
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
    if (!streamTitle || !streamLink) {
      alert(
        "Please complete all fields and generate the link before starting the stream."
      );
      return;
    }
    navigate(`/stream/${selectedClassroom._id}`, { state: { streamTitle } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {name}!</h1>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/teacher-login");
          }}
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
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
                  className="p-4 bg-gray-100 rounded-lg shadow-md cursor-pointer"
                  onClick={() => {
                    setSelectedClassroom(classroom);
                    setStreamTitle("");
                    setStreamLink("");
                  }}
                >
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
    </div>
  );
}
