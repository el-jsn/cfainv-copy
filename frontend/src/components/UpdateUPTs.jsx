import React, { useState, useCallback, useMemo } from "react";
import * as xlsx from "xlsx";
import axiosInstance from "./axiosInstance";
import {
  Grid,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  TextField,
  InputAdornment,
  Snackbar
} from "@mui/material";
import {
  CloudUpload,
  Close,
  ExpandMore,
  CheckCircleOutline,
  Warning,
  ErrorOutline,
  Lightbulb,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';


// Theming and Consistent Styling (Modern Theme)
const primaryColor = "#1976d2"; // Modern blue
const secondaryColor = "#f50057"; // Vibrant pink
const successColor = "#2e7d32"; // Forest green
const warningColor = "#ed6c02"; // Warm orange
const errorColor = "#d32f2f"; // Deep red
const textColorPrimary = "#1a2027"; // Near black
const textColorSecondary = "#637381"; // Slate gray
const backgroundColor = "#ffffff"; // Pure white
const tableRowEvenColor = "#f9fafb"; // Very light gray for even rows
const cardBackgroundColor = "#ffffff"; // White for cards
const borderColor = "#e0e0e0"; // Light gray for borders

// Styled File Input (Keep this)
const Input = styled("input")({
  clip: "rect(0, 0, 0, 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// Styled Card Header (Modern Theme)
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: cardBackgroundColor,
  color: textColorPrimary,
  padding: theme.spacing(3),
  '& .MuiCardHeader-title': {
    fontSize: '1.25rem',
    fontWeight: 600,
    letterSpacing: '-0.025em',
  },
  borderBottom: `1px solid ${borderColor}`,
}));

// Modern Table Styling
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: textColorPrimary,
  borderBottom: `1px solid ${borderColor}`,
  padding: theme.spacing(2),
  fontSize: '0.875rem',
}));

// Modern Table Row
const StyledTableRow = styled(TableRow)(({ theme, iseven }) => ({
  backgroundColor: iseven ? tableRowEvenColor : 'inherit',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    transition: 'background-color 0.2s ease',
  },
}));

// Modern Card Styling
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
  border: `1px solid ${borderColor}`,
  overflow: 'hidden',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
  },
}));

// Modern Button Styling
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 20px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const ITEM_CATEGORIES = {
  Filets: [
    "CAN Sandwich - CFA Dlx w/ Proc Ched",
    "CAN Sandwich - CFA Dlx w/ Ched",
    "CAN Sandwich - CFA Dlx w/ Jack",
    "Sandwich - CFA",
    "Sandwich - CFA Dlx No Cheese",
    "Salad - Signature Cobb w/ CFA Filet",
    "Salad - Spicy SW w/ CFA Filet",
  ],
  "Spicy Filets": [
    "CAN Sandwich - Spicy Dlx w/ Proc Ched",
    "CAN Sandwich - Spicy Dlx w/ Ched",
    "CAN Sandwich - Spicy Dlx w/ Jack",
    "Sandwich - Spicy Chicken",
    "Sandwich - Spicy Dlx No Cheese",
    "Salad - Signature Cobb w/ Spicy Filet",
    "Salad - Spicy SW w/ Spicy Filet",
    "Filet - Spicy Chicken",
  ],
  "Grilled Filets": [
    "CAN Sandwich - Grilled Club w/ Cheddar",
    "CAN Sandwich - Grilled Club w/ Jack",
    "CAN Sandwich - Grilled Club w/ Proc Ched",
    "Sandwich - Grilled",
    "Sandwich - Grilled Club w/No Cheese",
    "Salad - Signature Cobb w/ Hot Grilled Filet",
    "Salad - Spicy SW w/ Hot Grld Filet",
    "Test - Salad - Signature Cobb w/Spicy",
    "Filet - Grilled",
  ],
  "Grilled Nuggets": {
    "Nuggets Grilled, 12 Count": 12,
    "Nuggets Grilled, 8 Count": 8,
    "Nuggets Grilled, 5 Count": 5,
    "Salad - Spicy SW w/ Grld Nuggets": 8,
    "Salad – Signature Cobb w/ Grilled Nuggets": 8,
  },
  Nuggets: {
    "Nuggets, 12 Count": 12,
    "Nuggets, 8 Count": 8,
    "Nuggets, 30 Count": 30,
    "Nuggets, 5 Count": 5,
    "Salad - Signature Cobb w/ Nuggets": 8,
    "Salad - Spicy SW w/ Nuggets": 8,
  },
  "Spicy Strips": {
    "CAN - Salad - Extra Spicy Strips": 1,
    "Test - Spicy Strips, 3 Count": 3,
    "Test - Spicy Strips, 4 Count": 4,
  },
};

