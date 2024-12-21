// components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode } from "jwt-decode";

const getTokenFromCookies = () => {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};


const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decoded.exp > currentTime; // Check if token is expired
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
};

const PrivateRoute = ({ children }) => {
  const token = getTokenFromCookies();

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
