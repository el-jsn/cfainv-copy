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
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Info, TrendingUp, TrendingDown } from "lucide-react";

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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[100]}`,
  padding: '16px',
  '&.header': {
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.grey[700],
    fontWeight: 600,
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
  transition: 'background-color 150ms ease-in-out',
}));

const TrendChip = styled(Box)(({ theme, trend }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: 500,
  backgroundColor: trend === 'up'
    ? theme.palette.success.soft
    : trend === 'down'
      ? theme.palette.error.soft
      : theme.palette.grey[100],
  color: trend === 'up'
    ? theme.palette.success.main
    : trend === 'down'
      ? theme.palette.error.main
      : theme.palette.grey[600],
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
          <Tooltip title="UPT values help determine product usage per thousand dollars in sales">
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

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell className="header">Product Name</StyledTableCell>
                <StyledTableCell className="header" align="right">UPT Value</StyledTableCell>
                <StyledTableCell className="header" align="right">Trend</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedData.map((item) => (
                <StyledTableRow key={item._id}>
                  <StyledTableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {item.productName}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {item.utp.toFixed(3)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {item.trend !== 'none' ? (
                      <TrendChip trend={item.trend}>
                        {item.trend === 'up' ? (
                          <TrendingUp size={16} className="mr-1" />
                        ) : (
                          <TrendingDown size={16} className="mr-1" />
                        )}
                        {item.trendDisplay}
                      </TrendChip>
                    ) : (
                      <TrendChip trend="none">
                        --
                      </TrendChip>
                    )}
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