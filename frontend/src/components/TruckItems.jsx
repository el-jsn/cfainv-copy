import React, { useState, useEffect, useRef } from 'react';
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

    const parseExcelData = (jsonData) => {
        // Clean and Structure Data
        const data_rows = [];
        for (const row_index in jsonData) {
            const row = jsonData[row_index];
            if (row_index < 7 || [41, 42, 43, 44, 45, 553, 554, 555, 556, 557, 772, 773, 774, 775, 776, 961, 962, 963, 964, 965, 1074, 1075, 1076, 1077, 1078, 1363, 1364].includes(parseInt(row_index))) {
                continue;
            }
            let itemName = row['__EMPTY'];
            if (itemName !== undefined && itemName !== null) {
                data_rows.push({
                    'Item Name': itemName,
                    'Total Count': row['__EMPTY_4'] || 0,
                    'Promo Count': row['__EMPTY_8'] || 0,
                    'Digital Count': row['__EMPTY_10'] || 0,
                    'Sold Count': row['__EMPTY_13'] || 0,
                    '# Sold Per 1000': row['__EMPTY_17'] || 0
                });
            }
        }

        // Data Type Conversion
        const numeric_columns = ['Total Count', 'Promo Count', 'Digital Count', 'Sold Count'];
        const cleaned_data = data_rows.map(item => {
            const convertedItem = { ...item };
            for (const col of numeric_columns) {
                convertedItem[col] = parseInt(item[col], 10) || 0;
            }
            convertedItem['# Sold Per 1000'] = parseFloat(item['# Sold Per 1000']) || 0;
            return convertedItem;
        });

        // Log all items and their UPT values for debugging
        console.log("All items from sales mix report:");
        cleaned_data.forEach(item => {
            console.log(`${item['Item Name']}: ${item['# Sold Per 1000']}`);
        });

        return cleaned_data;
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                    const parsedData = parseExcelData(jsonData);
                    console.log("Parsed Sales Mix Data:", parsedData);

                    // Extract unique items and their UPT values
                    const itemsData = {};
                    parsedData.forEach(row => {
                        if (row['Item Name'] && row['# Sold Per 1000']) {
                            itemsData[row['Item Name']] = row['# Sold Per 1000'];
                        }
                    });

                    setSalesMixData(itemsData);
                    setSalesMixItems(Object.keys(itemsData));
                    setSuccess('Sales mix data uploaded successfully');
                } catch (error) {
                    console.error("Error processing Excel file:", error);
                    setError('Error processing the Excel file. Please ensure it is a valid sales mix report.');
                }
            };

            reader.onerror = () => {
                setError('Error reading the file.');
            };

            reader.readAsArrayBuffer(file);
        }
    });

    // Update fetchSalesProjections
    const fetchSalesProjections = async () => {
        try {
            const response = await axiosInstance.get('/sales');
            console.log('Sales Projections Response:', response.data);

            const projectionsByDay = {};
            response.data.forEach(projection => {
                if (projection.day && projection.sales) {
                    projectionsByDay[projection.day] = Number(projection.sales);
                }
            });

            console.log('Processed Sales Projections:', projectionsByDay);
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
            console.log('Future Projections Response:', response.data);

            const projections = {};
            response.data.forEach(proj => {
                const date = new Date(proj.date);
                const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                const dateStr = localDate.toISOString().split('T')[0];
                projections[dateStr] = proj.amount;
            });

            console.log('Processed Future Projections:', projections);
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
            console.log('Fetched truck items:', response.data);
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

            console.log('Sending item data:', itemData);

            if (currentItem._id) {
                const response = await axiosInstance.put(`/truck-items/${currentItem._id}`, itemData);
                console.log('Update response:', response.data);
            } else {
                const response = await axiosInstance.post('/truck-items', itemData);
                console.log('Create response:', response.data);
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
        // If no associated items, return default values
        if (!item.associatedItems || item.associatedItems.length === 0) {
            return {
                casesNeeded: 0,
                projectedSales: 0,
                exactCases: 0
            };
        }

        let totalUsage = 0;
        let projectedSales = 0;

        console.log('Calculating usage for:', item.description);
        console.log('Item total units per case:', item.totalUnits);
        console.log('Associated items:', item.associatedItems);
        console.log('Date range:', dateRange);

        if (dateRange[0] && dateRange[1]) {
            const days = eachDayOfInterval({
                start: startOfDay(dateRange[0]),
                end: endOfDay(dateRange[1])
            });

            // Sum up sales for selected date range
            projectedSales = days.reduce((sum, date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                // First check if we have a future projection for this date
                if (futureProjections[dateStr]) {
                    return sum + Number(futureProjections[dateStr]);
                }
                // If no future projection, fall back to default day projection
                const dayName = format(date, 'EEEE');
                return sum + Number(salesProjections[dayName] || 0);
            }, 0);
        }

        console.log('Total projected sales:', projectedSales);

        // Calculate usage based on UPT and sales projection
        item.associatedItems.forEach(assoc => {
            console.log('Looking for UPT for item:', assoc.name);
            const upt = salesMix[assoc.name] || 0;
            console.log(`${assoc.name} UPT:`, upt);
            console.log(`${assoc.name} Usage per item:`, assoc.usage);

            // Calculate raw usage: (UPT * sales) / 1000 * usage amount
            const rawUsage = (upt * projectedSales * assoc.usage) / 1000;
            console.log(`${assoc.name} Raw Usage calculation:`);
            console.log(`(${upt} * ${projectedSales} * ${assoc.usage}) / 1000 = ${rawUsage}`);

            totalUsage += rawUsage;
        });

        console.log('Total Raw Usage:', totalUsage);
        console.log('Units per case:', item.totalUnits);

        // Calculate exact cases by dividing total usage by units per case
        const exactCases = totalUsage / item.totalUnits;
        console.log('Exact Cases calculation:');
        console.log(`${totalUsage} / ${item.totalUnits} = ${exactCases}`);

        const casesNeeded = Math.ceil(exactCases);
        console.log('Final rounded Cases Needed:', casesNeeded);

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
            backgroundColor: '#f5f5f7',
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
                    mb: 4
                }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 600,
                            color: '#1a1a1a'
                        }}
                    >
                        Truck Order Calculator
                    </Typography>
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
                                backgroundColor: '#007FFF',
                                '&:hover': {
                                    backgroundColor: '#0066CC'
                                }
                            }}
                        >
                            Add Truck Item
                        </Button>
                    </Box>
                </Box>

                {/* Search Bar */}
                <Box sx={{ mb: 4 }}>
                    <div className="items-center px-4 flex justify-center">
                        <div className="relative w-full max-w-2xl">
                            <div className="absolute top-3 left-3 items-center" ref={searchRef}>
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full p-2 pl-10 text-gray-900 bg-white rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200 focus:pl-3"
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
                                mb: 2
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
                                mb: 2
                            }}
                        >
                            {success}
                        </Alert>
                    )}
                </Box>

                {/* Controls Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: '16px',
                        backgroundColor: 'white',
                        display: 'flex',
                        gap: 3,
                        alignItems: 'center'
                    }}
                >
                    {/* Upload Box */}
                    <Box
                        {...getRootProps()}
                        sx={{
                            flex: 1,
                            border: '2px dashed #e0e0e0',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                borderColor: '#007FFF',
                                backgroundColor: '#F5F9FF'
                            }
                        }}
                    >
                        <input {...getInputProps()} />
                        <Typography
                            sx={{
                                color: '#666',
                                fontSize: '0.95rem'
                            }}
                        >
                            Upload Sales Mix Excel File (with UPT data)
                        </Typography>
                    </Box>

                    {/* Date Range Picker */}
                    <div className="relative min-w-[400px] bg-white rounded-xl p-4 flex flex-col gap-4">
                        <div className="relative flex items-center justify-center gap-4">
                            <div className="relative">
                                <input
                                    type="date"
                                    value={format(startDate, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const date = parseISO(e.target.value);
                                        setStartDate(date);
                                        setDateRange([date, endDate]);
                                    }}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm cursor-pointer bg-white hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                                />
                            </div>
                            <span className="text-gray-600">to</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={format(endDate, 'yyyy-MM-dd')}
                                    min={format(startDate, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const date = parseISO(e.target.value);
                                        setEndDate(date);
                                        setDateRange([startDate, date]);
                                    }}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm cursor-pointer bg-white hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                                />
                            </div>
                        </div>
                        {startDate && endDate && (
                            <div className="text-center text-sm text-gray-600">
                                Total Sales: {eachDayOfInterval({
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
                            </div>
                        )}
                    </div>
                </Paper>

                {/* Table Section */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '16px',
                        overflow: 'hidden'
                    }}
                >
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>UOM</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Cost (CAD)</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Associated Items</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>UPT Values</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Projected Sales</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Cases Needed</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(searchQuery ? searchResults : truckItems) && (searchQuery ? searchResults : truckItems).length > 0 ? (
                                    (searchQuery ? searchResults : truckItems).map((item) => {
                                        const usage = calculateUsage(item, salesMixData, dateRange);
                                        return (
                                            <TableRow
                                                key={item._id}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: '#F5F9FF'
                                                    }
                                                }}
                                            >
                                                <TableCell sx={{ py: 2 }}>{item.description}</TableCell>
                                                <TableCell sx={{ py: 2 }}>{item.uom} ({item.totalUnits} {item.unitType})</TableCell>
                                                <TableCell sx={{ py: 2 }}>${item.cost.toFixed(2)}</TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography sx={{ fontSize: '0.9rem', color: '#334155' }}>
                                                            {item.associatedItems.length} items
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => toggleRowExpansion(item._id)}
                                                            sx={{
                                                                transform: expandedRows[item._id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s',
                                                                color: '#64748b'
                                                            }}
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </IconButton>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            maxHeight: expandedRows[item._id] ? '500px' : '0px',
                                                            overflow: 'hidden',
                                                            transition: 'max-height 0.3s ease-in-out',
                                                            mt: expandedRows[item._id] ? 1 : 0
                                                        }}
                                                    >
                                                        {item.associatedItems.map((assoc, index) => (
                                                            <Box
                                                                key={index}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    mb: 1,
                                                                    p: 1,
                                                                    borderRadius: '8px',
                                                                    backgroundColor: '#f8fafc',
                                                                    border: '1px solid #e2e8f0'
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.9rem',
                                                                        color: '#334155',
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    {assoc.name}
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.85rem',
                                                                        color: '#64748b',
                                                                        ml: 'auto'
                                                                    }}
                                                                >
                                                                    {assoc.usage} {item.unitType}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography sx={{ fontSize: '0.9rem', color: '#334155' }}>
                                                            {item.associatedItems.filter(assoc => salesMixData[assoc.name]).length} of {item.associatedItems.length} with UPT
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => toggleRowExpansion(item._id)}
                                                            sx={{
                                                                transform: expandedRows[item._id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s',
                                                                color: '#64748b'
                                                            }}
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </IconButton>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            maxHeight: expandedRows[item._id] ? '500px' : '0px',
                                                            overflow: 'hidden',
                                                            transition: 'max-height 0.3s ease-in-out',
                                                            mt: expandedRows[item._id] ? 1 : 0
                                                        }}
                                                    >
                                                        {item.associatedItems.map((assoc, index) => (
                                                            <Box
                                                                key={index}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    mb: 1,
                                                                    p: 1,
                                                                    borderRadius: '8px',
                                                                    backgroundColor: salesMixData[assoc.name] ? '#f0fdf4' : '#fef2f2',
                                                                    border: `1px solid ${salesMixData[assoc.name] ? '#bbf7d0' : '#fecaca'}`
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.9rem',
                                                                        color: '#334155',
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    {assoc.name}
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.85rem',
                                                                        color: salesMixData[assoc.name] ? '#166534' : '#991b1b',
                                                                        ml: 'auto',
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    {salesMixData[assoc.name] ? `${salesMixData[assoc.name].toFixed(2)} per 1000` : 'No UPT data'}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>{usage.projectedSales.toLocaleString()}</TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    {usage.exactCases?.toFixed(2)}
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <IconButton
                                                        onClick={() => {
                                                            setCurrentItem(item);
                                                            setOpenDialog(true);
                                                        }}
                                                        sx={{
                                                            color: '#007FFF',
                                                            '&:hover': {
                                                                backgroundColor: '#F5F9FF'
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleDeleteItem(item._id)}
                                                        sx={{
                                                            color: '#d32f2f',
                                                            '&:hover': {
                                                                backgroundColor: '#FFF5F5'
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 2
                                            }}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ color: '#666' }}
                                                >
                                                    {searchQuery ? 'No matching items found' : 'No truck items available'}
                                                </Typography>
                                                {!searchQuery && (
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<AddIcon />}
                                                        onClick={handleAddItem}
                                                        sx={{
                                                            borderRadius: '12px',
                                                            textTransform: 'none'
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