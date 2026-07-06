const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const env = require("./env");

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.clientOrigin, credentials: true },
  });

  // Authenticate every socket connection using the JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const payload = verifyToken(token);
      socket.user = { id: payload.userId, role: payload.role };
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Each user joins a private room keyed by their own id
    socket.join(`user:${socket.user.id}`);

    // Admins additionally join a shared room to receive all task events
    if (socket.user.role === "ADMIN") {
      socket.join("admins");
    }

    socket.on("disconnect", () => {
      // Rooms are cleaned up automatically on disconnect
    });
  });

  return io;
};

const getIo = () => io || null;

module.exports = { initSocket, getIo };