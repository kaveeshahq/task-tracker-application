const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { initSocket } = require("./config/socket");

const server = http.createServer(app);

initSocket(server);

server.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => process.exit(0));
});

module.exports = server;