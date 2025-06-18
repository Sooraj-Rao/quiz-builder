"use client";

import { useLocation, useNavigate } from "react-router-dom";

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2>No Results Found</h2>
          <p>Please take a test first to see results.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
        return `Congratulations! You passed with ${percentage}%`;
      case "failed":
        return `You scored ${percentage}%. Required: ${passPercentage}%`;
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
        <title>Test Result</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .result-summary { 
            background: ${getStatusColor(result.status)}; 
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
          <h1>🎯 QuizMaster - Test Result</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="result-summary">
          <h2>${getStatusIcon(result.status)} ${getStatusMessage(
      result.status,
      result.percentage,
      result.passPercentage
    )}</h2>
          <h3>Final Score: ${result.score}/${result.total} (${
      result.percentage
    }%)</h3>
        </div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-number" style="color: #28a745;">${
              result.score
            }</div>
            <div class="stat-label">Correct Answers</div>
          </div>
          <div class="stat">
            <div class="stat-number" style="color: #dc3545;">${
              result.total - result.score
            }</div>
            <div class="stat-label">Incorrect Answers</div>
          </div>
          <div class="stat">
            <div class="stat-number" style="color: #dc3545;">${
              result.violations || 0
            }</div>
            <div class="stat-label">Violations</div>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an official test result from QuizMaster platform.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="container">
      <div className="card text-center">
        <h1>Test Results</h1>

        <div
          className="card"
          style={{
            backgroundColor: getStatusColor(result.status),
            color: "white",
            margin: "20px 0",
          }}
        >
          <h2>
            {getStatusIcon(result.status)}{" "}
            {getStatusMessage(
              result.status,
              result.percentage,
              result.passPercentage
            )}
          </h2>
          <h3>
            Score: {result.score}/{result.total} ({result.percentage}%)
          </h3>
        </div>

        <div className="grid grid-3 mb-20">
          <div className="card">
            <h4>Correct Answers</h4>
            <p style={{ fontSize: "24px", color: "#28a745" }}>{result.score}</p>
          </div>
          <div className="card">
            <h4>Incorrect Answers</h4>
            <p style={{ fontSize: "24px", color: "#dc3545" }}>
              {result.total - result.score}
            </p>
          </div>
          <div className="card">
            <h4>Violations</h4>
            <p style={{ fontSize: "24px", color: "#dc3545" }}>
              {result.violations || 0}
            </p>
          </div>
        </div>

        {result.status !== "disqualified" && (
          <div className="card">
            <h3>Detailed Results</h3>
            {result.results.map((item, index) => (
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
                        <span style={{ marginLeft: "auto", color: "#28a745" }}>
                          ✓ Correct
                        </span>
                      )}
                      {optIndex === item.selectedOption &&
                        optIndex !== item.correctAnswer && (
                          <span
                            style={{ marginLeft: "auto", color: "#dc3545" }}
                          >
                            ✗ Your Answer
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
                    {item.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-10 mt-20">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
          <button onClick={handlePrint} className="btn btn-secondary">
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResult;
