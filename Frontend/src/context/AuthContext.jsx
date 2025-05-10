// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the token exists in localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // If there's a token, set the user as logged in
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token); // Store the token
    setIsLoggedIn(true); // Update state to logged in
  };

  const logout = () => {
    localStorage.removeItem('token'); // Remove the token
    setIsLoggedIn(false); // Update state to logged out
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
