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

  // EMI Calculation
  const calculateEMI = () => {
    const P = parseFloat(loan);
    const R = parseFloat(rate) / 12 / 100;
    const N = parseFloat(tenure) * 12;
    if (!P || !R || !N) return;

    const emiCalc = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    setEmi(emiCalc.toFixed(2));
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
  };

  return (
    <div className="container">
      <h1 className="text-2xl font-bold">Finance Tools</h1>

      {/* EMI Calculator */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">EMI Calculator</h2>
        <input type="number" placeholder="Loan Amount" value={loan} onChange={e => setLoan(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Annual Interest Rate (%)" value={rate} onChange={e => setRate(e.target.value)} className="w-full p-2 border rounded" />
        <input type="number" placeholder="Tenure (Years)" value={tenure} onChange={e => setTenure(e.target.value)} className="w-full p-2 border rounded" />
        <button onClick={calculateEMI} className="bg-green-600 text-white px-4 py-2 rounded">Calculate EMI</button>
        {emi && <p className="text-green-700 font-medium">Monthly EMI: ₹{emi}</p>}
      </div>

      {/* GST Calculator */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">GST Calculator</h2>
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded" />
        <select value={gstRate} onChange={e => setGstRate(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Select GST Rate</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
        </select>
        <button onClick={calculateGST} className="bg-green-600 text-white px-4 py-2 rounded">Calculate GST</button>
        {gstResult.inclusive > 0 && (
          <div className="text-green-700 font-medium">
            <p>GST Amount: ₹{gstResult.exclusive}</p>
            <p>Total with GST: ₹{gstResult.inclusive}</p>
          </div>
        )}
      </div>
    </div>
  );
}
