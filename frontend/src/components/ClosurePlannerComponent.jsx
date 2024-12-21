import React, { useState } from "react";
import { Calendar, Clock, Info, ArrowLeft, CheckCircle } from "lucide-react";
import axiosInstance from "./axiosInstance";
import { useNavigate } from "react-router-dom";

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/closure/plans')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Closure Plans
        </button>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg backdrop-filter">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-8">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Plan Store Closure</h2>
                <p className="text-blue-100 mt-1">Schedule a new store closure period</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Date Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="mr-2 w-5 h-5 text-blue-500" /> 
                Closure Date
              </label>
              <input 
                type="date" 
                value={formData.closureDate}
                onChange={(e) => setFormData(prev => ({ ...prev, closureDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200 outline-none hover:border-blue-300"
              />
              {formErrors.closureDate && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <Info className="w-4 h-4 mr-1" /> {formErrors.closureDate}
                </p>
              )}
            </div>

            {/* Reason Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Info className="mr-2 w-5 h-5 text-blue-500" /> 
                Reason for Closure
              </label>
              <textarea 
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200 outline-none hover:border-blue-300 resize-none"
                rows="3"
                placeholder="Enter the reason for store closure..."
              />
              {formErrors.reason && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <Info className="w-4 h-4 mr-1" /> {formErrors.reason}
                </p>
              )}
            </div>

            {/* Duration Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="mr-2 w-5 h-5 text-blue-500" />
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
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200 outline-none hover:border-blue-300"
                />
                <select 
                  value={formData.duration.unit}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    duration: { ...prev.duration, unit: e.target.value } 
                  }))}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200 outline-none hover:border-blue-300 bg-white"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
              {formErrors.duration && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <Info className="w-4 h-4 mr-1" /> {formErrors.duration}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-medium
                       hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </span>
              ) : (
                "Submit Closure Plan"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex items-center space-x-4 transform animate-scale-in">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Success!</h3>
              <p className="text-gray-600">Closure plan has been submitted</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add these animations to your global CSS or tailwind config
const style = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scale-in {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  .animate-scale-in {
    animation: scale-in 0.2s ease-out;
  }
`;

export default ClosurePlannerComponent;