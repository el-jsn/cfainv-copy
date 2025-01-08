import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blueGrey, grey } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: blueGrey, // A sophisticated blue-grey
    secondary: {
      main: "#8bc34a", // A fresh light green accent
    },
    background: {
      default: "#f8f9fa", // Very light grey
      paper: "#fff",
    },
    text: {
      primary: grey[800], // Darker grey for good contrast
      secondary: grey[600],
    },
  },
  typography: {
    fontFamily: "'Nunito', sans-serif", // Clean and readable sans-serif
    h5: {
      fontWeight: 700,
    },
    subtitle1: {
      fontSize: "1rem",
      color: grey[700],
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid ${grey[300]}`, // Subtle border
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
        margin: "normal",
        size: "small",
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: blueGrey[500], // Focused border color
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
        size: "large",
      },
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          borderRadius: 4,
          "&:hover": {
            backgroundColor: blueGrey[700], // Darker hover
            boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiAlert: {
      defaultProps: {
        variant: "outlined",
        severity: "info",
      },
      styleOverrides: {
        root: {
          borderRadius: 4,
          marginBottom: 16,
        },
      },
    },
  },
});

const UpdateSalesProjection = () => {
  const [sales, setSales] = useState({
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  useEffect(() => {
    const fetchSalesProjection = async () => {
      try {
        const response = await axiosInstance.get("/sales");
        const fetchedSales = response.data;

        const sortedSales = fetchedSales.reduce((acc, { day, sales }) => {
          acc[day] = sales;
          return acc;
        }, {});

        setSales((prevSales) => ({
          ...prevSales,
          ...sortedSales,
        }));
      } catch (error) {
        console.error("Error fetching sales projections:", error);
        setMessage("Failed to load initial sales projections.");
        setSeverity("error");
      }
    };
    fetchSalesProjection();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSales((prevSales) => ({
      ...prevSales,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axiosInstance.post("/sales/bulk", sales);
      setMessage("Sales projections updated successfully!");
      setSeverity("success");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error("Error updating sales projections:", error);
      setMessage("Failed to update sales projections. Please try again.");
      setSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={0}> {/* Removed elevation for a flatter look */}
            <Box
              sx={{
                px: { xs: 3, md: 4 },
                pt: { xs: 3, md: 4 },
                pb: 2,
              }}
            >
              <Typography variant="h5" component="h1" gutterBottom>
                Sales Projection
              </Typography>
              <Typography variant="subtitle1">
                Enter your estimated sales for the week.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ px: { xs: 3, md: 4 }, pb: { xs: 3, md: 4 } }}>
              <Grid container spacing={2}>
                {Object.keys(sales).map((day) => (
                  <Grid item xs={12} sm={6} key={day}>
                    <TextField
                      label={day}
                      name={day}
                      value={sales[day]}
                      onChange={handleChange}
                      type="number"
                      InputProps={{
                        startAdornment: "$",
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              <Button
                type="submit"
                disabled={loading}
                fullWidth
                sx={{ mt: 3, py: 1.5 }}
                color="primary"
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update Projections"
                )}
              </Button>

              {message && (
                <Alert severity={severity} sx={{ mt: 2 }}>
                  {message}
                </Alert>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default UpdateSalesProjection;