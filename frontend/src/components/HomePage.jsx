import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Chart from "./Chart";
import LogoutButton from "./LogoutButton";
import axiosInstance from "./axiosInstance";
import { useAuth } from "./AuthContext";
import {
  ChevronRight,
  MessageSquare,
  Edit2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Inspect,
  LayoutDashboard,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  IconButton,
  Tooltip as MTTooltip,
  Progress,
} from "@material-tailwind/react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HomePage = () => {
  const [salesData, setSalesData] = useState([]);
  const [salesProjection, setSalesProjection] = useState([]);
  const [bufferData, setBufferData] = useState([]);
  const [activeBufferView, setActiveBufferView] = useState('chicken'); // Changed to track "chicken" or "prep"
  const [editingBuffer, setEditingBuffer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [futureProjections, setFutureProjections] = useState({});
  const [chartView, setChartView] = useState('sequential'); // 'sequential' or 'overlap'
  const [nextWeekTotal, setNextWeekTotal] = useState(0);
  const [nextWeekAverage, setNextWeekAverage] = useState(0);

  // Calculate UTP trend percentage
  const calculateUtpTrend = (utp, oldUtp) => {
    if (!oldUtp) return 0;
    return ((utp - oldUtp) / oldUtp) * 100;
  };

  // Get trend color based on value
  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  // Format trend display
  const formatTrend = (trend) => {
    if (trend === 0) return '0%';
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

        // Process current week's projections
        const salesProjectionArray = Object.entries(
          projectionResponse.data
        ).map(([day, data]) => ({ day, ...data }));

        const daysOfWeek = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        // Get current week's dates
        const today = new Date();
        const currentWeekDates = [];
        const nextWeekDates = [];

        // Find Monday of current week
        const monday = new Date(today);
        const dayOfWeek = monday.getDay();
        const diff = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0);  // Use local time instead of UTC

        // Generate dates for current week (Monday to Saturday)
        for (let i = 0; i < 6; i++) {
          const date = new Date(monday);
          date.setDate(monday.getDate() + i);
          currentWeekDates.push(date);
        }

        // Generate dates for next week (Monday to Saturday)
        const nextMonday = new Date(monday);
        nextMonday.setDate(monday.getDate() + 7);
        for (let i = 0; i < 6; i++) {
          const date = new Date(nextMonday);
          date.setDate(nextMonday.getDate() + i);
          nextWeekDates.push(date);
        }

        // Create a map of future projections by date
        const futureProjectionsMap = futureResponse.data.reduce((acc, proj) => {
          // Convert the UTC date to local date string
          const date = new Date(proj.date);
          const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
          const dateStr = localDate.toISOString().split('T')[0];
          acc[dateStr] = proj.amount;
          return acc;
        }, {});

        // Calculate next week's total and average
        let nextWeekTotalAmount = 0;
        let nextWeekCount = 0;

        nextWeekDates.forEach(date => {
          const dateStr = date.toISOString().split('T')[0];
          const dayName = daysOfWeek[date.getDay() - 1];
          const amount = futureProjectionsMap[dateStr] || salesProjectionArray.find(p => p.day === dayName)?.sales || 0;
          nextWeekTotalAmount += amount;
          nextWeekCount++;
        });

        setNextWeekTotal(nextWeekTotalAmount);
        setNextWeekAverage(nextWeekCount > 0 ? nextWeekTotalAmount / nextWeekCount : 0);

        // Combine current week and next week projections
        const combinedProjections = [
          ...currentWeekDates.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayIndex = date.getDay() - 1;
            const dayName = daysOfWeek[dayIndex];
            const defaultSales = salesProjectionArray.find(p => p.day === dayName)?.sales || 0;

            return {
              date,
              dateStr,
              day: dayName,
              sales: futureProjectionsMap[dateStr] || defaultSales,
              originalSales: defaultSales,
              hasFutureProjection: !!futureProjectionsMap[dateStr]
            };
          }),
          ...nextWeekDates.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayIndex = date.getDay() - 1;
            const dayName = daysOfWeek[dayIndex];
            const defaultSales = salesProjectionArray.find(p => p.day === dayName)?.sales || 0;

            return {
              date,
              dateStr,
              day: dayName,
              sales: futureProjectionsMap[dateStr] || defaultSales,
              originalSales: defaultSales,
              hasFutureProjection: !!futureProjectionsMap[dateStr]
            };
          })
        ].filter(proj => {
          const day = proj.date.getDay();
          return day !== 0;
        });

        // Sort projections by date to ensure correct order
        combinedProjections.sort((a, b) => a.date - b.date);

        setSalesProjection(combinedProjections);
        setBufferData(bufferResponse.data);
        setFutureProjections(futureProjectionsMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update the getShortDayName function to only return Mon-Sat
  const getShortDayName = (date) => {
    const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay() || 7]; // Use 7 for Sunday to avoid issues
  };

  // Update the chart data labels
  const chartData = {
    labels: salesProjection.map((projection) => {
      const date = new Date(projection.date);
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} (${getShortDayName(date)})`;
    }),
    datasets: [
      {
        label: "Sales Projection",
        data: salesProjection.map((projection) => projection.sales),
        fill: false,
        backgroundColor: salesProjection.map(proj => proj.hasFutureProjection ? "#E51636" : "#6366F1"),
        borderColor: salesProjection.map(proj => proj.hasFutureProjection ? "#E51636" : "#6366F1"),
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: salesProjection.map(proj => proj.hasFutureProjection ? "#E51636" : "#6366F1"),
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  // Add a function to calculate y-axis bounds
  const getYAxisBounds = (projections) => {
    const allSales = projections.map(proj => proj.sales);
    const minSales = Math.min(...allSales);
    const maxSales = Math.max(...allSales);
    return {
      min: Math.floor((minSales - 2000) / 1000) * 1000,
      max: Math.ceil((maxSales + 1000) / 1000) * 1000
    };
  };

  // Update both chart options
  const yAxisBounds = getYAxisBounds(salesProjection);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "14-Day Sales Forecast",
        font: {
          size: 18,
          weight: "bold",
          family: 'SF Pro Display, Helvetica',
        },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1E1E1E',
        bodyColor: '#1E1E1E',
        bodyFont: {
          size: 14,
          family: 'SF Pro Display, Helvetica',
        },
        padding: 12,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            const projection = salesProjection[tooltipItems[0].dataIndex];
            const date = new Date(projection.date);
            const formattedDate = date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            });
            return projection.hasFutureProjection
              ? `${formattedDate} (Future Projection)`
              : formattedDate;
          },
          label: (context) => {
            const projection = salesProjection[context.dataIndex];
            const lines = [`Sales: $${context.raw.toLocaleString()}`];
            if (projection.hasFutureProjection && projection.originalSales !== projection.sales) {
              lines.push(`Default: $${projection.originalSales.toLocaleString()}`);
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
        grid: {
          color: "#E5E7EB",
        },
        ticks: {
          font: {
            family: 'SF Pro Display, Helvetica',
            size: 12,
          },
          callback: (value) => `$${value.toLocaleString()}`,
          padding: 10,
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'SF Pro Display, Helvetica',
            size: 12,
            weight: '500',
          },
          maxRotation: 45,
          minRotation: 45,
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 20,
      },
    },
  };

  // Add function to prepare overlapping chart data
  const getOverlappingChartData = () => {
    const currentWeek = salesProjection.slice(0, 6);
    const nextWeek = salesProjection.slice(6);

    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [
        {
          label: "Current Week",
          data: currentWeek.map(proj => proj.sales),
          borderColor: currentWeek.map(proj => proj.hasFutureProjection ? "#E51636" : "#6366F1"),
          backgroundColor: currentWeek.map(proj => proj.hasFutureProjection ? "#E51636" : "#6366F1"),
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: currentWeek.map(proj => proj.hasFutureProjection ? "#E51636" : "#6366F1"),
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
        {
          label: "Next Week",
          data: nextWeek.map(proj => proj.sales),
          borderColor: nextWeek.map(proj => proj.hasFutureProjection ? "#E51636" : "#6366F1"),
          backgroundColor: nextWeek.map(proj => proj.hasFutureProjection ? "#E51636" : "#6366F1"),
          borderWidth: 3,
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: nextWeek.map(proj => proj.hasFutureProjection ? "#E51636" : "#6366F1"),
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        }
      ]
    };
  };

  // Update the overlapping chart options
  const overlappingChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: 'SF Pro Display, Helvetica',
            size: 12,
            weight: '500',
          },
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1E1E1E',
        bodyColor: '#1E1E1E',
        bodyFont: {
          size: 14,
          family: 'SF Pro Display, Helvetica',
        },
        padding: 12,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            const datasetIndex = tooltipItems[0].datasetIndex;
            const index = tooltipItems[0].dataIndex;
            const currentWeekProj = salesProjection[index];
            const nextWeekProj = salesProjection[index + 6];
            const currentDate = new Date(currentWeekProj.date);
            const nextDate = new Date(nextWeekProj.date);

            const formatDate = (date, projection) => {
              const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              });
              return projection.hasFutureProjection
                ? `${formattedDate} (Future Projection)`
                : formattedDate;
            };

            if (datasetIndex === 0 && currentWeekProj.sales === nextWeekProj.sales) {
              return [
                `Current Week - ${formatDate(currentDate, currentWeekProj)}`,
                `Next Week - ${formatDate(nextDate, nextWeekProj)}`
              ];
            }

            const projection = datasetIndex === 0 ? currentWeekProj : nextWeekProj;
            const date = datasetIndex === 0 ? currentDate : nextDate;
            const weekLabel = datasetIndex === 0 ? 'Current Week' : 'Next Week';
            return `${weekLabel} - ${formatDate(date, projection)}`;
          },
          label: (context) => {
            const datasetIndex = context.datasetIndex;
            const index = context.dataIndex;
            const projection = datasetIndex === 0
              ? salesProjection[index]
              : salesProjection[index + 6];

            const lines = [`Sales: $${context.raw.toLocaleString()}`];
            if (projection.hasFutureProjection && projection.originalSales !== projection.sales) {
              lines.push(`Default: $${projection.originalSales.toLocaleString()}`);
            }
            return lines;
          }
        }
      }
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        min: yAxisBounds.min,
        max: yAxisBounds.max,
      }
    }
  };

  const handleBufferEdit = (bufferId) => {
    setEditingBuffer(bufferId);
  };

  const handleBufferUpdate = async (bufferId, newValue) => {
    try {
      await axiosInstance.put(`/buffer/${bufferId}`, { bufferPrcnt: newValue });
      const updatedBufferData = bufferData.map((buffer) =>
        buffer._id === bufferId
          ? { ...buffer, bufferPrcnt: newValue, updatedOn: new Date().toISOString() }
          : buffer
      );
      setBufferData(updatedBufferData);
      setEditingBuffer(null);
    } catch (error) {
      console.error("Error updating buffer:", error);
    }
  };

  const getBufferColor = (value) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-500";
  };

  const getBufferArrow = (value) => {
    if (value > 0) return <ArrowUp className="inline-block w-4 h-4 mr-1 text-green-600" />;
    if (value < 0) return <ArrowDown className="inline-block w-4 h-4 mr-1 text-red-600" />;
    return null;
  };
  // Function to filter buffer data for Chicken
  const chickenBufferData = () => {
    return bufferData.filter(buffer =>
      [
        "Spicy Strips",
        "Spicy Filets",
        "Filets",
        "Grilled Filets",
        "Grilled Nuggets",
        "Nuggets"
      ].includes(buffer.productName)
    );
  };

  // Function to filter buffer data for Prep
  const prepBufferData = () => {
    return bufferData.filter(buffer =>
      ![
        "Spicy Strips",
        "Spicy Filets",
        "Filets",
        "Grilled Filets",
        "Grilled Nuggets",
        "Nuggets"
      ].includes(buffer.productName)
    );
  };


  const handleToggleBufferView = (view) => {
    setActiveBufferView(view);
  };

  // Filter out Sunday from sales projection data
  const filteredSalesProjection = salesProjection.filter(
    (projection) => projection.day !== "Sunday"
  );

  // Calculate weekly total excluding Sunday - only use first 6 days (current week)
  const weeklyTotal = filteredSalesProjection.slice(0, 6).reduce(
    (acc, curr) => acc + curr.sales,
    0
  );

  // Calculate daily average excluding Sunday - only use first 6 days (current week)
  const dailyAverage = weeklyTotal / Math.min(filteredSalesProjection.slice(0, 6).length, 6);

  // Add a function to get today's day name
  const getTodayDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    return days[today.getDay()];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <Progress color="indigo" size="lg" className="w-64" />
      </div>
    );
  }
  const renderAdminSection = (children) => {
    return user && user.isAdmin ? children : null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Simplified Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center">
            <LayoutDashboard className="text-indigo-500" size={24} />
            <Typography variant="h5" className="font-bold text-gray-800 ml-3">
              {user?.isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </Typography>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {renderAdminSection(
            <>
              <Card className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="small" className="text-gray-600 mb-1 font-medium">
                        Today's Sales
                      </Typography>
                      <Typography variant="h4" className="font-bold text-gray-800">
                        ${salesProjection.find(proj =>
                          new Date(proj.date).toDateString() === new Date().toDateString()
                        )?.sales.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        {getTodayDayName()}
                        {salesProjection.find(proj =>
                          new Date(proj.date).toDateString() === new Date().toDateString()
                        )?.hasFutureProjection && (
                            <span className="ml-2 text-indigo-500 text-xs">(Future Projection)</span>
                          )}
                      </Typography>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="small" className="text-gray-600 mb-1 font-medium">
                        Daily Average
                      </Typography>
                      <Typography variant="h4" className="font-bold text-gray-800">
                        ${Math.round(dailyAverage).toLocaleString()}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        Mon-Sat Average
                      </Typography>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Inspect className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="small" className="text-gray-600 mb-1 font-medium">
                        Weekly Total
                      </Typography>
                      <Typography variant="h4" className="font-bold text-gray-800">
                        ${weeklyTotal.toLocaleString()}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        6-Day Total
                      </Typography>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>

        {/* Charts Section with Modern Design */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* UPTs Chart */}
          {renderAdminSection(
            <Card className="lg:col-span-5 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
              <CardHeader floated={false} shadow={false} className="rounded-none">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <Typography variant="h6" color="blue-gray" className="font-bold">
                      UPTs by Product
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      Product Performance
                    </Typography>
                  </div>
                  <Link to="/update-upt">
                    <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                      Update
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardBody className="px-6 pt-0">
                <Chart data={salesData} height={300} />
              </CardBody>
            </Card>
          )}

          {/* Sales Projection Chart */}
          <Card className="lg:col-span-7 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
            <CardHeader floated={false} shadow={false} className="rounded-none">
              <div className="flex items-center justify-between p-6">
                <div>
                  <Typography variant="h6" color="blue-gray" className="font-bold">
                    Sales Projections
                  </Typography>
                  <Typography variant="small" className="text-gray-600">
                    14-Day Forecast
                  </Typography>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <Button
                      size="sm"
                      className={`px-4 py-2 rounded-md transition-all duration-300 ${chartView === 'sequential'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                        }`}
                      onClick={() => setChartView('sequential')}
                    >
                      Sequential
                    </Button>
                    <Button
                      size="sm"
                      className={`px-4 py-2 rounded-md transition-all duration-300 ${chartView === 'overlap'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                        }`}
                      onClick={() => setChartView('overlap')}
                    >
                      Overlap
                    </Button>
                  </div>
                  {renderAdminSection(
                    <Link to="/update-sales-projection">
                      <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                        Update
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardBody className="px-6 pt-0">
              <div className="h-[300px]">
                <Line
                  options={chartView === 'sequential' ? chartOptions : overlappingChartOptions}
                  data={chartView === 'sequential' ? chartData : getOverlappingChartData()}
                />
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
                {salesProjection.slice(0, 6).map((projection) => {
                  const date = new Date(projection.date);
                  return (
                    <div key={projection.dateStr}
                      className={`bg-gray-50 rounded-lg p-3 text-center transform transition-transform hover:scale-105 
                        ${projection.sales !== projection.originalSales ? 'ring-2 ring-indigo-500' : ''}`}
                    >
                      <Typography variant="h6" className="font-bold text-gray-800">
                        ${projection.sales.toLocaleString()}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        {date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Typography>
                      <Typography variant="small" className="text-gray-400">
                        ({getShortDayName(date)})
                      </Typography>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Buffer Section with Modern Design */}
        {renderAdminSection(
          <Card className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
            <CardHeader floated={false} shadow={false} className="rounded-none">
              <div className="flex items-center justify-between p-6">
                <div>
                  <Typography variant="h6" className="font-bold text-gray-800">
                    Buffer Information
                  </Typography>
                  <Typography variant="small" className="text-gray-600">
                    Product Buffer Status
                  </Typography>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className={`${activeBufferView === 'chicken'
                      ? 'bg-indigo-500 hover:bg-indigo-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} 
                      transition-all duration-300`}
                    onClick={() => handleToggleBufferView('chicken')}
                  >
                    Chicken
                  </Button>
                  <Button
                    size="sm"
                    className={`${activeBufferView === 'prep'
                      ? 'bg-indigo-500 hover:bg-indigo-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                      transition-all duration-300`}
                    onClick={() => handleToggleBufferView('prep')}
                  >
                    Prep
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(activeBufferView === 'chicken' ? chickenBufferData() : prepBufferData()).map((buffer) => (
                  <div key={buffer._id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-2">
                      <Typography variant="h6" className="font-semibold text-gray-800">
                        {buffer.productName}
                      </Typography>
                      {editingBuffer === buffer._id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            defaultValue={buffer.bufferPrcnt}
                            className="w-20 p-1 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleBufferUpdate(buffer._id, parseFloat(e.target.value));
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            className="bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded-lg transition-colors duration-300"
                            onClick={(e) => {
                              const input = e.target.previousSibling;
                              handleBufferUpdate(buffer._id, parseFloat(input.value));
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center ${getBufferColor(buffer.bufferPrcnt)} font-bold text-lg`}>
                            {getBufferArrow(buffer.bufferPrcnt)}
                            {buffer.bufferPrcnt}%
                          </div>
                          <IconButton
                            size="sm"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white transition-colors duration-300"
                            onClick={() => handleBufferEdit(buffer._id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      )}
                    </div>
                    <Typography variant="small" className="text-gray-500 mt-2">
                      Updated: {new Date(buffer.updatedOn).toLocaleDateString()}
                    </Typography>
                  </div>
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