import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

const NavBar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/add-transaction">Add Transaction</Link>
        </li>
        <li>
          <Link to="/history">Transaction History</Link>
        </li>
        <li>
          <Link to="/finance-tools">Finance Tools</Link>
        </li>
        <li>
          <Link to="/borrow-lend">Borrow/Lend</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;