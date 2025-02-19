// src/components/PrepAllocations.js

import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, Maximize, Minimize, Settings } from "lucide-react";
import axiosInstance from "./axiosInstance";
import { ArrowBackIos } from "@mui/icons-material";
import { useAuth } from "./AuthContext";

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

const useCalculatePrepData = (salesData, utpData, bufferData, adjustments, salesProjectionConfig, futureProjections, isNextWeek, dailyBuffers) => {
    return useMemo(() => {
        if (!salesData || !utpData || !bufferData) return [];

        const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const calculateBufferMultiplier = (bufferPrcnt) => (100 + bufferPrcnt) / 100;

        const getBufferMultiplier = (productName, day) => {
            // Check for daily buffer first
            const dailyBuffer = dailyBuffers?.find(b => b.day === day && b.productName === productName);
            if (dailyBuffer) {
                return calculateBufferMultiplier(dailyBuffer.bufferPrcnt);
            }
            // Fall back to global buffer
            return calculateBufferMultiplier(bufferData.find(item => item.productName === productName)?.bufferPrcnt || 1);
        };

        const utpValues = {
            Lettuce: utpData.find(item => item.productName === "Lettuce")?.utp || 1.0,
            Tomato: utpData.find(item => item.productName === "Tomato")?.utp || 1.0,
            Lemonade: utpData.find(item => item.productName === "Lemonade")?.utp || 1.0,
            "Diet Lemonade": utpData.find(item => item.productName === "Diet Lemonade")?.utp || 1.0,
            "Sunjoy Lemonade": utpData.find(item => item.productName === "Sunjoy Lemonade")?.utp || 1.0,
            Romaine: utpData.find(item => item.productName === "Romaine")?.utp || 1.0,
            "Cobb Salad": utpData.find(item => item.productName === "Cobb Salad")?.utp || 1.0,
            "Southwest Salad": utpData.find(item => item.productName === "Southwest Salad")?.utp || 1.0,
        };

        return daysOrder.map((day, index) => {
            const today = new Date();
            let targetDate;

            if (isNextWeek) {
                // For next week's view
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

            const calculateLettucePans = (utp) => Math.round(((utp * (projectedSales / 1000)) / 144) * getBufferMultiplier("Lettuce", day));
            const calculateTomatoPans = (utp) => Math.round(((utp * (projectedSales / 1000)) / 166) * getBufferMultiplier("Tomato", day));
            const calculateRomainePans = (utp) => Math.round(((utp * (projectedSales / 1000)) / 2585.48) * getBufferMultiplier("Romaine", day));
            const calculateBuckets = (utp, bufferMultiplier) => Math.ceil((((utp / 33.814) * (projectedSales * drinkMultiplier)) / 1000 / 12) * bufferMultiplier);
            const calculateCobbSalads = (utp) => Math.round(((utp * (projectedSales / 1000))) * getBufferMultiplier("Cobb Salad", day));
            const calculateSouthwestSalads = (utp) => Math.round(((utp * (projectedSales / 1000))) * getBufferMultiplier("Southwest Salad", day));

            const lettucePans = calculateLettucePans(utpValues.Lettuce);
            const tomatoPans = calculateTomatoPans(utpValues.Tomato);
            const lemonadeBuckets = calculateBuckets(utpValues.Lemonade, getBufferMultiplier("Lemonade", day));
            const dietLemonadeBuckets = calculateBuckets(utpValues["Diet Lemonade"], getBufferMultiplier("Diet Lemonade", day));
            const sunjoyLemonadeBuckets = calculateBuckets(utpValues["Sunjoy Lemonade"], getBufferMultiplier("Sunjoy Lemonade", day));
            const romainePans = calculateRomainePans(utpValues.Romaine);
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
                lemonade: applyMessage("Lemonade", 0, lemonadeBuckets),
                dietLemonade: applyMessage("Diet Lemonade", 0, dietLemonadeBuckets),
                sunjoyLemonade: applyMessage("Sunjoy Lemonade", 0, sunjoyLemonadeBuckets),
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
        return messages.filter(msg => msg.day === entry.day);
    }, [messages, entry.day]);

    const productMessages = useMemo(() => {
        return dayMessages.filter(msg => msg.products);
    }, [dayMessages])

    const noProductMessages = useMemo(() => {
        return dayMessages.filter(msg => !msg.products || msg.products === "");
    }, [dayMessages])

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
            "Lemonade": { name: "Lemonade", data: entry.lemonade, bg: "bg-yellow-200 text-gray-800", index: 5 },
            "Diet Lemonade": { name: "Diet Lemonade", data: entry.dietLemonade, bg: "bg-yellow-100 text-gray-800", index: 6 },
            "Sunjoy Lemonade": { name: "Sunjoy Lemonade", data: entry.sunjoyLemonade, bg: "bg-orange-200 text-gray-800", index: 7 },
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
                                    {msg.message}
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
            <div className="text-xs text-gray-600 mt-1 p-1 bg-gray-50 rounded">
                <div>Sales: ${(entry.sales || 0).toLocaleString()}</div>
                {entry.salesCalculation?.length > 0 && (
                    <div className="mt-1">
                        Calculation:
                        {entry.salesCalculation.map((calc, idx) => (
                            <div key={idx} className="ml-2">
                                {calc.percentage}% of {calc.day}
                                {calc.date && ` (${calc.date.toLocaleDateString()})`}
                                (${calc.amount.toLocaleString()})
                                = ${calc.contribution.toLocaleString()}
                                {calc.isFromFutureProjection && (
                                    <span className="ml-1 text-blue-600 font-medium">(Future Projection)</span>
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
                <div className="p-1 flex items-center justify-center gap-2">
                    {entry.day}
                    {showAdminView && (
                        <button
                            onClick={() => setIsBufferModalOpen(true)}
                            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                            title="Adjust Daily Buffers"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {showAdminView && renderSalesDetails()}
                {noProductMessages.map((msg, index) => (
                    <div key={index} className="mt-1 text-xs sm:text-sm bg-yellow-50 p-1 rounded-md text-yellow-800 border border-yellow-200">
                        {msg.message}
                    </div>
                ))}
            </div>

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
                <div className="flex-1 flex flex-col gap-1 p-1 sm:p-2 relative">
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

const PrepAllocations = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [adjustments, setAdjustments] = useState([]);
    const [closures, setClosures] = useState([]);
    const [messages, setMessages] = useState([]);
    const [wakeLock, setWakeLock] = useState(null);
    const adjustmentsRef = useRef(adjustments);
    const containerRef = useRef(null);
    const { user } = useAuth();
    const [showAdminView, setShowAdminView] = useState(false);
    const [showNextWeek, setShowNextWeek] = useState(false);
    const [salesProjectionConfig, setSalesProjectionConfig] = useState(null);
    const [futureProjections, setFutureProjections] = useState([]);
    const [dailyBuffers, setDailyBuffers] = useState([]);

    // Memoize the current day calculation
    const currentDay = useMemo(() => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const now = new Date();
        const dayIndex = now.getDay();
        return days[(dayIndex + 6) % 7];
    }, []);

    useEffect(() => {
        adjustmentsRef.current = adjustments;
    }, [adjustments]);

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

    useEffect(() => {
        requestWakeLock();

        const fetchData = async () => {
            setLoading(true);
            try {
                const [
                    adjustmentsResponse,
                    closuresResponse,
                    messagesResponse,
                    salesResponse,
                    utpResponse,
                    bufferResponse,
                    configResponse,
                    futureProjectionsResponse,
                ] = await Promise.all([
                    axiosInstance.get("/adjustment/data"),
                    axiosInstance.get("/closure/plans"),
                    axiosInstance.get("/messages"),
                    axiosInstance.get("/sales"),
                    axiosInstance.get("/upt"),
                    axiosInstance.get("/buffer"),
                    axiosInstance.get("/sales-projection-config"),
                    axiosInstance.get("/projections/future"),
                ]);

                const salesData = salesResponse.data;
                const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const sortedSales = daysOrder.map((day) => salesData.find((entry) => entry.day === day) || { day, sales: 0 });

                setData({
                    sales: sortedSales,
                    utp: utpResponse.data,
                    buffer: bufferResponse.data,
                });
                setAdjustments(adjustmentsResponse.data);
                setClosures(closuresResponse.data);
                setMessages(messagesResponse.data);
                setLastUpdated(new Date());
                setSalesProjectionConfig(configResponse.data);
                setFutureProjections(futureProjectionsResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                // Consider setting an error state to display an error message to the user
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const fetchDailyBuffers = async () => {
            try {
                const response = await axiosInstance.get("/daily-buffer");
                setDailyBuffers(response.data);
            } catch (error) {
                console.error("Error fetching daily buffers:", error);
            }
        };
        fetchDailyBuffers();

        const fetchInterval = setInterval(fetchData, 10 * 60 * 1000);
        const dailyBuffersInterval = setInterval(fetchDailyBuffers, 10 * 60 * 1000);
        const adjustmentsInterval = setInterval(() => axiosInstance.get("/adjustment/data").then(res => setAdjustments(res.data)).catch(err => console.error("Error fetching adjustments:", err)), 5 * 60 * 1000);
        const closuresInterval = setInterval(() => axiosInstance.get("/closure/plans").then(res => setClosures(res.data)).catch(err => console.error("Error fetching closures:", err)), 10 * 60 * 1000);
        const messagesInterval = setInterval(() => axiosInstance.get("/messages").then(res => setMessages(res.data)).catch(err => console.error("Error fetching messages:", err)), 5 * 60 * 1000);

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
            clearInterval(fetchInterval);
            clearInterval(dailyBuffersInterval);
            clearInterval(adjustmentsInterval);
            clearInterval(closuresInterval);
            clearInterval(messagesInterval);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);

    const calculatedData = useCalculatePrepData(
        data?.sales,
        data?.utp,
        data?.buffer,
        adjustments,
        salesProjectionConfig,
        futureProjections,
        showNextWeek,
        dailyBuffers
    );
    const filteredClosures = useFilteredClosures(closures);

    // Add toggleFullScreen function
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

    // Add handleAdjustBuffer function
    const handleAdjustBuffer = useCallback(async (day, buffers) => {
        try {
            const updatedBuffers = Object.entries(buffers).map(([productName, bufferPrcnt]) => ({
                day,
                productName,
                bufferPrcnt: Number(bufferPrcnt)
            }));

            await axiosInstance.post("/daily-buffer", updatedBuffers);

            // Update local state
            setDailyBuffers(prev => {
                // Remove existing buffers for this day
                const filtered = prev.filter(b => b.day !== day);
                // Add new buffers
                return [...filtered, ...updatedBuffers];
            });

            // Show success message or handle UI feedback here if needed
        } catch (error) {
            console.error("Error updating daily buffers:", error);
            // Handle error state or show error message to user if needed
        }
    }, []);

    if (loading) {
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 border-blue-500"></div>
            </div>
        );
    }

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
                                Updated: {lastUpdated.toLocaleTimeString()}
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
                    *Drink Allocations for Monday - Friday are for 75% of daily sales, Saturday allocations are for 100%.
                </div>
            </div>
        </div>
    );
};

export default PrepAllocations;