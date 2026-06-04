module.exports = (io, socket) => {

  // ---- NEW CAMPAIGN DISPATCH ---- //
  socket.on("campaign:new", (data) => {
    io.emit("admin:campaign:new", {
      message: "New campaign created and pending administrative review.",
      data,
    });
  });

  // ---- ADMIN APPROVES CAMPAIGN ---- //
  socket.on("campaign:approve", (data) => {
    // 1. Broadcast light layout update standard
    io.emit("campaign:approved", {
      campaignId: data.campaignId,
    });

    // 2. Broadcast the full campaign dataset to your Global Dashboard interface channel
    // This injects the new campaign card dynamically into the UI for everyone to see
    io.emit("new_global_campaign", data.campaign || data);

    // 3. Dispatch targeted private room alert notification back to the creator user
    if (data.userId) {
      io.to(data.userId.toString()).emit("notification", {
        message: "Congratulations! Your environmental campaign has been approved.",
        type: "success",
        campaignId: data.campaignId
      });
    }
  });

  // ---- CAMPAIGN LIKECYCLE COMPLETION ---- //
  socket.on("campaign:complete", (data) => {
    io.emit("campaign:completed", {
      campaignId: data.campaignId,
      data: data.campaign || null
    });
  });

};