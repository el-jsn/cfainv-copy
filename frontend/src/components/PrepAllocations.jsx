// src/components/PrepAllocations.js

import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { Clock, Maximize, Minimize } from "lucide-react";
import axiosInstance from "./axiosInstance";
import playbackVid from "../assets/background.mp4";
console.log(playbackVid);

const useCalculatePrepData = (salesData, utpData, bufferData, adjustments) => {
    return useMemo(() => {
        if (!salesData || !utpData || !bufferData) return [];

        const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const calculateBufferMultiplier = (bufferPrcnt) => (100 + bufferPrcnt) / 100;

        const bufferMultipliers = {
            Lettuce: calculateBufferMultiplier(bufferData.find(item => item.productName === "Lettuce")?.bufferPrcnt || 1),
            Tomato: calculateBufferMultiplier(bufferData.find(item => item.productName === "Tomato")?.bufferPrcnt || 1),
            Lemonade: calculateBufferMultiplier(bufferData.find(item => item.productName === "Lemonade")?.bufferPrcnt || 1),
            "Diet Lemonade": calculateBufferMultiplier(bufferData.find(item => item.productName === "Diet Lemonade")?.bufferPrcnt || 1),
            "Sunjoy Lemonade": calculateBufferMultiplier(bufferData.find(item => item.productName === "Sunjoy Lemonade")?.bufferPrcnt || 1),
            Romaine: calculateBufferMultiplier(bufferData.find(item => item.productName === "Romaine")?.bufferPrcnt || 1),
        };

        const utpValues = {
            Lettuce: utpData.find(item => item.productName === "Lettuce")?.utp || 1.0,
            Tomato: utpData.find(item => item.productName === "Tomato")?.utp || 1.0,
            Lemonade: utpData.find(item => item.productName === "Lemonade")?.utp || 1.0,
            "Diet Lemonade": utpData.find(item => item.productName === "Diet Lemonade")?.utp || 1.0,
            "Sunjoy Lemonade": utpData.find(item => item.productName === "Sunjoy Lemonade")?.utp || 1.0,
            Romaine: utpData.find(item => item.productName === "Romaine")?.utp || 1.0,
        };


        return daysOrder.map((day, index) => {
            const entry = salesData.find(e => e.day === day) || { day, sales: 0 };
            const dayAdjustments = adjustments.filter(msg => msg.day === day);
            const currentDaySales = entry.sales;
            const isSaturday = day === "Saturday"
            const drinkMultiplier = isSaturday ? 1 : 0.75;


            const applyMessage = (product, pans, buckets = 0) => {
                const message = dayAdjustments.find(msg => msg.product === product);
                let finalPans = pans;
                let finalBuckets = buckets

                if (message) {
                    const parts = message.message.split(' and ');
                    parts.forEach(part => {
                        const [change, unit] = part.trim().split(' ');
                        const value = parseInt(change);
                        if (!isNaN(value)) {
                            if (unit === 'pans') {
                                finalPans += value;
                            } else if (unit === 'buckets') {
                                finalBuckets += value
                            }
                        }
                    });
                }
                return { pans: Math.max(0, finalPans), buckets: Math.max(0, finalBuckets), modified: !!message };
            };


            const calculateLettucePans = (utp, bufferMultiplier) => Math.round(((utp * (currentDaySales / 1000)) / 120) * bufferMultiplier);
            const calculateTomatoPans = (utp, bufferMultiplier) => Math.round(((utp * (currentDaySales / 1000)) / 166) * bufferMultiplier);
            const calculateRomainePans = (utp, bufferMultiplier) => Math.round(((utp * (currentDaySales / 1000)) / 2585.48) * bufferMultiplier);
            const calculateBuckets = (utp, bufferMultiplier) => Math.ceil((((utp / 33.814) * currentDaySales) / 1000 / 12) * bufferMultiplier * drinkMultiplier);



            const lettucePans = calculateLettucePans(utpValues.Lettuce, bufferMultipliers.Lettuce);
            const tomatoPans = calculateTomatoPans(utpValues.Tomato, bufferMultipliers.Tomato);
            const lemonadeBuckets = calculateBuckets(utpValues.Lemonade, bufferMultipliers.Lemonade);
            const dietLemonadeBuckets = calculateBuckets(utpValues["Diet Lemonade"], bufferMultipliers["Diet Lemonade"]);
            const sunjoyLemonadeBuckets = calculateBuckets(utpValues["Sunjoy Lemonade"], bufferMultipliers["Sunjoy Lemonade"]);
            const romainePans = calculateRomainePans(utpValues.Romaine, bufferMultipliers.Romaine)



            return {
                day: entry.day,
                lettuce: applyMessage("Lettuce", lettucePans),
                romaine: applyMessage("Romaine", romainePans),
                tomato: applyMessage("Tomato", tomatoPans),
                lemonade: applyMessage("Lemonade", 0, lemonadeBuckets),
                dietLemonade: applyMessage("Diet Lemonade", 0, dietLemonadeBuckets),
                sunjoyLemonade: applyMessage("Sunjoy Lemonade", 0, sunjoyLemonadeBuckets),
            };
        });
    }, [salesData, utpData, bufferData, adjustments]);
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

const DayCard = memo(({ entry, currentDay, closures, messages }) => {
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
            "Lemonade": { name: "Lemonade", data: entry.lemonade, bg: "bg-yellow-200 text-gray-800", index: 3 },
            "Diet Lemonade": { name: "Diet Lemonade", data: entry.dietLemonade, bg: "bg-yellow-100 text-gray-800", index: 4 },
            "Sunjoy Lemonade": { name: "Sunjoy Lemonade", data: entry.sunjoyLemonade, bg: "bg-orange-200 text-gray-800", index: 5 },
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
                    hover:shadow-sm flex flex-col justify-center items-center`}
            >
                <div className="font-semibold text-center mb-0.5 text-l sm:text-base">{productData.name}</div>
                <div className={`text-center text-l sm:text-base ${productData.data.modified ? "text-red-700 font-bold" : ""}`}>
                    {productData.data.pans > 0 && <div>{productData.data.pans} pans</div>}
                    {productData.data.buckets > 0 && <div>{productData.data.buckets} buckets (12qt)</div>}
                </div>
                {relevantMessages.map((msg, index) => (
                    <div key={index} className="mt-1 text-xs sm:text-sm bg-yellow-50 p-1 rounded-md text-yellow-800 border border-yellow-200">
                        {msg.message}
                    </div>
                ))}
            </div>
        );
    };


    return (
        <div
            key={entry.day}
            className={`flex flex-col transition-all duration-200
            ${isToday
                    ? 'ring-2 ring-blue-500 shadow-lg border-transparent'
                    : 'border border-gray-200 hover:shadow-md'
                } rounded-lg md:rounded-xl`}
            style={{ height: '100%', width: '100%' }}
        >
            <div
                className={`p-2 sm:p-2 rounded-t-lg md:rounded-t-xl font-bold text-center text-sm sm:text-base
              ${isToday
                        ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200'
                    }`}
            >
                <div className="p-1">{entry.day}</div>
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
                <div className="flex-1 flex flex-col gap-1 p-1 sm:p-2 relative">
                    {Object.keys(productsMap).map(productName => renderProductBox(productName))}
                </div>
            )}
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
    const videoRef = useRef(null); // Ref for the video element
    const containerRef = useRef(null)


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

        // Always start the video playback
        const video = document.createElement('video');
        video.src = playbackVid;
        video.loop = true;
        video.muted = true;
        video.style.display = 'none';
        document.body.appendChild(video);
        videoRef.current = video; // Store the video element in the ref
        video.play().catch(err => console.error('Video playback failed:', err));

        return () => {
            if (wakeLock) {
                wakeLock.release();
            }
            // Ensure the video is removed when the component unmounts
            if (videoRef.current) {
                document.body.removeChild(videoRef.current);
            }
        };
    }, [requestWakeLock]);

    useEffect(() => {
        if (!wakeLock && 'wakeLock' in navigator) {
            requestWakeLock();
        }
    }, [wakeLock, requestWakeLock]);

    const getCurrentDay = useCallback(() => {
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

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                adjustmentsResponse,
                closuresResponse,
                messagesResponse,
                salesResponse,
                utpResponse,
                bufferResponse,
            ] = await Promise.all([
                axiosInstance.get("/adjustment/data"),
                axiosInstance.get("/closure/plans"),
                axiosInstance.get("/messages"),
                axiosInstance.get("/sales"),
                axiosInstance.get("/upt"),
                axiosInstance.get("/buffer"),
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
        } catch (error) {
            console.error("Error fetching data:", error);
            // Consider setting an error state to display an error message to the user
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        requestWakeLock();

        const fetchInterval = setInterval(fetchData, 10 * 60 * 1000);
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
            clearInterval(adjustmentsInterval);
            clearInterval(closuresInterval);
            clearInterval(messagesInterval);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, [fetchData, requestWakeLock]);

    const currentDay = getCurrentDay();
    const calculatedData = useCalculatePrepData(data?.sales, data?.utp, data?.buffer, adjustments);
    const filteredClosures = useFilteredClosures(closures);


    if (loading) {
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="h-full w-full bg-white rounded-lg md:rounded-xl shadow-xl p-2 sm:p-4 border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Prep Allocations</h2>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
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

                <div ref={containerRef} className={`flex-1 flex gap-1 sm:gap-2 ${isFullScreen ? 'fullscreen' : ''} `} style={{ maxHeight: 'calc(100% - 50px)' }}>
                    {calculatedData.map((entry) => (
                        <DayCard
                            key={entry.day}
                            entry={entry}
                            currentDay={currentDay}
                            closures={filteredClosures}
                            messages={messages}
                        />
                    ))}
                </div>
                <div className="mt-2 text-xs text-gray-500 text-right">*Drink Allocations for Monday - Friday are for 75% of daily sales, Saturday allocations are for 100%.</div>
            </div>
        </div>
    );
};

export default PrepAllocations;