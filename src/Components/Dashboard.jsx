    import React, { useContext, useState, useEffect, useMemo, lazy, Suspense } from "react";
import { TransactionContext } from "../Context/TransactionContext";
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Grid } from 'ldrs/react';
import 'ldrs/react/Grid.css';
import "./Dashboard.css";

const ExpenseChart = lazy(() => import("./ExpenseChart"));

const COLORS = ["#38bdf8", "#6366f1", "#fbbf24", "#ef4444", "#10b981", "#a21caf", "#f472b6", "#f59e42"];

function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue((target * progress).toFixed(2));
      if (progress < 1) requestAnimationFrame(animate);
      else setValue(Number(target).toFixed(2));
    }
    animate(startTime);
  }, [target]);
  return value;
}

const getIncomeData = (transactions) => {
  return transactions.filter(tx => tx.amount > 0).reduce((acc, tx) => {
    const category = tx.category || "Other";
    const existing = acc.find((item) => item.name === category);
    if (existing) {
      existing.value += Math.abs(tx.amount);
    } else {
      acc.push({ name: category, value: Math.abs(tx.amount) });
    }
    return acc;
  }, []);
};

const getExpenseData = (transactions) => {
  return transactions.filter(tx => tx.amount < 0).reduce((acc, tx) => {
    const category = tx.category || "Other";
    const existing = acc.find((item) => item.name === category);
    if (existing) {
      existing.value += Math.abs(tx.amount);
    } else {
      acc.push({ name: category, value: Math.abs(tx.amount) });
    }
    return acc;
  }, []);
};

const getMonthlyData = (transactions) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = {};
  transactions.forEach(tx => {
    const date = new Date(tx.date);
    if (isNaN(date)) return;
    const key = `${months[date.getMonth()]} ${date.getFullYear()}`; // ✅ Fixed
    if (!data[key]) data[key] = { month: key, Income: 0, Expense: 0 };
    if (tx.amount > 0) data[key].Income += Math.abs(tx.amount);
    else data[key].Expense += Math.abs(tx.amount);
  });
  return Object.values(data);
};

const SummaryCard = ({ label, value, color }) => (
  <div className="summary-card">
    <span className="label">{label}:</span>
    <span className="value" style={{ color }}>₹{value}</span>
  </div>
);

const CustomPieChart = ({ data, title }) => (
  <motion.div className="chart-box" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.5 }}>
    <h3>{title}</h3>
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
);

const RecentTransactions = ({ transactions }) => (
  <div className="recent-transactions">
    <h3 className="heading2">Recent Transactions</h3>
    {transactions.length === 0 ? (
      <p>No recent transactions.</p>
    ) : (
      <ul>
        {transactions.slice(-5).reverse().map((tx, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, rotateZ: 6 }}
            animate={{ opacity: 1, rotateZ: 0 }}
            transition={{ delay: index * 0.08, type: "spring", stiffness: 60 }}
            whileHover={{ scale: 1.04, rotateZ: -2, rotateY: 2 }}
          >
            <span
              className={`badge bumzi ${tx.amount > 0 ? "badge-income" : "badge-expense"}`}
              aria-label={tx.amount > 0 ? "Income" : "Expense"}
              title={tx.amount > 0 ? "Income" : "Expense"}
            >
              {tx.amount > 0 ? "+" : "-"}
            </span>
            <strong>{(tx.description || tx.text) ?? "No Description"}:</strong> ₹{Math.abs(tx.amount)} - {tx.category || "Other"}
          </motion.li>
        ))}
      </ul>
    )}
  </div>
);

const Dashboard = () => {
  const { transactions } = useContext(TransactionContext);
  const [loading, setLoading] = useState(true);
  const [showExpenseChart, setShowExpenseChart] = useState(false);
  const [showIncomeChart, setShowIncomeChart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const amounts = useMemo(() => transactions.map(tx => tx.amount), [transactions]);
  const total = useMemo(() => amounts.reduce((a, b) => a + b, 0), [amounts]);
  const income = useMemo(() => amounts.filter(a => a > 0).reduce((a, b) => a + b, 0), [amounts]);
  const expense = useMemo(() => amounts.filter(a => a < 0).reduce((a, b) => a + b, 0), [amounts]);
  const inhand = useMemo(() => transactions.filter(tx => tx.paymentMode === "cash").reduce((a, tx) => a + tx.amount, 0), [transactions]);
  const online = useMemo(() => transactions.filter(tx => tx.paymentMode === "online" || tx.paymentMode === "account").reduce((a, tx) => a + tx.amount, 0), [transactions]);

  const animatedTotal = useAnimatedNumber(total);
  const animatedIncome = useAnimatedNumber(income);
  const animatedExpense = useAnimatedNumber(Math.abs(expense));
  const animatedInhand = useAnimatedNumber(inhand);
  const animatedOnline = useAnimatedNumber(online);

  const incomeData = useMemo(() => getIncomeData(transactions), [transactions]);
  const expenseData = useMemo(() => getExpenseData(transactions), [transactions]);
  const monthlyData = useMemo(() => getMonthlyData(transactions), [transactions]);

  if (loading) {
    return (
      <div className="spinner-container">
        <Grid size="60" speed="1.5" color="black" />
      </div>
    );
  }

  return (
    <motion.div className="dashboard" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
      <h2 className="heading2">Dashboard</h2>

      <div className="balanceBox">
        <SummaryCard label="Total" value={animatedTotal} color="tomato" />
        <div className="TransactionsBox">Total Transactions: <span style={{ color: "#38bdf8" }}>{transactions.length}</span></div>
        <SummaryCard label="Income" value={animatedIncome} color="#10b981" />
        <SummaryCard label="Expense" value={animatedExpense} color="#ef4444" />
        <SummaryCard label="Inhand" value={animatedInhand} color="#fbbf24" />
        <SummaryCard label="Online" value={animatedOnline} color="#7c24e7" />
      </div>

      <div className="chart-container-box responsive-charts">
        <CustomPieChart
          data={[{ name: "Income", value: Number(income) }, { name: "Expense", value: Math.abs(Number(expense)) }]}
          title="Income vs Expense"
        />

        <RecentTransactions transactions={transactions} />

        <div className="chart-box">
          <button className="OpenBtn" onClick={() => setShowExpenseChart(prev => !prev)} style={{ background: "#ef4444", color: "white" }}>
            {showExpenseChart ? "Close Expense Chart" : "Open Expense Chart"}
          </button>
          <AnimatePresence>
            {showExpenseChart && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.5 }}>
                <CustomPieChart data={expenseData} title="Expense Breakdown" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="chart-box">
          <button className="OpenBtn" onClick={() => setShowIncomeChart(prev => !prev)} style={{ background: "#10b981", color: "white" }}>
            {showIncomeChart ? "Close Income Chart" : "Open Income Chart"}
          </button>
          <AnimatePresence>
            {showIncomeChart && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.5 }}>
                <CustomPieChart data={incomeData} title="Income Breakdown" />
              </motion.div>
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
    </motion.div>
  );
};

export default Dashboard;
