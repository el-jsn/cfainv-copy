// components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "10px 20px",
        backgroundColor: "#FF4D4D",
        color: "white",
        border: "none",
        borderRadius: "5px",
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
