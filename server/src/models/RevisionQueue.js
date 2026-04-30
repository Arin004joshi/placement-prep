const mongoose = require("mongoose");

const revisionQueueSchema = new mongoose.Schema(
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
    incorrectCount: {
      type: Number,
      default: 0,
      min: 0
    },
    correctStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    lastAttemptedAt: Date,
    nextReviewAt: Date,
    priority: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["due", "scheduled", "mastered"],
      default: "scheduled"
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ]
  },
  { timestamps: true }
);

revisionQueueSchema.index({ userId: 1, questionId: 1 }, { unique: true });
revisionQueueSchema.index({ userId: 1, status: 1, nextReviewAt: 1 });
revisionQueueSchema.index({ userId: 1, priority: -1 });
revisionQueueSchema.index({ userId: 1, topicId: 1 });

module.exports = mongoose.model("RevisionQueue", revisionQueueSchema);
