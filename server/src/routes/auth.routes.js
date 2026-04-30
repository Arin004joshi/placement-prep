const express = require("express");
const { login, me, signup } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const { sanitizeBody } = require("../middleware/validate.middleware");

const router = express.Router();

router.post("/signup", authLimiter, sanitizeBody, signup);
router.post("/login", authLimiter, sanitizeBody, login);
router.get("/me", protect, me);

module.exports = router;
