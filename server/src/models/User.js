import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const attemptSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
  },
  testTitle: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "failed", "disqualified"],
    required: true,
  },
  timeSpent: {
    type: Number,
    required: true,
  },
  violations: {
    type: Number,
    default: 0,
  },
  violationTypes: [
    {
      type: String,
      enum: ["tab_switch", "text_selection", "copy_attempt", "right_click"],
    },
  ],
  answers: [
    {
      type: Number,
      default: -1,
    },
  ],
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    testAttempts: [attemptSchema],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
