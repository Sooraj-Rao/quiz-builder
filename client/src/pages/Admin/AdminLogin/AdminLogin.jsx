"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../../contexts/AdminContext";
import "./AdminLogin.css"; 

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { admin, login } = useAdmin();

  useEffect(() => {
    if (admin) {
      navigate("/admin/dashboard");
    }
  }, [admin, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setErrors({ general: result.message });
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1f2937, #374151)" }}
    >
      <div className="card" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="text-center mb-24">
          <h1 className="card-title"> Administrator Access</h1>
          <p className="card-subtitle">
            Enter administrator credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div
              className="error mb-20"
              style={{
                textAlign: "center",
                padding: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: "8px",
              }}
            >
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Administrator Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Administrator Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter admin password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Access Admin Panel"}
          </button>
        </form>

        <div className="text-center mt-24">
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            This is a restricted area for application administrators only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
