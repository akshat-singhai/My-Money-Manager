
import React, { createContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    setTransactions((prev) => [...prev, { ...transaction, id: uuidv4() }]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };
  const updateTransaction = (id, updatedData) => {
  setTransactions((prev) =>
    prev.map((tx) => (tx.id === id ? { ...tx, ...updatedData } : tx))
  );
};


  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};
