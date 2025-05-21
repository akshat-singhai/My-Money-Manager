import React, { useContext } from "react";
import { TransactionContext } from "../Context/TransactionContext";
import ExpenseChart from "./ExpenseChart";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useState } from "react";
import "./Dashboard.css";


const getIncomeData = (transactions) => {
  const incomeData = transactions
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
  return incomeData;
};

const COLORS = [
  "#82ca9d", "#8884d8", "#ffc658", "#ff7300", "#00C49F", "#0088FE", "#FFBB28", "#FF8042"
];

const Dashboard = () => {
  const { transactions } = useContext(TransactionContext);
  const [showExpenseChart, setShowExpenseChart] = useState(false);
  const [showIncomeChart, setShowIncomeChart] = useState(false);

  const toggleExpenseChart = () => {  
    setShowExpenseChart(!showExpenseChart);
  };
  const handleCloseExpense = () => { 
    setShowExpenseChart(false);
  };
  const handleOpenExpense = () => {
    setShowExpenseChart(true);
  };

  const handleOpenIncome = () => {
    setShowIncomeChart(true);
  };
  const handleCloseIncome = () => {
    setShowIncomeChart(false);
  };

  if (transactions.length === 0) {
    return <h2>No transactions to display.</h2>;
  }

  const amounts = transactions.map((tx) => tx.amount);
  const total = amounts.reduce((acc, val) => acc + val, 0).toFixed(2);
  const income = amounts
    .filter((a) => a > 0)
    .reduce((acc, val) => acc + val, 0)
    .toFixed(2);
  const expense = amounts
    .filter((a) => a < 0)
    .reduce((acc, val) => acc + val, 0)
    .toFixed(2);


  const incomeData = getIncomeData(transactions);

  return (
    <div className="dashboard">

      <h2 className="heading2">Dashboard</h2>  
     
      <div  className="balanceBox">
        <div  className="TotalBox">Total: ₹{total}</div>
        <div  className="TransactionsBox">Total Transactions: {transactions.length}</div>
        <div className="TotalIncomeBox" >Total Income: ₹{income}</div>
        <div  className="TotalExpensebox ">Total Expense: ₹{Math.abs(expense)}</div>
        <div  className="IncomBox">Income: ₹{income}</div>
        <div className="ExpenseBox" >Expense: ₹{Math.abs(expense)}</div>
      </div>
      <div className="chart-container-box">
        <div className="pie-chart-container">
          <div style={{ width: "50%" }}>
            <h3 className="heading2">Income vs Expense</h3>
            <PieChart width={200} height={200} className="pie-chart">
              <Pie
                data={[
                  { name: "Income", value: Number(income) },
                  { name: "Expense", value: Math.abs(Number(expense)) }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                className="pie-Box"          
              >
                <Cell fill="#82ca9d" />
                <Cell fill="#ff7300" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
          <div style={{ width: "50%" }}>
            <h3 className="heading2">Transactions</h3>
            <ul>
              {transactions.map((tx, index) => (
                <li key={index}>
                  {tx.description}: ₹{tx.amount}
                </li>
              ))}
            </ul>
          </div>
        </div>       
        <div className="expense-chart">
          <button onClick={handleOpenExpense} className="OpenBtn">Open Expense Chart</button>
          {showExpenseChart && (
            <div>
              <h3 className="heading2">Expense Chart</h3>
              <ExpenseChart />
              <button onClick={handleCloseExpense} className="CloseBtn">Close</button>
            </div>
          )}
        </div>
        <div className="expense-chart">
          <button onClick={handleOpenIncome} className="OpenBtn">Open Income Chart</button>
          {showIncomeChart && (
            <div>
              <h3 className="heading2">Income Chart</h3>
              {incomeData.length === 0 ? (
                <p>No income to display.</p>
              ) : (
                <PieChart width={300} height={300}>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {incomeData.map((_, index) => (
                      <Cell key={`cell-income-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
              <button onClick={handleCloseIncome} className="CloseBtn">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;