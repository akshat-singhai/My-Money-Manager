import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import "./Auth.css";

const hashPassword = (password) => {
  return btoa(password);
};

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (
      storedUser &&
      storedUser.username === username &&
      storedUser.password === hashPassword(password)
    ) {
      localStorage.setItem("isLoggedIn", true);
      toast.success("Login successful! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } else {
      toast.error("Invalid credentials! Please try again or Register first.");
    }
  };

  return (
    <div className="auth-container">
      <Toaster position="top-center" />
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="show-pass-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit" className="auth-form-button">Login</button>
        <p onClick={() => navigate("/register")} className="auth-switch">
          Don’t have an account? Register
        </p>
      </form>
    </div>
  );
};

export default Login;
