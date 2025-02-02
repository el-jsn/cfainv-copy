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

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [salesResponse, projectionResponse, bufferResponse] =
          await Promise.all([
            axiosInstance.get("/upt"),
            axiosInstance.get("/sales"),
            axiosInstance.get("/buffer"),
          ]);

        setSalesData(salesResponse.data);

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
          "Sunday",
        ];
        const sortedSalesProjection = salesProjectionArray.sort(
          (a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day)
        );

        setSalesProjection(sortedSalesProjection);
        setBufferData(bufferResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: salesProjection.map((projection) => projection.day),
    datasets: [
      {
        label: "Sales Projection",
        data: salesProjection.map((projection) => projection.sales),
        fill: false,
        backgroundColor: "#434343", // Muted blueish-gray
        borderColor: "#6366F1", // Keep this as it's good contrast color
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: 'SF Pro Display, Helvetica',
            weight: "bold",
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Weekly Sales Projection",
        font: {
          size: 18,
          weight: "bold",
          family: 'SF Pro Display, Helvetica',
        },
        padding: { top: 10, bottom: 10 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#E5E7EB",
        },
        ticks: {
          font: {
            family: 'SF Pro Display, Helvetica',
            size: 12,
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'SF Pro Display, Helvetica',
            size: 12,
          }
        }
      },
    },
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

  // Calculate weekly total excluding Sunday
  const weeklyTotal = filteredSalesProjection.reduce(
    (acc, curr) => acc + curr.sales,
    0
  );

  // Calculate daily average excluding Sunday
  const dailyAverage = weeklyTotal / filteredSalesProjection.length;

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
                        ${filteredSalesProjection[0]?.sales.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        {filteredSalesProjection[0]?.day || ""}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* UPTs Chart */}
          {renderAdminSection(
            <Card className="lg:col-span-1 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
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
          <Card className="lg:col-span-2 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
            <CardHeader floated={false} shadow={false} className="rounded-none">
              <div className="flex items-center justify-between p-6">
                <div>
                  <Typography variant="h6" color="blue-gray" className="font-bold">
                    Weekly Sales Projections
                  </Typography>
                  <Typography variant="small" className="text-gray-600">
                    7-Day Forecast
                  </Typography>
                </div>
                {renderAdminSection(
                  <Link to="/update-sales-projection">
                    <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                      Update
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardBody className="px-6 pt-0">
              <div className="h-[300px]">
                <Line options={chartOptions} data={chartData} />
              </div>
              <div className="grid grid-cols-7 gap-4 mt-6">
                {filteredSalesProjection.map((projection) => (
                  <div key={projection._id}
                    className="bg-gray-50 rounded-lg p-3 text-center transform transition-transform hover:scale-105">
                    <Typography variant="small" className="text-gray-600">
                      {projection.day.slice(0, 3)}
                    </Typography>
                    <Typography variant="h6" className="font-bold text-gray-800">
                      ${projection.sales}
                    </Typography>
                  </div>
                ))}
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