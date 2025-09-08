// Enhanced Dashboard.jsx
import React, { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaPlus, FaFilter, FaDownload, FaSync, FaEye, FaEyeSlash } from "react-icons/fa";
import { TransactionContext } from "../Context/TransactionContext";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  CartesianGrid, LabelList, AreaChart, Area
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

import { Reuleaux } from "ldrs/react";
import 'ldrs/react/Reuleaux.css';
import "./Dashboard.css";

// Constants
const COLORS = ["#38bdf8", "#6366f1", "#fbbf24", "#ef4444", "#10b981", "#a21caf", "#f472b6", "#f59e42"];
const PAYMENT_MODES = ['cash', 'online', 'account', 'card', 'upi'];
const CATEGORIES = ['Food', 'Shopping', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Other'];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Helper functions
const formatCurrency = (value, hideValue = false) => {
  if (hideValue) return '••••';
  if (typeof value !== 'number') return value;
  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString) => {
  if (!dateString) return { date: "No Date", time: "No Time" };
  
  const date = new Date(dateString);
  if (isNaN(date)) return { date: "Invalid Date", time: "Invalid Time" };
  
  return {
    date: date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    time: date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
};

// Custom Tooltip Component for Charts
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Summary Card Component
const SummaryCard = React.memo(({ label, value, color, icon, onClick, isInteractive, hideValue }) => {
  const cardContent = (
    <div 
      className={`summary-card ${isInteractive ? 'interactive' : ''}`} 
      role={isInteractive ? "button" : "group"} 
      aria-label={`${label} summary`}
      tabIndex={isInteractive ? 0 : -1}
    >
      {icon && <span className="summary-icon">{icon}</span>}
      <span className="label">{label}:</span>
      <span className="value" style={{ color }}>{formatCurrency(value, hideValue)}</span>
    </div>
  );

  return isInteractive ? (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {cardContent}
    </motion.div>
  ) : cardContent;
});

// Enhanced Pie Chart Component
const CustomPieChart = React.memo(({ data = [], title, chartId, onSegmentClick }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const handleClick = useCallback((data, index) => {
    if (onSegmentClick) {
      onSegmentClick(data, index);
    }
  }, [onSegmentClick]);

  return (
    <motion.div
      id={chartId}
      className="chart-box"
      role="region"
      aria-labelledby={`${chartId}-title`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.45 }}
    >
      <h3 id={`${chartId}-title`}>{title}</h3>
      {(!data || data.length === 0) ? (
        <p className="empty-chart">No data available.</p>
      ) : (
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={activeIndex !== null ? 60 : 50}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={handleClick}
            activeIndex={activeIndex}
            activeShape={(props) => {
              const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
              return (
                <g>
                  <path
                    d={`
                      M${cx},${cy}
                      L${cx + outerRadius * Math.cos(-startAngle * Math.PI / 180)},${cy + outerRadius * Math.sin(-startAngle * Math.PI / 180)}
                      A${outerRadius},${outerRadius} 0 0,1 ${cx + outerRadius * Math.cos(-endAngle * Math.PI / 180)},${cy + outerRadius * Math.sin(-endAngle * Math.PI / 180)}
                      L${cx},${cy}
                      Z
                    `}
                    fill={fill}
                    opacity={0.8}
                  />
                  <path
                    d={`
                      M${cx},${cy}
                      L${cx + innerRadius * Math.cos(-startAngle * Math.PI / 180)},${cy + innerRadius * Math.sin(-startAngle * Math.PI / 180)}
                      A${innerRadius},${innerRadius} 0 0,0 ${cx + innerRadius * Math.cos(-endAngle * Math.PI / 180)},${cy + innerRadius * Math.sin(-endAngle * Math.PI / 180)}
                      L${cx},${cy}
                      Z
                    `}
                    fill={fill}
                    opacity={0.8}
                  />
                </g>
              );
            }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
            content={<CustomTooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            formatter={(value, entry, index) => (
              <span style={{ color: '#333', fontSize: '12px' }}>
                {value}: ₹{data[index]?.value.toLocaleString('en-IN')}
              </span>
            )}
          />
        </PieChart>
      )}
    </motion.div>
  );
});

// Enhanced Recent Transactions Component
const RecentTransactions = React.memo(({ transactions = [], onTransactionClick }) => {
  const recentTransactions = useMemo(() =>
    (Array.isArray(transactions) ? [...transactions] : [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(tx => {
        const amount = Math.abs(Number(tx.amount) || 0);
        const isIncome = Number(tx.amount) > 0;
        const { date: formattedDate, time: formattedTime } = formatDate(tx.date);
        
        return {
          ...tx,
          id: tx.id ?? `${tx.date}-${amount}-${(tx.text || tx.description || '').slice(0,12)}`.replace(/\s+/g, '-'),
          displayAmount: amount,
          displayAmountFormatted: formatCurrency(amount),
          isIncome,
          displayDescription: tx.description || tx.text || "No Description",
          displayCategory: tx.category || "Other",
          formattedDate,
          formattedTime,
          paymentMode: tx.paymentMode || 'Not specified'
        };
      }),
    [transactions]
  );

  const handleClick = useCallback((transaction) => {
    if (onTransactionClick) {
      onTransactionClick(transaction);
    }
  }, [onTransactionClick]);

  return (
    <div className="recent-transactions" aria-live="polite">
      <div className="recent-transactions__header">
        <h2 className="recent-transactions__heading">Recent Transactions</h2>
        <Link to="/history" className="view-all-link">
          View All
        </Link>
      </div>
      {recentTransactions.length === 0 ? (
        <p className="recent-transactions__empty">No recent transactions.</p>
      ) : (
        <ul role="list" aria-label="Recent transactions" className="recent-transactions__list">
          {recentTransactions.map((tx, index) => (
            <motion.li
              role="listitem"
              tabIndex={0}
              key={tx.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 100, damping: 12 }}
              whileHover={{ scale: 1.01 }}
              className="recent-transactions__item"
              onClick={() => handleClick(tx)}
              onKeyPress={(e) => e.key === 'Enter' && handleClick(tx)}
              aria-label={`Transaction: ${tx.displayDescription}, Amount: ₹${tx.displayAmountFormatted}, Date: ${tx.formattedDate}`}
            >
              <div className="recent-transactions__content">
                <span
                  className={`recent-transactions__badge ${tx.isIncome ? "recent-transactions__badge--income" : "recent-transactions__badge--expense"}`}
                  aria-label={tx.isIncome ? "Income transaction" : "Expense transaction"}
                >
                  {tx.isIncome ? "↑" : "↓"}
                </span>

                <div className="recent-transactions__info">
                  <p className="recent-transactions__description">{tx.displayDescription}</p>
                  <p className="recent-transactions__category">{tx.displayCategory}</p>
                  <p className="recent-transactions__payment-mode">{tx.paymentMode}</p>
                </div>

                <div className="recent-transactions__amount-container">
                  <span
                    className={`recent-transactions__amount ${tx.isIncome ? "recent-transactions__amount--income" : "recent-transactions__amount--expense"}`}
                    aria-label={`${tx.isIncome ? 'Income' : 'Expense'} amount`}
                  >
                    {tx.isIncome ? "+" : "-"} ₹{tx.displayAmountFormatted}
                  </span>
                  <div className="recent-transactions__date-time">
                    <span className="recent-transactions__date" aria-label={`Transaction date: ${tx.formattedDate}`}>
                      {tx.formattedDate}
                    </span>
                    <span className="recent-transactions__time" aria-label={`Transaction time: ${tx.formattedTime}`}>
                      {tx.formattedTime}
                    </span>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
});

// Filter Component
const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="filter-panel">
      <button 
        className="filter-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="filter-content"
      >
        <FaFilter /> {isOpen ? 'Hide Filters' : 'Show Filters'}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="filter-content"
            className="filter-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filter-group">
              <label htmlFor="date-from">From Date:</label>
              <input
                id="date-from"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="date-to">To Date:</label>
              <input
                id="date-to"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => onFilterChange('dateTo', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="payment-mode">Payment Mode:</label>
              <select
                id="payment-mode"
                value={filters.paymentMode || ''}
                onChange={(e) => onFilterChange('paymentMode', e.target.value)}
              >
                <option value="">All</option>
                {PAYMENT_MODES.map(mode => (
                  <option key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                value={filters.category || ''}
                onChange={(e) => onFilterChange('category', e.target.value)}
              >
                <option value="">All</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="type">Transaction Type:</label>
              <select
                id="type"
                value={filters.type || ''}
                onChange={(e) => onFilterChange('type', e.target.value)}
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            <div className="filter-actions">
              <button onClick={onClearFilters} className="clear-filters">
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { transactions = [], refreshTransactions } = useContext(TransactionContext) || {};
  const [loading, setLoading] = useState(true);
  const [showExpenseChart, setShowExpenseChart] = useState(false);
  const [showIncomeChart, setShowIncomeChart] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [exportLoading, setExportLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // Check for dark mode
  useEffect(() => {
    const checkDark = () => setIsDarkMode(document.body.classList.contains('dark-mode'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Loading simulation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Apply filters from URL
  useEffect(() => {
    const urlFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (value) urlFilters[key] = value;
    }
    setFilters(urlFilters);
  }, [searchParams]);

  // Filter transactions based on active filters
  const filteredTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions.filter(tx => {
      if (filters.dateFrom && new Date(tx.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(tx.date) > new Date(filters.dateTo)) return false;
      if (filters.paymentMode && tx.paymentMode !== filters.paymentMode) return false;
      if (filters.category && tx.category !== filters.category) return false;
      if (filters.type === 'income' && Number(tx.amount) <= 0) return false;
      if (filters.type === 'expense' && Number(tx.amount) >= 0) return false;
      
      return true;
    });
  }, [transactions, filters]);

  // Compute financial metrics
  const { income, expense, inhand, online, total } = useMemo(() => {
    let income = 0, expense = 0, inhand = 0, online = 0;
    
    (Array.isArray(filteredTransactions) ? filteredTransactions : []).forEach(tx => {
      const amt = Number(tx?.amount) || 0;
      if (amt > 0) income += amt;
      else expense += amt;

      if (tx?.paymentMode === "cash") inhand += amt;
      else if (PAYMENT_MODES.includes(tx?.paymentMode)) online += amt;
    });
    
    const total = income + expense; // expense is negative
    return { income, expense, inhand, online, total };
  }, [filteredTransactions]);

  // Get breakdown data for charts
  const getBreakdownData = useCallback((type) => {
    const list = (Array.isArray(filteredTransactions) ? filteredTransactions : []).filter(tx => 
      type === 'income' ? Number(tx.amount) > 0 : Number(tx.amount) < 0
    );
    
    const acc = [];
    list.forEach(tx => {
      const category = tx?.category || "Other";
      const value = Math.abs(Number(tx.amount) || 0);
      const existing = acc.find(item => item.name === category);
      
      if (existing) existing.value += value;
      else acc.push({ name: category, value });
    });
    
    return acc.sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Monthly data for bar chart
  const monthlyData = useMemo(() => {
    const data = {};
    
    (Array.isArray(filteredTransactions) ? filteredTransactions : []).forEach(tx => {
      const date = new Date(tx?.date);
      if (isNaN(date)) return;
      
      const key = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
      if (!data[key]) data[key] = { month: key, Income: 0, Expense: 0, Net: 0 };
      
      const amount = Number(tx.amount);
      if (amount > 0) {
        data[key].Income += amount;
        data[key].Net += amount;
      } else {
        const absAmount = Math.abs(amount);
        data[key].Expense += absAmount;
        data[key].Net += amount; // Subtract expense
      }
    });
    
    return Object.values(data).sort((a, b) => {
      const [mA, yA] = a.month.split(' ');
      const [mB, yB] = b.month.split(' ');
      const idxA = MONTHS.indexOf(mA);
      const idxB = MONTHS.indexOf(mB);
      
      if (yA !== yB) return Number(yA) - Number(yB);
      return idxA - idxB;
    });
  }, [filteredTransactions]);

  // Chart data for income vs expense pie chart
  const chartData = useMemo(() => [
    { name: "Income", value: Number(income) },
    { name: "Expense", value: Math.abs(Number(expense)) }
  ], [income, expense]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(newFilters)) {
      if (v) params.set(k, v);
    }
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearchParams({});
  }, [setSearchParams]);

  // Export data to Excel
  const handleExport = useCallback(async () => {
    setExportLoading(true);
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredTransactions.map(tx => ({
        Date: tx.date,
        Description: tx.description || tx.text || "No Description",
        Category: tx.category || "Other",
        Amount: Number(tx.amount),
        Type: Number(tx.amount) > 0 ? "Income" : "Expense",
        'Payment Mode': tx.paymentMode || "Not specified"
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
      XLSX.writeFile(workbook, `transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExportLoading(false);
    }
  }, [filteredTransactions]);

  // Refresh transaction data
  const handleRefresh = useCallback(async () => {
    if (refreshTransactions) {
      setLoading(true);
      await refreshTransactions();
      setTimeout(() => setLoading(false), 800);
    }
  }, [refreshTransactions]);

  // Handle chart segment click
  const handleSegmentClick = useCallback((data, index) => {
    const category = data.name;
    handleFilterChange('category', category);
  }, [handleFilterChange]);

  // Handle transaction click
  const handleTransactionClick = useCallback((transaction) => {
    // Removed navigation code
    console.log("Transaction clicked:", transaction);
  }, []);

  if (loading) {
    return (
      <div className="spinner-container" role="status" aria-label="Loading dashboard data">
        <Reuleaux
          size="60"
          stroke="9"
          strokeLength="0.55"
          bgOpacity=".1"
          speed="1.3"
          color={isDarkMode ? "#38bdf8" : "black"}
        />
      </div>
    );
  }

  return (
    <motion.main
      className="dashboard"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-label="Dashboard overview with charts and summary"
    >
      <div className="dashboard-header">
        <h2 className="heading2">Financial Dashboard</h2>
        <div className="dashboard-actions">
          <button 
            onClick={handleRefresh}
            className="action-button"
            aria-label="Refresh data"
            disabled={loading}
          >
            <FaSync className={loading ? "spinning" : ""} />
          </button>
          <button 
            onClick={handleExport}
            className="action-button"
            aria-label="Export to Excel"
            disabled={exportLoading}
          >
            <FaDownload />
          </button>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="action-button"
            aria-label={showBalance ? "Hide balances" : "Show balances"}
          >
            {showBalance ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>


      <div className="balanceBox" aria-live="polite">
        <SummaryCard 
          label="Total Balance" 
          value={"₹" + total} 
          color={total >= 0 ? "#10b981" : "#ef4444"} 
          isInteractive={true}
          hideValue={!showBalance}
          onClick={() => setShowBalance(!showBalance)}
        />
        <SummaryCard 
          label="Transactions" 
          value={filteredTransactions.length} 
          color="#38bdf8" 
          hideValue={!showBalance}
        />
        <SummaryCard 
          label="Income" 
          value={"₹" + income} 
          color="#10b981" 
          isInteractive={true}
          hideValue={!showBalance}
          onClick={() => console.log("Navigate to income transactions")}
        />
        <SummaryCard 
          label="Expense" 
          value={"₹" + Math.abs(expense)} 
          color="#ef4444" 
          isInteractive={true}
          hideValue={!showBalance}
          onClick={() => console.log("Navigate to expense transactions")}
        />
        <SummaryCard 
          label="In Hand" 
          value={"₹" + inhand} 
          color="#fbbf24" 
          isInteractive={true}
          hideValue={!showBalance}
          onClick={() => console.log("Navigate to cash transactions")}
        />
        <SummaryCard 
          label="Online" 
          value={"₹" + online} 
          color="#7c24e7" 
          isInteractive={true}
          hideValue={!showBalance}
          onClick={() => console.log("Navigate to online transactions")}
        />
      </div>

      <div className="chart-container-box responsive-charts">
        <CustomPieChart 
          data={chartData} 
          title="Income vs Expense" 
          chartId="income-expense-chart" 
          onSegmentClick={handleSegmentClick}
        />
        
        <RecentTransactions 
          transactions={filteredTransactions} 
          onTransactionClick={handleTransactionClick}
        />

        <div className="chart-box">
          <button
            className="OpenBtn"
            onClick={() => setShowExpenseChart(p => !p)}
            aria-expanded={showExpenseChart}
            aria-controls="expense-chart"
            style={{ background: "#ef4444", color: "white" }}
            type="button"
          >
            {showExpenseChart ? "Close Expense Breakdown" : "View Expense Breakdown"}
          </button>
          <AnimatePresence>
            {showExpenseChart && (
              <CustomPieChart 
                data={getBreakdownData("expense")} 
                title="Expense Breakdown" 
                chartId="expense-chart" 
                onSegmentClick={handleSegmentClick}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="chart-box">
          <button
            className="OpenBtn"
            onClick={() => setShowIncomeChart(p => !p)}
            aria-expanded={showIncomeChart}
            aria-controls="income-chart"
            style={{ background: "#10b981", color: "white" }}
            type="button"
          >
            {showIncomeChart ? "Close Income Breakdown" : "View Income Breakdown"}
          </button>
          <AnimatePresence>
            {showIncomeChart && (
              <CustomPieChart 
                data={getBreakdownData("income")} 
                title="Income Breakdown" 
                chartId="income-chart" 
                onSegmentClick={handleSegmentClick}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bar-chart-section" aria-live="polite">
        <h3 className="heading2">Monthly Income & Expense Trends</h3>
        {monthlyData.length === 0 ? (
          <p className="empty-chart">No monthly data to display.</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#555" }} />
              <YAxis tick={{ fontSize: 12, fill: "#555" }} />
              <Tooltip 
                formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} 
                contentStyle={{ borderRadius: 8, padding: '8px 12px' }}
                content={<CustomTooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Income" fill="#10b981" radius={[6,6,0,0]}>
                <LabelList dataKey="Income" position="top" formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
              </Bar>
              <Bar dataKey="Expense" fill="#ef4444" radius={[6,6,0,0]}>
                <LabelList dataKey="Expense" position="top" formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Net Cash Flow Area Chart */}
      {monthlyData.length > 0 && (
        <div className="area-chart-section" aria-live="polite">
          <h3 className="heading2">Net Cash Flow</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Net Cash Flow"]}
                content={<CustomTooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />}
              />
              <Area 
                type="monotone" 
                dataKey="Net" 
                stroke={total >= 0 ? "#10b981" : "#ef4444"} 
                fill={total >= 0 ? "#10b981" : "#ef4444"} 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fab-container">
        <Link to="/add-transaction" className="fab-add" aria-label="Add transaction" title="Add Transaction">
          <FaPlus size={18} />
        </Link>
       
      </div>
    </motion.main>
  );
};

export default Dashboard;