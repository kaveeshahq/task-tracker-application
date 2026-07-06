const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");

const isAdmin = (user) => user.role === "ADMIN";

const create = async (user, data) => {
  return prisma.task.create({
    data: { ...data, ownerId: user.id },
  });
};

// Fetch a task and enforce that the requester is allowed to see it
const getById = async (user, id) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Users may only access their own tasks; admins may access any
  if (!isAdmin(user) && task.ownerId !== user.id) {
    throw new ApiError(403, "You do not have permission to access this task");
  }

  return task;
};

const list = async (user, { page, limit, status, ownerId }) => {
  const where = {};

  // Non-admins are locked to their own tasks, regardless of filters
  if (isAdmin(user)) {
    if (ownerId) where.ownerId = ownerId;
  } else {
    where.ownerId = user.id;
  }

  if (status) where.status = status;

  const skip = (page - 1) * limit;

  // Run count + page query together for efficiency
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
  // Reuse getById so the same permission check applies
  await getById(user, id);
  return prisma.task.update({ where: { id }, data });
};

const remove = async (user, id) => {
  await getById(user, id);
  await prisma.task.delete({ where: { id } });
};

module.exports = { create, getById, list, update, remove };