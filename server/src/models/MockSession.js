const mongoose = require("mongoose");

const difficultyMixSchema = new mongoose.Schema(
  {
    easy: {
      type: Number,
      default: 0,
      min: 0
    },
    medium: {
      type: Number,
      default: 0,
      min: 0
    },
    hard: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { _id: false }
);

const mockAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    answer: mongoose.Schema.Types.Mixed,
    skipped: {
      type: Boolean,
      default: false
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
      min: 0
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const mockSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"]
    },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "abandoned", "expired"],
      default: "in_progress"
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
      }
    ],
    difficultyMix: {
      type: difficultyMixSchema,
      default: () => ({})
    },
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
      }
    ],
    answers: [mockAnswerSchema],
    durationMinutes: {
      type: Number,
      required: [true, "Duration is required"],
      min: 1
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry time is required"]
    },
    submittedAt: Date,
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    maxScore: {
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
    feedbackSummary: {
      type: String,
      trim: true,
      default: ""
    },
    weakConcepts: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ]
  },
  { timestamps: true }
);

mockSessionSchema.pre("validate", function validateMockSession(next) {
  const uniqueQuestionIds = new Set(this.questionIds.map((id) => id.toString()));

  if (uniqueQuestionIds.size !== this.questionIds.length) {
    this.invalidate("questionIds", "Mock session questions must be unique");
  }

  if (this.expiresAt && this.startedAt && this.expiresAt <= this.startedAt) {
    this.invalidate("expiresAt", "Expiry time must be after start time");
  }

  next();
});

mockSessionSchema.index({ userId: 1, status: 1, startedAt: -1 });
mockSessionSchema.index({ userId: 1, expiresAt: 1 });
mockSessionSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model("MockSession", mockSessionSchema);
