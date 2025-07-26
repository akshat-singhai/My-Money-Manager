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
      <mark key={i} className="highlight-text">
        {part}
      </mark>
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const categories = [...incomeCategories, ...expenseCategories].map(c => c.label);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const checkDark = () => setIsDarkMode(document.body.classList.contains('dark-mode'));
    checkDark();
    window.addEventListener('classChange', checkDark);
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
          className="spinner-color"
        />
      </div>
    );
  }

  return (
    <div className="transaction-list-container">
      <h3>Transaction History</h3>

      <div className="filters">
        <div className="SearchBox">
          <FaSearch className="search-icon" /> 
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="Search by description"
            placeholder="Search by description..."
          />
        </div>

        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)} 
          aria-label="Filter by type"
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)} 
          aria-label="Filter by category"
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="no-transactions-container">
          <motion.p 
            className="no-transactions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="emoji">🔍</span> No matching transactions found
            <span className="hint">Try adjusting your search criteria</span>
          </motion.p>
        </div>
      ) : (
        <ul className="transaction-list">
          <AnimatePresence>
            {filtered.map(({ id, text, amount, category, type, date, notes, paymentMode, accountType }, idx) => {
              const formattedDate = date ? new Date(date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : 'Date not available';

              const isRecent = date ? (new Date().getTime() - new Date(date).getTime()) < (7 * 24 * 60 * 60 * 1000) : false;
              const isPremium = amount > 10000;

              return (
                <motion.li
                  key={id}
                  className={`transaction-item ${type} ${isPremium ? 'premium-transaction' : ''} ${isRecent ? 'recent-transaction' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    delay: idx * 0.03, 
                    type: "spring", 
                    stiffness: 300,
                    damping: 20
                  }}
                  whileHover={{ 
                    scale: 1.02,
                  }}
                  layout
                >
                  <div className="transaction-content">
                    <div className="transaction-header">
                      <h4 className="transaction-title">
                        {highlightText(text, search)}
                        {isPremium && <span className="premium-badge">✨</span>}
                        {isRecent && <span className="new-badge">NEW</span>}
                      </h4>
                      <div className={`amount-bubble ${type}`}>
                        <span className="amount-symbol">{type === 'income' ? '↑' : '↓'}</span>
                        ₹{Math.abs(amount).toLocaleString('en-IN')}
                        {isPremium && <span className="sparkle-effect">✧</span>}
                      </div>
                    </div>
                    
                    <div className="transaction-meta">
                      <span className="category-tag" title={category}>
                        {category.length > 15 ? `${category.substring(0, 15)}...` : category}
                      </span>
                      <span className={`type-tag ${type}`}>
                        {type ? type.toUpperCase() : ""}
                      </span>
                      <span className="date-tag" title={formattedDate}>
                        📅 {formattedDate}
                        {isRecent && <span className="pulse-dot"></span>}
                      </span>
                    </div>
                    
                    <div className="transaction-details">
                      <div className="payment-info">
                        <span className="payment-icon">💳</span>
                        <span className="payment-text">
                          {paymentMode ? 
                            `${paymentMode.charAt(0).toUpperCase()}${paymentMode.slice(1)}` : 
                            "Not specified"}
                          {paymentMode === "account" && accountType && (
                            <span className="account-type"> ({accountType.charAt(0).toUpperCase()}${accountType.slice(1)})</span>
                          )}
                        </span>
                      </div>
                      
                      {notes && notes.trim() !== "" && (
                        <div className="notes-container" title={notes}>
                          <span className="notes-icon">📝</span>
                          <p className="notes-text">
                            {notes.length > 50 ? `${notes.substring(0, 50)}...` : notes}
                            {notes.length > 50 && (
                              <button 
                                className="view-more-btn" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(notes);
                                }}
                              >
                                View more
                              </button>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <motion.button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTransaction(id);
                    }}
                    aria-label={`Delete transaction: ${text}`}
                    title={`Delete ${text}`}
                    whileHover={{ 
                      scale: 1.1,
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg 
                      className="delete-icon" 
                      viewBox="0 0 24 24" 
                      width="18" 
                      height="18"
                    >
                      <path 
                        className="delete-icon-path"
                        d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" 
                      />
                    </svg>
                  </motion.button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default TransactionList;