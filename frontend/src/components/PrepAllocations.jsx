// src/components/PrepAllocations.js

import React, { useState, useCallback, useRef, memo, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Maximize, Minimize, Settings } from "lucide-react";
import axiosInstance from "./axiosInstance";
import { ArrowBackIos } from "@mui/icons-material";
import { useAuth } from "./AuthContext";
import useSWR from 'swr';

const BufferAdjustmentModal = memo(({ isOpen, onClose, day, dailyBuffers, onSave }) => {
    const [buffers, setBuffers] = useState({
        Lettuce: '',
        Tomato: '',
        Romaine: '',
        "Cobb Salad": '',
        "Southwest Salad": ''
    });

    useEffect(() => {
        if (dailyBuffers) {
            const newBuffers = { ...buffers };
            dailyBuffers.forEach(buffer => {
                newBuffers[buffer.productName] = buffer.bufferPrcnt.toString();
            });
            setBuffers(newBuffers);
        }
    }, [dailyBuffers]);

    const handleSave = () => {
        // Convert all values to numbers, empty strings become 0
        const numericBuffers = Object.entries(buffers).reduce((acc, [key, value]) => {
            acc[key] = value === '' ? 0 : parseFloat(value);
            return acc;
        }, {});
        onSave(day, numericBuffers);
        onClose();
    };

    const handleInputChange = (product, value) => {
        // Allow empty string, minus sign, decimal point, and numbers
        if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
            setBuffers(prev => ({
                ...prev,
                [product]: value
            }));
        }
    };

    return isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">{day} Buffer Adjustments</h2>
                <div className="space-y-4">
                    {Object.entries(buffers).map(([product, value]) => (
                        <div key={product} className="flex items-center justify-between">
                            <label className="font-medium">{product}:</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleInputChange(product, e.target.value)}
                                    className="border rounded px-2 py-1 w-20 text-right"
                                    placeholder="0"
                                />
                                <span>%</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                    Note: Use negative values (e.g., -10) to decrease the buffer percentage. Leave empty for 0%.
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    ) : null;
});

