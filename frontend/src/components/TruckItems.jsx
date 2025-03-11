import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
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
    Chip,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import EditIcon from '@mui/icons-material/Edit';
import { format, eachDayOfInterval, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, parseISO, addDays, subDays } from 'date-fns';
import debounce from 'lodash/debounce';
import FilterListIcon from '@mui/icons-material/FilterList';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Create a memoized form component
const TruckItemForm = memo(({ currentItem, setCurrentItem, handleUOMChange, salesMixData, selectedItems, handleAssociatedItemSelect, handleAssociatedItemChange, handleRemoveAssociatedItem, handleSaveItem, onClose }) => {
    const [associatedItemSearch, setAssociatedItemSearch] = useState('');

    // Filter function for associated items search
    const filteredSalesMixItems = Object.keys(salesMixData || {}).filter(name =>
        name.toLowerCase().includes(associatedItemSearch.toLowerCase())
    );

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            pt: 2
        }}>
            {/* Basic Information Section */}
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>Basic Information</Typography>
            <TextField
                label="Description"
                value={currentItem.description}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
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
                onChange={(e) => setCurrentItem(prev => ({ ...prev, cost: e.target.value }))}
                fullWidth
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px'
                    }
                }}
            />

            {/* Inventory Management Section */}
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600, mt: 2 }}>Inventory Management</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Minimum Par Level"
                        type="number"
                        value={currentItem.minParLevel || ''}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, minParLevel: e.target.value }))}
                        fullWidth
                        helperText="Minimum stock level required"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Maximum Par Level"
                        type="number"
                        value={currentItem.maxParLevel || ''}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, maxParLevel: e.target.value }))}
                        fullWidth
                        helperText="Maximum stock level needed"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Current On-Hand Quantity"
                        type="number"
                        value={currentItem.onHandQty || ''}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, onHandQty: e.target.value }))}
                        fullWidth
                    />
                </Grid>
            </Grid>

            {/* Storage Information Section */}
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600, mt: 2 }}>Storage Information</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Storage Type</InputLabel>
                        <Select
                            value={currentItem.storageType || ''}
                            onChange={(e) => setCurrentItem(prev => ({ ...prev, storageType: e.target.value }))}
                            label="Storage Type"
                        >
                            <MenuItem value="dry">Dry Storage</MenuItem>
                            <MenuItem value="refrigerated">Refrigerated</MenuItem>
                            <MenuItem value="frozen">Frozen</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Storage Location"
                        value={currentItem.storageLocation || ''}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, storageLocation: e.target.value }))}
                        fullWidth
                        helperText="Specific location in restaurant"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Shelf Life (Days)"
                        type="number"
                        value={currentItem.shelfLife || ''}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, shelfLife: e.target.value }))}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Priority Level</InputLabel>
                        <Select
                            value={currentItem.priorityLevel || ''}
                            onChange={(e) => setCurrentItem(prev => ({ ...prev, priorityLevel: e.target.value }))}
                            label="Priority Level"
                        >
                            <MenuItem value="critical">Critical</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Usage Tracking Section */}
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600, mt: 2 }}>Usage Information</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Average Daily Usage"
                        type="number"
                        value={currentItem.avgDailyUsage || ''}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, avgDailyUsage: e.target.value }))}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Waste Percentage"
                        type="number"
                        value={currentItem.wastePercentage || ''}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, wastePercentage: e.target.value }))}
                        fullWidth
                        helperText="Expected waste percentage"
                    />
                </Grid>
            </Grid>

            {/* Associated Items Section */}
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600, mt: 2 }}>Associated Items</Typography>
            <TextField
                label="Search Menu Items"
                value={associatedItemSearch}
                onChange={(e) => setAssociatedItemSearch(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 1,
                maxHeight: '200px',
                overflowY: 'auto',
                mb: 2,
                p: 1,
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
            }}>
                {filteredSalesMixItems.map((item) => (
                    <Box
                        key={item}
                        onClick={() => handleAssociatedItemSelect(item)}
                        sx={{
                            p: 1,
                            border: '1px solid',
                            borderColor: selectedItems.has(item) ? '#0284c7' : '#e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: selectedItems.has(item) ? '#f0f9ff' : 'white',
                            '&:hover': {
                                borderColor: '#0284c7',
                                backgroundColor: '#f0f9ff'
                            }
                        }}
                    >
                        <Typography variant="body2">{item}</Typography>
                    </Box>
                ))}
            </Box>
            <Box sx={{ mt: 2 }}>
                {currentItem.associatedItems.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 2,
                            p: 2,
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            backgroundColor: '#f8fafc'
                        }}
                    >
                        <Typography sx={{ flex: 1 }}>{item.name}</Typography>
                        <TextField
                            type="number"
                            label="Usage"
                            value={item.usage}
                            onChange={(e) => handleAssociatedItemChange(index, 'usage', parseFloat(e.target.value))}
                            size="small"
                            sx={{ width: '100px' }}
                        />
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAssociatedItem(index);
                            }}
                            size="small"
                            sx={{
                                color: '#dc2626',
                                '&:hover': {
                                    backgroundColor: '#fee2e2'
                                }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                    onClick={onClose}
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
                    onClick={handleSaveItem}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        px: 3,
                        backgroundColor: '#0284c7',
                        '&:hover': {
                            backgroundColor: '#0369a1'
                        }
                    }}
                >
                    Save
                </Button>
            </Box>
        </Box>
    );
});

