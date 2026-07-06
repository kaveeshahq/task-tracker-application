module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/loadEnv.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testTimeout: 15000,
};