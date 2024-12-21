import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, PlusCircle, MinusCircle, Calendar, Package } from "lucide-react";
import axiosInstance from "./axiosInstance";

const MessageFormComponent = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    day: "Monday",
    product: "Nuggets",
    message: {
      casesOperation: "+",
      casesQuantity: "",
      bagsOperation: "+",
      bagsQuantity: ""
    },
    duration: { value: "", unit: "days" },
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if ((!formData.message.casesQuantity && !formData.message.bagsQuantity) ||
        (isNaN(formData.message.casesQuantity) && isNaN(formData.message.bagsQuantity))) {
      errors.quantity = "Please enter a valid quantity for cases or bags";
    }
    if (!formData.duration.value || isNaN(formData.duration.value)) {
      errors.duration = "Please enter a valid duration";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const durationInSeconds = formData.duration.unit === "weeks" ? 
      formData.duration.value * 7 * 24 * 60 * 60 : 
      formData.duration.value * 24 * 60 * 60;

    const messageString = [
      formData.message.casesQuantity ? `${formData.message.casesOperation}${formData.message.casesQuantity} cases` : null,
      formData.message.bagsQuantity ? `${formData.message.bagsOperation}${formData.message.bagsQuantity} bags` : null
    ].filter(Boolean).join(" and ");

    const dataToSend = {
      day: formData.day,
      product: formData.product,
      message: messageString,
      durationInSeconds,
    };

    try {
      await axiosInstance.post("/msg/data", dataToSend);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/data/message/all");
      }, 2000);
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const generateSummary = () => {
    const casesText = formData.message.casesQuantity ? 
      `${formData.message.casesOperation}${formData.message.casesQuantity} cases` : "";
    const bagsText = formData.message.bagsQuantity ? 
      `${formData.message.bagsOperation}${formData.message.bagsQuantity} bags` : "";
    const adjustmentText = [casesText, bagsText].filter(Boolean).join(" and ");
    
    const futureDate = new Date();
    const daysToAdd = formData.duration.unit === "weeks" ? formData.duration.value * 7 : formData.duration.value;
    futureDate.setDate(futureDate.getDate() + parseInt(daysToAdd || 0));
    const formattedDate = futureDate.toDateString();
    
    return `On ${formData.day}, ${adjustmentText} of ${formData.product} would be adjusted and displayed until ${formattedDate}.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Success!</h3>
              <p className="text-gray-600">Modification successful. Redirecting...</p>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 text-white py-4 px-6 flex items-center justify-center space-x-3">
          <Package className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Modify Allocation</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="mr-2 w-5 h-5 text-blue-500" />
              Day of the Week
            </label>
            <select
              value={formData.day}
              onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Package className="mr-2 w-5 h-5 text-blue-500" />
              Product
            </label>
            <select
              value={formData.product}
              onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
            >
              {["Nuggets", "Filets", "Spicy Filets", "Grilled Filets", "Grilled Nuggets", "Spicy Strips"].map((product) => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Details
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Cases</label>
                <div className="flex items-center">
                  <select
                    value={formData.message.casesOperation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      message: { ...prev.message, casesOperation: e.target.value }
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                  >
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={formData.message.casesQuantity}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      message: { ...prev.message, casesQuantity: e.target.value }
                    }))}
                    className="flex-1 px-2 py-1 border-y border-r border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bags</label>
                <div className="flex items-center">
                  <select
                    value={formData.message.bagsOperation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      message: { ...prev.message, bagsOperation: e.target.value }
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                  >
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={formData.message.bagsQuantity}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      message: { ...prev.message, bagsQuantity: e.target.value }
                    }))}
                    className="flex-1 px-2 py-1 border-y border-r border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                  />
                </div>
              </div>
            </div>
            {formErrors.quantity && (
              <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Duration"
                value={formData.duration.value}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: { ...prev.duration, value: e.target.value } }))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
              />
              <select
                value={formData.duration.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: { ...prev.duration, unit: e.target.value } }))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
              >
                {["days", "weeks"].map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            {formErrors.duration && (
              <p className="text-red-500 text-xs mt-1">{formErrors.duration}</p>
            )}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-700 mb-2">Summary</h3>
            <p className="text-gray-600 text-sm">{generateSummary()}</p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <span>Modify</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageFormComponent;
