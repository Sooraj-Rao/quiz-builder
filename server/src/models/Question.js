import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
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
    testId: {
      type: String,
      required: [true, "Test ID is required"],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Question", questionSchema);
