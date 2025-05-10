const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:classroomId/start', protect, classroomController.startStream);
router.get('/:classroomId/stream', protect, classroomController.getStream);

module.exports = router;
