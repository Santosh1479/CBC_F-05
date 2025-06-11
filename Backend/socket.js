const setupSocketIO = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("broadcaster", (classroomId) => {
      socket.join(classroomId);
      socket.to(classroomId).emit("broadcaster");
    });

    socket.on("watcher", (classroomId) => {
      socket.join(classroomId);
      socket.to(classroomId).emit("watcher");
    });

    socket.on("offer", ({ offer, classroomId }) => {
      socket.to(classroomId).emit("offer", { offer });
    });

    socket.on("answer", ({ answer, classroomId }) => {
      socket.to(classroomId).emit("answer", { answer });
    });

    socket.on("ice-candidate", ({ candidate, classroomId }) => {
      socket.to(classroomId).emit("ice-candidate", { candidate });
    });

    socket.on("startStream", (classroomId) => {
      io.to(classroomId).emit("streamStatus", { classroomId, isLive: true });
    });

    socket.on("stopStream", (classroomId) => {
      io.to(classroomId).emit("streamStatus", { classroomId, isLive: false });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};

module.exports = setupSocketIO;