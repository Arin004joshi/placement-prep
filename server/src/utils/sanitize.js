const xss = require("xss");

const sanitizeString = (value) => xss(String(value || "").trim());

const sanitizeObject = (input) => {
  if (Array.isArray(input)) {
    return input.map(sanitizeObject);
  }

  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizeObject(value)])
    );
  }

  if (typeof input === "string") {
    return sanitizeString(input);
  }

  return input;
};

module.exports = {
  sanitizeString,
  sanitizeObject
};
