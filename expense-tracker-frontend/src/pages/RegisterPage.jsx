/**
 * RegisterPage.jsx
 *
 * Public page — creates a new user account via POST /api/register/.
 *
 * After successful registration, the user is directed to /login
 * with a success message prompting them to sign in.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!form.username || !form.password) {
      setError("Username and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/register/", {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const detail = err.response?.data;
      if (typeof detail === "object") {
        const messages = Object.entries(detail)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join(" | ");
        setError(messages);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page" id="register-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" aria-hidden="true">💸</div>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start tracking your expenses today</p>

        {/* Feedback */}
        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span aria-hidden="true">⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="auth-alert auth-alert-success" role="status">
            <span aria-hidden="true">🎉</span> Account created! Redirecting to login…
          </div>
        )}

        <form
          id="register-form"
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-group">
            <label className="form-label" htmlFor="register-username">
              Username
            </label>
            <input
              id="register-username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email <span style={{ color: "var(--color-text-muted)" }}>(optional)</span>
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              aria-required="true"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
              aria-required="true"
            />
          </div>

          <button
            id="btn-register"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || success}
            style={{ marginTop: "8px" }}
          >
            {loading ? (
              <>
                <span className="btn-loading" aria-hidden="true" /> Creating account...
              </>
            ) : (
              "🚀 Create Account"
            )}
          </button>
        </form>

        <div className="auth-link-row" style={{ marginTop: "24px" }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-link" id="link-go-login">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
