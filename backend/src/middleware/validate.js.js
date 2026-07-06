const ApiError = require("../utils/apiError");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw new ApiError(400, "Validation failed", details);
  }

  req.body = result.data.body;
  req.query = result.data.query;
  req.params = result.data.params;

  next();
};

module.exports = validate;