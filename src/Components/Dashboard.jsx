import React, { useContext, useState, useEffect } from "react";
import { TransactionContext } from "../Context/TransactionContext";
import ExpenseChart from "./ExpenseChart";
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import "./Dashboard.css";

// Utility functions
const getIncomeData = (transactions) => {
  return transactions
    .filter((tx) => tx.amount > 0)
    .reduce((acc, tx) => {
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
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = {};
  transactions.forEach(tx => {
    const date = new Date(tx.date);
    if (isNaN(date)) return;
    const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
    if (!data[key]) data[key] = { month: key, Income: 0, Expense: 0 };
    if (tx.amount > 0) data[key].Income += Math.abs(tx.amount);
    else data[key].Expense += Math.abs(tx.amount);
  });
  return Object.values(data).sort((a, b) => new Date(a.month) - new Date(b.month));
};

const COLORS = [
  "#38bdf8", "#6366f1", "#fbbf24", "#ef4444", "#10b981", "#a21caf", "#f472b6", "#f59e42"
];

// Animated Counter Hook
function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue((target * progress).toFixed(2));
      if (progress < 1) requestAnimationFrame(animate);
      else setValue(Number(target).toFixed(2));
    }
    animate(startTime);
    // eslint-disable-next-line
  }, [target]);
  return value;
}

// Reusable Pie Chart Component
const CustomPieChart = ({ data, title }) => (
  <motion.div
    className="chart-box"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 30 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="heading2">{title}</h3>
    {data.length === 0 ? (
      <p>No data available.</p>
    ) : (
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          isAnimationActive
        >
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

// Recent Transactions Component
const RecentTransactions = ({ transactions }) => (
  <div className="recent-transactions">
    <h3 className="heading2">Recent Transactions</h3>
    {transactions.length === 0 ? (
      <p>No recent transactions.</p>
    ) : (
      <ul>
        {transactions.slice(-5).reverse().map((tx, index) => (
          <li key={index}>
            <span
              className={`badge ${tx.amount > 0 ? "badge-income" : "badge-expense"}`}
              aria-label={tx.amount > 0 ? "Income" : "Expense"}
            >
              {tx.amount > 0 ? "+" : "-"}
            </span>
            <strong>{(tx.description || tx.text) ?? "No Description"}:</strong> ₹{Math.abs(tx.amount)} - {tx.category || "Other"}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Dashboard = () => {
  const { transactions } = useContext(TransactionContext);
  const [showExpenseChart, setShowExpenseChart] = useState(false);
  const [showIncomeChart, setShowIncomeChart] = useState(false);

  if (transactions.length === 0) {
    return <h2>No transactions to display.</h2>;
  }

  const amounts = transactions.map((tx) => tx.amount);
  const total = amounts.reduce((acc, val) => acc + val, 0);
  const income = amounts.filter((a) => a > 0).reduce((acc, val) => acc + val, 0);
  const expense = amounts.filter((a) => a < 0).reduce((acc, val) => acc + val, 0);

  // Animated numbers
  const animatedTotal = useAnimatedNumber(total);
  const animatedIncome = useAnimatedNumber(income);
  const animatedExpense = useAnimatedNumber(Math.abs(expense));

  const incomeData = getIncomeData(transactions);
  const monthlyData = getMonthlyData(transactions);

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="heading2">Dashboard</h2>

      <div className="balanceBox">
        <div className="TotalBox" aria-label="Total Balance">
          Total: <span style={{ color: "Tomato" }}>₹{animatedTotal}</span>
        </div>
        <div className="TransactionsBox" aria-label="Total Transactions">
          Total Transactions: <span style={{ color: "#38bdf8" }}>{transactions.length}</span>
        </div>
        <div className="TotalIncomeBox" aria-label="Total Income">
          Total Income: <span style={{ color: "#10b981" }}>₹{animatedIncome}</span>
        </div>
        <div className="TotalExpensebox" aria-label="Total Expense">
          Total Expense: <span style={{ color: "#ef4444" }}>₹{animatedExpense}</span>
        </div>
      </div>

      <div className="chart-container-box responsive-charts">
        <CustomPieChart
          data={[
            { name: "Income", value: Number(income) },
            { name: "Expense", value: Math.abs(Number(expense)) },
          ]}
          title="Income vs Expense"
        />

        <RecentTransactions transactions={transactions} />

        {/* Collapsible Expense Chart */}
        <div className="chart-box">
          <button
            onClick={() => setShowExpenseChart((prev) => !prev)}
            className="OpenBtn"
            style={{ background: "#ef4444", color: "#fff" }}
            aria-expanded={showExpenseChart}
            aria-controls="expense-chart"
          >
            {showExpenseChart ? "Close Expense Chart" : "Open Expense Chart"}
          </button>
          <AnimatePresence>
            {showExpenseChart && (
              <motion.div
                id="expense-chart"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5 }}
              >
                <ExpenseChart />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapsible Income Chart */}
        <div className="chart-box">
          <button
            onClick={() => setShowIncomeChart((prev) => !prev)}
            className="OpenBtn"
            style={{ background: "#10b981", color: "#fff" }}
            aria-expanded={showIncomeChart}
            aria-controls="income-chart"
          >
            {showIncomeChart ? "Close Income Chart" : "Open Income Chart"}
          </button>
          <AnimatePresence>
            {showIncomeChart && (
              <motion.div
                id="income-chart"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5 }}
              >
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
            <Bar dataKey="Income" fill="#10b981" isAnimationActive animationDuration={900} />
            <Bar dataKey="Expense" fill="#ef4444" isAnimationActive animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default Dashboard;