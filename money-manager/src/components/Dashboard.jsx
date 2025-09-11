import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user ? user.username : "Guest"}!</h2>
      <p>Your financial overview:</p>
      {/* Add components or data visualizations for financial data here */}
      <div className="financial-summary">
        <h3>Financial Summary</h3>
        {/* Placeholder for financial data */}
        <p>Total Income: ₹0</p>
        <p>Total Expenses: ₹0</p>
        <p>Net Balance: ₹0</p>
      </div>
    </div>
  );
};

export default Dashboard;