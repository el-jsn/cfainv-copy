import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { blueGrey } from "@mui/material/colors";
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from 'prop-types';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone to Toronto
dayjs.tz.setDefault("America/Toronto");

const FutureProjectionsCalendar = ({ onProjectionChange }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState("success");
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [projectionAmount, setProjectionAmount] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [projections, setProjections] = useState({});
    const [viewMonth, setViewMonth] = useState(dayjs());

    useEffect(() => {
        fetchProjections();
    }, []);

    const fetchProjections = async () => {
        try {
            const response = await axiosInstance.get("/projections/future");
            if (response.data) {
                const projectionsMap = response.data.reduce((acc, proj) => {
                    // Convert the date to local time
                    const date = dayjs(proj.date).format('YYYY-MM-DD');
                    acc[date] = proj.amount;
                    return acc;
                }, {});
                setProjections(projectionsMap);
                // Call the callback to update upcoming changes
                onProjectionChange?.();
            }
        } catch (error) {
            console.error("Error fetching projections:", error);
            setMessage("Failed to load projections");
            setSeverity("error");
        }
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setProjectionAmount(projections[date.format('YYYY-MM-DD')] || "");
        setOpenDialog(true);
    };

    const handleAddProjection = async () => {
        if (!selectedDate || !projectionAmount) return;

        try {
            setLoading(true);
            const date = selectedDate.format('YYYY-MM-DD');

            await axiosInstance.post("/projections/future", {
                date,
                amount: parseFloat(projectionAmount)
            });

            await fetchProjections();
            setMessage("Sales projection added successfully!");
            setSeverity("success");
            setOpenDialog(false);
            setProjectionAmount("");
        } catch (error) {
            console.error("Error adding projection:", error);
            setMessage("Failed to add projection");
            setSeverity("error");
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (newMonth) => {
        setViewMonth(newMonth);
    };

    const getDateStyle = (date) => {
        const dateStr = date.format('YYYY-MM-DD');
        if (projections[dateStr]) {
            return {
                backgroundColor: blueGrey[100],
                borderRadius: '50%',
                color: blueGrey[900],
                position: 'relative',
            };
        }
        return {};
    };

    const handleDeleteProjection = async (date) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`/projections/future/${date}`);
            await fetchProjections();
            setMessage("Projection deleted successfully!");
            setSeverity("success");
            setOpenDialog(false);
        } catch (error) {
            console.error("Error deleting projection:", error);
            setMessage("Failed to delete projection");
            setSeverity("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Future Projections
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Click on any date to set or update its sales projection.
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    value={selectedDate}
                    onChange={handleDateClick}
                    minDate={dayjs()}
                    onMonthChange={handleMonthChange}
                    sx={{
                        width: '100%',
                        '& .MuiPickersDay-root': {
                            color: '#1E1E1E',
                            height: '45px',
                            width: '45px',
                            margin: '0px',
                            '&:hover': {
                                backgroundColor: 'rgba(229, 22, 54, 0.1)',
                            },
                            '&.Mui-disabled': {
                                color: '#9e9e9e',
                                opacity: 0.5,
                            },
                            '&.MuiPickersDay-today': {
                                border: 'none',
                                backgroundColor: 'rgba(229, 22, 54, 0.15)',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '4px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    backgroundColor: '#E51636',
                                },
                            },
                        },
                        '& .MuiDayCalendar-weekContainer': {
                            margin: '2px 0',
                            justifyContent: 'space-around',
                            '& > *:first-of-type': {
                                backgroundColor: 'rgba(229, 22, 54, 0.03)',
                                borderRadius: '8px',
                            },
                        },
                        '& .MuiDayCalendar-weekDayLabel': {
                            color: '#666666',
                            margin: '0',
                            width: '45px',
                            height: '45px',
                            lineHeight: '45px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            '&:first-of-type': {
                                color: '#E51636',
                                backgroundColor: 'rgba(229, 22, 54, 0.03)',
                                borderRadius: '8px 8px 0 0',
                            },
                        },
                        '& .MuiDayCalendar-header': {
                            justifyContent: 'space-around',
                            marginBottom: '8px',
                        },
                        '& .MuiPickersCalendarHeader-label': {
                            color: '#1E1E1E',
                            fontWeight: 600,
                        },
                        '& .MuiIconButton-root': {
                            color: '#E51636',
                        },
                    }}
                    slots={{
                        day: (props) => {
                            const dateStr = props.day.format('YYYY-MM-DD');
                            const hasProjection = projections[dateStr];
                            const isToday = props.day.isSame(dayjs(), 'day');
                            const isCurrentViewMonth = props.day.isSame(viewMonth, 'month');
                            const isPreviousMonth = props.day.isBefore(viewMonth, 'month');
                            const isNextMonth = props.day.isAfter(viewMonth, 'month');
                            const isSunday = props.day.day() === 0;

                            return (
                                <Box
                                    onClick={() => handleDateClick(props.day)}
                                    sx={{
                                        ...props.sx,
                                        position: 'relative',
                                        cursor: 'pointer',
                                        borderRadius: '50%',
                                        height: '45px',
                                        width: '45px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        color: !isCurrentViewMonth ? '#9e9e9e' : '#1E1E1E',
                                        opacity: !isCurrentViewMonth ? 0.5 : 1,
                                        ...(hasProjection && {
                                            backgroundColor: 'rgba(229, 22, 54, 0.1)',
                                            boxShadow: '0 0 10px rgba(229, 22, 54, 0.2)',
                                            fontWeight: 600,
                                            opacity: !isCurrentViewMonth ? 0.7 : 1,
                                        }),
                                        ...(isToday && {
                                            backgroundColor: 'rgba(229, 22, 54, 0.15)',
                                            fontWeight: 600,
                                            opacity: 1,
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: '4px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                backgroundColor: '#E51636',
                                            },
                                        }),
                                        ...(isSunday && {
                                            fontWeight: isCurrentViewMonth ? 600 : 400,
                                            color: isCurrentViewMonth ? '#E51636' : '#9e9e9e',
                                        }),
                                        '&:hover': {
                                            backgroundColor: 'rgba(229, 22, 54, 0.15)',
                                            opacity: !isCurrentViewMonth ? 0.7 : 1,
                                        },
                                        pointerEvents: props.disabled ? 'none' : 'auto',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: hasProjection || isToday ? 600 : 400,
                                            fontSize: '0.875rem',
                                            mb: hasProjection ? '14px' : 0,
                                            lineHeight: 1,
                                            opacity: !isCurrentViewMonth ? 0.5 : 1,
                                        }}
                                    >
                                        {props.day.date()}
                                    </Typography>
                                    {hasProjection && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: 'absolute',
                                                bottom: '-10px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                fontSize: '0.7rem',
                                                color: '#E51636',
                                                whiteSpace: 'nowrap',
                                                fontWeight: 600,
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                padding: '1px 4px',
                                                borderRadius: '4px',
                                                boxShadow: '0 1px 3px rgba(229, 22, 54, 0.2)',
                                                zIndex: 1,
                                                opacity: !isCurrentViewMonth ? 0.7 : 1,
                                            }}
                                        >
                                            ${projections[dateStr]}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        },
                    }}
                />
            </LocalizationProvider>

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

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                PaperProps={{
                    sx: {
                        backgroundColor: '#ffffff',
                        color: '#1E1E1E',
                        border: '1px solid rgba(229, 22, 54, 0.12)',
                    }
                }}
            >
                <DialogTitle sx={{
                    color: '#E51636',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>Set Sales Projection for {selectedDate.format('MMM D, YYYY')}</span>
                    {projections[selectedDate.format('YYYY-MM-DD')] && (
                        <IconButton
                            onClick={() => {
                                handleDeleteProjection(selectedDate.format('YYYY-MM-DD'));
                            }}
                            sx={{
                                color: '#E51636',
                                '&:hover': {
                                    backgroundColor: 'rgba(229, 22, 54, 0.05)',
                                }
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Projected Sales Amount"
                        type="number"
                        value={projectionAmount}
                        onChange={(e) => setProjectionAmount(e.target.value)}
                        InputProps={{
                            startAdornment: "$",
                        }}
                        sx={{ mt: 2 }}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        variant="outlined"
                        sx={{
                            color: 'white',
                            borderColor: '#E51636',
                            '&:hover': {
                                borderColor: '#ff1a1a',
                                backgroundColor: 'rgba(229, 22, 54, 0.05)',
                                color: 'red'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleAddProjection} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Save Projection"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// Add prop types
FutureProjectionsCalendar.propTypes = {
    onProjectionChange: PropTypes.func
};

export default FutureProjectionsCalendar; 