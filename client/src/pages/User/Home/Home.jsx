"use client";

import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import { useAuth } from "../../../contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (user) {
    navigate("/dashboard");
  }
  return (
    <div className="home-container">
      <header className="home-hero">
        <div className="home-overlay">
          <h1 className="home-title">Online Examination Portal</h1>
          <p className="home-subtitle">
            Take tests, view results, and track your progress — all in one
            place.
          </p>
          <div className="home-buttons">
            <Link to="/login" className="btn btn-primary">
              Student Login
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Home;
