import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Chart from "./Chart"; // Custom UPT Chart
import BufferItem from "./BufferItem";
import axiosInstance from "./axiosInstance";
import { useAuth } from "./AuthContext";
import {
    ArrowUp, ArrowDown, Calendar, Inspect, LayoutDashboard,
    ShoppingBag, TrendingUp,
} from "lucide-react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend,
} from "chart.js";
import {
    Card, CardHeader, CardBody, Typography, Button,
} from "@material-tailwind/react"; // Assuming these are used

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

// --- Chick-fil-A Theme Colors (use Tailwind config for classes) ---
const CHICKFILA_RED_PRIMARY_HEX = "#E51636";
const CHICKFILA_RED_DARKER_HEX = "#C41230"; // For hovers or emphasis

// Tailwind classes (replace with your actual configured theme names if different)
const CFA_RED_TEXT = "text-red-600"; // e.g., text-cfa-primary
const CFA_RED_BG = "bg-red-600";     // e.g., bg-cfa-primary
const CFA_RED_BG_HOVER = "hover:bg-red-700"; // e.g., hover:bg-cfa-darker
const CFA_RED_BORDER = "border-red-600"; // e.g., border-cfa-primary
const CFA_RED_LIGHT_BG = "bg-red-50";   // e.g., bg-cfa-light

const TEXT_PRIMARY = "text-neutral-800"; // For main headings
const TEXT_SECONDARY = "text-neutral-600"; // For subtext, labels
const BORDER_NEUTRAL = "border-neutral-200";
const BG_NEUTRAL_LIGHT = "bg-neutral-100";
const BG_PAGE = "bg-neutral-50";


