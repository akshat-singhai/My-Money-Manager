// ...existing code...
import React, { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { TransactionContext } from "../Context/TransactionContext";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  CartesianGrid, LabelList
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

import { Reuleaux } from "ldrs/react";
import 'ldrs/react/Reuleaux.css';
import "./Dashboard.css";

const COLORS = ["#38bdf8", "#6366f1", "#fbbf24", "#ef4444", "#10b981", "#a21caf", "#f472b6", "#f59e42"];

const SummaryCard = React.memo(({ label, value, color }) => (
  <div className="summary-card" role="group" aria-label={`${label} summary`}>
    <span className="label">{label}:</span>
    <span className="value" style={{ color }}>₹{value}</span>
  </div>
));

const CustomPieChart = React.memo(({ data = [], title, chartId }) => (
  <motion.div
    id={chartId}
    className="chart-box"
    role="region"
    aria-labelledby={`${chartId}-title`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 12 }}
    transition={{ duration: 0.45 }}
  >
    <h3 id={`${chartId}-title`}>{title}</h3>
    {(!data || data.length === 0) ? (
      <p className="empty-chart">No data available.</p>
    ) : (
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
        <Legend />
      </PieChart>
    )}
  </motion.div>
));

const RecentTransactions = React.memo(({ transactions = [] }) => {
  const recentTransactions = useMemo(() =>
    (Array.isArray(transactions) ? [...transactions] : [])
      .slice(-5)
      .reverse()
      .map(tx => ({
        ...tx,
        id: tx.id ?? `${tx.date}-${tx.amount}-${(tx.text || tx.description || '').slice(0,12)}`.replace(/\s+/g, '-'),
        displayAmount: Math.abs(Number(tx.amount) || 0),
        displayAmountFormatted: Math.abs(Number(tx.amount) || 0).toLocaleString('en-IN'),
        isIncome: Number(tx.amount) > 0,
        displayDescription: tx.description || tx.text || "No Description",
        displayCategory: tx.category || "Other",
        formattedDate: tx.date ? new Date(tx.date).toLocaleDateString() : "No Date"
      })),
    [transactions]
  );

  return (
    <div className="recent-transactions" aria-live="polite">
      <h2 className="recent-transactions__heading">Recent Transactions</h2>
      {recentTransactions.length === 0 ? (
        <p className="recent-transactions__empty">No recent transactions.</p>
      ) : (
        <ul role="list" aria-label="Recent transactions" className="recent-transactions__list">
          {recentTransactions.map((tx, index) => (
            <motion.li
              role="listitem"
              tabIndex={0}
              key={tx.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 100, damping: 12 }}
              whileHover={{ scale: 1.01 }}
              className="recent-transactions__item"
            >
              <div className="recent-transactions__header">
                <span
                  className={`recent-transactions__badge ${tx.isIncome ? "recent-transactions__badge--income" : "recent-transactions__badge--expense"}`}
                  aria-label={tx.isIncome ? "Income transaction" : "Expense transaction"}
                >
                  {tx.isIncome ? "↑" : "↓"}
                </span>

                <div className="recent-transactions__info">
                  <p className="recent-transactions__description">{tx.displayDescription}</p>
                  <p className="recent-transactions__category">{tx.displayCategory}</p>
                </div>

                <div className="recent-transactions__amount-container">
                  <span
                    className={`recent-transactions__amount ${tx.isIncome ? "recent-transactions__amount--income" : "recent-transactions__amount--expense"}`}
                    aria-label={`${tx.isIncome ? 'Income' : 'Expense'} amount`}
                  >
                    {tx.isIncome ? "+" : "-"} ₹{tx.displayAmountFormatted}
                  </span>
                  <span className="recent-transactions__date" aria-label={`Transaction date: ${tx.formattedDate}`}>
                    {tx.formattedDate}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
});

const Dashboard = () => {
  const { transactions = [] } = useContext(TransactionContext) || {};
  const [loading, setLoading] = useState(true);
  const [showExpenseChart, setShowExpenseChart] = useState(false);
  const [showIncomeChart, setShowIncomeChart] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDark = () => setIsDarkMode(document.body.classList.contains('dark-mode'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const computed = useMemo(() => {
    let income = 0, expense = 0, inhand = 0, online = 0;
    const amounts = (Array.isArray(transactions) ? transactions : []).map(tx => {
      const amt = Number(tx?.amount) || 0;
      if (amt > 0) income += amt;
      else expense += amt;

      if (tx?.paymentMode === "cash") inhand += amt;
      else if (["online", "account"].includes(tx?.paymentMode)) online += amt;
      return amt;
    });
    const total = amounts.reduce((a, b) => a + b, 0);
    return { amounts, income, expense, inhand, online, total };
  }, [transactions]);

  const { income, expense, inhand, online, total } = computed;

  const getBreakdownData = (type) => {
    const list = (Array.isArray(transactions) ? transactions : []).filter(tx => type === 'income' ? Number(tx.amount) > 0 : Number(tx.amount) < 0);
    const acc = [];
    list.forEach(tx => {
      const category = tx?.category || "Other";
      const value = Math.abs(Number(tx.amount) || 0);
      const existing = acc.find(item => item.name === category);
      if (existing) existing.value += value;
      else acc.push({ name: category, value });
    });
    return acc;
  };

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = {};
    (Array.isArray(transactions) ? transactions : []).forEach(tx => {
      const date = new Date(tx?.date);
      if (isNaN(date)) return;
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (!data[key]) data[key] = { month: key, Income: 0, Expense: 0 };
      if (Number(tx.amount) > 0) data[key].Income += Number(tx.amount);
      else data[key].Expense += Math.abs(Number(tx.amount));
    });
    return Object.values(data).sort((a, b) => {
      const [mA, yA] = a.month.split(' ');
      const [mB, yB] = b.month.split(' ');
      const idxA = months.indexOf(mA);
      const idxB = months.indexOf(mB);
      if (yA !== yB) return Number(yA) - Number(yB);
      return idxA - idxB;
    });
  }, [transactions]);

  const chartData = useMemo(() => [
    { name: "Income", value: Number(income) },
    { name: "Expense", value: Math.abs(Number(expense)) }
  ], [income, expense]);

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
    <motion.main
      className="dashboard"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-label="Dashboard overview with charts and summary"
    >
      <h2 className="heading2">Dashboard</h2>

      <div className="balanceBox" aria-live="polite">
        <SummaryCard label="Total" value={total.toFixed(2)} color="tomato" />
        <div className="TransactionsBox"> Transactions: <span style={{ color: "#38bdf8", fontSize: "1.6rem" }}>{(transactions || []).length}</span></div>
        <SummaryCard label="Income" value={income.toFixed(2)} color="#10b981" />
        <SummaryCard label="Expense" value={Math.abs(expense).toFixed(2)} color="#ef4444" />
        <SummaryCard label="Inhand" value={inhand.toFixed(2)} color="#fbbf24" />
        <SummaryCard label="Online" value={online.toFixed(2)} color="#7c24e7" />
      </div>

      <div className="chart-container-box responsive-charts">
        <CustomPieChart data={chartData} title="Income vs Expense" chartId="income-expense-chart" />
        <RecentTransactions transactions={transactions} />

        <div className="chart-box">
          <button
            className="OpenBtn"
            onClick={() => setShowExpenseChart(p => !p)}
            aria-expanded={showExpenseChart}
            aria-controls="expense-chart"
            style={{ background: "#ef4444", color: "white" }}
            type="button"
          >
            {showExpenseChart ? "Close Expense Chart" : "Open Expense Chart"}
          </button>
          <AnimatePresence>
            {showExpenseChart && (
              <CustomPieChart data={getBreakdownData("expense")} title="Expense Breakdown" chartId="expense-chart" />
            )}
          </AnimatePresence>
        </div>

        <div className="chart-box">
          <button
            className="OpenBtn"
            onClick={() => setShowIncomeChart(p => !p)}
            aria-expanded={showIncomeChart}
            aria-controls="income-chart"
            style={{ background: "#10b981", color: "white" }}
            type="button"
          >
            {showIncomeChart ? "Close Income Chart" : "Open Income Chart"}
          </button>
          <AnimatePresence>
            {showIncomeChart && (
              <CustomPieChart data={getBreakdownData("income")} title="Income Breakdown" chartId="income-chart" />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bar-chart-section" aria-live="polite">
        <h3 className="heading2">Monthly Income & Expense</h3>
        {monthlyData.length === 0 ? (
          <p className="empty-chart">No monthly data to display.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#555" }} />
              <YAxis tick={{ fontSize: 12, fill: "#555" }} />
              <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} contentStyle={{ borderRadius: 8, padding: '8px 12px' }} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Income" fill="#10b981" radius={[6,6,0,0]}>
                <LabelList dataKey="Income" position="top" formatter={(val) => `₹${val}`} />
              </Bar>
              <Bar dataKey="Expense" fill="#ef4444" radius={[6,6,0,0]}>
                <LabelList dataKey="Expense" position="top" formatter={(val) => `₹${val}`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Floating buttons: link to transactions list and add transaction */}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999, display: 'flex', gap: 12, flexDirection: 'column-reverse' }}>
       

        <button
          onClick={() => navigate("/add-transaction")}
          aria-label="Add transaction"
          title="Add Transaction"
          className="fab-add"
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
            cursor: 'pointer'
          }}
          type="button"
        >
          <FaPlus size={18} />
        </button>
      </div>
    </motion.main>
  );
};

export default Dashboard;