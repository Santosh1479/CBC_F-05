const Classroom = require('../models/Classroom');
const User = require('../models/User.model');

// Teacher starts stream
exports.startStream = async (req, res) => {
  const { classroomId } = req.params;
  const { streamUrl } = req.body;

  const classroom = await Classroom.findById(classroomId);
  if (!classroom) return res.status(404).json({ error: 'Classroom not found' });

  if (classroom.teacher.toString() !== req.user.id)
    return res.status(403).json({ error: 'Unauthorized' });

  classroom.streamUrl = streamUrl;
  await classroom.save();

  res.json({ message: 'Stream started', streamUrl });
};

// Student accesses stream
exports.getStream = async (req, res) => {
  const { classroomId } = req.params;

  const classroom = await Classroom.findById(classroomId);
  if (!classroom) return res.status(404).json({ error: 'Classroom not found' });

  const isStudent = classroom.students.some(
    studentId => studentId.toString() === req.user.id
  );

  if (!isStudent && classroom.teacher.toString() !== req.user.id)
    return res.status(403).json({ error: 'Access denied' });

  res.json({ streamUrl: classroom.streamUrl });
};
