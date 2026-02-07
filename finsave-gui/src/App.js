import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline } from "@mui/material";

import Nav from "./components/Nav";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import About from "./pages/AboutUs";
import Footer from "./components/Footer";
import Expenses from "./pages/Expenses";
import Settlements from "./pages/Settlements";
import Statistics from "./pages/Statistics";

// NEW: admin pages
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";

export default function App() {
  const [hasToken, setHasToken] = useState(Boolean(sessionStorage.getItem("auth_token")));
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return (JSON.parse(sessionStorage.getItem("auth_user") || "{}").role || "").toLowerCase() === "admin";
    } catch {
      return false;
    }
  });

  // Poll sessionStorage every second for token/role changes
  useEffect(() => {
    const check = () => {
      const token = sessionStorage.getItem("auth_token");
      setHasToken(Boolean(token));
      try {
        const role = (JSON.parse(sessionStorage.getItem("auth_user") || "{}").role || "").toLowerCase();
        setIsAdmin(role === "admin");
      } catch {
        setIsAdmin(false);
      }
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, []);

  // Simple admin route guard
  const RequireAdmin = ({ children }) =>
    isAdmin ? children : <Navigate to={hasToken ? "/home" : "/auth"} replace />;

  return (
    <Router>
      <CssBaseline />
      {hasToken && <Nav />}

      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<Auth />} />

        {/* Root -> send to admin dashboard if admin, else home (or auth if not logged) */}
        <Route
          path="/"
          element={
            hasToken ? <Navigate to={isAdmin ? "/admin" : "/home"} replace /> : <Navigate to="/auth" replace />
          }
        />

        {/* Regular app pages (home auto-redirects admins to /admin) */}
        <Route path="/home" element={isAdmin ? <Navigate to="/admin" replace /> : <Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/settlements" element={<Settlements />} />
        <Route path="/statistics" element={<Statistics />} />

        {/* Admin pages */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <UserManagement />
            </RequireAdmin>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={hasToken ? (isAdmin ? "/admin" : "/home") : "/auth"} replace />} />
      </Routes>

      {hasToken && <Footer />}
    </Router>
  );
}
