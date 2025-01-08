import React, { useState, useCallback } from "react";
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
} from "@mui/material";
import { CloudUpload, Close, ExpandMore, CheckCircleOutline, Warning, ErrorOutline, Lightbulb } from "@mui/icons-material";
import { styled, useTheme } from "@mui/material/styles";

// Theming and Consistent Styling (Keep these for consistency)
const primaryColor = "#1976d2";
const secondaryColor = "#9c27b0";
const successColor = "#4caf50";
const warningColor = "#ff9800";
const errorColor = "#f44336";
const textColorPrimary = "rgba(0, 0, 0, 0.87)";
const textColorSecondary = "rgba(0, 0, 0, 0.6)";
const backgroundColor = "#f8f9fa";
const tableRowHoverColor = "#f5f5f5"; // Light gray for hover effect
const tableRowEvenColor = "#fafafa";  // Very light gray for even rows

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

// Styled Card Header (Keep this)
const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: primaryColor,
  color: theme.palette.common.white,
  '& .MuiCardHeader-title': {
    fontWeight: 600,
  },
}));

// Styled TableCell for better readability
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: textColorPrimary,
  borderBottom: `1px solid ${theme.palette.divider}`, // Subtle divider between cells
}));

// Styled TableRow for hover and alternating background
const StyledTableRow = styled(TableRow)(({ theme, iseven }) => ({
  '&:hover': {
    backgroundColor: tableRowHoverColor,
  },
  backgroundColor: iseven ? tableRowEvenColor : theme.palette.background.paper,
}));

