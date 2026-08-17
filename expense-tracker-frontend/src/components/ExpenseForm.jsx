/**
 * ExpenseForm.jsx
 *
 * A form card for logging a new expense entry.
 *
 * Fields:
 *  - amount      : Decimal number (e.g., 12.50)
 *  - category    : Select from predefined list
 *  - description : Short text
 *  - date        : Date picker (defaults to today)
 *
 * On successful submit:
 *  - Calls onExpenseAdded() callback so the parent can refresh the list
 *    and the monthly total card.
 *  - Resets the form to its default state.
 */

import { useState } from "react";
import api from "../api/axiosInstance";

const CATEGORIES = [
  { value: "food", label: "🍔 Food & Dining" },
  { value: "transport", label: "🚗 Transport" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "health", label: "🏥 Health & Medical" },
  { value: "utilities", label: "💡 Utilities & Bills" },
  { value: "education", label: "📚 Education" },
  { value: "travel", label: "✈️ Travel" },
  { value: "other", label: "📦 Other" },
];

function todayString() {
  return new Date().toISOString().split("T")[0];
}

const DEFAULT_FORM = {
  amount: "",
  category: "food",
  description: "",
  date: todayString(),
};

export default function ExpenseForm({ onExpenseAdded }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear feedback when user starts editing
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Basic client-side validation
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/expenses/", {
        amount: form.amount,
        category: form.category,
        description: form.description,
        date: form.date,
      });

      setSuccess(true);
      setForm({ ...DEFAULT_FORM, date: todayString() });
      if (onExpenseAdded) onExpenseAdded();

      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const detail = err.response?.data;
      if (typeof detail === "object") {
        // Collect all field errors into one string
        const messages = Object.entries(detail)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join(" | ");
        setError(messages);
      } else {
        setError("Failed to save expense. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card expense-form-card">
      <h2 className="card-title">
        <span className="card-title-icon" aria-hidden="true">➕</span>
        Log Expense
      </h2>

      {/* Feedback messages */}
      {error && (
        <div className="auth-alert auth-alert-error" role="alert" style={{ marginBottom: "16px" }}>
          <span aria-hidden="true">⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="auth-alert auth-alert-success" role="status" style={{ marginBottom: "16px" }}>
          <span aria-hidden="true">✅</span> Expense logged successfully!
        </div>
      )}

      <form
        id="expense-form"
        className="expense-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Amount + Category */}
        <div className="expense-form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="expense-amount">
              Amount (₹)
            </label>
            <input
              id="expense-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expense-category">
              Category
            </label>
            <select
              id="expense-category"
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="expense-description">
            Description <span style={{ color: "var(--color-text-muted)" }}>(optional)</span>
          </label>
          <input
            id="expense-description"
            name="description"
            type="text"
            className="form-input"
            placeholder="What did you spend on?"
            value={form.description}
            onChange={handleChange}
            maxLength={255}
          />
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label" htmlFor="expense-date">
            Date
          </label>
          <input
            id="expense-date"
            name="date"
            type="date"
            className="form-input"
            value={form.date}
            onChange={handleChange}
            required
            aria-required="true"
            style={{ colorScheme: "dark" }}
          />
        </div>

        <button
          id="btn-log-expense"
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn-loading" aria-hidden="true" /> Logging...
            </>
          ) : (
            "💾 Log Expense"
          )}
        </button>
      </form>
    </div>
  );
}
