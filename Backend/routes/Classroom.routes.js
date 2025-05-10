const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const { authUser } = require('../middleware/authMiddleware');
const { authTeacher } = require('../middleware/authMiddleware');

// Teacher starts a stream
router.post('/:classroomId/start', authTeacher, classroomController.startStream);

// Student or teacher accesses the stream
router.get('/:classroomId/stream', authUser, classroomController.getStream);

// Add a student to a classroom (Teacher only)
router.post('/:classroomId/add-student', authTeacher, classroomController.addStudent);

// Join a classroom (Student joins via link)
router.post('/:classroomId/join', authUser, classroomController.joinClassroom);

module.exports = router;