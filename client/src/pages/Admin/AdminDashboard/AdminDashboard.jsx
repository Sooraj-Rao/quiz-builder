"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../../contexts/AdminContext";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [EditTestId, setEditTestId] = useState("");
  const [editingTest, setEditingTest] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [selectedTestForAnalytics, setSelectedTestForAnalytics] = useState("");
  const navigate = useNavigate();
  const { admin, logout } = useAdmin();

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, [admin, navigate]);

  const fetchData = async () => {
    try {
      const [usersRes, testsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users"),
        axios.get("http://localhost:5000/api/admin/tests"),
      ]);
      setUsers(usersRes.data);
      setTests(testsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (testId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/analytics/${testId}`
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const handleCreateTest = () => {
    setEditingTest({
      title: "",
      testId: "",
      description: "",
      timeLimit: 60,
      passPercentage: 60,
      questions: [
        {
          text: "",
          options: ["", ""],
          answer: 0,
          level: "medium",
        },
      ],
    });
    setShowTestModal(true);
  };

  const handleEditTest = (test) => {
    setEditingTest({ ...test });
    setEditTestId(test.testId);
    setShowTestModal(true);
  };

  console.log(editingTest);
  console.log(EditTestId);

  const handleSaveTest = async (e) => {
    e.preventDefault();
    try {
      if (editingTest._id) {
        await axios.put(
          `http://localhost:5000/api/admin/tests/${EditTestId}`,
          editingTest
        );
        setTests(
          tests.map((test) =>
            test._id === editingTest._id ? editingTest : test
          )
        );
        setEditingTest(null);
        setEditTestId("");
        fetchData();
      } else {
        const response = await axios.post(
          "http://localhost:5000/api/admin/tests",
          editingTest
        );
        setTests([response.data, ...tests]);
        setEditingTest(response.data);

        const link = `${window.location.origin}/test/${response.data.testId}`;
        alert(`Test created successfully!\n\nTest Link: ${link}?`);
        navigator.clipboard.writeText(link);
      }
      setShowTestModal(false);
      setEditingTest(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save test");
    }
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/tests/${testId}`);
        setTests(tests.filter((test) => test.testId !== testId));
      } catch (error) {
        alert(error.response?.data.message || "Failed to delete test");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm("Are you sure? This will delete the user permanently.")
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
        setUsers(users.filter((user) => user._id !== userId));
      } catch (error) {
        alert(error.response?.data.message || "Failed to delete user");
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${editingUser._id}`,
        {
          name: editingUser.name,
          email: editingUser.email,
        }
      );
      setUsers(
        users.map((user) => (user._id === editingUser._id ? editingUser : user))
      );
      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      alert(error.response?.data.message || "Failed to update user");
    }
  };

  const addQuestion = () => {
    setEditingTest({
      ...editingTest,
      questions: [
        ...editingTest.questions,
        {
          text: "",
          options: ["", ""],
          answer: 0,
          level: "medium",
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    if (editingTest.questions.length > 1) {
      const newQuestions = editingTest.questions.filter((_, i) => i !== index);
      setEditingTest({ ...editingTest, questions: newQuestions });
    }
  };

  const updateQuestion = (qIndex, field, value) => {
    const newQuestions = [...editingTest.questions];
    newQuestions[qIndex][field] = value;
    setEditingTest({ ...editingTest, questions: newQuestions });
  };

  const addOption = (qIndex) => {
    const newQuestions = [...editingTest.questions];
    if (newQuestions[qIndex].options.length < 6) {
      newQuestions[qIndex].options.push("");
      setEditingTest({ ...editingTest, questions: newQuestions });
    }
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...editingTest.questions];
    if (newQuestions[qIndex].options.length > 2) {
      newQuestions[qIndex].options.splice(oIndex, 1);
      if (newQuestions[qIndex].answer >= newQuestions[qIndex].options.length) {
        newQuestions[qIndex].answer = 0;
      }
      setEditingTest({ ...editingTest, questions: newQuestions });
    }
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...editingTest.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setEditingTest({ ...editingTest, questions: newQuestions });
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  const stats = {
    totalUsers: users.length,
    totalTests: tests.length,
    activeTests: tests.filter((t) => t.isActive).length,
    totalAttempts: tests.reduce((sum, test) => sum + test.totalAttempts, 0),
  };

  return (
    <div>
      <div className="admin-header">
        <div className="container">
          <div className="flex justify-between align-center">
            <div>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                Administrator Dashboard
              </h1>
              <p style={{ opacity: "0.8" }}>
                Manage users, tests, and view analytics
              </p>
            </div>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalTests}</div>
            <div className="stat-label">Total Tests</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.activeTests}</div>
            <div className="stat-label">Active Tests</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalAttempts}</div>
            <div className="stat-label">Total Attempts</div>
          </div>
        </div>

        <div className="card">
          <div
            className="flex gap-16 mb-24"
            style={{
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: "16px",
            }}
          >
            <button
              onClick={() => setActiveTab("users")}
              className={`btn ${
                activeTab === "users" ? "btn-primary" : "btn-outline"
              } btn-sm`}
            >
              👥 Manage Users
            </button>
            <button
              onClick={() => setActiveTab("tests")}
              className={`btn ${
                activeTab === "tests" ? "btn-primary" : "btn-outline"
              } btn-sm`}
            >
              📝 Manage Tests
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`btn ${
                activeTab === "analytics" ? "btn-primary" : "btn-outline"
              } btn-sm`}
            >
              📊 Analytics
            </button>
          </div>

          {activeTab === "users" && (
            <div>
              <h3 className="mb-20">User Management</h3>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Tests Taken</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td style={{ fontWeight: "600" }}>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className="badge badge-primary">
                            {user.testAttempts?.length || 0}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="flex gap-8">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="btn btn-warning btn-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "tests" && (
            <div>
              <div className="flex justify-between align-center mb-20">
                <h3>Test Management</h3>
                <button onClick={handleCreateTest} className="btn btn-primary">
                  + Create New Test
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Test ID</th>
                      <th>Questions</th>
                      <th>Time Limit</th>
                      <th>Status</th>
                      <th>Attempts</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test) => (
                      <tr key={test._id}>
                        <td style={{ fontWeight: "600" }}>{test.title}</td>
                        <td>
                          <span className="badge badge-primary">
                            {test.testId}
                          </span>
                        </td>
                        <td>{test.questions.length}</td>
                        <td>{test.timeLimit}m</td>
                        <td>
                          <span
                            className={`badge ${
                              test.isActive ? "badge-success" : "badge-danger"
                            }`}
                          >
                            {test.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{test.totalAttempts}</td>
                        <td>
                          <div className="flex gap-8">
                            <button
                              onClick={() => {
                                const link = `${window.location.origin}/test/${test.testId}`;
                                navigator.clipboard.writeText(link);
                                alert(`Test link copied to clipboard!`);
                              }}
                              className="btn btn-secondary btn-sm"
                              title="Copy test link"
                            >
                              🔗 Share
                            </button>
                            <button
                              onClick={() => handleEditTest(test)}
                              className="btn btn-warning btn-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTest(test.testId)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h3 className="mb-20">Test Analytics</h3>
              <div className="mb-20">
                <select
                  className="form-select"
                  value={selectedTestForAnalytics}
                  onChange={(e) => {
                    setSelectedTestForAnalytics(e.target.value);
                    if (e.target.value) {
                      fetchAnalytics(e.target.value);
                    }
                  }}
                >
                  <option value="">Select a test to view analytics</option>
                  {tests.map((test) => (
                    <option key={test._id} value={test.testId}>
                      {test.title} ({test.testId})
                    </option>
                  ))}
                </select>
              </div>

              {analytics.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Time Spent</th>
                        <th>Violations</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.map((attempt, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{attempt.userName}</strong>
                            <br />
                            <small>{attempt.userEmail}</small>
                          </td>
                          <td>
                            <strong>
                              {attempt.score}/{attempt.totalQuestions}
                            </strong>
                            <br />
                            <small>({attempt.percentage}%)</small>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                attempt.status === "completed"
                                  ? "badge-success"
                                  : attempt.status === "failed"
                                  ? "badge-warning"
                                  : "badge-danger"
                              }`}
                            >
                              {attempt.status}
                            </span>
                          </td>
                          <td>
                            {Math.floor(attempt.timeSpent / 60)}m{" "}
                            {attempt.timeSpent % 60}s
                          </td>
                          <td>
                            {attempt.violations > 0 ? (
                              <span
                                style={{ color: "#dc3545", fontWeight: "600" }}
                              >
                                {attempt.violations}
                              </span>
                            ) : (
                              <span style={{ color: "#28a745" }}>0</span>
                            )}
                          </td>
                          <td>
                            {new Date(attempt.attemptedAt).toLocaleDateString()}
                          </td>
                          <td>
                            <a
                              href={`/admin/test-result/${attempt.userId}/${attempt.attemptId}`}
                              className="btn btn-secondary btn-sm"
                              title="View attempt details"
                            >
                              📄 View Attempt
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showUserModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit User</h3>
              <button
                className="modal-close"
                onClick={() => setShowUserModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-12 justify-between">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTestModal && editingTest && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px", maxHeight: "90vh" }}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTest._id ? "Edit Test" : "Create New Test"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowTestModal(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSaveTest}
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              <div className="form-group">
                <label className="form-label">Test Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingTest.title}
                  onChange={(e) =>
                    setEditingTest({ ...editingTest, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Test ID (Code)</label>
                <input
                  type="text"
                  minLength={3}
                  className="form-input"
                  value={editingTest.testId}
                  onChange={(e) =>
                    setEditingTest({
                      ...editingTest,
                      testId: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., MATH101"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea
                  className="form-textarea"
                  value={editingTest.description}
                  onChange={(e) =>
                    setEditingTest({
                      ...editingTest,
                      description: e.target.value,
                    })
                  }
                  placeholder="Test description"
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingTest.timeLimit}
                    onChange={(e) =>
                      setEditingTest({
                        ...editingTest,
                        timeLimit: Number.parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="300"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pass Percentage (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingTest.passPercentage}
                    onChange={(e) =>
                      setEditingTest({
                        ...editingTest,
                        passPercentage: Number.parseInt(e.target.value),
                      })
                    }
                    min="10"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="flex justify-between align-center mb-16">
                  <label className="form-label">Questions</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn btn-secondary btn-sm"
                  >
                    + Add Question
                  </button>
                </div>

                {editingTest.questions.map((question, qIndex) => (
                  <div key={qIndex} className="card">
                    <div className="flex justify-between align-center mb-16">
                      <h4>Question {qIndex + 1}</h4>
                      {editingTest.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="btn btn-danger btn-sm"
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
                          updateQuestion(qIndex, "text", e.target.value)
                        }
                        placeholder="Enter your question here..."
                        required
                      />
                    </div>

                    {/* <div className="form-group">
                      <label className="form-label">Difficulty Level</label>
                      <select
                        className="form-select"
                        value={question.level}
                        onChange={(e) =>
                          updateQuestion(qIndex, "level", e.target.value)
                        }
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div> */}

                    <div className="form-group">
                      <div className="flex justify-between align-center mb-12">
                        <label className="form-label">
                          Options (Select correct answer)
                        </label>
                        {question.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="btn btn-secondary btn-sm"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>

                      {question.options.map((option, oIndex) => (
                        <div
                          key={oIndex}
                          className="flex gap-12 align-center mb-12"
                        >
                          <input
                            type="radio"
                            name={`correct_${qIndex}`}
                            checked={question.answer === oIndex}
                            onChange={() =>
                              updateQuestion(qIndex, "answer", oIndex)
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
                              updateOption(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            style={{ flex: 1 }}
                            required
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
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addQuestion}
                style={{ marginBottom: "10px" }}
                className="btn btn-secondary btn-sm "
              >
                + Add Question
              </button>
              <div className="flex gap-12 justify-between">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <div className="flex gap-12">
                  {editingTest._id && (
                    <button
                      type="button"
                      onClick={() => {
                        const link = `${window.location.origin}/test/${editingTest.testId}`;
                        navigator.clipboard.writeText(link);
                        alert(`Test link copied to clipboard!`);
                      }}
                      className="btn btn-success"
                    >
                      🔗 Copy Link
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingTest._id ? "Update Test" : "Create Test"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
