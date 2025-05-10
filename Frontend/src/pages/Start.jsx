// src/pages/Start.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Start = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-300">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to Smart Learning</h1>
      <button
        onClick={handleStart}
        className="px-6 py-3 text-white bg-blue-600 rounded-xl shadow hover:bg-blue-700 transition-all"
      >
        Get Started
      </button>
    </div>
  );
};

export default Start;
