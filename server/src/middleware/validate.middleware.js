const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { sanitizeObject } = require("../utils/sanitize");

const sanitizeBody = (req, _res, next) => {
  req.body = sanitizeObject(req.body);
  next();
};

const validateObjectId = (paramName = "id") => (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params[paramName])) {
    throw new AppError(`Invalid ${paramName}`, 400);
  }

  next();
};

module.exports = {
  sanitizeBody,
  validateObjectId
};
