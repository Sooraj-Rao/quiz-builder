"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin } from "../contexts/AdminContext";
import axios from "axios";

const AdminUserAttempt = () => {
  const { userId, attemptId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchAttemptData();
  }, [userId, attemptId, admin, navigate]);

  const fetchAttemptData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/attempt/${userId}/${attemptId}`
      );
      setAttemptData(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load attempt data");
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
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Test Result - Admin View</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .student-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .result-summary { 
            background: ${getStatusColor(attemptData.attempt.status)}; 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            margin-bottom: 20px; 
          }
          .stats { display: flex; justify-content: space-around; margin-bottom: 20px; }
          .stat { text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; }
          .stat-label { font-size: 14px; color: #666; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎯 QuizMaster - Student Test Result (Admin View)</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="student-info">
          <h3>Student Information</h3>
          <p><strong>Name:</strong> ${attemptData.user.name}</p>
          <p><strong>Email:</strong> ${attemptData.user.email}</p>
          <p><strong>Test:</strong> ${attemptData.attempt.testTitle} (${
      attemptData.attempt.testId
    })</p>
          <p><strong>Date:</strong> ${new Date(
            attemptData.attempt.attemptedAt
          ).toLocaleDateString()}</p>
        </div>
        
        <div class="result-summary">
          <h2>${getStatusIcon(attemptData.attempt.status)} ${getStatusMessage(
      attemptData.attempt.status,
      attemptData.attempt.percentage,
      60
    )}</h2>
          <h3>Final Score: ${attemptData.attempt.score}/${
      attemptData.attempt.totalQuestions
    } (${attemptData.attempt.percentage}%)</h3>
        </div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-number" style="color: #28a745;">${
              attemptData.attempt.score
            }</div>
            <div class="stat-label">Correct Answers</div>
          </div>
          <div class="stat">
            <div class="stat-number" style="color: #dc3545;">${
              attemptData.attempt.totalQuestions - attemptData.attempt.score
            }</div>
            <div class="stat-label">Incorrect Answers</div>
          </div>
          <div class="stat">
            <div class="stat-number" style="color: #dc3545;">${
              attemptData.attempt.violations || 0
            }</div>
            <div class="stat-label">Violations</div>
          </div>
          <div class="stat">
            <div class="stat-number" style="color: #007bff;">${Math.floor(
              attemptData.attempt.timeSpent / 60
            )}m ${attemptData.attempt.timeSpent % 60}s</div>
            <div class="stat-label">Time Spent</div>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an official admin view of student test result from QuizMaster platform.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return <div className="loading">Loading attempt data...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="btn btn-primary"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!attemptData) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2>Attempt Not Found</h2>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="btn btn-primary"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { user, attempt } = attemptData;

  return (
    <div className="container">
      <div className="card">
        <div className="flex justify-between align-center mb-20">
          <h1>👨‍🎓 Student Test Result - Admin View</h1>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="btn btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Student Information */}
        <div
          className="card"
          style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}
        >
          <h3>📋 Student Information</h3>
          <div className="grid grid-2">
            <div>
              <strong>👤 Name:</strong>
              <p>{user.name}</p>
            </div>
            <div>
              <strong>📧 Email:</strong>
              <p>{user.email}</p>
            </div>
            <div>
              <strong>📝 Test:</strong>
              <p>
                {attempt.testTitle} ({attempt.testId})
              </p>
            </div>
            <div>
              <strong>📅 Date:</strong>
              <p>{new Date(attempt.attemptedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Result Summary */}
        <div
          className="card text-center"
          style={{
            backgroundColor: getStatusColor(attempt.status),
            color: "white",
          }}
        >
          <h2>
            {getStatusIcon(attempt.status)}{" "}
            {getStatusMessage(attempt.status, attempt.percentage, 60)}
          </h2>
          <h3>
            Score: {attempt.score}/{attempt.totalQuestions} (
            {attempt.percentage}%)
          </h3>
        </div>

        {/* Statistics */}
        <div className="grid grid-4 mb-20">
          <div className="card text-center">
            <h4>Correct Answers</h4>
            <p style={{ fontSize: "24px", color: "#28a745" }}>
              {attempt.score}
            </p>
          </div>
          <div className="card text-center">
            <h4>Incorrect Answers</h4>
            <p style={{ fontSize: "24px", color: "#dc3545" }}>
              {attempt.totalQuestions - attempt.score}
            </p>
          </div>
          <div className="card text-center">
            <h4>Violations</h4>
            <p style={{ fontSize: "24px", color: "#dc3545" }}>
              {attempt.violations || 0}
            </p>
          </div>
          <div className="card text-center">
            <h4>Time Spent</h4>
            <p style={{ fontSize: "24px", color: "#007bff" }}>
              {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
            </p>
          </div>
        </div>

        {/* Detailed Results */}
        {attempt.status !== "disqualified" && attempt.results && (
          <div className="card">
            <h3>📊 Detailed Question Analysis</h3>
            {attempt.results.map((item, index) => (
              <div key={index} className="card">
                <h4>Question {index + 1}</h4>
                <p>
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
                      <span>{option}</span>
                      {optIndex === item.correctAnswer && (
                        <span
                          style={{
                            marginLeft: "auto",
                            color: "#28a745",
                            fontWeight: "600",
                          }}
                        >
                          ✓ Correct Answer
                        </span>
                      )}
                      {optIndex === item.selectedOption &&
                        optIndex !== item.correctAnswer && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: "#dc3545",
                              fontWeight: "600",
                            }}
                          >
                            ✗ Student's Answer
                          </span>
                        )}
                      {item.selectedOption === -1 &&
                        optIndex === item.correctAnswer && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: "#ffc107",
                              fontWeight: "600",
                            }}
                          >
                            ⚠️ Not Answered
                          </span>
                        )}
                    </div>
                  ))}
                </div>

                <div className="mt-20">
                  <span
                    className={`badge ${
                      item.isCorrect ? "badge-success" : "badge-danger"
                    }`}
                  >
                    {item.selectedOption === -1
                      ? "Not Answered"
                      : item.isCorrect
                      ? "Correct"
                      : "Incorrect"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-10 mt-20">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
          <button onClick={handlePrint} className="btn btn-secondary">
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserAttempt;
