import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TeacherSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState("test");
  const [email, setEmail] = useState("test@teac.com");
  const [password, setPassword] = useState("testpass");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/teachers/register`, { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.teacher._id);
      localStorage.setItem("name", res.data.teacher.name);
      alert("Teacher registered successfully!");
      navigate("/teacher-home");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-50 to-orange-100">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-orange-700 mb-2">Teacher Signup</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          /> 
          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition font-semibold"
          >
            Signup
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/teacher-login")}
            className="text-orange-600 hover:underline font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}