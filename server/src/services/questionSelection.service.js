const Question = require("../models/Question");
const RevisionQueue = require("../models/RevisionQueue");
const UserProgress = require("../models/UserProgress");

const getUnlockedDifficulties = (progress) => {
  if (!progress) {
    return ["easy"];
  }

  return ["easy", "medium", "hard"].filter((difficulty) => progress[difficulty]?.unlocked);
};

const selectPracticeQuestions = async ({
  userId,
  subjectId,
  topicId,
  subtopicId,
  difficulty,
  limit = 10
}) => {
  const progress = topicId
    ? await UserProgress.findOne({ userId, topicId, subtopicId })
    : null;
  const unlockedDifficulties = difficulty ? [difficulty] : getUnlockedDifficulties(progress);
  const masteredQuestionIds = progress?.masteredQuestionIds || [];

  return Question.aggregate([
    {
      $match: {
        isPublished: true,
        ...(subjectId ? { subjectId } : {}),
        ...(topicId ? { topicId } : {}),
        ...(subtopicId ? { subtopicId } : {}),
        difficulty: { $in: unlockedDifficulties },
        _id: { $nin: masteredQuestionIds }
      }
    },
    { $sample: { size: Math.min(Number(limit) || 10, 50) } }
  ]);
};

const selectRevisionQuestions = async ({ userId, limit = 10 }) => {
  const dueItems = await RevisionQueue.find({
    userId,
    status: { $in: ["due", "scheduled"] },
    nextReviewAt: { $lte: new Date() }
  })
    .sort({ priority: -1, nextReviewAt: 1 })
    .limit(Math.min(Number(limit) || 10, 50));

  return Question.find({
    _id: { $in: dueItems.map((item) => item.questionId) },
    isPublished: true
  });
};

module.exports = {
  selectPracticeQuestions,
  selectRevisionQuestions
};