const HomePage = () => {
    const [salesData, setSalesData] = useState([]);
    const [salesProjection, setSalesProjection] = useState([]);
    const [bufferData, setBufferData] = useState([]);
    const [activeBufferView, setActiveBufferView] = useState('chicken');
    const [editingBuffer, setEditingBuffer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chartView, setChartView] = useState('sequential');

    const getTrendColor = (trend) => {
        if (trend > 0) return 'text-green-500';
        if (trend < 0) return CFA_RED_TEXT; 
        return TEXT_SECONDARY;
    };
    const formatTrend = (trend) => {
        if (trend === 0 || trend === null || trend === undefined || isNaN(trend)) return '0.0%'; // Handle null/undefined/NaN
        return `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
    };

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [salesResponse, projectionResponse, bufferResponse, futureResponse] =
                    await Promise.all([
                        axiosInstance.get("/upt"),
                        axiosInstance.get("/sales"),
                        axiosInstance.get("/buffer"),
                        axiosInstance.get("/projections/future"),
                    ]);

                setSalesData(salesResponse.data);

                const salesProjectionArray = Object.entries(
                    projectionResponse.data
                ).map(([day, data]) => ({ day, ...data }));

                const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const today = new Date();
                const currentWeekDates = [];
                const nextWeekDates = [];

                const monday = new Date(today);
                const dayOfWeek = monday.getDay();
                const diff = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                monday.setDate(diff);
                monday.setHours(0, 0, 0, 0);

                for (let i = 0; i < 6; i++) {
                    const date = new Date(monday);
                    date.setDate(monday.getDate() + i);
                    currentWeekDates.push(date);
                }

                const nextMonday = new Date(monday);
                nextMonday.setDate(monday.getDate() + 7);
                for (let i = 0; i < 6; i++) {
                    const date = new Date(nextMonday);
                    date.setDate(nextMonday.getDate() + i);
                    nextWeekDates.push(date);
                }

                const futureProjectionsMap = futureResponse.data.reduce((acc, proj) => {
                    const date = new Date(proj.date);
                    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                    const dateStr = localDate.toISOString().split('T')[0];
                    acc[dateStr] = proj.amount;
                    return acc;
                }, {});
                
                const createProjectionEntry = (date, map, defaults) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const dayName = daysOfWeek[date.getDay() - 1]; 
                    const defaultSales = defaults.find(p => p.day === dayName)?.sales || 0;
                    const futureSale = map[dateStr];
                    return {
                        date,
                        dateStr,
                        day: dayName,
                        sales: typeof futureSale === 'number' ? futureSale : defaultSales,
                        originalSales: defaultSales,
                        hasFutureProjection: typeof futureSale === 'number' && futureSale !== defaultSales,
                    };
                };
                
                const combinedProjections = [
                    ...currentWeekDates.map(date => createProjectionEntry(date, futureProjectionsMap, salesProjectionArray)),
                    ...nextWeekDates.map(date => createProjectionEntry(date, futureProjectionsMap, salesProjectionArray))
                ].filter(proj => proj.date.getDay() !== 0); 

                combinedProjections.sort((a, b) => a.date - b.date);
                setSalesProjection(combinedProjections);
                setBufferData(bufferResponse.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchData(); 
    }, [user]); 

    const getShortDayName = (date) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 
        return days[date.getDay()];
    };
    
    const chartData = useMemo(() => ({
        labels: salesProjection.map((projection) => {
            const date = new Date(projection.date);
            return `${date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} (${getShortDayName(date)})`;
        }),
        datasets: [{
            label: "Sales Projection",
            data: salesProjection.map((projection) => projection.sales),
            fill: false,
            borderColor: salesProjection.map(proj => proj.hasFutureProjection ? CHICKFILA_RED_DARKER_HEX : CHICKFILA_RED_PRIMARY_HEX),
            backgroundColor: salesProjection.map(proj => proj.hasFutureProjection ? CHICKFILA_RED_DARKER_HEX : CHICKFILA_RED_PRIMARY_HEX), 
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
        }],
    }), [salesProjection]);

    const yAxisBounds = useMemo(() => {
        if (!salesProjection || salesProjection.length === 0) return { min: 0, max: 10000 }; 
        const allSales = salesProjection.map(proj => proj.sales);
        const minSales = Math.min(...allSales);
        const maxSales = Math.max(...allSales);
        const buffer = (maxSales - minSales) * 0.1 || 1000; 
        return {
            min: Math.max(0, Math.floor((minSales - buffer) / 1000) * 1000), 
            max: Math.ceil((maxSales + buffer) / 1000) * 1000
        };
    }, [salesProjection]);

    const chartOptionsBase = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: "14-Day Sales Forecast",
                font: { size: 18, weight: "600", family: 'SF Pro Display, Helvetica' },
                color: '#374151', 
                padding: { top: 10, bottom: 20 },
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#1f2937', 
                bodyColor: '#374151', 
                bodyFont: { size: 13, family: 'SF Pro Display, Helvetica' },
                titleFont: { size: 14, weight: '600', family: 'SF Pro Display, Helvetica'},
                padding: 12,
                borderColor: '#e5e7eb', 
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    title: (tooltipItems) => {
                        const projection = salesProjection[tooltipItems[0].dataIndex];
                        if (!projection) return '';
                        const date = new Date(projection.date);
                        const formattedDate = date.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
                        return projection.hasFutureProjection ? `${formattedDate} (Manual Projection)` : formattedDate;
                    },
                    label: (context) => {
                        const projection = salesProjection[context.dataIndex];
                        if (!projection) return '';
                        const lines = [`Sales: $${context.raw.toLocaleString()}`];
                        if (projection.hasFutureProjection && projection.originalSales !== projection.sales) {
                            lines.push(`System Default: $${projection.originalSales.toLocaleString()}`);
                        }
                        return lines;
                    }
                }
            }
        },
        scales: {
            y: {
                min: yAxisBounds.min,
                max: yAxisBounds.max,
                grid: { color: "rgba(0,0,0,0.05)" }, 
                ticks: {
                    font: { family: 'SF Pro Display, Helvetica', size: 12 },
                    color: '#6b7280', 
                    callback: (value) => `$${value.toLocaleString()}`,
                    padding: 10,
                },
                border: { display: false },
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { family: 'SF Pro Display, Helvetica', size: 11, weight: '500' },
                    color: '#6b7280', 
                    maxRotation: 45,
                    minRotation: 45,
                    padding: 8,
                },
                border: { display: false },
            },
        },
        elements: { line: { borderWidth: 2.5 } }, 
        layout: { padding: { left: 5, right: 15, top: 5, bottom: 5 } }, 
    }), [salesProjection, yAxisBounds]);
    
    const overlappingChartData = useMemo(() => {
        if (salesProjection.length < 12) return { labels: [], datasets: [] }; 
        const currentWeek = salesProjection.slice(0, 6);
        const nextWeek = salesProjection.slice(6, 12);
    
        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [
                {
                    label: "This Week",
                    data: currentWeek.map(proj => proj.sales),
                    borderColor: CHICKFILA_RED_PRIMARY_HEX,
                    backgroundColor: CHICKFILA_RED_PRIMARY_HEX,
                    borderWidth: 2.5, tension: 0.3, pointRadius: 5, pointHoverRadius: 7,
                    pointBorderColor: "#ffffff", pointBorderWidth: 2,
                },
                {
                    label: "Next Week",
                    data: nextWeek.map(proj => proj.sales),
                    borderColor: CHICKFILA_RED_DARKER_HEX, 
                    backgroundColor: CHICKFILA_RED_DARKER_HEX,
                    borderWidth: 2.5, borderDash: [6, 3], tension: 0.3, pointRadius: 5, pointHoverRadius: 7,
                    pointBorderColor: "#ffffff", pointBorderWidth: 2,
                }
            ]
        };
    }, [salesProjection]);

    const overlappingChartOptions = useMemo(() => ({
        ...chartOptionsBase,
        plugins: {
            ...chartOptionsBase.plugins,
            legend: {
                display: true, position: 'top',
                labels: {
                    font: { family: 'SF Pro Display, Helvetica', size: 12, weight: '500' },
                    color: '#4b5563', 
                    usePointStyle: true, padding: 20, boxWidth: 10,
                }
            },
            tooltip: { 
                ...chartOptionsBase.plugins.tooltip,
                callbacks: {
                    title: (tooltipItems) => {
                        const dataIndex = tooltipItems[0].dataIndex;
                        const dayLabel = overlappingChartData.labels[dataIndex];
                        return `${dayLabel}`;
                    },
                    label: (context) => {
                        const datasetLabel = context.dataset.label;
                        const value = context.raw;
                        const originalProjection = salesProjection[context.datasetIndex === 0 ? context.dataIndex : context.dataIndex + 6];
                        let label = `${datasetLabel} Sales: $${value.toLocaleString()}`;
                        if (originalProjection && originalProjection.hasFutureProjection && originalProjection.originalSales !== originalProjection.sales) {
                            label += ` (Default: $${originalProjection.originalSales.toLocaleString()})`;
                        }
                        return label;
                    }
                }
            }
        },
    }), [chartOptionsBase, overlappingChartData, salesProjection]);


    const handleBufferEdit = (bufferId) => setEditingBuffer(bufferId);
    const handleBufferUpdate = async (bufferId, newValue) => {
        try {
            await axiosInstance.put(`/buffer/${bufferId}`, { bufferPrcnt: newValue });
            setBufferData(prev => prev.map(b => b._id === bufferId ? { ...b, bufferPrcnt: newValue, updatedOn: new Date().toISOString() } : b));
            setEditingBuffer(null);
        } catch (error) {
            console.error("Error updating buffer:", error);
        }
    };

    const getBufferColor = (value) => {
        if (value > 0) return "text-green-600";
        if (value < 0) return CFA_RED_TEXT;
        return TEXT_SECONDARY;
    };
    const getBufferArrow = (value) => {
        if (value > 0) return <ArrowUp className="inline-block w-3.5 h-3.5 mr-0.5 text-green-600" />;
        if (value < 0) return <ArrowDown className="inline-block w-3.5 h-3.5 mr-0.5 text-red-600" />; 
        return null;
    };

    const getBufferStatusClasses = (value) => {
        if (value > 5) return "bg-green-50 border-green-200";
        if (value < -5) return `${CFA_RED_LIGHT_BG} ${CFA_RED_BORDER.replace('border-', 'border-red-200')}`; 
        return `${BG_NEUTRAL_LIGHT} border-neutral-200`;
    };
    
    const chickenBufferData = useMemo(() => bufferData.filter(b => ["Spicy Strips", "Spicy Filets", "Filets", "Grilled Filets", "Grilled Nuggets", "Nuggets"].includes(b.productName)), [bufferData]);
    const prepBufferData = useMemo(() => bufferData.filter(b => !["Spicy Strips", "Spicy Filets", "Filets", "Grilled Filets", "Grilled Nuggets", "Nuggets"].includes(b.productName)), [bufferData]);
    
    const handleToggleBufferView = (view) => setActiveBufferView(view);

    const filteredSalesProjection = useMemo(() => salesProjection.filter(p => p.day !== "Sunday"), [salesProjection]);
    const weeklyTotal = useMemo(() => filteredSalesProjection.slice(0, 6).reduce((acc, curr) => acc + curr.sales, 0), [filteredSalesProjection]);
    const nextWeekTotal = useMemo(() => filteredSalesProjection.slice(6, 12).reduce((acc, curr) => acc + curr.sales, 0), [filteredSalesProjection]);

    // MODIFIED: Renamed weekOverWeekChange for clarity and its intended use for "Next Week vs This Week"
    const nextWeekVsThisWeekChange = useMemo(() => {
        if (weeklyTotal === 0) return 0; // Avoid division by zero
        return ((nextWeekTotal - weeklyTotal) / weeklyTotal) * 100;
    }, [weeklyTotal, nextWeekTotal]);

    // ADDED: New calculation for "This Week vs Next Week"
    const thisWeekVsNextWeekChange = useMemo(() => {
        if (nextWeekTotal === 0) return 0; // Avoid division by zero
        return ((weeklyTotal - nextWeekTotal) / nextWeekTotal) * 100;
    }, [weeklyTotal, nextWeekTotal]);
    
    const dailyAverage = useMemo(() => weeklyTotal && filteredSalesProjection.slice(0, 6).length > 0 ? weeklyTotal / Math.min(filteredSalesProjection.slice(0, 6).length, 6) : 0, [weeklyTotal, filteredSalesProjection]);

    const getTodayDayName = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date().getDay()];
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen ${BG_PAGE} flex justify-center items-center`}>
                <div className={`w-12 h-12 rounded-full border-4 ${CFA_RED_BORDER} border-t-transparent animate-spin`}></div>
            </div>
        );
    }
    const renderAdminSection = (children) => user && user.isAdmin ? children : null;

    const todaySalesProjection = salesProjection.find(proj => new Date(proj.date).toDateString() === new Date().toDateString());

    const cardClasses = `bg-white ${BORDER_NEUTRAL} shadow-sm rounded-xl overflow-hidden`; 
    const cardHeaderClasses = `p-4 sm:p-6 ${BORDER_NEUTRAL} border-b`; 
    const cardBodyClasses = "p-4 sm:p-6";
    const cardTitleClasses = `font-semibold ${TEXT_PRIMARY} text-lg`; 
    const cardSubtitleClasses = `${TEXT_SECONDARY} text-sm`;

    const primaryButtonClasses = `${CFA_RED_BG} ${CFA_RED_BG_HOVER} text-white font-medium py-2 px-4 rounded-lg text-sm`;
    const toggleButtonBaseClasses = "px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150";
    const activeToggleButtonClasses = `${CFA_RED_BG} text-white`;
    const inactiveToggleButtonClasses = `${BG_NEUTRAL_LIGHT} ${TEXT_SECONDARY.replace('text-','text-neutral-')} hover:bg-neutral-200`;


    return (
        <div className={`min-h-screen ${BG_PAGE}`}>
            <header className={`bg-white ${BORDER_NEUTRAL} border-b sticky top-0 z-30`}>
                <div className="container mx-auto px-4 sm:px-6 py-2">
                    <div className="flex items-center">
                        <LayoutDashboard className={CFA_RED_TEXT} size={26} />
                        <div className="ml-3">
                            <Typography variant="h6" className={`${cardTitleClasses} !mb-0`}>
                                {user?.isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                            </Typography>
                            <Typography variant="small" className={cardSubtitleClasses}>
                                Welcome back
                            </Typography>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 py-6 relative z-20">
                {renderAdminSection(
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                        {[
                            { title: "Today's Sales", value: `$${todaySalesProjection?.sales.toLocaleString() || '0'}`, subtext: `${getTodayDayName()}${todaySalesProjection?.hasFutureProjection ? ' (Manual)' : ''}`, Icon: ShoppingBag },
                            // MODIFIED: Use thisWeekVsNextWeekChange for "This Week's Total"
                            { title: "This Week's Total", value: `$${weeklyTotal.toLocaleString()}`, trend: thisWeekVsNextWeekChange, trendText: "vs. Next Week", Icon: Calendar },
                            // MODIFIED: Use nextWeekVsThisWeekChange for "Next Week's Total" (previously was -weekOverWeekChange)
                            { title: "Next Week's Total", value: `$${nextWeekTotal.toLocaleString()}`, trend: nextWeekVsThisWeekChange, trendText: "vs. This Week", Icon: TrendingUp },
                            { title: "Daily Average", value: `$${Math.round(dailyAverage).toLocaleString()}`, subtext: "This Week (Mon-Sat)", Icon: Inspect }
                        ].map(stat => (
                            <Card key={stat.title} className={`${cardClasses} flex flex-col`}> 
                                <CardBody className={`${cardBodyClasses} flex-grow`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <Typography variant="small" className={`${cardSubtitleClasses} mb-0.5`}>{stat.title}</Typography>
                                            <Typography variant="h4" className={`font-bold ${TEXT_PRIMARY} text-2xl`}>{stat.value}</Typography>
                                            {stat.trend !== undefined && !isNaN(stat.trend) ? ( // Added !isNaN check
                                                <div className="flex items-center mt-1">
                                                    {stat.trend > 0 ? <ArrowUp className="h-3.5 w-3.5 text-green-500 mr-0.5" /> : stat.trend < 0 ? <ArrowDown className="h-3.5 w-3.5 text-red-500 mr-0.5" /> : null}
                                                    <Typography variant="small" className={getTrendColor(stat.trend)}>{formatTrend(stat.trend)} <span className={TEXT_SECONDARY}>{stat.trendText}</span></Typography>
                                                </div>
                                            ) : stat.subtext ? (
                                                <Typography variant="small" className={cardSubtitleClasses}>{stat.subtext}</Typography>
                                            ) : null}
                                        </div>
                                        <div className={`w-10 h-10 rounded-lg ${CFA_RED_LIGHT_BG} flex items-center justify-center shrink-0`}>
                                            <stat.Icon className={`h-5 w-5 ${CFA_RED_TEXT}`} />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-6">
                    {renderAdminSection(
                        <Card className={`${cardClasses} lg:col-span-5`}>
                            <CardHeader floated={false} shadow={false} className={`${cardHeaderClasses} flex items-center justify-between`}>
                                <div>
                                    <Typography variant="h6" className={cardTitleClasses}>UPTs by Product</Typography>
                                    <Typography variant="small" className={cardSubtitleClasses}>Product Performance</Typography>
                                </div>
                                <Link to="/update-upt">
                                    <Button size="sm" className={primaryButtonClasses}>Update</Button>
                                </Link>
                            </CardHeader>
                            <CardBody className={`${cardBodyClasses} pt-0`}>
                                <Chart data={salesData} height={300} /> 
                            </CardBody>
                        </Card>
                    )}

                    <Card className={`${cardClasses} ${user?.isAdmin ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                        <CardHeader floated={false} shadow={false} className={`${cardHeaderClasses} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2`}>
                            <div>
                                <Typography variant="h6" className={cardTitleClasses}>Sales Projections</Typography>
                                <Typography variant="small" className={cardSubtitleClasses}>14-Day Forecast</Typography>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex bg-neutral-100 rounded-lg p-0.5">
                                    <Button size="sm" className={`${toggleButtonBaseClasses} ${chartView === 'sequential' ? activeToggleButtonClasses : inactiveToggleButtonClasses}`} onClick={() => setChartView('sequential')}>Sequential</Button>
                                    <Button size="sm" className={`${toggleButtonBaseClasses} ${chartView === 'overlap' ? activeToggleButtonClasses : inactiveToggleButtonClasses}`} onClick={() => setChartView('overlap')}>Overlap</Button>
                                </div>
                                {renderAdminSection(
                                    <Link to="/update-sales-projection">
                                        <Button size="sm" className={primaryButtonClasses}>Update</Button>
                                    </Link>
                                )}
                            </div>
                        </CardHeader>
                        <CardBody className={cardBodyClasses}>
                            <div className="h-[300px] sm:h-[350px]"> 
                                <Line options={chartView === 'sequential' ? chartOptionsBase : overlappingChartOptions} data={chartView === 'sequential' ? chartData : overlappingChartData} />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
                                {salesProjection.slice(0, 6).map((projection) => {
                                    const date = new Date(projection.date);
                                    const isToday = date.toDateString() === new Date().toDateString();
                                    return (
                                        <div key={projection.dateStr}
                                            className={`bg-white rounded-lg p-3 border transition-shadow duration-200 hover:shadow-md 
                                            ${isToday ? CFA_RED_BORDER : BORDER_NEUTRAL}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <Typography variant="small" className={`font-medium ${isToday ? CFA_RED_TEXT : TEXT_SECONDARY} text-xs sm:text-sm`}>{getShortDayName(date)}</Typography>
                                                {projection.hasFutureProjection && (
                                                    <div title="Manual Projection" className={`w-2 h-2 rounded-full ${CFA_RED_BG}`}></div>
                                                )}
                                            </div>
                                            <Typography variant="small" className={`${TEXT_SECONDARY} text-xs mb-1.5`}>
                                                {date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                                            </Typography>
                                            <Typography variant="h6" className={`${TEXT_PRIMARY} font-semibold text-base sm:text-lg`}>
                                                {projection.sales.toLocaleString()}
                                            </Typography>
                                            {projection.hasFutureProjection && (
                                                <Typography variant="small" className={`${TEXT_SECONDARY} text-xs line-through`}>
                                                    {projection.originalSales.toLocaleString()}
                                                </Typography>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Buffer Section */}
                {renderAdminSection(
                    <Card className={cardClasses}>
                        <CardHeader floated={false} shadow={false} className={`${cardHeaderClasses} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2`}>
                            <div>
                                <Typography variant="h6" className={cardTitleClasses}>Buffer Information</Typography>
                                <Typography variant="small" className={cardSubtitleClasses}>Product Buffer Status</Typography>
                            </div>
                            <div className="flex bg-neutral-100 rounded-lg p-0.5">
                                <Button size="sm" className={`${toggleButtonBaseClasses} ${activeBufferView === 'chicken' ? activeToggleButtonClasses : inactiveToggleButtonClasses}`} onClick={() => handleToggleBufferView('chicken')}>Chicken</Button>
                                <Button size="sm" className={`${toggleButtonBaseClasses} ${activeBufferView === 'prep' ? activeToggleButtonClasses : inactiveToggleButtonClasses}`} onClick={() => handleToggleBufferView('prep')}>Prep</Button>
                            </div>
                        </CardHeader>
                        <CardBody className={cardBodyClasses}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {(activeBufferView === 'chicken' ? chickenBufferData : prepBufferData).map((buffer) => (
                                    <BufferItem
                                        key={buffer._id}
                                        buffer={buffer}
                                        editingBuffer={editingBuffer}
                                        handleBufferEdit={handleBufferEdit}
                                        handleBufferUpdate={handleBufferUpdate}
                                        getBufferColor={getBufferColor}
                                        getBufferArrow={getBufferArrow}
                                        statusClasses={getBufferStatusClasses(buffer.bufferPrcnt)}
                                    />
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default HomePage;