"use client";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            🎯 QuizMaster
          </Link>

          <div className="navbar-nav">
            {user ? (
              <>
                <Link to="/dashboard" className="navbar-link">
                  Dashboard
                </Link>
                <div className="navbar-user">
                  <span>👋 {user.name}</span>
                  <span className="badge badge-success">Student</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
