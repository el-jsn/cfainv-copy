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
import FutureProjectionsCalendar from "./FutureProjectionsCalendar";

const theme = createTheme({
  palette: {
    primary: {
      main: '#E51636', // Chick-fil-A red
      light: '#ff4060',
      dark: '#b30000',
    },
    secondary: {
      main: '#E51636',
      light: '#ff4060',
      dark: '#b30000',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1E1E1E',
      secondary: '#E51636',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h5: {
      fontWeight: 600,
      color: '#E51636',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    subtitle1: {
      fontSize: '1rem',
      color: '#666666',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(229, 22, 54, 0.1)',
          border: '1px solid rgba(229, 22, 54, 0.12)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
        size: "medium",
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#1E1E1E',
            '& fieldset': {
              borderColor: 'rgba(229, 22, 54, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: '#E51636',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E51636',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            '&.Mui-focused': {
              color: '#E51636',
            },
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
          background: '#E51636',
          fontWeight: 600,
          textTransform: "none",
          boxShadow: '0 2px 8px rgba(229, 22, 54, 0.3)',
          borderRadius: 8,
          '&:hover': {
            background: '#ff1a1a',
            boxShadow: '0 4px 12px rgba(229, 22, 54, 0.4)',
          },
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
      setMessage("Weekly sales projections updated successfully!");
      setSeverity("success");
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
          py: 4,
          px: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom align="center">
              Sales Projections Dashboard
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Weekly Projections Section */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Weekly Projections
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Enter your estimated sales for each day of the week.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
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
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Update Weekly Projections"
                    )}
                  </Button>

                  {message && (
                    <Alert
                      severity={severity}
                      sx={{
                        mt: 2,
                        backgroundColor: severity === 'error' ? 'rgba(229, 22, 54, 0.05)' : 'rgba(229, 22, 54, 0.1)',
                        color: '#1E1E1E',
                        '& .MuiAlert-icon': {
                          color: severity === 'error' ? '#E51636' : '#00b4d8'
                        },
                        border: severity === 'error' ? '1px solid rgba(229, 22, 54, 0.2)' : 'none'
                      }}
                    >
                      {message}
                    </Alert>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Future Projections Section */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ height: '100%' }}>
                <FutureProjectionsCalendar />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default UpdateSalesProjection;