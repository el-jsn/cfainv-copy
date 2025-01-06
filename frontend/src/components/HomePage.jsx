// Optimized HomePage.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Chart from "./Chart"; // Assuming this is your EnhancedChart
import LogoutButton from "./LogoutButton";
import axiosInstance from "./axiosInstance";
import {
  ChevronRight,
  BarChart2,
  MessageSquare,
  Settings,
  Edit2,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  RefreshCw,
  Calendar,
  Inspect,
  LayoutDashboard,
  ShoppingBag,
  // Removed Bell and User imports
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
import { useAuth } from "./AuthContext";

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
        backgroundColor: "#3B82F6",
        borderColor: "#60A5FA",
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
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Weekly Sales Projection",
        font: {
          size: 16,
          weight: "bold",
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
      },
      x: {
        grid: {
          display: false,
        },
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
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-gray-500";
  };

  const getBufferArrow = (value) => {
    if (value > 0) return <ArrowUp className="inline-block w-4 h-4 mr-1" />;
    if (value < 0) return <ArrowDown className="inline-block w-4 h-4 mr-1" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const renderAdminSection = (children) => {
    return user && user.isAdmin ? children : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <LayoutDashboard className="mr-2 text-indigo-600" />
            <h1 className="text-lg font-semibold text-gray-800">
              {user?.isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Display user role instead of icons */}
            {user?.isAdmin ? (
              <span className="text-sm font-medium text-gray-700">Admin</span>
            ) : (
              <span className="text-sm font-medium text-gray-700">User</span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* UPTs Data Card */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  UPTs by Product
                </h3>
                {renderAdminSection(
                  <Link
                    to="/update-upt"
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Update <ChevronRight className="inline-block w-4 h-4" />
                  </Link>
                )}
              </div>
              <Chart data={salesData} isCompact={true} height={300} />
            </div>
          </div>

          {/* Sales Projections Card */}
          <div className="bg-white shadow rounded-lg md:col-span-2 lg:col-span-2">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Weekly Sales Projections
                </h3>
                {renderAdminSection(
                  <Link
                    to="/update-sales-projection"
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Update <ChevronRight className="inline-block w-4 h-4" />
                  </Link>
                )}
              </div>
              <div style={{ height: 300 }}>
                <Line options={chartOptions} data={chartData} />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {salesProjection.length > 0 ? (
                  salesProjection.map((projection) => (
                    <div
                      key={projection._id}
                      className="bg-gray-50 rounded-md p-3 text-center"
                    >
                      <dt className="text-sm font-medium text-gray-500">
                        {projection.day}
                      </dt>
                      <dd className="text-lg font-semibold text-indigo-600">
                        ${projection.sales}
                      </dd>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm col-span-3 text-center">
                    No sales projections available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Buffer Information */}
        {renderAdminSection(
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Buffer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bufferData.map((buffer) => (
                  <div
                    key={buffer._id}
                    className="bg-gray-50 rounded-md p-3 shadow-sm"
                  >
                    <p className="text-sm font-medium text-gray-600 truncate">
                      {buffer.productName}
                    </p>
                    {editingBuffer === buffer._id ? (
                      <input
                        type="number"
                        defaultValue={buffer.bufferPrcnt}
                        onBlur={(e) =>
                          handleBufferUpdate(
                            buffer._id,
                            parseFloat(e.target.value)
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p
                        className={`text-lg font-bold ${getBufferColor(
                          buffer.bufferPrcnt
                        )} flex items-center`}
                      >
                        {getBufferArrow(buffer.bufferPrcnt)}
                        {buffer.bufferPrcnt}%
                        <button
                          onClick={() => handleBufferEdit(buffer._id)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 size={16} />
                        </button>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Updated: {new Date(buffer.updatedOn).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/thawing-cabinet"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex items-center justify-between shadow"
          >
            <div>
              <h3 className="font-semibold">Thawing Cabinet</h3>
              <p className="text-sm text-blue-100">View allocations</p>
            </div>
            <ShoppingBag className="h-5 w-5" />
          </Link>

          {renderAdminSection(
            <Link
              to="/data/message/all"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 flex items-center justify-between shadow"
            >
              <div>
                <h3 className="font-semibold">Adjust Allocations</h3>
                <p className="text-sm text-indigo-100">Manual adjustments</p>
              </div>
              <MessageSquare className="h-5 w-5" />
            </Link>
          )}
          {renderAdminSection(
            <Link
              to="/instructions"
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 flex items-center justify-between shadow"
            >
              <div>
                <h3 className="font-semibold">Allocation Instructions</h3>
                <p className="text-sm text-green-100">Stocking guidance</p>
              </div>
              <Inspect className="h-5 w-5" />
            </Link>
          )}
          {renderAdminSection(
            <Link
              to="/closure/plans"
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-4 flex items-center justify-between shadow"
            >
              <div>
                <h3 className="font-semibold">Store Closures</h3>
                <p className="text-sm text-red-100">Manage closures</p>
              </div>
              <Calendar className="h-5 w-5" />
            </Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;