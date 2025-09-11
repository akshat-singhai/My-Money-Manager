// filepath: c:\Users\Dell\Desktop\My money-manager\money-manager\src\components\TransactionList.jsx
import React, { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import "./TransactionList.css";

const TransactionList = () => {
  const { transactions } = useContext(TransactionContext);

  return (
    <div className="transaction-list">
      <h2>Transaction List</h2>
      {transactions.length === 0 ? (
        <p>No transactions available.</p>
      ) : (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <span>{transaction.description}</span>
              <span>{transaction.amount}</span>
              <span>{transaction.date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;