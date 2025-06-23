"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role === "admin") {
          setAdmin({
            id: "admin",
            name: "Administrator",
            email: payload.email,
            role: "admin",
          });
        }
      } catch {
        localStorage.removeItem("adminToken");
        delete axios.defaults.headers.common["Authorization"];
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("adminToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setAdmin(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    delete axios.defaults.headers.common["Authorization"];
    setAdmin(null);
  };

  const value = {
    admin,
    login,
    logout,
    loading,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
