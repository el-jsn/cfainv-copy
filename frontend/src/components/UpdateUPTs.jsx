import React, { useState } from "react";
import * as xlsx from "xlsx";
import axiosInstance from "./axiosInstance";

const UpdateUTPs = () => {
  const [utpData, setUtpData] = useState({
    Filets: 0,
    "Spicy Filets": 0,
    "Grilled Filets": 0,
    "Grilled Nuggets": 0,
    Nuggets: 0,
    "Spicy Strips": 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileUpload = (file) => {
    const reader = new FileReader();

    const searchCFA = [
      "CAN Sandwich - CFA Dlx w/ Proc Ched",
      "CAN Sandwich - CFA Dlx w/ Ched",
      "CAN Sandwich - CFA Dlx w/ Jack",
      "Sandwich - CFA",
      "Sandwich - CFA Dlx No Cheese",
      "Salad - Signature Cobb w/ CFA Filet",
      "Salad - Spicy SW w/ CFA Filet",
    ];

    const searchSpicy = [
      "CAN Sandwich - Spicy Dlx w/ Proc Ched",
      "CAN Sandwich - Spicy Dlx w/ Ched",
      "CAN Sandwich - Spicy Dlx w/ Jack",
      "Sandwich - Spicy Chicken",
      "Sandwich - Spicy Dlx No Cheese",
      "Salad - Signature Cobb w/ Spicy Filet",
      "Salad - Spicy SW w/ Spicy Filet",
    ];

    const searchGrilledFilets = [
      "CAN Sandwich - Grilled Club w/ Cheddar",
      "CAN Sandwich - Grilled Club w/ Jack",
      "CAN Sandwich - Grilled Club w/ Proc Ched",
      "Sandwich - Grilled",
      "Sandwich - Grilled Club w/No Cheese",
      "Salad - Signature Cobb w/ Hot Grilled Filet",
      "Salad - Spicy SW w/ Hot Grld Filet",
      "Test - Salad - Signature Cobb w/Spicy",
    ];

    const searchGrilledNuggets = {
      "Nuggets Grilled, 12 Count": 12,
      "Nuggets Grilled, 8 Count": 8,
      "Nuggets Grilled, 5 Count": 5,
      "Salad - Spicy SW w/ Grld Nuggets": 8,
      "Salad – Signature Cobb w/ Grilled Nuggets": 8,
    };

    const searchNuggets = {
      "Nuggets, 12 Count": 12,
      "Nuggets, 8 Count": 8,
      "Nuggets, 30 Count": 30,
      "Nuggets, 5 Count": 5,
      "Salad - Signature Cobb w/ Nuggets": 8,
      "Salad - Spicy SW w/ Nuggets": 8,
    };

    const searchStrips = {
      "CAN - Salad - Extra Spicy Strips": 1,
      "Test - Spicy Strips, 3 Count": 3,
      "Test - Spicy Strips, 4 Count": 4,
    };

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = xlsx.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);

      let updatedUtpData = { ...utpData };

      jsonData.forEach((item) => {
        if (searchCFA.includes(item.__EMPTY)) {
          updatedUtpData.Filets += item.__EMPTY_17;
        } else if (searchSpicy.includes(item.__EMPTY)) {
          updatedUtpData["Spicy Filets"] += item.__EMPTY_17;
        } else if (searchGrilledFilets.includes(item.__EMPTY)) {
          updatedUtpData["Grilled Filets"] += item.__EMPTY_17;
        } else if (searchGrilledNuggets[item.__EMPTY]) {
          updatedUtpData["Grilled Nuggets"] += item.__EMPTY_17 * searchGrilledNuggets[item.__EMPTY];
        } else if (searchNuggets[item.__EMPTY]) {
          updatedUtpData.Nuggets += item.__EMPTY_17 * searchNuggets[item.__EMPTY];
        } else if (searchStrips[item.__EMPTY]) {
          updatedUtpData["Spicy Strips"] += item.__EMPTY_17 * searchStrips[item.__EMPTY];
        }
      });

      setUtpData(updatedUtpData);
      setIsDragActive(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleBrowse = (event) => {
    const file = event.target.files[0];
    handleFileUpload(file);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/upt/bulk", utpData);
      setSuccessMessage("Data submitted successfully!");
      setTimeout(() => {
        window.location.href = "/"; // Redirect to the home page
      }, 2000);
    } catch (error) {
      console.error("Error submitting data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-center tracking-wide">
              UPT Update Dashboard
            </h1>
            <p className="text-center text-indigo-100 mt-2 text-sm md:text-base">
              Upload and process your UPT Excel files
            </p>
          </div>

          {/* File Upload Area */}
          <div 
            className={`p-6 md:p-10 transition-all duration-300 ease-in-out 
              ${isDragActive 
                ? "bg-indigo-50 border-indigo-300 border-dashed border-4" 
                : "bg-white border-dashed border-2 border-gray-300"
              }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="p-5 bg-indigo-100 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 text-indigo-600"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-lg">
                Drag and drop your Excel file here
              </p>
              <p className="text-gray-500 text-sm">or</p>
              <label
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 
                           text-white rounded-lg cursor-pointer 
                           hover:from-indigo-600 hover:to-purple-700 
                           transition duration-300 
                           transform hover:scale-105 active:scale-95 
                           shadow-lg"
                htmlFor="fileInput"
              >
                Browse Files
              </label>
              <input
                type="file"
                id="fileInput"
                accept=".xlsx, .xls"
                onChange={handleBrowse}
                className="hidden"
              />
            </div>
          </div>

          {/* Status Messages */}
          {isLoading && (
            <div className="p-4 bg-blue-50 text-blue-600 text-center font-medium animate-pulse">
              Processing your data... Please wait
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-green-50 text-green-700 text-center font-bold animate-bounce">
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="p-6 md:p-8 bg-gray-50">
            <div className="flex justify-center mb-6">
              <button
                className="px-10 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
                           text-white rounded-lg 
                           hover:from-green-600 hover:to-emerald-700 
                           transition duration-300 
                           transform hover:scale-105 active:scale-95 
                           shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit UPTs"}
              </button>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Calculated UPT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(utpData).map(([key, value]) => (
                    <tr key={key} className="hover:bg-indigo-50 transition duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{key}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUTPs;