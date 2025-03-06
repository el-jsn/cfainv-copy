// src/components/ThawingCabinet.js

import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { BackpackIcon, Clock, Maximize, Minimize, Settings, Calendar } from "lucide-react";
import axiosInstance from "./axiosInstance";
import { Link } from "react-router-dom";
import { ArrowBackIos } from "@mui/icons-material";
import { useAuth } from "./AuthContext";
import useSWR from 'swr';

const useCalculateThawingData = (salesData, utpData, bufferData, adjustments = [], salesProjectionConfig = null, futureProjections = [], isNextWeek = false) => {
  return useMemo(() => {
    console.log('Calculating with:', {
      salesData,
      utpData,
      bufferData,
      adjustments,
      salesProjectionConfig
    });

    // Add a default configuration if none exists
    const defaultConfig = {
      "Monday": { "Tuesday": 0, "Wednesday": 100, "Thursday": 0, "Friday": 0, "Saturday": 0 },
      "Tuesday": { "Monday": 0, "Wednesday": 100, "Thursday": 0, "Friday": 0, "Saturday": 0 },
      "Wednesday": { "Monday": 0, "Tuesday": 0, "Thursday": 100, "Friday": 0, "Saturday": 0 },
      "Thursday": { "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Friday": 100, "Saturday": 0 },
      "Friday": { "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Saturday": 100 },
      "Saturday": { "Monday": 100, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0 }
    };

    if (!salesData || !utpData || !bufferData) {
      console.log('Missing required data:', { salesData, utpData, bufferData });
      return [];
    }

    // Use the provided config or fall back to default
    const projectionConfig = salesProjectionConfig || defaultConfig;
    console.log('Using projection config:', projectionConfig);

    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const calculateBufferMultiplier = (bufferPrcnt = 0) => (100 + bufferPrcnt) / 100;

    const findBufferPrcnt = (productName) => {
      const item = Array.isArray(bufferData) ? bufferData.find(item => item.productName === productName) : null;
      return item?.bufferPrcnt ?? 0;
    };

    const bufferMultipliers = {
      Filets: calculateBufferMultiplier(findBufferPrcnt("Filets")),
      "Spicy Filets": calculateBufferMultiplier(findBufferPrcnt("Spicy Filets")),
      "Grilled Filets": calculateBufferMultiplier(findBufferPrcnt("Grilled Filets")),
      "Grilled Nuggets": calculateBufferMultiplier(findBufferPrcnt("Grilled Nuggets")),
      Nuggets: calculateBufferMultiplier(findBufferPrcnt("Nuggets")),
      "Spicy Strips": calculateBufferMultiplier(findBufferPrcnt("Spicy Strips")),
    };

    const utpValues = {
      Filets: utpData.find(item => item.productName === "Filets")?.utp || 1.0,
      "Spicy Filets": utpData.find(item => item.productName === "Spicy Filets")?.utp || 1.0,
      "Grilled Filets": utpData.find(item => item.productName === "Grilled Filets")?.utp || 1.0,
      "Grilled Nuggets": utpData.find(item => item.productName === "Grilled Nuggets")?.utp || 1.0,
      Nuggets: utpData.find(item => item.productName === "Nuggets")?.utp || 1.0,
      "Spicy Strips": utpData.find(item => item.productName === "Spicy Strips")?.utp || 1.0,
    };

    return daysOrder.map((day, index) => {
      const entry = salesData.find(e => e.day === day) || { day, sales: 0 };
      const today = new Date();

      // Calculate projected sales based on configuration
      const dayConfig = projectionConfig[day];
      let nextDaySales = 0;
      let salesCalculationDetails = [];

      if (dayConfig) {
        Object.entries(dayConfig).forEach(([sourceDay, percentage]) => {
          if (percentage > 0) {
            let sourceSales;
            let sourceDate;

            if (isNextWeek) {
              // For next week's view
              const nextMonday = new Date(today);
              // Get to next Monday first
              nextMonday.setDate(today.getDate() + (8 - today.getDay()));

              // Then calculate the target date based on the source day
              sourceDate = new Date(nextMonday);
              const daysToAdd = daysOrder.indexOf(sourceDay);
              sourceDate.setDate(nextMonday.getDate() + daysToAdd);

              // If it's Monday and we're looking at next week, look 2 weeks ahead
              if (sourceDay === 'Monday') {
                sourceDate.setDate(sourceDate.getDate() + 7);
              }

              // Skip Sunday
              if (sourceDate.getDay() === 0) {
                sourceDate.setDate(sourceDate.getDate() + 1);
              }
            } else {
              // Current week view
              if (sourceDay === 'Monday') {
                // For current week, if using Monday's sales, look at next week's Monday
                sourceDate = new Date(today);
                sourceDate.setDate(today.getDate() + (8 - today.getDay()));

                // If we landed on Sunday, move to Monday
                if (sourceDate.getDay() === 0) {
                  sourceDate.setDate(sourceDate.getDate() + 1);
                }
              } else {
                // Get to current week's Monday first
                const thisMonday = new Date(today);
                thisMonday.setDate(today.getDate() - today.getDay() + 1);

                // Then calculate the target date based on the source day
                sourceDate = new Date(thisMonday);
                const daysToAdd = daysOrder.indexOf(sourceDay);
                sourceDate.setDate(thisMonday.getDate() + daysToAdd);

                // If we landed on Sunday, move to next Monday
                if (sourceDate.getDay() === 0) {
                  sourceDate.setDate(sourceDate.getDate() + 1);
                }
              }
            }

            // Format date for comparison
            const dateStr = sourceDate.toISOString().split('T')[0];

            // Check future projections first, fall back to weekly if none exists
            sourceSales = futureProjections.find(proj =>
              new Date(proj.date).toISOString().split('T')[0] === dateStr
            )?.amount || salesData.find(e => e.day === sourceDay)?.sales || 0;

            nextDaySales += (sourceSales * (percentage / 100));
            salesCalculationDetails.push({
              day: sourceDay,
              percentage,
              amount: sourceSales,
              contribution: sourceSales * (percentage / 100),
              isFromFutureProjection: sourceSales !== salesData.find(e => e.day === sourceDay)?.sales,
              date: sourceDate
            });
          }
        });
      }
      console.log(`${day} nextDaySales:`, nextDaySales);

      const dayAdjustments = adjustments.filter(msg => msg.day === day);

      const applyMessage = (product, cases, bags = 0) => {
        const message = dayAdjustments.find(msg => msg.product === product);
        let finalCases = cases;
        let finalBags = bags;

        if (message) {
          const parts = message.message.split(' and ');
          parts.forEach(part => {
            const [change, unit] = part.trim().split(' ');
            const value = parseInt(change);
            if (!isNaN(value)) {
              if (unit === 'cases') {
                finalCases += value;
              } else if (unit === 'bags') {
                finalBags += value;
              }
            }
          });
        }
        return { cases: Math.max(0, finalCases), bags: Math.max(0, finalBags), modified: !!message };
      };

      const calculateCases = (utp, bufferMultiplier, divisor) => Math.ceil(((utp * (nextDaySales / 1000)) / divisor) * bufferMultiplier);

      const filetsCases = calculateCases(utpValues.Filets, bufferMultipliers.Filets, 158);
      const spicyCases = calculateCases(utpValues["Spicy Filets"], bufferMultipliers["Spicy Filets"], 141);
      const grilledFiletsBags = calculateCases(utpValues["Grilled Filets"], bufferMultipliers["Grilled Filets"], 26);
      const grilledFiletsCalculatedCases = Math.floor(grilledFiletsBags / 6);
      const remainingGrilledFiletsBags = grilledFiletsBags % 6;
      const grilledNuggetsBags = calculateCases(utpValues["Grilled Nuggets"], bufferMultipliers["Grilled Nuggets"], 189);
      const grilledNuggetsCalculatedCases = Math.floor(grilledNuggetsBags / 6);
      const remainingGrilledNuggetsBags = grilledNuggetsBags % 6;
      const nuggetsCases = calculateCases(utpValues.Nuggets, bufferMultipliers.Nuggets, 1132);
      const stripsBags = calculateCases(utpValues["Spicy Strips"], bufferMultipliers["Spicy Strips"], 53);
      const stripsCalculatedCases = Math.floor(stripsBags / 6);
      const remainingStripsBags = stripsBags % 6;

      return {
        day: entry.day,
        sales: nextDaySales,
        salesCalculation: salesCalculationDetails,
        filets: applyMessage("Filets", filetsCases),
        spicy: applyMessage("Spicy Filets", spicyCases),
        grilledFilets: applyMessage("Grilled Filets", grilledFiletsCalculatedCases, remainingGrilledFiletsBags),
        grilledNuggets: applyMessage("Grilled Nuggets", grilledNuggetsCalculatedCases, remainingGrilledNuggetsBags),
        nuggets: applyMessage("Nuggets", nuggetsCases),
        strips: applyMessage("Spicy Strips", stripsCalculatedCases, remainingStripsBags)
      };
    });
  }, [salesData, utpData, bufferData, adjustments, salesProjectionConfig, futureProjections, isNextWeek]);
};


