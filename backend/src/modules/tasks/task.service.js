const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const { emitTaskEvent } = require("./task.events");

const isAdmin = (user) => user.role === "ADMIN";

const create = async (user, data) => {
  const task = await prisma.task.create({
    data: { ...data, ownerId: user.id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  emitTaskEvent("task:created", task);
  return task;
};

const getById = async (user, id) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!isAdmin(user) && task.ownerId !== user.id) {
    throw new ApiError(403, "You do not have permission to access this task");
  }

  return task;
};

const list = async (user, { page, limit, status, ownerId }) => {
  const where = {};

  if (isAdmin(user)) {
    if (ownerId) where.ownerId = ownerId;
  } else {
    where.ownerId = user.id;
  }

  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { id: true, name: true, email: true } } },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const update = async (user, id, data) => {
  await getById(user, id);
  const task = await prisma.task.update({
    where: { id },
    data,
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  emitTaskEvent("task:updated", task);
  return task;
};

const remove = async (user, id) => {
  const task = await getById(user, id);
  await prisma.task.delete({ where: { id } });
  emitTaskEvent("task:deleted", task);
};

module.exports = { create, getById, list, update, remove };