import React, { Suspense } from "react";
import { TransactionProvider } from "./Context/TransactionContext";
import TransactionList from "./Components/TransactionList";
import Dashboard from "./Components/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TransactionHistory from "./Components/TransactionHistory";
import FinanceTools from "./Components/finance-tools";
import "./Components/TransactionList.jsx";
import NavBar from "./Components/NavBar";
import "./App.css";

function App() {
  return (
    <TransactionProvider>
      <Router>
        <div className="app-container">
          <h1 className="heading3">Money Manager 💰</h1>
          <NavBar />
          <Suspense fallback={<div style={{textAlign: "center", margin: "2rem"}}>Loading...</div>}>
            <Routes>
             
              <Route path="/" element={<Dashboard />} />
               <Route path="/add-transaction" element={<TransactionList />} /> 
              <Route path="/history" element={<TransactionHistory />} />
              <Route path="/finance-tools" element={<FinanceTools />} />
              <Route path="*" element={<h2>Page Not Found</h2>} />
            </Routes>
          </Suspense>
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