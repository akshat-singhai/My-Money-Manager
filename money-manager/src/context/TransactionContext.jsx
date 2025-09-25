import React, { createContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedTransactions = getTransactions();
    setTransactions(storedTransactions);
  }, []);

  const addTransaction = (transaction) => {
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    saveTransaction(updatedTransactions);
  };

  const removeTransaction = (id) => {
    const updatedTransactions = transactions.filter((tx) => tx.id !== id);
    setTransactions(updatedTransactions);
    saveTransaction(updatedTransactions);
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction: removeTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};