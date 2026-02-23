import React from "react";
import { Navigate } from "react-router-dom";

function DealerRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔐 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Not dealer
  if (role !== "DEALER") {
    return <Navigate to="/" replace />;
  }

  // ✅ Dealer allowed
  return children;
}

export default DealerRoute;
