import React from "react";

export default function TeacherHome() {
  const name = localStorage.getItem("name");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-50 to-orange-100">
      <h1 className="text-4xl font-bold text-orange-700">
        Welcome, {name}! This is your Teacher Dashboard.
      </h1>
    </div>
  );
}