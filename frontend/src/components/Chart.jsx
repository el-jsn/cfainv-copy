import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Chart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.productName),
    datasets: [
      {
        label: "Units Per $1000",
        data: data.map(item => item.utp),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Units Per Thousand Dollars (UPT) by Product',
      },
    },
  };

  return (
    <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-200 min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Heading Section */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Sales Performance Analysis
          </h2>
          <p className="text-xl text-gray-600">
            Visualizing Units Per Thousand Dollars (UPT) across our product range
          </p>
        </div>

        {/* Chart Section */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">UPT Chart</h2>
            <div className="w-full h-96">
              <Bar data={chartData} options={options} />
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Data Table</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      UPT
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.utp && !isNaN(item.utp) ? item.utp.toFixed(2) : 'N/A'}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chart;