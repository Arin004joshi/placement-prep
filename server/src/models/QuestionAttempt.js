const mongoose = require("mongoose");

const questionAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question is required"]
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true
    },
    subtopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subtopic",
      required: true
    },
    mode: {
      type: String,
      enum: ["practice", "revision", "mock"],
      required: [true, "Attempt mode is required"]
    },
    mockSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockSession"
    },
    submittedAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    maxScore: {
      type: Number,
      default: 1,
      min: 1
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
      min: 0
    },
    skipped: {
      type: Boolean,
      default: false
    },
    mistakeTags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    feedback: {
      type: String,
      trim: true,
      default: ""
    },
    attemptedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

questionAttemptSchema.pre("validate", function validateScore(next) {
  if (this.score > this.maxScore) {
    this.invalidate("score", "Score cannot be greater than maxScore");
  }
  next();
});

questionAttemptSchema.index({ userId: 1, attemptedAt: -1 });
questionAttemptSchema.index({ userId: 1, questionId: 1, attemptedAt: -1 });
questionAttemptSchema.index({ userId: 1, subjectId: 1, topicId: 1 });
questionAttemptSchema.index({ userId: 1, isCorrect: 1 });
questionAttemptSchema.index({ mockSessionId: 1 });

module.exports = mongoose.model("QuestionAttempt", questionAttemptSchema);
