const { getIo } = require("../../config/socket");


const emitTaskEvent = (event, task) => {
  const io = getIo();
  if (!io) return;
  io.to(`user:${task.ownerId}`).to("admins").emit(event, task);
};

module.exports = { emitTaskEvent };