// filepath: c:\Users\Santosh\Desktop\CBC_F-05\Backend\routes\Classroom.routes.js
const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/Classroom.controller');
const { authTeacher, authUser } = require('../middleware/authMiddleware');

// Teacher starts a stream
router.post('/:classroomId/start', authTeacher, classroomController.startStream);

// Student or teacher accesses the stream
router.get('/:classroomId/stream', authUser, classroomController.getStream);

module.exports = router;