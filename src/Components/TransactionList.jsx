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
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!text || !amount || !category) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    if (amount <= 0) {
      toast.error("Amount must be greater than zero");
      setIsSubmitting(false);
      return;
    }

    const value = type === "expense" ? -Math.abs(+amount) : +amount;

    try {
      await addTransaction({
        text,
        amount: value,
        category,
        type,
        date,
        notes,
        paymentMode,
        accountType: paymentMode === "account" ? accountType : null,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : null,
      });

      toast.success("Transaction Added Successfully");
      
      // Reset form but keep the transaction type and date
      setText("");
      setAmount("");
      setCategory("");
      setNotes("");
      setPaymentMode("cash");
      setAccountType("online");
      setIsRecurring(false);
      setRecurringFrequency("monthly");
    } catch (error) {
      toast.error("Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get category icon based on selection
  const getCategoryIcon = () => {
    if (!category) return "💰";
    const selectedCategory = categories.find(cat => cat.label === category);
    return selectedCategory ? selectedCategory.icon : "💰";
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    <form onSubmit={handleSubmit} className="formDiv">
      
      <div className="form-header">
        <h3 className="Heading1">Add New Transaction</h3>
        <div className={`type-indicator ${type}`}>
          {type === 'income' ? 'Income' : 'Expense'}
        </div>
      </div>
      
      <div className="form-grid">
        {/* Transaction Type */}
        <div className="form-group">
          <label className="form-label">Transaction Type</label>
          <div className="type-toggle">
            <button 
              type="button"
              className={`toggle-btn ${type === 'income' ? 'active' : ''}`}
              onClick={() => setType('income')}
            >
              Income
            </button>
            <button 
              type="button"
              className={`toggle-btn ${type === 'expense' ? 'active' : ''}`}
              onClick={() => setType('expense')}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Description and Amount */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter transaction description"
            type="text"
            className="descriptionBox"
            maxLength={50}
          />
          <div className="char-count">{text.length}/50</div>
        </div>

        <div className="form-group">
          <label className="form-label">Amount</label>
          <div className="amount-input-container">
            <span className="currency-symbol">₹</span>
            <input
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setAmount(value);
                }
              }}
              placeholder="0.00"
              type="text"
              className="amountBox"
            />
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-select-wrapper">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="categoryBox"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat.label}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
            <div className="category-icon-preview">
              {getCategoryIcon()}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="dateBox"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Payment Mode */}
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select 
            value={paymentMode} 
            onChange={(e) => setPaymentMode(e.target.value)} 
            className="paymentBox"
          >
            <option value="cash">💵 Cash</option>
            <option value="account">🏦 Bank Account</option>
            <option value="creditCard">💳 Credit Card</option>
            <option value="debitCard">💳 Debit Card</option>
            <option value="digital">📱 Digital Wallet</option>
          </select>
        </div>

        {/* Account Type (if payment mode is account) */}
        {paymentMode === "account" && (
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select 
              value={accountType} 
              onChange={(e) => setAccountType(e.target.value)} 
              className="accountBox"
            >
              <option value="online">🌐 Online Banking</option>
              <option value="offline">🏛️ Branch Banking</option>
            </select>
          </div>
        )}

        {/* Recurring Transaction */}
        <div className="form-group full-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="recurring-checkbox"
            />
            <span className="checkmark"></span>
            This is a recurring transaction
          </label>
          
          {isRecurring && (
            <div className="recurring-options">
              <label className="form-label">Frequency</label>
              <select 
                value={recurringFrequency} 
                onChange={(e) => setRecurringFrequency(e.target.value)} 
                className="frequencyBox"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="form-group full-width">
          <label className="form-label">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this transaction"
            className="notesBox"
            rows={3}
            maxLength={200}
          />
          <div className="char-count">{notes.length}/200</div>
        </div>
      </div>

      <button 
        type="submit" 
        className={`BtnAT ${isSubmitting ? 'submitting' : ''}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="spinner"></div>
            Adding...
          </>
        ) : (
          `Add ${type === 'income' ? 'Income' : 'Expense'}`
        )}
      </button>
    </form>
    </>
  );
};

export default AddTransaction;