const useFilteredClosures = (closures) => {
  return useMemo(() => {
    if (!closures) return [];

    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const currentWeekStart = new Date(todayUTC);
    currentWeekStart.setUTCDate(todayUTC.getUTCDate() - (todayUTC.getUTCDay() === 0 ? 6 : todayUTC.getUTCDay() - 1));
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setUTCDate(currentWeekStart.getUTCDate() + 5);

    return closures.filter((closure) => {
      const closureStartDateUTC = new Date(closure.date);
      const closureEndDateUTC = new Date(closureStartDateUTC);

      if (closure.duration) {
        const { value: durationValue, unit: durationUnit } = closure.duration;
        const daysToAdd = durationUnit === "weeks" ? (7 * durationValue) - 1 : durationValue - 1;
        closureEndDateUTC.setUTCDate(closureStartDateUTC.getUTCDate() + daysToAdd);
      }
      return closureStartDateUTC <= currentWeekEnd && closureEndDateUTC >= currentWeekStart;
    });
  }, [closures]);
};

const DayCard = memo(({ entry, currentDay, closures, messages, showAdminView }) => {
  const isToday = entry.day === currentDay;

  const closure = useMemo(() => {
    return closures.find(c => {
      const closureStartDate = new Date(c.date);
      const closureEndDate = new Date(closureStartDate);

      if (c.duration) {
        const { value: durationValue, unit: durationUnit } = c.duration;
        const daysToAdd = durationUnit === "weeks" ? (7 * durationValue) - 1 : durationValue - 1;
        closureEndDate.setUTCDate(closureStartDate.getUTCDate() + daysToAdd);
      }

      const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDayIndex = daysOfWeek.indexOf(entry.day);

      // Calculate the date of the current entry within the closure's week
      const entryDate = new Date(closureStartDate);
      const startDayIndex = closureStartDate.getUTCDay();
      let daysToAddForEntry = (currentDayIndex + 1) - (startDayIndex === 0 ? 7 : startDayIndex);

      if (daysToAddForEntry < 0) {
        daysToAddForEntry += 7;
      }

      entryDate.setUTCDate(closureStartDate.getUTCDate() + daysToAddForEntry);

      return entryDate >= closureStartDate && entryDate <= closureEndDate;
    });
  }, [closures, entry.day]);

  const dayMessages = useMemo(() => {
    // Filter out messages with [PREP] tag
    return messages.filter(msg => msg.day === entry.day && !msg.message.startsWith("[PREP]"));
  }, [messages, entry.day]);

  const productMessages = useMemo(() => {
    return dayMessages.filter(msg => msg.products);
  }, [dayMessages])

  const noProductMessages = useMemo(() => {
    return dayMessages.filter(msg => !msg.products || msg.products === "");
  }, [dayMessages])

  const productsMap = useMemo(() => {
    return {
      "Filets": { name: "Filets", data: entry.filets, bg: "bg-blue-300 text-gray-800", index: 0 },
      "Spicy Filets": { name: "Spicy Filets", data: entry.spicy, bg: "bg-purple-200 text-gray-800", index: 1 },
      "Grilled Filets": { name: "Grilled Fillets", data: entry.grilledFilets, bg: "bg-amber-200 text-gray-800", index: 2 },
      "Grilled Nuggets": { name: "Grilled Nuggets", data: entry.grilledNuggets, bg: "bg-gray-300 text-gray-800", index: 3 },
      "Nuggets": { name: "Nuggets", data: entry.nuggets, bg: "bg-pink-200 text-gray-800", index: 4 },
      "Spicy Strips": { name: "Spicy Strips", data: entry.strips, bg: "bg-red-400 text-gray-800", index: 5 },
    }
  }, [entry]);



  const renderProductBox = (productName) => {
    const productData = productsMap[productName];

    const relevantMessages = productMessages.filter(msg => {
      const products = msg.products ? msg.products.split(',') : [];
      return products.includes(productName)
    })

    if (!productData) return null;
    return (
      <div
        key={productData.index}
        className={`flex-1 ${productData.bg} p-2 m-1 rounded-md transition-all duration-200
                    hover:shadow-sm flex flex-col`}
      >
        <div className="font-semibold text-center mb-1 text-sm sm:text-base">{productData.name}</div>
        <div className={`text-center text-sm sm:text-base ${productData.data.modified ? "text-red-700 font-bold" : ""}`}>
          {productData.data.cases > 0 && <div>{productData.data.cases} cases</div>}
          {productData.data.bags > 0 && <div>{productData.data.bags} bags</div>}
        </div>
        {relevantMessages.length > 0 && (
          <div className="mt-2 space-y-1">
            {relevantMessages.map((msg, index) => (
              <div
                key={index}
                className="text-xs sm:text-sm bg-yellow-50 p-1 rounded-md text-yellow-800 border border-yellow-200"
              >
                {msg.message}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSalesDetails = () => {
    if (!showAdminView) return null;

    return (
      <div className="text-xs text-gray-600 mt-1 p-1 bg-gray-50 rounded shadow-inner">
        <div className="font-medium">Sales: ${entry.sales.toLocaleString()}</div>
        {entry.salesCalculation.length > 0 && (
          <div className="mt-1">
            <div className="font-medium">Calculation:</div>
            {entry.salesCalculation.map((calc, idx) => (
              <div key={idx} className="ml-2 flex flex-wrap items-center">
                <span className="font-medium text-blue-600">{calc.percentage}%</span> of {calc.day}
                {calc.date && <span className="ml-1 text-gray-500">({calc.date.toLocaleDateString()})</span>}
                <span className="mx-1 font-medium">${calc.amount.toLocaleString()}</span>
                = <span className="ml-1 font-bold text-green-600">${calc.contribution.toLocaleString()}</span>
                {calc.isFromFutureProjection && (
                  <span className="ml-1 text-blue-600 font-medium px-1 py-0.5 bg-blue-50 rounded-full text-[10px]">Future</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      key={entry.day}
      className={`h-full w-full flex flex-col transition-all duration-200
            ${isToday
          ? 'ring-2 ring-blue-500 shadow-lg border-transparent'
          : 'border border-gray-200 hover:shadow-md'
        } rounded-lg md:rounded-xl`}
    >
      <div
        className={`p-2 sm:p-2 rounded-t-lg md:rounded-t-xl font-bold text-center text-sm sm:text-base
              ${isToday
            ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
            : 'bg-gradient-to-r from-gray-100 to-gray-200'
          }`}
      >
        <div className="p-1">{entry.day}</div>
        {showAdminView && renderSalesDetails()}
        {noProductMessages.map((msg, index) => (
          <div key={index} className="mt-1 text-xs sm:text-sm bg-yellow-50 p-1 rounded-md text-yellow-800 border border-yellow-200">
            {msg.message}
          </div>
        ))}
      </div>

      {closure ? (
        <div className="flex-1 flex flex-col justify-center items-center p-2 sm:p-3 bg-gradient-to-br from-red-50 via-red-100 to-red-50 relative">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {[...Array(15)].map((_, i) => (
              <circle
                key={i}
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r={`${Math.random() * 40 + 10}`}
                fill="rgba(239, 68, 68, 0.1)"
                className="animate-float"
                style={{
                  animationDuration: `${Math.random() * 20 + 20}s`,
                  animationDelay: `${i * -0.2}s`
                }}
              />
            ))}
          </svg>
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-2">
              CLOSED
            </div>
            <div className="px-2 sm:px-3 py-1 bg-white rounded-lg md:rounded-xl shadow-md border border-red-200 transition-all duration-300 hover:shadow-xl hover:scale-105 backdrop-blur-sm bg-opacity-80">
              <div className="text-center text-red-800 font-semibold text-sm sm:text-base">
                {closure.reason}
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-8 h-8 bg-red-200 rounded-br-full opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-red-200 rounded-tl-full opacity-50"></div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 p-2 sm:p-3">
          {Object.keys(productsMap).map(productName => renderProductBox(productName))}
        </div>
      )}
    </div>
  );
});

const ThawingCabinet = () => {
  const { user } = useAuth();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAdminView, setShowAdminView] = useState(false);
  const [showNextWeek, setShowNextWeek] = useState(false);
  const containerRef = useRef(null);

  // Memoize the current day calculation
  const currentDay = useMemo(() => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    const dayIndex = now.getDay();
    return days[(dayIndex + 6) % 7];
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
      localStorage.setItem('isFullScreen', 'true');
      if (containerRef.current) {
        containerRef.current.classList.add('fullscreen');
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
        localStorage.setItem('isFullScreen', 'false');
        if (containerRef.current) {
          containerRef.current.classList.remove('fullscreen');
        }
      }
    }
  }, []);

  // SWR fetcher function
  const fetcher = useCallback(async (url) => {
    try {
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }, []);

  // Data fetching hooks
  const { data: salesData, error: salesError } = useSWR("/sales", fetcher, {
    refreshInterval: 10 * 60 * 1000,
    shouldRetryOnError: true,
    errorRetryCount: 3
  });

  const { data: utpData, error: utpError } = useSWR("/upt", fetcher, {
    refreshInterval: 10 * 60 * 1000,
    shouldRetryOnError: true,
    errorRetryCount: 3
  });

  const { data: bufferData, error: bufferError } = useSWR("/buffer", fetcher, {
    refreshInterval: 10 * 60 * 1000,
    shouldRetryOnError: true,
    errorRetryCount: 3
  });

  const { data: adjustments, error: adjustmentsError } = useSWR("/adjustment/data", fetcher, {
    refreshInterval: 5 * 60 * 1000
  });

  const { data: closures, error: closuresError } = useSWR("/closure/plans", fetcher, {
    refreshInterval: 10 * 60 * 1000
  });

  const { data: messages, error: messagesError } = useSWR("/messages", fetcher, {
    refreshInterval: 5 * 60 * 1000
  });

  const { data: salesProjectionConfig, error: configError } = useSWR("/sales-projection-config", fetcher, {
    refreshInterval: 10 * 60 * 1000
  });

  const { data: futureProjections, error: projectionsError } = useSWR("/projections/future", fetcher, {
    refreshInterval: 10 * 60 * 1000
  });

  // Transform sales data with null check
  const sortedSales = useMemo(() => {
    if (!Array.isArray(salesData)) return [];
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOrder.map((day) => salesData.find((entry) => entry?.day === day) || { day, sales: 0 });
  }, [salesData]);

  // Prepare data object with null checks
  const data = useMemo(() => ({
    sales: Array.isArray(sortedSales) ? sortedSales : [],
    utp: Array.isArray(utpData) ? utpData : [],
    buffer: Array.isArray(bufferData) ? bufferData : []
  }), [sortedSales, utpData, bufferData]);

  // Calculate data with null checks
  const calculatedData = useCalculateThawingData(
    data.sales,
    data.utp,
    data.buffer,
    Array.isArray(adjustments) ? adjustments : [],
    salesProjectionConfig || null,
    Array.isArray(futureProjections) ? futureProjections : [],
    showNextWeek
  );

  const filteredClosures = useFilteredClosures(Array.isArray(closures) ? closures : []);

  // Check for loading state
  const isLoading = !salesData || !utpData || !bufferData;

  // Check for errors
  const errors = [
    salesError, utpError, bufferError, adjustmentsError,
    closuresError, messagesError, configError, projectionsError
  ].filter(Boolean);

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">
            There was an error loading some of the required data. Please try refreshing the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              <pre className="text-xs text-red-500">
                {errors.map((error, index) => (
                  <div key={index}>{error.message}</div>
                ))}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
      <div className="min-h-full w-full bg-white rounded-lg md:rounded-xl shadow-xl p-2 sm:p-4 border border-gray-100 flex flex-col">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <Link to={"/"} className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
              <ArrowBackIos /> Thawing Cabinet
            </Link>
            {showNextWeek && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                Next Week's Projections
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user && user.isAdmin && (
              <button
                onClick={() => setShowAdminView(!showAdminView)}
                className={`p-1.5 rounded-lg transition-colors duration-200 flex items-center gap-1
                  ${showAdminView ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Toggle Admin View"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Admin</span>
              </button>
            )}
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
              <span className="text-gray-600 font-medium whitespace-nowrap">
                Updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={toggleFullScreen}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
            >
              {isFullScreen ? (
                <Minimize className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              ) : (
                <Maximize className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Admin Panel - Only shown when admin view is active */}
        {showAdminView && user && user.isAdmin && (
          <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNextWeek(!showNextWeek)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1.5
                    ${showNextWeek
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-white text-green-700 border border-green-200 hover:bg-green-100'
                    }`}
                >
                  <Calendar className="w-4 h-4" />
                  {showNextWeek ? 'Current Week' : 'Next Week'}
                </button>
              </div>

              <div className="ml-auto text-xs text-indigo-700">
                Admin view is active - showing detailed sales data
              </div>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className={`flex-1 flex gap-1 sm:gap-2 ${isFullScreen ? 'fullscreen' : ''}`}
          style={{ minHeight: '0' }}
        >
          {Array.isArray(calculatedData) && calculatedData.map((entry) => (
            <div key={entry.day} className="flex-1 min-w-0">
              <DayCard
                entry={entry}
                currentDay={currentDay}
                closures={filteredClosures}
                messages={Array.isArray(messages) ? messages : []}
                showAdminView={showAdminView}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThawingCabinet;