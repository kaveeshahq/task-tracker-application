const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/apiError");

const app = express();

// Core middleware
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", routes);

// 404 for any unmatched route
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Central error handler (must be last, after routes)
app.use(errorHandler);

module.exports = app;