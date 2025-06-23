"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAdmin } from "../../../contexts/AdminContext";
import axios from "axios";
import "./AdminTestResult.css";

const AdminTestResult = () => {
  const { userId, attemptId } = useParams();
  const { admin } = useAdmin();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!admin) {
      window.close();
      return;
    }
    fetchTestResult();
  }, [userId, attemptId, admin]);

  const fetchTestResult = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/test-result/${userId}/${attemptId}`
      );
      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load test result");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "failed":
        return "#ffc107";
      case "disqualified":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "🎉";
      case "failed":
        return "😔";
      case "disqualified":
        return "❌";
      default:
        return "📊";
    }
  };

  const getStatusMessage = (status, percentage, passPercentage) => {
    switch (status) {
      case "completed":
        return `Student passed with ${percentage}%`;
      case "failed":
        return `Student scored ${percentage}%. Required: ${passPercentage}%`;
      case "disqualified":
        return "Test disqualified due to violations";
      default:
        return "Test completed";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">Loading test result...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.close()} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2>No Result Found</h2>
          <button onClick={() => window.close()} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card text-center">
        <div className="flex justify-between align-center mb-20">
          <h1>Test Result Review</h1>
          <div className="flex gap-12">
            <button onClick={handlePrint} className="btn btn-secondary">
              Print Result
            </button>
            <button
              onClick={() => (window.location.href = "/admin/dashboard")}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>

        {/* Student & Test Info */}
        <div className="grid grid-2 mb-20">
          <div className="card">
            <h4>👤 Student Information</h4>
            <p>
              <strong>Name:</strong> {result.student.name}
            </p>
            <p>
              <strong>Email:</strong> {result.student.email}
            </p>
          </div>
          <div className="card">
            <h4>📝 Test Information</h4>
            <p>
              <strong>Test:</strong> {result.test.title}
            </p>
            <p>
              <strong>Code:</strong> {result.test.testId}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(result.attempt.attemptedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div
          className="card"
          style={{
            backgroundColor: getStatusColor(result.attempt.status),
            color: "white",
            margin: "20px 0",
          }}
        >
          <h2>
            {getStatusIcon(result.attempt.status)}{" "}
            {getStatusMessage(
              result.attempt.status,
              result.attempt.percentage,
              result.test.passPercentage
            )}
          </h2>
          <h3>
            Final Score: {result.attempt.score}/{result.attempt.total} (
            {result.attempt.percentage}%)
          </h3>
        </div>

        <div className="grid grid-4 mb-20">
          <div className="card">
            <h4>✅ Correct Answers</h4>
            <p style={{ fontSize: "24px", color: "#28a745" }}>
              {result.attempt.score}
            </p>
          </div>
          <div className="card">
            <h4>❌ Incorrect Answers</h4>
            <p style={{ fontSize: "24px", color: "#dc3545" }}>
              {result.attempt.total - result.attempt.score}
            </p>
          </div>
          <div className="card">
            <h4>⏱️ Time Spent</h4>
            <p style={{ fontSize: "18px", color: "#007bff" }}>
              {Math.floor(result.attempt.timeSpent / 60)}m{" "}
              {result.attempt.timeSpent % 60}s
            </p>
          </div>
          <div className="card">
            <h4>⚠️ Violations</h4>
            <p style={{ fontSize: "24px", color: "#dc3545" }}>
              {result.attempt.violations || 0}
            </p>
            {result.attempt.violationTypes &&
              result.attempt.violationTypes.length > 0 && (
                <div style={{ fontSize: "12px", marginTop: "8px" }}>
                  {result.attempt.violationTypes.map((type, index) => (
                    <span
                      key={index}
                      className="badge badge-danger"
                      style={{ margin: "2px" }}
                    >
                      {type.replace("_", " ")}
                    </span>
                  ))}
                </div>
              )}
          </div>
        </div>

        {result.attempt.status !== "disqualified" && (
          <div className="card">
            <h3>Question Analysis</h3>
            {result.results.map((item, index) => (
              <div key={index} className="card">
                <div className="flex justify-between align-center mb-16">
                  <h4>Question {index + 1}</h4>
                  <div className="flex gap-8 align-center">
                    <span
                      className={`badge badge-${
                        item.level === "easy"
                          ? "success"
                          : item.level === "medium"
                          ? "warning"
                          : "danger"
                      }`}
                    >
                      {item.level.toUpperCase()}
                    </span>
                    <span
                      className={`badge ${
                        item.isCorrect ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {item.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                    </span>
                  </div>
                </div>

                <p className="mb-16">
                  <strong>Q:</strong> {item.question}
                </p>

                <div>
                  {item.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`quiz-option ${
                        optIndex === item.correctAnswer
                          ? "correct"
                          : optIndex === item.selectedOption && !item.isCorrect
                          ? "incorrect"
                          : ""
                      }`}
                    >
                      <div className="quiz-option-letter">
                        {String.fromCharCode(65 + optIndex)}
                      </div>
                      <span style={{ flex: 1 }}>{option}</span>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        {optIndex === item.correctAnswer && (
                          <span style={{ color: "#28a745", fontWeight: "600" }}>
                            ✓ Correct Answer
                          </span>
                        )}
                        {optIndex === item.selectedOption &&
                          optIndex !== item.correctAnswer && (
                            <span
                              style={{ color: "#dc3545", fontWeight: "600" }}
                            >
                              ✗ Student's Answer
                            </span>
                          )}
                        {optIndex === item.selectedOption &&
                          optIndex === item.correctAnswer && (
                            <span
                              style={{ color: "#28a745", fontWeight: "600" }}
                            >
                              ✓ Student's Answer (Correct)
                            </span>
                          )}
                        {item.selectedOption === -1 &&
                          optIndex === item.correctAnswer && (
                            <span
                              style={{ color: "#ffc107", fontWeight: "600" }}
                            >
                              ⚠️ Not Answered
                            </span>
                          )}
                      </div>
                    </div>
                  ))}
                </div>

                {item.selectedOption === -1 && (
                  <div className="mt-16">
                    <span className="badge badge-warning">
                      ⚠️ Question Not Answered
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestResult;
