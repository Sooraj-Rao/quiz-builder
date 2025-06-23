/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [testHistory, setTestHistory] = useState([]);
  const [testCode, setTestCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTests();
    fetchTestHistory();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/tests");
      setTests(response.data);
    } catch {
      setError("Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/tests/user/history"
      );
      setTestHistory(response.data);
    } catch {
      console.error("Failed to fetch test history");
    }
  };

  const handleJoinTest = (e) => {
    e.preventDefault();
    if (testCode.trim()) {
      window.location.href = `/test/${testCode.trim()}`;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: "badge-success",
      failed: "badge-warning",
      disqualified: "badge-danger",
    };
    return badges[status] || "badge-secondary";
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: "🎉",
      failed: "😔",
      disqualified: "❌",
    };
    return icons[status] || "📊";
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Student Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      <div className="card">
        <h2>Join a Test</h2>
        <form onSubmit={handleJoinTest} className="flex gap-10 align-center">
          <input
            type="text"
            className="form-input"
            placeholder="Enter test code (e.g., MATH101)"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">
            Join Test
          </button>
        </form>
      </div>

      <div className="card">
        <h2>📊 Your Test History</h2>
        {testHistory.length === 0 ? (
          <div className="text-center p-24">
            <p style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
              No test attempts yet. Take your first test!
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Time Spent</th>
                  <th>Violations</th>
                </tr>
              </thead>
              <tbody>
                {testHistory.map((attempt, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{attempt.testTitle}</strong>
                      <br />
                      <small style={{ color: "var(--text-secondary)" }}>
                        {attempt.testId}
                      </small>
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
                        className={`badge ${getStatusBadge(attempt.status)}`}
                      >
                        {getStatusIcon(attempt.status)} {attempt.status}
                      </span>
                    </td>
                    <td>
                      {new Date(attempt.attemptedAt).toLocaleDateString()}
                    </td>
                    <td>
                      {Math.floor(attempt.timeSpent / 60)}m{" "}
                      {attempt.timeSpent % 60}s
                    </td>
                    <td>
                      {attempt.violations > 0 ? (
                        <span style={{ color: "#dc3545", fontWeight: "600" }}>
                          {attempt.violations}
                        </span>
                      ) : (
                        <span style={{ color: "#28a745" }}>0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
