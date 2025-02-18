import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  tableCellClasses,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Info, TrendingUp, TrendingDown } from "lucide-react";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'transparent',
    color: theme.palette.grey[600],
    fontWeight: 500,
    fontSize: '0.875rem',
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    padding: '12px 16px',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.875rem',
    padding: '16px',
    color: theme.palette.grey[800],
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
  '& td': {
    borderBottom: `1px solid ${theme.palette.grey[100]}`,
  },
  transition: 'all 150ms ease-in-out',
}));

const CategoryChip = styled(Chip)(({ theme, selected }) => ({
  borderRadius: '6px',
  padding: '8px 4px',
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: selected ? 'white' : theme.palette.grey[700],
  border: `1px solid ${selected ? 'transparent' : theme.palette.grey[300]}`,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.grey[100],
  },
  marginRight: '8px',
  cursor: 'pointer',
}));

const EnhancedChart = ({
  data,
  title = "Units Per Thousand",
  subtitle = "Product Performance Metrics",
  loading = false,
}) => {
  const [category, setCategory] = useState("chicken");

  // Calculate trend percentage
  const calculateTrend = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Format trend display
  const formatTrend = (trend) => {
    if (trend === 0) return '0%';
    return `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
  };

  // Categorize data with trend indicators
  const categorizedData = useMemo(() => {
    if (!data) return { chicken: [], drinks: [], prep: [] };

    const chicken = ["Spicy Filets", "Grilled Filets", "Grilled Nuggets", "Nuggets", "Filets", "Spicy Strips"];
    const drinks = ["Sunjoy Lemonade", "Diet Lemonade", "Lemonade"];

    const processData = (items) => {
      return items.map(item => ({
        ...item,
        trendValue: calculateTrend(item.utp, item.oldUtp),
        trendDisplay: formatTrend(calculateTrend(item.utp, item.oldUtp)),
        trend: item.oldUtp ? (item.utp > item.oldUtp ? 'up' : item.utp < item.oldUtp ? 'down' : 'none') : 'none'
      }));
    };

    const categorized = {
      chicken: processData(data.filter(item => chicken.includes(item.productName))),
      drinks: processData(data.filter(item => drinks.includes(item.productName))),
      prep: processData(data.filter(item => !chicken.includes(item.productName) && !drinks.includes(item.productName))),
    };

    return categorized;
  }, [data]);

  const selectedData = useMemo(() => categorizedData[category] || [], [categorizedData, category]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'grey.200',
        background: '#ffffff',
      }}
    >
      <Box p={3}>
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" fontWeight="600" color="grey.900" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="grey.600">
              {subtitle}
            </Typography>
          </Box>
          <Tooltip title="UTP values help determine product usage per thousand dollars in sales">
            <IconButton size="small">
              <Info size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box mb={4} display="flex" alignItems="center">
          <CategoryChip
            label="Chicken"
            selected={category === 'chicken'}
            onClick={() => setCategory('chicken')}
          />
          <CategoryChip
            label="Drinks"
            selected={category === 'drinks'}
            onClick={() => setCategory('drinks')}
          />
          <CategoryChip
            label="Prep"
            selected={category === 'prep'}
            onClick={() => setCategory('prep')}
          />
        </Box>

        <TableContainer sx={{ borderRadius: 2, backgroundColor: '#ffffff' }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Product Name</StyledTableCell>
                <StyledTableCell align="right">UTP Value</StyledTableCell>
                <StyledTableCell align="right">Trend</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedData.map((item) => (
                <StyledTableRow key={item._id}>
                  <StyledTableCell component="th" scope="row">
                    {item.productName}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {item.utp.toFixed(3)}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                      {item.trend === 'up' ? (
                        <TrendingUp size={16} color="#10B981" />
                      ) : item.trend === 'down' ? (
                        <TrendingDown size={16} color="#EF4444" />
                      ) : (
                        <span>-</span>
                      )}
                      {item.trend !== 'none' && (
                        <Typography
                          variant="body2"
                          color={item.trend === 'up' ? 'success.main' : 'error.main'}
                        >
                          {item.trendDisplay}
                        </Typography>
                      )}
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {selectedData.length === 0 && (
                <StyledTableRow>
                  <StyledTableCell colSpan={3} align="center">
                    <Box py={4}>
                      <Typography color="grey.600">No data available</Typography>
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default EnhancedChart;