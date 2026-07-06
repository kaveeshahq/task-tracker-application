const { getIo } = require("../../config/socket");

// Emit a task event to the owner's private room AND the admins room.
// No-op if sockets aren't initialized (e.g. in the test environment).
const emitTaskEvent = (event, task) => {
  const io = getIo();
  if (!io) return;
  io.to(`user:${task.ownerId}`).to("admins").emit(event, task);
};

module.exports = { emitTaskEvent };