
import React, { useContext } from "react";
import { TransactionContext } from "../Context/TransactionContext";
import ExpenseChart from "./ExpenseChart";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useState } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const { transactions } = useContext(TransactionContext);
  const [showExpenseChart, setShowExpenseChart] = useState(false);
  const toggleExpenseChart = () => {  
    setShowExpenseChart(!showExpenseChart);
  }
  const handleClose = () => { 
    setShowExpenseChart(false);
  }
  const handleOpen = () => {
    setShowExpenseChart(true);
  }
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
              data={[{ name: "Income", value: income }, { name: "Expense", value: Math.abs(expense) }]}
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
        <button onClick={handleOpen} className="OpenBtn">Open Expense Chart</button>
        {showExpenseChart && (
          <div>
            <h3 className="heading2">Expense Chart</h3>
            <ExpenseChart />
            <button onClick={handleClose} className="CloseBtn">Close</button>
          </div>
        )}
        </div> 
        </div>
     
    </div>
  );
};

export default Dashboard;
