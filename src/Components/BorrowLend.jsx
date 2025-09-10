import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaUser,
  FaTrash,
  FaEdit,
  FaSearch,
  FaDownload,
  FaBalanceScale,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import "./BorrowLend.css";

////////////////////////////////////////////////////
// Utility: format numbers in INR
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
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem("borrowLendRecords");
      return saved ? JSON.parse(saved) : defaultRecords;
    } catch {
      return defaultRecords;
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "borrowed",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  // 🔹 Group by person & calculate net balance
  const accounts = records.reduce((acc, r) => {
    if (!acc[r.name]) acc[r.name] = { name: r.name, totalBorrowed: 0, totalLent: 0, records: [] };
    if (r.type === "borrowed") acc[r.name].totalBorrowed += r.amount;
    if (r.type === "lent") acc[r.name].totalLent += r.amount;
    acc[r.name].records.push(r);
    return acc;
  }, {});

  const accountList = Object.values(accounts).map((a) => ({
    ...a,
    netBalance: a.totalLent - a.totalBorrowed, // ✅ Net Balance
  }));

  // 🔹 Filter & Search
  const filtered = accountList.filter((acc) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return acc.name.toLowerCase().includes(q);
  });

  useEffect(() => {
    try {
      localStorage.setItem("borrowLendRecords", JSON.stringify(records));
    } catch {}
  }, [records]);

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
    if (!formData.name || !formData.amount) {
      toast.error("⚠️ Please provide name and amount");
      return;
    }

    // ✅ Prevent duplicate entry (same person + same type + same date + same amount)
    const duplicate = records.find(
      (r) =>
        r.name.toLowerCase() === formData.name.toLowerCase() &&
        r.type === formData.type &&
        Number(r.amount) === Number(formData.amount) &&
        r.date === formData.date
    );
    if (duplicate && !editId) {
      toast.error("🚫 Duplicate entry detected");
      return;
    }

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
  };

  const handleDeletePerson = (name) => {
    setRecords((prev) => prev.filter((r) => r.name !== name));
    toast.success(`🗑️ Deleted account of ${name}`);
  };

  const handleExport = () => {
    if (!filtered.length) {
      toast.error("No accounts to export");
      return;
    }
    const headers = ["Name", "Borrowed", "Lent", "Net Balance"];
    const rows = filtered.map((a) => [
      a.name,
      a.totalBorrowed,
      a.totalLent,
      a.netBalance,
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounts_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("📤 Export started");
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="borrow-lend-container">
        <h2>🏦Udhar</h2>

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
          <button className="bl-export-btn" onClick={handleExport}>
            <FaDownload /> Export
          </button>
        </div>

        {/* Accounts List */}
        <div className="records-list">
          <h3>Accounts</h3>
          {filtered.length === 0 ? (
            <p className="empty-msg">No accounts found. Add one!</p>
          ) : (
            <ul>
              <AnimatePresence>
                {filtered.map((acc) => (
                  <motion.li
                    key={acc.name}
                    className={`record-item account ${
                      acc.netBalance >= 0 ? "positive" : "negative"
                    }`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
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
                        Borrowed: {formatINR(acc.totalBorrowed)} | Lent:{" "}
                        {formatINR(acc.totalLent)}
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
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
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
                      setFormData({
                        ...formData,
                        amount: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        note: e.target.value,
                      })
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
                      setFormData({
                        ...formData,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="borrowed">Borrowed</option>
                    <option value="lent">Lent</option>
                  </select>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditId(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit">
                      {editId ? "Update" : "Save"}
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
