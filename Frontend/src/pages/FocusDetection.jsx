import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; // Adjust path if needed

const FocusDetection = () => {
  const [focusLevel, setFocusLevel] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomFocus = Math.floor(Math.random() * 70) + 30;
      setFocusLevel(randomFocus);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getColor = () => {
    if (focusLevel >= 80) return 'bg-green-500';
    if (focusLevel >= 50) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-grow flex items-center justify-center p-8">
        <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-lg text-center">
          <h2 className="text-3xl font-bold text-indigo-600 mb-6">🧠 Real-Time Focus Monitor</h2>

          <p className="text-gray-700 mb-2">Estimated Focus Level:</p>
          <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full ${getColor()}`}
              style={{ width: `${focusLevel}%`, transition: 'width 0.5s ease-in-out' }}
            ></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{focusLevel}%</p>

          {focusLevel < 50 && (
            <div className="mt-5 p-4 bg-red-100 text-red-700 border border-red-400 rounded-md text-sm">
              🚨 You seem distracted! Take a short break or refocus on your class.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusDetection;