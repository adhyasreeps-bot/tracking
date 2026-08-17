/**
 * App.jsx
 *
 * Root application component.
 *
 * Responsibilities:
 *  - Wraps the entire app in <AuthProvider> so every component can
 *    call useAuth() to access the global auth state.
 *  - Defines client-side routes using React Router v6.
 *  - Applies <ProtectedRoute> to all routes that require authentication.
 *
 * Routes:
 *  /            → Redirect to /login
 *  /login       → LoginPage     (public)
 *  /register    → RegisterPage  (public)
 *  /dashboard   → DashboardPage (protected — requires login)
 *  *            → Redirect to /login (catch-all 404)
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect unknown paths to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
