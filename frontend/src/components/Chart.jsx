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

import { styled } from '@mui/material/styles';
import { Box, Select, MenuItem, FormControl, InputLabel, Typography, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

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

const StyledSelect = styled(Select)(({ theme }) => ({
  fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[400], // Subtle border color
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[500], // Slightly darker on hover
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main, // Highlight on focus
    borderWidth: 1,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  overflowX: 'auto',
  fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif'
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif'
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.2, 1.5),
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif',
  whiteSpace: 'nowrap'
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif',
}));



const EnhancedChart = ({
  data,
  title = "Data Visualization",
  subtitle = "Interactive Insights",
  yAxisLabel = "Value",
  primaryColor = "#4A90E2", // A muted blue
  gridColor = "rgba(229, 231, 235, 0.5)",
  defaultChartType = "bar",
  showDataTable = false,
  enableInteractions = true,
  pointRadius = 3,
  loading = false,
  isCompact = false,
  height = 400,
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
        legend: { position: "top", labels: { fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif' } },
        title: {
          display: true,
          text: title,
          font: { size: isCompact ? 14 : 16, weight: "bold", fontFamily: 'SF Pro Display, Helvetica Neue, sans-serif' },

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
              font: { size: 12, fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif' }
            },
          }),
        },
        y: {
          title: {
            display: true,
            text: yAxisLabel,
            font: { weight: "bold", size: isCompact ? 12 : 14, fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif' },
          },
          grid: { color: gridColor },
          beginAtZero: true,
          ...(isCompact && {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 5,
              font: { size: 12, fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif' }
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
            titleFont: { fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif' },
            bodyFont: { fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif' },
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
    <Paper elevation={2} className="rounded-lg overflow-hidden">
      <Box p={3}>
        {!isCompact && (
          <Box textAlign="center" mb={2}>
            <StyledTypography variant="h6" component="h3" fontWeight="medium" color="textPrimary" mb={0.5}>
              {title}
            </StyledTypography>
            <StyledTypography variant="body2" color="textSecondary">
              {subtitle}
            </StyledTypography>
          </Box>
        )}

        <Box display="flex" flexWrap="wrap" justifyContent="flex-start" gap={1} mb={2}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="chart-type-label"
              sx={{
                fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif',
              }}
            >Chart Type</InputLabel>
            <StyledSelect
              labelId="chart-type-label"
              id="chart-type-select"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              label="Chart Type"
            >
              {Object.keys(CHART_TYPES).map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>
        </Box>

        <Box position="relative" style={{ height: height }}>
          {loading ? (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                <RefreshCw className="animate-spin" size={20} />
                <StyledTypography variant="body2">Loading data...</StyledTypography>
              </Box>
            </Box>
          ) : ChartComponent ? (
            <ChartComponent
              ref={chartRef}
              data={chartData}
              options={options}
              onClick={enableInteractions ? handleChartClick : undefined}
            />
          ) : (
            <StyledTypography variant="body2" color="textSecondary" fontStyle="italic">
              Chart type not available.
            </StyledTypography>
          )}
        </Box>

        {enableInteractions && clickedDataPoint && (
          <Box mt={3}>
            <StyledTypography variant="h6" fontWeight="medium" color="textPrimary" mb={1}>
              Details for {clickedDataPoint.productName}
            </StyledTypography>
            <Box mt={1} borderTop="1px solid #e0e0e0" >
              <Divider sx={{ my: 0.5 }} />
              {Object.entries(clickedDataPoint)
                .filter(
                  ([key, value]) =>
                    key !== "productName" && key !== "__v" && key !== "_id"
                )
                .map(([key, value]) => (
                  <Box key={key} display="grid" gridTemplateColumns="1fr 2fr" gap={1} py={0.5}>
                    <StyledTypography variant="body2" color="textSecondary">
                      {key}
                    </StyledTypography>
                    <StyledTypography variant="body2" color="textPrimary">
                      {typeof value === "number" ? value.toFixed(2) : value}
                    </StyledTypography>
                  </Box>
                ))}
            </Box>
          </Box>
        )}

        {showDataTable && sortedData.length > 0 && (
          <Box mt={3}>
            <StyledTypography variant="h6" fontWeight="medium" color="textPrimary" mb={1}>Data</StyledTypography>
            <StyledTableContainer>
              <StyledTable size="small">
                <StyledTableHead>
                  <TableRow>
                    {Object.keys(sortedData[0]).map((key) => (
                      <StyledTableCell
                        key={key}
                        onClick={() => handleSort(key)}
                        sx={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        <Box display="flex" alignItems="center">
                          {key}
                          {sortColumn === key && (
                            <Box ml={0.5}>
                              {sortDirection === "asc" ? "▲" : "▼"}
                            </Box>
                          )}
                        </Box>
                      </StyledTableCell>
                    ))}
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {sortedData.map((item) => (
                    <TableRow key={item.productName}>
                      {Object.entries(item).map(([key, value]) => (
                        <StyledTableCell key={key}>
                          {typeof value === "number"
                            ? value.toFixed(2)
                            : value}
                        </StyledTableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </StyledTable>
            </StyledTableContainer>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default EnhancedChart;