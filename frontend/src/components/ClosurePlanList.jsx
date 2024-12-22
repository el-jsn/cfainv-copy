import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Plus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';

const ClosurePlanList = () => {
  const [closurePlans, setClosurePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, planId: null });
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
      // Refresh the list after deletion
      fetchClosurePlans();
    } catch (error) {
      console.error('Error deleting closure plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Store Closure Plans</h1>
            <p className="text-gray-600">Manage your store's scheduled closures</p>
          </div>
        </div>

        {/* Main Content */}
        {closurePlans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Calendar className="w-12 h-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">No Closure Plans</h3>
              <p className="text-gray-500">Get started by adding your first store closure plan.</p>
              <button 
                onClick={handleAddNew}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                Add Closure Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {closurePlans.map((plan) => (
              <div 
                key={plan._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative group"
              >
                {/* Delete Button */}
                <button
                  onClick={() => setDeleteModal({ show: true, planId: plan._id })}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-50 text-red-500 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200
                           hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Delete closure plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <h2 className="text-xl font-bold text-gray-900">
                      {formatDate(plan.date)}
                    </h2>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 font-medium">{plan.reason}</p>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Duration: {plan.duration.value} {plan.duration.unit}</span>
                  </div>
                  
                  {plan.expiresAt && (
                    <div className="flex items-center text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Expires: {formatDateTime(plan.expiresAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={handleAddNew}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg 
                   hover:bg-blue-600 hover:shadow-xl transform transition-all duration-200 
                   hover:scale-110 flex items-center justify-center"
          aria-label="Add new closure plan"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 transform transition-all duration-200 animate-fade-scale">
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
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.planId)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 
                           transition-colors duration-200 focus:outline-none focus:ring-2 
                           focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add this to your CSS for the modal animation
const style = `
  @keyframes fade-scale {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-scale {
    animation: fade-scale 0.2s ease-out;
  }
`;

export default ClosurePlanList;