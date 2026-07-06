const app = require("./app");
const env = require("./config/env");

const server = app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => process.exit(0));
});

module.exports = server;