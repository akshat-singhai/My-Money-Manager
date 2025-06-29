import React, { useContext, useState, useEffect, useMemo, lazy, Suspense } from "react";
import { TransactionContext } from "../Context/TransactionContext";
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Grid } from 'ldrs/react';
import 'ldrs/react/Grid.css';
import "./Dashboard.css";

const SummaryCard = React.memo(({ label, value, color }) => (
  <div className="summary-card">
    <span className="label">{label}:</span>
    <span className="value" style={{ color }}>₹{value}</span>
  </div>
));

const CustomPieChart = React.memo(({ data, title, chartId }) => (
  <motion.div
    id={chartId}
    className="chart-box"
    role="region"
    aria-labelledby={`${chartId}-title`}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 30 }}
    transition={{ duration: 0.5 }}
  >
    <h3 id={`${chartId}-title`}>{title}</h3>
    {data.length === 0 ? <p>No data available.</p> : (
      <PieChart width={300} height={300}>
        <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    )}
  </motion.div>
));

const RecentTransactions = React.memo(({ transactions }) => (
  <div className="recent-transactions">
    <h3 className="heading2">Recent Transactions</h3>
    {transactions.length === 0 ? (
      <p className="transaction-title">No recent transactions.</p>
    ) : (
      <ul role="list" aria-label="Recent transactions">
        {transactions.slice(-5).reverse().map((tx, index) => (
          <motion.li
            role="listitem"
            tabIndex="0"
            key={index}
            initial={{ opacity: 0, rotateZ: 6 }}
            animate={{ opacity: 1, rotateZ: 0 }}
            transition={{ delay: index * 0.08, type: "spring", stiffness: 60 }}
            whileHover={{ scale: 1.04, rotateZ: -2, rotateY: 2 }}
          >
            <span
              className={`badge bumzi ${tx.amount > 0 ? "badge-income" : "badge-expense"}`}
              aria-label={tx.amount > 0 ? "Income transaction" : "Expense transaction"}
            >
              {tx.amount > 0 ? "+" : "-"} <span className="badge-amount">₹{Math.abs(tx.amount)}</span>
            </span>
            <strong>{tx.description || tx.text || "No Description"}:</strong> <b className={`transaction-amount ${tx.amount > 0 ? "income" : "expense"}`}> ₹{Math.abs(tx.amount)}</b> -<b className="transaction-category"> {tx.category || "Other"}</b>
          </motion.li>
        ))}
      </ul>
    )}
  </div>
));

const COLORS = ["#38bdf8", "#6366f1", "#fbbf24", "#ef4444", "#10b981", "#a21caf", "#f472b6", "#f59e42"];

const Dashboard = () => {
  const { transactions } = useContext(TransactionContext);
  const [loading, setLoading] = useState(true);
  const [showExpenseChart, setShowExpenseChart] = useState(false);
  const [showIncomeChart, setShowIncomeChart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const computed = useMemo(() => {
    let income = 0, expense = 0, inhand = 0, online = 0;
    const amounts = transactions.map(tx => {
      const amt = tx.amount;
      if (amt > 0) income += amt;
      else expense += amt;

      if (tx.paymentMode === "cash") inhand += amt;
      else if (["online", "account"].includes(tx.paymentMode)) online += amt;
      return amt;
    });
    const total = amounts.reduce((a, b) => a + b, 0);
    return { amounts, income, expense, inhand, online, total };
  }, [transactions]);

  const { income, expense, inhand, online, total } = computed;

  const getBreakdownData = (type) => transactions.filter(tx => type === 'income' ? tx.amount > 0 : tx.amount < 0).reduce((acc, tx) => {
    const category = tx.category || "Other";
    const value = Math.abs(tx.amount);
    const existing = acc.find(item => item.name === category);
    existing ? existing.value += value : acc.push({ name: category, value });
    return acc;
  }, []);

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = {};
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      if (isNaN(date)) return;
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (!data[key]) data[key] = { month: key, Income: 0, Expense: 0 };
      tx.amount > 0 ? data[key].Income += tx.amount : data[key].Expense += Math.abs(tx.amount);
    });
    return Object.values(data);
  }, [transactions]);

  const chartData = useMemo(() => [
    { name: "Income", value: income },
    { name: "Expense", value: Math.abs(expense) }
  ], [income, expense]);

  if (loading) {
    return <div className="spinner-container" role="status" aria-label="Loading dashboard data"><Grid size="60" speed="1.5" color="black" /></div>;
  }

  return (
    <motion.main
      className="dashboard"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      role="main"
      aria-label="Dashboard overview with charts and summary"
    >
      <h2 className="heading2">Dashboard</h2>

      <div className="balanceBox" aria-live="polite">
        <SummaryCard label="Total" value={total.toFixed(2)} color="tomato" />
        <div className="TransactionsBox">Total Transactions: <span style={{ color: "#38bdf8" }}>{transactions.length}</span></div>
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

      <div className="bar-chart-section">
        <h3 className="heading2">Monthly Income & Expense</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Income" fill="#10b981" />
            <Bar dataKey="Expense" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.main>
  );
};

export default Dashboard;
