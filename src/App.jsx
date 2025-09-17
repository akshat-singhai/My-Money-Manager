import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TransactionProvider } from "./Context/TransactionContext";
import NavBar from "./Components/NavBar";
import Dashboard from "./Components/Dashboard";
import TransactionList from "./Components/TransactionList";
import TransactionHistory from "./Components/TransactionHistory";
import FinanceTools from "./Components/finance-tools";
import BorrowLend from "./Components/BorrowLend";
import PersonRecords from "./Components/PersonRecords";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import ProtectedRoute from "./Components/ProtectedRoute";

import "./App.css";

function App() {
  const currentYear = new Date().getFullYear();
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true" || !!localStorage.getItem("currentUser")
  );

  // Update login state if localStorage changes in another tab or within app
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "isLoggedIn" || e.key === "currentUser") {
        setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true" || !!localStorage.getItem("currentUser"));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <TransactionProvider>
      <Router>
        <div className="app-container">
          {/* --- App Header --- */}
          <header className="app-header">
            <h1 className="heading3">💰 Money Manager</h1>
            <p className="tagline">Track, Save & Manage Your Finances</p>
          </header>

          {/* --- Navigation Bar (only if logged in) --- */}
          {isLoggedIn && <NavBar />}

          {/* --- Main Content --- */}
          <main className="app-main">
            <Suspense
              fallback={
                <div className="loading-container">
                  <div className="spinner" aria-hidden="true"></div>
                  <p>Loading your dashboard...</p>
                </div>

              }
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-transaction"
                  element={
                    <ProtectedRoute>
                      <TransactionList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <TransactionHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finance-tools"
                  element={
                    <ProtectedRoute>
                      <FinanceTools />
                    </ProtectedRoute>
                  }
                />
               
                <Route
                  path="/borrow-lend"
                  element={
                    <ProtectedRoute>
                      <BorrowLend />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/person/:name"
                  element={
                    <ProtectedRoute>
                      <PersonRecords />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<h2>404 - Page Not Found</h2>} />
              </Routes>
            </Suspense>
          </main>

          {/* --- Footer --- */}
          <footer className="footer">
            <p>
              Made with <span style={{ color: "red" }}>❤️</span> by{" "}
              <strong>Akshat Singhai</strong>
            </p>
            <p>© {currentYear} Money Manager. All Rights Reserved.</p>
          </footer>
        </div>
      </Router>
    </TransactionProvider>
  );
}
export default App;