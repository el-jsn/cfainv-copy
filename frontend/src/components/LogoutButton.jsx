// components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { red } from "@mui/material/colors";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <Button
      onClick={handleLogout}
      variant="contained"
      sx={{
        backgroundColor: red[500],
        color: 'white',
        '&:hover': {
          backgroundColor: red[700],
        },
      }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;