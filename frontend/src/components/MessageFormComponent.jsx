import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Package, ArrowLeft, Calendar, Clock, Info } from "lucide-react";
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
  Tooltip,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue, green, grey } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: blue[600],
      light: blue[400],
      dark: blue[800],
    },
    secondary: {
      main: green[600],
      light: green[400],
      dark: green[800],
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: {
      fontWeight: 700,
      color: grey[900],
    },
    h6: {
      fontWeight: 600,
      color: grey[800],
    },
    subtitle1: {
      color: grey[700],
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: "0.95rem",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
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
  const [selectedDays, setSelectedDays] = useState([]);

  const getExpiryDate = () => {
    if (!formData.duration.value || isNaN(formData.duration.value)) {
      return null;
    }

    const now = new Date();
    const daysToAdd = formData.duration.unit === "weeks"
      ? formData.duration.value * 7
      : formData.duration.value;

    now.setDate(now.getDate() + parseInt(daysToAdd));
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const handleDayToggle = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
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

    const daysToProcess = selectedDays.length > 0 ? selectedDays : [formData.day];

    try {
      for (const day of daysToProcess) {
        await axiosInstance.post("/adjustment/data", {
          day,
          product: formData.product,
          message: messageString,
          durationInSeconds,
        });
      }
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/data/message/all");
      }, 2000);
    } catch (error) {
      console.error("Error submitting data:", error);
      setFormErrors({ submit: "Failed to submit. Please try again." });
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
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowLeft />}
              onClick={() => navigate("/data/message/all")}
              sx={{ mb: 3 }}
            >
              Back to Modifications
            </Button>

            <Collapse in={showSuccess}>
              <Alert
                icon={<CheckCircle />}
                severity="success"
                sx={{ mb: 3, borderRadius: 2 }}
              >
                Modification created successfully. Redirecting...
              </Alert>
            </Collapse>
          </Box>

          <Paper elevation={0} sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                Create Modification
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Adjust allocation quantities for specific products and days
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar className="w-5 h-5" />
                    Day Selection
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                      <Chip
                        key={day}
                        label={day}
                        onClick={() => handleDayToggle(day)}
                        color={selectedDays.includes(day) ? "primary" : "default"}
                        variant={selectedDays.includes(day) ? "filled" : "outlined"}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDays.length === 0
                      ? "No days selected - modification will apply to the default day"
                      : `Selected ${selectedDays.length} day${selectedDays.length > 1 ? "s" : ""}`}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Package className="w-5 h-5" />
                    Product Details
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Product</InputLabel>
                    <Select
                      value={formData.product}
                      label="Product"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          product: e.target.value,
                        }))
                      }
                    >
                      {[
                        "Nuggets",
                        "Filets",
                        "Spicy Filets",
                        "Grilled Filets",
                        "Grilled Nuggets",
                        "Spicy Strips",
                      ].map((product) => (
                        <MenuItem key={product} value={product}>
                          {product}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl sx={{ width: 80 }}>
                      <InputLabel>Cases</InputLabel>
                      <Select
                        value={formData.message.casesOperation}
                        label="Cases"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            message: {
                              ...prev.message,
                              casesOperation: e.target.value,
                            },
                          }))
                        }
                      >
                        <MenuItem value="+">+</MenuItem>
                        <MenuItem value="-">-</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Cases Quantity"
                      type="number"
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
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl sx={{ width: 80 }}>
                      <InputLabel>Bags</InputLabel>
                      <Select
                        value={formData.message.bagsOperation}
                        label="Bags"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            message: {
                              ...prev.message,
                              bagsOperation: e.target.value,
                            },
                          }))
                        }
                      >
                        <MenuItem value="+">+</MenuItem>
                        <MenuItem value="-">-</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Bags Quantity"
                      type="number"
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
                    />
                  </Box>
                </Grid>

                {formErrors.quantity && (
                  <Grid item xs={12}>
                    <Alert severity="error">{formErrors.quantity}</Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock className="w-5 h-5" />
                    Duration
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration"
                    type="number"
                    value={formData.duration.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: { ...prev.duration, value: e.target.value },
                      }))
                    }
                    error={!!formErrors.duration}
                    helperText={formErrors.duration}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Unit</InputLabel>
                    <Select
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

                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: formData.duration.value ? 2 : 0 }}>
                        <Info className="w-5 h-5 text-blue-500" />
                        <Typography variant="body2" color="text.secondary">
                          This modification will automatically expire after the specified duration.
                        </Typography>
                      </Box>
                      {formData.duration.value && !isNaN(formData.duration.value) && (
                        <Box sx={{
                          mt: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          borderTop: 1,
                          borderColor: 'divider',
                          pt: 2
                        }}>
                          <Calendar className="w-5 h-5 text-indigo-500" />
                          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                            Expires on: {getExpiryDate()}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Grid>

                {formErrors.submit && (
                  <Grid item xs={12}>
                    <Alert severity="error">{formErrors.submit}</Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                    >
                      Create Modification
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default MessageFormComponent;