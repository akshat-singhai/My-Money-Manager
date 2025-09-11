import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, Sun, Moon, Clock, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHandHoldingUsd, FaWallet, FaPiggyBank, FaCoins, FaBalanceScale, FaReceipt, FaSignOutAlt } from "react-icons/fa";

import "./NavBar.css";

const navLinks = [
  { to: "/", label: "Dashboard", icon: <FaWallet size={20} /> },            // Wallet = Overview
  { to: "/history", label: "History", icon: <FaReceipt size={20} /> },      // Transaction history
  { to: "/borrow-lend", label: "Udhari", icon: <FaBalanceScale size={20} /> }, // Borrow/Lend
  { to: "/finance-tools", label: "Finance Tools", icon: <FaCoins size={20} /> }, // Coins = Tools/Savings
];

const isMobile = () => window.innerWidth <= 768;

const NavBar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("darkMode") === "true");
  const [mobile, setMobile] = useState(isMobile());
  const [username, setUsername] = useState("");

  useEffect(() => {
    document.body.classList.toggle("dark-mode", dark);
    localStorage.setItem("darkMode", dark);
  }, [dark]);

  useEffect(() => {
    const handleResize = () => setMobile(isMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!mobile) setMenuOpen(false);
  }, [mobile]);

  // Get logged-in username
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.username) {
      setUsername(storedUser.username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <nav className="nav-container">
      <div className="nav-row">
        <div className="nav-header">
          {mobile && (
            <button
              className="menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <motion.span
                animate={{ rotate: menuOpen ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ display: "inline-block" }}
              >
                <Menu />
              </motion.span>
            </button>
          )}
          {username && <span className="welcome-text">👋 Welcome, {username}</span>}
        </div>
        <button
          className="theme-toggle"
          aria-label="Toggle dark mode"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {(!mobile || menuOpen) && (
          <motion.div
            className={`nav-links${mobile && menuOpen ? " active" : ""}`}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            key="nav-links"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => "navBox" + (isActive ? " active" : "")}
                end={link.to === "/"}
                onClick={() => setMenuOpen(false)}
              >
                <span style={{ verticalAlign: "middle", marginRight: 8 }}>
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}

            {/* Logout Button with Icon */}
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt style={{ marginRight: 6 }} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;
