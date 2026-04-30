const mongoose = require("mongoose");

const difficultyProgressSchema = new mongoose.Schema(
  {
    attempted: {
      type: Number,
      default: 0,
      min: 0
    },
    correct: {
      type: Number,
      default: 0,
      min: 0
    },
    mastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    unlocked: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const weakConceptSchema = new mongoose.Schema(
  {
    concept: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    misses: {
      type: Number,
      default: 0,
      min: 0
    },
    lastMissedAt: Date
  },
  { _id: false }
);

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"]
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: [true, "Topic is required"]
    },
    subtopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subtopic"
    },
    completedQuestionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ],
    masteredQuestionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ],
    weakQuestionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ],
    easy: {
      type: difficultyProgressSchema,
      default: () => ({ unlocked: true })
    },
    medium: {
      type: difficultyProgressSchema,
      default: () => ({ unlocked: false })
    },
    hard: {
      type: difficultyProgressSchema,
      default: () => ({ unlocked: false })
    },
    totalAttempted: {
      type: Number,
      default: 0,
      min: 0
    },
    totalCorrect: {
      type: Number,
      default: 0,
      min: 0
    },
    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    masteryLevel: {
      type: String,
      enum: ["not_started", "learning", "intermediate", "strong", "mastered"],
      default: "not_started"
    },
    weakConcepts: [weakConceptSchema],
    lastPracticedAt: Date,
    completedAt: Date,
    version: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  { timestamps: true }
);

userProgressSchema.index(
  { userId: 1, subjectId: 1, topicId: 1, subtopicId: 1 },
  { unique: true }
);
userProgressSchema.index({ userId: 1, masteryLevel: 1 });
userProgressSchema.index({ userId: 1, lastPracticedAt: -1 });

module.exports = mongoose.model("UserProgress", userProgressSchema);
