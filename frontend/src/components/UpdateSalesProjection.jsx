import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";

const UpdateSalesProjection = () => {
  const [sales, setSales] = useState({
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSalesProjection = async () => {
      try {
        const response = await axiosInstance.get("/sales");
        const fetchedSales = response.data;

        const sortedSales = fetchedSales.reduce((acc, { day, sales }) => {
          acc[day] = sales;
          return acc;
        }, {});

        setSales((prevSales) => ({
          ...prevSales,
          ...sortedSales,
        }));
      } catch (error) {
        console.error("Error fetching sales projections:", error);
      }
    };
    fetchSalesProjection();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSales((prevSales) => ({
      ...prevSales,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axiosInstance.post("/sales/bulk", sales);
      setMessage("Sales projections updated successfully!");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error updating sales projections:", error);
      setMessage("Failed to update sales projections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-center tracking-wide">
              Sales Projection Update
            </h1>
            <p className="text-center text-green-100 mt-2 text-sm md:text-base">
              Enter your weekly sales projections
            </p>
          </div>

          {/* Form Container */}
          <form 
            onSubmit={handleSubmit} 
            className="p-6 md:p-10 space-y-6"
          >
            {Object.keys(sales).map((day) => (
              <div key={day} className="relative">
                <label
                  htmlFor={day}
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {day}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    id={day}
                    name={day}
                    value={sales[day]}
                    onChange={handleChange}
                    placeholder={`Enter sales for ${day}`}
                    className="w-full pl-7 pr-4 py-3 border-2 border-gray-300 
                               rounded-xl focus:outline-none focus:ring-2 
                               focus:ring-emerald-500 focus:border-transparent 
                               transition duration-300 
                               text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold 
                           transition duration-300 transform hover:scale-105 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 
                           ${loading 
                             ? "bg-gray-400 cursor-not-allowed" 
                             : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:scale-95"
                           }`}
              >
                {loading ? "Updating..." : "Submit Projections"}
              </button>
            </div>

            {/* Status Message */}
            {message && (
              <div 
                className={`mt-4 p-3 rounded-xl text-center font-medium transition-all duration-300 
                           ${message.includes("successfully") 
                             ? "bg-green-100 text-green-700" 
                             : "bg-red-100 text-red-700"}`}
              >
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Optional: Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-200 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-green-200 opacity-20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default UpdateSalesProjection;