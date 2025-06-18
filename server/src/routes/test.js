import express from "express";
import Test from "../models/Test.js";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get all active tests for users (only show tests they haven't attempted)
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("testAttempts");
    const attemptedTestIds = user.testAttempts.map((attempt) => attempt.testId);

    const tests = await Test.find({
      isActive: true,
      testId: { $nin: attemptedTestIds },
    })
      .select("title testId description timeLimit passPercentage")
      .sort({ createdAt: -1 });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get test by testId for taking (check if user already attempted)
router.get("/:testId", authenticate, async (req, res) => {
  try {
    const test = await Test.findOne({
      testId: req.params.testId.toUpperCase(),
      isActive: true,
    }).select("-questions.answer");

    if (!test) {
      return res.status(404).json({ message: "Test not found or inactive" });
    }

    // Check if user already attempted this test
    const user = await User.findById(req.user._id).select("testAttempts");
    const hasAttempted = user.testAttempts.some(
      (attempt) => attempt.testId === test.testId
    );

    if (hasAttempted) {
      return res
        .status(403)
        .json({ message: "You have already attempted this test" });
    }

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Submit test answers
router.post("/:testId/submit", authenticate, async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers, timeSpent, violations, violationTypes } = req.body;

    const test = await Test.findOne({ testId: testId.toUpperCase() });
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Check if user already attempted this test
    const user = await User.findById(req.user._id);
    const hasAttempted = user.testAttempts.some(
      (attempt) => attempt.testId === test.testId
    );

    if (hasAttempted) {
      return res
        .status(403)
        .json({ message: "You have already attempted this test" });
    }

    let score = 0;
    const results = [];

    // Calculate score - handle missing answers safely
    test.questions.forEach((question, index) => {
      const userAnswer =
        answers && answers[index] !== undefined ? answers[index] : -1;
      const isCorrect = question.answer === userAnswer;
      if (isCorrect) score++;

      results.push({
        questionIndex: index,
        question: question.text,
        options: question.options,
        selectedOption: userAnswer,
        correctAnswer: question.answer,
        isCorrect,
      });
    });

    const percentage = Math.round((score / test.questions.length) * 100);

    // Determine status
    let status = "completed";
    if (violations >= 3) {
      status = "disqualified";
    } else if (percentage < test.passPercentage) {
      status = "failed";
    }

    // Save attempt to user record (including answers for admin review)
    user.testAttempts.push({
      testId: test.testId,
      testTitle: test.title,
      score,
      totalQuestions: test.questions.length,
      percentage,
      status,
      timeSpent,
      violations,
      violationTypes,
      answers: answers || [], // Store user's answers
    });
    await user.save();

    // Update test total attempts
    test.totalAttempts += 1;
    await test.save();

    res.json({
      score,
      total: test.questions.length,
      percentage,
      status,
      passPercentage: test.passPercentage,
      violations,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's test history
router.get("/user/history", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("testAttempts");
    res.json(
      user.testAttempts.sort(
        (a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt)
      )
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
