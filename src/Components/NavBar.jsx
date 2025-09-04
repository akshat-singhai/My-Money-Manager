import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, Sun, Moon, Home, BarChart2, Clock, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./NavBar.css";

const navLinks = [

  { to: "/", label: "Dashboard", icon: <BarChart2 size={20} /> },
  { to: "/history", label: "History", icon: <Clock size={20} /> },
  { to: "/finance-tools", label: "Finance Tools", icon: <Wrench size={20} /> },
];

const isMobile = () => window.innerWidth <= 768;

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("darkMode") === "true");
  const [mobile, setMobile] = useState(isMobile());

  useEffect(() => {
    document.body.classList.toggle("dark-mode", dark);
    localStorage.setItem("darkMode", dark);
  }, [dark]);

  useEffect(() => {
    const handleResize = () => setMobile(isMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu on route change or resize to desktop
  useEffect(() => {
    if (!mobile) setMenuOpen(false);
  }, [mobile]);

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
                <span style={{ verticalAlign: "middle", marginRight: 8 }}>{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;