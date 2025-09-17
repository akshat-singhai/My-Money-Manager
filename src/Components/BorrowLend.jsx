// BorrowLend.jsx (Enhanced)
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaSearch,
  FaDownload,
  FaSortAmountUp,
  FaSortAmountDown,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { Reuleaux } from "ldrs/react";
import "ldrs/react/Reuleaux.css";
import "./BorrowLend.css";

// ===== Utility =====
const formatINR = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const defaultRecords = [
  {
    id: 1,
    name: "Rahul",
    type: "borrowed",
    amount: 5000,
    note: "For bike repair",
    date: "2025-09-05",
  },
  {
    id: 2,
    name: "Amit",
    type: "lent",
    amount: 3000,
    note: "Helped in rent",
    date: "2025-09-07",
  },
];

const BorrowLend = () => {
  // states
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem("borrowLendRecords");
      return saved ? JSON.parse(saved) : defaultRecords;
    } catch {
      return defaultRecords;
    }
  });
  const [isDarkMode] = useState(() =>
    document?.body?.classList?.contains?.("dark-mode") || false
  );
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(true); // initial loading spinner
  const [saving, setSaving] = useState(false); // save button spinner

  const [formData, setFormData] = useState({
    name: "",
    type: "borrowed",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  // simulate initial loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // persist records
  useEffect(() => {
    try {
      localStorage.setItem("borrowLendRecords", JSON.stringify(records));
    } catch {}
  }, [records]);

  // grouping accounts
  const accountList = useMemo(() => {
    const accounts = records.reduce((acc, r) => {
      if (!acc[r.name])
        acc[r.name] = {
          name: r.name,
          totalBorrowed: 0,
          totalLent: 0,
          records: [],
        };
      if (r.type === "borrowed")
        acc[r.name].totalBorrowed += Number(r.amount || 0);
      if (r.type === "lent")
        acc[r.name].totalLent += Number(r.amount || 0);
      acc[r.name].records.push(r);
      return acc;
    }, {});
    return Object.values(accounts).map((a) => ({
      ...a,
      netBalance: a.totalLent - a.totalBorrowed,
    }));
  }, [records]);

  // totals summary
  const summary = useMemo(() => {
    let borrowed = 0,
      lent = 0;
    records.forEach((r) =>
      r.type === "borrowed"
        ? (borrowed += Number(r.amount || 0))
        : (lent += Number(r.amount || 0))
    );
    return {
      borrowed,
      lent,
      net: lent - borrowed,
    };
  }, [records]);

  // filtering + sorting
  const filtered = useMemo(() => {
    let arr = accountList.filter((acc) =>
      acc.name.toLowerCase().includes(search.toLowerCase())
    );
    arr.sort((a, b) => {
      let v1 = a[sortBy],
        v2 = b[sortBy];
      if (typeof v1 === "string") {
        v1 = v1.toLowerCase();
        v2 = v2.toLowerCase();
      }
      if (v1 < v2) return sortDir === "asc" ? -1 : 1;
      if (v1 > v2) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [accountList, search, sortBy, sortDir]);

  const resetForm = () =>
    setFormData({
      name: "",
      type: "borrowed",
      amount: "",
      note: "",
      date: new Date().toISOString().split("T")[0],
    });

  const handleSaveRecord = (e) => {
    e.preventDefault();
    if (!formData.name || formData.amount === "") {
      toast.error("⚠️ Please provide name and amount");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      if (editId) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === editId
              ? { ...r, ...formData, amount: Number(formData.amount) }
              : r
          )
        );
        toast.success("✅ Record updated");
      } else {
        const newRecord = {
          id: Date.now(),
          ...formData,
          amount: Number(formData.amount),
        };
        setRecords((prev) => [...prev, newRecord]);
        toast.success("✅ Record added");
      }
      resetForm();
      setEditId(null);
      setShowForm(false);
      setSaving(false);
    }, 900);
  };

  const handleDeletePerson = (name) => {
    if (!window.confirm(`Remove all records for ${name}?`)) return;
    setRecords((prev) => prev.filter((r) => r.name !== name));
    toast.success(`🗑️ Deleted account of ${name}`);
  };

  const handleExport = () => {
    const rows = accountList.map((a) => [
      a.name,
      a.totalBorrowed,
      a.totalLent,
      a.netBalance,
    ]);
    if (!rows.length) {
      toast.error("No data to export");
      return;
    }
    const csv = [["Name", "Borrowed", "Lent", "Net"], ...rows]
      .map((row) =>
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounts_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  // ===== Loading =====
  if (loading) {
    return (
      <div className="spinner-container" role="status" style={{ padding: 28 }}>
        <Reuleaux
          size="60"
          stroke="9"
          strokeLength="0.55"
          bgOpacity=".08"
          speed="1.3"
          color={isDarkMode ? "#38bdf8" : "#111827"}
        />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="borrow-lend-container">
        <h2>📒 Udhari Tracker</h2>

        {/* Summary Section */}
        <div className="summary-cards">
          <motion.div className="summary-card borrowed" whileHover={{ scale: 1.05 }}>
            <span>Udhar Liya</span>
            <h3>{formatINR(summary.borrowed)}</h3>
          </motion.div>
          <motion.div className="summary-card lent" whileHover={{ scale: 1.05 }}>
            <span>Udhar Diya</span>
            <h3>{formatINR(summary.lent)}</h3>
          </motion.div>
          <motion.div
            className={`summary-card net ${summary.net >= 0 ? "positive" : "negative"}`}
            whileHover={{ scale: 1.05 }}
          >
            <span>Net Balance</span>
            <h3>{formatINR(summary.net)}</h3>
          </motion.div>
        </div>

        {/* Search + Controls */}
        <div className="records-controls">
          <div className="SearchBox">
            <FaSearch />
            <input
            className="search-input"
              aria-label="Search accounts"
              placeholder="Search person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="controls-buttons">
            <button className="bl-export-btn" onClick={handleExport}>
              <FaDownload /> Export
            </button>
            <button
              className="bl-sort-btn"
              onClick={() =>
                setSortDir((d) => (d === "asc" ? "desc" : "asc"))
              }
            >
              {sortDir === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
              Sort {sortBy}
            </button>
          </div>
        </div>

        {/* Accounts List */}
        <div className="records-list">
          <h3 className="summary-cards-text">Accounts</h3>
          {filtered.length === 0 ? (
            <p className="empty-msg">✨ No accounts found. Add one!</p>
          ) : (
            <ul>
              <AnimatePresence>
                {filtered.map((acc) => (
                  <motion.li
                    key={acc.name}
                    className={`record-item account ${
                      acc.netBalance >= 0 ? "positive" : "negative"
                    }`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    layout
                  >
                    <div className="avatar">
                      {acc.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="record-details">
                      <Link
                        to={`/person/${encodeURIComponent(acc.name)}`}
                        className="record-name"
                      >
                        {acc.name}
                      </Link>
                      <span className="record-note">
                        Udhar Liya: {formatINR(acc.totalBorrowed)} | Udhar
                        Diya: {formatINR(acc.totalLent)}
                      </span>
                    </div>

                    <div className="record-meta">
                      <span
                        className={`record-amount ${
                          acc.netBalance >= 0 ? "green" : "red"
                        }`}
                      >
                        {formatINR(acc.netBalance)}
                      </span>
                      <span className="record-date">Net Balance</span>
                    </div>

                    <div className="record-actions">
                      <button
                        onClick={() => {
                          resetForm();
                          setFormData((s) => ({ ...s, name: acc.name }));
                          setEditId(null);
                          setShowForm(true);
                        }}
                        title="Add record for person"
                      >
                        <FaPlus />
                      </button>

                      <button
                        onClick={() => handleDeletePerson(acc.name)}
                        title="Delete Account"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Floating Add Button */}
        <motion.button
          className="bl-fab fab-add"
          onClick={() => {
            resetForm();
            setEditId(null);
            setShowForm(true);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Add record"
        >
          <FaPlus />
        </motion.button>

        {/* Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal"
                role="dialog"
                aria-modal="true"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <h3>{editId ? "✏️ Edit Record" : "➕ Add Record"}</h3>
                <form onSubmit={handleSaveRecord}>
                  <input
                    type="text"
                    placeholder="Person's Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="borrowed">Udhar Liya</option>
                    <option value="lent">Udhar Diya</option>
                  </select>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditId(null);
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="save-btn"
                    >
                      {saving ? (
                        <Reuleaux
                          size="18"
                          stroke="3"
                          strokeLength="0.6"
                          color="#fff"
                          speed="1.2"
                        />
                      ) : editId ? (
                        "Update"
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BorrowLend;
