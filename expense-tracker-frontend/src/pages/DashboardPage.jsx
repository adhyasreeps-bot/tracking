/**
 * DashboardPage.jsx
 *
 * The main authenticated view of the application.
 *
 * Layout (3-section grid):
 *  ┌─────────────────────────────────────────────────────┐
 *  │              MonthlyCard (full width)               │
 *  ├────────────────────────┬────────────────────────────┤
 *  │      ExpenseForm       │       ExpenseList           │
 *  └────────────────────────┴────────────────────────────┘
 *
 * State management:
 *  - `refreshKey` is a counter that increments every time a new expense
 *    is added or deleted.  Both MonthlyCard and ExpenseList receive this
 *    key and re-fetch their data whenever it changes.
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MonthlyCard from "../components/MonthlyCard";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";

export default function DashboardPage() {
  const { user } = useAuth();
  // Increment to trigger re-fetch in child components
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <Navbar />

      <main className="dashboard" id="dashboard-page">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">
            {greeting()}, {user?.username} 👋
          </h1>
          <p className="dashboard-subtitle">
            Here's your expense overview for this month.
          </p>
        </header>

        {/* Dashboard Grid */}
        <section
          className="dashboard-grid"
          aria-label="Expense dashboard"
        >
          {/* Monthly Total — spans full width */}
          <MonthlyCard refreshKey={refreshKey} />

          {/* Expense Form */}
          <ExpenseForm onExpenseAdded={triggerRefresh} />

          {/* Expense List */}
          <ExpenseList
            refreshKey={refreshKey}
            onExpenseDeleted={triggerRefresh}
          />
        </section>
      </main>
    </>
  );
}