// Configuration for item categories and their corresponding search terms
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

  const parseExcelData = useCallback((jsonData) => {
    // 1. Extract Metadata (Store, Date, Time)
    const store_name = jsonData[2]["Sales Mix Report - Item Summary"]?.replace("Store: ", "")?.split(",")[0] || "Unknown";
    const report_time = jsonData[1]["__EMPTY_1"] || "Unknown";
    const report_start_date = jsonData[0]["Sales Mix Report - Item Summary"]?.split("through")[0]?.replace("From", "")?.trim() || "Unknown";
    const report_end_date = jsonData[0]["Sales Mix Report - Item Summary"]?.split("through")[1]?.trim() || "Unknown";

    setReportMetadata({
      storeName: store_name,
      reportTime: report_time,
      reportStartDate: report_start_date,
      reportEndDate: report_end_date
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
      let item_name = row['__EMPTY'];
      const row_data = [];
      for (const header_key in header_map) {
        if (header_key in row) {
          row_data.push(row[header_key]);
        }
      }
      if (item_name !== undefined && item_name !== null) {
        data_rows.push({
          'Item Name': item_name,
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
          "Error parsing the Excel file. Please ensure it's a valid .xlsx or .xls file."
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
      setSuccessMessage("UPTs submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to submit UPTs. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: textColorPrimary, fontWeight: 500 }}>
        Your Sales Analysis
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Upload your sales report to calculate Unit Per Transaction (UPT) and gain valuable insights.
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
                  backgroundColor: dragActive ? "#e8f0fe" : theme.palette.background.default,
                  transition: 'background-color 0.3s ease',
                  '&:hover': { backgroundColor: '#e8f0fe' },
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <label htmlFor="file-upload">
                  <Box>
                    <CloudUpload color="primary" sx={{ fontSize: 50, display: "block", margin: "0 auto 15px" }} />
                    <Typography variant="h6" color="text.primary">
                      Drop your sales report here
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      (.xlsx or .xls)
                    </Typography>
                    <Button component="span" variant="contained" color="primary" size="large" sx={{ mt: 2 }}>
                      Browse Files
                    </Button>
                  </Box>
                </label>
                <Input accept=".xlsx, .xls" id="file-upload" type="file" onChange={handleFileChange} />
                {selectedFile && (
                  <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary" noWrap style={{ overflowX: 'hidden', marginRight: theme.spacing(1) }}>
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
              <StyledCardHeader title="Report Information" />
              <CardContent>
                <Typography variant="subtitle1" color={textColorPrimary}>
                  <Box fontWeight="bold" display="inline">Store:</Box> {reportMetadata.storeName}
                </Typography>
                <Typography variant="subtitle1" color={textColorPrimary}>
                  <Box fontWeight="bold" display="inline">Report Time:</Box> {reportMetadata.reportTime}
                </Typography>
                <Typography variant="subtitle1" color={textColorPrimary}>
                  <Box fontWeight="bold" display="inline">Start Date:</Box> {reportMetadata.reportStartDate}
                </Typography>
                <Typography variant="subtitle1" color={textColorPrimary}>
                  <Box fontWeight="bold" display="inline">End Date:</Box> {reportMetadata.reportEndDate}
                </Typography>
              </CardContent>
            </Card>
          )}

          {overallSalesMetrics && (
            <Card elevation={3} sx={{ mt: 3 }}>
              <StyledCardHeader title="Overall Sales Metrics" />
              <CardContent>
                <Typography variant="h6" color={textColorPrimary} gutterBottom>Key Highlights</Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="body1" color={textColorPrimary}>
                  Total Items Sold: <Box fontWeight="bold" display="inline">{overallSalesMetrics.totalSold}</Box>
                </Typography>
                <Typography variant="body1" color={textColorPrimary}>
                  Total Promo Items: <Box fontWeight="bold" display="inline">{overallSalesMetrics.totalPromo}</Box>
                </Typography>
                <Typography variant="body1" color={textColorPrimary}>
                  Total Digital Offers: <Box fontWeight="bold" display="inline">{overallSalesMetrics.totalDigital}</Box>
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {Object.keys(utpData).length > 0 && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <StyledCardHeader
                title="Calculated UPTs"
                action={
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutline />}
                    sx={{ ml: 2 }}
                  >
                    {isLoading ? "Submitting..." : "Submit UPTs"}
                  </Button>
                }
              />
              <CardContent>
                <TableContainer component={Paper} elevation={1}>
                  <Table aria-label="calculated upts table">
                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
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
              <StyledCardHeader title="Sales Analysis Insights" />
              <CardContent>
                {analysisResults.negativeCountItems.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="h6" color={errorColor} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Warning sx={{ mr: 1 }} /> Potential Overstock/Waste
                      <Tooltip title="Items with a negative '# Sold Per 1000' count might indicate overstock or potential waste. Investigate these items for possible adjustments.">
                        <Lightbulb color="info" sx={{ ml: 1, fontSize: 'small' }} />
                      </Tooltip>
                    </Typography>
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small" aria-label="overstock items">
                        <TableHead sx={{ backgroundColor: '#ffebee' }}>
                          <TableRow>
                            <StyledTableCell sx={{ fontWeight: 'bold', color: errorColor }}>Item</StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: errorColor }}>Count (# per 1000 Sold)</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analysisResults.negativeCountItems.map((item, index) => (
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
                      <Warning sx={{ mr: 1 }} /> Potentially Low Performing Items
                      <Tooltip title="Items with low 'Sold Count' might need attention. Consider promotional activities or menu adjustments.">
                        <Lightbulb color="info" sx={{ ml: 1, fontSize: 'small' }} />
                      </Tooltip>
                    </Typography>
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small" aria-label="low sold count items">
                        <TableHead sx={{ backgroundColor: '#fff3e0' }}>
                          <TableRow>
                            <StyledTableCell sx={{ fontWeight: 'bold', color: warningColor }}>Item</StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: warningColor }}>Sold Count</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analysisResults.lowSoldCountItems.map((item, index) => (
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
                      <Lightbulb sx={{ mr: 1 }} /> Items with High Promo Count
                      <Tooltip title="Review items with a high 'Promo Count'. Understand the reasons behind the high promotion usage.">
                        <Lightbulb color="info" sx={{ ml: 1, fontSize: 'small' }} />
                      </Tooltip>
                    </Typography>
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small" aria-label="high promo count items">
                        <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                          <TableRow>
                            <StyledTableCell sx={{ fontWeight: 'bold', color: primaryColor }}>Item</StyledTableCell>
                            <StyledTableCell align="right" sx={{ fontWeight: 'bold', color: primaryColor }}>Promo Count</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analysisResults.highPromoCountItems.map((item, index) => (
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
                  <Accordion elevation={1}>
                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="promo-effectiveness-content" id="promo-effectiveness-header">
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, color: textColorPrimary }}>Promotion Effectiveness Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper} elevation={0}>
                        <Table size="small" aria-label="promotion effectiveness">
                          <TableHead>
                            <TableRow>
                              <StyledTableCell sx={{ fontWeight: 'bold' }}>Item</StyledTableCell>
                              <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>Sold</StyledTableCell>
                              <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>Free (Promo)</StyledTableCell>
                              <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>Digital Offers</StyledTableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analysisResults.promoEffectiveness.map((item, index) => (
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
                <TableContainer component={Paper} elevation={1}>
                  <Table aria-label="sales variance table">
                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                      <TableRow>
                        <StyledTableCell sx={{ fontWeight: 'bold' }}>Item</StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>Variance</StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>Variance %</StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>Total Count</StyledTableCell>
                        <StyledTableCell align="right" sx={{ fontWeight: 'bold' }}>Sold Count</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salesVariance.map((item, index) => (
                        <StyledTableRow key={item.name} iseven={index % 2 === 0}>
                          <StyledTableCell component="th" scope="row">{item.name}</StyledTableCell>
                          <StyledTableCell align="right">{item.variance}</StyledTableCell>
                          <StyledTableCell align="right">{item.variancePercentage.toFixed(2)}%</StyledTableCell>
                          <StyledTableCell align="right">{item.totalCount}</StyledTableCell>
                          <StyledTableCell align="right">{item.soldCount}</StyledTableCell>
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