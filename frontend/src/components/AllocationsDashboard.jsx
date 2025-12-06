import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowBackIos } from "@mui/icons-material";
import { Snowflake, UtensilsCrossed, Clock, Maximize, Minimize, Settings, Calendar, Coffee } from "lucide-react";
import { useAuth } from "./AuthContext";
import useSWR from 'swr';
import axiosInstance from "./axiosInstance";

import ThawingCabinet from "./ThawingCabinet";
import PrepAllocations from "./PrepAllocations";
import BeverageAllocations from "./BeverageAllocations";


const AllocationsDashboard = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState("thawing"); // "thawing" or "prep"
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showAdminView, setShowAdminView] = useState(false);
    const [showNextWeek, setShowNextWeek] = useState(false);

    // Check for stored fullscreen preference
    useEffect(() => {
        const storedFullScreenPreference = localStorage.getItem('isFullScreen');
        if (storedFullScreenPreference === 'true' && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
            setIsFullScreen(true);
        }

        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
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

    // Data fetching hooks - shared between both components
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

    const { data: dailyBuffers, error: buffersError, mutate: mutateDailyBuffers } = useSWR("/daily-buffer", fetcher, {
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

    // Toggle fullscreen
    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullScreen(true);
                localStorage.setItem('isFullScreen', 'true');
            }).catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullScreen(false);
                    localStorage.setItem('isFullScreen', 'false');
                }).catch(err => {
                    console.error('Error attempting to exit fullscreen:', err);
                });
            }
        }
    }, []);

    // Handle daily buffer adjustments
    const handleAdjustBuffer = useCallback(async (day, buffers) => {
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
    }, [mutateDailyBuffers]);

    // Check for loading state
    const isLoading = !salesData || !utpData || !bufferData;

    // Check for errors
    const errors = [
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

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
            <div className={`min-h-full w-full bg-white rounded-lg md:rounded-xl shadow-xl p-2 sm:p-4 border border-gray-100 flex flex-col ${isFullScreen ? 'h-full max-h-screen' : ''}`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                        <Link to={"/"} className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                            <ArrowBackIos /> Allocations Dashboard
                        </Link>
                        {showNextWeek && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                                Next Week's Projections
                            </span>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-inner">
                        <button
                            onClick={() => setActiveView("thawing")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-300 ${activeView === "thawing"
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <Snowflake className="w-4 h-4" />
                            <span className="font-medium">Thawing</span>
                        </button>
                        <button
                            onClick={() => setActiveView("prep")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-300 ${activeView === "prep"
                                ? "bg-green-500 text-white shadow-sm"
                                : "text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <UtensilsCrossed className="w-4 h-4" />
                            <span className="font-medium">Prep</span>
                        </button>
                        <button
                            onClick={() => setActiveView("beverage")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-300 ${activeView === "beverage"
                                ? "bg-yellow-700 text-white shadow-sm"
                                : "text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <Coffee className="w-4 h-4" />
                            <span className="font-medium">Beverages</span>
                        </button>
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

                {/* Main Content - Conditionally render based on activeView */}
                <div className={`flex-1 flex flex-col transition-opacity duration-300 w-full ${isFullScreen ? 'min-h-0' : ''}`}>
                    {activeView === "thawing" ? (
                        <ThawingCabinet
                            data={data}
                            showAdminView={showAdminView}
                            showNextWeek={showNextWeek}
                            isFullScreen={isFullScreen}
                            adjustments={adjustments}
                            closures={closures}
                            messages={messages}
                            salesProjectionConfig={salesProjectionConfig}
                            futureProjections={futureProjections}
                            containerMode={true}
                        />
                    ) : activeView === "prep" ? (
                        <PrepAllocations
                            data={data}
                            showAdminView={showAdminView}
                            showNextWeek={showNextWeek}
                            isFullScreen={isFullScreen}
                            adjustments={adjustments}
                            closures={closures}
                            messages={messages}
                            salesProjectionConfig={salesProjectionConfig}
                            futureProjections={futureProjections}
                            dailyBuffers={dailyBuffers}
                            onAdjustBuffer={handleAdjustBuffer}
                            containerMode={true}
                        />
                    ) : (
                        <BeverageAllocations
                            data={data}
                            showAdminView={showAdminView}
                            showNextWeek={showNextWeek}
                            isFullScreen={isFullScreen}
                            adjustments={adjustments}
                            closures={closures}
                            messages={messages}
                            salesProjectionConfig={salesProjectionConfig}
                            futureProjections={futureProjections}
                            dailyBuffers={dailyBuffers}
                            onAdjustBuffer={handleAdjustBuffer}
                            containerMode={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllocationsDashboard; 