// Create a memoized search component
const SearchBox = memo(({ searchQuery, onSearch, searchRef, onFocus, onBlur }) => {
    return (
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
                onChange={(e) => onSearch(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
            />
            {searchQuery && (
                <div className="absolute right-3 top-3">
                    <button
                        onClick={() => onSearch('')}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
});

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
        associatedItems: [],
        // Inventory Management
        minParLevel: '',
        maxParLevel: '',
        onHandQty: '',
        leadTime: '',
        // Storage Information
        storageType: '',
        storageLocation: '',
        shelfLife: '',
        priorityLevel: '',
        // Usage Information
        avgDailyUsage: '',
        wastePercentage: ''
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
    const [openReorderDialog, setOpenReorderDialog] = useState(false);
    const [openStorageDialog, setOpenStorageDialog] = useState(false);
    const [selectedStorageType, setSelectedStorageType] = useState('all');
    const [filterOptions, setFilterOptions] = useState({
        storageType: 'all',
        priorityLevel: 'all',
        storageLocation: 'all',
        needsReorder: 'all',
        minCost: '',
        maxCost: '',
        minQuantity: '',
        maxQuantity: ''
    });
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [availableStorageLocations, setAvailableStorageLocations] = useState([]);
    const [editingStock, setEditingStock] = useState(null);
    const [tempStockValue, setTempStockValue] = useState('');

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

    // Add useEffect to gather unique storage locations
    useEffect(() => {
        const locations = new Set(truckItems.map(item => item.storageLocation).filter(Boolean));
        setAvailableStorageLocations(Array.from(locations));
    }, [truckItems]);

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

            setSalesMixData(processedData);
            setSalesMixItems(Object.keys(processedData));
            setSalesMixUploadDate(new Date());
            setSalesMixReportingPeriod({
                startDate: startDateFull.trim(),
                endDate: endDateFull.trim()
            });
            setSuccess('Sales mix data uploaded successfully');

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
                    const data = await file.arrayBuffer();
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    if (!worksheet) {
                        throw new Error('No worksheet found in the Excel file');
                    }

                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    // Extract reporting period from the Excel file
                    const reportPeriod = jsonData[0]?.['Sales Mix Report - Item Summary'];
                    if (!reportPeriod) {
                        throw new Error('Could not find report period in the Excel file');
                    }

                    // Parse the date range
                    const fullDateString = reportPeriod.toString().replace('From ', '');
                    const [startDateFull, endDateFull] = fullDateString.split(' through ');

                    if (!startDateFull || !endDateFull) {
                        throw new Error('Could not parse date range from report header');
                    }

                    // Process the data rows
                    const processedData = {};
                    for (let i = 7; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        // Skip summary rows
                        if ([41, 42, 43, 44, 45, 553, 554, 555, 556, 557, 772, 773, 774, 775, 776, 961, 962, 963, 964, 965, 1074, 1075, 1076, 1077, 1078, 1363, 1364].includes(i)) {
                            continue;
                        }

                        const itemName = row['__EMPTY'];
                        const soldPer1000 = row['__EMPTY_17'];

                        if (itemName && typeof soldPer1000 !== 'undefined') {
                            const value = parseFloat(soldPer1000);
                            if (!isNaN(value)) {
                                processedData[itemName] = value;
                            }
                        }
                    }

                    if (Object.keys(processedData).length === 0) {
                        throw new Error('No valid items found after processing');
                    }

                    // Upload the processed data
                    const response = await axiosInstance.post('/salesmix/upload', {
                        data: processedData,
                        reportingPeriod: {
                            startDate: startDateFull.trim(),
                            endDate: endDateFull.trim()
                        }
                    });

                    setSalesMixData(processedData);
                    setSalesMixItems(Object.keys(processedData));
                    setSalesMixUploadDate(new Date());
                    setSalesMixReportingPeriod({
                        startDate: startDateFull.trim(),
                        endDate: endDateFull.trim()
                    });
                    setSuccess('Sales mix data uploaded successfully');

                } catch (error) {
                    console.error('Error processing file:', error);
                    setError(error.message || 'Error processing sales mix file. Please ensure it is a valid sales mix report.');
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

            const itemData = {
                description: currentItem.description,
                uom: currentItem.uom,
                totalUnits: Number(currentItem.totalUnits),
                unitType: currentItem.unitType,
                cost: Number(currentItem.cost),
                associatedItems: currentItem.associatedItems || [],
                // Inventory Management
                minParLevel: currentItem.minParLevel ? Number(currentItem.minParLevel) : null,
                maxParLevel: currentItem.maxParLevel ? Number(currentItem.maxParLevel) : null,
                onHandQty: currentItem.onHandQty ? Number(currentItem.onHandQty) : null,
                leadTime: currentItem.leadTime ? Number(currentItem.leadTime) : null,
                // Storage Information
                storageType: currentItem.storageType || null,
                storageLocation: currentItem.storageLocation || null,
                shelfLife: currentItem.shelfLife ? Number(currentItem.shelfLife) : null,
                priorityLevel: currentItem.priorityLevel || null,
                // Usage Information
                avgDailyUsage: currentItem.avgDailyUsage ? Number(currentItem.avgDailyUsage) : null,
                wastePercentage: currentItem.wastePercentage ? Number(currentItem.wastePercentage) : null
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

    const handleUOMChange = useCallback((e) => {
        const uomValue = e.target.value;
        setCurrentItem(prev => {
            const parsed = parseUOM(uomValue);
            if (parsed) {
                return {
                    ...prev,
                    uom: uomValue,
                    totalUnits: parsed.totalUnits,
                    unitType: parsed.unitType
                };
            }
            return {
                ...prev,
                uom: uomValue
            };
        });
    }, []);

    const calculateUsage = (item, salesMix, dateRange) => {
        if (!item.associatedItems || item.associatedItems.length === 0) {
            return {
                casesNeeded: 0,
                projectedSales: 0,
                exactCases: 0,
                unitsNeeded: 0
            };
        }

        let totalUnitsNeeded = 0;
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

        // Calculate total units needed based on associated items
        item.associatedItems.forEach(assoc => {
            const upt = salesMix[assoc.name] || 0;
            const rawUsage = (upt * projectedSales * assoc.usage) / 1000;
            totalUnitsNeeded += rawUsage;
        });

        // Add waste percentage to total units needed
        const wasteMultiplier = 1 + ((item.wastePercentage || 0) / 100);
        const totalUnitsWithWaste = totalUnitsNeeded * wasteMultiplier;

        // Convert to cases
        const exactCases = totalUnitsWithWaste / item.totalUnits;
        const casesNeeded = Math.ceil(exactCases);

        return {
            casesNeeded,
            projectedSales,
            exactCases,
            unitsNeeded: totalUnitsWithWaste
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
            associatedItems: [],
            // Inventory Management
            minParLevel: '',
            maxParLevel: '',
            onHandQty: '',
            leadTime: '',
            // Storage Information
            storageType: '',
            storageLocation: '',
            shelfLife: '',
            priorityLevel: '',
            // Usage Information
            avgDailyUsage: '',
            wastePercentage: ''
        });
        setSelectedItems(new Set());
        setOpenDialog(true);
    };

    const handleEditClick = (item) => {
        setCurrentItem(item);
        setSelectedItems(new Set(item.associatedItems.map(ai => ai.name)));
        setOpenDialog(true);
    };

    const handleAssociatedItemSelect = useCallback((itemName) => {
        setSelectedItems(prev => {
            const newSelectedItems = new Set(prev);
            if (newSelectedItems.has(itemName)) {
                newSelectedItems.delete(itemName);
                setCurrentItem(prev => ({
                    ...prev,
                    associatedItems: prev.associatedItems.filter(item => item.name !== itemName)
                }));
            } else {
                newSelectedItems.add(itemName);
                setCurrentItem(prev => ({
                    ...prev,
                    associatedItems: [
                        ...prev.associatedItems,
                        {
                            name: itemName,
                            usage: 1,
                            unit: prev.unitType || 'ct'
                        }
                    ]
                }));
            }
            return newSelectedItems;
        });
    }, []);

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

    // Debounce the search function
    const debouncedSearch = useCallback(
        debounce((query) => {
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

                return matchesDescription || matchesUOM || matchesAssociatedItems;
            });

            setSearchResults(results);
        }, 300),
        [truckItems]
    );

    // Memoize the handleSearch function
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        debouncedSearch(query);
    }, [debouncedSearch]);

    // Filter function for associated items search
    const filteredSalesMixItems = salesMixItems.filter(name =>
        name.toLowerCase().includes(associatedItemSearch.toLowerCase())
    );

    // Function to handle reorder list
    const handleViewReorderList = () => {
        setOpenReorderDialog(true);
    };

    // Function to handle storage overview
    const handleViewStorageOverview = () => {
        setOpenStorageDialog(true);
    };

    // Add helper functions for item calculations
    const calculateReorderPoint = (item) => {
        const dailyUsage = item.avgDailyUsage || 0;
        return item.minParLevel || 0; // Just use minParLevel as reorder point
    };

    const needsReorder = (item) => {
        const reorderPoint = calculateReorderPoint(item);
        return (item.onHandQty || 0) <= reorderPoint;
    };

    const calculateOrderQuantity = (item, usage) => {
        // Calculate total need as projected usage plus minimum stock level
        const projectedNeed = Math.ceil(usage.exactCases);
        const minimumNeed = item.minParLevel || 0;
        const totalNeed = projectedNeed + minimumNeed;

        // Subtract current stock to get order quantity
        const orderQuantity = Math.max(0, totalNeed - (item.onHandQty || 0));

        return orderQuantity;
    };

    // Update the getReorderItems function
    const getReorderItems = () => {
        return truckItems
            .filter(item => needsReorder(item))
            .sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
            });
    };

    // Function to get storage items
    const getStorageItems = (type = 'all') => {
        return truckItems
            .filter(item => type === 'all' || item.storageType === type)
            .sort((a, b) => a.storageLocation?.localeCompare(b.storageLocation || '') || 0);
    };

    // Add filter function
    const filterItems = (items) => {
        return items.filter(item => {
            if (filterOptions.storageType !== 'all' && item.storageType !== filterOptions.storageType) return false;
            if (filterOptions.priorityLevel !== 'all' && item.priorityLevel !== filterOptions.priorityLevel) return false;
            if (filterOptions.storageLocation !== 'all' && item.storageLocation !== filterOptions.storageLocation) return false;
            if (filterOptions.needsReorder !== 'all') {
                const needsReorder = calculateReorderPoint(item) >= (item.onHandQty || 0);
                if (filterOptions.needsReorder === 'yes' && !needsReorder) return false;
                if (filterOptions.needsReorder === 'no' && needsReorder) return false;
            }
            if (filterOptions.minCost && item.cost < Number(filterOptions.minCost)) return false;
            if (filterOptions.maxCost && item.cost > Number(filterOptions.maxCost)) return false;
            if (filterOptions.minQuantity && item.onHandQty < Number(filterOptions.minQuantity)) return false;
            if (filterOptions.maxQuantity && item.onHandQty > Number(filterOptions.maxQuantity)) return false;
            return true;
        });
    };

    // Add new handler for quick stock update
    const handleQuickStockUpdate = async (item, newValue) => {
        try {
            const updatedItem = { ...item, onHandQty: Number(newValue) };
            await axiosInstance.put(`/truck-items/${item._id}`, updatedItem);

            // Update local state
            setTruckItems(prevItems =>
                prevItems.map(i => i._id === item._id ? { ...i, onHandQty: Number(newValue) } : i)
            );
            setSearchResults(prevResults =>
                prevResults.map(i => i._id === item._id ? { ...i, onHandQty: Number(newValue) } : i)
            );

            setEditingStock(null);
            setSuccess('Stock updated successfully');
        } catch (err) {
            console.error('Error updating stock:', err);
            setError('Failed to update stock quantity');
        }
    };

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
                        <Typography variant="h4" sx={{ fontWeight: 600, color: '#0f172a', mb: 1 }}>
                            Truck Order Calculator
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem' }}>
                            Calculate order quantities based on sales projections and inventory levels
                        </Typography>

                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setOpenBulkDialog(true)}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                px: 3,
                                py: 1.5,
                                borderColor: '#e2e8f0',
                                color: '#64748b'
                            }}
                        >
                            Bulk Import
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleAddItem}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                px: 3,
                                py: 1.5,
                                backgroundColor: '#0284c7'
                            }}
                        >
                            Add Item
                        </Button>
                    </Box>
                </Box>

                {/* Controls Section with Sales Mix Upload */}
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
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%'
                    }}>
                        {/* Upload Box */}
                        <Box sx={{ width: '100%' }}>
                            <Typography
                                sx={{
                                    color: '#0f172a',
                                    fontSize: '1.1rem',
                                    fontWeight: 500,
                                    mb: 2
                                }}
                            >
                                Sales Mix Data
                            </Typography>
                            <Box
                                {...getRootProps()}
                                sx={{
                                    border: '2px dashed #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '36px',
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
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 16.2091 19.2091 18 17 18H7C4.79086 18 3 16.2091 3 14C3 11.7909 4.79086 10 7 10Z" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 12L12 15" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 14L12 12L14 14" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <Box>
                                    <Typography
                                        sx={{
                                            color: '#0f172a',
                                            fontSize: '1.25rem',
                                            fontWeight: 500,
                                            mb: 1
                                        }}
                                    >
                                        Upload Sales Mix Excel File
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: '#64748b',
                                            fontSize: '1rem'
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
                            {salesMixReportingPeriod && salesMixReportingPeriod.startDate && (
                                <Box sx={{
                                    mt: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    justifyContent: 'center',
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '8px',
                                    p: 2
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <Typography sx={{ color: '#0369a1', fontSize: '0.95rem', fontWeight: 500 }}>
                                        Current Sales Mix Period: {salesMixReportingPeriod.startDate} through {salesMixReportingPeriod.endDate}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Paper>

                {/* Dashboard Section */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Items Needing Reorder */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                backgroundColor: '#fff1f2',
                                border: '1px solid #fecdd3',
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)'
                                }
                            }}
                            onClick={handleViewReorderList}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: '#fecdd3',
                                        borderRadius: '12px',
                                        p: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#be123c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Box>
                                <Typography sx={{ color: '#be123c', fontWeight: 600 }}>
                                    Needs Reorder
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ color: '#be123c', fontWeight: 700, mb: 1 }}>
                                {truckItems.filter(item => needsReorder(item)).length}
                            </Typography>
                            <Typography sx={{ color: '#be123c', fontSize: '0.875rem' }}>
                                items below reorder point
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Total Inventory Value */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #86efac',
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: '#86efac',
                                        borderRadius: '12px',
                                        p: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Box>
                                <Typography sx={{ color: '#16a34a', fontWeight: 600 }}>
                                    Inventory Value
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ color: '#16a34a', fontWeight: 700, mb: 1 }}>
                                ${truckItems.reduce((total, item) => total + (item.onHandQty * item.cost), 0).toLocaleString()}
                            </Typography>
                            <Typography sx={{ color: '#16a34a', fontSize: '0.875rem' }}>
                                total value of current stock
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Storage Distribution */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #7dd3fc',
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)'
                                }
                            }}
                            onClick={handleViewStorageOverview}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Box
                                    sx={{
                                        backgroundColor: '#7dd3fc',
                                        borderRadius: '12px',
                                        p: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Box>
                                <Typography sx={{ color: '#0284c7', fontWeight: 600 }}>
                                    Storage Types
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {['dry', 'refrigerated', 'frozen'].map(type => (
                                    <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ color: '#0284c7', textTransform: 'capitalize' }}>
                                            {type}
                                        </Typography>
                                        <Typography sx={{ color: '#0284c7', fontWeight: 600 }}>
                                            {truckItems.filter(item => item.storageType === type).length}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Quick Actions Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#0f172a', fontWeight: 600 }}>
                        Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleViewReorderList}
                                sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    borderColor: '#fecdd3',
                                    color: '#be123c',
                                    backgroundColor: '#fff1f2',
                                    '&:hover': {
                                        backgroundColor: '#ffe4e6',
                                        borderColor: '#fecdd3',
                                        transform: 'translateY(-2px)',
                                        transition: 'transform 0.2s'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5V3H15V5M9 5H15M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography sx={{ fontWeight: 600 }}>View Reorder List</Typography>
                                        <Typography variant="body2">
                                            {truckItems.filter(item => needsReorder(item)).length} items need attention
                                        </Typography>
                                    </Box>
                                </Box>
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleViewStorageOverview}
                                sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    borderColor: '#7dd3fc',
                                    color: '#0284c7',
                                    backgroundColor: '#f0f9ff',
                                    '&:hover': {
                                        backgroundColor: '#e0f2fe',
                                        borderColor: '#7dd3fc',
                                        transform: 'translateY(-2px)',
                                        transition: 'transform 0.2s'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography sx={{ fontWeight: 600 }}>Storage Overview</Typography>
                                        <Typography variant="body2">
                                            View storage distribution
                                        </Typography>
                                    </Box>
                                </Box>
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Search and Filter Bar */}
                <Box sx={{
                    mb: 4,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2
                }}>
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        backgroundColor: 'white',
                        p: 2,
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <Box sx={{ flex: 1 }}>
                            <SearchBox
                                searchQuery={searchQuery}
                                onSearch={handleSearch}
                                searchRef={searchRef}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                        </Box>
                        <Button
                            variant="outlined"
                            onClick={() => setShowFilterDialog(true)}
                            startIcon={<FilterListIcon />}
                            sx={{
                                height: '48px',
                                minWidth: '120px',
                                borderRadius: '12px',
                                textTransform: 'none',
                                px: 3,
                                borderColor: '#e2e8f0',
                                backgroundColor: '#f8fafc',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': {
                                    borderColor: '#94a3b8',
                                    backgroundColor: '#f1f5f9'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography>Filters</Typography>
                                {Object.values(filterOptions).some(value => value !== 'all' && value !== '') && (
                                    <Chip
                                        size="small"
                                        label={Object.values(filterOptions).filter(value => value !== 'all' && value !== '').length}
                                        sx={{
                                            backgroundColor: '#0284c7',
                                            color: 'white',
                                            height: '20px',
                                            minWidth: '20px'
                                        }}
                                    />
                                )}
                            </Box>
                        </Button>
                    </Box>
                    <Box sx={{
                        backgroundColor: 'white',
                        p: 2,
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>Date Range</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <input
                                    type="date"
                                    value={format(new Date(dateRange[0].getTime() + dateRange[0].getTimezoneOffset() * 60000), 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const selectedDate = new Date(e.target.value + 'T00:00:00');
                                        const adjustedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
                                        setDateRange([adjustedDate, dateRange[1]]);
                                    }}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        color: '#64748b'
                                    }}
                                />
                                <input
                                    type="date"
                                    value={format(new Date(dateRange[1].getTime() + dateRange[1].getTimezoneOffset() * 60000), 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const selectedDate = new Date(e.target.value + 'T00:00:00');
                                        const adjustedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
                                        setDateRange([dateRange[0], adjustedDate]);
                                    }}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        color: '#64748b'
                                    }}
                                />
                            </Box>
                        </Box>
                        <Divider orientation="vertical" flexItem sx={{ borderColor: '#e2e8f0' }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: '150px' }}>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>Projected Sales</Typography>
                            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>
                                {(() => {
                                    let totalSales = 0;
                                    if (dateRange[0] && dateRange[1]) {
                                        const days = eachDayOfInterval({
                                            start: startOfDay(dateRange[0]),
                                            end: endOfDay(dateRange[1])
                                        });
                                        totalSales = days.reduce((sum, date) => {
                                            const dateStr = format(date, 'yyyy-MM-dd');
                                            if (futureProjections[dateStr]) {
                                                return sum + Number(futureProjections[dateStr]);
                                            }
                                            const dayName = format(date, 'EEEE');
                                            return sum + Number(salesProjections[dayName] || 0);
                                        }, 0);
                                    }
                                    return totalSales.toLocaleString();
                                })()}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Filter Dialog */}
                <Dialog
                    open={showFilterDialog}
                    onClose={() => setShowFilterDialog(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '16px',
                            padding: '24px'
                        }
                    }}
                >
                    <DialogTitle sx={{ pb: 5, fontWeight: 600 }}>
                        Filter Items
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="storage-type-label" sx={{
                                        backgroundColor: 'white',
                                        px: 1,
                                        transform: 'translate(14px, -9px) scale(0.75)',
                                        '&.Mui-focused': {
                                            color: '#0284c7'
                                        },
                                        '&.MuiInputLabel-shrink': {
                                            transform: 'translate(14px, -9px) scale(0.75)',
                                        }
                                    }}>
                                        Storage Type
                                    </InputLabel>
                                    <Select
                                        labelId="storage-type-label"
                                        value={filterOptions.storageType}
                                        onChange={(e) => setFilterOptions(prev => ({ ...prev, storageType: e.target.value }))}
                                        label="Storage Type"
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#e2e8f0',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#94a3b8',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#0284c7',
                                            },
                                            borderRadius: '12px',
                                            '& .MuiSelect-select': {
                                                padding: '12px 16px',
                                            }
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 300,
                                                    mt: 1,
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                                    '& .MuiMenuItem-root': {
                                                        padding: '12px 16px',
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="all">All Storage Types</MenuItem>
                                        <MenuItem value="dry">Dry Storage</MenuItem>
                                        <MenuItem value="refrigerated">Refrigerated</MenuItem>
                                        <MenuItem value="frozen">Frozen</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="priority-level-label" sx={{
                                        backgroundColor: 'white',
                                        px: 1,
                                        transform: 'translate(14px, -9px) scale(0.75)',
                                        '&.Mui-focused': {
                                            color: '#0284c7'
                                        },
                                        '&.MuiInputLabel-shrink': {
                                            transform: 'translate(14px, -9px) scale(0.75)',
                                        }
                                    }}>
                                        Priority Level
                                    </InputLabel>
                                    <Select
                                        labelId="priority-level-label"
                                        value={filterOptions.priorityLevel}
                                        onChange={(e) => setFilterOptions(prev => ({ ...prev, priorityLevel: e.target.value }))}
                                        label="Priority Level"
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#e2e8f0',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#94a3b8',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#0284c7',
                                            },
                                            borderRadius: '12px',
                                            '& .MuiSelect-select': {
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 300,
                                                    mt: 1,
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                                    '& .MuiMenuItem-root': {
                                                        padding: '12px 16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="all">All Priority Levels</MenuItem>
                                        <MenuItem value="critical">
                                            <Chip
                                                size="small"
                                                label="Critical"
                                                sx={{
                                                    backgroundColor: '#fee2e2',
                                                    color: '#991b1b',
                                                    minWidth: '80px'
                                                }}
                                            />
                                        </MenuItem>
                                        <MenuItem value="high">
                                            <Chip
                                                size="small"
                                                label="High"
                                                sx={{
                                                    backgroundColor: '#fef3c7',
                                                    color: '#92400e',
                                                    minWidth: '80px'
                                                }}
                                            />
                                        </MenuItem>
                                        <MenuItem value="medium">
                                            <Chip
                                                size="small"
                                                label="Medium"
                                                sx={{
                                                    backgroundColor: '#f0fdf4',
                                                    color: '#166534',
                                                    minWidth: '80px'
                                                }}
                                            />
                                        </MenuItem>
                                        <MenuItem value="low">
                                            <Chip
                                                size="small"
                                                label="Low"
                                                sx={{
                                                    backgroundColor: '#f1f5f9',
                                                    color: '#475569',
                                                    minWidth: '80px'
                                                }}
                                            />
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Storage Location</InputLabel>
                                    <Select
                                        value={filterOptions.storageLocation}
                                        onChange={(e) => setFilterOptions(prev => ({ ...prev, storageLocation: e.target.value }))}
                                        label="Storage Location"
                                    >
                                        <MenuItem value="all">All Locations</MenuItem>
                                        {availableStorageLocations.map(location => (
                                            <MenuItem key={location} value={location}>{location}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Needs Reorder</InputLabel>
                                    <Select
                                        value={filterOptions.needsReorder}
                                        onChange={(e) => setFilterOptions(prev => ({ ...prev, needsReorder: e.target.value }))}
                                        label="Needs Reorder"
                                    >
                                        <MenuItem value="all">All Items</MenuItem>
                                        <MenuItem value="yes">Needs Reorder</MenuItem>
                                        <MenuItem value="no">In Stock</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Min Cost"
                                        type="number"
                                        value={filterOptions.minCost}
                                        onChange={(e) => setFilterOptions(prev => ({ ...prev, minCost: e.target.value }))}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Max Cost"
                                        type="number"
                                        value={filterOptions.maxCost}
                                        onChange={(e) => setFilterOptions(prev => ({ ...prev, maxCost: e.target.value }))}
                                        fullWidth
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Min Quantity"
                                        type="number"
                                        value={filterOptions.minQuantity}
                                        onChange={(e) => setFilterOptions(prev => ({ ...prev, minQuantity: e.target.value }))}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Max Quantity"
                                        type="number"
                                        value={filterOptions.maxQuantity}
                                        onChange={(e) => setFilterOptions(prev => ({ ...prev, maxQuantity: e.target.value }))}
                                        fullWidth
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ pt: 3 }}>
                        <Button
                            onClick={() => {
                                setFilterOptions({
                                    storageType: 'all',
                                    priorityLevel: 'all',
                                    storageLocation: 'all',
                                    needsReorder: 'all',
                                    minCost: '',
                                    maxCost: '',
                                    minQuantity: '',
                                    maxQuantity: ''
                                });
                            }}
                            sx={{ mr: 1 }}
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={() => setShowFilterDialog(false)}
                            variant="contained"
                            sx={{
                                backgroundColor: '#0284c7',
                                '&:hover': {
                                    backgroundColor: '#0369a1'
                                }
                            }}
                        >
                            Apply Filters
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Table Section */}
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: 'none',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    <Table>
                        <TableBody>
                            {filterItems(searchQuery ? searchResults : truckItems).map((item) => {
                                const usage = calculateUsage(item, salesMixData, dateRange);
                                const currentStockUnits = (item.onHandQty || 0) * item.totalUnits;
                                const orderQuantity = calculateOrderQuantity(item, usage);

                                return (
                                    <React.Fragment key={item._id}>
                                        <TableRow
                                            hover
                                            onClick={() => toggleRowExpansion(item._id)}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: '#f8fafc'
                                                },
                                                borderLeft: orderQuantity > 0 ? '4px solid #fee2e2' : '4px solid #f0fdf4'
                                            }}
                                        >
                                            <TableCell sx={{ py: 4, width: '40%' }}>
                                                <Box>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 600,
                                                        color: '#0f172a',
                                                        mb: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        {item.description}
                                                        <Chip
                                                            size="small"
                                                            label={item.priorityLevel}
                                                            sx={{
                                                                backgroundColor:
                                                                    item.priorityLevel === 'critical' ? '#fee2e2' :
                                                                        item.priorityLevel === 'high' ? '#fef3c7' :
                                                                            item.priorityLevel === 'medium' ? '#f0fdf4' : '#f1f5f9',
                                                                color:
                                                                    item.priorityLevel === 'critical' ? '#991b1b' :
                                                                        item.priorityLevel === 'high' ? '#92400e' :
                                                                            item.priorityLevel === 'medium' ? '#166534' : '#475569',
                                                                height: '24px'
                                                            }}
                                                        />
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Chip
                                                            size="small"
                                                            label={item.uom}
                                                            sx={{
                                                                backgroundColor: '#f8fafc',
                                                                color: '#64748b',
                                                                height: '24px',
                                                                border: '1px solid #e2e8f0'
                                                            }}
                                                        />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {(() => {
                                                                const [numberPart, ...rest] = item.uom.split(' ');
                                                                const unitPart = rest.join(' ');
                                                                let totalUnits = item.totalUnits;
                                                                let unitType = 'units';

                                                                // Check for special unit types
                                                                if (unitPart.startsWith('Gal.')) {
                                                                    unitType = 'Gal.';
                                                                } else if (unitPart.startsWith('Lb')) {
                                                                    unitType = 'Lb';
                                                                } else if (unitPart.startsWith('Kg')) {
                                                                    unitType = 'Kg';
                                                                }

                                                                return `${totalUnits} ${unitType} per case`;
                                                            })()}
                                                        </Typography>
                                                        <Chip
                                                            size="small"
                                                            label={item.storageType}
                                                            sx={{
                                                                backgroundColor:
                                                                    item.storageType === 'frozen' ? '#e0f2fe' :
                                                                        item.storageType === 'refrigerated' ? '#f0fdf4' : '#f1f5f9',
                                                                color:
                                                                    item.storageType === 'frozen' ? '#0369a1' :
                                                                        item.storageType === 'refrigerated' ? '#166534' : '#475569',
                                                                height: '24px'
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 4 }}>
                                                <Box>
                                                    <Typography sx={{ color: '#64748b', mb: 0.5, fontSize: '0.875rem' }}>
                                                        Current Stock
                                                    </Typography>
                                                    {editingStock === item._id ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <TextField
                                                                type="number"
                                                                value={tempStockValue}
                                                                onChange={(e) => setTempStockValue(e.target.value)}
                                                                onKeyPress={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleQuickStockUpdate(item, tempStockValue);
                                                                    }
                                                                }}
                                                                size="small"
                                                                autoFocus
                                                                sx={{
                                                                    width: '80px',
                                                                    '& .MuiOutlinedInput-root': {
                                                                        height: '32px',
                                                                        fontSize: '1.1rem'
                                                                    }
                                                                }}
                                                            />
                                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleQuickStockUpdate(item, tempStockValue)}
                                                                    sx={{
                                                                        color: '#16a34a',
                                                                        p: 0.5,
                                                                        '&:hover': { backgroundColor: '#f0fdf4' }
                                                                    }}
                                                                >
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        setEditingStock(null);
                                                                        setTempStockValue('');
                                                                    }}
                                                                    sx={{
                                                                        color: '#dc2626',
                                                                        p: 0.5,
                                                                        '&:hover': { backgroundColor: '#fee2e2' }
                                                                    }}
                                                                >
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                    ) : (
                                                        <Box
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingStock(item._id);
                                                                setTempStockValue(item.onHandQty?.toString() || '0');
                                                            }}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    '& .edit-icon': {
                                                                        opacity: 1
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '1.1rem' }}>
                                                                    {item.onHandQty || 0} cases
                                                                </Typography>
                                                                <svg
                                                                    width="14"
                                                                    height="14"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="edit-icon"
                                                                    style={{ opacity: 0, transition: 'opacity 0.2s' }}
                                                                >
                                                                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {currentStockUnits.toLocaleString()} units
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                                                                Safety Stock: {item.minParLevel || 0} cases
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 4 }}>
                                                <Box>
                                                    <Typography sx={{ color: '#64748b', mb: 0.5, fontSize: '0.875rem' }}>
                                                        Projected Need
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '1.1rem' }}>
                                                        {usage.exactCases.toFixed(1)} cases
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {usage.unitsNeeded.toLocaleString()} units
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 4 }}>
                                                <Box>
                                                    <Typography sx={{ color: '#64748b', mb: 0.5, fontSize: '0.875rem' }}>
                                                        Need + Buffer (33%)
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: 600, color: '#0369a1', fontSize: '1.1rem' }}>
                                                        {(usage.exactCases * 1.33).toFixed(1)} cases
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {Math.round(usage.unitsNeeded * 1.33).toLocaleString()} units
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 4 }}>
                                                <Box>
                                                    <Typography sx={{ color: '#64748b', mb: 0.5, fontSize: '0.875rem' }}>
                                                        Suggested Order
                                                    </Typography>
                                                    <Typography sx={{
                                                        fontWeight: 600,
                                                        fontSize: '1.1rem',
                                                        color: orderQuantity > 0 ? '#dc2626' : '#16a34a',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        {orderQuantity} cases
                                                        {item.wastePercentage > 0 && (
                                                            <Chip
                                                                size="small"
                                                                label={`+${item.wastePercentage}% waste`}
                                                                sx={{
                                                                    height: '20px',
                                                                    backgroundColor: '#fef3c7',
                                                                    color: '#92400e',
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        )}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {(orderQuantity * item.totalUnits).toLocaleString()} units
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 4, pr: 4 }}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClick(item);
                                                        }}
                                                        size="small"
                                                        sx={{
                                                            color: '#64748b',
                                                            '&:hover': {
                                                                backgroundColor: '#f1f5f9'
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteItem(item._id);
                                                        }}
                                                        size="small"
                                                        sx={{
                                                            color: '#64748b',
                                                            '&:hover': {
                                                                backgroundColor: '#fee2e2',
                                                                color: '#dc2626'
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                        {expandedRows[item._id] && (
                                            <TableRow>
                                                <TableCell colSpan={5} sx={{ backgroundColor: '#f8fafc', py: 4 }}>
                                                    <Grid container spacing={4}>
                                                        <Grid item xs={12} md={4}>
                                                            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 2, fontWeight: 600 }}>
                                                                Inventory Details
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                                                                        Min Par Level
                                                                    </Typography>
                                                                    <Typography>
                                                                        {item.minParLevel || 'Not set'} ({(item.minParLevel * item.totalUnits).toLocaleString()} units)
                                                                    </Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                                                                        Max Par Level
                                                                    </Typography>
                                                                    <Typography>
                                                                        {item.maxParLevel || 'Not set'} ({(item.maxParLevel * item.totalUnits).toLocaleString()} units)
                                                                    </Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                                                                        Lead Time
                                                                    </Typography>
                                                                    <Typography>
                                                                        {item.leadTime || 'Not set'} days
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} md={4}>
                                                            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 2, fontWeight: 600 }}>
                                                                Usage Information
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                                                                        Daily Usage
                                                                    </Typography>
                                                                    <Typography>
                                                                        {item.avgDailyUsage || 'Not tracked'} cases
                                                                    </Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                                                                        Projected Sales
                                                                    </Typography>
                                                                    <Typography>
                                                                        {(() => {
                                                                            const itemUsage = calculateUsage(item, salesMixData, dateRange);
                                                                            return itemUsage.projectedSales.toLocaleString();
                                                                        })()}
                                                                    </Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                                                                        Waste Percentage
                                                                    </Typography>
                                                                    <Typography>
                                                                        {item.wastePercentage || '0'}%
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} md={4}>
                                                            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 2, fontWeight: 600 }}>
                                                                Associated Menu Items & UPTs
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                {item.associatedItems.map((assoc, index) => (
                                                                    <Box
                                                                        key={index}
                                                                        sx={{
                                                                            p: 2,
                                                                            borderRadius: '8px',
                                                                            backgroundColor: '#f0f9ff',
                                                                            border: '1px solid #e0f2fe'
                                                                        }}
                                                                    >
                                                                        <Typography sx={{ fontWeight: 500, color: '#0284c7', mb: 0.5 }}>
                                                                            {assoc.name}
                                                                        </Typography>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                UPT: {salesMixData[assoc.name]?.toFixed(2) || 0}
                                                                            </Typography>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Usage: {assoc.usage} per item
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Reorder List Dialog */}
                <Dialog
                    open={openReorderDialog}
                    onClose={() => setOpenReorderDialog(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '16px',
                            padding: '16px'
                        }
                    }}
                >
                    <DialogTitle sx={{ pb: 2, fontWeight: 600 }}>
                        Items Needing Reorder
                    </DialogTitle>
                    <DialogContent>
                        <List>
                            {getReorderItems().map((item) => {
                                const usage = calculateUsage(item, salesMixData, dateRange);
                                const orderQuantity = calculateOrderQuantity(item, usage);
                                return (
                                    <React.Fragment key={item._id}>
                                        <ListItem sx={{
                                            backgroundColor: '#fff1f2',
                                            borderRadius: '12px',
                                            mb: 2,
                                            flexDirection: 'column',
                                            alignItems: 'stretch',
                                            gap: 2
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {item.description}
                                                        <Chip
                                                            size="small"
                                                            label={item.priorityLevel}
                                                            sx={{
                                                                backgroundColor: item.priorityLevel === 'critical' ? '#fee2e2' :
                                                                    item.priorityLevel === 'high' ? '#fef3c7' :
                                                                        item.priorityLevel === 'medium' ? '#f0fdf4' : '#f1f5f9',
                                                                color: item.priorityLevel === 'critical' ? '#991b1b' :
                                                                    item.priorityLevel === 'high' ? '#92400e' :
                                                                        item.priorityLevel === 'medium' ? '#166534' : '#475569'
                                                            }}
                                                        />
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.uom}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    {item.wastePercentage > 0 && (
                                                        <Chip
                                                            size="small"
                                                            label={`+${item.wastePercentage}% waste`}
                                                            sx={{
                                                                backgroundColor: '#fef3c7',
                                                                color: '#92400e'
                                                            }}
                                                        />
                                                    )}
                                                    <Chip
                                                        label={`${item.storageType || 'unknown'} storage`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: item.storageType === 'frozen' ? '#e0f2fe' :
                                                                item.storageType === 'refrigerated' ? '#f0fdf4' : '#f1f5f9',
                                                            color: item.storageType === 'frozen' ? '#0369a1' :
                                                                item.storageType === 'refrigerated' ? '#166534' : '#475569'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={4}>
                                                    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: '8px' }}>
                                                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                                                            Current Stock
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                                                            {item.onHandQty || 0} cases
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Safety Stock: {item.minParLevel || 0}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: '8px' }}>
                                                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                                                            Projected Need
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                                                            {usage.exactCases.toFixed(1)} cases
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {usage.unitsNeeded.toLocaleString()} units
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Box sx={{ p: 2, backgroundColor: '#dc2626', borderRadius: '8px' }}>
                                                        <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                                            Suggested Order
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: 600, color: 'white' }}>
                                                            {orderQuantity} cases
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                            {(orderQuantity * item.totalUnits).toLocaleString()} units
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenReorderDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Storage Overview Dialog */}
                <Dialog
                    open={openStorageDialog}
                    onClose={() => setOpenStorageDialog(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '16px',
                            padding: '16px'
                        }
                    }}
                >
                    <DialogTitle sx={{ pb: 2, fontWeight: 600 }}>
                        Storage Overview
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 3 }}>
                            <FormControl fullWidth>
                                <InputLabel>Filter by Storage Type</InputLabel>
                                <Select
                                    value={selectedStorageType}
                                    onChange={(e) => setSelectedStorageType(e.target.value)}
                                    label="Filter by Storage Type"
                                >
                                    <MenuItem value="all">All Storage Types</MenuItem>
                                    <MenuItem value="dry">Dry Storage</MenuItem>
                                    <MenuItem value="refrigerated">Refrigerated</MenuItem>
                                    <MenuItem value="frozen">Frozen</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell>Storage Type</TableCell>
                                        <TableCell>Location</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getStorageItems(selectedStorageType).map((item) => (
                                        <TableRow key={item._id}>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={item.storageType}
                                                    sx={{
                                                        backgroundColor: item.storageType === 'frozen' ? '#e0f2fe' :
                                                            item.storageType === 'refrigerated' ? '#f0fdf4' : '#f1f5f9',
                                                        color: item.storageType === 'frozen' ? '#0369a1' :
                                                            item.storageType === 'refrigerated' ? '#166534' : '#475569'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{item.storageLocation || 'Not specified'}</TableCell>
                                            <TableCell align="right">{item.onHandQty} {item.uom}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenStorageDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
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
                    <TruckItemForm
                        currentItem={currentItem}
                        setCurrentItem={setCurrentItem}
                        handleUOMChange={handleUOMChange}
                        salesMixData={salesMixData}
                        selectedItems={selectedItems}
                        handleAssociatedItemSelect={handleAssociatedItemSelect}
                        handleAssociatedItemChange={handleAssociatedItemChange}
                        handleRemoveAssociatedItem={handleRemoveAssociatedItem}
                        handleSaveItem={handleSaveItem}
                        onClose={() => setOpenDialog(false)}
                    />
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

export default memo(TruckItems); 