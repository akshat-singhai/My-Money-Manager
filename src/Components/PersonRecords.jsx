import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaDownload, FaArrowLeft, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import "./BorrowLend.css";

const formatINR = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const PersonRecords = () => {
  const { name } = useParams();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: name,
    type: "borrowed",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Collapsible state
  const [collapsed, setCollapsed] = useState({ borrowed: false, lent: false });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("borrowLendRecords")) || [];
    setRecords(stored.filter((r) => r.name === name));
    setFormData((prev) => ({ ...prev, name })); // prefill name in modal
  }, [name]);

  const filtered = records
    .filter((r) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return r.note?.toLowerCase().includes(q) || String(r.amount).includes(q);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const borrowed = filtered.filter((r) => r.type === "borrowed");
  const lent = filtered.filter((r) => r.type === "lent");

  // Update localStorage and local state (keeps only this person's records in state)
  const updateLocalStorage = (newRecords) => {
    localStorage.setItem("borrowLendRecords", JSON.stringify(newRecords));
    setRecords(newRecords.filter((r) => r.name === name));
  };

  const handleExport = () => {
    if (!filtered.length) {
      toast.error("No records to export");
      return;
    }
    const headers = ["Type", "Amount", "Note", "Date", "Settled"];
    const rows = filtered.map((r) => [r.type, r.amount, r.note || "", r.date, r.settled ? "Yes" : "No"]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `records_${name}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  const handleSaveRecord = (e) => {
    e.preventDefault();
    if (!formData.amount) {
      toast.error("Please provide amount");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("borrowLendRecords")) || [];

    if (editId) {
      const updated = stored.map((r) =>
        r.id === editId ? { ...r, ...formData, amount: Number(formData.amount) } : r
      );
      updateLocalStorage(updated);
      toast.success("Record updated");
    } else {
      const newRecord = {
        id: Date.now(),
        ...formData,
        amount: Number(formData.amount),
      };
      stored.push(newRecord);
      updateLocalStorage(stored);
      toast.success("Record added");
    }

    setShowForm(false);
    setEditId(null);
    setFormData({ ...formData, amount: "", note: "", date: new Date().toISOString().split("T")[0] });
  };

  const handleEditRecord = (record) => {
    setFormData({ ...record });
    setEditId(record.id);
    setShowForm(true);
  };

  const handleDeleteRecord = (id) => {
    const stored = JSON.parse(localStorage.getItem("borrowLendRecords")) || [];
    const updated = stored.filter((r) => r.id !== id);
    updateLocalStorage(updated);
    toast.success("Record deleted");
  };

  // New: mark record as paid/settled (Pay Back)
  const handlePayBack = (id) => {
    const stored = JSON.parse(localStorage.getItem("borrowLendRecords")) || [];
    const updated = stored.map((r) =>
      r.id === id ? { ...r, settled: true, settledDate: new Date().toISOString().slice(0, 10) } : r
    );
    updateLocalStorage(updated);
    toast.success("Marked as settled (paid)");
  };

  // Totals consider only unsettled amounts for "to pay/receive"
  const borrowedTotal = borrowed.filter(r => !r.settled).reduce((a, b) => a + b.amount, 0);
  const lentTotal = lent.filter(r => !r.settled).reduce((a, b) => a + b.amount, 0);
  const netBalance = lentTotal - borrowedTotal;

  return (
    <>
      <Toaster position="top-right" />
      <div className="borrow-lend-container">
        <h2>📊 {name}’s Records</h2>

        {/* Summary Cards */}
        <div className="summary-cards">
          <motion.div className="summary-card borrowed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3>{borrowed.length} Borrowed</h3>
            <p>{formatINR(borrowedTotal)}</p>
          </motion.div>

          <motion.div className="summary-card lent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3>{lent.length} Lent</h3>
            <p>{formatINR(lentTotal)}</p>
          </motion.div>
        </div>

  {/* Summary */}
  <div className="summary-card">

    <p
      className={`net-balance ${netBalance > 0 ? "green" : netBalance < 0 ? "red" : "neutral"}`}
    >
      <strong>Net Balance:</strong> <b>₹{netBalance.toLocaleString()}</b> 
      {netBalance > 0 ? " (To Receive)" : netBalance < 0 ? " (To Pay)" : " (Settled)"}
    </p>
  </div>

        {/* Search + Export */}
        <div className="records-controls">
          <div className="SearchBox">
            <input
              type="text"
              placeholder="Search notes or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="bl-export-btn" onClick={handleExport}>
            <FaDownload /> Export
          </button>
        </div>

        {/* Borrowed Section */}
        <div className="records-section">
          <div
            className="records-section-header"
            onClick={() => setCollapsed((prev) => ({ ...prev, borrowed: !prev.borrowed }))}
          >
            <h3>Borrowed ({borrowed.length})</h3>
            {collapsed.borrowed ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {!collapsed.borrowed && (
            <ul className="records-list">
              <AnimatePresence>
                {borrowed.map((rec) => (
                  <motion.li
                    key={rec.id}
                    className="record-item borrowed"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                  >
                    <div className="avatar">{rec.name.charAt(0).toUpperCase()}</div>
                    <div className="record-details">
                      <span className="record-note">{rec.note || "—"}</span>
                      {rec.settled && <span className="settled-badge">Settled</span>}
                    </div>
                    <div className="record-meta">
                      <span className="record-amount red">{formatINR(rec.amount)}</span>
                      <span className="record-date">{rec.date}</span>
                    </div>
                    <div className="record-actions">
                      <button onClick={() => handleEditRecord(rec)} title="Edit"><FaEdit /></button>
                      <button onClick={() => handleDeleteRecord(rec.id)} title="Delete" className="record-delete-btn"><FaTrash /></button>

                      {/* Pay Back button - show only if not settled */}
                      {!rec.settled && (
                        <button onClick={() => handlePayBack(rec.id)} title="Pay Back" className="payback-btn">
                          <FaCheck />
                        </button>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Lent Section */}
        <div className="records-section">
          <div
            className="records-section-header"
            onClick={() => setCollapsed((prev) => ({ ...prev, lent: !prev.lent }))}
          >
            <h3>Lent ({lent.length})</h3>
            {collapsed.lent ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {!collapsed.lent && (
            <ul className="records-list">
              <AnimatePresence>
                {lent.map((rec) => (
                  <motion.li
                    key={rec.id}
                    className="record-item lent"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                  >
                    <div className="avatar">{rec.name.charAt(0).toUpperCase()}</div>
                    <div className="record-details">
                      <span className="record-note">{rec.note || "—"}</span>
                      {rec.settled && <span className="settled-badge">Settled</span>}
                    </div>
                    <div className="record-meta">
                      <span className="record-amount green">{formatINR(rec.amount)}</span>
                      <span className="record-date">{rec.date}</span>
                    </div>
                    <div className="record-actions">
                      <button onClick={() => handleEditRecord(rec)} title="Edit"><FaEdit /></button>
                      <button onClick={() => handleDeleteRecord(rec.id)} title="Delete" className="record-delete-btn"><FaTrash /></button>

                      {/* For lent records allow marking as received (payback from other) */}
                      {!rec.settled && (
                        <button onClick={() => handlePayBack(rec.id)} title="Mark Received" className="record-actions">
                          <FaCheck />
                        </button>
                      )}
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
            setFormData({ ...formData, amount: "", note: "", type: "borrowed" });
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
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                <h3>{editId ? "✏️ Edit Record" : "➕ Add Record"} for {name}</h3>
                <form onSubmit={handleSaveRecord}>
                  <input type="text" value={formData.name} readOnly />
                  <input type="number" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                  <input type="text" placeholder="Note (optional)" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="borrowed">Borrowed</option>
                    <option value="lent">Lent</option>
                  </select>

                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit">{editId ? "Update" : "Save"}</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button */}
        <Link to="/borrow-lend" className="bl-export-btn">
          <FaArrowLeft /> Back to All Records
        </Link>
      </div>
    </>
  );
};

export default PersonRecords;