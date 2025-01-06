import React, { useState, useCallback } from "react";
import * as xlsx from "xlsx";
import axiosInstance from "./axiosInstance";

// Configuration for item categories and their corresponding search terms
const ITEM_CATEGORIES = {
  Filets: [
    "CAN Sandwich - CFA Dlx w/ Proc Ched",
    "CAN Sandwich - CFA Dlx w/ Ched",
    "CAN Sandwich - CFA Dlx w/ Jack",
    "Sandwich - CFA",
    "Sandwich - CFA Dlx No Cheese",
    "Salad - Signature Cobb w/ CFA Filet",
    "Salad - Spicy SW w/ CFA Filet",
  ],
  "Spicy Filets": [
    "CAN Sandwich - Spicy Dlx w/ Proc Ched",
    "CAN Sandwich - Spicy Dlx w/ Ched",
    "CAN Sandwich - Spicy Dlx w/ Jack",
    "Sandwich - Spicy Chicken",
    "Sandwich - Spicy Dlx No Cheese",
    "Salad - Signature Cobb w/ Spicy Filet",
    "Salad - Spicy SW w/ Spicy Filet",
  ],
  "Grilled Filets": [
    "CAN Sandwich - Grilled Club w/ Cheddar",
    "CAN Sandwich - Grilled Club w/ Jack",
    "CAN Sandwich - Grilled Club w/ Proc Ched",
    "Sandwich - Grilled",
    "Sandwich - Grilled Club w/No Cheese",
    "Salad - Signature Cobb w/ Hot Grilled Filet",
    "Salad - Spicy SW w/ Hot Grld Filet",
    "Test - Salad - Signature Cobb w/Spicy",
  ],
  "Grilled Nuggets": {
    "Nuggets Grilled, 12 Count": 12,
    "Nuggets Grilled, 8 Count": 8,
    "Nuggets Grilled, 5 Count": 5,
    "Salad - Spicy SW w/ Grld Nuggets": 8,
    "Salad – Signature Cobb w/ Grilled Nuggets": 8,
  },
  Nuggets: {
    "Nuggets, 12 Count": 12,
    "Nuggets, 8 Count": 8,
    "Nuggets, 30 Count": 30,
    "Nuggets, 5 Count": 5,
    "Salad - Signature Cobb w/ Nuggets": 8,
    "Salad - Spicy SW w/ Nuggets": 8,
  },
  "Spicy Strips": {
    "CAN - Salad - Extra Spicy Strips": 1,
    "Test - Spicy Strips, 3 Count": 3,
    "Test - Spicy Strips, 4 Count": 4,
  },
};

