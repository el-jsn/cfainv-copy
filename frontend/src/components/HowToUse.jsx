import React, { useState, useMemo } from 'react';
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

const InstructionSection = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 mb-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        {children}
    </div>
);


const IconItem = ({ icon: IconComponent, title, description }) => (
    <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex-shrink-0">
            <IconComponent className="h-6 w-6 text-red-600" />
        </div>
        <div>
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
    </div>
);

const NavigationItem = ({ section, title, icon: IconComponent, activeSection, setActiveSection }) => (
    <button
        onClick={() => setActiveSection(section)}
        className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${activeSection === section
            ? 'bg-red-50 text-red-700'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
    >
        <IconComponent className="h-5 w-5" />
        <span className="font-medium">{title}</span>
    </button>
);


const HowToUse = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSections = useMemo(() => {
        if (!searchQuery) return activeSection;

        const sections = {
            dashboard: { title: "Using the Dashboard", content: ["Dashboard Overview", "UPTs by Product", "Weekly Sales Projection", "Buffer Information", "Thawing Cabinet"] },
            analytics: { title: "Using the Sales Analytics Suite", content: ["Upload Sales Data", "Key Performance Indicators", "Performance Trends", "Top Performers", "Discrepancy Alerts", "Promotional Insights", "Record UPT Data", "Bottom Performing Items", "Filter and Search"] },
            allocation: { title: "Using the Allocation Adjustment Center", content: ["View Active Modifications", "Time Remaining", "Modification Details", "Delete Modifications", "Add New Modifications", "Set Day", "Select Product", "Set Cases and Bags", "Set Duration", "Review Summary"] },
            instructions: { title: "Using the Instructions Board", content: ["Set Day", "Select Products", "Input Instruction Message", "Save/Update Instruction", "Edit Instructions", "Delete Instruction", "Instruction Placement"] },
            tips: { title: "Tips & Best Practices", content: ["File Format Tips", "Navigation Tips", "Best Practices"] }
        }
        const found = Object.keys(sections).find(key => {
            return sections[key].content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
        });
        return found || activeSection;
    }, [searchQuery, activeSection])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col items-start mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Inventory Manager Guide
                    </h1>
                    <p className="text-lg text-gray-600">
                        Everything you need to know about managing your inventory effectively
                    </p>
                </div>

                <div className="flex gap-8">
                    {/* Navigation Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-4 sticky top-8">
                            <div className="space-y-2">
                                <NavigationItem
                                    section="dashboard"
                                    title="Dashboard"
                                    icon={LayoutDashboard}
                                    activeSection={filteredSections}
                                    setActiveSection={setActiveSection}
                                />
                                <NavigationItem
                                    section="analytics"
                                    title="Analytics"
                                    icon={BarChart2}
                                    activeSection={filteredSections}
                                    setActiveSection={setActiveSection}
                                />
                                <NavigationItem
                                    section="allocation"
                                    title="Allocation"
                                    icon={Package}
                                    activeSection={filteredSections}
                                    setActiveSection={setActiveSection}
                                />
                                <NavigationItem
                                    section="instructions"
                                    title="Instructions"
                                    icon={FileText}
                                    activeSection={filteredSections}
                                    setActiveSection={setActiveSection}
                                />
                                <NavigationItem
                                    section="tips"
                                    title="Tips & Notes"
                                    icon={Lightbulb}
                                    activeSection={filteredSections}
                                    setActiveSection={setActiveSection}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search documentation..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Dashboard Section */}
                        {filteredSections === 'dashboard' && (
                            <InstructionSection title="Using the Dashboard">
                                <div className="grid gap-4">
                                    <IconItem
                                        icon={LayoutDashboard}
                                        title="Dashboard Overview"
                                        description="Get a snapshot of critical information and quickly access key actions"
                                    />
                                    <IconItem
                                        icon={BarChart2}
                                        title="UPTs by Product"
                                        description="(Admin Only) See unit per thousand (UPT) data for product categories"
                                    />
                                    <IconItem
                                        icon={TrendingUp}
                                        title="Weekly Sales Projection"
                                        description="View projected sales for each day of the week"
                                    />
                                    <IconItem
                                        icon={Settings}
                                        title="Buffer Information"
                                        description="(Admin Only) Adjust buffer percentages for products"
                                    />
                                    <IconItem
                                        icon={ShoppingBag}
                                        title="Thawing Cabinet"
                                        description="View allocated products in the thawing cabinet"
                                    />
                                </div>
                            </InstructionSection>
                        )}

                        {/* Analytics Section */}
                        {filteredSections === 'analytics' && (
                            <InstructionSection title="Using the Sales Analytics Suite">
                                <div className="grid gap-4">
                                    <IconItem
                                        icon={CloudUpload}
                                        title="Upload Sales Data"
                                        description="Upload your sales data to begin the analysis process"
                                    />
                                    <IconItem
                                        icon={Database}
                                        title="Key Performance Indicators"
                                        description="Review overall sales performance metrics"
                                    />
                                    <IconItem
                                        icon={TrendingUp}
                                        title="Performance Trends"
                                        description="Analyze historical performance and identify patterns"
                                    />
                                    <IconItem
                                        icon={ArrowUpRight}
                                        title="Top Performers"
                                        description="Identify best-selling items and categories"
                                    />
                                    <IconItem
                                        icon={AlertTriangle}
                                        title="Discrepancy Alerts"
                                        description="Review inventory and sales discrepancies"
                                    />
                                    <IconItem
                                        icon={Lightbulb}
                                        title="Promotional Insights"
                                        description="Analyze items with high promotional redemptions and their impact on sales on the Analytics page."
                                    />
                                    <IconItem
                                        icon={RefreshCw}
                                        title="Record UPT Data"
                                        description="Record and submit your Unit Per Thousand (UPT) metrics to track performance."
                                    />
                                    <IconItem
                                        icon={ArrowDownLeft}
                                        title="Bottom Performing Items"
                                        description="Identified with the 'Menu Item Performance' section on the Analytics page."
                                    />
                                    <IconItem
                                        icon={Inbox}
                                        title="Filter and Search"
                                        description="Use the filter textfields to sort and filter the tables for each data section on the Analytics page."
                                    />
                                </div>
                            </InstructionSection>
                        )}

                        {/* Allocation Section */}
                        {filteredSections === 'allocation' && (
                            <InstructionSection title="Using the Allocation Adjustment Center">
                                <div className="grid gap-4">
                                    <IconItem
                                        icon={MessageSquare}
                                        title="View Active Modifications"
                                        description="Review a list of your current manual inventory adjustments with their details and expiration times"
                                    />
                                    <IconItem
                                        icon={Clock}
                                        title="Time Remaining"
                                        description="Check how much time is left before a specific inventory modification automatically expires"
                                    />
                                    <IconItem
                                        icon={Package}
                                        title="Modification Details"
                                        description="See what product will be affected and the modification amount on each listed item"
                                    />
                                    <IconItem
                                        icon={Trash2}
                                        title="Delete Modifications"
                                        description="Use the delete icon to cancel a scheduled manual adjustment for a specific item"
                                    />
                                    <IconItem
                                        icon={PlusCircle}
                                        title="Add New Modifications"
                                        description="Click the plus icon at the bottom to manually adjust your allocations"
                                    />
                                </div>
                                <InstructionSection title="Using the Add Allocation Adjustment Form" className="mt-4">
                                    <div className="grid gap-4">
                                        <IconItem
                                            icon={Calendar}
                                            title="Set Day"
                                            description="Choose a specific day when this manual allocation modification will be active"
                                        />
                                        <IconItem
                                            icon={Package}
                                            title="Select Product"
                                            description="Choose which product will be affected by this adjustment"
                                        />
                                        <IconItem
                                            icon={Edit2}
                                            title="Set Cases and Bags"
                                            description="Define if cases or bags should be added or removed by selecting the correct operation and quantity."
                                        />
                                        <IconItem
                                            icon={Clock}
                                            title="Set Duration"
                                            description="Define how long this change will be active. You can select days or weeks as a unit of measure."
                                        />
                                        <IconItem
                                            icon={HelpCircle}
                                            title="Review Summary"
                                            description="Review all details you entered in a summary before submitting the form."
                                        />
                                    </div>
                                </InstructionSection>
                            </InstructionSection>
                        )}

                        {/* Instructions Section */}
                        {filteredSections === 'instructions' && (
                            <InstructionSection title="Using the Instructions Board">
                                <div className="grid gap-4">
                                    <IconItem
                                        icon={Calendar}
                                        title="Set Day"
                                        description="Select the day of the week for which you want to create or edit an instruction."
                                    />
                                    <IconItem
                                        icon={ShoppingBag}
                                        title="Select Products"
                                        description="Select the products for which this instruction applies. Products already used in other instructions for the same day will be disabled. If you don't select any products, this will be a universal instruction for that day."
                                    />
                                    <IconItem
                                        icon={FileText}
                                        title="Input Instruction Message"
                                        description="Enter the text you want to be displayed as the instruction for a given day."
                                    />
                                    <IconItem
                                        icon={PlusCircle}
                                        title="Save/Update Instruction"
                                        description="Save or update your instruction by clicking the save button."
                                    />
                                    <IconItem
                                        icon={Edit2}
                                        title="Edit Instructions"
                                        description="Click the pencil icon to edit an instruction for a specific day."
                                    />
                                    <IconItem
                                        icon={Trash2}
                                        title="Delete Instruction"
                                        description="Click the delete button to remove an instruction from a specific day."
                                    />
                                    <IconItem
                                        icon={Lightbulb}
                                        title="Instruction Placement"
                                        description="Instructions without products will be displayed at the top of the day card, while instructions with products will be displayed under the allocations for those specific products."
                                    />

                                </div>
                            </InstructionSection>
                        )}

                        {/* Tips Section */}
                        {filteredSections === 'tips' && (
                            <InstructionSection title="Tips & Best Practices" className="space-y-6">
                                <div className="bg-red-50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-red-900 mb-2">File Format Tips</h3>
                                    <p className="text-red-800">Ensure your Excel files are in .xlsx or .xls format for proper processing</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-green-900 mb-2">Navigation Tips</h3>
                                    <p className="text-green-800">Use tooltips next to section headers for additional context</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-purple-900 mb-2">Best Practices</h3>
                                    <p className="text-purple-800">Regularly review and update your allocations based on performance data</p>
                                </div>
                            </InstructionSection>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowToUse;