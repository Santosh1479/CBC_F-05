const Classroom = require('../models/Classroom.model');

exports.createClassroom = async ({ name, subject, teacherId }) => {
    try {
        const classroom = await Classroom.create({
            name,
            subject,
            teacher: teacherId,
            students: [],
        });
        return classroom;
    } catch (err) {
        console.error("Error in Classroom Service - createClassroom:", err);
        throw new Error("Failed to create classroom");
    }
};

exports.getClassroomsByTeacherId = async (teacherId) => {
    try {
        const classrooms = await Classroom.find({ teacher: teacherId });
        return classrooms;
    } catch (err) {
        console.error("Error in Classroom Service - getClassroomsByTeacherId:", err);
        throw new Error("Failed to fetch classrooms");
    }
};

exports.getStream = async (classroomId) => {
    try {
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            throw new Error("Classroom not found");
        }
        return classroom.streamUrl || "No active stream";
    } catch (err) {
        console.error("Error in Classroom Service - getStream:", err);
        throw new Error("Failed to fetch stream");
    }
};

exports.startStream = async (classroomId, streamUrl) => {
    try {
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            throw new Error("Classroom not found");
        }
        classroom.streamUrl = streamUrl;
        await classroom.save();
        return classroom;
    } catch (err) {
        console.error("Error in Classroom Service - startStream:", err);
        throw new Error("Failed to start stream");
    }
};

exports.addStudent = async (classroomId, studentId) => {
    try {
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            throw new Error("Classroom not found");
        }
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