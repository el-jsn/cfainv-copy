import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";
import axiosInstance from "./axiosInstance";
import {
  Container,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  Collapse,
  InputAdornment,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue, green } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: blue,
    secondary: green,
    background: {
      default: "#f0f8ff", // Light blue background
      paper: "#fff",
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

const MessageFormComponent = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    day: "Monday",
    product: "Nuggets",
    message: {
      casesOperation: "+",
      casesQuantity: "",
      bagsOperation: "+",
      bagsQuantity: "",
    },
    duration: { value: "", unit: "days" },
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (
      (!formData.message.casesQuantity && !formData.message.bagsQuantity) ||
      (isNaN(formData.message.casesQuantity) && isNaN(formData.message.bagsQuantity))
    ) {
      errors.quantity = "Please enter a valid quantity for cases or bags";
    }
    if (!formData.duration.value || isNaN(formData.duration.value)) {
      errors.duration = "Please enter a valid duration";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const durationInSeconds =
      formData.duration.unit === "weeks"
        ? formData.duration.value * 7 * 24 * 60 * 60
        : formData.duration.value * 24 * 60 * 60;

    const messageString = [
      formData.message.casesQuantity
        ? `${formData.message.casesOperation}${formData.message.casesQuantity} cases`
        : null,
      formData.message.bagsQuantity
        ? `${formData.message.bagsOperation}${formData.message.bagsQuantity} bags`
        : null,
    ]
      .filter(Boolean)
      .join(" and ");

    const dataToSend = {
      day: formData.day,
      product: formData.product,
      message: messageString,
      durationInSeconds,
    };

    try {
      await axiosInstance.post("/adjustment/data", dataToSend);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/data/message/all");
      }, 2000);
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const generateSummary = () => {
    const casesText = formData.message.casesQuantity
      ? `${formData.message.casesOperation}${formData.message.casesQuantity} cases`
      : "";
    const bagsText = formData.message.bagsQuantity
      ? `${formData.message.bagsOperation}${formData.message.bagsQuantity} bags`
      : "";
    const adjustmentText = [casesText, bagsText].filter(Boolean).join(" and ");

    const futureDate = new Date();
    const daysToAdd =
      formData.duration.unit === "weeks"
        ? formData.duration.value * 7
        : formData.duration.value;
    futureDate.setDate(futureDate.getDate() + parseInt(daysToAdd || 0));
    const formattedDate = futureDate.toDateString();

    return `On ${formData.day}, ${adjustmentText} of ${formData.product} would be adjusted and displayed until ${formattedDate}.`;
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
        <Container maxWidth="md">
          <Collapse in={showSuccess}>
            <Alert
              icon={<CheckCircle />}
              severity="success"
              sx={{ mb: 2 }}
            >
              Modification successful. Redirecting...
            </Alert>
          </Collapse>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Package color={theme.palette.primary.main} />
              <Typography variant="h5" component="h2">
                Modify Allocation
              </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="day-label">Day of the Week</InputLabel>
                <Select
                  labelId="day-label"
                  id="day"
                  value={formData.day}
                  label="Day of the Week"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, day: e.target.value }))
                  }
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                    (day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="product-label">Product</InputLabel>
                <Select
                  labelId="product-label"
                  id="product"
                  value={formData.product}
                  label="Product"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      product: e.target.value,
                    }))
                  }
                >
                  {["Nuggets", "Filets", "Spicy Filets", "Grilled Filets", "Grilled Nuggets", "Spicy Strips"].map(
                    (product) => (
                      <MenuItem key={product} value={product}>
                        {product}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Adjustment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cases Quantity"
                    type="number"
                    variant="outlined"
                    value={formData.message.casesQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: {
                          ...prev.message,
                          casesQuantity: e.target.value,
                        },
                      }))
                    }
                    InputProps={{
                      startAdornment: (
                        <FormControl variant="outlined" size="small">
                          <Select
                            value={formData.message.casesOperation}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                message: {
                                  ...prev.message,
                                  casesOperation: e.target.value,
                                },
                              }))
                            }
                            sx={{ mr: 1, height: '100%' }}
                            variant="standard"
                            disableUnderline
                          >
                            <MenuItem value="+">+</MenuItem>
                            <MenuItem value="-">-</MenuItem>
                          </Select>
                        </FormControl>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bags Quantity"
                    type="number"
                    variant="outlined"
                    value={formData.message.bagsQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: {
                          ...prev.message,
                          bagsQuantity: e.target.value,
                        },
                      }))
                    }
                    InputProps={{
                      startAdornment: (
                        <FormControl variant="outlined" size="small">
                          <Select
                            value={formData.message.bagsOperation}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                message: {
                                  ...prev.message,
                                  bagsOperation: e.target.value,
                                },
                              }))
                            }
                            sx={{ mr: 1, height: '100%' }}
                            variant="standard"
                            disableUnderline
                          >
                            <MenuItem value="+">+</MenuItem>
                            <MenuItem value="-">-</MenuItem>
                          </Select>
                        </FormControl>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              {formErrors.quantity && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {formErrors.quantity}
                </Alert>
              )}
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Duration
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration"
                    type="number"
                    variant="outlined"
                    value={formData.duration.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: { ...prev.duration, value: e.target.value },
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="duration-unit-label">Unit</InputLabel>
                    <Select
                      labelId="duration-unit-label"
                      value={formData.duration.unit}
                      label="Unit"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: { ...prev.duration, unit: e.target.value },
                        }))
                      }
                    >
                      <MenuItem value="days">Days</MenuItem>
                      <MenuItem value="weeks">Weeks</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {formErrors.duration && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {formErrors.duration}
                </Alert>
              )}
              <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: "background.default" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Summary
                </Typography>
                <Typography variant="body2">{generateSummary()}</Typography>
              </Paper>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, py: 1.5 }}
              >
                Modify
              </Button>
            </form>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default MessageFormComponent;