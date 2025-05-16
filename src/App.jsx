import React from "react";
import { TransactionProvider } from "./Context/TransactionContext";
import TransactionList from "./Components/TransactionList";
import Dashboard from "./Components/Dashboard";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TransactionHistory from "./Components/TransactionHistory";

import "./App.css";

function App() {
  return (
    <TransactionProvider>
      <Router>
        <div  className="app-container">
          <h1 className="heading3">Money Manager 💰</h1>
          <nav  className="nav-container">
            <Link to="/" className="nivBox">ADD Transaction</Link>
            <Link to="/Dashboard" className="nivBox">Dashboard</Link>
            <Link to="/history" className="nivBox">Transaction History</Link>
          </nav>
          <Routes>
            <Route path="/" element={<TransactionList />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/history" element={<TransactionHistory />} />
          </Routes>
          
          <div className="footer">
            <p>Made with ❤️ by [Akshat Singhai]</p>
            <p>© 2025 Money Manager</p>
            </div>

        </div>
      </Router>
    </TransactionProvider>
  );
}

export default App;