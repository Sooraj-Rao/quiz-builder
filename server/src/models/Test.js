import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
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
  },
  level: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
});

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Test title is required"],
      trim: true,
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
    },
    timeLimit: {
      type: Number,
      required: [true, "Time limit is required"],
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
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Test || mongoose.model("Test", testSchema);
