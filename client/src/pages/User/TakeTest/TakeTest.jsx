/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [violations, setViolations] = useState(0);
  const [violationTypes, setViolationTypes] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");

  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const violationTimeoutRef = useRef(null);
  const videoRef = useRef(null);

  const violationsRef = useRef(0);
  const violationTypesRef = useRef([]);

  useEffect(() => {
    fetchTest();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (violationTimeoutRef.current)
        clearTimeout(violationTimeoutRef.current);
      if (cameraStream)
        cameraStream.getTracks().forEach((track) => track.stop());
    };
  }, [testId]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (!testStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden)
        recordViolation("tab_switch", "Tab switching detected!");
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      recordViolation("right_click", "Right-click disabled during test!");
    };

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey &&
          ["c", "v", "a", "x", "u"].includes(e.key.toLowerCase())) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J"].includes(e.key))
      ) {
        e.preventDefault();
        recordViolation(
          "copy_attempt",
          "Keyboard shortcuts disabled during test!"
        );
      }
    };

    const handleSelectStart = (e) => {
      e.preventDefault();
      recordViolation("text_selection", "Text selection disabled during test!");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && testStarted) {
        recordViolation("tab_switch", "Exiting fullscreen detected!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testStarted]);

  const recordViolation = useCallback((type, message) => {
    const newCount = violationsRef.current + 1;
    violationsRef.current = newCount;
    violationTypesRef.current = [...violationTypesRef.current, type];

    setViolations(newCount);
    setViolationTypes(violationTypesRef.current);

    setWarningMessage(message);
    setShowWarning(true);

    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current);
    }

    violationTimeoutRef.current = setTimeout(() => {
      setShowWarning(false);
    }, 3000);

    if (newCount >= 3) {
      submitTest(true);
    }
  }, []);

  const fetchTest = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tests/${testId}`
      );
      setTest(response.data);
      setTimeLeft(response.data.timeLimit * 60);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load test");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      setCameraError(
        "Camera access denied. Test will continue without camera monitoring."
      );
    }
  };

  const startTest = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setTestStarted(true);
      startTimeRef.current = Date.now();
      await startCamera();

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitTest(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      alert("Please allow fullscreen mode to start the test");
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers({ ...answers, [questionIndex]: optionIndex });
  };

  const nextQuestion = () => {
    if (currentQuestion < test?.questions?.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitTest = async (forceSubmit = false) => {
    if (!forceSubmit) {
      const unanswered = test?.questions?.filter(
        (_, i) => answers[i] === undefined
      );
      if (unanswered.length > 0) {
        const confirm = window.confirm(
          `You have ${unanswered.length} unanswered questions. Submit anyway?`
        );
        if (!confirm) return;
      }
    }

    setSubmitting(true);

    try {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const formattedAnswers = test?.questions?.map(
        (_, index) => answers[index] ?? -1
      );

      const finalViolations = forceSubmit ? violationsRef.current : violations;
      const finalViolationTypes = forceSubmit
        ? violationTypesRef.current
        : violationTypes;

      const response = await axios.post(
        `http://localhost:5000/api/tests/${testId}/submit`,
        {
          answers: formattedAnswers,
          timeSpent,
          violations: finalViolations,
          violationTypes: finalViolationTypes,
        }
      );

      if (timerRef.current) clearInterval(timerRef.current);
      if (cameraStream)
        cameraStream.getTracks().forEach((track) => track.stop());
      if (document.fullscreenElement) await document.exitFullscreen();

      navigate("/test-result", { state: { result: response.data } });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit test");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="loading">Loading test...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container">
        <div className="card text-center">
          <h2>Test Not Found</h2>
          <p>The test "{testId}" does not exist or is inactive.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="container">
        <div className="card text-center">
          <h1>{test.title}</h1>
          {test.description && <p className="mb-20">{test.description}</p>}

          <div className="grid grid-2 mb-24">
            <div className="card">
              <h4>⏱️ Time Limit</h4>
              <p style={{ fontSize: "24px", color: "var(--primary-color)" }}>
                {test.timeLimit} minutes
              </p>
            </div>
            <div className="card">
              <h4>📝 Questions</h4>
              <p style={{ fontSize: "24px", color: "var(--primary-color)" }}>
                {test?.questions?.length}
              </p>
            </div>
          </div>

          <div
            className="card"
            style={{ backgroundColor: "#fff3cd", border: "1px solid #ffeaa7" }}
          >
            <h3 style={{ color: "#856404" }}>⚠️ Test Rules & Guidelines</h3>
            <ul
              style={{ textAlign: "left", color: "#856404", lineHeight: "1.8" }}
            >
              <li>🔒 Test will run in fullscreen mode</li>
              <li>📹 Camera monitoring will be enabled during the test</li>
              <li>🚫 Tab switching is strictly prohibited</li>
              <li>🚫 Text selection and copying is disabled</li>
              <li>🚫 Right-click and keyboard shortcuts are disabled</li>
              <li>
                ⚠️ More than 3 violations will result in automatic
                disqualification
              </li>
              <li>⏰ Test will auto-submit when time expires</li>
              <li>✅ Pass percentage: {test.passPercentage}%</li>
              <li>📝 You can only attempt this test once</li>
            </ul>
          </div>

          <button onClick={startTest} className="btn btn-primary btn-lg">
            🚀 Start Test
          </button>
        </div>
      </div>
    );
  }

  const currentQ = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test?.questions?.length) * 100;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f8fafc",
        overflow: "auto",
        userSelect: "none",
      }}
    >
      {showWarning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "#dc3545",
            color: "white",
            padding: "12px",
            textAlign: "center",
            zIndex: 1000,
            fontWeight: "600",
          }}
        >
          ⚠️ {warningMessage} (Violations: {violations}/3)
        </div>
      )}

      <div
        style={{
          position: "fixed",
          top: showWarning ? "60px" : "20px",
          right: "20px",
          zIndex: 999,
          backgroundColor: "white",
          border: "2px solid #007bff",
          borderRadius: "8px",
          padding: "8px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "4px",
            textAlign: "center",
          }}
        >
          📹 Camera Monitor
        </div>
        {cameraError ? (
          <div
            style={{
              width: "160px",
              height: "120px",
              backgroundColor: "#f8f9fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#dc3545",
              textAlign: "center",
              padding: "8px",
            }}
          >
            {cameraError}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{
              width: "160px",
              height: "120px",
              borderRadius: "4px",
              backgroundColor: "#000",
            }}
          />
        )}
      </div>

      <div
        className="container"
        style={{
          paddingTop: showWarning ? "60px" : "20px",
          paddingRight: "200px",
        }}
      >
        <div className="card">
          <div className="flex justify-between align-center mb-20">
            <h2>{test.title}</h2>
            <div className="flex gap-20 align-center">
              <div
                style={{
                  backgroundColor: timeLeft < 300 ? "#dc3545" : "#28a745",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "18px",
                }}
              >
                ⏱️ {formatTime(timeLeft)}
              </div>
              <span>
                Question {currentQuestion + 1} of {test?.questions?.length}
              </span>
              {violations > 0 && (
                <span
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                  }}
                >
                  ⚠️ Violations: {violations}/3
                </span>
              )}
            </div>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="card">
            <h3 className="mb-20">{currentQ.text}</h3>
            <div>
              {currentQ.options.map((option, index) => {
                console.log(answers[currentQuestion] === index);
                return (
                  <div
                    key={index}
                    className={`quiz-option ${
                      answers[currentQuestion] === index ? "selected" : ""
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                    style={{
                      cursor: "pointer",
                      borderColor:
                        answers[currentQuestion] === index &&
                        "var(--primary-color)",
                      background:
                        answers[currentQuestion] === index &&
                        " linear-gradient(135deg,rgba(79, 70, 229, 0.1),rgba(79, 70, 229, 0.05))",
                    }}
                  >
                    <div className="quiz-option-letter">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                );
              })}
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
              {Object.keys(answers).length} of {test?.questions?.length}{" "}
              answered
            </span>

            {currentQuestion === test?.questions?.length - 1 ? (
              <button
                onClick={() => submitTest(false)}
                disabled={submitting}
                className="btn btn-success"
              >
                {submitting ? "Submitting..." : "Submit Test"}
              </button>
            ) : (
              <button onClick={nextQuestion} className="btn btn-primary">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
