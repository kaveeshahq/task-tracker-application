const ApiError = require("../utils/apiError");
const env = require("../config/env");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Known, expected errors we threw deliberately
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Prisma: unique constraint violation (e.g. duplicate email)
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `A record with this ${err.meta?.target?.join(", ")} already exists`,
    });
  }

  // Prisma: record not found for an operation that requires it
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: "Resource not found" });
  }

  // Anything else = unexpected bug
  console.error("Unexpected error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.nodeEnv === "development" ? { error: err.message } : {}),
  });
};

module.exports = errorHandler;