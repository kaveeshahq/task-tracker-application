const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { initSocket } = require("./config/socket");

// Wrap the Express app in a raw HTTP server so Socket.IO can share the port
const server = http.createServer(app);

// Initialize Socket.IO on the same server
initSocket(server);

server.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => process.exit(0));
});

module.exports = server;