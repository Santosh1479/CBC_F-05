const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  streamUrl: { type: String, default: null } // RTMP/HLS URL
});

module.exports = mongoose.model('Classroom', classroomSchema);
