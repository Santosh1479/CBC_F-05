const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const classroomRoutes = require("./routes/Classroom.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/classrooms", classroomRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;