import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper
} from '@mui/material';
import {
    LayoutDashboard,
    ShoppingBag,
    MessageSquare,
    Calendar,
    Settings,
    TrendingUp,
    BarChart2,
    HelpCircle,
    Inbox,
    Database,
    RefreshCw,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownLeft,
    Lightbulb,
    CloudUpload,
    Search,
    PlusCircle,
    Clock,
    Package,
    Edit2,
    FileText,
    Trash2,
    Save
} from 'lucide-react';
import { styled } from '@mui/material/styles';

// Theme Variables (Consistent with Main Component)
const textColorPrimary = "#37474f";
const textColorSecondary = "#78909c";
const backgroundColor = "#fafafa";
const primaryColor = "#90a4ae";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1),
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const InstructionSection = ({ title, children }) => (
    <StyledPaper elevation={1}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
            {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
    </StyledPaper>
);

const HowToUse = () => {
    return (
        <Box sx={{ p: 4, backgroundColor, color: textColorPrimary }}>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 500, textAlign: "left" }}
            >
                How to Use the Inventory Manager
            </Typography>
            <Typography variant="subtitle1" color={textColorSecondary} gutterBottom>
                Learn how to navigate the app and effectively manage your inventory.
            </Typography>

            <InstructionSection title="Using the Dashboard">
                <Typography variant="body1" color={textColorSecondary} gutterBottom>
                    The dashboard provides a quick overview of key sales data and operational metrics.
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <LayoutDashboard color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Dashboard Overview"
                            secondary="Get a snapshot of critical information and quickly access key actions."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <BarChart2 color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="UPTs by Product"
                            secondary="(Admin Only) See unit per thousand (UPT) data for product categories, click 'Update' to edit."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <TrendingUp color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Weekly Sales Projection"
                            secondary="View projected sales for each day of the week, click 'Update' to edit (Admin Only)."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Settings color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Buffer Information"
                            secondary="(Admin Only) Adjust buffer percentages for products."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <ShoppingBag color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Thawing Cabinet"
                            secondary="View allocated products in the thawing cabinet."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <MessageSquare color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Adjust Allocations"
                            secondary="(Admin Only) Make manual inventory adjustments."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <HelpCircle color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Allocation Instructions"
                            secondary="(Admin Only) Review guides on proper stocking procedures."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Calendar color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Store Closures"
                            secondary="(Admin Only) Manage store closure schedules."
                        />
                    </ListItem>
                </List>
            </InstructionSection>

            <InstructionSection title="Using the Sales Analytics Suite">
                <Typography variant="body1" color={textColorSecondary} gutterBottom>
                    Analyze and understand sales data with detailed reports and UPT information.
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <CloudUpload color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Upload Sales Data"
                            secondary="Upload your sales data using the designated area to begin the analysis process."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Search color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Review Sales Data"
                            secondary="Once uploaded, you can see a summary of key data and other performance metrics."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Database color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Analyze Key Performance Indicators"
                            secondary="Review the overall sales performance metrics to quickly identify key insights."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Lightbulb color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Explore UPT Charts"
                            secondary="Use the UPT charts to visualize how each item is performing in different categories."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <RefreshCw color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Record UPT Data"
                            secondary="Record and submit your Unit Per Thousand (UPT) metrics to track performance."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <ArrowUpRight color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Top Performing Items"
                            secondary="Identified with the 'Menu Item Performance' section on the Analytics page."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <ArrowDownLeft color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Bottom Performing Items"
                            secondary="Identified with the 'Menu Item Performance' section on the Analytics page."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <AlertTriangle color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Inventory and Sales Discrepancies"
                            secondary="Review the metrics to identify potential inventory or waste on the Analytics page."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Lightbulb color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Promotional Insights"
                            secondary="Analyze items with high promotional redemptions and their impact on sales on the Analytics page."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Inbox color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Filter and Search"
                            secondary="Use the filter textfields to sort and filter the tables for each data section on the Analytics page."
                        />
                    </ListItem>
                </List>
            </InstructionSection>
            <InstructionSection title="Using the Allocation Adjustment Center">
                <Typography variant="body1" color={textColorSecondary} gutterBottom>
                    View and manage your active manual allocation modifications here. All modifications will expire automatically.
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <MessageSquare color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="View Active Modifications"
                            secondary="Review a list of your current manual inventory adjustments with their details and expiration times."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Clock color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Time Remaining"
                            secondary="Check how much time is left before a specific inventory modification automatically expires."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Package color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Modification Details"
                            secondary="See what product will be affected and the modification amount on each listed item."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Trash2 color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Delete Modifications"
                            secondary="Use the delete icon to cancel a scheduled manual adjustment for a specific item."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <PlusCircle color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Add New Modifications"
                            secondary="Click the plus icon at the bottom to manually adjust your allocations."
                        />
                    </ListItem>
                </List>
            </InstructionSection>

            <InstructionSection title="Using the Add Allocation Adjustment Form">
                <Typography variant="body1" color={textColorSecondary} gutterBottom>
                    Manually create a modification for a specific product on a particular day with specific cases and bags adjustments.
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <Calendar color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Set Day"
                            secondary="Choose a specific day when this manual allocation modification will be active."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Package color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Select Product"
                            secondary="Choose which product will be affected by this adjustment."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Edit2 color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Set Cases and Bags"
                            secondary="Define if cases or bags should be added or removed by selecting the correct operation and quantity."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Clock color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Set Duration"
                            secondary="Define how long this change will be active. You can select days or weeks as a unit of measure."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <HelpCircle color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Review Summary"
                            secondary="Review all details you entered in a summary before submitting the form."
                        />
                    </ListItem>
                </List>
            </InstructionSection>

            <InstructionSection title="Using the Instructions Board">
                <Typography variant="body1" color={textColorSecondary} gutterBottom>
                    Manage and create your daily or weekly instructions here.
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <Calendar color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Set Day"
                            secondary="Select the day of the week for which you want to create or edit an instruction."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <ShoppingBag color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Select Products"
                            secondary="Select the products for which this instruction applies. Products already used in other instructions for the same day will be disabled. If you don't select any products, this will be a universal instruction for that day."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <FileText color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Input Instruction Message"
                            secondary="Enter the text you want to be displayed as the instruction for a given day."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <PlusCircle color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Save/Update Instruction"
                            secondary="Save or update your instruction by clicking the save button."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Edit2 color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Edit Instructions"
                            secondary="Click the pencil icon to edit an instruction for a specific day."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Trash2 color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Delete Instruction"
                            secondary="Click the delete button to remove an instruction from a specific day."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Lightbulb color={primaryColor} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Instruction Placement"
                            secondary="Instructions without products will be displayed at the top of the day card, while instructions with products will be displayed under the allocations for those specific products."
                        />
                    </ListItem>
                </List>
            </InstructionSection>

            <InstructionSection title="Additional Tips">
                <Typography variant="body1" color={textColorSecondary} gutterBottom>
                    - Ensure your Excel files are in .xlsx or .xls format for proper processing on the Sales Analytics page.
                </Typography>
                <Typography variant="body1" color={textColorSecondary} gutterBottom>
                    - Check the tooltips provided next to the section headers for any additional context.
                </Typography>
            </InstructionSection>
        </Box>
    );
};

export default HowToUse;