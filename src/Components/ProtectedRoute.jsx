import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/*
  ProtectedRoute - wraps protected pages.
  Uses localStorage key "isLoggedIn" (string "true") or presence of "currentUser".
*/
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true" || !!localStorage.getItem("currentUser");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;