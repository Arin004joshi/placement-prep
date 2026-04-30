const mongoose = require("mongoose");
const { createPromptHash } = require("../utils/normalizePrompt");

const optionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const followUpSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    expectedAnswer: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
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
      ref: "Subtopic",
      required: [true, "Subtopic is required"]
    },
    type: {
      type: String,
      enum: ["mcq", "descriptive", "conceptual", "coding"],
      required: [true, "Question type is required"]
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: [true, "Difficulty is required"]
    },
    title: {
      type: String,
      trim: true,
      maxlength: 180,
      default: ""
    },
    prompt: {
      type: String,
      required: [true, "Prompt is required"],
      trim: true
    },
    normalizedPromptHash: {
      type: String,
      required: true
    },
    options: [optionSchema],
    expectedAnswer: {
      type: String,
      trim: true,
      default: ""
    },
    explanation: {
      type: String,
      trim: true,
      default: ""
    },
    commonMistakes: [
      {
        type: String,
        trim: true
      }
    ],
    followUps: [followUpSchema],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    concepts: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    estimatedMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    source: {
      type: String,
      trim: true,
      default: ""
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

questionSchema.pre("validate", function validateQuestion(next) {
  if (this.prompt) {
    this.normalizedPromptHash = createPromptHash(this.prompt);
  }

  if (this.type === "mcq") {
    if (!this.options || this.options.length < 2) {
      this.invalidate("options", "MCQ questions require at least two options");
    }

    if (!this.options.some((option) => option.isCorrect)) {
      this.invalidate("options", "MCQ questions require at least one correct option");
    }
  }

  if (this.type !== "mcq" && this.options && this.options.length > 0) {
    this.invalidate("options", "Only MCQ questions can include options");
  }

  if (this.isPublished && !this.expectedAnswer) {
    this.invalidate("expectedAnswer", "Published questions require an expected answer");
  }

  next();
});

questionSchema.index({ subjectId: 1, topicId: 1, subtopicId: 1 });
questionSchema.index({ difficulty: 1, type: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ concepts: 1 });
questionSchema.index({ isPublished: 1, difficulty: 1 });
questionSchema.index({ subtopicId: 1, normalizedPromptHash: 1 }, { unique: true });

module.exports = mongoose.model("Question", questionSchema);
