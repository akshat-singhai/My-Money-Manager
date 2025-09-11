import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TransactionProvider } from "./context/TransactionContext";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Dashboard from "./components/Dashboard";
import TransactionList from "./components/TransactionList";
import TransactionHistory from "./components/TransactionHistory";
import FinanceTools from "./components/FinanceTools";
import BorrowLend from "./components/BorrowLend";
import PersonRecords from "./components/PersonRecords";
import Login from "./components/Login";

import "./styles/App.css";

function App() {
  const currentYear = new Date().getFullYear();

  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <div className="app-container">
            <header className="app-header">
              <h1 className="heading3">💰 Money Manager</h1>
              <p className="tagline">Track, Save & Manage Your Finances</p>
            </header>

            <NavBar />

            <main className="app-main">
              <Suspense
                fallback={
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading your dashboard...</p>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/add-transaction" element={<TransactionList />} />
                  <Route path="/history" element={<TransactionHistory />} />
                  <Route path="/finance-tools" element={<FinanceTools />} />
                  <Route path="/borrow-lend" element={<BorrowLend />} />
                  <Route path="/person/:name" element={<PersonRecords />} />
                  <Route path="*" element={<h2>404 - Page Not Found</h2>} />
                </Routes>
              </Suspense>
            </main>

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
    </AuthProvider>
  );
}

export default App;