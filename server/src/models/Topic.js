const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const topicSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"]
    },
    title: {
      type: String,
      required: [true, "Topic title is required"],
      trim: true,
      maxlength: 140
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    shortTheory: {
      type: String,
      trim: true,
      default: ""
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic"
      }
    ],
    displayOrder: {
      type: Number,
      default: 0,
      min: 0
    },
    estimatedMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

topicSchema.pre("validate", function setSlug(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  if (this.isPublished && !this.shortTheory) {
    this.invalidate("shortTheory", "Published topics require short theory");
  }

  next();
});

topicSchema.index({ subjectId: 1, slug: 1 }, { unique: true });
topicSchema.index({ subjectId: 1, isPublished: 1, displayOrder: 1 });

module.exports = mongoose.model("Topic", topicSchema);
