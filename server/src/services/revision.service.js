const RevisionQueue = require("../models/RevisionQueue");

const DAY_MS = 24 * 60 * 60 * 1000;

const getCorrectIntervalDays = (correctStreak) => {
  if (correctStreak <= 1) return 2;
  if (correctStreak === 2) return 5;
  if (correctStreak === 3) return 10;
  return null;
};

const upsertRevisionState = async ({ userId, question, isCorrect }) => {
  const existing = await RevisionQueue.findOne({
    userId,
    questionId: question._id
  });

  const now = new Date();
  const incorrectCount = isCorrect ? existing?.incorrectCount || 0 : (existing?.incorrectCount || 0) + 1;
  const correctStreak = isCorrect ? (existing?.correctStreak || 0) + 1 : 0;
  const intervalDays = isCorrect
    ? getCorrectIntervalDays(correctStreak)
    : Math.min(7, Math.max(1, incorrectCount));

  const status = isCorrect && intervalDays === null ? "mastered" : "scheduled";
  const nextReviewAt = intervalDays === null ? null : new Date(now.getTime() + intervalDays * DAY_MS);
  const priorityChange = isCorrect ? -5 : 10 + incorrectCount;

  return RevisionQueue.findOneAndUpdate(
    { userId, questionId: question._id },
    {
      $set: {
        subjectId: question.subjectId,
        topicId: question.topicId,
        subtopicId: question.subtopicId,
        incorrectCount,
        correctStreak,
        lastAttemptedAt: now,
        nextReviewAt,
        status,
        tags: question.tags || []
      },
      $inc: {
        priority: priorityChange
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

module.exports = {
  upsertRevisionState
};