const EnhancedUTPUpdate = () => {
  const [utpData, setUtpData] = useState({});
  const [analysisResults, setAnalysisResults] = useState(null);
  const [salesVariance, setSalesVariance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const calculateUtps = useCallback((jsonData) => {
    let updatedUtpData = {};
    for (const category in ITEM_CATEGORIES) {
      updatedUtpData[category] = 0;
      for (const item of jsonData) {
        const itemName = item.__EMPTY;
        const itemCount = item.__EMPTY_17;
        if (Array.isArray(ITEM_CATEGORIES[category])) {
          if (ITEM_CATEGORIES[category].includes(itemName)) {
            updatedUtpData[category] += itemCount;
          }
        } else {
          if (ITEM_CATEGORIES[category][itemName]) {
            updatedUtpData[category] += itemCount * ITEM_CATEGORIES[category][itemName];
          }
        }
      }
    }
    return updatedUtpData;
  }, []);

  const analyzeSalesReport = useCallback((jsonData) => {
    const negativeCountItems = jsonData.filter((item) => item.__EMPTY_17 < 0);
    const lowSoldCountItems = jsonData.filter(
      (item) => item.__EMPTY_18 < 10 && item.__EMPTY_18 >= 0
    );
    const promoEffectiveness = jsonData
      .map((item) => ({
        item: item.__EMPTY,
        totalSold: item.__EMPTY_18,
        promoFree: item.__EMPTY_15,
        digitalOffer: item.__EMPTY_16,
      }))
      .filter((item) => item.promoFree > 0 || item.digitalOffer > 0);

    return {
      negativeCountItems,
      lowSoldCountItems,
      promoEffectiveness,
    };
  }, []);

  const calculateSalesVariance = useCallback((jsonData) => {
    const varianceThreshold = 5;

    return jsonData
      .map((item) => ({
        name: item.__EMPTY,
        variance: item.__EMPTY_17 - item.__EMPTY_18,
        totalCount: item.__EMPTY_17,
        soldCount: item.__EMPTY_18,
      }))
      .filter((item) => Math.abs(item.variance) > varianceThreshold);
  }, []);

  const handleFileUpload = (file) => {
    setErrorMessage("");
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        const updatedUtpData = calculateUtps(jsonData);
        setUtpData(updatedUtpData);

        const analysis = analyzeSalesReport(jsonData);
        setAnalysisResults(analysis);

        const variance = calculateSalesVariance(jsonData);
        setSalesVariance(variance);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setErrorMessage("Error parsing the Excel file. Please ensure it's a valid .xlsx file.");
      } finally {
        setIsDragActive(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage("Error reading the file.");
      setIsDragActive(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragActive(false);
      const file = event.dataTransfer.files[0];
      if (file && file.name.endsWith(".xlsx")) {
        handleFileUpload(file);
      } else {
        setErrorMessage("Please upload a valid .xlsx file.");
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleBrowse = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await axiosInstance.post("/upt/bulk", utpData);
      setSuccessMessage("UPTs submitted successfully!");
      // Consider more user-friendly feedback instead of immediate redirection
      // You might want to clear the data or offer to upload another file
    } catch (error) {
      console.error("Error submitting data:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to submit UPTs. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-center">
                Enhanced UPT Update
              </h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div
                  className={`border-dashed border-2 p-6 mt-6 rounded-md text-center cursor-pointer ${isDragActive
                      ? "bg-gray-50 border-indigo-400"
                      : "border-gray-300"
                    }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m-20 4h32"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-2 flex justify-center text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".xlsx, .xls"
                        onChange={handleBrowse}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">.xlsx files only</p>
                </div>

                {errorMessage && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {errorMessage}</span>
                  </div>
                )}

                {isLoading && (
                  <div className="text-center">Processing your data...</div>
                )}

                {successMessage && (
                  <div
                    className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                  </div>
                )}

                {salesVariance && salesVariance.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mt-6">
                      Sales Variance Analysis
                    </h2>
                    <p className="text-sm text-gray-500">
                      Items with significant variance between total count and
                      sold count.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Variance
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Count
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sold Count
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {salesVariance.map((item) => (
                            <tr key={item.name}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                {item.variance}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                {item.totalCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                {item.soldCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {analysisResults && (
                  <div className="mt-6">
                    {analysisResults.negativeCountItems.length > 0 && (
                      <div>
                        <h3 className="text-md font-semibold mt-4 text-red-600">
                          Potential Overstock/Waste:
                        </h3>
                        <ul>
                          {analysisResults.negativeCountItems.map((item) => (
                            <li key={item.__EMPTY} className="text-sm mb-1">
                              <span className="font-semibold">
                                {" "}
                                {item.__EMPTY}
                              </span>
                              : {item.__EMPTY_17} (Count / $1000)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResults.lowSoldCountItems.length > 0 && (
                      <div>
                        <h3 className="text-md font-semibold mt-4 text-yellow-600">
                          Potentially Low Performing Items:
                        </h3>
                        <ul>
                          {analysisResults.lowSoldCountItems.map((item) => (
                            <li key={item.__EMPTY} className="text-sm">
                              {item.__EMPTY}: {item.__EMPTY_18} (Sold)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResults.promoEffectiveness.length > 0 && (
                      <div>
                        <h3 className="text-md font-semibold mt-4 text-green-600">
                          Promotion Effectiveness:
                        </h3>
                        <ul>
                          {analysisResults.promoEffectiveness.map((item) => (
                            <li key={item.item} className="text-sm">
                              {item.item}: Sold - {item.totalSold}, Free -{" "}
                              {item.promoFree}, Digital Offers -{" "}
                              {item.digitalOffer}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {Object.keys(utpData).length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold">Calculated UPTs:</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              UPT
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(utpData).map(([key, value]) => (
                            <tr key={key}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {key}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="pt-6 text-center">
                  <button
                    type="button"
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={isLoading || Object.keys(utpData).length === 0}
                  >
                    {isLoading ? "Submitting..." : "Submit UPTs"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedUTPUpdate;