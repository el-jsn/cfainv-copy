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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { styled, useTheme } from "@mui/material/styles";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';

// Theming and Consistent Styling (Adapted for White Theme)
const primaryColor = "#1976d2"; // Standard Material Blue
const secondaryColor = "#dc004e"; // A vibrant accent
const successColor = "#2e7d32";
const warningColor = "#ed6c02";
const errorColor = "#d32f2f";
const textColorPrimary = "#212121"; // Dark text for contrast on white
const textColorSecondary = "#757575";
const backgroundColor = "#f5f5f5"; // Light gray background
const tableRowHoverColor = "#e0e0e0"; // Light gray hover
const tableRowEvenColor = "#f9f9f9"; // Very light gray for even rows

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

// Styled Card Header (Adapted for White Theme)
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: primaryColor,
  color: theme.palette.common.white,
  '& .MuiCardHeader-title': {
    fontWeight: 600,
  },
}));

// Styled TableCell for better readability (Adapted for White Theme)
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: textColorPrimary,
  borderBottom: `1px solid ${theme.palette.divider}`, // Subtle divider between cells
}));

// Styled TableRow for hover and alternating background (Adapted for White Theme)
const StyledTableRow = styled(TableRow)(({ theme, iseven }) => ({
  '&:hover': {
    backgroundColor: tableRowHoverColor,
  },
  backgroundColor: iseven ? tableRowEvenColor : theme.palette.background.paper,
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

const EnhancedUTPUpdate = () => {
  const theme = useTheme();
  const [utpData, setUtpData] = useState({});
  const [analysisResults, setAnalysisResults] = useState(null);
  const [salesVariance, setSalesVariance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
          setUtpData(updatedUtpData);

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
  }, [calculateUtps, analyzeSalesReport, calculateSalesVariance, parseExcelData, calculateOverallMetrics]);

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

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await axiosInstance.post("/upt/bulk", utpData);
      setSuccessMessage("UPT data successfully submitted.");
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

  return (
    <Box sx={{ p: 4, backgroundColor, color: textColorPrimary }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
        Sales Data Analytics Suite
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Upload your sales report to analyze Unit Per Thousand (UPT) and gain valuable insights.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box
                sx={{
                  p: 4,
                  border: `2px dashed ${primaryColor}`,
                  borderRadius: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragActive ? "#e3f2fd" : theme.palette.background.paper,
                  transition: 'background-color 0.3s ease',
                  '&:hover': { backgroundColor: '#e3f2fd' },
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <label htmlFor="file-upload">
                  <Box>
                    <CloudUpload color="primary" sx={{ fontSize: 50, display: "block", margin: "0 auto 15px" }} />
                    <Typography variant="h6" color={textColorPrimary}>
                      Drag and drop your sales matrix
                    </Typography>
                    <Typography variant="body2" color={textColorSecondary}>
                      (Accepts .xlsx and .xls formats)
                    </Typography>
                    <Button component="span" variant="contained" color="primary" size="large" sx={{ mt: 2 }}>
                      Select File
                    </Button>
                  </Box>
                </label>
                <Input accept=".xlsx, .xls" id="file-upload" type="file" onChange={handleFileChange} />
                {selectedFile && (
                  <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color={textColorSecondary} noWrap style={{ overflowX: 'hidden', marginRight: theme.spacing(1) }}>
                      {selectedFile.name}
                    </Typography>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => setSelectedFile(null)}>
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
                  sx={{ mt: 2 }}
                >
                  {errorMessage}
                </Alert>
              </Collapse>

              <Collapse in={!!successMessage}>
                <Alert
                  icon={<CheckCircleOutline />}
                  severity="success"
                  onClose={() => setSuccessMessage("")}
                  sx={{ mt: 2 }}
                >
                  {successMessage}
                </Alert>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {reportMetadata && (
            <Card elevation={3}>
              <StyledCardHeader title="Report Summary" />
              <CardContent>
                <Typography variant="subtitle1" color={textColorPrimary}>
                  <Box fontWeight="bold" display="inline">Store Location:</Box> {reportMetadata.storeName}
                </Typography>
                <Typography variant="subtitle1" color={textColorPrimary}>
                  <Box fontWeight="bold" display="inline">Generation Time:</Box> {reportMetadata.reportTime}
                </Typography>
                <Typography variant="subtitle1" color={textColorPrimary}>
                  <Box fontWeight="bold" display="inline">Reporting Period Start:</Box> {reportMetadata.reportStartDate}
                </Typography>
                <Typography variant="subtitle1" color={textColorPrimary}>
                  <Box fontWeight="bold" display="inline">Reporting Period End:</Box> {reportMetadata.reportEndDate}
                </Typography>
              </CardContent>
            </Card>
          )}

          {overallSalesMetrics && (
            <Card elevation={3} sx={{ mt: 3 }}>
              <StyledCardHeader title="Aggregate Sales Metrics" />
              <CardContent>
                <Typography variant="h6" color={textColorPrimary} gutterBottom>Key Performance Indicators</Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="body1" color={textColorPrimary}>
                  Total Items Sold: <Box fontWeight="bold" display="inline">{overallSalesMetrics.totalSold}</Box>
                </Typography>
                <Typography variant="body1" color={textColorPrimary}>
                  Total Promotional Engagements: <Box fontWeight="bold" display="inline">{overallSalesMetrics.totalPromo}</Box>
                </Typography>
                <Typography variant="body1" color={textColorPrimary}>
                  Total Digital Transactions: <Box fontWeight="bold" display="inline">{overallSalesMetrics.totalDigital}</Box>
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {Object.keys(utpData).length > 0 && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <StyledCardHeader
                title="Unit Per Thousand Analysis"
                action={
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutline />}
                    sx={{ ml: 2 }}
                  >
                    {isLoading ? "Submitting..." : "Submit UPT Data"}
                  </Button>
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utpChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="UPT" fill={primaryColor} />
                  </BarChart>
                </ResponsiveContainer>
                <TableContainer component={Paper} elevation={1} sx={{ mt: 2 }}>
                  <Table aria-label="calculated upts table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell sx={{ fontWeight: 'bold' }}>Item Category</StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>UPT</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(utpData).map(([key, value], index) => (
                        <StyledTableRow key={key} iseven={index % 2 === 0}>
                          <StyledTableCell component="th" scope="row">
                            {key}
                          </StyledTableCell>
                          <StyledTableCell align="right">{value.toFixed(2)}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {analysisResults && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <StyledCardHeader title="Key Insights and Recommendations" />
              <CardContent>

                <Typography variant="h6" gutterBottom>Menu Item Performance</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color={successColor} gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <ArrowUpwardIcon sx={{ mr: 0.5 }} /> Top Performing Items
                    </Typography>
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: successColor }}>
                          <TableRow>
                            <StyledTableCell sx={{ fontWeight: 'bold', color: theme.palette.success.contrastText }}>Item</StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.success.contrastText }}># Sold Per 1000</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {topPerformingItems.map((item, index) => (
                            <StyledTableRow key={item['Item Name']} iseven={index % 2 === 0}>
                              <StyledTableCell>{item['Item Name']}</StyledTableCell>
                              <StyledTableCell align="right">{item['# Sold Per 1000']}</StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color={warningColor} gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <ArrowDownwardIcon sx={{ mr: 0.5 }} /> Bottom Performing Items
                    </Typography>
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: warningColor }}>
                          <TableRow>
                            <StyledTableCell sx={{ fontWeight: 'bold', color: theme.palette.warning.contrastText }}>Item</StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.warning.contrastText }}># Sold Per 1000</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bottomPerformingItems.map((item, index) => (
                            <StyledTableRow key={item['Item Name']} iseven={index % 2 === 0}>
                              <StyledTableCell>{item['Item Name']}</StyledTableCell>
                              <StyledTableCell align="right">{item['# Sold Per 1000']}</StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>

                {analysisResults.negativeCountItems.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="h6" color={errorColor} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Warning sx={{ mr: 1 }} /> Potential Inventory Discrepancies
                      <Tooltip title="Items with a negative '# Sold Per 1000' count may indicate overstock or potential waste. Investigate these items for possible adjustments.">
                        <Lightbulb color="info" sx={{ ml: 1, fontSize: 'small' }} />
                      </Tooltip>
                    </Typography>
                    <TextField
                      label="Filter Items"
                      variant="outlined"
                      size="small"
                      fullWidth
                      margin="dense"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="inherit" />
                          </InputAdornment>
                        ),
                      }}
                      value={negativeSearchTerm}
                      onChange={(e) => setNegativeSearchTerm(e.target.value)}
                    />
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small" aria-label="overstock items">
                        <TableHead sx={{ backgroundColor: errorColor }}>
                          <TableRow>
                            <StyledTableCell sx={{ fontWeight: 'bold', color: theme.palette.error.contrastText }}>
                              Item
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.error.contrastText }}>
                              Count (# per 1000 Sold)
                            </StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sortedNegativeItems.map((item, index) => (
                            <StyledTableRow key={item['Item Name']} iseven={index % 2 === 0}>
                              <StyledTableCell component="th" scope="row">{item['Item Name']}</StyledTableCell>
                              <StyledTableCell align="right">{item['# Sold Per 1000']}</StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {analysisResults.lowSoldCountItems.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="h6" color={warningColor} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Warning sx={{ mr: 1 }} /> Items with Lower Sales Volume
                      <Tooltip title="Items with low 'Sold Count' may require attention. Consider promotional activities or menu adjustments.">
                        <Lightbulb color="info" sx={{ ml: 1, fontSize: 'small' }} />
                      </Tooltip>
                    </Typography>
                    <TextField
                      label="Filter Items"
                      variant="outlined"
                      size="small"
                      fullWidth
                      margin="dense"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="inherit" />
                          </InputAdornment>
                        ),
                      }}
                      value={lowSalesSearchTerm}
                      onChange={(e) => setLowSalesSearchTerm(e.target.value)}
                    />
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small" aria-label="low sold count items">
                        <TableHead sx={{ backgroundColor: warningColor }}>
                          <TableRow>
                            <StyledTableCell sx={{ fontWeight: 'bold', color: theme.palette.warning.contrastText }}>
                              Item
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.warning.contrastText }}>
                              Sold Count
                            </StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sortedLowSalesItems.map((item, index) => (
                            <StyledTableRow key={item['Item Name']} iseven={index % 2 === 0}>
                              <StyledTableCell component="th" scope="row">{item['Item Name']}</StyledTableCell>
                              <StyledTableCell align="right">{item['Sold Count']}</StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {analysisResults.highPromoCountItems.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="h6" color={primaryColor} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Lightbulb sx={{ mr: 1 }} /> High Promotional Redemption Items
                      <Tooltip title="Review items with a high 'Promo Count'. Understand the reasons behind the high promotion usage.">
                        <Lightbulb color="info" sx={{ ml: 1, fontSize: 'small' }} />
                      </Tooltip>
                    </Typography>
                    <TextField
                      label="Filter Items"
                      variant="outlined"
                      size="small"
                      fullWidth
                      margin="dense"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="inherit" />
                          </InputAdornment>
                        ),
                      }}
                      value={highPromoSearchTerm}
                      onChange={(e) => setHighPromoSearchTerm(e.target.value)}
                    />
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small" aria-label="high promo count items">
                        <TableHead sx={{ backgroundColor: primaryColor }}>
                          <TableRow>
                            <StyledTableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>
                              Item
                            </StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>
                              Promo Count
                            </StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sortedHighPromoItems.map((item, index) => (
                            <StyledTableRow key={item['Item Name']} iseven={index % 2 === 0}>
                              <StyledTableCell component="th" scope="row">{item['Item Name']}</StyledTableCell>
                              <StyledTableCell align="right">{item['Promo Count']}</StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {analysisResults.promoEffectiveness.length > 0 && (
                  <Box mb={3}>
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="promo-effectiveness-content"
                        id="promo-effectiveness-header"
                      >
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Lightbulb sx={{ mr: 1 }} /> Promotion Effectiveness
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography color={textColorSecondary} variant="body2" gutterBottom>
                          Analyze the effectiveness of promotions by reviewing items frequently offered with discounts.
                        </Typography>
                        <TextField
                          label="Filter Items"
                          variant="outlined"
                          size="small"
                          fullWidth
                          margin="dense"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon color="inherit" />
                              </InputAdornment>
                            ),
                          }}
                          value={promoEffectivenessSearchTerm}
                          onChange={(e) => setPromoEffectivenessSearchTerm(e.target.value)}
                        />
                        <TableContainer component={Paper} elevation={1}>
                          <Table size="small" aria-label="promotion effectiveness">
                            <TableHead>
                              <TableRow>
                                <StyledTableCell sx={{ fontWeight: 'bold' }}>Item</StyledTableCell>
                                <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>Total Sold</StyledTableCell>
                                <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>Promo Count</StyledTableCell>
                                <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>Digital Offer</StyledTableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sortedPromoEffectiveness.map((item, index) => (
                                <StyledTableRow key={item.item} iseven={index % 2 === 0}>
                                  <StyledTableCell component="th" scope="row">{item.item}</StyledTableCell>
                                  <StyledTableCell align="right">{item.totalSold}</StyledTableCell>
                                  <StyledTableCell align="right">{item.promoFree}</StyledTableCell>
                                  <StyledTableCell align="right">{item.digitalOffer}</StyledTableCell>
                                </StyledTableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {salesVariance && salesVariance.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <StyledCardHeader title="Sales Variance Analysis" />
              <CardContent>
                <Typography variant="h6" color={warningColor} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning sx={{ mr: 1 }} /> Significant Sales Variances
                  <Tooltip title="Items with notable differences between 'Total Count' and 'Sold Count'. Investigate potential issues in inventory management or sales tracking.">
                    <Lightbulb color="info" sx={{ ml: 1, fontSize: 'small' }} />
                  </Tooltip>
                </Typography>
                <TextField
                  label="Filter Items"
                  variant="outlined"
                  size="small"
                  fullWidth
                  margin="dense"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="inherit" />
                      </InputAdornment>
                    ),
                  }}
                  value={varianceSearchTerm}
                  onChange={(e) => setVarianceSearchTerm(e.target.value)}
                />
                <TableContainer component={Paper} elevation={1}>
                  <Table size="small" aria-label="sales variance table">
                    <TableHead sx={{ backgroundColor: warningColor }}>
                      <TableRow>
                        <StyledTableCell sx={{ fontWeight: 'bold', color: theme.palette.warning.contrastText }}>Item</StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.warning.contrastText }}>Total Count</StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.warning.contrastText }}>Sold Count</StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.warning.contrastText }}>Variance</StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.warning.contrastText }}>Variance (%)</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedVariance.map((item, index) => (
                        <StyledTableRow key={item.name} iseven={index % 2 === 0}>
                          <StyledTableCell component="th" scope="row">{item.name}</StyledTableCell>
                          <StyledTableCell align="right">{item.totalCount}</StyledTableCell>
                          <StyledTableCell align="right">{item.soldCount}</StyledTableCell>
                          <StyledTableCell align="right">{item.variance}</StyledTableCell>
                          <StyledTableCell align="right">{item.variancePercentage.toFixed(2)}%</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EnhancedUTPUpdate;