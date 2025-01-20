import React, { useState, useMemo, useRef } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";
import { RefreshCw } from "lucide-react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  overflowX: "auto",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontFamily: "SF Pro Text, Helvetica Neue, sans-serif",
}));

// Function to generate a random hex color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const EnhancedChart = ({
  data,
  title = "Data Visualization",
  subtitle = "Interactive Insights",
  yAxisLabel = "UTP",
  primaryColor = "#6366F1",
  gridColor = "rgba(229, 231, 235, 0.5)",
  loading = false,
  height = 400,
}) => {
  const [view, setView] = useState("table");
  const [category, setCategory] = useState("chicken"); // Default category is Chicken
  const chartRef = useRef(null);

  // Categorize data into Chicken, Drinks, and Prep
  const categorizedData = useMemo(() => {
    if (!data) return { chicken: [], drinks: [], prep: [] };

    const chicken = [
      "Spicy Filets",
      "Grilled Filets",
      "Grilled Nuggets",
      "Nuggets",
      "Filets",
      "Spicy Strips",
    ];

    const drinks = ["Sunjoy Lemonade", "Diet Lemonade", "Lemonade"];

    const categorized = {
      chicken: [],
      drinks: [],
      prep: [],
    };

    data.forEach((item) => {
      if (chicken.includes(item.productName)) {
        categorized.chicken.push(item);
      } else if (drinks.includes(item.productName)) {
        categorized.drinks.push(item);
      } else {
        categorized.prep.push(item);
      }
    });

    return categorized;
  }, [data]);

  // Prepare data for chart and table based on the selected category
  const selectedData = useMemo(() => {
    return categorizedData[category] || [];
  }, [categorizedData, category]);


  const chartData = useMemo(() => {
    if (selectedData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = selectedData.map((item) => item.productName);
    let datasets;

    if (view === 'pie') {
      // Generate random colors for pie chart
      const backgroundColor = selectedData.map(() => getRandomColor());

      datasets = [{
        label: yAxisLabel,
        data: selectedData.map((item) => item.utp),
        backgroundColor: backgroundColor,
        borderColor: backgroundColor.map(color => color.replace("0.8", "1")),
        borderWidth: 2,
      }];
    } else {
      // Default line chart settings
      datasets = [{
        label: yAxisLabel,
        data: selectedData.map((item) => item.utp),
        backgroundColor: primaryColor,
        borderColor: primaryColor.replace("0.8", "1"),
        borderWidth: 2,
        tension: 0.4,
      }]
    }

    return { labels, datasets };
  }, [selectedData, primaryColor, yAxisLabel, view]);


  // Chart options
  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: view === 'pie' }, // Show legend only for pie chart
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: "bold" },
        },
      },
      scales: {
        x: {
          grid: { color: gridColor, display: view !== 'pie' }, // Hide grid for pie chart
        },
        y: {
          display: view !== 'pie',
          title: {
            display: view !== 'pie',
            text: yAxisLabel,
          },
          grid: { color: gridColor },
          beginAtZero: true,
        },
      },
    };
  }, [title, yAxisLabel, gridColor, view]);

  return (
    <Paper elevation={2} className="rounded-lg overflow-hidden">
      <Box p={3}>
        <Box textAlign="center" mb={2}>
          <StyledTypography variant="h6" fontWeight="medium">
            {title}
          </StyledTypography>
          <StyledTypography variant="body2" color="textSecondary">
            {subtitle}
          </StyledTypography>
        </Box>

        {/* Dropdown for categories */}
        <Box display="flex" justifyContent="center" mb={2}>
          <FormControl variant="outlined" size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="chicken">Chicken</MenuItem>
              <MenuItem value="drinks">Drinks</MenuItem>
              <MenuItem value="prep">Prep</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Toggle for table or chart view */}
        <Box display="flex" justifyContent="center" gap={1} mb={2}>
          <Button
            onClick={() => setView("table")}
            variant={view === "table" ? "contained" : "outlined"}
          >
            Table
          </Button>
          <Button
            onClick={() => setView("pie")}
            variant={view === "pie" ? "contained" : "outlined"}
          >
            Pie
          </Button>
          <Button
            onClick={() => setView("line")}
            variant={view === "line" ? "contained" : "outlined"}
          >
            Line
          </Button>
        </Box>

        {/* Main Content */}
        <Box style={{ height }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <RefreshCw className="animate-spin" />
              <StyledTypography>Loading...</StyledTypography>
            </Box>
          ) : view === "table" ? (
            <StyledTableContainer>
              <Table>
                <TableBody>
                  {selectedData.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.utp.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          ) : view === "pie" ? (
            <Pie ref={chartRef} data={chartData} options={options} />
          ) : (
            <Line ref={chartRef} data={chartData} options={options} />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default EnhancedChart;