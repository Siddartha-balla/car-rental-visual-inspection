import React from "react";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (role !== "ADMIN") {
    alert("Access denied: Admins only");
    return <Navigate to="/" replace />;
  }

  // Admin allowed
  return children;
}

export default AdminRoute;
