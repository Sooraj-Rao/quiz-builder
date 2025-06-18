import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { AdminProvider } from "./contexts/AdminContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import TakeTest from "./pages/TakeTest"
import TestResult from "./pages/TestResult"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import AdminTestResult from "./pages/AdminTestResult"

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test/:testId"
                element={
                  <ProtectedRoute>
                    <TakeTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test-result"
                element={
                  <ProtectedRoute>
                    <TestResult />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/test-result/:userId/:attemptId" element={<AdminTestResult />} />
            </Routes>
          </div>
        </>
      </AdminProvider>
    </AuthProvider>
  )
}

export default App
