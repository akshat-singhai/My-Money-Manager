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
  const [notes, setNotes] = useState(""); // NEW: Notes state

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !amount || !category) return;

    const value = type === "expense" ? -Math.abs(+amount) : +amount;

    addTransaction({ text, amount: value, category, type, date, notes }); // Pass notes
    setText("");
    setAmount("");
    setCategory("");
    setNotes(""); // Clear notes
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