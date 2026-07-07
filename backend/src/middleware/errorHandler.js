const ApiError = require("../utils/apiError");
const env = require("../config/env");

const errorHandler = (err, req, res, next) => {
  // Known, expected errors we threw deliberately
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `A record with this ${err.meta?.target?.join(", ")} already exists`,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: "Resource not found" });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.nodeEnv === "development" ? { error: err.message } : {}),
  });
};

module.exports = errorHandler;