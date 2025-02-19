import React, { useState } from "react";
import { Calendar, Clock, Info, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import axiosInstance from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ClosurePlannerComponent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    closureDate: "",
    reason: "",
    duration: { value: "", unit: "days" }
  });

  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!formData.closureDate) {
      errors.closureDate = "Please select a closure date";
    }
    if (!formData.reason.trim()) {
      errors.reason = "Please provide a reason for closure";
    }
    if (!formData.duration.value) {
      errors.duration = "Please specify the duration";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getExpiryDate = () => {
    if (!formData.closureDate || !formData.duration.value) return null;

    const date = new Date(formData.closureDate);
    const daysToAdd = formData.duration.unit === "weeks"
      ? formData.duration.value * 7
      : formData.duration.value;

    date.setDate(date.getDate() + parseInt(daysToAdd));
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await axiosInstance.post("/closure/plan", {
        date: formData.closureDate,
        reason: formData.reason,
        duration: formData.duration
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/closure/plans');
      }, 2000);
    } catch (error) {
      console.error("Error submitting closure plan:", error);
      setFormErrors(prev => ({ ...prev, submit: "Failed to submit. Please try again." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/closure/plans')}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Closure Plans
          </button>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-green-50 text-green-800 rounded-lg p-4 flex items-center"
              >
                <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                <span>Closure plan created successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Create Closure Plan</h1>
            <p className="text-blue-100">Schedule a new period of store closure</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Closure Date
              </label>
              <input
                type="date"
                value={formData.closureDate}
                onChange={(e) => setFormData(prev => ({ ...prev, closureDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200 hover:border-blue-300"
                min={new Date().toISOString().split('T')[0]}
              />
              {formErrors.closureDate && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {formErrors.closureDate}
                </p>
              )}
            </div>

            {/* Reason Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-500" />
                Reason for Closure
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200 hover:border-blue-300 resize-none"
                rows="4"
                placeholder="Enter the reason for store closure..."
              />
              {formErrors.reason && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {formErrors.reason}
                </p>
              )}
            </div>

            {/* Duration Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Duration
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Duration"
                  min="1"
                  value={formData.duration.value}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    duration: { ...prev.duration, value: e.target.value }
                  }))}
                  className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200 hover:border-blue-300"
                />
                <select
                  value={formData.duration.unit}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    duration: { ...prev.duration, unit: e.target.value }
                  }))}
                  className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200 hover:border-blue-300 bg-white"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
              {formErrors.duration && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {formErrors.duration}
                </p>
              )}
            </div>

            {/* Expiry Preview */}
            {getExpiryDate() && (
              <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Closure will end on:</p>
                  <p className="text-sm text-gray-600">{getExpiryDate()}</p>
                </div>
              </div>
            )}

            {formErrors.submit && (
              <div className="bg-red-50 text-red-800 rounded-lg p-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
                <span>{formErrors.submit}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-medium
                       hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Plan...
                </span>
              ) : (
                "Create Closure Plan"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ClosurePlannerComponent;