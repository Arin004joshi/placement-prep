const express = require("express");
const {
  getPracticeQuestions,
  getProgressSummary,
  getRevisionQuestions,
  submitAttempt
} = require("../controllers/practice.controller");
const { protect } = require("../middleware/auth.middleware");
const { sanitizeBody } = require("../middleware/validate.middleware");

const router = express.Router();

router.use(protect);

router.get("/practice/questions", getPracticeQuestions);
router.get("/revision/questions", getRevisionQuestions);
router.post("/attempts", sanitizeBody, submitAttempt);
router.get("/progress/summary", getProgressSummary);

module.exports = router;
