const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./DB/db");
const setupSocketIO = require("./socket");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const express = require("express");

dotenv.config();
connectDB();

const server = http.createServer(app); // 

const io = new Server(server, {
    cors: {
        origin: "*", // Allow requests from the frontend
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
});

// Setup Socket.IO
setupSocketIO(io);

const PORT = process.env.PORT || 3000; // Ensure the backend runs on port 5000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});