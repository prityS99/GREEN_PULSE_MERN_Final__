const { Server } = require("socket.io");
const registerCleaningSocket = require("./cleaning.socket");
const registerCampaignSocket = require("./campaign.socket");

let io;

const initSocket = (server) => {
  io = new Server(server, {
  cors: {
  origin: "http://localhost:3000",
  credentials: true,
}
  });

  io.on("connection", (socket) => {
    console.log(`⚡ New WebSocket connection linked: ${socket.id}`);

  
    socket.on("join_room", (userId) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`👤 User ${userId} joined private room`);
      }
    });

    // 🌿 REGISTER MODULES HERE
    registerCleaningSocket(io, socket);
    registerCampaignSocket(io, socket);

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io engine has not been initialized yet!");
  }
  return io;
};

module.exports = { initSocket, getIO };