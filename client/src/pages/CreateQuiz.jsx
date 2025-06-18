"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateQuiz = () => {
  const [testId, setTestId] = useState("");
  const [questions, setQuestions] = useState([
    {
      text: "",
      options: ["", ""],
      answer: 0,
      level: "medium",
    },
  ]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!testId.trim()) {
      newErrors.testId = "Quiz ID is required";
    }

    questions.forEach((question, qIndex) => {
      if (!question.text.trim()) {
        newErrors[`question_${qIndex}_text`] = "Question text is required";
      } else if (question.text.length < 10) {
        newErrors[`question_${qIndex}_text`] =
          "Question must be at least 10 characters";
      }

      question.options.forEach((option, oIndex) => {
        if (!option.trim()) {
          newErrors[`question_${qIndex}_option_${oIndex}`] =
            "Option cannot be empty";
        }
      });

      if (question.answer >= question.options.length) {
        newErrors[`question_${qIndex}_answer`] =
          "Invalid correct answer selection";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex][field] = value;
    setQuestions(updatedQuestions);

    // Clear related errors
    const errorKey = `question_${qIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: "" });
    }
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);

    // Clear related errors
    const errorKey = `question_${qIndex}_option_${oIndex}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: "" });
    }
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
      // Adjust answer index if necessary
      if (
        updatedQuestions[qIndex].answer >=
        updatedQuestions[qIndex].options.length
      ) {
        updatedQuestions[qIndex].answer = 0;
      }
      setQuestions(updatedQuestions);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", ""],
        answer: 0,
        level: "medium",
      },
    ]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, index) => index !== qIndex);
      setQuestions(updatedQuestions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      for (const question of questions) {
        await axios.post("http://localhost:5000/api/quiz/questions", {
          ...question,
          testId: testId.trim(),
        });
      }

      alert("Quiz created successfully!");
      navigate("/dashboard");
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || "Failed to create quiz",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Create New Quiz</h1>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error mb-20">{errors.general}</div>
          )}

          <div className="form-group">
            <label className="form-label">Quiz ID/Code</label>
            <input
              type="text"
              className="form-input"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              placeholder="Enter unique quiz code (e.g., MATH101)"
            />
            {errors.testId && <div className="error">{errors.testId}</div>}
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="card">
              <div className="flex justify-between align-center mb-20">
                <h3>Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="btn btn-danger"
                  >
                    Remove
                  </button>
                )}
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
                {errors[`question_${qIndex}_text`] && (
                  <div className="error">
                    {errors[`question_${qIndex}_text`]}
                  </div>
                )}
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
                <label className="form-label">Options</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex gap-10 align-center mb-20">
                    <input
                      type="radio"
                      name={`correct_${qIndex}`}
                      checked={question.answer === oIndex}
                      onChange={() =>
                        handleQuestionChange(qIndex, "answer", oIndex)
                      }
                    />
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
                        className="btn btn-danger"
                      >
                        ×
                      </button>
                    )}
                    {errors[`question_${qIndex}_option_${oIndex}`] && (
                      <div className="error">
                        {errors[`question_${qIndex}_option_${oIndex}`]}
                      </div>
                    )}
                  </div>
                ))}

                {question.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="btn btn-secondary"
                  >
                    Add Option
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between align-center mt-20">
            <button
              type="button"
              onClick={addQuestion}
              className="btn btn-secondary"
            >
              Add Question
            </button>

            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? "Creating Quiz..." : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;