const PREP_ITEM_CATEGORIES = {
  "Lettuce": [
    "CAN Sandwich - Grilled Club w/ Cheddar",
    "CAN Sandwich - Grilled Club w/ Jack",
    "CAN Sandwich - Grilled Club w/ Proc Ched",
    "Sandwich - Grilled Club w/No Cheese",
    "Lettuce",
    "Lettuce Wrap Condiment",
    "CAN Sandwich - CFA Dlx w/ Ched",
    "CAN Sandwich - CFA Dlx w/ Jack",
    "CAN Sandwich - CFA Dlx w/ Proc Ched",
    "CAN Sandwich - Grilled Club w/ Cheddar",
    "CAN Sandwich - Grilled Club w/ Jack",
    "CAN Sandwich - Grilled Club w/ Proc Ched",
    "CAN Sandwich - Spicy Dlx w/ Ched",
    "CAN Sandwich - Spicy Dlx w/ Jack",
    "CAN Sandwich - Spicy Dlx w/ Proc Ched",
    "Sandwich - CFA Dlx No Cheese",
    "Sandwich - Spicy Dlx No Cheese"
  ],
  "Cobb Salad": [
    "Salad - Signature Cobb w/ CFA Filet",
    "Salad - Signature Cobb w/ Hot Grilled Filet",
    "Salad - Signature Cobb w/ Nuggets",
    "Salad - Signature Cobb w/ Spicy Filet",
    "Salad - Signature Cobb w/Spicy Grilled Fil",
    "Salad – Signature Cobb w/ Grilled Nuggets",
    "Salad Base - Signature Cobb",
    "Test - Salad - Signature Cobb w/Spicy"
  ],
  "Southwest Salad": [
    "Salad - Spicy SW Base",
    "Salad - Spicy SW w/ CFA Filet",
    "Salad - Spicy SW w/ Grld Nuggets",
    "Salad - Spicy SW w/ Hot Grld Filet",
    "Salad - Spicy SW w/ Nuggets",
    "Salad - Spicy SW w/ Spicy Filet",
    "Salad - Spicy SW w/ Spicy Grld Filet",
    "Test - Salad - Spicy SW w/Spcy Strips",
  ],
  "Tomato": [
    "CAN Sandwich - Grilled Club w/ Cheddar",
    "CAN Sandwich - Grilled Club w/ Jack",
    "CAN Sandwich - Grilled Club w/ Proc Ched",
    "Sandwich - Grilled Club w/No Cheese",
    "Tomato",
    "CAN Sandwich - CFA Dlx w/ Ched",
    "CAN Sandwich - CFA Dlx w/ Jack",
    "CAN Sandwich - CFA Dlx w/ Proc Ched",
    "CAN Sandwich - Grilled Club w/ Cheddar",
    "CAN Sandwich - Grilled Club w/ Jack",
    "CAN Sandwich - Grilled Club w/ Proc Ched",
    "CAN Sandwich - Spicy Dlx w/ Ched",
    "CAN Sandwich - Spicy Dlx w/ Jack",
    "CAN Sandwich - Spicy Dlx w/ Proc Ched",
    "Sandwich - CFA Dlx No Cheese",
    "Sandwich - Spicy Dlx No Cheese"
  ],
  // Romaine portions in grams
  "Romaine": {
    "CAN - Salad - Extra Spicy Strips": 104,
    "Salad - Extra Chick-fil-A Filet": 104,
    "Salad - Extra Grilled Nuggets": 104,
    "Salad - Extra Nuggets": 104,
    "Salad - Extra Spicy Grilled Filet (Cold)": 104,
    "Salad - Side": 49,
    "Salad - Signature Cobb w/ CFA Filet": 104,
    "Salad - Signature Cobb w/ Hot Grilled Filet": 104,
    "Salad - Signature Cobb w/ Nuggets": 104,
    "Salad - Signature Cobb w/ Spicy Filet": 104,
    "Salad - Signature Cobb w/Spicy Grilled Fil": 104,
    "Salad - Spicy SW Base": 104,
    "Salad - Spicy SW w/ CFA Filet": 104,
    "Salad - Spicy SW w/ Grld Nuggets": 104,
    "Salad - Spicy SW w/ Hot Grld Filet": 104,
    "Salad - Spicy SW w/ Nuggets": 104,
    "Salad - Spicy SW w/ Spicy Filet": 104,
    "Salad - Spicy SW w/ Spicy Grld Filet": 104,
    "Salad – Signature Cobb w/ Grilled Nuggets": 104,
    "Salad Base - Signature Cobb": 104,
    "Test - Salad - Signature Cobb w/Spicy": 104,
    "Test - Salad - Spicy SW w/Spcy Strips": 104,
  },
  "Lemonade": {
    "Lemonade - Regular, Small": 12,
    "Lemonade - Regular, Medium": 16,
    "Lemonade - Regular, Large": 20,
    "Lemonade - Regular, Kids": 12,
    "Lemonade - Gallon Regular": 128,
    "Frosted Lemonade, Small": 6,
    "Lemonade/Diet Lemonade, Large": 10,
    "Lemonade/Diet Lemonade, Medium": 8,
    "Lemonade/Diet Lemonade, Small": 6,
  },
  "Diet Lemonade": {
    "Lemonade - Diet, Small": 12,
    "Lemonade - Diet, Medium": 16,
    "Lemonade - Diet, Large": 20,
    "Lemonade - Diet, Kids": 12,
    "Lemonade - Gallon Diet": 128,
    "Frosted Lemonade - Diet, Small": 8,
    "Lemonade/Diet Lemonade, Large": 10,
    "Lemonade/Diet Lemonade, Medium": 8,
    "Lemonade/Diet Lemonade, Small": 6,
  },
  "Sunjoy Lemonade": {
    "Sweet Tea/Lemonade, Kids": 12,
    "Sweet Tea/Lemonade, Small": 12,
    "Sweet Tea/Lemonade, Medium": 16,
    "Sweet Tea/Lemonade, Large": 20,
    "Sweet Tea/Diet Lemonade, Kids": 12,
    "Sweet Tea/Diet Lemonade, Small": 12,
    "Sweet Tea/Diet Lemonade, Medium": 16,
    "Sweet Tea/Diet Lemonade, Large": 20,
    "Unsweet Tea/Lemonade, Small": 12,
    "Unsweet Tea/Lemonade, Medium": 16,
    "Unsweet Tea/Lemonade, Large": 20,
    "Unsweet Tea/Diet Lemonade, Medium": 16,
    "Unsweet Tea/Diet Lemonade, Large": 20
  }
}

