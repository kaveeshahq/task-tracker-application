const express = require("express");
const taskController = require("./task.controller");
const validate = require("../../middleware/validate");
const authenticate = require("../../middleware/authenticate");
const {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  listTaskSchema,
} = require("./task.schema");

const router = express.Router();

// Every task route requires a valid token
router.use(authenticate);

router.post("/", validate(createTaskSchema), taskController.create);
router.get("/", validate(listTaskSchema), taskController.list);
router.get("/:id", validate(getTaskSchema), taskController.getById);
router.patch("/:id", validate(updateTaskSchema), taskController.update);
router.delete("/:id", validate(getTaskSchema), taskController.remove);

module.exports = router;