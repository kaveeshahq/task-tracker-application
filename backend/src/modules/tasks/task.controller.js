const asyncHandler = require("../../utils/asyncHandler");
const taskService = require("./task.service");

const create = asyncHandler(async (req, res) => {
  const task = await taskService.create(req.user, req.body);
  res.status(201).json({
    success: true,
    message: "Task created",
    data: task,
  });
});

const list = asyncHandler(async (req, res) => {
  const result = await taskService.list(req.user, req.query);
  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
});

const getById = asyncHandler(async (req, res) => {
  const task = await taskService.getById(req.user, req.params.id);
  res.status(200).json({ success: true, data: task });
});

const update = asyncHandler(async (req, res) => {
  const task = await taskService.update(req.user, req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Task updated",
    data: task,
  });
});

const remove = asyncHandler(async (req, res) => {
  await taskService.remove(req.user, req.params.id);
  res.status(200).json({ success: true, message: "Task deleted" });
});

module.exports = { create, list, getById, update, remove };