const EnhancedUTPUpdate = () => {
  const [utpData, setUtpData] = useState({});
  const [prepUtpData, setPrepUtpData] = useState({}); // New state for Prep UTP
  const [analysisResults, setAnalysisResults] = useState(null);
  const [salesVariance, setSalesVariance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawSalesData, setRawSalesData] = useState([]);
  const [overallSalesMetrics, setOverallSalesMetrics] = useState({});
  const [reportMetadata, setReportMetadata] = useState({});

  // State for filtering and sorting
  const [negativeSearchTerm, setNegativeSearchTerm] = useState("");
  const [lowSalesSearchTerm, setLowSalesSearchTerm] = useState("");
  const [highPromoSearchTerm, setHighPromoSearchTerm] = useState("");
  const [promoEffectivenessSearchTerm, setPromoEffectivenessSearchTerm] = useState("");
  const [varianceSearchTerm, setVarianceSearchTerm] = useState("");

  const [negativeSortConfig, setNegativeSortConfig] = useState({});
  const [lowSalesSortConfig, setLowSalesSortConfig] = useState({});
  const [highPromoSortConfig, setHighPromoSortConfig] = useState({});
  const [promoEffectivenessSortConfig, setPromoEffectivenessSortConfig] = useState({});
  const [varianceSortConfig, setVarianceSortConfig] = useState({});

  const parseExcelData = useCallback((jsonData) => {
    // 1. Extract Metadata (Store, Date, Time)
    const storeName = jsonData[2]["Sales Mix Report - Item Summary"]?.replace("Store: ", "")?.split(",")[0] || "Unknown";
    const reportTime = jsonData[1]["__EMPTY_1"] || "Unknown";
    const reportStartDate = jsonData[0]["Sales Mix Report - Item Summary"]?.split("through")[0]?.replace("From", "")?.trim() || "Unknown";
    const reportEndDate = jsonData[0]["Sales Mix Report - Item Summary"]?.split("through")[1]?.trim() || "Unknown";

    setReportMetadata({
      storeName: storeName,
      reportTime: reportTime,
      reportStartDate: reportStartDate,
      reportEndDate: reportEndDate
    });

    // 2. Extract and Clean Headers
    const header_row1 = jsonData[4] || {};
    const header_row2 = jsonData[5] || {};
    const header_row3 = jsonData[6] || {};

    const header_map = {
      '__EMPTY_4': 'Total Count',
      '__EMPTY_8': 'Promo Count',
      '__EMPTY_10': 'Digital Count',
      '__EMPTY_13': 'Sold Count',
      '__EMPTY_17': '# Sold Per 1000'
    };

    const headers = [header_row1, header_row2, header_row3]
      .flatMap(row => Object.keys(row)
        .map(key => header_map[key] || key)
        .filter(Boolean)
      );

    const all_headers = ['Item Name'] + headers;

    // 3. Clean and Structure Data
    const data_rows = [];
    for (const row_index in jsonData) {
      const row = jsonData[row_index];
      if (row_index < 7 || [41, 42, 43, 44, 45, 553, 554, 555, 556, 557, 772, 773, 774, 775, 776, 961, 962, 963, 964, 965, 1074, 1075, 1076, 1077, 1078, 1363, 1364].includes(parseInt(row_index))) {
        continue;
      }
      let itemName = row['__EMPTY'];
      const row_data = [];
      for (const header_key in header_map) {
        if (header_key in row) {
          row_data.push(row[header_key]);
        }
      }
      if (itemName !== undefined && itemName !== null) {
        data_rows.push({
          'Item Name': itemName,
          'Total Count': row_data[0],
          'Promo Count': row_data[1],
          'Digital Count': row_data[2],
          'Sold Count': row_data[3],
          '# Sold Per 1000': row_data[4]
        });
      }
    }

    // 4. Data Type Conversion
    const numeric_columns = ['Total Count', 'Promo Count', 'Digital Count', 'Sold Count'];

    const cleaned_data = data_rows.map(item => {
      const convertedItem = { ...item };
      for (const col of numeric_columns) {
        convertedItem[col] = parseInt(item[col], 10) || 0;
      }
      convertedItem['# Sold Per 1000'] = parseFloat(item['# Sold Per 1000']) || 0;
      return convertedItem;
    })

    setRawSalesData(cleaned_data);
    return cleaned_data;
  }, []);

  const calculateOverallMetrics = useCallback((jsonData) => {
    let totalSoldCount = 0;
    let totalPromoCount = 0;
    let totalDigitalCount = 0;

    jsonData.forEach((item) => {
      totalSoldCount += item["Sold Count"];
      totalPromoCount += item["Promo Count"];
      totalDigitalCount += item["Digital Count"];
    });

    setOverallSalesMetrics({
      totalSold: totalSoldCount,
      totalPromo: totalPromoCount,
      totalDigital: totalDigitalCount,
    })
  }, []);

  const calculateUtps = useCallback((jsonData) => {
    const updatedUtpData = {};
    for (const category in ITEM_CATEGORIES) {
      updatedUtpData[category] = 0;
      const categoryConfig = ITEM_CATEGORIES[category];
      for (const item of jsonData) {
        const itemName = item['Item Name'];
        const itemCount = item['# Sold Per 1000'];
        if (Array.isArray(categoryConfig)) {
          if (categoryConfig.includes(itemName)) {
            updatedUtpData[category] += itemCount;
          }
        } else if (typeof categoryConfig === "object" && categoryConfig !== null) {
          if (categoryConfig[itemName]) {
            updatedUtpData[category] += itemCount * categoryConfig[itemName];
          }
        }
      }
    }
    return updatedUtpData;
  }, []);

  const calculatePrepUtps = useCallback((jsonData) => {
    const updatedPrepUtpData = {};
    for (const category in PREP_ITEM_CATEGORIES) {
      updatedPrepUtpData[category] = 0;
      const categoryConfig = PREP_ITEM_CATEGORIES[category];
      for (const item of jsonData) {
        const itemName = item['Item Name'];
        const itemCount = item['# Sold Per 1000'];
        if (Array.isArray(categoryConfig)) {
          if (categoryConfig.includes(itemName)) {
            updatedPrepUtpData[category] += itemCount;
          }
        } else if (typeof categoryConfig === "object" && categoryConfig !== null) {
          if (categoryConfig[itemName]) {
            updatedPrepUtpData[category] += itemCount * categoryConfig[itemName];
          }
        }
      }
      if (category === "Lettuce" || category === "Tomato") {
        updatedPrepUtpData[category] = updatedPrepUtpData[category] * 2;
      }
    }
    return updatedPrepUtpData;
  }, []);

  const analyzeSalesReport = useCallback((jsonData) => {
    const negativeCountItems = jsonData.filter(item => item['# Sold Per 1000'] < 0);
    const lowSoldCountItems = jsonData.filter(
      (item) => item['Sold Count'] < 10 && item['Sold Count'] >= 0
    );

    const highPromoCountItems = jsonData.filter(
      (item) => item['Promo Count'] > 100
    );

    const promoEffectiveness = jsonData
      .map((item) => ({
        item: item['Item Name'],
        totalSold: item['Sold Count'],
        promoFree: item['Promo Count'],
        digitalOffer: item['Digital Count'],
      }))
      .filter((item) => item.promoFree > 0 || item.digitalOffer > 0);

    return {
      negativeCountItems,
      lowSoldCountItems,
      promoEffectiveness,
      highPromoCountItems
    };
  }, []);

  const calculateSalesVariance = useCallback((jsonData) => {
    const varianceThreshold = 5;
    return jsonData.map(item => ({
      name: item['Item Name'],
      variance: item['Total Count'] - item['Sold Count'],
      totalCount: item['Total Count'],
      soldCount: item['Sold Count'],
      variancePercentage: item['Total Count'] > 0 ? ((item['Total Count'] - item['Sold Count']) / item['Total Count']) * 100 : 0
    }))
      .filter((item) => Math.abs(item.variance) > varianceThreshold);
  }, []);

  const handleFileUpload = useCallback((file) => {
    setErrorMessage("");
    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        const parsedData = parseExcelData(jsonData);
        console.log("Parsed Data:", parsedData);

        if (parsedData) {
          const updatedUtpData = calculateUtps(parsedData);
          const updatedPrepUtpData = calculatePrepUtps(parsedData)
          setUtpData(updatedUtpData);
          setPrepUtpData(updatedPrepUtpData);

          calculateOverallMetrics(parsedData);

          const analysis = analyzeSalesReport(parsedData);
          setAnalysisResults(analysis);

          const variance = calculateSalesVariance(parsedData);
          setSalesVariance(variance);
        }

      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setErrorMessage(
          "Error processing the Excel file. Ensure it is a valid .xlsx or .xls format."
        );
      } finally {
        setDragActive(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage("Error reading the file.");
      setDragActive(false);
    };

    reader.readAsArrayBuffer(file);
  }, [calculateUtps, analyzeSalesReport, calculateSalesVariance, parseExcelData, calculateOverallMetrics, calculatePrepUtps]);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragActive(false);
      const file = event.dataTransfer.files[0];
      if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
        handleFileUpload(file);
      } else {
        setErrorMessage("Please upload a valid .xlsx or .xls file.");
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handlePrepSubmit = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("Prep UPT data successfully submitted.");
    try {
      await axiosInstance.post("/upt/bulk", prepUtpData);
      setIsSnackbarOpen(true); // Open the Snackbar on success
    } catch (error) {
      console.error("Error submitting data:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to submit Prep UPT data. Please verify the information and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("UPT data successfully submitted.");
    try {
      await axiosInstance.post("/upt/bulk", utpData);
      setIsSnackbarOpen(true);
    } catch (error) {
      console.error("Error submitting data:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to submit UPT data. Please verify the information and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  // --- Filtering and Sorting Logic ---
  const filterSortData = useCallback((data, searchTerm, sortConfig) => {
    let filteredData = data;
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item =>
        Object.values(item).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)
        )
      );
    }

    if (sortConfig.key) {
      const sortKey = sortConfig.key;
      const direction = sortConfig.direction === 'ascending' ? 1 : -1;
      filteredData = [...filteredData].sort((a, b) => {
        if (a[sortKey] < b[sortKey]) {
          return direction * -1;
        }
        if (a[sortKey] > b[sortKey]) {
          return direction * 1;
        }
        return 0;
      });
    }
    return filteredData;
  }, []);

  const handleSort = useCallback((key, sortConfigSetter) => {
    sortConfigSetter(currentConfig => {
      let direction = 'ascending';
      if (currentConfig.key === key && currentConfig.direction === 'ascending') {
        direction = 'descending';
      }
      return { key, direction };
    });
  }, []);

  const sortedNegativeItems = useMemo(() =>
    filterSortData(analysisResults?.negativeCountItems || [], negativeSearchTerm, negativeSortConfig),
    [analysisResults?.negativeCountItems, negativeSearchTerm, negativeSortConfig]
  );

  const sortedLowSalesItems = useMemo(() =>
    filterSortData(analysisResults?.lowSoldCountItems || [], lowSalesSearchTerm, lowSalesSortConfig),
    [analysisResults?.lowSoldCountItems, lowSalesSearchTerm, lowSalesSortConfig]
  );

  const sortedHighPromoItems = useMemo(() =>
    filterSortData(analysisResults?.highPromoCountItems || [], highPromoSearchTerm, highPromoSortConfig),
    [analysisResults?.highPromoCountItems, highPromoSearchTerm, highPromoSortConfig]
  );

  const sortedPromoEffectiveness = useMemo(() =>
    filterSortData(analysisResults?.promoEffectiveness || [], promoEffectivenessSearchTerm, promoEffectivenessSortConfig),
    [analysisResults?.promoEffectiveness, promoEffectivenessSearchTerm, promoEffectivenessSortConfig]
  );

  const sortedVariance = useMemo(() =>
    filterSortData(salesVariance || [], varianceSearchTerm, varianceSortConfig),
    [salesVariance, varianceSearchTerm, varianceSortConfig]
  );

  const utpChartData = useMemo(
    () =>
      Object.entries(utpData).map(([category, value]) => ({
        name: category,
        UPT: parseFloat(value.toFixed(2)),
      })),
    [utpData]
  );

  const prepUtpChartData = useMemo(
    () =>
      Object.entries(prepUtpData).map(([category, value]) => ({
        name: category,
        UPT: parseFloat(value.toFixed(2)),
      })),
    [prepUtpData]
  );

  const formatPrepUtpDisplay = (category, value) => {
    if (["Lemonade", "Diet Lemonade", "Sunjoy Lemonade"].includes(category)) {
      return `${value.toFixed(2)} oz`;
    }
    if (category === "Romaine") {
      return `${value.toFixed(2)} g`;
    }
    return value.toFixed(2);
  };

  const topPerformingItems = useMemo(() => {
    const excludedItems = ["Report Totals", "Condiments", "Entrees", "Side Items", "Soft Drinks"];
    return [...rawSalesData]
      .filter(item => !excludedItems.includes(item['Item Name']))
      .sort((a, b) => b['# Sold Per 1000'] - a['# Sold Per 1000'])
      .slice(0, 5); // Get top 5
  }, [rawSalesData]);

  const bottomPerformingItems = useMemo(() => {
    const excludedItems = ["Miscellaneous Sale", "Salad - Extra Nuggets", "Salad Bowl", "Sep Bags", "Red Flag", "Non-Food", "No Condiment", "Soda Water", "Water, Large", "OS - Bag of Ice", "Outside Sales"
    ];
    const nonNegativeData = rawSalesData
      .filter(item => item['# Sold Per 1000'] > 0)
      .filter(item => !excludedItems.includes(item['Item Name']));
    return nonNegativeData
      .sort((a, b) => a['# Sold Per 1000'] - b['# Sold Per 1000'])
      .slice(0, 5);
  }, [rawSalesData]);


  const handleSnackbarClose = () => {
    setIsSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 4, backgroundColor, minHeight: '100vh' }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 700,
          textAlign: 'left',
          color: textColorPrimary,
          mb: 3,
          letterSpacing: '-0.025em'
        }}
      >
        Sales Data Analytics Suite
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
        sx={{ mb: 4 }}
      >
        Upload your sales report to analyze Unit Per Thousand (UPT) and gain valuable insights.
      </Typography>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Box
                sx={{
                  p: 4,
                  border: `2px dashed ${primaryColor}`,
                  borderRadius: '12px',
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragActive ? "rgba(25, 118, 210, 0.04)" : 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    transform: 'translateY(-2px)',
                  },
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <label htmlFor="file-upload">
                  <Box>
                    <CloudUpload
                      sx={{
                        fontSize: 64,
                        color: primaryColor,
                        mb: 2,
                        opacity: 0.8
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        color: textColorPrimary,
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      Drag and drop your sales matrix
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: textColorSecondary,
                        mb: 3
                      }}
                    >
                      Accepts .xlsx and .xls formats
                    </Typography>
                    <StyledButton
                      variant="contained"
                      color="primary"
                      size="large"
                      component="span"
                    >
                      Select File
                    </StyledButton>
                  </Box>
                </label>
                <Input accept=".xlsx, .xls" id="file-upload" type="file" onChange={handleFileChange} />
                {selectedFile && (
                  <Box
                    mt={3}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: textColorPrimary,
                        fontWeight: 500
                      }}
                      noWrap
                    >
                      {selectedFile.name}
                    </Typography>
                    <Tooltip title="Remove">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedFile(null)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.08)',
                          },
                        }}
                      >
                        <Close fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              <Collapse in={!!errorMessage}>
                <Alert
                  icon={<ErrorOutline />}
                  severity="error"
                  onClose={() => setErrorMessage("")}
                  sx={{
                    mt: 3,
                    borderRadius: '8px',
                  }}
                >
                  {errorMessage}
                </Alert>
              </Collapse>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
          {reportMetadata && (
            <StyledCard>
              <StyledCardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Report Summary
                  </Typography>
                }
              />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        border: '1px solid rgba(25, 118, 210, 0.1)',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Store Location: {reportMetadata.storeName}
                      </Typography>
                      <Typography variant="body2" color={textColorSecondary}>
                        Generated: {reportMetadata.reportTime}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <Typography variant="subtitle2" color={textColorSecondary}>
                        Period Start
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {reportMetadata.reportStartDate}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <Typography variant="subtitle2" color={textColorSecondary}>
                        Period End
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {reportMetadata.reportEndDate}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          )}

          {overallSalesMetrics && (
            <StyledCard sx={{ mt: 3 }}>
              <StyledCardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Sales Overview
                  </Typography>
                }
              />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(46, 125, 50, 0.04)',
                        border: '1px solid rgba(46, 125, 50, 0.1)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h4" sx={{ color: successColor, fontWeight: 700 }}>
                        {overallSalesMetrics.totalSold}
                      </Typography>
                      <Typography variant="body2" color={textColorSecondary}>
                        Total Items Sold
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(237, 108, 2, 0.04)',
                        border: '1px solid rgba(237, 108, 2, 0.1)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h4" sx={{ color: warningColor, fontWeight: 700 }}>
                        {overallSalesMetrics.totalPromo}
                      </Typography>
                      <Typography variant="body2" color={textColorSecondary}>
                        Promotional Items
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        border: '1px solid rgba(25, 118, 210, 0.1)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h4" sx={{ color: primaryColor, fontWeight: 700 }}>
                        {overallSalesMetrics.totalDigital}
                      </Typography>
                      <Typography variant="body2" color={textColorSecondary}>
                        Digital Transactions
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          )}
        </Grid>

        {Object.keys(utpData).length > 0 && (
          <Grid item xs={12}>
            <StyledCard>
              <StyledCardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Unit Per Thousand Analysis
                  </Typography>
                }
                action={
                  <StyledButton
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutline />}
                  >
                    {isLoading ? "Submitting..." : "Submit UPT Data"}
                  </StyledButton>
                }
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ height: 400, mb: 4 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={utpChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: textColorSecondary }}
                        axisLine={{ stroke: borderColor }}
                      />
                      <YAxis
                        tick={{ fill: textColorSecondary }}
                        axisLine={{ stroke: borderColor }}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: `1px solid ${borderColor}`,
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar
                        dataKey="UPT"
                        fill={primaryColor}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
                          Item Category
                        </StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 600, backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
                          UPT
                        </StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(utpData).map(([key, value], index) => (
                        <StyledTableRow key={key} iseven={index % 2 === 0}>
                          <StyledTableCell>{key}</StyledTableCell>
                          <StyledTableCell align="right">
                            <Typography sx={{ fontWeight: 500 }}>
                              {value.toFixed(2)}
                            </Typography>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </StyledCard>
          </Grid>
        )}

        {Object.keys(prepUtpData).length > 0 && (
          <Grid item xs={12}>
            <StyledCard>
              <StyledCardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Prep Unit Per Thousand Analysis
                  </Typography>
                }
                action={
                  <StyledButton
                    variant="contained"
                    color="primary"
                    onClick={handlePrepSubmit}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutline />}
                  >
                    {isLoading ? "Submitting..." : "Submit Prep UPT Data"}
                  </StyledButton>
                }
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ height: 400, mb: 4 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepUtpChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: textColorSecondary }}
                        axisLine={{ stroke: borderColor }}
                      />
                      <YAxis
                        tick={{ fill: textColorSecondary }}
                        axisLine={{ stroke: borderColor }}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: `1px solid ${borderColor}`,
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar
                        dataKey="UPT"
                        fill={primaryColor}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
                          Item Category
                        </StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 600, backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
                          UPT
                        </StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(prepUtpData).map(([key, value], index) => (
                        <StyledTableRow key={key} iseven={index % 2 === 0}>
                          <StyledTableCell>{key}</StyledTableCell>
                          <StyledTableCell align="right">
                            <Typography sx={{ fontWeight: 500 }}>
                              {formatPrepUtpDisplay(key, value)}
                            </Typography>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </StyledCard>
          </Grid>
        )}

        {analysisResults && (
          <Grid item xs={12}>
            <StyledCard>
              <StyledCardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Sales Insights & Analysis
                  </Typography>
                }
              />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: textColorPrimary }}>
                        Performance Overview
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box
                            sx={{
                              p: 3,
                              borderRadius: '12px',
                              backgroundColor: 'rgba(46, 125, 50, 0.04)',
                              border: '1px solid rgba(46, 125, 50, 0.1)',
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ color: successColor, fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                              <ArrowUpwardIcon sx={{ mr: 1 }} /> Top Performing Items
                            </Typography>
                            <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <StyledTableCell sx={{ fontWeight: 600, border: 'none' }}>Item</StyledTableCell>
                                    <StyledTableCell align="right" sx={{ fontWeight: 600, border: 'none' }}># Sold Per 1000</StyledTableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {topPerformingItems.map((item, index) => (
                                    <StyledTableRow key={item['Item Name']}>
                                      <StyledTableCell sx={{ border: 'none' }}>{item['Item Name']}</StyledTableCell>
                                      <StyledTableCell align="right" sx={{ border: 'none', fontWeight: 500 }}>
                                        {item['# Sold Per 1000']}
                                      </StyledTableCell>
                                    </StyledTableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box
                            sx={{
                              p: 3,
                              borderRadius: '12px',
                              backgroundColor: 'rgba(237, 108, 2, 0.04)',
                              border: '1px solid rgba(237, 108, 2, 0.1)',
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ color: warningColor, fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                              <ArrowDownwardIcon sx={{ mr: 1 }} /> Items Needing Attention
                            </Typography>
                            <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <StyledTableCell sx={{ fontWeight: 600, border: 'none' }}>Item</StyledTableCell>
                                    <StyledTableCell align="right" sx={{ fontWeight: 600, border: 'none' }}># Sold Per 1000</StyledTableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {bottomPerformingItems.map((item, index) => (
                                    <StyledTableRow key={item['Item Name']}>
                                      <StyledTableCell sx={{ border: 'none' }}>{item['Item Name']}</StyledTableCell>
                                      <StyledTableCell align="right" sx={{ border: 'none', fontWeight: 500 }}>
                                        {item['# Sold Per 1000']}
                                      </StyledTableCell>
                                    </StyledTableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {analysisResults.negativeCountItems.length > 0 && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '12px',
                          backgroundColor: 'rgba(211, 47, 47, 0.04)',
                          border: '1px solid rgba(211, 47, 47, 0.1)',
                          mb: 3,
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ color: errorColor, fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                          <Warning sx={{ mr: 1 }} /> Inventory Discrepancies
                          <Tooltip title="Items with negative counts require immediate attention">
                            <IconButton size="small" sx={{ ml: 1 }}>
                              <Lightbulb fontSize="small" color="info" />
                            </IconButton>
                          </Tooltip>
                        </Typography>
                        <TextField
                          label="Filter Items"
                          variant="outlined"
                          size="small"
                          fullWidth
                          margin="dense"
                          sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#fff',
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          value={negativeSearchTerm}
                          onChange={(e) => setNegativeSearchTerm(e.target.value)}
                        />
                        <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <StyledTableCell sx={{ fontWeight: 600, border: 'none' }}>Item</StyledTableCell>
                                <StyledTableCell align="right" sx={{ fontWeight: 600, border: 'none' }}>Count (per 1000)</StyledTableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sortedNegativeItems.map((item, index) => (
                                <StyledTableRow key={item['Item Name']}>
                                  <StyledTableCell sx={{ border: 'none' }}>{item['Item Name']}</StyledTableCell>
                                  <StyledTableCell align="right" sx={{ border: 'none', color: errorColor, fontWeight: 500 }}>
                                    {item['# Sold Per 1000']}
                                  </StyledTableCell>
                                </StyledTableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Grid>
                  )}

                  {analysisResults.lowSoldCountItems.length > 0 && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '12px',
                          backgroundColor: 'rgba(237, 108, 2, 0.04)',
                          border: '1px solid rgba(237, 108, 2, 0.1)',
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 3,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Warning sx={{ color: warningColor, mr: 1 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: warningColor }}>
                              Items with Lower Sales Volume
                            </Typography>
                            <Tooltip title="Items with low 'Sold Count' may require attention. Consider promotional activities or menu adjustments.">
                              <IconButton size="small" sx={{ ml: 1 }}>
                                <Lightbulb fontSize="small" color="info" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <TextField
                            placeholder="Filter low sales items..."
                            variant="outlined"
                            size="small"
                            sx={{
                              width: '240px',
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                '& fieldset': {
                                  borderColor: 'transparent',
                                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'transparent',
                                  boxShadow: '0 0 0 1px rgba(0,0,0,0.2)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: primaryColor,
                                  boxShadow: 'none',
                                },
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon color="action" fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                            value={lowSalesSearchTerm}
                            onChange={(e) => setLowSalesSearchTerm(e.target.value)}
                          />
                        </Box>
                        <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                          <Table size="medium">
                            <TableHead>
                              <TableRow>
                                <StyledTableCell
                                  sx={{
                                    fontWeight: 600,
                                    border: 'none',
                                    backgroundColor: 'rgba(237, 108, 2, 0.08)',
                                    py: 2
                                  }}
                                >
                                  Item
                                </StyledTableCell>
                                <StyledTableCell
                                  align="right"
                                  sx={{
                                    fontWeight: 600,
                                    border: 'none',
                                    backgroundColor: 'rgba(237, 108, 2, 0.08)',
                                    py: 2
                                  }}
                                >
                                  Sold Count
                                </StyledTableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sortedLowSalesItems.map((item, index) => (
                                <StyledTableRow
                                  key={item['Item Name']}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: 'rgba(237, 108, 2, 0.04)',
                                    },
                                  }}
                                >
                                  <StyledTableCell sx={{ border: 'none', py: 2 }}>{item['Item Name']}</StyledTableCell>
                                  <StyledTableCell
                                    align="right"
                                    sx={{
                                      border: 'none',
                                      py: 2,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        backgroundColor: 'rgba(237, 108, 2, 0.1)',
                                        borderRadius: '16px',
                                        px: 1.5,
                                        py: 0.5,
                                        fontWeight: 500,
                                        color: warningColor,
                                      }}
                                    >
                                      {item['Sold Count']}
                                    </Box>
                                  </StyledTableCell>
                                </StyledTableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Grid>
                  )}

                  {analysisResults.highPromoCountItems.length > 0 && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '12px',
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          border: '1px solid rgba(25, 118, 210, 0.1)',
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 3,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Lightbulb sx={{ color: primaryColor, mr: 1 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: primaryColor }}>
                              High Promotional Redemption Items
                            </Typography>
                            <Tooltip title="Review items with a high 'Promo Count'. Understand the reasons behind the high promotion usage.">
                              <IconButton size="small" sx={{ ml: 1 }}>
                                <Lightbulb fontSize="small" color="info" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <TextField
                            placeholder="Filter promo items..."
                            variant="outlined"
                            size="small"
                            sx={{
                              width: '240px',
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                '& fieldset': {
                                  borderColor: 'transparent',
                                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'transparent',
                                  boxShadow: '0 0 0 1px rgba(0,0,0,0.2)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: primaryColor,
                                  boxShadow: 'none',
                                },
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon color="action" fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                            value={highPromoSearchTerm}
                            onChange={(e) => setHighPromoSearchTerm(e.target.value)}
                          />
                        </Box>
                        <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                          <Table size="medium">
                            <TableHead>
                              <TableRow>
                                <StyledTableCell
                                  sx={{
                                    fontWeight: 600,
                                    border: 'none',
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    py: 2
                                  }}
                                >
                                  Item
                                </StyledTableCell>
                                <StyledTableCell
                                  align="right"
                                  sx={{
                                    fontWeight: 600,
                                    border: 'none',
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    py: 2
                                  }}
                                >
                                  Promo Count
                                </StyledTableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sortedHighPromoItems.map((item, index) => (
                                <StyledTableRow
                                  key={item['Item Name']}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                    },
                                  }}
                                >
                                  <StyledTableCell sx={{ border: 'none', py: 2 }}>{item['Item Name']}</StyledTableCell>
                                  <StyledTableCell
                                    align="right"
                                    sx={{
                                      border: 'none',
                                      py: 2,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                        borderRadius: '16px',
                                        px: 1.5,
                                        py: 0.5,
                                        fontWeight: 500,
                                        color: primaryColor,
                                      }}
                                    >
                                      {item['Promo Count']}
                                    </Box>
                                  </StyledTableCell>
                                </StyledTableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Grid>
                  )}

                  {analysisResults.promoEffectiveness.length > 0 && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '12px',
                          backgroundColor: '#fff',
                          border: `1px solid ${borderColor}`,
                          mb: 3,
                        }}
                      >
                        <Accordion
                          elevation={0}
                          sx={{
                            '&:before': {
                              display: 'none',
                            },
                            backgroundColor: 'transparent',
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMore />}
                            sx={{
                              padding: 0,
                              '& .MuiAccordionSummary-content': {
                                margin: 0,
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Lightbulb sx={{ color: primaryColor, mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: primaryColor }}>
                                Promotion Effectiveness Analysis
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ padding: 0, mt: 2 }}>
                            <Typography color={textColorSecondary} variant="body2" paragraph>
                              Analyze the effectiveness of promotions by reviewing items frequently offered with discounts.
                            </Typography>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 3,
                              }}
                            >
                              <TextField
                                placeholder="Filter promotions..."
                                variant="outlined"
                                size="small"
                                sx={{
                                  width: '240px',
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    '& fieldset': {
                                      borderColor: 'transparent',
                                      boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: 'transparent',
                                      boxShadow: '0 0 0 1px rgba(0,0,0,0.2)',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: primaryColor,
                                      boxShadow: 'none',
                                    },
                                  },
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <SearchIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                  ),
                                }}
                                value={promoEffectivenessSearchTerm}
                                onChange={(e) => setPromoEffectivenessSearchTerm(e.target.value)}
                              />
                            </Box>

                            <TableContainer
                              component={Paper}
                              elevation={0}
                              sx={{
                                border: `1px solid ${borderColor}`,
                                borderRadius: '12px',
                                overflow: 'hidden'
                              }}
                            >
                              <Table size="medium">
                                <TableHead>
                                  <TableRow>
                                    <StyledTableCell
                                      sx={{
                                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                        fontWeight: 600,
                                        py: 2
                                      }}
                                    >
                                      Item
                                    </StyledTableCell>
                                    <StyledTableCell
                                      align="right"
                                      sx={{
                                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                        fontWeight: 600,
                                        py: 2
                                      }}
                                    >
                                      Total Sold
                                    </StyledTableCell>
                                    <StyledTableCell
                                      align="right"
                                      sx={{
                                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                        fontWeight: 600,
                                        py: 2
                                      }}
                                    >
                                      Promo Count
                                    </StyledTableCell>
                                    <StyledTableCell
                                      align="right"
                                      sx={{
                                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                        fontWeight: 600,
                                        py: 2
                                      }}
                                    >
                                      Digital Offer
                                    </StyledTableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {sortedPromoEffectiveness.map((item, index) => (
                                    <StyledTableRow
                                      key={item.item}
                                      iseven={index % 2 === 0}
                                      sx={{
                                        '&:hover': {
                                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                        },
                                      }}
                                    >
                                      <StyledTableCell sx={{ py: 2 }}>{item.item}</StyledTableCell>
                                      <StyledTableCell align="right" sx={{ py: 2 }}>
                                        <Typography sx={{ fontWeight: 500 }}>
                                          {item.totalSold}
                                        </Typography>
                                      </StyledTableCell>
                                      <StyledTableCell align="right" sx={{ py: 2 }}>
                                        <Box
                                          sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                            borderRadius: '16px',
                                            px: 1.5,
                                            py: 0.5,
                                            fontWeight: 500,
                                            color: primaryColor,
                                          }}
                                        >
                                          {item.promoFree}
                                        </Box>
                                      </StyledTableCell>
                                      <StyledTableCell align="right" sx={{ py: 2 }}>
                                        <Box
                                          sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            backgroundColor: item.digitalOffer > 0 ? 'rgba(46, 125, 50, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                            borderRadius: '16px',
                                            px: 1.5,
                                            py: 0.5,
                                            fontWeight: 500,
                                            color: item.digitalOffer > 0 ? successColor : textColorSecondary,
                                          }}
                                        >
                                          {item.digitalOffer}
                                        </Box>
                                      </StyledTableCell>
                                    </StyledTableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>
        )}

        {salesVariance && salesVariance.length > 0 && (
          <Grid item xs={12}>
            <StyledCard>
              <StyledCardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Sales Variance Analysis
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(237, 108, 2, 0.1)',
                        color: warningColor,
                        borderRadius: '20px',
                        px: 2,
                        py: 0.5,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      {salesVariance.length} items need attention
                    </Box>
                  </Box>
                }
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'stretch', md: 'center' },
                      justifyContent: 'space-between',
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning sx={{ color: warningColor }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: warningColor }}>
                          Significant Sales Variances
                        </Typography>
                        <Tooltip
                          title="Items with notable differences between 'Total Count' and 'Sold Count'. Investigate potential issues in inventory management or sales tracking."
                          placement="right"
                        >
                          <IconButton size="small">
                            <Lightbulb fontSize="small" sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600 }}>
                        Monitor items with significant variances between total and sold counts. High variances may indicate inventory discrepancies or tracking issues.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        placeholder="Search items..."
                        variant="outlined"
                        size="small"
                        sx={{
                          minWidth: '280px',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease',
                            '& fieldset': {
                              borderColor: 'transparent',
                              boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'transparent',
                              boxShadow: '0 0 0 1px rgba(0,0,0,0.2)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: primaryColor,
                              boxShadow: 'none',
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        value={varianceSearchTerm}
                        onChange={(e) => setVarianceSearchTerm(e.target.value)}
                      />
                    </Box>
                  </Box>

                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      border: `1px solid ${borderColor}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      },
                    }}
                  >
                    <Table size="medium">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell
                            sx={{
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              fontWeight: 600,
                              py: 2.5,
                              fontSize: '0.875rem',
                            }}
                          >
                            Item Name
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              fontWeight: 600,
                              py: 2.5,
                              fontSize: '0.875rem',
                            }}
                          >
                            Total Count
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              fontWeight: 600,
                              py: 2.5,
                              fontSize: '0.875rem',
                            }}
                          >
                            Sold Count
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              fontWeight: 600,
                              py: 2.5,
                              fontSize: '0.875rem',
                            }}
                          >
                            Variance
                          </StyledTableCell>
                          <StyledTableCell
                            align="right"
                            sx={{
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              fontWeight: 600,
                              py: 2.5,
                              fontSize: '0.875rem',
                            }}
                          >
                            Trend
                          </StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedVariance.map((item, index) => (
                          <StyledTableRow
                            key={item.name}
                            sx={{
                              position: 'relative',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.01)',
                                '& .variance-details': {
                                  opacity: 1,
                                },
                              },
                            }}
                          >
                            <StyledTableCell
                              sx={{
                                py: 2.5,
                                pl: 3,
                              }}
                            >
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontWeight: 500, color: textColorPrimary, mb: 0.5 }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {index + 1}
                                </Typography>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ py: 2.5 }}>
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  borderRadius: '8px',
                                  px: 2,
                                  py: 1,
                                  minWidth: '80px',
                                }}
                              >
                                <Typography sx={{ fontWeight: 500, color: textColorPrimary }}>
                                  {item.totalCount}
                                </Typography>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ py: 2.5 }}>
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  borderRadius: '8px',
                                  px: 2,
                                  py: 1,
                                  minWidth: '80px',
                                }}
                              >
                                <Typography sx={{ fontWeight: 500, color: textColorPrimary }}>
                                  {item.soldCount}
                                </Typography>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ py: 2.5 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: item.variance > 0
                                      ? 'rgba(46, 125, 50, 0.1)'
                                      : 'rgba(211, 47, 47, 0.1)',
                                    color: item.variance > 0 ? successColor : errorColor,
                                    borderRadius: '20px',
                                    px: 2,
                                    py: 0.5,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    minWidth: '90px',
                                  }}
                                >
                                  {item.variance > 0 ? '+' : ''}{item.variance}
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: item.variance > 0 ? successColor : errorColor,
                                    fontWeight: 500
                                  }}
                                >
                                  {Math.abs(item.variancePercentage).toFixed(1)}% {item.variance > 0 ? 'Over' : 'Under'}
                                </Typography>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ py: 2.5, pr: 3 }}>
                              <Box
                                className="variance-details"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  gap: 1,
                                  opacity: 0.8,
                                  transition: 'opacity 0.2s ease',
                                }}
                              >
                                {item.variance > 0 ? (
                                  <ArrowUpwardIcon sx={{ color: successColor }} />
                                ) : (
                                  <ArrowDownwardIcon sx={{ color: errorColor }} />
                                )}
                                <Box
                                  sx={{
                                    width: 60,
                                    height: 24,
                                    backgroundColor: item.variance > 0
                                      ? 'rgba(46, 125, 50, 0.1)'
                                      : 'rgba(211, 47, 47, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: item.variance > 0 ? successColor : errorColor,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {Math.abs(item.variancePercentage).toFixed(0)}%
                                  </Typography>
                                </Box>
                              </Box>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EnhancedUTPUpdate;