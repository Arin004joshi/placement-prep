const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      maxlength: 80
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
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

subjectSchema.pre("validate", function setSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

subjectSchema.index({ slug: 1 }, { unique: true });
subjectSchema.index({ isPublished: 1, displayOrder: 1 });

module.exports = mongoose.model("Subject", subjectSchema);
