const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const { signToken } = require("../../utils/jwt");

const SALT_ROUNDS = 10;

const sanitize = (user) => {
  const { password, ...safe } = user;
  return safe;
};

const register = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "USER" },
  });

  const token = signToken({ userId: user.id, role: user.role });
  return { user: sanitize(user), token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { user: sanitize(user), token };
};

module.exports = { register, login };