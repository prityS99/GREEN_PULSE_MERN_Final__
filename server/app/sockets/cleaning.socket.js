module.exports = (io, socket) => {

  // ---- NEW CLEANING REQUEST DISPATCH ---- //
  socket.on("cleaning:new", (data) => {
    io.emit("admin:cleaning:new", {
      message: "New cleaning request received",
      data,
    });
  });

  // ---- ADMIN APPROVES REQUEST ---- //
  socket.on("cleaning:approve", (data) => {
    // 1. Broadcast the backend standard event structure
    io.emit("cleaning:approved", {
      requestId: data.requestId,
    });

    // 2. ✅ FIX: Broadcast full data context required by your Cleaning Company dashboard
    // This allows the card to appear instantly on their pipeline layout grid
    io.emit("new_cleaning_request", data.request || data);

    // 3. Notify the specific NGO creator in their private channel room
    if (data.userId) {
      io.to(data.userId.toString()).emit("notification", {
        message: "Your cleaning request was approved by the administrator",
        type: "success",
        requestId: data.requestId
      });
    }
  });

  // ---- ADMIN REJECTS REQUEST ---- //
  socket.on("cleaning:reject", (data) => {
    // Notify the specific NGO creator in their private channel room
    if (data.userId) {
      io.to(data.userId.toString()).emit("notification", {
        message: "Your cleaning request was rejected by the administrator",
        type: "error",
        requestId: data.requestId
      });
    }
  });

};