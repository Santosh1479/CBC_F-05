// src/components/NavBar.js
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Use the custom hook to access auth context

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth(); // Access isLoggedIn and logout function from the context

  const handleLogout = () => {
    logout(); // Call logout to remove the token and update the state
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">NotesApp</Link>
      
      <div className="flex space-x-6 items-center">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-full"
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
    </nav>
  );
}
