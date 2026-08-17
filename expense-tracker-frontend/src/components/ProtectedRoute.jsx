/**
 * ProtectedRoute.jsx
 *
 * A wrapper component that guards routes requiring authentication.
 *
 * Behavior:
 *  - While `loading` is true (checking localStorage on startup): render
 *    a centered spinner to avoid a flash of the login screen.
 *  - If `user` is null (not authenticated): redirect to /login.
 *  - If `user` is present: render the child route as-is.
 *
 * Usage in App.jsx:
 *   <Route
 *     path="/dashboard"
 *     element={
 *       <ProtectedRoute>
 *         <DashboardPage />
 *       </ProtectedRoute>
 *     }
 *   />
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still determining auth state — show a loading indicator
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated — render the protected content
  return children;
}
