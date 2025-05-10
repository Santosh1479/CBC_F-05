const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of student IDs
  streamUrl: { type: String, default: null }, // Optional field for streaming
});

module.exports = mongoose.model('Classroom', classroomSchema);