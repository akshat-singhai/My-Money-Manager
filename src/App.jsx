import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TransactionProvider } from "./Context/TransactionContext";
import NavBar from "./Components/NavBar";
import Dashboard from "./Components/Dashboard";
import TransactionList from "./Components/TransactionList";
import TransactionHistory from "./Components/TransactionHistory";
import FinanceTools from "./Components/finance-tools";
import BorrowLend from "./Components/BorrowLend";
import PersonRecords from "./Components/PersonRecords";

import "./App.css";

function App() {
  const currentYear = new Date().getFullYear();

  return (
    <TransactionProvider>
      <Router>
        <div className="app-container">
          {/* --- App Header --- */}
          <header className="app-header">
            <h1 className="heading3">💰 Money Manager</h1>
            <p className="tagline">Track, Save & Manage Your Finances</p>
          </header>

          {/* --- Navigation Bar --- */}
          <NavBar />

          {/* --- Main Content --- */}
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
                <Route path="/add-transaction" element={<TransactionList />} />
                <Route path="/history" element={<TransactionHistory />} />
                <Route path="/finance-tools" element={<FinanceTools />} />
                <Route path="/borrow-lend" element={<BorrowLend />} />
                 <Route path="/person/:name" element={<PersonRecords />} />
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
