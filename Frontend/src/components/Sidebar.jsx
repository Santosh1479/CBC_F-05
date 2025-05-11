import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UserCircleIcon,
  BookOpenIcon,
  EyeIcon,
  ChartBarIcon,
  SparklesIcon,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { path: '/profile', label: 'Profile', icon: <UserCircleIcon className="w-5 h-5" /> },
    { path: '/learning', label: 'Personalized Learning', icon: <BookOpenIcon className="w-5 h-5" /> },
    { path: '/student/focus', label: 'Focus Detection', icon: <EyeIcon className="w-5 h-5" /> },
    { path: '/student/analytics', label: 'Analytics', icon: <ChartBarIcon className="w-5 h-5" /> },
    { path: '/gamification', label: 'Gamification', icon: <SparklesIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-indigo-700 to-purple-800 text-white fixed top-0 left-0 shadow-xl">
      <div className="p-6 text-2xl font-bold text-white border-b border-white/20">SmartEdu</div>
      <ul className="mt-6 space-y-2 px-4">
        {links.map(({ path, label, icon }) => (
          <li key={path}>
            <Link
              to={path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition duration-300 hover:bg-white/10 ${
                location.pathname === path ? 'bg-white/20 font-semibold' : ''
              }`}
            >
              {icon}
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;