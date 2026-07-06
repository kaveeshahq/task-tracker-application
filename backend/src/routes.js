const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const taskRoutes = require("./modules/tasks/task.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);

module.exports = router;