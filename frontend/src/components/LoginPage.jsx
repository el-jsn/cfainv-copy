import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./axiosInstance";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "./AuthContext";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", {
        username,
        pin,
      });

      if (response.status === 200 && response.data.token) {
        login(response.data.token);
        const decodedToken = jwtDecode(response.data.token);
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo Container */}
          <div className="flex justify-center mb-8">
            <motion.img
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              src="./imgs/cfa.png"
              alt="Chick-fil-A Logo"
              className="h-32 w-auto drop-shadow-xl"
            />


          </div>

          {/* Login Form */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-red-100">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Welcome Back
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-medium">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-red-500 rounded-lg
                           text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50
                           transition-all duration-200"
                  placeholder="Enter your username"
                />
              </div>

              {/* PIN Input */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-medium">
                  PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-red-500 rounded-lg
                           text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50
                           transition-all duration-200"
                  placeholder="Enter your PIN"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg
                         font-medium hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 
                         focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white
                         transition-all duration-200 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 
                             group-hover:opacity-20 transition-opacity duration-200"></span>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/dev-info"
                className="text-gray-600 hover:text-red-600 text-sm transition-colors duration-200"
              >
                Need help? Contact Developer
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;