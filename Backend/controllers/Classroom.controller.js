const classroomService = require('../services/Classroom.services');
const Classroom = require('../models/Classroom.model');

exports.createClassroom = async (req, res) => {
  const { name, subject, students, teacherId } = req.body;

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
    const classroom = await Classroom.findById(classroomId);
    if (!classroom || !classroom.streamUrl) {
      return res.status(404).json({ message: "Stream not found or not live" });
    }

    res.status(200).json({ streamUrl: classroom.streamUrl });
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
    res.status(200).json({ message: "Stream started successfully", classroom });
  } catch (err) {
    console.error("Error starting stream:", err);
    res.status(500).json({ message: "Failed to start stream" });
  }
};

exports.getClassroomsByStudentId = async (req, res) => {
  const { userId } = req.params;

  try {
    const classrooms = await classroomService.getClassroomsByStudentId(userId);
    const classroomsWithLiveStatus = classrooms.map((classroom) => ({
      _id: classroom._id,
      name: classroom.name,
      subject: classroom.subject,
      teacher: classroom.teacher,
      isLive: !!classroom.streamUrl,
    }));
    res.status(200).json(classroomsWithLiveStatus);
  } catch (err) {
    console.error("Error fetching classrooms for student:", err);
    res.status(500).json({ message: "Failed to fetch classrooms" });
  }
};

exports.addStudent = async (req, res) => {
  const { classroomId } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Student email is required" });
  }

  try {
    const student = await classroomService.findStudentByEmail(email);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const classroom = await classroomService.addStudent(classroomId, student._id);
    res.status(200).json({ message: "Student added successfully", classroom });
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).json({ message: "Failed to add student to classroom" });
  }
};