import React, { useState, useContext } from "react";
import { TransactionContext } from "../Context/TransactionContext";
import "./TransactionList.css";
import toast, { Toaster } from 'react-hot-toast';
import { incomeCategories, expenseCategories } from "../data/categories";

const AddTransaction = () => {
  const { transactions, addTransaction } = useContext(TransactionContext);
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash"); // NEW: payment mode
  const [accountType, setAccountType] = useState("online"); // NEW: account type

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !amount || !category) return;

    const value = type === "expense" ? -Math.abs(+amount) : +amount;

    // Add paymentMode and accountType to transaction
    addTransaction({ text, amount: value, category, type, date, notes, paymentMode, accountType: paymentMode === "account" ? accountType : null });
    setText("");
    setAmount("");
    setCategory("");
    setNotes("");
    setPaymentMode("cash");
    setAccountType("online");
  };

  const henladelOnClick = () => {
    toast.success('Transaction Added Successfully', {
      duration: 2000,
      position: 'top-center',
      style: {
        background: 'green',
        color: '#fff',
        fontSize: '16px',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#000',
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="formDiv" >
      <Toaster />
      <h3 className="Heading1">Add Transaction</h3>

      <select value={type} onChange={(e) => setType(e.target.value)} className="optionsDiv">
        <option value="income" className="incomeBox">Income</option>
        <option value="expense" className="expenseBox">Expense</option>
      </select>
      <div className="InputDiv">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Description"
          type="text"
          className="descriptionBox"
        />

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          className="amountBox"
        />
      </div>

      <select value={category} onChange={(e) => setCategory(e.target.value)} className="categoryBox">
        <option value="" className="option">Select Category</option>
        {categories.map((cat, index) => (
          <option key={index} value={cat.label}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Payment Mode */}
      <label htmlFor="paymentMode" className="notesLabel">Payment Mode:</label>
      <select
        id="paymentMode"
        value={paymentMode}
        onChange={(e) => setPaymentMode(e.target.value)}
        className="categoryBox"
      >
        <option value="cash">Cash</option>
        <option value="account">Account</option>
        <option value="creditCard">Credit Card</option>
        <option value="debitCard">Debit Card</option>
      </select>

      {/* Account Type (only if paymentMode is account) */}
      {paymentMode === "account" && (
        <>
          <label htmlFor="accountType" className="notesLabel">Account Type:</label>
          <select
            id="accountType"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="categoryBox"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </>
      )}

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="dateBox"
      />
      <label htmlFor="notes" className="notesLabel">Notes (optional):</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="notesBox"
        rows={2}
      />
      <button type="submit" className="BtnAT" onClick={henladelOnClick} >Add Transaction</button>
    </form>
  );
};

export default AddTransaction;