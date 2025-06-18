"use client";
import { useLocation, useNavigate } from "react-router-dom";

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2>No Results Found</h2>
          <p>Please take a quiz first to see results.</p>
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

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#28a745";
    if (percentage >= 60) return "#ffc107";
    return "#dc3545";
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  return (
    <div className="container">
      <div className="card text-center">
        <h1>Quiz Results</h1>

        <div
          className="card"
          style={{
            backgroundColor: getScoreColor(result.percentage),
            color: "white",
            margin: "20px 0",
          }}
        >
          <h2>
            Your Score: {result.score}/{result.total}
          </h2>
          <h3>
            {result.percentage}% - Grade: {getGrade(result.percentage)}
          </h3>
        </div>

        <div className="grid grid-2 mb-20">
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
        </div>

        <div className="card">
          <h3>Detailed Results</h3>
          {result.results.map((item, index) => (
            <div key={item.questionId} className="card">
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
                    <strong>{String.fromCharCode(65 + optIndex)}.</strong>{" "}
                    {option}
                    {optIndex === item.correctAnswer && " ✓ (Correct)"}
                    {optIndex === item.selectedOption &&
                      optIndex !== item.correctAnswer &&
                      " ✗ (Your Answer)"}
                  </div>
                ))}
              </div>

              <div className="mt-20">
                <span
                  className={`btn ${
                    item.isCorrect ? "btn-success" : "btn-danger"
                  }`}
                >
                  {item.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-10 mt-20">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary">
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
