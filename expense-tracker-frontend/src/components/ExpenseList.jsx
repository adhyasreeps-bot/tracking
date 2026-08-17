/**
 * ExpenseList.jsx
 *
 * Displays a list of recent expense transactions for the current user.
 * Fetches from GET /api/expenses/ and re-fetches whenever `refreshKey` changes.
 *
 * Features:
 *  - Shows category emoji icon and color-coded badge.
 *  - Shows description, date, and amount.
 *  - Allows deleting an expense with a hover-visible ✕ button.
 *  - On delete, calls onExpenseDeleted() so the parent can refresh the
 *    monthly total card.
 */

import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

// Map category slugs to emoji icons and CSS classes
const CATEGORY_META = {
  food:          { icon: "🍔", className: "cat-food" },
  transport:     { icon: "🚗", className: "cat-transport" },
  shopping:      { icon: "🛍️", className: "cat-shopping" },
  entertainment: { icon: "🎬", className: "cat-entertainment" },
  health:        { icon: "🏥", className: "cat-health" },
  utilities:     { icon: "💡", className: "cat-utilities" },
  education:     { icon: "📚", className: "cat-education" },
  travel:        { icon: "✈️", className: "cat-travel" },
  other:         { icon: "📦", className: "cat-other" },
};

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAmount(amount) {
  return parseFloat(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ExpenseList({ refreshKey, onExpenseDeleted }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get("/api/expenses/")
      .then((res) => {
        if (!cancelled) {
          setExpenses(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load expenses.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/expenses/${id}/`);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      if (onExpenseDeleted) onExpenseDeleted();
    } catch {
      alert("Failed to delete expense. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-card expense-list-card">
      <h2 className="card-title">
        <span className="card-title-icon" aria-hidden="true">📋</span>
        Recent Transactions
        {!loading && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-muted)",
              fontWeight: 400,
            }}
          >
            {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
          </span>
        )}
      </h2>

      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="auth-alert auth-alert-error" role="alert">
          <span aria-hidden="true">⚠️</span> {error}
        </div>
      ) : expenses.length === 0 ? (
        <div className="expense-empty" role="status">
          <div className="expense-empty-icon" aria-hidden="true">💸</div>
          <p className="expense-empty-text">
            No expenses logged yet.<br />
            Add your first expense using the form!
          </p>
        </div>
      ) : (
        <ul className="expense-list" role="list" aria-label="Expense transactions">
          {expenses.map((expense, idx) => {
            const meta = CATEGORY_META[expense.category] || CATEGORY_META.other;
            return (
              <li
                key={expense.id}
                className="expense-item"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* Icon */}
                <div
                  className={`expense-item-icon ${meta.className}`}
                  aria-hidden="true"
                >
                  {meta.icon}
                </div>

                {/* Info */}
                <div className="expense-item-info">
                  <div className="expense-item-desc">
                    {expense.description || expense.category}
                  </div>
                  <div className="expense-item-meta">
                    <span className="expense-item-category">
                      {expense.category}
                    </span>
                    <span className="expense-item-date">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div
                  className="expense-item-amount"
                  aria-label={`₹${formatAmount(expense.amount)}`}
                >
                  -₹{formatAmount(expense.amount)}
                </div>

                {/* Delete */}
                <button
                  className="expense-item-delete"
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  aria-label={`Delete expense: ${expense.description || expense.category}`}
                  title="Delete"
                >
                  {deletingId === expense.id ? (
                    <span className="spinner spinner-sm" aria-hidden="true" />
                  ) : (
                    "✕"
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
