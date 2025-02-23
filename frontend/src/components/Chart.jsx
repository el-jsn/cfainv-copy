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
  borderRadius: '8px',
  padding: '8px 12px',
  backgroundColor: selected ? '#E51636' : '#F3F4F6',
  color: selected ? '#ffffff' : '#64748B',
  border: 'none',
  '&:hover': {
    backgroundColor: selected ? '#C41230' : '#E5E7EB',
  },
  marginRight: '12px',
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'all 0.2s ease-in-out',
  '&:active': {
    transform: 'scale(0.97)',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid #E5E7EB',
  padding: '16px',
  color: '#262626',
  '&.header': {
    backgroundColor: '#F9FAFB',
    color: '#64748B',
    fontWeight: 600,
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
    letterSpacing: '0.025em',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: '#F9FAFB',
  },
  transition: 'background-color 150ms ease-in-out',
  '& td:first-of-type': {
    borderTopLeftRadius: '8px',
    borderBottomLeftRadius: '8px',
  },
  '& td:last-of-type': {
    borderTopRightRadius: '8px',
    borderBottomRightRadius: '8px',
  },
}));

const TrendChip = styled(Box)(({ theme, trend }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 500,
  backgroundColor: trend === 'up'
    ? 'rgba(34, 197, 94, 0.1)'
    : trend === 'down'
      ? 'rgba(239, 68, 68, 0.1)'
      : '#F3F4F6',
  color: trend === 'up'
    ? '#16A34A'
    : trend === 'down'
      ? '#DC2626'
      : '#64748B',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
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
        <div className="w-12 h-12 rounded-full border-4 border-[#E51636] border-t-transparent animate-spin"></div>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        background: '#FFFFFF',
      }}
    >
      <Box p={3}>
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" fontWeight="600" sx={{ color: '#262626' }} gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {subtitle}
            </Typography>
          </Box>
          <Tooltip
            title="UPT values help determine product usage per thousand dollars in sales"
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#262626',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              border: '1px solid #E5E7EB',
            }}
          >
            <IconButton size="small" sx={{ color: '#64748B', '&:hover': { color: '#262626' } }}>
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
                    <Typography variant="body2" fontWeight={500} sx={{ color: '#262626' }}>
                      {item.productName}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#262626' }}>
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
                      <Typography sx={{ color: '#64748B' }}>No data available</Typography>
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