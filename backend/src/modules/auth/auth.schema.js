const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("A valid email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("A valid email is required"),
    password: z.string().min(1, "Password is required"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { registerSchema, loginSchema };