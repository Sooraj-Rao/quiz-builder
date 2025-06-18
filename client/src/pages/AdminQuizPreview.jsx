"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin } from "../contexts/AdminContext";
import axios from "axios";

const AdminQuizPreview = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchQuestions();
  }, [testId, admin, navigate]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/quiz/${testId}/preview`
      );
      setQuestions(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz preview...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.close()} className="btn btn-primary">
            Close Preview
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2>Quiz Not Found</h2>
          <p>The quiz code "{testId}" does not exist or has no questions.</p>
          <button onClick={() => window.close()} className="btn btn-primary">
            Close Preview
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container">
      <div className="card">
        <div className="flex justify-between align-center mb-20">
          <h2>Quiz Preview: {testId}</h2>
          <div className="flex gap-12">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <button
              onClick={() => window.close()}
              className="btn btn-secondary btn-sm"
            >
              Close Preview
            </button>
          </div>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="card">
          <div className="flex justify-between align-center mb-20">
            <span className="btn btn-secondary" style={{ fontSize: "12px" }}>
              {currentQ.level.toUpperCase()}
            </span>
            <span className="badge badge-warning">ADMIN PREVIEW</span>
          </div>

          <h3 className="mb-20">{currentQ.text}</h3>

          <div>
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                className={`quiz-option ${
                  answers[currentQ._id] === index ? "selected" : ""
                }`}
                onClick={() => handleAnswerSelect(currentQ._id, index)}
              >
                <strong>{String.fromCharCode(65 + index)}.</strong> {option}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between align-center mt-20">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>

          <span>
            {Object.keys(answers).length} of {questions.length} answered
          </span>

          <button
            onClick={nextQuestion}
            disabled={currentQuestion === questions.length - 1}
            className="btn btn-primary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizPreview;
