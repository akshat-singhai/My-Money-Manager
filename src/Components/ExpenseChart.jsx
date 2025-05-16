import React, { useContext } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { TransactionContext } from "../Context/TransactionContext";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#8AFFC1", "#FF9F40", "#B28DFF", "#FF6666"];

const ExpenseChart = () => {
  const { transactions } = useContext(TransactionContext);

  const expenseData = transactions
    .filter((tx) => tx.amount < 0)
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

  if (expenseData.length === 0) return <p>No expenses to display.</p>;

  return (
    <div>
      <h3 className="hading2">Expenses by Category</h3>
      <PieChart width={300} height={300}>
        <Pie
          data={expenseData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label
        >
          {expenseData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default ExpenseChart;