import React, { useContext, useState } from "react";
import { TransactionContext } from "../Context/TransactionContext";
import { incomeCategories, expenseCategories } from "../data/categories";
import "./TransactionHistory.css";
import { FaSearch } from "react-icons/fa" 

const TransactionList = () => {
  const { transactions, deleteTransaction } = useContext(TransactionContext);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categories = [...incomeCategories, ...expenseCategories].map(c => c.label);

  const filtered = transactions.filter((tx) => {
    const matchType = filterType === "all" || tx.type === filterType;
    const matchCategory = filterCategory === "all" || tx.category === filterCategory;
    const matchSearch = tx.text.toLowerCase().includes(search.toLowerCase());
    return matchType && matchCategory && matchSearch;
  });

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
          />
        </div>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
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
          {filtered.map(({ id, text, amount, category, type, date, notes, paymentMode, accountType }) => (
            <li key={id} className={`transaction-item ${type}`}>
              <div>
                <h4 className="typeIncomex">{text}</h4>
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
              <div className="amount">
                ₹{Math.abs(amount)}
                
              
              </div>
                <button className="delete-btn" onClick={() => deleteTransaction(id)}>❌</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;