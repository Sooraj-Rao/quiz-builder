"use client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const isTest = pathname.includes("test");
  const isDashboard = pathname.includes("dashboard");
  const isAdminDashboard = pathname.includes("admin/dashboard");
  if (isTest || isAdminDashboard) return null;
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Online Examination Portal
          </Link>

          <div className="navbar-nav">
            {user ? (
              <>
                {!isDashboard && (
                  <Link to="/dashboard" className="navbar-link">
                    Dashboard
                  </Link>
                )}
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
