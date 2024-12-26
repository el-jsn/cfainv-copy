import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Chart from "./Chart";
import LogoutButton from "./LogoutButton";
import axiosInstance from "./axiosInstance";
import { ChevronRight, BarChart2, MessageSquare, Settings, Edit2, ArrowUp, ArrowDown, TrendingUp, RefreshCw, Calendar, Inspect } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HomePage = () => {
  const [salesData, setSalesData] = useState([]);
  const [salesProjection, setSalesProjection] = useState([]);
  const [bufferData, setBufferData] = useState([]);
  const [editingBuffer, setEditingBuffer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [salesResponse, projectionResponse, bufferResponse] = await Promise.all([
          axiosInstance.get("/upt"),
          axiosInstance.get("/sales"),
          axiosInstance.get("/buffer")
        ]);

        setSalesData(salesResponse.data);

        const salesProjectionArray = Object.entries(projectionResponse.data).map(([day, data]) => ({ day, ...data }));

        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const sortedSalesProjection = salesProjectionArray.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));

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
    labels: salesProjection.map(projection => projection.day),
    datasets: [{
      label: 'Sales Projection',
      data: salesProjection.map(projection => projection.sales),
      fill: false,
      backgroundColor: 'rgb(59, 130, 246)',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.3,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            weight: 'bold'
          }
        },
      },
      title: {
        display: true,
        text: 'Weekly Sales Projection',
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: { top: 10, bottom: 20 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  const handleBufferEdit = (bufferId) => {
    setEditingBuffer(bufferId);
  };

  const handleBufferUpdate = async (bufferId, newValue) => {
    try {
      await axiosInstance.put(`/buffer/${bufferId}`, { bufferPrcnt: newValue });
      const updatedBufferData = bufferData.map(buffer =>
        buffer._id === bufferId ? { ...buffer, bufferPrcnt: newValue, updatedOn: new Date().toISOString() } : buffer
      );
      setBufferData(updatedBufferData);
      setEditingBuffer(null);
    } catch (error) {
      console.error("Error updating buffer:", error);
    }
  };

  const getBufferColor = (value) => {
    if (value > 0) return "text-emerald-600";
    if (value < 0) return "text-rose-600";
    return "text-gray-600";
  };

  const getBufferArrow = (value) => {
    if (value > 0) return <ArrowUp className="inline-block w-4 h-4 mr-1 text-emerald-500" />;
    if (value < 0) return <ArrowDown className="inline-block w-4 h-4 mr-1 text-rose-500" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center space-x-3">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <p className="text-xl text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 sm:text-5xl">
            Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            An Overview of sales, projections, and buffer management
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white shadow-xl rounded-2xl p-6 border-t-4 border-blue-500 transform transition hover:scale-[1.02]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <BarChart2 className="mr-2 text-blue-500" /> UPTs Data
              </h2>
              <Link to="/update-upt" className="text-blue-600 hover:text-blue-800 transition">
                Update <ChevronRight className="inline-block" size={16} />
              </Link>
            </div>
            <Chart data={salesData} />
          </div>
          <div className="bg-white shadow-xl rounded-2xl p-6 border-t-4 border-green-500 transform transition hover:scale-[1.02]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="mr-2 text-green-500" /> Sales Projections
              </h2>
              <Link to="/update-sales-projection" className="text-green-600 hover:text-green-800 transition">
                Update <ChevronRight className="inline-block" size={16} />
              </Link>
            </div>
            <div className="h-64">
              <Line options={chartOptions} data={chartData} />
            </div>
            <div className="mt-6">
              <div className="grid grid-cols-3 gap-4">
                {salesProjection.length > 0 ? (
                  salesProjection.map((projection) => (
                    <div key={projection._id} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-sm font-medium text-gray-600">{projection.day}</p>
                      <p className="text-lg font-bold text-blue-600">${projection.sales}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic col-span-3 text-center">No sales projections available</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-xl rounded-2xl p-6 border-t-4 border-indigo-500 mb-12 transform transition hover:scale-[1.01]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Buffer Information</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bufferData.map((buffer) => (
              <div key={buffer._id} className="bg-gray-50 rounded-lg p-3 shadow-sm">
                <p className="text-sm font-medium text-gray-600 truncate">{buffer.productName}</p>
                {editingBuffer === buffer._id ? (
                  <input
                    type="number"
                    defaultValue={buffer.bufferPrcnt}
                    onBlur={(e) => handleBufferUpdate(buffer._id, parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className={`text-lg font-bold ${getBufferColor(buffer.bufferPrcnt)} flex items-center`}>
                    {getBufferArrow(buffer.bufferPrcnt)}
                    {buffer.bufferPrcnt}%
                    <button onClick={() => handleBufferEdit(buffer._id)} className="ml-2 text-gray-400 hover:text-gray-600 transition">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link to="/thawing-cabinet" className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition transform hover:scale-[1.03]">
            <div>
              <h3 className="text-xl font-semibold">Thawing Cabinet</h3>
              <p className="mt-1 text-purple-200 text-sm">Manage cabinet allocations</p>
            </div>
            <ChevronRight className="h-6 w-6" />
          </Link>
          <Link to="/data/message/all" className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition transform hover:scale-[1.03]">
            <div>
              <h3 className="text-xl font-semibold">Adjust Allocations</h3>
              <p className="mt-1 text-indigo-200 text-sm">Manually modify allocations for extra certainty</p>
            </div>
            <MessageSquare className="h-6 w-6" />
          </Link>
          <Link to="/instructions" className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition transform hover:scale-[1.03]">
            <div>
              <h3 className="text-xl font-semibold">Allocation Instructions</h3>
              <p className="mt-1 text-green-200 text-sm">Manually add allocations instructions for stocking chicken</p>
            </div>
            <Inspect className="h-6 w-6" />
          </Link>
          <Link to="/closure/plans" className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition transform hover:scale-[1.03]">
            <div>
              <h3 className="text-xl font-semibold">Store Closures</h3>
              <p className="mt-1 text-red-200 text-sm">View and manage planned store closures</p>
            </div>
            <Calendar className="h-6 w-6" />
          </Link>
        </div>
        <div className="flex justify-end">
          <LogoutButton className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
