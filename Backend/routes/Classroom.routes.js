const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/Classroom.controller');
const { authUser } = require('../middleware/authMiddleware'); // Import authUser middleware

// Teacher starts a stream
router.post('/:classroomId/start', classroomController.startStream);

// Student or teacher accesses the stream (with authUser middleware)
router.get('/:classroomId/stream', authUser, classroomController.getStream);

// Create a new classroom
router.post('/create', classroomController.createClassroom);

// Fetch classrooms by teacher ID
router.get('/teacher/:teacherId', classroomController.getClassroomsByTeacherId);

// Fetch classrooms by student ID
router.get('/student/:userId', classroomController.getClassroomsByStudentId);

// Add a student to a classroom
router.post('/:classroomId/add-student', classroomController.addStudent);

module.exports = router;