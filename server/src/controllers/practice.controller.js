const mongoose = require("mongoose");
const Question = require("../models/Question");
const QuestionAttempt = require("../models/QuestionAttempt");
const RevisionQueue = require("../models/RevisionQueue");
const UserProgress = require("../models/UserProgress");
const { updateProgressAfterAttempt } = require("../services/progress.service");
const {
  selectPracticeQuestions,
  selectRevisionQuestions
} = require("../services/questionSelection.service");
const { upsertRevisionState } = require("../services/revision.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const getPracticeQuestions = asyncHandler(async (req, res) => {
  const questions = await selectPracticeQuestions({
    userId: req.user.id,
    subjectId: req.query.subjectId ? new mongoose.Types.ObjectId(req.query.subjectId) : undefined,
    topicId: req.query.topicId ? new mongoose.Types.ObjectId(req.query.topicId) : undefined,
    subtopicId: req.query.subtopicId ? new mongoose.Types.ObjectId(req.query.subtopicId) : undefined,
    difficulty: req.query.difficulty,
    limit: req.query.limit
  });

  res.json({
    success: true,
    data: questions,
    message: questions.length ? undefined : "No matching practice questions are available yet."
  });
});

const getRevisionQuestions = asyncHandler(async (req, res) => {
  const questions = await selectRevisionQuestions({
    userId: req.user.id,
    limit: req.query.limit
  });

  res.json({
    success: true,
    data: questions,
    message: questions.length ? undefined : "No revision questions are due right now."
  });
});

const isMcqCorrect = (question, submittedAnswer) => {
  const submitted = Array.isArray(submittedAnswer) ? submittedAnswer : [submittedAnswer];
  const expected = question.options.filter((option) => option.isCorrect).map((option) => option.key);

  return (
    submitted.length === expected.length &&
    submitted.every((answer) => expected.includes(String(answer).trim()))
  );
};

const submitAttempt = asyncHandler(async (req, res) => {
  const { questionId, submittedAnswer, mode = "practice", timeSpentSeconds = 0, skipped = false } = req.body;

  if (!mongoose.isValidObjectId(questionId)) {
    throw new AppError("Invalid questionId", 400);
  }

  const question = await Question.findById(questionId);

  if (!question || !question.isPublished) {
    throw new AppError("Question not found", 404);
  }

  const isCorrect = skipped ? false : question.type === "mcq" ? isMcqCorrect(question, submittedAnswer) : false;
  const score = isCorrect ? 1 : 0;

  const attempt = await QuestionAttempt.create({
    userId: req.user.id,
    questionId: question._id,
    subjectId: question.subjectId,
    topicId: question.topicId,
    subtopicId: question.subtopicId,
    mode,
    submittedAnswer,
    isCorrect,
    score,
    maxScore: 1,
    timeSpentSeconds,
    skipped,
    mistakeTags: isCorrect ? [] : question.concepts || [],
    feedback: isCorrect
      ? "Correct answer."
      : "Review the expected answer and common mistakes before retrying."
  });

  const progress = await updateProgressAfterAttempt({
    userId: req.user.id,
    question,
    isCorrect
  });

  const revision = await upsertRevisionState({
    userId: req.user.id,
    question,
    isCorrect
  });

  res.status(201).json({
    success: true,
    data: {
      attempt,
      progress,
      revision,
      result: {
        isCorrect,
        score,
        maxScore: 1,
        expectedAnswer: question.expectedAnswer,
        explanation: question.explanation,
        commonMistakes: question.commonMistakes,
        followUps: question.followUps
      }
    }
  });
});

const getProgressSummary = asyncHandler(async (req, res) => {
  const [progress, attemptsCount, revisionDueCount] = await Promise.all([
    UserProgress.find({ userId: req.user.id }).sort({ lastPracticedAt: -1 }),
    QuestionAttempt.countDocuments({ userId: req.user.id }),
    RevisionQueue.countDocuments({
      userId: req.user.id,
      status: { $in: ["due", "scheduled"] },
      nextReviewAt: { $lte: new Date() }
    })
  ]);

  const totals = progress.reduce(
    (acc, item) => {
      acc.totalAttempted += item.totalAttempted;
      acc.totalCorrect += item.totalCorrect;
      return acc;
    },
    { totalAttempted: 0, totalCorrect: 0 }
  );

  const weakConcepts = new Map();

  for (const item of progress) {
    for (const weakConcept of item.weakConcepts || []) {
      weakConcepts.set(
        weakConcept.concept,
        (weakConcepts.get(weakConcept.concept) || 0) + weakConcept.misses
      );
    }
  }

  res.json({
    success: true,
    data: {
      totalAttempted: totals.totalAttempted,
      totalCorrect: totals.totalCorrect,
      totalAttemptsLogged: attemptsCount,
      accuracy: totals.totalAttempted
        ? Math.round((totals.totalCorrect / totals.totalAttempted) * 100)
        : 0,
      revisionDueCount,
      mastery: progress,
      weakAreas: Array.from(weakConcepts.entries())
        .map(([concept, misses]) => ({ concept, misses }))
        .sort((a, b) => b.misses - a.misses)
        .slice(0, 10)
    }
  });
});

module.exports = {
  getPracticeQuestions,
  getRevisionQuestions,
  submitAttempt,
  getProgressSummary
};
