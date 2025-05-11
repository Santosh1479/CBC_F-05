import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

export default function ProfilePage() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(null);

  useEffect(() => {
    const fetchStreakData = async () => {
      const data = {
        currentStreak: 5,
        bestStreak: 12,
        lastMissed: '2025-05-08',
        streakHistory: [
          { date: '2025-05-05', attended: true },
          { date: '2025-05-06', attended: true },
          { date: '2025-05-07', attended: true },
          { date: '2025-05-08', attended: false },
          { date: '2025-05-09', attended: true },
          { date: '2025-05-10', attended: true },
          { date: '2025-05-11', attended: true },
        ],
      };
      setStreakData(data);
    };

    fetchStreakData();
  }, []);

  if (!user || !streakData)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-lg text-gray-500 animate-pulse">Loading profile...</div>
      </div>
    );

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-2xl rounded-3xl border border-gray-200 mt-10">
          <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 space-y-4 sm:space-y-0">
            <img
              src={user.profileImage || '/default-profile-icon.png'}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-indigo-500 shadow-md"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-extrabold text-gray-800">{user.name}</h2>
              <p className="text-gray-600 text-md mt-1">{user.email}</p>
              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <p><span className="font-medium">Role:</span> {user.role}</p>
                <p><span className="font-medium">Joined:</span> {user.joinedOn}</p>
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-300" />

          <div>
            <h3 className="text-2xl font-bold mb-6 text-gray-700 flex items-center gap-2">
              <span className="text-amber-500">🔥</span>Streak Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-gradient-to-r from-green-100 to-green-50 p-6 rounded-xl shadow">
                <p className="text-4xl font-bold text-green-700">{streakData.currentStreak}</p>
                <p className="text-md text-gray-600 mt-2">Current Streak</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-6 rounded-xl shadow">
                <p className="text-4xl font-bold text-yellow-700">{streakData.bestStreak}</p>
                <p className="text-md text-gray-600 mt-2">Best Streak</p>
              </div>
              <div className="bg-gradient-to-r from-red-100 to-red-50 p-6 rounded-xl shadow">
                <p className="text-4xl font-bold text-red-700">{streakData.lastMissed}</p>
                <p className="text-md text-gray-600 mt-2">Last Missed</p>
              </div>
            </div>

            <div className="mt-10">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Recent Attendance</h4>
              <div className="flex flex-wrap gap-2">
                {streakData.streakHistory.map((entry) => (
                  <div
                    key={entry.date}
                    title={entry.date}
                    className={`w-6 h-6 rounded-full border border-gray-300 shadow-sm ${
                      entry.attended ? 'bg-green-500' : 'bg-red-400'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}