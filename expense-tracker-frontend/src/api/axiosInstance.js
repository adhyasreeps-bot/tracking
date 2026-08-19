/**
 * axiosInstance.js
 *
 * A pre-configured Axios instance with:
 *  1. Base URL pointing to the Django backend.
 *  2. Request interceptor that attaches the current access token as a
 *     Bearer header on every outgoing request.
 *  3. Response interceptor that:
 *       a) Catches 401 Unauthorized responses.
 *       b) Calls the /api/token/refresh/ endpoint with the stored refresh token.
 *       c) Saves the new access token to localStorage.
 *       d) Retries the original failed request with the new token — all
 *          transparently, without the caller needing to do anything.
 */

import axios from "axios";

// ── Constants ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "https://tracking-1-zmxu.onrender.com";
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// ── Axios Instance ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ───────────────────────────────────────────────────
// Attach the stored access token to every request before it is sent.
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────
// On a 401 response, attempt a silent token refresh and retry the request.
let isRefreshing = false;
// Queue of requests that arrived while a refresh was already in progress
let failedQueue = [];

/**
 * Process the failed request queue after a refresh attempt.
 * @param {Error|null} error - null on success, error on failure
 * @param {string|null} token - new access token on success
 */
function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  // Pass successful responses through unchanged
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors that haven't already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is already in flight — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        // No refresh token available — force logout
        processQueue(error, null);
        isRefreshing = false;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Call the Django refresh endpoint directly (not through the intercepted
        // instance, to avoid an infinite refresh loop)
        const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh;

        // Persist the new tokens
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        // Update default headers for future requests
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        // Unblock the queue with the new token
        processQueue(null, newAccessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear tokens and force logout
        processQueue(refreshError, null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY };
