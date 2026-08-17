/**
 * MonthlyCard.jsx
 *
 * A large, prominent UI card that displays the total amount spent
 * by the current user in the current calendar month.
 *
 * Fetches from GET /api/expenses/monthly-total/ on mount and whenever
 * `refreshKey` changes (passed from parent after a new expense is added).
 */

import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MonthlyCard({ refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get("/api/expenses/monthly-total/")
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError("Could not load monthly total.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const today = new Date();
  const monthName = MONTH_NAMES[today.getMonth()];
  const year = today.getFullYear();

  // Format the total amount nicely
  const total = data ? parseFloat(data.total) : 0;
  const formattedTotal = total.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="monthly-card" role="region" aria-label="Monthly spending summary">
      <div className="monthly-card-top">
        <div>
          <div className="monthly-card-label">Total Spent</div>
          <div className="monthly-card-month">{monthName} {year}</div>
        </div>
        <div className="monthly-card-icon" aria-hidden="true">📊</div>
      </div>

      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner" />
        </div>
      ) : error ? (
        <p style={{ color: "var(--color-error)", fontSize: "var(--font-size-sm)" }}>
          {error}
        </p>
      ) : (
        <div
          className="monthly-total-amount"
          aria-label={`Total spent this month: ₹${formattedTotal}`}
        >
          <span className="monthly-total-currency">₹</span>
          {formattedTotal}
        </div>
      )}

      <div className="monthly-card-footer">
        <span aria-hidden="true">📅</span>
        <span>Tracking your expenses for {monthName} {year}</span>
      </div>
    </div>
  );
}
