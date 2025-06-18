"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditQuiz = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/quiz/admin/questions/${testId}`
      );
      setQuestions(response.data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[qIndex].options.length < 6) {
      updatedQuestions[qIndex].options.push("");
      setQuestions(updatedQuestions);
    }
  };

  const removeOption = (qIndex, oIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[qIndex].options.length > 2) {
      updatedQuestions[qIndex].options.splice(oIndex, 1);
      if (
        updatedQuestions[qIndex].answer >=
        updatedQuestions[qIndex].options.length
      ) {
        updatedQuestions[qIndex].answer = 0;
      }
      setQuestions(updatedQuestions);
    }
  };

  const saveQuestion = async (question) => {
    try {
      await axios.put(
        `http://localhost:5000/api/quiz/question/${question._id}`,
        {
          text: question.text,
          options: question.options,
          answer: question.answer,
          level: question.level,
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to save question: ${error.response?.data?.message}`
      );
    }
  };

  const deleteQuestion = async (questionId, qIndex) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/quiz/question/${questionId}`
        );
        const updatedQuestions = questions.filter(
          (_, index) => index !== qIndex
        );
        setQuestions(updatedQuestions);
      } catch (error) {
        alert("Failed to delete question");
      }
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(questions.map(saveQuestion));
      alert("All changes saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz for editing...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between align-center">
            <div>
              <h1 className="card-title">✏️ Edit Quiz: {testId}</h1>
              <p className="card-subtitle">{questions.length} questions</p>
            </div>
            <div className="flex gap-12">
              <button
                onClick={() => navigate("/dashboard")}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="btn btn-success"
              >
                {saving ? "Saving..." : "Save All Changes"}
              </button>
            </div>
          </div>
        </div>

        {questions.map((question, qIndex) => (
          <div key={question._id} className="card">
            <div className="flex justify-between align-center mb-20">
              <h3>Question {qIndex + 1}</h3>
              <button
                onClick={() => deleteQuestion(question._id, qIndex)}
                className="btn btn-danger btn-sm"
              >
                🗑️ Delete
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Question Text</label>
              <textarea
                className="form-textarea"
                value={question.text}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "text", e.target.value)
                }
                placeholder="Enter your question here..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <select
                className="form-select"
                value={question.level}
                onChange={(e) =>
                  handleQuestionChange(qIndex, "level", e.target.value)
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Options (Select the correct answer)
              </label>
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex gap-12 align-center mb-12">
                  <input
                    type="radio"
                    name={`correct_${qIndex}`}
                    checked={question.answer === oIndex}
                    onChange={() =>
                      handleQuestionChange(qIndex, "answer", oIndex)
                    }
                    style={{ width: "auto" }}
                  />
                  <div className="quiz-option-letter">
                    {String.fromCharCode(65 + oIndex)}
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, e.target.value)
                    }
                    placeholder={`Option ${oIndex + 1}`}
                    style={{ flex: 1 }}
                  />
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="btn btn-danger btn-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {question.options.length < 6 && (
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="btn btn-secondary btn-sm"
                >
                  ➕ Add Option
                </button>
              )}
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="text-center p-24">
            <p>No questions found for this quiz.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditQuiz;
