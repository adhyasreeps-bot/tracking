/**
 * Navbar.jsx
 *
 * Top navigation bar — always visible on authenticated pages.
 * Displays the app brand and the currently logged-in user with a logout button.
 */

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get initials for avatar
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="navbar-logo-icon" aria-hidden="true">💸</div>
          <span className="navbar-brand-name">ExpenseFlow</span>
        </div>

        {/* User + Actions */}
        <div className="navbar-actions">
          {user && (
            <div className="navbar-user">
              <div className="navbar-avatar" title={user.username}>
                {initials}
              </div>
              <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
                {user.username}
              </span>
            </div>
          )}
          <button
            id="btn-logout"
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <span aria-hidden="true">→</span> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
