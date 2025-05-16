import React from "react";
import Sidebar from "../components/Sidebar"; // adjust if needed

const dummyUser = {
  name: "Nandish",
  xp: 850,
  level: 5,
  streak: 4,
  badges: ["Consistent Learner", "Quiz Master", "Math Wizard"],
  unlockedContent: ["Advanced Algebra", "Bonus Quiz Pack"],
};

const leaderboard = [
  { name: "Aarav", xp: 1200 },
  { name: "Nandish", xp: 850 },
  { name: "Mira", xp: 740 },
  { name: "Zoya", xp: 690 },
  { name: "Ishan", xp: 660 },
];

const GamificationSystem = () => {
  const xpToNextLevel = 1000;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="ml-64 w-full p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8">
          🎮 Gamification Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* XP & Levels */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">
              🌟 XP & Levels
            </h2>
            <p className="text-lg">
              Level: <strong>{dummyUser.level}</strong>
            </p>
            <p className="text-lg mb-2">
              XP:{" "}
              <strong>
                {dummyUser.xp} / {xpToNextLevel}
              </strong>
            </p>
            <div className="w-full bg-gray-200 h-5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{ width: `${(dummyUser.xp / xpToNextLevel) * 100}%` }}
              />
            </div>
          </div>

          {/* Streak & Badges */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">
              🔥 Streak & Badges
            </h2>
            <p className="text-lg mb-2">
              Current Streak: <strong>{dummyUser.streak} days</strong>
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {dummyUser.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="bg-yellow-300 text-sm px-3 py-1 rounded-full shadow"
                >
                  🏅 {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white p-6 rounded-xl shadow-md col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">
              🏆 Weekly Leaderboard
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-gray-600 border-b">
                    <th className="py-2">Rank</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2">{idx + 1}</td>
                      <td className="py-2">{user.name}</td>
                      <td className="py-2">{user.xp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unlocked Content */}
          <div className="bg-white p-6 rounded-xl shadow-md col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">
              🔓 Unlocked Content
            </h2>
            <ul className="list-disc list-inside text-gray-700">
              {dummyUser.unlockedContent.map((item, idx) => (
                <li key={idx}>✨ {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationSystem;
