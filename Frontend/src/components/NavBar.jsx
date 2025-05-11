import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    localStorage.clear();
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gradient-to-br from-[#1d0036] to-[#6A29FF] p-4 w-full fixed top-0 left-0 py-6 z-50">
      <div className="flex justify-between items-center max-w-screen-xl mx-auto">
        {/* Logo */}
        <Link className="text-xl font-bold text-white">
          Smart_edu
        </Link>

        {/* Desktop Navbar */}
        <div className="hidden sm:flex space-x-6 items-center">
          {isLoggedIn ? (
            <>
              <Link to="/profile">
                <img
                  src={user?.profileImage || "/default-profile-icon.png"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white hover:opacity-80 transition"
                />
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-full text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="sm:hidden">
          <button onClick={toggleMenu} className="text-white">
            Menu
          </button>
          {isOpen && (
            <div className="absolute top-16 right-4 bg-[#1d0036] text-white shadow-md p-4 w-40 rounded-lg">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="block text-white py-2 hover:text-violet-300"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full text-white mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-white py-2 hover:text-violet-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-white py-2 hover:text-violet-300"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}