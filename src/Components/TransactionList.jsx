import React, { useState, useContext } from "react";
import { TransactionContext } from "../Context/TransactionContext";
import "./TransactionList.css";
import toast, { Toaster } from 'react-hot-toast';
import { incomeCategories, expenseCategories } from "../data/categories";

const AddTransaction = () => {
  const { addTransaction } = useContext(TransactionContext);
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [accountType, setAccountType] = useState("online");

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text || !amount || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const value = type === "expense" ? -Math.abs(+amount) : +amount;

    addTransaction({
      text,
      amount: value,
      category,
      type,
      date,
      notes,
      paymentMode,
      accountType: paymentMode === "account" ? accountType : null,
    });

    toast.success("Transaction Added Successfully");
    setText("");
    setAmount("");
    setCategory("");
    setNotes("");
    setPaymentMode("cash");
    setAccountType("online");
  };

  return (
    <form onSubmit={handleSubmit} className="formDiv">
      <Toaster />
      <h3 className="Heading1">Add Transaction</h3>

      <select value={type} onChange={(e) => setType(e.target.value)} className="optionsDiv">
        <option value="income"> Income</option>
        <option value="expense">Expense</option>
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
         {/** category  */}
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="categoryBox">
        <option value="">Select Category</option>
        {categories.map((cat, index) => (
          <option key={index} value={cat.label}>
            {cat.label}
          </option>
        ))}
      </select>

           {/** paymentMode  */}
      <label className="notesLabel">Payment Mode:</label>
      <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="categoryBox">
        <option value="cash">Cash</option>
        <option value="account">Account</option>
        <option value="creditCard">Credit Card</option>
        <option value="debitCard">Debit Card</option>
      </select>
      {paymentMode === "account" && (
        <>
          <label className="notesLabel">Account Type:</label>
          <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="categoryBox">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </>
      )}
         {/** Date  */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="dateBox"
      />
        {/** note  */}
      <label className="notesLabel">Notes (optional):</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="notesBox"
        rows={2}
      />

      <button type="submit" className="BtnAT">Add Transaction</button>
      <button className="fab-add-transaction" title="Add Transaction">+</button>
    </form>
  );
};

export default AddTransaction;
