import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import { Trash2, Calendar, Package, Clock, Plus, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MessageListPage = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/adjustment/data");
        setMessages(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Unable to fetch messages. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (messageId) => {
    try {
      await axiosInstance.delete(`/adjustment/data/${messageId}`);
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message._id !== messageId)
      );
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Failed to delete message. Please try again.");
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInSeconds = Math.floor((expiry - now) / 1000);

    if (diffInSeconds < 0) return "Expired";

    const days = Math.floor(diffInSeconds / 86400);
    const hours = Math.floor((diffInSeconds % 86400) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getTimeRemainingColor = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInHours = Math.floor((expiry - now) / (1000 * 60 * 60));

    if (diffInHours <= 2) return "text-red-500 font-semibold";
    if (diffInHours <= 12) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-extrabold text-indigo-800 mb-3">
            Manual Allocation Adjustment Center
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            View and manage your active modifications. All Modifications automatically expire based on their lifecycle.
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg flex items-center text-red-700">
            <AlertCircle className="mr-3 w-6 h-6" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl p-10 text-center border border-gray-200 shadow-lg"
              >
                <p className="text-gray-500 text-lg">
                  No active modifications at the moment
                </p>
                <p className="text-gray-400 mt-2">
                  Click the + button to adjust an allocation
                </p>
              </motion.div>
            ) : (
              <div className="space-y-5">
                {messages.map((message) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-grow pr-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-indigo-500" />
                          <span className="text-gray-700">{message.day}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Package className="w-5 h-5 text-indigo-500" />
                          <span className="text-gray-800 font-semibold">
                            {message.product} {message.message}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-indigo-500" />
                          <span className={`${getTimeRemainingColor(message.expiresAt)}`}>
                            {formatTimeRemaining(message.expiresAt)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(message._id)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        aria-label="Delete message"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      <Link
        to="/data/message/add"
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
        aria-label="Add new message"
      >
        <Plus className="w-7 h-7" />
      </Link>
    </div>
  );
};

export default MessageListPage;