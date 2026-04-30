const crypto = require("crypto");

const normalizePrompt = (prompt) =>
  String(prompt || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");

const createPromptHash = (prompt) =>
  crypto.createHash("sha256").update(normalizePrompt(prompt)).digest("hex");

module.exports = {
  normalizePrompt,
  createPromptHash
};
