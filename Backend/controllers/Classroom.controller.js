const classroomService = require('../services/Classroom.services');

exports.createClassroom = async (req, res) => {
  const { name, subject, students, teacherId } = req.body; // Accept teacherId explicitly

  if (!name || !subject || !teacherId) {
    return res.status(400).json({ message: "Classroom name, subject, and teacher ID are required" });
  }

  try {
    const classroom = await classroomService.createClassroom({ name, subject, teacherId, students });
    res.status(201).json(classroom);
  } catch (err) {
    console.error("Error creating classroom:", err);
    res.status(500).json({ message: "Failed to create classroom" });
  }
};

exports.getClassroomsByTeacherId = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const classrooms = await classroomService.getClassroomsByTeacherId(teacherId);
    res.status(200).json(classrooms);
  } catch (err) {
    console.error("Error fetching classrooms:", err);
    res.status(500).json({ message: "Failed to fetch classrooms" });
  }
};

exports.getStream = async (req, res) => {
  const { classroomId } = req.params;

  try {
    const streamUrl = await classroomService.getStream(classroomId);
    res.status(200).json({ streamUrl });
  } catch (err) {
    console.error("Error fetching stream:", err);
    res.status(500).json({ message: "Failed to fetch stream" });
  }
};

exports.startStream = async (req, res) => {
  const { classroomId } = req.params;
  const { streamUrl } = req.body;

  try {
    const classroom = await classroomService.startStream(classroomId, streamUrl);
    res.status(200).json(classroom);
  } catch (err) {
    console.error("Error starting stream:", err);
    res.status(500).json({ message: "Failed to start stream" });
  }
};

exports.addStudent = async (req, res) => {
  const { classroomId } = req.params;
  const { studentId } = req.body;

  try {
    const classroom = await classroomService.addStudent(classroomId, studentId);
    res.status(200).json(classroom);
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).json({ message: "Failed to add student to classroom" });
  }
};

exports.getClassroomsByStudentId = async (req, res) => {
  const { userId } = req.params;

  try {
    const classrooms = await classroomService.getClassroomsByStudentId(userId);
    res.status(200).json(classrooms);
  } catch (err) {
    console.error("Error fetching classrooms for student:", err);
    res.status(500).json({ message: "Failed to fetch classrooms" });
  }
};