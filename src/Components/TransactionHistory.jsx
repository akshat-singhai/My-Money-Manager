import React, { useContext, useState, useEffect } from "react";
import { TransactionContext } from "../Context/TransactionContext";
import { incomeCategories, expenseCategories } from "../data/categories";
import "./TransactionHistory.css";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Reuleaux } from 'ldrs/react'
import 'ldrs/react/Reuleaux.css'
import 'ldrs/react/Grid.css';

const highlightText = (text, highlight) => {
  if (!highlight) return text;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <mark key={i} style={{ background: "#fbbf24", color: "#232946", padding: "0 2px", borderRadius: "3px" }}>{part}</mark>
    ) : (
      part
    )
  );
};

const TransactionList = () => {
  const { transactions, deleteTransaction } = useContext(TransactionContext);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = [...incomeCategories, ...expenseCategories].map(c => c.label);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000); // 1000ms
    return () => clearTimeout(timeout);
  }, []);
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const checkDark = () => setIsDarkMode(document.body.classList.contains('dark-mode'));
    checkDark();
    window.addEventListener('classChange', checkDark);
    // Optional: listen for manual toggles if you have a dark mode toggle
    return () => window.removeEventListener('classChange', checkDark);
  }, []);


  const filtered = transactions.filter((tx) => {
    const matchType = filterType === "all" || tx.type === filterType;
    const matchCategory = filterCategory === "all" || tx.category === filterCategory;
    const matchSearch = tx.text.toLowerCase().includes(search.toLowerCase());
    return matchType && matchCategory && matchSearch;
  });

  if (loading) {
    return (
      <div className="spinner-container" role="status" aria-label="Loading dashboard data">
        <Reuleaux
          size="60"
          stroke="9"
          strokeLength="0.55"
          bgOpacity=".1"
          speed="1.3"
          color={isDarkMode ? "#38bdf8" : "black"}
        />
      </div>
    );
  }

  return (
    <div className="transaction-list-container">
      <h3>Transaction History</h3>

      <div className="filters">
        <div className="SearchBox">
          <FaSearch /> Search by description:
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="Search by description"
          />
        </div>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} aria-label="Filter by type">
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category">
          <option value="all">All Categories</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="no-transactions">No matching transactions found.</p>
      ) : (
        <ul className="transaction-list">
          <AnimatePresence>
            {filtered.map(({ id, text, amount, category, type, date, notes, paymentMode, accountType }, idx) => (
              <motion.li
                key={id}
                className={`transaction-item ${type}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ delay: idx * 0.04, type: "spring", stiffness: 60 }}
              >
                <div>
                  <h4 className="typeIncomex">
                    {highlightText(text, search)}
                  </h4>
                  <span className="category">({category})</span>
                  <div className="type">{type ? type.toUpperCase() : ""}</div>
                  <div className="date">
                    {date ? new Date(date).toLocaleDateString() : ""}
                  </div>
                  <div className="payment-mode">
                    Payment Mode: {paymentMode ? paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1) : "N/A"}
                    {paymentMode === "account" && accountType && (
                      <span> ({accountType.charAt(0).toUpperCase() + accountType.slice(1)})</span>
                    )}
                  </div>
                  {notes && notes.trim() !== "" && (
                    <div className="notes" style={{ marginTop: "0.3rem", color: "#6366f1", fontStyle: "italic" }}>
                      📝 {notes}
                    </div>
                  )}
                </div>
                <div className="amount" title={type === "income" ? "Income" : "Expense"}>
                  ₹{Math.abs(amount)}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteTransaction(id)}
                  aria-label="Delete transaction"
                  title="Delete"
                  tabIndex={0}
                >❌</button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default TransactionList;
