// components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  console.log('Token from storage:', token);

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;