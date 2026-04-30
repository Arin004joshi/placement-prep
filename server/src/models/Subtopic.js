const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const subtopicSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, "Subtopic title is required"],
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
    displayOrder: {
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

subtopicSchema.pre("validate", function setSlug(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  next();
});

subtopicSchema.index({ topicId: 1, slug: 1 }, { unique: true });
subtopicSchema.index({ subjectId: 1, topicId: 1, displayOrder: 1 });
subtopicSchema.index({ isPublished: 1 });

module.exports = mongoose.model("Subtopic", subtopicSchema);
