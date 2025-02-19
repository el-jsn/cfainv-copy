import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    Typography,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import EditIcon from '@mui/icons-material/Edit';
import { format, eachDayOfInterval, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TruckItems = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [truckItems, setTruckItems] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState({
        description: '',
        uom: '',
        totalUnits: 0,
        unitType: '',
        cost: '',
        associatedItems: []
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [salesMixItems, setSalesMixItems] = useState([]);
    const [salesMixData, setSalesMixData] = useState({});
    const [salesProjections, setSalesProjections] = useState({});
    const [futureProjections, setFutureProjections] = useState({});
    const [startDate, setStartDate] = useState(startOfWeek(new Date()));
    const [endDate, setEndDate] = useState(endOfWeek(new Date()));
    const [dateRange, setDateRange] = useState([startOfWeek(new Date()), endOfWeek(new Date())]);
    const [expandedRows, setExpandedRows] = useState({});
    const [openBulkDialog, setOpenBulkDialog] = useState(false);
    const [bulkInput, setBulkInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef();
    const [associatedItemSearch, setAssociatedItemSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [salesMixUploadDate, setSalesMixUploadDate] = useState(null);
    const [salesMixReportingPeriod, setSalesMixReportingPeriod] = useState({
        startDate: '',
        endDate: ''
    });
    const [reportMetadata, setReportMetadata] = useState({
        storeName: "Unknown",
        reportTime: "Unknown",
        reportStartDate: "Unknown",
        reportEndDate: "Unknown"
    });

    // Add useEffect hooks for data fetching
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([
                    fetchSalesProjections(),
                    fetchFutureProjections(),
                    fetchTruckItems()
                ]);
            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError('Failed to fetch initial data. Please try refreshing the page.');
            }
        };

        if (user) {
            fetchInitialData();
        }
    }, [user]);

    // Add useEffect to refetch data when date range changes
    useEffect(() => {
        if (user && dateRange[0] && dateRange[1]) {
            fetchSalesProjections();
            fetchFutureProjections();
        }
    }, [dateRange, user]);

    // Fetch current sales mix data on component mount
    useEffect(() => {
        const fetchSalesMixData = async () => {
            try {
                const response = await axiosInstance.get('/salesmix/current');
                setSalesMixData(response.data.data);
                setSalesMixItems(Object.keys(response.data.data));
                setSalesMixUploadDate(new Date(response.data.uploadDate));
                setSalesMixReportingPeriod(response.data.reportingPeriod);
            } catch (error) {
                if (error.response?.status !== 404) {
                    setError('Error fetching sales mix data');
                }
            }
        };

        fetchSalesMixData();
    }, []);

    const parseUOM = (uom) => {
        // Get everything before the first space
        const [numberPart, ...rest] = uom.split(' ');
        const unitPart = rest.join(' ');

        // If it contains a slash, multiply the numbers
        if (numberPart.includes('/')) {
            const [num1, num2] = numberPart.split('/').map(Number);
            return {
                totalUnits: num1 * num2,
                unitType: 'ct'  // Default to 'ct' for now
            };
        }

        // If it's just a number, use that
        const totalUnits = Number(numberPart);
        if (!isNaN(totalUnits)) {
            return {
                totalUnits: totalUnits,
                unitType: 'ct'  // Default to 'ct' for now
            };
        }

        return null;
    };

    const parseExcelData = useCallback(async (jsonData) => {
        try {
            // Log the first few rows to understand the structure
            console.log('First few rows of data:', jsonData.slice(0, 10));

            // Extract reporting period from the Excel file
            const reportPeriod = jsonData[0]?.['Sales Mix Report - Item Summary'];
            if (!reportPeriod) {
                throw new Error('Could not find report period in the Excel file');
            }
            console.log('Report period raw:', reportPeriod);

            // Parse the date range using the full string
            const fullDateString = reportPeriod.replace('From ', '');
            const [startDateFull, endDateFull] = fullDateString.split(' through ');

            if (!startDateFull || !endDateFull) {
                throw new Error('Could not parse date range from report header');
            }

            // Set the reporting period with the full date strings
            setSalesMixReportingPeriod({
                startDate: startDateFull.trim(),
                endDate: endDateFull.trim()
            });

            // Clean and Structure Data
            const data_rows = [];
            for (const row_index in jsonData) {
                const row = jsonData[row_index];
                // Skip header rows and summary rows
                if (row_index < 7 || [41, 42, 43, 44, 45, 553, 554, 555, 556, 557, 772, 773, 774, 775, 776, 961, 962, 963, 964, 965, 1074, 1075, 1076, 1077, 1078, 1363, 1364].includes(parseInt(row_index))) {
                    continue;
                }

                // Check if this is a valid item row
                const itemName = row['__EMPTY'];
                const soldPer1000 = row['__EMPTY_17'];

                if (itemName && typeof soldPer1000 !== 'undefined') {
                    console.log('Processing row:', { itemName, soldPer1000 });
                    data_rows.push({
                        'Item Name': itemName,
                        '# Sold Per 1000': soldPer1000 || 0
                    });
                }
            }

            if (data_rows.length === 0) {
                throw new Error('No valid data rows found in the Excel file');
            }

            // Convert to the format we need
            const processedData = {};
            data_rows.forEach(row => {
                if (row['Item Name'] && row['# Sold Per 1000']) {
                    const value = parseFloat(row['# Sold Per 1000']);
                    if (!isNaN(value)) {
                        processedData[row['Item Name']] = value;
                    }
                }
            });

            if (Object.keys(processedData).length === 0) {
                throw new Error('No valid items found after processing');
            }

            console.log('Processed data sample:', Object.entries(processedData).slice(0, 5));

            // Include reporting period in the upload
            const response = await axiosInstance.post('/salesmix/upload', {
                data: processedData,
                reportingPeriod: {
                    startDate: startDateFull.trim(),
                    endDate: endDateFull.trim()
                }
            });

            return processedData;
        } catch (error) {
            console.error('Error in parseExcelData:', error);
            throw new Error(`Failed to parse Excel file: ${error.message}`);
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                try {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const data = new Uint8Array(e.target.result);
                            const workbook = XLSX.read(data, { type: 'array' });
                            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                            const response = await parseExcelData(jsonData);
                            setSalesMixData(response);
                            setSalesMixItems(Object.keys(response));
                            setSalesMixUploadDate(new Date());
                            setSuccess('Sales mix data uploaded successfully');
                        } catch (error) {
                            console.error('Error processing file:', error);
                            setError(error.message || 'Error processing sales mix file. Please ensure it is a valid sales mix report.');
                        }
                    };
                    reader.readAsArrayBuffer(file);
                } catch (error) {
                    console.error('Error reading file:', error);
                    setError('Error reading sales mix file');
                }
            }
        }
    });

    // Update fetchSalesProjections
    const fetchSalesProjections = async () => {
        try {
            const response = await axiosInstance.get('/sales');
            const projectionsByDay = {};
            response.data.forEach(projection => {
                if (projection.day && projection.sales) {
                    projectionsByDay[projection.day] = Number(projection.sales);
                }
            });
            setSalesProjections(projectionsByDay);
        } catch (err) {
            console.error('Error fetching sales projections:', err);
            setError('Failed to fetch sales projections');
        }
    };

    // Update fetchFutureProjections
    const fetchFutureProjections = async () => {
        try {
            const response = await axiosInstance.get('/projections/future');
            const projections = {};
            response.data.forEach(proj => {
                const date = new Date(proj.date);
                const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                const dateStr = localDate.toISOString().split('T')[0];
                projections[dateStr] = proj.amount;
            });
            setFutureProjections(projections);
        } catch (err) {
            console.error('Error fetching future projections:', err);
            setError('Failed to fetch future projections');
        }
    };

    // Update fetchTruckItems
    const fetchTruckItems = async () => {
        try {
            if (!user) {
                setError('Please log in to view truck items.');
                navigate('/login');
                return;
            }

            const response = await axiosInstance.get('/truck-items');
            setTruckItems(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching truck items:', err);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
                navigate('/login');
            } else {
                setError('Failed to fetch truck items. Please try again.');
            }
            setTruckItems([]);
        }
    };

    // Update handleSaveItem
    const handleSaveItem = async () => {
        try {
            if (!user) {
                setError('Please log in to save items.');
                navigate('/login');
                return;
            }

            // Validate required fields
            if (!currentItem.description) {
                setError('Description is required');
                return;
            }

            if (!currentItem.uom) {
                setError('UOM is required');
                return;
            }

            if (!currentItem.totalUnits || currentItem.totalUnits <= 0) {
                setError('Total units must be greater than 0');
                return;
            }

            if (!currentItem.unitType) {
                setError('Unit type is required');
                return;
            }

            if (!currentItem.cost || currentItem.cost <= 0) {
                setError('Cost must be greater than 0');
                return;
            }

            // Validate associated items if they exist
            if (currentItem.associatedItems && currentItem.associatedItems.length > 0) {
                for (const item of currentItem.associatedItems) {
                    if (!item.name) {
                        setError('All associated items must have a name');
                        return;
                    }
                    if (!item.usage || item.usage <= 0) {
                        setError('All associated items must have a usage amount greater than 0');
                        return;
                    }
                }
            }

            const itemData = {
                description: currentItem.description,
                uom: currentItem.uom,
                totalUnits: Number(currentItem.totalUnits),
                unitType: currentItem.unitType,
                cost: Number(currentItem.cost),
                associatedItems: currentItem.associatedItems || []
            };

            if (currentItem._id) {
                await axiosInstance.put(`/truck-items/${currentItem._id}`, itemData);
            } else {
                await axiosInstance.post('/truck-items', itemData);
            }

            setSuccess('Item saved successfully');
            setOpenDialog(false);
            fetchTruckItems();
        } catch (err) {
            console.error('Error saving item:', err);
            if (err.response?.data?.message) {
                setError(`Failed to save item: ${err.response.data.message}`);
            } else if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
                navigate('/login');
            } else {
                setError('Failed to save item. Please ensure all fields are filled correctly.');
            }
        }
    };

    // Update handleDeleteItem
    const handleDeleteItem = async (id) => {
        try {
            if (!user) {
                setError('Please log in to delete items.');
                navigate('/login');
                return;
            }

            await axiosInstance.delete(`/truck-items/${id}`);

            // Immediately update the UI
            setTruckItems(prevItems => prevItems.filter(item => item._id !== id));
            setSearchResults(prevResults => prevResults.filter(item => item._id !== id));

            setSuccess('Item deleted successfully');
        } catch (err) {
            console.error('Error deleting item:', err);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
                navigate('/login');
            } else {
                setError('Failed to delete item. Please try again.');
            }
        }
    };

    const handleUOMChange = (e) => {
        const uomValue = e.target.value;
        setCurrentItem({
            ...currentItem,
            uom: uomValue
        });

        // Only try to parse if the value matches our expected formats
        const parsed = parseUOM(uomValue);
        if (parsed) {
            setCurrentItem(prev => ({
                ...prev,
                uom: uomValue,
                totalUnits: parsed.totalUnits,
                unitType: parsed.unitType
            }));
        }
    };

    const calculateUsage = (item, salesMix, dateRange) => {
        if (!item.associatedItems || item.associatedItems.length === 0) {
            return {
                casesNeeded: 0,
                projectedSales: 0,
                exactCases: 0
            };
        }

        let totalUsage = 0;
        let projectedSales = 0;

        if (dateRange[0] && dateRange[1]) {
            const days = eachDayOfInterval({
                start: startOfDay(dateRange[0]),
                end: endOfDay(dateRange[1])
            });

            projectedSales = days.reduce((sum, date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                if (futureProjections[dateStr]) {
                    return sum + Number(futureProjections[dateStr]);
                }
                const dayName = format(date, 'EEEE');
                return sum + Number(salesProjections[dayName] || 0);
            }, 0);
        }

        item.associatedItems.forEach(assoc => {
            const upt = salesMix[assoc.name] || 0;
            const rawUsage = (upt * projectedSales * assoc.usage) / 1000;
            totalUsage += rawUsage;
        });

        const exactCases = totalUsage / item.totalUnits;
        const casesNeeded = Math.ceil(exactCases);

        return {
            casesNeeded,
            projectedSales,
            exactCases
        };
    };

    // Add useEffect to log sales projections when they change
    useEffect(() => {
        console.log('Sales Projections Updated:', salesProjections);
    }, [salesProjections]);

    const handleAddItem = () => {
        setCurrentItem({
            description: '',
            uom: '',
            totalUnits: 0,
            unitType: '',
            cost: '',
            associatedItems: []
        });
        setSelectedItems(new Set());
        setOpenDialog(true);
    };

    const handleAssociatedItemSelect = (itemName) => {
        const newSelectedItems = new Set(selectedItems);
        if (newSelectedItems.has(itemName)) {
            newSelectedItems.delete(itemName);
            setCurrentItem({
                ...currentItem,
                associatedItems: currentItem.associatedItems.filter(item => item.name !== itemName)
            });
        } else {
            newSelectedItems.add(itemName);
            setCurrentItem({
                ...currentItem,
                associatedItems: [
                    ...currentItem.associatedItems,
                    {
                        name: itemName,
                        usage: 1,
                        unit: currentItem.unitType || 'ct'
                    }
                ]
            });
        }
        setSelectedItems(newSelectedItems);
    };

    const handleAssociatedItemChange = (index, field, value) => {
        const newAssociatedItems = [...currentItem.associatedItems];
        newAssociatedItems[index] = {
            ...newAssociatedItems[index],
            [field]: value,
            unit: currentItem.unitType || 'ct'  // Always ensure unit is set
        };
        setCurrentItem({
            ...currentItem,
            associatedItems: newAssociatedItems
        });
    };

    const handleRemoveAssociatedItem = (index) => {
        const newAssociatedItems = currentItem.associatedItems.filter((_, i) => i !== index);
        setCurrentItem({
            ...currentItem,
            associatedItems: newAssociatedItems
        });
    };

    const toggleRowExpansion = (itemId) => {
        setExpandedRows(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleBulkImport = async () => {
        try {
            const lines = bulkInput.trim().split('\n');
            const items = [];

            for (const line of lines) {
                const [description, uom, cost] = line.split('\t');
                if (description && uom && cost) {
                    const parsed = parseUOM(uom);
                    if (parsed) {
                        items.push({
                            description: description.trim(),
                            uom: uom.trim(),
                            totalUnits: parsed.totalUnits,
                            unitType: parsed.unitType,
                            cost: Number(cost.trim()),
                            associatedItems: []
                        });
                    }
                }
            }

            // Save all items
            for (const item of items) {
                await axiosInstance.post('/truck-items', item);
            }

            setSuccess(`Successfully imported ${items.length} items`);
            setOpenBulkDialog(false);
            setBulkInput('');
            fetchTruckItems();
        } catch (err) {
            console.error('Error importing items:', err);
            setError('Failed to import items. Please check your input format.');
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const results = truckItems.filter(item => {
            const matchesDescription = item.description.toLowerCase().includes(query.toLowerCase());
            const matchesUOM = item.uom.toLowerCase().includes(query.toLowerCase());
            const matchesAssociatedItems = item.associatedItems.some(assoc =>
                assoc.name.toLowerCase().includes(query.toLowerCase())
            );

            // Prioritize matches in truck item description
            if (matchesDescription) return true;
            if (matchesUOM) return true;
            return matchesAssociatedItems;
        });

        setSearchResults(results);
    };

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
        searchRef.current.style.display = "none";
    };

    const handleSearchBlur = () => {
        setIsSearchFocused(false);
        searchRef.current.style.display = "block";
    };

    // Filter function for associated items search
    const filteredSalesMixItems = salesMixItems.filter(name =>
        name.toLowerCase().includes(associatedItemSearch.toLowerCase())
    );

    return (
        <Box sx={{
            padding: '32px',
            backgroundColor: '#f8fafc',
            minHeight: '100vh'
        }}>
            <Box sx={{
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Header Section */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    backgroundColor: 'white',
                    p: 4,
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                }}>
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 600,
                                color: '#0f172a',
                                mb: 1
                            }}
                        >
                            Truck Order Calculator
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#64748b',
                                fontSize: '1.1rem'
                            }}
                        >
                            Manage your truck items and calculate order quantities
                        </Typography>
                        {salesMixReportingPeriod && (
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#64748b',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Sales Mix Period: {salesMixReportingPeriod.startDate} through {salesMixReportingPeriod.endDate}
                                </Typography>
                                {salesMixUploadDate && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#64748b',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Last Updated: {format(salesMixUploadDate, 'MMM d, yyyy h:mm a')}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenBulkDialog(true)}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                px: 3,
                                py: 1.5,
                                borderColor: '#e2e8f0',
                                color: '#64748b',
                                '&:hover': {
                                    borderColor: '#cbd5e1',
                                    backgroundColor: '#f8fafc'
                                }
                            }}
                        >
                            Bulk Import
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAddItem}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                px: 3,
                                py: 1.5,
                                backgroundColor: '#0284c7',
                                '&:hover': {
                                    backgroundColor: '#0369a1'
                                }
                            }}
                        >
                            Add Truck Item
                        </Button>
                    </Box>
                </Box>

                {/* Controls Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: '16px',
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    }}
                >
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 4,
                        alignItems: 'start'
                    }}>
                        {/* Upload Box */}
                        <Box>
                            <Box
                                {...getRootProps()}
                                sx={{
                                    border: '2px dashed #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: '#f8fafc',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                    '&:hover': {
                                        borderColor: '#0284c7',
                                        backgroundColor: '#f0f9ff'
                                    }
                                }}
                            >
                                <input {...getInputProps()} />
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 16.2091 19.2091 18 17 18H7C4.79086 18 3 16.2091 3 14C3 11.7909 4.79086 10 7 10Z" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 12L12 15" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 14L12 12L14 14" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <Box>
                                    <Typography
                                        sx={{
                                            color: '#0f172a',
                                            fontSize: '1.1rem',
                                            fontWeight: 500,
                                            mb: 1
                                        }}
                                    >
                                        Upload Sales Mix Excel File
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: '#64748b',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        Drag and drop your file here, or click to select
                                    </Typography>
                                </Box>
                            </Box>
                            {salesMixUploadDate && (
                                <Box sx={{
                                    mt: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    justifyContent: 'center'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 8V12L15 15" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#64748b" strokeWidth="2" />
                                    </svg>
                                    <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                                        Last updated: {format(salesMixUploadDate, 'MMM d, yyyy h:mm a')}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Date Range Picker */}
                        <Box sx={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            p: 4,
                            border: '1px solid #e2e8f0'
                        }}>
                            <Typography
                                sx={{
                                    color: '#0f172a',
                                    fontSize: '1.1rem',
                                    fontWeight: 500,
                                    mb: 3
                                }}
                            >
                                Select Date Range
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: 3
                            }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        sx={{
                                            color: '#64748b',
                                            fontSize: '0.9rem',
                                            mb: 1
                                        }}
                                    >
                                        Start Date
                                    </Typography>
                                    <input
                                        type="date"
                                        value={format(startDate, 'yyyy-MM-dd')}
                                        onChange={(e) => {
                                            const date = parseISO(e.target.value);
                                            setStartDate(date);
                                            setDateRange([date, endDate]);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.875rem',
                                            color: '#0f172a',
                                            backgroundColor: '#ffffff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            outline: 'none',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#0284c7'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </Box>
                                <Box sx={{
                                    color: '#64748b',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    padding: '0 8px'
                                }}>
                                    to
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        sx={{
                                            color: '#64748b',
                                            fontSize: '0.9rem',
                                            mb: 1
                                        }}
                                    >
                                        End Date
                                    </Typography>
                                    <input
                                        type="date"
                                        value={format(endDate, 'yyyy-MM-dd')}
                                        min={format(startDate, 'yyyy-MM-dd')}
                                        onChange={(e) => {
                                            const date = parseISO(e.target.value);
                                            setEndDate(date);
                                            setDateRange([startDate, date]);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.875rem',
                                            color: '#0f172a',
                                            backgroundColor: '#ffffff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            outline: 'none',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#0284c7'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </Box>
                            </Box>
                            {startDate && endDate && (
                                <Box sx={{
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '8px',
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Typography sx={{
                                        color: '#0369a1',
                                        fontSize: '0.95rem',
                                        fontWeight: 500
                                    }}>
                                        Total Sales:
                                    </Typography>
                                    <Typography sx={{
                                        color: '#0c4a6e',
                                        fontSize: '0.95rem',
                                        fontWeight: 600
                                    }}>
                                        {eachDayOfInterval({
                                            start: startOfDay(startDate),
                                            end: endOfDay(endDate)
                                        }).reduce((sum, date) => {
                                            const dateStr = format(date, 'yyyy-MM-dd');
                                            if (futureProjections[dateStr]) {
                                                return sum + Number(futureProjections[dateStr]);
                                            }
                                            const dayName = format(date, 'EEEE');
                                            return sum + Number(salesProjections[dayName] || 0);
                                        }, 0).toLocaleString()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Paper>

                {/* Search Bar */}
                <Box sx={{ mb: 4 }}>
                    <div className="relative w-full">
                        <div className="absolute top-3 left-3 items-center" ref={searchRef}>
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full p-3 pl-10 text-gray-900 bg-white rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200 focus:pl-3"
                            placeholder="Search by description, UOM, or associated items..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={handleSearchFocus}
                            onBlur={handleSearchBlur}
                        />
                        {searchQuery && (
                            <div className="absolute right-3 top-3">
                                <button
                                    onClick={() => handleSearch('')}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </Box>

                {/* Alerts */}
                <Box sx={{ mb: 3 }}>
                    {error && (
                        <Alert
                            severity="error"
                            onClose={() => setError('')}
                            sx={{
                                borderRadius: '12px',
                                mb: 2,
                                '& .MuiAlert-icon': {
                                    color: '#dc2626'
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert
                            severity="success"
                            onClose={() => setSuccess('')}
                            sx={{
                                borderRadius: '12px',
                                mb: 2,
                                '& .MuiAlert-icon': {
                                    color: '#16a34a'
                                }
                            }}
                        >
                            {success}
                        </Alert>
                    )}
                </Box>

                {/* Table Section */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'white'
                    }}
                >
                    <TableContainer>
                        <Table>
                            <TableBody>
                                {Array.isArray(searchQuery ? searchResults : truckItems) && (searchQuery ? searchResults : truckItems).length > 0 ? (
                                    (searchQuery ? searchResults : truckItems).map((item, index) => {
                                        const usage = calculateUsage(item, salesMixData, dateRange);
                                        return (
                                            <React.Fragment key={item._id}>
                                                {/* Main Row */}
                                                <TableRow
                                                    sx={{
                                                        borderLeft: '4px solid transparent',
                                                        transition: 'all 0.2s ease-in-out',
                                                        '&:hover': {
                                                            backgroundColor: '#F8FAFC',
                                                            borderLeft: '4px solid #0284c7',
                                                            '& .row-actions': {
                                                                opacity: 1,
                                                                transform: 'translateX(0)',
                                                                visibility: 'visible'
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {/* Description Column */}
                                                    <TableCell
                                                        sx={{
                                                            py: 3,
                                                            width: '30%',
                                                            borderBottom: '1px solid #e2e8f0'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                            <Box
                                                                sx={{
                                                                    backgroundColor: '#f1f5f9',
                                                                    borderRadius: '8px',
                                                                    p: 2,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </Box>
                                                            <Box>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '1rem',
                                                                        fontWeight: 600,
                                                                        color: '#0f172a',
                                                                        mb: 0.5
                                                                    }}
                                                                >
                                                                    {item.description}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: '0.875rem',
                                                                            color: '#64748b'
                                                                        }}
                                                                    >
                                                                        {item.uom}
                                                                    </Typography>
                                                                    <Box
                                                                        sx={{
                                                                            width: '4px',
                                                                            height: '4px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: '#cbd5e1'
                                                                        }}
                                                                    />
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: '0.875rem',
                                                                            color: '#047857',
                                                                            fontWeight: 500
                                                                        }}
                                                                    >
                                                                        ${item.cost.toFixed(2)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Associated Items Column */}
                                                    <TableCell
                                                        sx={{
                                                            py: 3,
                                                            width: '35%',
                                                            borderBottom: '1px solid #e2e8f0'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.875rem',
                                                                        color: '#64748b',
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    Associated Items
                                                                </Typography>
                                                                <Box
                                                                    sx={{
                                                                        backgroundColor: '#f1f5f9',
                                                                        borderRadius: '6px',
                                                                        px: 1.5,
                                                                        py: 0.5
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: '0.75rem',
                                                                            color: '#475569',
                                                                            fontWeight: 500
                                                                        }}
                                                                    >
                                                                        {item.associatedItems.length} items
                                                                    </Typography>
                                                                </Box>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => toggleRowExpansion(item._id)}
                                                                    sx={{
                                                                        transform: expandedRows[item._id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                        transition: 'transform 0.2s',
                                                                        color: '#64748b',
                                                                        p: 0.5
                                                                    }}
                                                                >
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </IconButton>
                                                            </Box>
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    gap: 1,
                                                                    flexWrap: 'wrap'
                                                                }}
                                                            >
                                                                {item.associatedItems.slice(0, expandedRows[item._id] ? undefined : 2).map((assoc, idx) => (
                                                                    <Box
                                                                        key={idx}
                                                                        sx={{
                                                                            backgroundColor: salesMixData[assoc.name] ? '#f0fdf4' : '#fef2f2',
                                                                            border: `1px solid ${salesMixData[assoc.name] ? '#bbf7d0' : '#fecaca'}`,
                                                                            borderRadius: '6px',
                                                                            px: 1.5,
                                                                            py: 0.5,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            sx={{
                                                                                fontSize: '0.75rem',
                                                                                color: salesMixData[assoc.name] ? '#166534' : '#991b1b',
                                                                                fontWeight: 500
                                                                            }}
                                                                        >
                                                                            {assoc.name}
                                                                        </Typography>
                                                                        {salesMixData[assoc.name] && (
                                                                            <Box
                                                                                sx={{
                                                                                    backgroundColor: '#dcfce7',
                                                                                    borderRadius: '4px',
                                                                                    px: 1,
                                                                                    py: 0.25
                                                                                }}
                                                                            >
                                                                                <Typography
                                                                                    sx={{
                                                                                        fontSize: '0.75rem',
                                                                                        color: '#166534'
                                                                                    }}
                                                                                >
                                                                                    UPT: {salesMixData[assoc.name].toFixed(2)}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                ))}
                                                                {!expandedRows[item._id] && item.associatedItems.length > 2 && (
                                                                    <Box
                                                                        sx={{
                                                                            backgroundColor: '#f1f5f9',
                                                                            borderRadius: '6px',
                                                                            px: 1.5,
                                                                            py: 0.5
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            sx={{
                                                                                fontSize: '0.75rem',
                                                                                color: '#475569'
                                                                            }}
                                                                        >
                                                                            +{item.associatedItems.length - 2} more
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Stats Column */}
                                                    <TableCell
                                                        sx={{
                                                            py: 3,
                                                            width: '25%',
                                                            borderBottom: '1px solid #e2e8f0'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                            <Box>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.75rem',
                                                                        color: '#64748b',
                                                                        mb: 0.5
                                                                    }}
                                                                >
                                                                    Projected Sales
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '1rem',
                                                                        color: '#0369a1',
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    {usage.projectedSales.toLocaleString()}
                                                                </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.75rem',
                                                                        color: '#64748b',
                                                                        mb: 0.5
                                                                    }}
                                                                >
                                                                    Cases Needed
                                                                </Typography>
                                                                <Box
                                                                    sx={{
                                                                        backgroundColor: '#f0fdf4',
                                                                        borderRadius: '6px',
                                                                        px: 2,
                                                                        py: 0.5,
                                                                        display: 'inline-block'
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: '1rem',
                                                                            color: '#166534',
                                                                            fontWeight: 600
                                                                        }}
                                                                    >
                                                                        {usage.exactCases?.toFixed(2)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Actions Column */}
                                                    <TableCell
                                                        align="right"
                                                        sx={{
                                                            py: 3,
                                                            width: '10%',
                                                            borderBottom: '1px solid #e2e8f0',
                                                            pr: 3
                                                        }}
                                                    >
                                                        <Box
                                                            className="row-actions"
                                                            sx={{
                                                                display: 'flex',
                                                                gap: 1,
                                                                justifyContent: 'flex-end',
                                                                opacity: 0,
                                                                visibility: 'hidden',
                                                                transform: 'translateX(10px)',
                                                                transition: 'all 0.2s ease-in-out'
                                                            }}
                                                        >
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setCurrentItem(item);
                                                                    setOpenDialog(true);
                                                                }}
                                                                sx={{
                                                                    color: '#0284c7',
                                                                    backgroundColor: '#f0f9ff',
                                                                    border: '1px solid #bae6fd',
                                                                    '&:hover': {
                                                                        backgroundColor: '#e0f2fe',
                                                                        transform: 'translateY(-1px)'
                                                                    },
                                                                    transition: 'transform 0.2s ease'
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteItem(item._id)}
                                                                sx={{
                                                                    color: '#dc2626',
                                                                    backgroundColor: '#fef2f2',
                                                                    border: '1px solid #fecaca',
                                                                    '&:hover': {
                                                                        backgroundColor: '#fee2e2',
                                                                        transform: 'translateY(-1px)'
                                                                    },
                                                                    transition: 'transform 0.2s ease'
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 8 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 2
                                            }}>
                                                <Box
                                                    sx={{
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: '12px',
                                                        p: 3,
                                                        mb: 2
                                                    }}
                                                >
                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </Box>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: '#475569',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {searchQuery ? 'No matching items found' : 'No truck items available'}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: '#64748b',
                                                        mb: 2
                                                    }}
                                                >
                                                    {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first truck item'}
                                                </Typography>
                                                {!searchQuery && (
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<AddIcon />}
                                                        onClick={handleAddItem}
                                                        sx={{
                                                            borderRadius: '12px',
                                                            textTransform: 'none',
                                                            px: 4,
                                                            py: 1.5,
                                                            borderColor: '#e2e8f0',
                                                            color: '#0284c7',
                                                            '&:hover': {
                                                                borderColor: '#0284c7',
                                                                backgroundColor: '#f0f9ff'
                                                            }
                                                        }}
                                                    >
                                                        Add Your First Item
                                                    </Button>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {/* Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        padding: '16px'
                    }
                }}
            >
                <DialogTitle sx={{
                    pb: 2,
                    fontWeight: 600
                }}>
                    {currentItem._id ? 'Edit Truck Item' : 'Add Truck Item'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        pt: 2
                    }}>
                        <TextField
                            label="Description"
                            value={currentItem.description}
                            onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />
                        <TextField
                            label="UOM (e.g., '2/5 Lb Ct Case' or '1000 Ct case')"
                            value={currentItem.uom}
                            onChange={handleUOMChange}
                            fullWidth
                            helperText="For lb cases, use format '2/5 Lb Ct Case'. For count cases, use format '1000 Ct case'"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />
                        <TextField
                            label="Cost (CAD)"
                            type="number"
                            value={currentItem.cost}
                            onChange={(e) => setCurrentItem({ ...currentItem, cost: e.target.value })}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />

                        <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>Associated Items</Typography>

                        {/* Search and Selection Section */}
                        <Box sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '12px',
                            p: 2,
                            mb: 2
                        }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search items..."
                                value={associatedItemSearch}
                                onChange={(e) => setAssociatedItemSearch(e.target.value)}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                            <Box sx={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                border: '1px solid #f0f0f0',
                                borderRadius: '8px',
                                p: 1
                            }}>
                                {filteredSalesMixItems.map((name) => (
                                    <Box
                                        key={name}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 1,
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                                borderRadius: '8px'
                                            }
                                        }}
                                    >
                                        <FormControl>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(name)}
                                                    onChange={() => handleAssociatedItemSelect(name)}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                <Typography>
                                                    {name}
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            ml: 1,
                                                            color: 'text.secondary',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        (UPT: {salesMixData[name]?.toFixed(2) || '0.00'})
                                                    </Typography>
                                                </Typography>
                                            </label>
                                        </FormControl>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Selected Items with Usage Amounts */}
                        {currentItem.associatedItems.map((item, index) => (
                            <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    border: '1px solid #e0e0e0',
                                    display: 'flex',
                                    gap: 2,
                                    alignItems: 'center'
                                }}
                            >
                                <Typography sx={{ flex: 1 }}>
                                    {item.name}
                                    <Typography
                                        component="span"
                                        sx={{
                                            ml: 1,
                                            color: 'text.secondary',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        (UPT: {salesMixData[item.name]?.toFixed(2) || '0.00'})
                                    </Typography>
                                </Typography>
                                <TextField
                                    label={`Usage Amount (${currentItem.unitType || 'units'})`}
                                    type="number"
                                    inputProps={{ step: "0.01" }}
                                    value={item.usage}
                                    onChange={(e) => handleAssociatedItemChange(index, 'usage', e.target.value)}
                                    sx={{
                                        width: '200px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px'
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={() => {
                                        handleRemoveAssociatedItem(index);
                                        setSelectedItems(prev => {
                                            const newSet = new Set(prev);
                                            newSet.delete(item.name);
                                            return newSet;
                                        });
                                    }}
                                    sx={{
                                        color: '#d32f2f',
                                        '&:hover': {
                                            backgroundColor: '#FFF5F5'
                                        }
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Paper>
                        ))}

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 2,
                            mt: 4
                        }}>
                            <Button
                                onClick={() => setOpenDialog(false)}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    px: 3
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveItem}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    px: 3,
                                    backgroundColor: '#007FFF',
                                    '&:hover': {
                                        backgroundColor: '#0066CC'
                                    }
                                }}
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Bulk Import Dialog */}
            <Dialog
                open={openBulkDialog}
                onClose={() => setOpenBulkDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        padding: '16px'
                    }
                }}
            >
                <DialogTitle sx={{
                    pb: 2,
                    fontWeight: 600
                }}>
                    Bulk Import Truck Items
                </DialogTitle>
                <DialogContent>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        pt: 2
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            Paste your data in tab-separated format (Description, UOM, Cost). Each item on a new line.
                            <br />
                            Example format:
                            <br />
                            Bag, Cookie Small CFA - CA    1000 Ct Case    66.98
                            <br />
                            Bag, Foil CFA - CA    1000 Ct Case    69.99
                        </Typography>
                        <TextField
                            multiline
                            rows={10}
                            value={bulkInput}
                            onChange={(e) => setBulkInput(e.target.value)}
                            placeholder="Paste your data here..."
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    fontFamily: 'monospace'
                                }
                            }}
                        />
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 2,
                            mt: 2
                        }}>
                            <Button
                                onClick={() => {
                                    setOpenBulkDialog(false);
                                    setBulkInput('');
                                }}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    px: 3
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleBulkImport}
                                disabled={!bulkInput.trim()}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    px: 3,
                                    backgroundColor: '#007FFF',
                                    '&:hover': {
                                        backgroundColor: '#0066CC'
                                    }
                                }}
                            >
                                Import
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default TruckItems; 