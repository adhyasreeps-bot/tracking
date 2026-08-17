/**
 * AuthContext.jsx
 *
 * Provides global authentication state for the entire application.
 *
 * What it stores:
 *   - `user`        : The decoded payload from the JWT (username, user_id, etc.)
 *                     or null if the user is not logged in.
 *   - `loading`     : True while we're checking localStorage on startup.
 *
 * What it exposes:
 *   - `login(username, password)`  : Calls the backend, stores tokens, sets user.
 *   - `logout()`                   : Clears tokens and resets user to null.
 *   - `user`                       : Current user info (or null).
 *   - `loading`                    : Boolean, true during initial token check.
 *
 * Usage:
 *   const { user, login, logout } = useAuth();
 */

import { createContext, useContext, useState, useEffect } from "react";
import api, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api/axiosInstance";

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Helper: decode JWT payload (no library needed) ────────────────────────
function decodeJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const json = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * On mount, check if a valid access token already exists in localStorage.
   * If so, decode it and restore the user session without re-login.
   */
  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      const decoded = decodeJwt(accessToken);
      // Check token is not expired
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(decoded);
      } else {
        // Token expired — clear storage (the interceptor handles refresh on demand)
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  /**
   * login()
   *
   * Calls POST /api/token/ with username + password.
   * On success: stores both tokens in localStorage, decodes the access token,
   * and sets the user in state.
   *
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   * @throws {Error} with a user-friendly message on failure
   */
  const login = async (username, password) => {
    try {
      const response = await api.post("/api/token/", { username, password });
      const { access, refresh } = response.data;

      // Persist tokens
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);

      // Decode access token to get user info
      const decoded = decodeJwt(access);
      setUser(decoded);
    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      throw new Error(msg);
    }
  };

  /**
   * logout()
   *
   * Clears tokens from localStorage and resets the user to null.
   * The ProtectedRoute will then redirect to /login.
   */
  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────
/**
 * useAuth — convenience hook for consuming the AuthContext.
 *
 * Must be used inside an <AuthProvider> tree.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
