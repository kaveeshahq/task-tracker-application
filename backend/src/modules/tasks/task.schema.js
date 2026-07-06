const { z } = require("zod");

const STATUS = ["TODO", "IN_PROGRESS", "DONE"];

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(2000).optional(),
    status: z.enum(STATUS).optional(),
    dueDate: z.coerce.date().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateTaskSchema = z.object({
  body: z
    .object({
      title: z.string().min(1).max(200).optional(),
      description: z.string().max(2000).optional(),
      status: z.enum(STATUS).optional(),
      dueDate: z.coerce.date().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    }),
  params: z.object({ id: z.string().uuid("Invalid task ID") }),
  query: z.object({}).optional(),
});

const getTaskSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid task ID") }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

const listTaskSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(STATUS).optional(),
    ownerId: z.string().uuid("Invalid owner ID").optional(),
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  listTaskSchema,
};