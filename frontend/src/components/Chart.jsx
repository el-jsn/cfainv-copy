import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  IconButton,
  Tooltip as MTTooltip, // Renamed to avoid conflict with ChartJS Tooltip
} from "@material-tailwind/react";
import { Info, TrendingUp, TrendingDown } from "lucide-react";

// Helper function to determine trend color - can be moved inside component or kept separate
const getTrendClasses = (trend) => {
  if (trend === 'up') {
    return {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: <TrendingUp size={16} className="mr-1" />,
    };
  }
  if (trend === 'down') {
    return {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: <TrendingDown size={16} className="mr-1" />,
    };
  }
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: null,
  };
};

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

    // Sort each category alphabetically by productName
    Object.keys(categorized).forEach(key => {
      categorized[key].sort((a, b) => a.productName.localeCompare(b.productName));
    });


    return categorized;
  }, [data]);

  const selectedData = useMemo(() => categorizedData[category] || [], [categorizedData, category]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-[#E51636] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const TABLE_HEAD = ["Product Name", "UPT Value", "Trend"];

  return (
    <Card className="h-full w-full border border-gray-100 shadow-sm">
      <CardHeader floated={false} shadow={false} className="rounded-none border-b border-gray-100">
        <div className="p-6 flex items-start justify-between">
          <div>
            <Typography variant="h5" color="blue-gray" className="font-bold text-[#262626]">
              {title}
            </Typography>
            <Typography variant="small" className="font-normal text-gray-600">
              {subtitle}
            </Typography>
          </div>
          <MTTooltip
            content="UPT values help determine product usage per thousand dollars in sales"
            className="border border-blue-gray-50 bg-white px-4 py-3 shadow-xl shadow-black/10 text-blue-gray-900"
          >
            <IconButton variant="text" size="sm">
              <Info className="h-5 w-5 text-gray-600" />
            </IconButton>
          </MTTooltip>
        </div>
        <div className="p-6 pt-0 flex gap-2">
          <Button
            size="sm"
            variant={category === 'chicken' ? 'filled' : 'outlined'}
            onClick={() => setCategory('chicken')}
            className={`rounded-lg ${category === 'chicken' ? 'bg-[#E51636] text-white' : 'border-gray-300 text-gray-600'}`}
          >
            Chicken
          </Button>
          <Button
            size="sm"
            variant={category === 'drinks' ? 'filled' : 'outlined'}
            onClick={() => setCategory('drinks')}
            className={`rounded-lg ${category === 'drinks' ? 'bg-[#E51636] text-white' : 'border-gray-300 text-gray-600'}`}
          >
            Drinks
          </Button>
          <Button
            size="sm"
            variant={category === 'prep' ? 'filled' : 'outlined'}
            onClick={() => setCategory('prep')}
            className={`rounded-lg ${category === 'prep' ? 'bg-[#E51636] text-white' : 'border-gray-300 text-gray-600'}`}
          >
            Prep
          </Button>
        </div>
      </CardHeader>
      <CardBody className="overflow-auto px-0 pt-0">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-semibold leading-none opacity-70 text-[#64748B]"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedData.map(
              ({ _id, productName, utp, trend, trendDisplay }, index) => {
                const isLast = index === selectedData.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";
                const trendClasses = getTrendClasses(trend);

                return (
                  <tr key={_id} className="hover:bg-blue-gray-50/50 transition-colors">
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-medium text-[#262626]"
                      >
                        {productName}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold text-[#262626]"
                      >
                        {utp.toFixed(3)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      {trend !== 'none' ? (
                        <div className={`inline-flex items-center py-1 px-3 rounded-lg text-xs font-medium ${trendClasses.bg} ${trendClasses.text}`}>
                          {trendClasses.icon}
                          {trendDisplay}
                        </div>
                      ) : (
                        <div className={`inline-flex items-center py-1 px-3 rounded-lg text-xs font-medium ${trendClasses.bg} ${trendClasses.text}`}>
                          --
                        </div>
                      )}
                    </td>
                  </tr>
                );
              },
            )}
            {selectedData.length === 0 && (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="p-4 text-center border-b border-blue-gray-50">
                  <Typography variant="small" color="blue-gray" className="font-normal text-gray-600">
                    No data available for this category.
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
};

export default EnhancedChart;
