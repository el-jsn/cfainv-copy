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
  Tooltip as MTTooltip, // To avoid naming conflicts with Chart.js tooltip
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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation Bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <LayoutDashboard className="mr-2 text-gray-700" size={20} />
            <Typography variant="h5" color="gray" className="font-semibold">
              {user?.isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </Typography>
          </div>
          <div className="flex items-center space-x-4">
            {user?.isAdmin ? (
              <Typography variant="small" className="bg-indigo-100 text-indigo-700 rounded-full px-2 py-1 font-medium">
                Admin
              </Typography>
            ) : (
              <Typography variant="small" className="bg-gray-100 text-gray-700 rounded-full px-2 py-1 font-medium">
                User
              </Typography>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* Section for UPTs and Sales Projections */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* UPTs Data Card (Hidden for non-admins) */}
            {user?.isAdmin && (
              <Card className="bg-white shadow rounded">
                <CardHeader floated={false} shadow={false} className="px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <Typography variant="h6" color="gray" className="font-semibold">
                      UPTs by Product
                    </Typography>
                    <Link to="/update-upt">
                      <Button size="sm" color="indigo" className="flex items-center gap-2 rounded">
                        Update
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <Chart data={salesData} isCompact={true} height={300} chartColor="#434343" />
                </CardBody>
              </Card>
            )}

            {/* Sales Projections Card */}
            <Card className="bg-white shadow rounded md:col-span-2 lg:col-span-2">
              <CardHeader floated={false} shadow={false} className="px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <Typography variant="h6" color="gray" className="font-semibold">
                    Weekly Sales Projections
                  </Typography>
                  {renderAdminSection(
                    <Link to="/update-sales-projection">
                      <Button size="sm" color="indigo" className="flex items-center gap-2 rounded">
                        Update
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardBody className="p-4">
                <div style={{ height: 300 }}>
                  <Line options={chartOptions} data={chartData} />
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {salesProjection.length > 0 ? (
                    salesProjection.map((projection) => (
                      <div key={projection._id} className="bg-gray-100 rounded-md p-3 text-center">
                        <Typography variant="small" color="gray" className="font-medium">
                          {projection.day}
                        </Typography>
                        <Typography variant="h6" color="gray" className="font-semibold">
                          ${projection.sales}
                        </Typography>
                      </div>
                    ))
                  ) : (
                    <Typography variant="small" color="gray" className="italic col-span-3 text-center">
                      No sales projections available
                    </Typography>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Buffer Information */}
        {renderAdminSection(
          <section className="mb-8">
            <Card className="bg-white shadow rounded">
              <CardHeader floated={false} shadow={false} className="px-4 py-3 border-b border-gray-200">
                <Typography variant="h6" color="gray" className="font-semibold">
                  Buffer Information
                </Typography>
              </CardHeader>
              <CardBody className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bufferData.map((buffer) => (
                    <Card key={buffer._id} className="p-3 bg-gray-50 rounded">
                      <Typography variant="small" color="gray" className="font-medium truncate">
                        {buffer.productName}
                      </Typography>
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
                        <Typography variant="h6" className={`flex items-center ${getBufferColor(buffer.bufferPrcnt)} font-semibold`}>
                          {getBufferArrow(buffer.bufferPrcnt)}
                          {buffer.bufferPrcnt}%
                          <MTTooltip content="Edit Buffer">
                            <IconButton size="sm" color="gray" onClick={() => handleBufferEdit(buffer._id)} className="ml-2">
                              <Edit2 className="h-4 w-4" />
                            </IconButton>
                          </MTTooltip>
                        </Typography>
                      )}
                      <Typography variant="small" color="gray" className="mt-1">
                        Updated: {new Date(buffer.updatedOn).toLocaleDateString()}
                      </Typography>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>
          </section>
        )}

        {/* Quick Actions */}
        <section className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/thawing-cabinet">
              <Card className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md rounded">
                <div>
                  <Typography variant="h6" color="white" className="font-semibold">
                    Thawing Cabinet
                  </Typography>
                  <Typography variant="small" color="indigo-100">
                    View allocations
                  </Typography>
                </div>
                <ShoppingBag className="h-5 w-5" />
              </Card>
            </Link>
            {renderAdminSection(
              <Link to="/data/message/all">
                <Card className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md rounded">
                  <div>
                    <Typography variant="h6" color="white" className="font-semibold">
                      Adjust Allocations
                    </Typography>
                    <Typography variant="small" color="indigo-100">
                      Manual adjustments
                    </Typography>
                  </div>
                  <MessageSquare className="h-5 w-5" />
                </Card>
              </Link>
            )}
            {renderAdminSection(
              <Link to="/instructions">
                <Card className="bg-green-500 hover:bg-green-600 text-white p-4 flex items-center justify-between shadow-md rounded">
                  <div>
                    <Typography variant="h6" color="white" className="font-semibold">
                      Allocation Instructions
                    </Typography>
                    <Typography variant="small" color="green-100">
                      Stocking guidance
                    </Typography>
                  </div>
                  <Inspect className="h-5 w-5" />
                </Card>
              </Link>
            )}
            {renderAdminSection(
              <Link to="/closure/plans">
                <Card className="bg-red-500 hover:bg-red-600 text-white p-4 flex items-center justify-between shadow-md rounded">
                  <div>
                    <Typography variant="h6" color="white" className="font-semibold">
                      Store Closures
                    </Typography>
                    <Typography variant="small" color="red-100">
                      Manage closures
                    </Typography>
                  </div>
                  <Calendar className="h-5 w-5" />
                </Card>
              </Link>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;