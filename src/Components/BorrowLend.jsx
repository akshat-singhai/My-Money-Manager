// ...existing code...
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaSearch,
  FaDownload,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { Reuleaux } from "ldrs/react";
import "ldrs/react/Reuleaux.css";
import "./BorrowLend.css";
// ...existing code...

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
  const [isDarkMode] = useState(() => {
    // preserve API from previous file: simple detection from body class
    try {
      return document?.body?.classList?.contains?.("dark-mode") || false;
    } catch {
      return false;
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
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
  const accounts = records.reduce((acc, r) => {
    if (!acc[r.name]) acc[r.name] = { name: r.name, totalBorrowed: 0, totalLent: 0, records: [] };
    if (r.type === "borrowed") acc[r.name].totalBorrowed += Number(r.amount || 0);
    if (r.type === "lent") acc[r.name].totalLent += Number(r.amount || 0);
    acc[r.name].records.push(r);
    return acc;
  }, {});
  const accountList = Object.values(accounts).map((a) => ({
    ...a,
    netBalance: a.totalLent - a.totalBorrowed,
  }));

  const filtered = accountList.filter((acc) =>
    acc.name.toLowerCase().includes(search.toLowerCase())
  );

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
    if (!formData.name || formData.amount === "" || formData.amount === null) {
      toast.error("⚠️ Please provide name and amount");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      if (editId) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === editId ? { ...r, ...formData, amount: Number(formData.amount) } : r
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
    const rows = accountList.map((a) => [a.name, a.totalBorrowed, a.totalLent, a.netBalance]);
    if (!rows.length) {
      toast.error("No data to export");
      return;
    }
    const csv = [["Name", "Borrowed", "Lent", "Net"], ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounts_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  // initial loading screen
  if (loading) {
    return (
      <div className="spinner-container" role="status" aria-live="polite" style={{ padding: 28 }}>
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
        <h2>Udhari</h2>

        {/* Search + Controls */}
        <div className="records-controls">
          <div className="SearchBox">
            <FaSearch />
            <input
              aria-label="Search accounts"
              placeholder="Search person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="bl-export-btn" onClick={handleExport}>
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Accounts List */}
        <div className="records-list">
          <h3 className="summary-cards-text">Accounts</h3>
          {filtered.length === 0 ? (
            <p className="empty-msg">No accounts found. Add one!</p>
          ) : (
            <ul>
              <AnimatePresence>
                {filtered.map((acc) => (
                  <motion.li
                    key={acc.name}
                    className={`record-item account ${acc.netBalance >= 0 ? "positive" : "negative"}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    layout
                  >
                    <div className="avatar">{acc.name.charAt(0).toUpperCase()}</div>

                    <div className="record-details">
                      <Link to={`/person/${encodeURIComponent(acc.name)}`} className="record-name">
                        {acc.name}
                      </Link>
                      <span className="record-note">
                        Udhar Liya: {formatINR(acc.totalBorrowed)} | Udhar Diya: {formatINR(acc.totalLent)}
                      </span>
                    </div>

                    <div className="record-meta">
                      <span className={`record-amount ${acc.netBalance >= 0 ? "green" : "red"}`}>
                        {formatINR(acc.netBalance)}
                      </span>
                      <span className="record-date">Net Balance</span>
                    </div>

                    <div className="record-actions">
                      <button onClick={() => {
                        resetForm();
                        setFormData((s) => ({ ...s, name: acc.name }));
                        setEditId(null);
                        setShowForm(true);
                      }} title="Add record for person">
                        <FaPlus />
                      </button>

                      <button onClick={() => handleDeletePerson(acc.name)} title="Delete Account">
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
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <h3>{editId ? "✏️ Edit Record" : "➕ Add Record"}</h3>
                <form onSubmit={handleSaveRecord}>
                  <input
                    type="text"
                    placeholder="Person's Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="borrowed">Udhar Liya</option>
                    <option value="lent">Udhar Diya</option>
                  </select>

                  <div className="modal-actions" style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                    <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} disabled={saving}>
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {saving ? (
                        <Reuleaux size="18" stroke="3" strokeLength="0.6" color="#fff" speed="1.2" />
                      ) : editId ? "Update" : "Save"}
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
// ...existing code...