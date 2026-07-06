const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

const me = asyncHandler(async (req, res) => {
  // req.user is set by the authenticate middleware
  res.status(200).json({ success: true, data: req.user });
});

module.exports = { register, login, me };