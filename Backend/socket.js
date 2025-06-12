const setupSocketIO = (io) => {
  io.on("connection", (socket) => {
    socket.on("broadcaster", ({ classroomId, userId }) => {
      socket.join(classroomId);
      socket.classroomId = classroomId;
      socket.userId = userId;
    });

    socket.on("watcher", ({ classroomId, watcherId }) => {
      socket.join(classroomId);
      socket.classroomId = classroomId;
      socket.userId = watcherId;
      // Notify teacher (broadcast to all in room except sender)
      socket.to(classroomId).emit("watcher", { watcherId });
    });

    socket.on("offer", ({ offer, classroomId, to }) => {
      // Send offer to specific watcher
      for (const [id, s] of io.of("/").sockets) {
        if (s.userId === to && s.classroomId === classroomId) {
          s.emit("offer", { offer, from: socket.userId });
        }
      }
    });

    socket.on("answer", ({ answer, classroomId, to }) => {
      // Send answer to teacher
      for (const [id, s] of io.of("/").sockets) {
        if (s.userId === to && s.classroomId === classroomId) {
          s.emit("answer", { answer, from: socket.userId });
        }
      }
    });

    socket.on("ice-candidate", ({ candidate, classroomId, userId }) => {
      // Relay ICE to everyone else in the room
      socket.to(classroomId).emit("ice-candidate", { candidate, from: userId });
    });

    socket.on("student-emotion", ({ classroomId, name, emotion }) => {
      socket.to(classroomId).emit("student-emotion", { name, emotion });
    });
  });
};

module.exports = setupSocketIO;