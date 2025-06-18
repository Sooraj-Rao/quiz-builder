import express from "express";
import User from "../models/User.js";
import Test from "../models/Test.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No admin token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    );
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid admin token" });
  }
};

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || "admin@quizapp.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (email !== adminEmail || password !== adminPassword) {
      return res
        .status(401)
        .json({ message: "Invalid administrator credentials" });
    }

    const token = jwt.sign(
      { userId: "admin", email: adminEmail, role: "admin" },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Administrator login successful",
      token,
      user: {
        id: "admin",
        name: "Administrator",
        email: adminEmail,
        role: "admin",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users with their test attempts
router.get("/users", authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all tests
router.get("/tests", authenticateAdmin, async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create new test
router.post("/tests", authenticateAdmin, async (req, res) => {
  try {
    const { title, testId, description, timeLimit, questions, passPercentage } =
      req.body;

    // Check if testId already exists
    const existingTest = await Test.findOne({ testId: testId.toUpperCase() });
    if (existingTest) {
      return res.status(400).json({ message: "Test ID already exists" });
    }

    const test = new Test({
      title,
      testId: testId.toUpperCase(),
      description,
      timeLimit,
      questions,
      passPercentage: passPercentage || 60,
    });

    await test.save();
    res.status(201).json(test);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Get single test for editing
router.get("/tests/:testId", authenticateAdmin, async (req, res) => {
  try {
    const test = await Test.findOne({
      testId: req.params.testId.toUpperCase(),
    });
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update test
router.put("/tests/:testId", authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      timeLimit,
      questions,
      isActive,
      passPercentage,
    } = req.body;

    const test = await Test.findOneAndUpdate(
      { testId: req.params.testId.toUpperCase() },
      { title, description, timeLimit, questions, isActive, passPercentage },
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json(test);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Delete test
router.delete("/tests/:testId", authenticateAdmin, async (req, res) => {
  try {
    const test = await Test.findOneAndDelete({
      testId: req.params.testId.toUpperCase(),
    });
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user details
router.put("/users/:userId", authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:userId", authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get test analytics
router.get("/analytics/:testId", authenticateAdmin, async (req, res) => {
  try {
    const { testId } = req.params;

    const users = await User.find({
      "testAttempts.testId": testId.toUpperCase(),
    }).select("name email testAttempts");

    const attempts = [];
    users.forEach((user) => {
      const userAttempts = user.testAttempts.filter(
        (attempt) => attempt.testId === testId.toUpperCase()
      );
      userAttempts.forEach((attempt) => {
        attempts.push({
          attemptId: attempt._id,
          userName: user.name,
          userEmail: user.email,
          userId: user._id,
          ...attempt.toObject(),
        });
      });
    });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get detailed test result for a specific attempt
router.get(
  "/test-result/:userId/:attemptId",
  authenticateAdmin,
  async (req, res) => {
    try {
      const { userId, attemptId } = req.params;

      const user = await User.findById(userId).select(
        "name email testAttempts"
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const attempt = user.testAttempts.id(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Test attempt not found" });
      }

      // Get the test to reconstruct the detailed results
      const test = await Test.findOne({ testId: attempt.testId });
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      // Reconstruct the detailed results
      const results = [];
      test.questions.forEach((question, index) => {
        const userAnswer =
          attempt.answers && attempt.answers[index] !== undefined
            ? attempt.answers[index]
            : -1;
        const isCorrect = question.answer === userAnswer;

        results.push({
          questionIndex: index,
          question: question.text,
          options: question.options,
          selectedOption: userAnswer,
          correctAnswer: question.answer,
          isCorrect,
          level: question.level,
        });
      });

      const detailedResult = {
        student: {
          name: user.name,
          email: user.email,
        },
        test: {
          title: test.title,
          testId: test.testId,
          passPercentage: test.passPercentage,
        },
        attempt: {
          score: attempt.score,
          total: attempt.totalQuestions,
          percentage: attempt.percentage,
          status: attempt.status,
          timeSpent: attempt.timeSpent,
          violations: attempt.violations,
          violationTypes: attempt.violationTypes,
          attemptedAt: attempt.attemptedAt,
        },
        results,
      };

      res.json(detailedResult);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
