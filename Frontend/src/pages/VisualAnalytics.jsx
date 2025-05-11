import React from 'react';
import Sidebar from '../components/Sidebar'; // Adjust path if necessary
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';

const subjectData = [
  { subject: 'Math', score: 85 },
  { subject: 'Science', score: 72 },
  { subject: 'English', score: 90 },
  { subject: 'History', score: 65 },
  { subject: 'Computer', score: 95 },
];

const weeklyProgress = [
  { week: 'Week 1', progress: 50 },
  { week: 'Week 2', progress: 60 },
  { week: 'Week 3', progress: 70 },
  { week: 'Week 4', progress: 80 },
  { week: 'Week 5', progress: 90 },
];

const quizHeatmap = [
  [80, 60, 90, 70, 85],
  [65, 75, 95, 60, 70],
  [90, 85, 60, 80, 75],
];

const getHeatColor = (score) => {
  if (score >= 85) return 'bg-green-500';
  if (score >= 70) return 'bg-yellow-400';
  return 'bg-red-400';
};

const VisualAnalytics = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />

      <div className="flex-grow p-6">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-10">
          📊 Visual Performance Analytics
        </h1>

        {/* Subject-wise Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📘 Subject-wise Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#6366F1" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📈 Weekly Improvement</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="progress" stroke="#10B981" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quiz Accuracy Heatmap */}
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🔥 Quiz Accuracy Heatmap</h2>
          <div className="grid grid-cols-5 gap-4 justify-items-center">
            {quizHeatmap.flat().map((score, idx) => (
              <div
                key={idx}
                className={`w-16 h-16 rounded-xl text-white font-bold text-sm flex items-center justify-center shadow-md transform transition duration-200 hover:scale-105 ${getHeatColor(score)}`}
              >
                {score}%
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualAnalytics;