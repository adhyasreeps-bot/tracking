/**
 * LoginPage.jsx
 *
 * Public page — authenticates an existing user via JWT.
 *
 * On successful login, the user is redirected to /dashboard.
 * If already logged in, the ProtectedRoute on /dashboard prevents
 * re-authentication, but we also add a guard here for UX.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already logged in, redirect away from login
  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page" id="login-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" aria-hidden="true">💸</div>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to track your expenses</p>

        {/* Error alert */}
        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span aria-hidden="true">⚠️</span> {error}
          </div>
        )}

        <form
          id="login-form"
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              aria-required="true"
            />
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? (
              <>
                <span className="btn-loading" aria-hidden="true" /> Signing in...
              </>
            ) : (
              "🔐 Sign In"
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>New here?</span>
        </div>

        <div className="auth-link-row">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link" id="link-go-register">
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}
