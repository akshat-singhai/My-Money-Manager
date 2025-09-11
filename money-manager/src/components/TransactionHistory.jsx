// filepath: c:\Users\Dell\Desktop\My money-manager\money-manager\src\components\TransactionHistory.jsx
import React, { useContext, useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TransactionContext } from "../context/TransactionContext";
import { incomeCategories, expenseCategories } from "../data/categories";
import "./TransactionHistory.css";
import { FaSearch, FaPlus, FaDownload, FaCopy, FaPaperclip } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Reuleaux } from "ldrs/react";
import "ldrs/react/Reuleaux.css";

// Highlight matching search text
const highlightText = (text = "", highlight = "") => {
  if (!highlight) return text || "";
  try {
    const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = (text || "").split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="highlight-text">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  } catch {
    return text;
  }
};

const TransactionHistory = () => {
  const { transactions = [], deleteTransaction } = useContext(TransactionContext) || {};
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalNote, setModalNote] = useState("");
  const navigate = useNavigate();

  const categories = useMemo(
    () => [...(incomeCategories || []), ...(expenseCategories || [])].map((c) => c.label),
    []
  );

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const checkDark = () => setIsDarkMode(document.body.classList.contains("dark-mode"));
    checkDark();
    const obs = new MutationObserver(checkDark);
    try {
      obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    } catch {}
    return () => obs.disconnect();
  }, []);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    const list = (Array.isArray(transactions) ? transactions : []).filter((tx = {}) => {
      const type = tx.type || (Number(tx.amount) > 0 ? "income" : "expense");
      let matchType = filterType === "all" || type === filterType;

      if (filterType === "cash") matchType = tx.paymentMode === "cash";
      if (filterType === "account") matchType = tx.paymentMode === "account";

      const matchCategory = filterCategory === "all" || (tx.category || "Other") === filterCategory;
      const hay = ((tx.text || tx.description || "") + " " + (tx.notes || "")).toLowerCase();
      const matchSearch = !q || hay.includes(q);
      return matchType && matchCategory && matchSearch;
    });

    return list.slice().sort((a, b) => {
      const ta = a?.date ? new Date(a.date).getTime() : -Infinity;
      const tb = b?.date ? new Date(b.date).getTime() : -Infinity;
      return tb - ta;
    });
  }, [transactions, filterType, filterCategory, search]);

  // Download CSV
  const handleDownload = () => {
    if (!filtered.length) {
      alert("No transactions to download.");
      return;
    }
    const headers = [
      "Date",
      "Description",
      "Amount",
      "Type",
      "Category",
      "PaymentMode",
      "Notes",
      "Location",
      "Tags"
    ];
    const rows = filtered.map((tx) => [
      tx.date ? new Date(tx.date).toLocaleDateString("en-IN") : "",
      tx.text || tx.description || "",
      tx.amount,
      tx.type || (Number(tx.amount) > 0 ? "income" : "expense"),
      tx.category || "Other",
      tx.paymentMode || "",
      tx.notes || "",
      tx.location || "",
      (tx.tags || []).join(", ")
    ]);
    const csvContent = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="spinner-container" role="status" aria-label="Loading transactions">
        <Reuleaux
          size="60"
          stroke="9"
          strokeLength="0.55"
          bgOpacity=".08"
          speed="1.3"
          color={isDarkMode ? "#38bdf8" : "black"}
        />
      </div>
    );
  }

  return (
    <>
      <div className="transaction-list-container">
        <h3>Transaction History</h3>

        {/* --- Filters --- */}
        <div className="filters">
          <div className="SearchBox">
            <FaSearch className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              aria-label="Search by description or notes"
              placeholder="Search by description or notes..."
            />
          </div>

          <button
            className="download-btn"
            style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 6 }}
            onClick={handleDownload}
            title="Download filtered transactions as CSV"
          >
            <FaDownload /> Download
          </button>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter by type"
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="cash">Cash</option>
            <option value="account">Account</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter by category"
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* --- Transaction List --- */}
        {filtered.length === 0 ? (
          <div className="no-transactions-container">
            <motion.p
              className="no-transactions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <span className="emoji">🔍</span> No matching transactions found
              <span className="hint">Try adjusting your search criteria</span>
            </motion.p>

            <div className="empty-actions" style={{ marginTop: 12 }}>
              <button className="add-btn" onClick={() => navigate("/add-transaction")}>
                ➕ Add Transaction
              </button>
              <Link to="/transactions" className="view-all-link">
                View all
              </Link>
            </div>
          </div>
        ) : (
          <ul className="transaction-list" aria-live="polite">
            <AnimatePresence>
              {filtered.map((tx, idx) => {
                const {
                  id,
                  text = "",
                  amount = 0,
                  category = "Other",
                  type,
                  date,
                  notes = "",
                  paymentMode,
                  accountType,
                  recurring,
                  status = "Cleared",
                  frequency = "",
                  location = "",
                  tags = [],
                  attachments = []
                } = tx || {};

                const formattedDate = date
                  ? new Date(date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "No Date";

                const isRecent =
                  date && Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;
                const isPremium = Math.abs(Number(amount || 0)) > 10000;

                const allCategories = [...incomeCategories, ...expenseCategories];
                const matchedCategory =
                  allCategories.find((c) => c.label === category) || {
                    label: category,
                    icon: "📂",
                    color: "#9E9E9E"
                  };

                return (
                  <motion.li
                    key={id || `${idx}-${amount}-${date}`}
                    className={`transaction-item ${type || (amount > 0 ? "income" : "expense")} ${
                      isPremium ? "premium-transaction" : ""
                    } ${isRecent ? "recent-transaction" : ""}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      delay: idx * 0.02,
                      type: "spring",
                      stiffness: 300,
                      damping: 18
                    }}
                    layout
                  >
                    {/* --- Transaction Header --- */}
                    <div className="transaction-content">
                      <div className="transaction-header">
                        <h4 className="transaction-title">
                          {highlightText(text || tx.description || "No Description", search)}

                          {isPremium && <span className="premium-badge"> 💎 High Value</span>}
                          {isRecent && <span className="new-badge">✨ NEW</span>}
                          {recurring && (
                            <span className="recurring-badge">
                              🔄 {frequency ? frequency : "Recurring"}
                            </span>
                          )}
                        </h4>

                        <div
                          className={`amount-bubble ${
                            type || (amount > 0 ? "income" : "expense")
                          }`}
                          style={{ borderColor: matchedCategory.color }}
                        >
                          <span className="amount-symbol">
                            {(type || (amount > 0 ? "income" : "expense")) === "income"
                              ? "↑"
                              : "↓"}
                          </span>
                          ₹{Math.abs(Number(amount || 0)).toLocaleString("en-IN")}
                          {isPremium && <span className="sparkle-effect">✧</span>}
                        </div>
                      </div>

                      {/* --- Transaction Meta --- */}
                      <div className="transaction-meta">
                        <span
                          className="category-tag"
                          title={matchedCategory.description || category}
                          style={{ backgroundColor: matchedCategory.color + "22" }}
                        >
                          {matchedCategory.icon} {matchedCategory.label}
                        </span>

                        <span className={`type-tag ${type}`}>{(type || "").toUpperCase()}</span>

                        <span className={`status-tag ${status.toLowerCase()}`}>{status}</span>

                        <span className="date-tag" title={formattedDate}>
                          📅 {formattedDate}
                        </span>

                        {location && (
                          <span className="location-tag" title={`Location: ${location}`}>
                            🗺️ {location}
                          </span>
                        )}
                      </div>

                      {/* --- Payment, Notes, Tags, Attachments --- */}
                      <div className="transaction-details">
                        <div className="payment-info">
                          <span className="payment-icon">💳</span>
                          <span className="payment-text">
                            {paymentMode
                              ? `${paymentMode.charAt(0).toUpperCase()}${paymentMode.slice(1)}`
                              : "Not specified"}
                            {paymentMode === "account" && accountType && (
                              <span className="account-type">
                                {" "}
                                ({accountType.charAt(0).toUpperCase() + accountType.slice(1)})
                              </span>
                            )}
                          </span>
                        </div>

                        {notes && notes.trim() !== "" && (
                          <div className="notes-container" title={notes}>
                            <span className="notes-icon">📝</span>
                            <p className="notes-text">
                              {notes.length > 80 ? `${notes.substring(0, 80)}...` : notes}
                              {notes.length > 80 && (
                                <button
                                  className="view-more-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setModalNote(notes);
                                    setShowModal(true);
                                  }}
                                >
                                  View more
                                </button>
                              )}
                            </p>
                          </div>
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                          <div className="tags-container">
                            {tags.map((tag, i) => (
                              <span key={i} className="tag-pill">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Attachments */}
                        {attachments.length > 0 && (
                          <div className="attachments-container">
                            {attachments.map((file, i) => (
                              <a
                                key={i}
                                href={file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="attachment-link"
                                title="View attachment"
                              >
                                <FaPaperclip /> Attachment {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* --- Delete Button --- */}
                    <motion.button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${text || "transaction"}"?`))
                          deleteTransaction && deleteTransaction(id);
                      }}
                      aria-label={`Delete transaction: ${text}`}
                      title={`Delete ${text}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ✕
                    </motion.button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Floating Add Button */}
      <Link
        to="/add-transaction"
        aria-label="Add transaction"
        title="Add Transaction"
        className="th-fab-add"
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 9999,
          background: "#6366f1",
          color: "#fff",
          borderRadius: "50%",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          textDecoration: "none"
        }}
      >
        <FaPlus size={18} />
      </Link>

      {/* Notes Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="note-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="note-modal"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <h4>Note</h4>
              <div className="note-content">{modalNote}</div>
              <div className="note-actions">
                <button onClick={() => setShowModal(false)}>Close</button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(modalNote);
                    alert("Note copied to clipboard!");
                  }}
                  style={{ marginLeft: 10 }}
                >
                  <FaCopy /> Copy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TransactionHistory;