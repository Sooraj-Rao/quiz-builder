import mongoose from "mongoose"

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
    minlength: [10, "Question must be at least 10 characters"],
  },
  options: [
    {
      type: String,
      required: true,
      trim: true,
    },
  ],
  answer: {
    type: Number,
    required: [true, "Correct answer index is required"],
    min: [0, "Answer index must be 0 or greater"],
  },
  level: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
})

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Test title is required"],
      trim: true,
      minlength: [3, "Test title must be at least 3 characters"],
    },
    testId: {
      type: String,
      required: [true, "Test ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    timeLimit: {
      type: Number, // in minutes
      required: [true, "Time limit is required"],
      min: [1, "Time limit must be at least 1 minute"],
      max: [300, "Time limit cannot exceed 300 minutes"],
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: "Administrator",
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    passPercentage: {
      type: Number,
      default: 60,
      min: [0, "Pass percentage cannot be negative"],
      max: [100, "Pass percentage cannot exceed 100"],
    },
  },
  {
    timestamps: true,
  },
)


export default mongoose.models.Test || mongoose.model("Test", testSchema);

