"use client";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="container">
            <h1>Master Knowledge Through Interactive Quizzes</h1>
            <p>
              Join thousands of learners and educators using QuizMaster to
              create engaging assessments, track progress, and make learning fun
              and effective.
            </p>
            {!user ? (
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Learning Today
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </div>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Continue to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="container">
        {/* Features Section */}
        <section className="features-section">
          <div className="section-header">
            <h2>Why Choose QuizMaster?</h2>
            <p>
              Everything you need to create, share, and take quizzes effectively
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick & Easy</h3>
              <p>
                Create professional quizzes in minutes with our intuitive
                drag-and-drop interface. No technical skills required.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Assessment</h3>
              <p>
                Multiple difficulty levels and instant feedback help learners
                understand their strengths and areas for improvement.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Results</h3>
              <p>
                Get detailed analytics and performance insights immediately
                after quiz completion with comprehensive breakdowns.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Easy Sharing</h3>
              <p>
                Share quizzes instantly with unique codes or direct links.
                Perfect for classrooms, training, or self-assessment.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>
                Take quizzes anywhere, anytime. Our responsive design works
                perfectly on all devices and screen sizes.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Secure & Reliable</h3>
              <p>
                Your data is protected with enterprise-grade security. Focus on
                learning while we handle the technical details.
              </p>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="how-it-works">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in three simple steps</p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Your Account</h3>
                <p>
                  Sign up as a student to take quizzes or as a teacher to create
                  and manage your own assessments.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Build or Join Quizzes</h3>
                <p>
                  Teachers can create custom quizzes with multiple-choice
                  questions. Students can join using quiz codes or links.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Learn & Improve</h3>
                <p>
                  Get instant feedback, track your progress, and identify areas
                  for improvement with detailed result analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Quizzes Created</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Questions Answered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">User Satisfaction</div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="use-cases">
          <div className="section-header">
            <h2>Perfect For Every Learning Environment</h2>
          </div>

          <div className="use-cases-grid">
            <div className="use-case-card">
              <div className="use-case-icon">🏫</div>
              <h3>Educational Institutions</h3>
              <p>
                Schools and universities use QuizMaster for assessments,
                homework, and interactive learning sessions.
              </p>
              <ul>
                <li>Classroom assessments</li>
                <li>Homework assignments</li>
                <li>Student progress tracking</li>
              </ul>
            </div>

            <div className="use-case-card">
              <div className="use-case-icon">🏢</div>
              <h3>Corporate Training</h3>
              <p>
                Companies leverage our platform for employee training,
                certification programs, and knowledge assessments.
              </p>
              <ul>
                <li>Employee onboarding</li>
                <li>Skill assessments</li>
                <li>Compliance training</li>
              </ul>
            </div>

            <div className="use-case-card">
              <div className="use-case-icon">👨‍💻</div>
              <h3>Personal Learning</h3>
              <p>
                Individual learners use QuizMaster for self-assessment, exam
                preparation, and skill development.
              </p>
              <ul>
                <li>Exam preparation</li>
                <li>Self-assessment</li>
                <li>Knowledge retention</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-container">
            <h2>Ready to Transform Your Learning Experience?</h2>
            <p>
              Join thousands of educators and learners who trust QuizMaster for
              their assessment needs.
            </p>
            {!user ? (
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </div>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
              </Link>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>QuizMaster</h4>
              <p>
                Making learning interactive and engaging through smart quiz
                technology.
              </p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <Link to="/register">Sign Up</Link>
                </li>
                <li>
                  <Link to="/login">Sign In</Link>
                </li>
                <li>
                  <a href="#features">Features</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>
                  <a href="#help">Help Center</a>
                </li>
                <li>
                  <a href="#contact">Contact Us</a>
                </li>
                <li>
                  <a href="#privacy">Privacy Policy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 QuizMaster. All rights reserved.</p>
            <Link to="/admin" className="admin-link">
              Administrator Access
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
