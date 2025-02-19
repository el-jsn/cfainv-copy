import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import { Trash2, Calendar, Package, Clock, Plus, AlertCircle, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MessageListPage = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, expired
  const [searchTerm, setSearchTerm] = useState("");

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

  const getStatusBadge = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const isExpired = now > expiry;

    return isExpired ? (
      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        Expired
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        Active
      </span>
    );
  };

  const filteredMessages = messages
    .filter((message) => {
      if (filter === "active") {
        return new Date() < new Date(message.expiresAt);
      }
      if (filter === "expired") {
        return new Date() > new Date(message.expiresAt);
      }
      return true;
    })
    .filter((message) =>
      message.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.day.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 md:mb-0"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manual Allocation Adjustment Center
            </h1>
            <p className="text-gray-600">
              Manage and track your allocation modifications
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search modifications..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <select
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Modifications</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg flex items-center text-red-700"
          >
            <AlertCircle className="mr-3 w-6 h-6" />
            <span>{error}</span>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl p-10 text-center border border-gray-200 shadow-lg"
              >
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  No modifications found
                </p>
                <p className="text-gray-400 mt-2">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Click the + button to create a new modification"}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMessages.map((message) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-indigo-500" />
                        <span className="font-semibold text-gray-900">
                          {message.product}
                        </span>
                      </div>
                      {getStatusBadge(message.expiresAt)}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span className="text-gray-700">{message.day}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-grow">
                          <p className="text-gray-800">{message.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${getTimeRemainingColor(message.expiresAt)}`}>
                            {formatTimeRemaining(message.expiresAt)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDelete(message._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
                          aria-label="Delete modification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
        aria-label="Add new modification"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default MessageListPage;