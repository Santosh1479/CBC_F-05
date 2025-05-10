const setupSocketIO = (io) => {
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);
  
      // Listen for stream start
      socket.on("startStream", (classroomId) => {
        console.log(`Stream started for classroom: ${classroomId}`);
        io.emit("streamStatus", { classroomId, isLive: true }); // Notify all clients
      });
  
      // Listen for stream stop
      socket.on("stopStream", (classroomId) => {
        console.log(`Stream stopped for classroom: ${classroomId}`);
        io.emit("streamStatus", { classroomId, isLive: false }); // Notify all clients
      });
  
      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });
    });
  };
  
  module.exports = setupSocketIO;