const UserProgress = require("../models/UserProgress");

const getMasteryLevel = (accuracy, totalAttempted) => {
  if (totalAttempted === 0) return "not_started";
  if (accuracy >= 90) return "mastered";
  if (accuracy >= 80) return "strong";
  if (accuracy >= 60) return "intermediate";
  return "learning";
};

const updateProgressAfterAttempt = async ({ userId, question, isCorrect }) => {
  const difficulty = question.difficulty;
  const progress = await UserProgress.findOneAndUpdate(
    {
      userId,
      subjectId: question.subjectId,
      topicId: question.topicId,
      subtopicId: question.subtopicId
    },
    {
      $setOnInsert: {
        userId,
        subjectId: question.subjectId,
        topicId: question.topicId,
        subtopicId: question.subtopicId
      },
      $addToSet: {
        completedQuestionIds: question._id,
        ...(isCorrect ? { masteredQuestionIds: question._id } : { weakQuestionIds: question._id })
      },
      $inc: {
        totalAttempted: 1,
        totalCorrect: isCorrect ? 1 : 0,
        [`${difficulty}.attempted`]: 1,
        [`${difficulty}.correct`]: isCorrect ? 1 : 0,
        version: 1
      },
      $set: {
        lastPracticedAt: new Date()
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  progress.accuracy = progress.totalAttempted
    ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100)
    : 0;

  for (const level of ["easy", "medium", "hard"]) {
    progress[level].mastery = progress[level].attempted
      ? Math.round((progress[level].correct / progress[level].attempted) * 100)
      : 0;
  }

  if (progress.easy.attempted >= 10 && progress.easy.mastery >= 75) {
    progress.medium.unlocked = true;
  }

  if (progress.medium.attempted >= 10 && progress.medium.mastery >= 80) {
    progress.hard.unlocked = true;
  }

  if (!isCorrect) {
    const now = new Date();
    const concepts = question.concepts?.length ? question.concepts : question.tags || [];

    for (const concept of concepts) {
      const existingConcept = progress.weakConcepts.find((item) => item.concept === concept);

      if (existingConcept) {
        existingConcept.misses += 1;
        existingConcept.lastMissedAt = now;
      } else {
        progress.weakConcepts.push({
          concept,
          misses: 1,
          lastMissedAt: now
        });
      }
    }
  }

  progress.masteryLevel = getMasteryLevel(progress.accuracy, progress.totalAttempted);
  await progress.save();

  return progress;
};

module.exports = {
  updateProgressAfterAttempt
};
