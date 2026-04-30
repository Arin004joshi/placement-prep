const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throw new AppError("Authentication token is required", 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (_error) {
    throw new AppError("Invalid or expired authentication token", 401);
  }

  const user = await User.findById(decoded.userId);

  if (!user || !user.isActive) {
    throw new AppError("User is not allowed to access this resource", 401);
  }

  req.user = {
    id: user._id,
    role: user.role,
    email: user.email,
    name: user.name
  };

  next();
});

const restrictTo =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }

    next();
  };

module.exports = {
  protect,
  restrictTo
};
