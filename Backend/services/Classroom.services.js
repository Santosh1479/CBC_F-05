const Classroom = require('../models/Classroom');

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

  async getStream(classroomId, userId) {
    try {
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        throw new Error('Classroom not found');
      }

      const isStudent = classroom.students.some(
        studentId => studentId.toString() === userId
      );
      const isTeacher = classroom.teacher.toString() === userId;

      if (!isStudent && !isTeacher) {
        throw new Error('Unauthorized access to stream');
      }

      return {
        streamUrl: classroom.streamUrl,
        isTeacher: isTeacher
      };
    } catch (error) {
      throw new Error('Failed to get stream');
    }
  }
}

module.exports = new ClassroomService();