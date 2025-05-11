import React from 'react';
import Sidebar from '../components/Sidebar'; // Update the path if needed

// Utility functions
const analyzeWeakTopics = (performance) => {
  return Object.entries(performance)
    .filter(([_, score]) => score < 70)
    .map(([topic]) => topic);
};

const generateStudyPlan = (weakTopics) => {
  return weakTopics.map((topic, index) => ({
    day: `Day ${index + 1}`,
    topic,
    goal: `Review ${topic} basics and solve 5 practice problems`,
  }));
};

const getLearningTips = (style) => {
  const tips = {
    visual: ['Use diagrams and mind maps', 'Watch YouTube explainer videos'],
    auditory: ['Listen to podcasts', 'Record and replay class notes'],
    kinesthetic: ['Use flashcards', 'Teach someone else what you learned'],
  };
  return tips[style] || [];
};

// Main component
export default function PersonalizedLearning() {
  // Sample user performance and learning style
  const performance = {
    Algebra: 65,
    Geometry: 82,
    Trigonometry: 58,
    Calculus: 91,
    Probability: 66,
  };

  const learningStyle = 'visual';

  const weakTopics = analyzeWeakTopics(performance);
  const studyPlan = generateStudyPlan(weakTopics);
  const tips = getLearningTips(learningStyle);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <Sidebar />

      <main className="ml-64 w-full p-8 mt-8"> {/* Added top margin here */}
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
            🎯 Personalized Learning Dashboard
          </h2>

          {/* Weak Topics */}
          <section className="mb-10">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">🚩 Weak Topics Detected</h3>
            <ul className="list-disc list-inside text-gray-700 text-lg">
              {weakTopics.map((topic) => (
                <li key={topic}>❗ {topic}</li>
              ))}
            </ul>
          </section>

          {/* Study Plan */}
          <section className="mb-10">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">📅 Study Plan (Next 7 Days)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {studyPlan.map((item) => (
                <div key={item.day} className="bg-indigo-100 p-5 rounded-xl shadow-sm border border-indigo-200">
                  <h4 className="font-bold text-indigo-700 text-lg mb-1">{item.day}</h4>
                  <p className="text-gray-800">📘 Topic: <strong>{item.topic}</strong></p>
                  <p className="text-sm text-gray-600 mt-1">{item.goal}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Learning Style Tips */}
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              🧠 Tips for Your Learning Style: <span className="capitalize">{learningStyle}</span>
            </h3>
            <ul className="list-disc list-inside text-gray-700 text-lg">
              {tips.map((tip, index) => (
                <li key={index}>💡 {tip}</li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}