const Classroom = require('../models/Classroom.model');

class ClassroomService {
  async createClassroom(teacherId, name) {
    try {
      const classroom = await Classroom.create({
        name,
        teacher: teacherId,
        students: [],
      });
      return classroom;
    } catch (error) {
      throw new Error('Failed to create classroom');
    }
  }

  async addStudent(classroomId, studentId) {
    try {
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        throw new Error('Classroom not found');
      }

      if (!classroom.students.includes(studentId)) {
        classroom.students.push(studentId);
        await classroom.save();
      }
      return classroom;
    } catch (error) {
      throw new Error('Failed to add student to classroom');
    }
  }

  async startStream(classroomId, teacherId, streamUrl) {
    try {
      const classroom = await Classroom.findOne({
        _id: classroomId,
        teacher: teacherId
      });

      if (!classroom) {
        throw new Error('Classroom not found or unauthorized');
      }

      classroom.streamUrl = streamUrl;
      await classroom.save();
      return classroom;
    } catch (error) {
      throw new Error('Failed to start stream');
    }
  }
}
// Find a student by email
exports.findStudentByEmail = async (email) => {
  try {
    const student = await User.findOne({ email });
    return student;
  } catch (err) {
    console.error("Error in Classroom Service - findStudentByEmail:", err);
    throw new Error("Failed to find student by email");
  }
};

// Add a student to a classroom
exports.addStudent = async (classroomId, studentId) => {
  try {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw new Error("Classroom not found");
    }

    // Check if the student is already in the classroom
    if (!classroom.students.includes(studentId)) {
      classroom.students.push(studentId);
      await classroom.save();
    }

    return classroom;
  } catch (err) {
    console.error("Error in Classroom Service - addStudent:", err);
    throw new Error("Failed to add student to classroom");
  }
};

exports.getClassroomsByStudentId = async (userId) => {
  try {
      const classrooms = await Classroom.find({ students: userId }).populate('teacher', 'name');
      return classrooms;
  } catch (err) {
      console.error("Error in Classroom Service - getClassroomsByStudentId:", err);
      throw new Error("Failed to fetch classrooms");
  }
};