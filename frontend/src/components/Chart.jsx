// Optimized EnhancedChart.js
import React, { useState, useMemo, useRef } from "react";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Scatter,
  getElementsAtEvent,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  ScatterController,
} from "chart.js";
import { RefreshCw } from "lucide-react";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  ScatterController
);

const CHART_TYPES = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut,
  scatter: Scatter,
};

const EnhancedChart = ({
  data,
  title = "Data Visualization",
  subtitle = "Interactive Insights",
  yAxisLabel = "Value",
  primaryColor = "rgba(59, 130, 246, 0.8)",
  gridColor = "rgba(229, 231, 235, 0.5)",
  defaultChartType = "bar",
  showDataTable = false,
  enableInteractions = true,
  pointRadius = 3,
  loading = false,
  isCompact = false, // Keep the prop for context-specific usage
  height = 400, // Add a height prop for direct control
}) => {
  const [chartType, setChartType] = useState(defaultChartType);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [clickedDataPoint, setClickedDataPoint] = useState(null);
  const chartRef = useRef(null);

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const chartData = useMemo(() => {
    if (!sortedData || sortedData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = sortedData.map((item) => item.productName);

    const datasets = [
      {
        label: yAxisLabel,
        data: sortedData.map((item) => item.utp),
        backgroundColor: primaryColor,
        borderColor: primaryColor.replace("0.8", "1"),
        borderWidth: 2,
        ...(chartType === "scatter" && { pointRadius }),
        tension: 0.4,
      },
    ];

    return { labels, datasets };
  }, [sortedData, primaryColor, yAxisLabel, chartType, pointRadius]);

  const options = useMemo(() => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: title,
          font: { size: isCompact ? 14 : 16, weight: "bold" },
        },
      },
      scales: {
        x: {
          grid: { color: gridColor, display: false },
          ...(isCompact && {
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              maxTicksLimit: 7,
            },
          }),
        },
        y: {
          title: {
            display: true,
            text: yAxisLabel,
            font: { weight: "bold", size: isCompact ? 12 : 14 },
          },
          grid: { color: gridColor },
          beginAtZero: true,
          ...(isCompact && {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 5,
            },
          }),
        },
      },
    };

    const interactionOptions = enableInteractions
      ? {
        interaction: { mode: "index", intersect: false },
        plugins: {
          tooltip: {
            backgroundColor: "#fff",
            bodyColor: "#000",
            titleColor: "#000",
            boxShadow: "0 0 5px rgba(0,0,0,0.15)",
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.formattedValue}`,
            },
          },
        },
      }
      : {};

    const chartSpecificOptions =
      chartType === "scatter"
        ? {
          scales: {
            x: { type: "category" },
            y: { beginAtZero: true },
          },
        }
        : {};

    return { ...baseOptions, ...interactionOptions, ...chartSpecificOptions };
  }, [title, yAxisLabel, gridColor, enableInteractions, chartType, isCompact]);

  const handleSort = (column) => {
    setSortColumn(column);
    setSortDirection(
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc"
    );
  };

  const handleChartClick = (event) => {
    if (!enableInteractions || !chartRef.current) return;

    const clickedElements = getElementsAtEvent(chartRef.current.chart, event);

    if (clickedElements.length > 0) {
      const index = clickedElements[0].index;
      setClickedDataPoint(sortedData[index]);
    } else {
      setClickedDataPoint(null);
    }
  };

  const ChartComponent = CHART_TYPES[chartType];

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        {!isCompact && (
          <div className="text-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-start gap-2 mb-4">
          <select
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:max-w-xs border-gray-300 rounded-md text-sm"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            {Object.keys(CHART_TYPES).map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Chart
              </option>
            ))}
          </select>
        </div>

        <div style={{ height: height }} className="relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-600">
                <RefreshCw className="animate-spin" size={20} />
                <span>Loading data...</span>
              </div>
            </div>
          ) : ChartComponent ? (
            <ChartComponent
              ref={chartRef}
              data={chartData}
              options={options}
              onClick={enableInteractions ? handleChartClick : undefined}
            />
          ) : (
            <p className="text-gray-500 italic text-sm">
              Chart type not available.
            </p>
          )}
        </div>

        {enableInteractions && clickedDataPoint && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-900">
              Details for {clickedDataPoint.productName}
            </h4>
            <dl className="mt-2 border-t border-gray-200 divide-y divide-gray-200">
              {Object.entries(clickedDataPoint)
                .filter(
                  ([key, value]) =>
                    key !== "productName" && key !== "__v" && key !== "_id"
                )
                .map(([key, value]) => (
                  <div key={key} className="py-1 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      {key}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {typeof value === "number" ? value.toFixed(2) : value}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        )}

        {showDataTable && sortedData.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <h4 className="text-md font-medium text-gray-900 mb-2">Data</h4>
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(sortedData[0]).map((key) => (
                      <th
                        key={key}
                        scope="col"
                        className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort(key)}
                      >
                        {key}
                        {sortColumn === key && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedData.map((item) => (
                    <tr key={item.productName}>
                      {Object.entries(item).map(([key, value]) => (
                        <td
                          key={key}
                          className="px-3 py-2 whitespace-nowrap text-xs text-gray-500"
                        >
                          {typeof value === "number"
                            ? value.toFixed(2)
                            : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedChart;