import React, { useState } from 'react';
import './finance-tools.css';

export default function FinanceTools() {
  // EMI Calculator States
  const [loan, setLoan] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [emi, setEmi] = useState(null);

  // GST Calculator States
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState('');
  const [gstResult, setGstResult] = useState({ inclusive: 0, exclusive: 0 });

  // Animated state for EMI result
  const [showEmiResult, setShowEmiResult] = useState(false);
  // Animated state for GST result
  const [showGstResult, setShowGstResult] = useState(false);

  // EMI Calculation
  const calculateEMI = () => {
    const P = parseFloat(loan);
    const R = parseFloat(rate) / 12 / 100;
    const N = parseFloat(tenure) * 12;
    if (!P || !R || !N) return;

    const emiCalc = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    setEmi(emiCalc.toFixed(2));
    setShowEmiResult(false);
    setTimeout(() => setShowEmiResult(true), 100); // trigger animation
  };

  // GST Calculation
  const calculateGST = () => {
    const amt = parseFloat(amount);
    const rate = parseFloat(gstRate);
    if (!amt || !rate) return;

    const exclusive = (amt * rate) / 100;
    const inclusive = amt + exclusive;

    setGstResult({
      inclusive: inclusive.toFixed(2),
      exclusive: exclusive.toFixed(2),
    });
    setShowGstResult(false);
    setTimeout(() => setShowGstResult(true), 100); // trigger animation
  };

  // Reset functions for better UX
  const resetEMI = () => {
    setLoan('');
    setRate('');
    setTenure('');
    setEmi(null);
    setShowEmiResult(false);
  };
  const resetGST = () => {
    setAmount('');
    setGstRate('');
    setGstResult({ inclusive: 0, exclusive: 0 });
    setShowGstResult(false);
  };

  return (
    <div className="container">
      <h1 className="tools-heading">Finance Tools</h1>

      {/* EMI Calculator */}
      <div className="tool-card">
        <h2 className="tool-title">EMI Calculator</h2>
        <input
          type="number"
          placeholder="Loan Amount"
          value={loan}
          onChange={e => setLoan(e.target.value)}
          className="tool-input"
          min="0"
        />
        <input
          type="number"
          placeholder="Annual Interest Rate (%)"
          value={rate}
          onChange={e => setRate(e.target.value)}
          className="tool-input"
          min="0"
        />
        <input
          type="number"
          placeholder="Tenure (Years)"
          value={tenure}
          onChange={e => setTenure(e.target.value)}
          className="tool-input"
          min="0"
        />
        <div className="tool-btn-row">
          <button onClick={calculateEMI} className="tool-btn tool-btn-green">Calculate EMI</button>
          <button onClick={resetEMI} className="tool-btn tool-btn-reset" type="button">Reset</button>
        </div>
        {emi && showEmiResult && (
          <div className="result animated-result success">
            <span role="img" aria-label="money">💸</span> Monthly EMI: <b>₹{emi}</b>
          </div>
        )}
      </div>

      {/* GST Calculator */}
      <div className="tool-card">
        <h2 className="tool-title">GST Calculator</h2>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="tool-input"
          min="0"
        />
        <select
          value={gstRate}
          onChange={e => setGstRate(e.target.value)}
          className="tool-input"
        >
          <option value="">Select GST Rate</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
        </select>
        <div className="tool-btn-row">
          <button onClick={calculateGST} className="tool-btn tool-btn-green">Calculate GST</button>
          <button onClick={resetGST} className="tool-btn tool-btn-reset" type="button">Reset</button>
        </div>
        {gstResult.inclusive > 0 && showGstResult && (
          <div className="result animated-result info">
            <span role="img" aria-label="tax">🧾</span> GST Amount: <b>₹{gstResult.exclusive}</b><br />
            Total with GST: <b>₹{gstResult.inclusive}</b>
          </div>
        )}
      </div>
    </div>
  );
}