import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Plus, Trash2, X, Search, Filter, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';

const ClosurePlanList = () => {
  const [closurePlans, setClosurePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, planId: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, expired
  const navigate = useNavigate();

  // Helper function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
      .toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
  };

  // Helper function to format date-time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
      .toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  };

  const fetchClosurePlans = async () => {
    try {
      const response = await axiosInstance.get('/closure/plans');
      setClosurePlans(Array.isArray(response.data) ? response.data : [response.data]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching closure plans:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosurePlans();
  }, []);

  const handleAddNew = () => {
    navigate('/closure/plan/add');
  };

  const handleDelete = async (planId) => {
    try {
      await axiosInstance.delete(`/closure/plan/${planId}`);
      setDeleteModal({ show: false, planId: null });
      fetchClosurePlans();
    } catch (error) {
      console.error('Error deleting closure plan:', error);
    }
  };

  const getStatusBadge = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const isExpired = now > expiry;

    return isExpired ? (
      <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        Expired
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        Active
      </span>
    );
  };

  const filteredPlans = closurePlans
    .filter(plan => {
      if (filter === 'active') {
        return new Date() < new Date(plan.expiresAt);
      }
      if (filter === 'expired') {
        return new Date() > new Date(plan.expiresAt);
      }
      return true;
    })
    .filter(plan =>
      plan.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(plan.date).toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-gray-900">Store Closure Plans</h1>
              <p className="text-gray-600 mt-1">Manage and schedule your store closures</p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Plans</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence>
          {filteredPlans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-md p-12 text-center"
            >
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Closure Plans Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first store closure plan"}
              </p>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg
                         hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Closure Plan
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300
                           border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDate(plan.date)}
                        </h3>
                      </div>
                      {getStatusBadge(plan.expiresAt)}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-700">{plan.reason}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Duration: {plan.duration.value} {plan.duration.unit}</span>
                      </div>

                      {plan.expiresAt && (
                        <div className="flex items-center text-sm text-gray-600">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span>Expires: {formatDateTime(plan.expiresAt)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => setDeleteModal({ show: true, planId: plan._id })}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg
                                 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNew}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg
                   hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </motion.button>

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteModal.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                  <button
                    onClick={() => setDeleteModal({ show: false, planId: null })}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this closure plan? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setDeleteModal({ show: false, planId: null })}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteModal.planId)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600
                             transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClosurePlanList;