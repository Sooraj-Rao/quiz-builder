import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { AdminProvider } from "./contexts/AdminContext"
import Navbar from "./components/Navbar/Navbar"
import Home from "./pages/User/Home/Home"
import Login from "./pages/User/Login/Login"
import Register from "./pages/User/Register/Register"
import Dashboard from "./pages/User/Dashboard/Dashboard"
import TakeTest from "./pages/User/TakeTest/TakeTest"
import TestResult from "./pages/User/TestResult/TestResult"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLogin from "./pages/Admin/AdminLogin/AdminLogin"
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard"
import AdminTestResult from "./pages/Admin/AdminTestResult/AdminTestResult"

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
