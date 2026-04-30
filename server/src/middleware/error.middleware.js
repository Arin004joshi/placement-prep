const mongoose = require("mongoose");

const handleDuplicateKey = (error) => {
  const fields = Object.keys(error.keyPattern || {});
  const fieldLabel = fields.length ? fields.join(", ") : "field";

  return {
    statusCode: 409,
    message: `Duplicate value for ${fieldLabel}`,
    details: error.keyValue || null
  };
};

const handleValidation = (error) => ({
  statusCode: 400,
  message: "Validation failed",
  details: Object.values(error.errors).map((item) => ({
    field: item.path,
    message: item.message
  }))
});

const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let details = error.details || null;

  if (error.code === 11000) {
    const duplicate = handleDuplicateKey(error);
    statusCode = duplicate.statusCode;
    message = duplicate.message;
    details = duplicate.details;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const validation = handleValidation(error);
    statusCode = validation.statusCode;
    message = validation.message;
    details = validation.details;
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid identifier";
    details = { field: error.path, value: error.value };
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