const useCalculatePrepData = (salesData, utpData, bufferData, adjustments = [], salesProjectionConfig = null, futureProjections = [], isNextWeek = false, dailyBuffers = []) => {
    return useMemo(() => {
        if (!salesData || !utpData || !bufferData) return [];

        const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const calculateBufferMultiplier = (bufferPrcnt) => (100 + bufferPrcnt) / 100;

        const getBufferMultiplier = (productName, day) => {
            
            const dailyBuffer = dailyBuffers?.find(b => b.day === day && b.productName === productName);
            if (dailyBuffer) {
                return calculateBufferMultiplier(dailyBuffer.bufferPrcnt);
            }
            
            return calculateBufferMultiplier(bufferData.find(item => item.productName === productName)?.bufferPrcnt || 1);
        };

        const utpValues = {
            Lettuce: utpData.find(item => item.productName === "Lettuce")?.utp || 1.0,
            Tomato: utpData.find(item => item.productName === "Tomato")?.utp || 1.0,
            Romaine: utpData.find(item => item.productName === "Romaine")?.utp || 1.0,
            "Large Romaine": utpData.find(item => item.productName === "Large Romaine")?.utp || 1.0,
            "Small Romaine": utpData.find(item => item.productName === "Small Romaine")?.utp || 1.0,
            "Cobb Salad": utpData.find(item => item.productName === "Cobb Salad")?.utp || 1.0,
            "Southwest Salad": utpData.find(item => item.productName === "Southwest Salad")?.utp || 1.0,
        };

        return daysOrder.map((day, index) => {
            const today = new Date();
            let targetDate;

            if (isNextWeek) {
                
                const nextMonday = new Date(today);
                nextMonday.setDate(today.getDate() + (8 - today.getDay()));
                targetDate = new Date(nextMonday);
                targetDate.setDate(nextMonday.getDate() + daysOrder.indexOf(day));
            } else {
                // For current week's view
                const thisMonday = new Date(today);
                thisMonday.setDate(today.getDate() - today.getDay() + 1);
                targetDate = new Date(thisMonday);
                targetDate.setDate(thisMonday.getDate() + daysOrder.indexOf(day));
            }

            // Skip Sunday
            if (targetDate.getDay() === 0) {
                targetDate.setDate(targetDate.getDate() + 1);
            }

            const dateStr = targetDate.toISOString().split('T')[0];
            const projectedSales = futureProjections.find(proj =>
                new Date(proj.date).toISOString().split('T')[0] === dateStr
            )?.amount || salesData.find(e => e.day === day)?.sales || 0;

            const dayAdjustments = adjustments.filter(msg => msg.day === day);
            const isSaturday = day === "Saturday";
            const drinkMultiplier = isSaturday ? 1 : 0.75;

            const applyMessage = (product, pans, buckets = 0) => {
                const message = dayAdjustments.find(msg => msg.product === product);
                let finalPans = pans;
                let finalBuckets = buckets;

                if (message) {
                    const parts = message.message.split(' and ');
                    parts.forEach(part => {
                        const [change, unit] = part.trim().split(' ');
                        const value = parseInt(change);
                        if (!isNaN(value)) {
                            if (unit === 'pans') {
                                finalPans += value;
                            } else if (unit === 'buckets') {
                                finalBuckets += value;
                            }
                        }
                    });
                }
                return { pans: Math.max(0, finalPans), buckets: Math.max(0, finalBuckets), modified: !!message };
            };

            const calculateLettucePans = (utp) => Math.ceil(((utp * (projectedSales / 1000)) / 160) * getBufferMultiplier("Lettuce", day));

            const calculateTomatoPans = (utp) => Math.ceil(((utp * (projectedSales / 1000)) / 156) * getBufferMultiplier("Tomato", day));

            // const calculateRomainePans = (utp) => Math.round(((utp * (projectedSales / 1000)) / 2585.48) * getBufferMultiplier("Romaine", day));

            const calculateLargeRomainePans = (utp) => Math.ceil(((utp * (projectedSales / 1000)) / 24) * getBufferMultiplier("Romaine", day)); // 24 large salads in a pan

            const calculateSmallRomainePans = (utp) => Math.ceil(((utp * (projectedSales / 1000)) / 40) * getBufferMultiplier("Romaine", day)); // 40 small salads in a pan

            const calculateBuckets = (utp, bufferMultiplier) => Math.ceil((((utp / 33.814) * (projectedSales * drinkMultiplier)) / 1000 / 12) * bufferMultiplier); 
            
            const calculateCobbSalads = (utp) => Math.ceil(((utp * (projectedSales / 1000))) * getBufferMultiplier("Cobb Salad", day));

            const calculateSouthwestSalads = (utp) => Math.ceil(((utp * (projectedSales / 1000))) * getBufferMultiplier("Southwest Salad", day));

            const lettucePans = calculateLettucePans(utpValues.Lettuce);

            const tomatoPans = calculateTomatoPans(utpValues.Tomato);

            const romainePans = calculateLargeRomainePans(utpValues["Large Romaine"]) + calculateSmallRomainePans(utpValues["Small Romaine"]);

            const cobbSalads = calculateCobbSalads(utpValues["Cobb Salad"]);
            
            const southwestSalads = calculateSouthwestSalads(utpValues["Southwest Salad"]);

            return {
                day: day,
                sales: projectedSales,
                salesCalculation: [{
                    day: day,
                    percentage: 100,
                    amount: projectedSales,
                    contribution: projectedSales,
                    isFromFutureProjection: projectedSales !== salesData.find(e => e.day === day)?.sales,
                    date: targetDate
                }],
                lettuce: applyMessage("Lettuce", lettucePans),
                romaine: applyMessage("Romaine", romainePans),
                tomato: applyMessage("Tomato", tomatoPans),
                cobbSalads: applyMessage("Cobb Salad", cobbSalads),
                southwestSalads: applyMessage("Southwest Salad", southwestSalads),
            };
        });
    }, [salesData, utpData, bufferData, adjustments, futureProjections, isNextWeek, dailyBuffers]);
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

const DayCard = memo(({ entry, currentDay, closures, messages, showAdminView, onAdjustBuffer, dailyBuffers }) => {
    const [isBufferModalOpen, setIsBufferModalOpen] = useState(false);
    const isToday = entry.day === currentDay;

    const closure = useMemo(() => {
        return closures?.find(c => {
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
        // Only include messages with [PREP] tag
        return messages?.filter(msg => msg.day === entry.day && msg.message.startsWith("[PREP]")) || [];
    }, [messages, entry.day]);

    const productMessages = useMemo(() => {
        return dayMessages.filter(msg => msg.products);
    }, [dayMessages]);

    const noProductMessages = useMemo(() => {
        return dayMessages.filter(msg => !msg.products || msg.products === "");
    }, [dayMessages]);

    const productsMap = useMemo(() => {
        return {
            "Lettuce": { name: "Lettuce", data: entry.lettuce, bg: "bg-green-200 text-gray-800", index: 0 },
            "Romaine": { name: "Romaine", data: entry.romaine, bg: "bg-green-300 text-gray-800", index: 1 },
            "Tomato": { name: "Tomato", data: entry.tomato, bg: "bg-red-200 text-gray-800", index: 2 },
            "Cobb Salad": {
                name: "Cobb Salad",
                data: entry.cobbSalads,
                bg: "bg-gradient-to-br from-green-100 to-green-200 relative overflow-hidden",
                index: 3
            },
            "Southwest Salad": {
                name: "Southwest Salad",
                data: entry.southwestSalads,
                bg: "bg-gradient-to-br from-green-200 to-green-300 relative overflow-hidden",
                index: 4
            },
        }
    }, [entry]);

    const renderProductBox = (productName) => {
        const productData = productsMap[productName];
        const isSalad = productName.includes('Salad');

        const relevantMessages = productMessages.filter(msg => {
            const products = msg.products ? msg.products.split(',') : [];
            return products.includes(productName)
        })

        // Get daily buffer adjustment if it exists
        const dailyBuffer = dailyBuffers?.find(b => b.day === entry.day && b.productName === productName);
        const hasBufferAdjustment = !!dailyBuffer;
        const isBufferReduced = hasBufferAdjustment && dailyBuffer.bufferPrcnt < 0;

        if (!productData) return null;

        // Special formatting for salads
        const renderSaladCount = (count, traySize) => {
            return (
                <div>
                    {count} salads ({Math.round(count / traySize)} trays)
                </div>
            );
        };

        return (
            <div
                key={productData.index}
                className={`flex-1 ${productData.bg} p-2 m-1 rounded-md transition-all duration-200
                    hover:shadow-sm flex flex-col relative`}
            >
                {isSalad && (
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="salad-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M0 5 L10 5 M5 0 L5 10"
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                    className="text-green-800" />
                            </pattern>
                            <rect x="0" y="0" width="100%" height="100%" fill="url(#salad-pattern)" />
                        </svg>
                    </div>
                )}
                <div className="relative z-10">
                    <div className="font-semibold text-center mb-1 text-sm sm:text-base">
                        {productData.name}
                        {showAdminView && hasBufferAdjustment && (
                            <span className={`ml-1 text-xs ${isBufferReduced ? 'text-red-600' : 'text-green-600'}`}>
                                ({dailyBuffer.bufferPrcnt > 0 ? '+' : ''}{dailyBuffer.bufferPrcnt}%)
                            </span>
                        )}
                    </div>
                    <div className={`text-center text-sm sm:text-base ${productData.data.modified ? "text-red-700 font-bold" : ""}`}>
                        {productData.name === "Cobb Salad" ? (
                            renderSaladCount(productData.data.pans, 8)
                        ) : productData.name === "Southwest Salad" ? (
                            renderSaladCount(productData.data.pans, 6)
                        ) : productData.name === "Tomato" ? (
                            productData.data.pans > 0 && <div>{Math.ceil(productData.data.pans / 2)} pans</div>
                        ) : (
                            <>
                                {productData.data.pans > 0 && <div>{productData.data.pans} pans</div>}
                                {productData.data.buckets > 0 && <div>{productData.data.buckets} buckets (12qt)</div>}
                            </>
                        )}
                    </div>
                    {relevantMessages.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {relevantMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className="text-xs sm:text-sm bg-yellow-50 p-1 rounded-md text-yellow-800 border border-yellow-200"
                                >
                                    {msg.message.substring(6).trim()}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSalesDetails = () => {
        if (!showAdminView) return null;

        return (
            <div className={`text-xs ${isToday ? 'text-white bg-blue-400 bg-opacity-50' : 'text-gray-600 bg-gray-50'} mt-2 p-2 rounded w-full`}>
                <div className="text-center font-medium">Sales: ${(entry.sales || 0).toLocaleString()}</div>
                {entry.salesCalculation?.length > 0 && (
                    <div className="mt-1">
                        <div className="text-center font-medium">Calculation:</div>
                        {entry.salesCalculation.map((calc, idx) => (
                            <div key={idx} className="flex flex-wrap items-center justify-center">
                                <span className={`font-medium ${isToday ? 'text-white' : 'text-blue-600'}`}>{calc.percentage}%</span> of {calc.day}
                                {calc.date && <span className={`ml-1 ${isToday ? 'text-blue-100' : 'text-gray-500'}`}>({calc.date.toLocaleDateString()})</span>}
                                <span className="mx-1 font-medium">${calc.amount.toLocaleString()}</span>
                                = <span className={`ml-1 font-bold ${isToday ? 'text-white' : 'text-green-600'}`}>${calc.contribution.toLocaleString()}</span>
                                {calc.isFromFutureProjection && (
                                    <span className={`ml-1 ${isToday ? 'text-white bg-blue-600' : 'text-blue-600 bg-blue-50'} font-medium px-1 py-0.5 rounded-full text-[10px]`}>Future Projection</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`h-full flex flex-col bg-white rounded-lg md:rounded-xl shadow-md border border-gray-200 overflow-hidden ${isToday ? "ring-2 ring-blue-500" : ""
            }`}>
            <div className={`border-b border-gray-200 p-2 sm:p-3 ${isToday ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-800"
                }`}>
                <div className="flex justify-center items-center relative">
                    <h3 className="font-bold text-base sm:text-lg">{entry.day}</h3>

                    {showAdminView && (
                        <button
                            onClick={() => setIsBufferModalOpen(true)}
                            className={`absolute right-0 p-1 rounded-full ${isToday ? 'hover:bg-blue-400' : 'hover:bg-gray-200'} transition-colors`}
                            title="Adjust Daily Buffers"
                        >
                            <Settings className={`w-4 h-4 ${isToday ? 'text-white' : 'text-gray-600'}`} />
                        </button>
                    )}
                </div>
                {showAdminView && renderSalesDetails()}
            </div>

            {noProductMessages.length > 0 && (
                <div className="px-2 py-1 bg-yellow-50 border-b border-yellow-200">
                    {noProductMessages.map((msg, index) => (
                        <div key={index} className="text-xs sm:text-sm text-yellow-800 text-center">
                            {msg.message.substring(6).trim()}
                        </div>
                    ))}
                </div>
            )}

            {closure ? (
                <div className="flex-1 flex flex-col justify-center items-center p-2 sm:p-3 bg-gradient-to-br from-red-50 via-red-100 to-red-50 relative">
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
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-1 p-1 sm:p-2 overflow-y-auto min-h-0 w-full">
                    {Object.keys(productsMap).map(productName => renderProductBox(productName))}
                </div>
            )}

            <BufferAdjustmentModal
                isOpen={isBufferModalOpen}
                onClose={() => setIsBufferModalOpen(false)}
                day={entry.day}
                dailyBuffers={dailyBuffers?.filter(b => b.day === entry.day)}
                onSave={onAdjustBuffer}
            />
        </div>
    );
});

const PrepAllocations = ({
    data,
    showAdminView: propShowAdminView,
    showNextWeek: propShowNextWeek,
    isFullScreen: propIsFullScreen,
    adjustments: propAdjustments,
    closures: propClosures,
    messages: propMessages,
    salesProjectionConfig: propSalesProjectionConfig,
    futureProjections: propFutureProjections,
    dailyBuffers: propDailyBuffers,
    onAdjustBuffer: propOnAdjustBuffer,
    containerMode = false
}) => {
    const [isFullScreen, setIsFullScreen] = useState(propIsFullScreen || false);
    const [showAdminView, setShowAdminView] = useState(propShowAdminView || false);
    const [showNextWeek, setShowNextWeek] = useState(propShowNextWeek || false);
    const [wakeLock, setWakeLock] = useState(null);
    const containerRef = useRef(null);
    const { user } = useAuth();

    // Update state when props change
    useEffect(() => {
        if (containerMode) {
            setIsFullScreen(propIsFullScreen);
            setShowAdminView(propShowAdminView);
            setShowNextWeek(propShowNextWeek);
        }
    }, [containerMode, propIsFullScreen, propShowAdminView, propShowNextWeek]);

    // Memoize the current day calculation
    const currentDay = useMemo(() => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const now = new Date();
        const dayIndex = now.getDay();
        return days[(dayIndex + 6) % 7];
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

    // Data fetching hooks - only used when not in containerMode
    const { data: salesData, error: salesError } = useSWR(containerMode ? null : "/sales", fetcher, {
        refreshInterval: 10 * 60 * 1000,
        shouldRetryOnError: true,
        errorRetryCount: 3
    });

    const { data: utpData, error: utpError } = useSWR(containerMode ? null : "/upt", fetcher, {
        refreshInterval: 10 * 60 * 1000,
        shouldRetryOnError: true,
        errorRetryCount: 3
    });

    const { data: bufferData, error: bufferError } = useSWR(containerMode ? null : "/buffer", fetcher, {
        refreshInterval: 10 * 60 * 1000,
        shouldRetryOnError: true,
        errorRetryCount: 3
    });

    const { data: adjustments, error: adjustmentsError } = useSWR(containerMode ? null : "/adjustment/data", fetcher, {
        refreshInterval: 5 * 60 * 1000
    });

    const { data: closures, error: closuresError } = useSWR(containerMode ? null : "/closure/plans", fetcher, {
        refreshInterval: 10 * 60 * 1000
    });

    const { data: messages, error: messagesError } = useSWR(containerMode ? null : "/messages", fetcher, {
        refreshInterval: 5 * 60 * 1000
    });

    const { data: salesProjectionConfig, error: configError } = useSWR(containerMode ? null : "/sales-projection-config", fetcher, {
        refreshInterval: 10 * 60 * 1000
    });

    const { data: futureProjections, error: projectionsError } = useSWR(containerMode ? null : "/projections/future", fetcher, {
        refreshInterval: 10 * 60 * 1000
    });

    const { data: dailyBuffers, error: buffersError, mutate: mutateDailyBuffers } = useSWR(containerMode ? null : "/daily-buffer", fetcher, {
        refreshInterval: 10 * 60 * 1000
    });

    // Transform sales data with null check - use props if in containerMode
    const sortedSales = useMemo(() => {
        const salesToUse = containerMode ? data?.sales : salesData;
        if (!Array.isArray(salesToUse)) return [];
        const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return daysOrder.map((day) => salesToUse.find((entry) => entry?.day === day) || { day, sales: 0 });
    }, [containerMode, data, salesData]);

    // Prepare data object with null checks
    const dataToUse = useMemo(() => {
        if (containerMode && data) {
            return data;
        }
        return {
            sales: Array.isArray(sortedSales) ? sortedSales : [],
            utp: Array.isArray(utpData) ? utpData : [],
            buffer: Array.isArray(bufferData) ? bufferData : []
        };
    }, [containerMode, data, sortedSales, utpData, bufferData]);

    // Calculate data with null checks
    const calculatedData = useCalculatePrepData(
        dataToUse.sales,
        dataToUse.utp,
        dataToUse.buffer,
        containerMode ? propAdjustments : adjustments,
        containerMode ? propSalesProjectionConfig : salesProjectionConfig,
        containerMode ? propFutureProjections : futureProjections,
        showNextWeek,
        containerMode ? propDailyBuffers : dailyBuffers
    );

    const filteredClosures = useFilteredClosures(containerMode ? propClosures : closures);

    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                const lock = await navigator.wakeLock.request('screen');
                setWakeLock(lock);
                lock.addEventListener('release', () => {
                    setWakeLock(null);
                });
            } catch (err) {
                console.error(`Wake Lock error: ${err.name}, ${err.message}`);
            }
        } else {
            console.warn('Wake Lock API not supported.');
        }
    }, []);

    React.useEffect(() => {
        if (!containerMode) {
            requestWakeLock();

            const storedFullScreenPreference = localStorage.getItem('isFullScreen');
            if (storedFullScreenPreference === 'true' && !document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                setIsFullScreen(true);
            }

            const handleFullScreenChange = () => {
                setIsFullScreen(!!document.fullscreenElement);
            };

            document.addEventListener('fullscreenchange', handleFullScreenChange);

            return () => {
                document.removeEventListener('fullscreenchange', handleFullScreenChange);
            };
        }
    }, [containerMode, requestWakeLock]);

    // Add toggleFullScreen function
    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
            localStorage.setItem('isFullScreen', 'true');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
                localStorage.setItem('isFullScreen', 'false');
            }
        }
    }, []);

    // Add handleAdjustBuffer function
    const handleAdjustBuffer = useCallback(async (day, buffers) => {
        if (containerMode && propOnAdjustBuffer) {
            return propOnAdjustBuffer(day, buffers);
        }

        try {
            const updatedBuffers = Object.entries(buffers).map(([productName, bufferPrcnt]) => ({
                day,
                productName,
                bufferPrcnt: Number(bufferPrcnt)
            }));

            await axiosInstance.post("/daily-buffer", updatedBuffers);
            await mutateDailyBuffers();

        } catch (error) {
            console.error("Error updating daily buffers:", error);
        }
    }, [containerMode, propOnAdjustBuffer, mutateDailyBuffers]);

    // Check for loading state - skip if in containerMode
    const isLoading = !containerMode && (!salesData || !utpData || !bufferData);

    // Check for errors - skip if in containerMode
    const errors = containerMode ? [] : [
        salesError, utpError, bufferError, adjustmentsError,
        closuresError, messagesError, configError, projectionsError,
        buffersError
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

    // If in containerMode, just render the cards without the outer container
    if (containerMode) {
        return (
            <div
                ref={containerRef}
                className={`flex-1 flex flex-col ${isFullScreen ? 'h-full max-h-screen w-full' : ''}`}
            >
                <div className="flex-1 flex gap-1 sm:gap-2 w-full min-h-0">
                    {calculatedData.map((entry) => (
                        <div key={entry.day} className="flex-1 min-w-0 w-full">
                            <DayCard
                                entry={entry}
                                currentDay={currentDay}
                                closures={filteredClosures}
                                messages={propMessages}
                                showAdminView={showAdminView}
                                onAdjustBuffer={handleAdjustBuffer}
                                dailyBuffers={propDailyBuffers}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Regular standalone view
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
            <div className="min-h-full w-full bg-white rounded-lg md:rounded-xl shadow-xl p-2 sm:p-4 border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                        <Link to={"/"} className="text-lg sm:text-xl font-bold text-gray-800">
                            <ArrowBackIos /> Prep Allocations
                        </Link>
                        {showNextWeek && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                                Next Week's Projections
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {user && user.isAdmin && (
                            <>
                                <button
                                    onClick={() => setShowAdminView(!showAdminView)}
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${showAdminView
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {showAdminView ? 'Admin View' : 'User View'}
                                </button>
                                <button
                                    onClick={() => setShowNextWeek(!showNextWeek)}
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${showNextWeek
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {showNextWeek ? 'Next Week' : 'Current Week'}
                                </button>
                            </>
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

                <div
                    ref={containerRef}
                    className={`flex-1 flex gap-1 sm:gap-2 ${isFullScreen ? 'fullscreen' : ''}`}
                    style={{ minHeight: '0' }}
                >
                    {calculatedData.map((entry) => (
                        <div key={entry.day} className="flex-1 min-w-0">
                            <DayCard
                                entry={entry}
                                currentDay={currentDay}
                                closures={filteredClosures}
                                messages={messages}
                                showAdminView={showAdminView}
                                onAdjustBuffer={handleAdjustBuffer}
                                dailyBuffers={dailyBuffers}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-2 text-xs text-gray-500 text-right">
                </div>
            </div>
        </div>
    );
};

export default PrepAllocations;