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
    Save,
    Layers,
    ListChecks,
    Grid,
    Coffee,
    Info,
    Copy,
    Sliders,
    LayoutTemplate,
    MousePointer,
    Percent,
    AlertCircle,
    GripVertical,
    RotateCcw,
    DollarSign,
    CalendarPlus,
    ArrowRight,
    BarChart,
    LineChart
} from 'lucide-react';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

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
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-50 rounded-2xl shadow-sm p-8 mb-6 ${className}`}
    >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        {children}
    </motion.div>
);

const IconItem = ({ icon: IconComponent, title, description }) => (
    <motion.div
        whileHover={{ scale: 1.01 }}
        className="flex items-start space-x-4 p-5 rounded-xl bg-white border border-gray-100 
                   shadow-sm hover:shadow-md transition-all"
    >
        <div className="flex-shrink-0 p-2 bg-red-50 rounded-lg">
            <IconComponent className="h-6 w-6 text-red-600" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-1 leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

const NavigationItem = ({ section, title, icon: IconComponent, activeSection, setActiveSection }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setActiveSection(section)}
        className={`flex items-center space-x-3 w-full p-4 rounded-xl transition-all
            ${activeSection === section
                ? 'bg-red-50 text-red-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
    >
        <IconComponent className="h-5 w-5" />
        <span className="font-medium">{title}</span>
    </motion.button>
);

const SearchBar = ({ value, onChange }) => (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
            type="text"
            placeholder="Search documentation... (e.g., 'dashboard', 'analytics', 'allocation')"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm 
                     focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all
                     text-gray-900 placeholder-gray-500"
            value={value}
            onChange={onChange}
        />
        {value && (
            <button
                onClick={() => onChange({ target: { value: '' } })}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
                Clear
            </button>
        )}
    </div>
);

const HowToUse = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSections = useMemo(() => {
        if (!searchQuery) return activeSection;

        const sections = {
            dashboard: { title: "Using the Dashboard", content: ["Dashboard Overview", "UPTs by Product", "Weekly Sales Projection", "Buffer Information", "Buffer Toggle", "Thawing Cabinet"] },
            analytics: { title: "Using the Sales Analytics Suite", content: ["Upload Sales Data", "Key Performance Indicators", "Performance Trends", "Top Performers", "Discrepancy Alerts", "Promotional Insights", "Record UPT Data", "Bottom Performing Items", "Filter and Search"] },
            allocation: { title: "Using the Allocation Adjustment Center", content: ["View Active Modifications", "Time Remaining", "Modification Details", "Delete Modifications", "Add New Modifications", "Set Day", "Select Product", "Set Cases and Bags", "Set Duration", "Review Summary", "Bulk Modify Allocations", "Using the Bulk Modify Form", "Set Days", "Select Products", "Set Cases and Bags", "Set Duration", "Review Summary"] },
            instructions: { title: "Using the Instructions Board", content: ["Set Day", "Select Products", "Input Instruction Message", "Save/Update Instruction", "Edit Instructions", "Delete Instruction", "Instruction Placement", "Viewing Instructions", "Modifying Instructions", "Instruction Details"] },
            closure: { title: "Using the Store Closure Feature", content: ["View Closure Plans", "Add New Closure Plan", "Closure Details", "Edit Closure Plan", "Delete Closure Plan", "Set Day", "Set Reason", "Set Duration"] },
            thawing: { title: "Using the Thawing Cabinet", content: ["Understanding Calculations", "Displaying Allocations", "Data Layout", "Closed Days", "Product Allocations", "Instruction Messages"] },
            prep: { title: "Using the Prep Allocations", content: ["Understanding Calculations", "Displaying Allocations", "Data Layout", "Closed Days", "Product Allocations", "Instruction Messages"] },
            tips: { title: "Tips & Best Practices", content: ["File Format Tips", "Navigation Tips", "Best Practices"] },
            salesrules: { title: "Sales Projection Configuration", content: ["Configure Projection Rules", "Using Presets", "Quick Setup", "Custom Distribution", "Validation"] },
            projections: { title: "Managing Sales Projections", content: ["Projections Dashboard", "Weekly Projections", "Future Projections Calendar", "Upcoming Changes", "Projection Views"] }
        }
        const found = Object.keys(sections).find(key => {
            return sections[key].content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
        });
        return found || activeSection;
    }, [searchQuery, activeSection])

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col items-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        How to Use the System
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl text-center">
                        Find detailed instructions and best practices for using all features of the system.
                    </p>
                </div>

                <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

                <div className="flex gap-8">
                    {/* Navigation Sidebar */}
                    <div className="w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 px-4">
                                Navigation
                            </h3>
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
                                    section="closure"
                                    title="Store Closure"
                                    icon={ListChecks}
                                    activeSection={filteredSections}
                                    setActiveSection={setActiveSection}
                                />
                                <NavigationItem
                                    section="thawing"
                                    title="Thawing Cabinet"
                                    icon={Grid}
                                    activeSection={filteredSections}
                                    setActiveSection={setActiveSection}
                                />
                                <NavigationItem
                                    section="prep"
                                    title="Prep Allocations"
                                    icon={Coffee}
                                    activeSection={filteredSections}
                                    setActiveSection={setActiveSection}
                                />
                                <NavigationItem
                                    section="projections"
                                    title="Sales Projections"
                                    icon={DollarSign}
                                    activeSection={filteredSections}
                                    setActiveSection={setActiveSection}
                                />
                                <NavigationItem
                                    section="salesrules"
                                    title="Sales Rules"
                                    icon={Sliders}
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

                    {/* Main Content Area */}
                    <div className="flex-1 max-w-4xl">
                        {/* Dashboard Section */}
                        {filteredSections === 'dashboard' && (
                            <InstructionSection title="Using the Dashboard">
                                <div className="grid gap-4">
                                    <IconItem
                                        icon={LayoutDashboard}
                                        title="Dashboard Overview"
                                        description="The main dashboard provides real-time access to critical business metrics, sales projections, and buffer information. The layout is organized into distinct cards for easy monitoring and quick actions."
                                    />

                                    {/* Sales Projections Section */}
                                    <InstructionSection title="Sales Projections Card" className="mt-4">
                                        <div className="grid gap-4">
                                            <IconItem
                                                icon={TrendingUp}
                                                title="14-Day Forecast"
                                                description="View a comprehensive 14-day sales projection chart showing both current and next week's projections. The chart updates automatically when projections are modified."
                                            />
                                            <IconItem
                                                icon={BarChart2}
                                                title="View Options"
                                                description="Toggle between Sequential view (all 14 days in order) and Overlap view (compare weeks) using the buttons above the chart. Each view offers different insights into your projections."
                                            />
                                            <IconItem
                                                icon={MousePointer}
                                                title="Interactive Features"
                                                description="Hover over any point on the chart to see the exact date and projected sales amount. Points with modified projections are highlighted for easy identification."
                                            />
                                            <IconItem
                                                icon={Calendar}
                                                title="Daily Breakdown"
                                                description="Below the chart, find individual cards for each day showing the date, day of week, and projected sales amount. Modified projections are highlighted with an indigo border."
                                            />
                                        </div>
                                    </InstructionSection>

                                    {/* UPT Section */}
                                    <InstructionSection title="UPT Information" className="mt-4">
                                        <div className="grid gap-4">
                                            <IconItem
                                                icon={Database}
                                                title="UPT by Product"
                                                description="(Admin Only) View Units Per Thousand (UPT) data for each product category. This data is crucial for allocation calculations and is automatically applied to projections."
                                            />
                                            <IconItem
                                                icon={Edit2}
                                                title="Quick UPT Updates"
                                                description="Admins can quickly update UPT values directly from the dashboard. Changes immediately affect allocation calculations across the system."
                                            />
                                            <IconItem
                                                icon={ArrowUpRight}
                                                title="Performance Indicators"
                                                description="Green arrows indicate improved performance, while red arrows show decreased performance compared to previous periods."
                                            />
                                        </div>
                                    </InstructionSection>

                                    {/* Buffer Information */}
                                    <InstructionSection title="Buffer Management" className="mt-4">
                                        <div className="grid gap-4">
                                            <IconItem
                                                icon={Layers}
                                                title="Buffer Overview"
                                                description="Monitor and manage buffer percentages for both chicken products and prep items. Each product's current buffer percentage is clearly displayed with color-coding."
                                            />
                                            <IconItem
                                                icon={ArrowRight}
                                                title="Buffer Toggle"
                                                description="Switch between Chicken and Prep views using the toggle buttons. Each view shows relevant products and their current buffer settings."
                                            />
                                            <IconItem
                                                icon={Edit2}
                                                title="Quick Buffer Updates"
                                                description="Click the edit icon next to any product to modify its buffer percentage. Changes are saved automatically and immediately affect allocation calculations."
                                            />
                                            <IconItem
                                                icon={AlertTriangle}
                                                title="Buffer Indicators"
                                                description="Color-coding helps quickly identify buffer levels: Red for low buffer, Yellow for moderate, and Green for optimal buffer percentages."
                                            />
                                        </div>
                                    </InstructionSection>

                                    {/* Quick Actions */}
                                    <InstructionSection title="Dashboard Actions" className="mt-4">
                                        <div className="grid gap-4">
                                            <IconItem
                                                icon={Settings}
                                                title="Quick Access"
                                                description="Use the action buttons at the top of each card to quickly navigate to detailed views or make updates. Admin users see additional options for system configuration."
                                            />
                                            <IconItem
                                                icon={RefreshCw}
                                                title="Real-Time Updates"
                                                description="The dashboard automatically refreshes to show the latest data. Modified values are highlighted to easily track recent changes."
                                            />
                                            <IconItem
                                                icon={MessageSquare}
                                                title="Status Messages"
                                                description="Important system messages and updates appear at the top of the dashboard. Click messages to see more details or take required actions."
                                            />
                                        </div>
                                    </InstructionSection>
                                </div>

                                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                    <p className="text-blue-800">
                                        <strong>Dashboard Best Practices:</strong>
                                        <br />1. Review the sales projection chart daily to spot any unusual patterns
                                        <br />2. Monitor buffer percentages regularly and adjust based on actual needs
                                        <br />3. Pay attention to color indicators for quick status assessment
                                        <br />4. Use the overlap view to compare week-over-week projections
                                        <br />5. Check UPT data weekly to ensure accurate allocation calculations
                                    </p>
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
                                    <IconItem
                                        icon={Copy}
                                        title="Bulk Modify Allocations"
                                        description="Click the bulk modify icon to adjust multiple product allocations at once."
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
                                <InstructionSection title="Using the Bulk Modify Form" className="mt-4">
                                    <div className="grid gap-4">

                                        <IconItem
                                            icon={Package}
                                            title="Select Products"
                                            description="Choose the products that will be affected by this adjustment."
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
                                        <IconItem
                                            icon={PlusCircle}
                                            title="Click Bulk Modify"
                                            description="Click the bulk modify button to get the pop-up to select days."
                                        />
                                        <IconItem
                                            icon={Calendar}
                                            title="Set Days"
                                            description="Choose the days on which these modifications will take place. You can select multiple days."
                                        />
                                    </div>
                                </InstructionSection>
                                <InstructionSection title="Using the Sales Projection Rules">
                                    <div className="grid gap-4">
                                        <IconItem
                                            icon={Sliders}
                                            title="Configure Projection Rules"
                                            description="Set up rules for how sales data from different days is used to calculate thawing cabinet projections"
                                        />
                                        <IconItem
                                            icon={LayoutTemplate}
                                            title="Preset Configurations"
                                            description="Choose from preset configurations like 'Next Day', 'Two Days Ahead', or 'Split Between Days'"
                                        />
                                        <IconItem
                                            icon={MousePointer}
                                            title="Quick Adjustments"
                                            description="Click on any day to instantly set it to 100% and others to 0%, or manually fine-tune percentages"
                                        />
                                        <IconItem
                                            icon={Percent}
                                            title="Percentage Distribution"
                                            description="Distribute percentages across different days to create custom projection calculations"
                                        />
                                        <IconItem
                                            icon={AlertCircle}
                                            title="Validation"
                                            description="System ensures percentages always total 100% for accurate projections"
                                        />
                                        <IconItem
                                            icon={Save}
                                            title="Save Configuration"
                                            description="Save your custom configuration to be used in thawing cabinet calculations"
                                        />
                                    </div>
                                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                        <p className="text-blue-800">
                                            <strong>Example:</strong> Setting Wednesday to use 70% of Thursday's sales and 30% of Friday's
                                            sales means Wednesday's projections will be calculated using a weighted average of those two days.
                                        </p>
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
                                        description="Click on the day you want to add an instruction to. You can select multiple days."
                                    />
                                    <IconItem
                                        icon={ShoppingBag}
                                        title="Select Products"
                                        description="Click on the products you want this instruction to apply to. If you don't select any products, the instruction will be displayed at the top of each selected day. A Disabled product implies that an instruction is already set for that product on the selected day."
                                    />
                                    <IconItem
                                        icon={FileText}
                                        title="Input Instruction Message"
                                        description="Enter your instruction message in the text field provided."
                                    />
                                    <IconItem
                                        icon={PlusCircle}
                                        title="Save/Update Instruction"
                                        description="Click the save button to create a new instruction, or update an existing instruction"
                                    />
                                    <IconItem
                                        icon={Edit2}
                                        title="Edit Instructions"
                                        description="Click the pencil icon on the instruction listing to start editing that instruction"
                                    />
                                    <IconItem
                                        icon={Trash2}
                                        title="Delete Instruction"
                                        description="Click the trash icon to permanently delete an instruction"
                                    />
                                    <IconItem
                                        icon={Lightbulb}
                                        title="Instruction Placement"
                                        description="Instructions without products will appear at the top of the day card, while product specific instructions will be displayed under the corresponding product's allocation"
                                    />
                                </div>
                                <InstructionSection title="Using the instruction listing" className="mt-4">
                                    <div className="grid gap-4">
                                        <IconItem
                                            icon={Calendar}
                                            title="Viewing Instructions"
                                            description="The instruction listing displays all the current week's instructions for each day"
                                        />
                                        <IconItem
                                            icon={Edit2}
                                            title="Modifying Instructions"
                                            description="Use the pencil icon to edit a selected instruction, or the trash icon to delete a selected instruction."
                                        />
                                        <IconItem
                                            icon={FileText}
                                            title="Instruction Details"
                                            description="The instruction listing displays the day, message, and products assigned to each instruction."
                                        />
                                    </div>
                                </InstructionSection>
                            </InstructionSection>
                        )}
                        {/* Store Closure Section */}
                        {filteredSections === 'closure' && (
                            <InstructionSection title="Using the Store Closure Feature">
                                <div className="grid gap-4">
                                    <IconItem
                                        icon={ListChecks}
                                        title="View Closure Plans"
                                        description="Review a list of all scheduled store closures with their reasons and expiration times."
                                    />
                                    <IconItem
                                        icon={PlusCircle}
                                        title="Add New Closure Plan"
                                        description="Use the add plan button to start creating a new closure plan."
                                    />
                                    <IconItem
                                        icon={Calendar}
                                        title="Closure Details"
                                        description="Review the date, reason, and duration of each closure listed."
                                    />
                                    <IconItem
                                        icon={Edit2}
                                        title="Edit Closure Plan"
                                        description="Note: Once a closure plan has been set, the details cannot be directly modified"
                                    />
                                    <IconItem
                                        icon={Trash2}
                                        title="Delete Closure Plan"
                                        description="Use the delete icon to remove a scheduled closure. This action is irreversible."
                                    />
                                </div>
                                <InstructionSection title="Using the Add Closure Plan Form" className="mt-4">
                                    <div className="grid gap-4">
                                        <IconItem
                                            icon={Calendar}
                                            title="Set Day"
                                            description="Choose the day when the store will be closed by using the datepicker."
                                        />
                                        <IconItem
                                            icon={Info}
                                            title="Set Reason"
                                            description="Enter the reason for the store closure using the available textfield."
                                        />
                                        <IconItem
                                            icon={Clock}
                                            title="Set Duration"
                                            description="Choose the duration the store will be closed for, and choose between days or weeks using the select field."

                                        />

                                    </div>
                                </InstructionSection>

                            </InstructionSection>
                        )}
                        {/* Thawing Cabinet Section */}
                        {filteredSections === 'thawing' && (
                            <InstructionSection title="Using the Thawing Cabinet">
                                <div className="grid gap-4">
                                    <IconItem
                                        icon={Lightbulb}
                                        title="Understanding Calculations"
                                        description="The thawing cabinet estimates the required number of cases and bags for each product by using the following process: It starts with the sales projection of the following day, and divides it by the number of servings per case or bag. This results in a base allocation. This allocation is then multiplied by the buffer percentage, which allows for extra or less depending on the percentage value. This final amount is displayed under each product for each day."
                                    />
                                    <IconItem
                                        icon={Grid}
                                        title="Displaying Allocations"
                                        description="The Thawing Cabinet displays your calculated allocations for each day of the week based on sales, UPT, and buffer data."
                                    />
                                    <IconItem
                                        icon={LayoutDashboard}
                                        title="Data Layout"
                                        description="Each day of the week is displayed as a card with the allocations for each product"
                                    />
                                    <IconItem
                                        icon={AlertTriangle}
                                        title="Closed Days"
                                        description="If there is a store closure scheduled for a day, the day card will display a closed indicator, with the specified closure reason."
                                    />
                                    <IconItem
                                        icon={ShoppingBag}
                                        title="Product Allocations"
                                        description="The allocated amount is displayed in cases or bags underneath each product title. Modified amounts are highlighted in red."
                                    />
                                    <IconItem
                                        icon={FileText}
                                        title="Instruction Messages"
                                        description="Any instruction message set for a day, with or without product specific instructions, is displayed on that day."
                                    />
                                </div>
                            </InstructionSection>
                        )}
                        {/* Prep Allocations Section */}
                        {filteredSections === 'prep' && (
                            <InstructionSection title="Using the Prep Allocations">
                                <div className="grid gap-4">
                                    <IconItem
                                        icon={Lightbulb}
                                        title="Understanding Calculations"
                                        description="The Prep Allocations calculates the number of pans and buckets needed for your prep items based on current day's sales. The system multiplies your daily sales by the UPT value for that item, and divides it by servings per pan, or servings per bucket to estimate the number of pans or buckets needed. It then multiplies the amount by the specified buffer percentage to adjust the quantity of each item."
                                    />
                                    <IconItem
                                        icon={Grid}
                                        title="Displaying Allocations"
                                        description="The Prep Allocations display your calculated allocations for each day of the week."
                                    />
                                    <IconItem
                                        icon={LayoutDashboard}
                                        title="Data Layout"
                                        description="Each day of the week is displayed as a card with the allocations for each prep product."
                                    />
                                    <IconItem
                                        icon={AlertTriangle}
                                        title="Closed Days"
                                        description="If there is a store closure scheduled for a day, the day card will display a closed indicator, along with the specified reason."
                                    />
                                    <IconItem
                                        icon={ShoppingBag}
                                        title="Product Allocations"
                                        description="The allocated amount is displayed in pans and buckets underneath each product title. Modified amounts are highlighted in red."
                                    />
                                    <IconItem
                                        icon={FileText}
                                        title="Instruction Messages"
                                        description="Any instruction message set for a day, with or without product specific instructions, is displayed on that day."
                                    />
                                </div>
                            </InstructionSection>
                        )}
                        {/* Sales Rules Section */}
                        {filteredSections === 'salesrules' && (
                            <InstructionSection title="Sales Rules Configuration">
                                <div className="grid gap-4">
                                    <IconItem
                                        icon={Sliders}
                                        title="Configure Rules"
                                        description="Set up rules for how sales data from different days is used to calculate projections"
                                    />
                                    <IconItem
                                        icon={LayoutTemplate}
                                        title="Preset Templates"
                                        description="Choose from preset configurations for quick setup of common projection patterns"
                                    />
                                    <IconItem
                                        icon={GripVertical}
                                        title="Custom Distribution"
                                        description="Drag and drop days to create custom projection calculation rules"
                                    />
                                    <IconItem
                                        icon={Percent}
                                        title="Weight Distribution"
                                        description="Set percentage weights to determine how much each source day influences the projection"
                                    />
                                    <IconItem
                                        icon={Save}
                                        title="Save Rules"
                                        description="Save your configuration to apply the new calculation rules"
                                    />
                                </div>

                                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                    <p className="text-blue-800">
                                        <strong>Example:</strong> To set up Wednesday's projections:
                                        <br />1. Drag 'Thursday' to Wednesday's column (it will default to 100%)
                                        <br />2. Click the percentage to adjust it to 70%
                                        <br />3. Drag 'Friday' to Wednesday's column for the remaining 30%
                                        <br />4. Save your changes when ready
                                    </p>
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
                                    <p className="text-green-800">Clicking the titles on both Thawing Cabinet and Prep Allocations takes back to the home page. Use tooltips next to section headers for additional context</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-purple-900 mb-2">Best Practices</h3>
                                    <p className="text-purple-800">Regularly review and update your allocations based on performance data</p>
                                </div>
                            </InstructionSection>
                        )}

                        {/* Sales Projections Section */}
                        {filteredSections === 'projections' && (
                            <InstructionSection title="Managing Sales Projections">
                                <div className="grid gap-4">
                                    <IconItem
                                        icon={LayoutDashboard}
                                        title="Projections Dashboard Overview"
                                        description="The Sales Projections Dashboard provides a comprehensive view of both your weekly standard projections and any future date-specific projections. Access this through the 'Update Sales Projection' button on the homepage."
                                    />

                                    {/* Weekly Projections */}
                                    <InstructionSection title="Weekly Projections" className="mt-4">
                                        <div className="grid gap-4">
                                            <IconItem
                                                icon={Calendar}
                                                title="Standard Weekly Setup"
                                                description="The left panel shows input fields for Monday through Saturday. These values serve as your default weekly projections when no specific future projection is set."
                                            />
                                            <IconItem
                                                icon={DollarSign}
                                                title="Direct Input"
                                                description="Enter dollar amounts without the $ symbol. The system automatically formats your input. Use whole numbers only - no decimals or special characters."
                                            />
                                            <IconItem
                                                icon={Save}
                                                title="Save Changes"
                                                description="Click 'Update Weekly Projections' to save your changes. The button shows a loading spinner while saving, and a green success message appears when complete."
                                            />
                                            <IconItem
                                                icon={AlertCircle}
                                                title="Validation"
                                                description="All fields must contain valid numbers. Empty fields will be treated as $0. The system prevents invalid inputs like negative numbers."
                                            />
                                        </div>
                                    </InstructionSection>

                                    {/* Future Projections */}
                                    <InstructionSection title="Future Projections Calendar" className="mt-4">
                                        <div className="grid gap-4">
                                            <IconItem
                                                icon={CalendarPlus}
                                                title="Interactive Calendar"
                                                description="The calendar shows the next 14 days. Dates with existing projections are highlighted and display their projected amount. Past dates are grayed out and disabled."
                                            />
                                            <IconItem
                                                icon={MousePointer}
                                                title="Setting Projections"
                                                description="Click any future date to open the projection dialog. Enter the projected sales amount for that specific date. This will override the standard weekly projection for that day."
                                            />
                                            <IconItem
                                                icon={Trash2}
                                                title="Managing Projections"
                                                description="When viewing a date with an existing projection, use the trash icon in the dialog to remove it. This will revert that date back to using the standard weekly projection."
                                            />
                                            <IconItem
                                                icon={Info}
                                                title="Visual Indicators"
                                                description="Dates with projections show the amount below the date. The current date is marked with a dot. Sundays show in red as they're typically closed."
                                            />
                                        </div>
                                    </InstructionSection>

                                    {/* Upcoming Changes */}
                                    <InstructionSection title="Upcoming Changes" className="mt-4">
                                        <div className="grid gap-4">
                                            <IconItem
                                                icon={Clock}
                                                title="Future Updates Panel"
                                                description="The bottom section shows all future projections that will be automatically applied next Sunday. Each entry shows the target date and the new projection amount."
                                            />
                                            <IconItem
                                                icon={ArrowRight}
                                                title="Automatic Updates"
                                                description="Every Sunday at midnight, the system automatically applies any future projections for the upcoming week to your weekly projections. These changes override the standard weekly values."
                                            />
                                            <IconItem
                                                icon={RefreshCw}
                                                title="Update Cycle"
                                                description="After projections are applied, they're marked as 'applied' in the system and won't appear in the upcoming changes list anymore. New projections can then be set for those dates in future weeks."
                                            />
                                        </div>
                                    </InstructionSection>

                                    {/* Chart Views */}
                                    <InstructionSection title="Projection Views" className="mt-4">
                                        <div className="grid gap-4">
                                            <IconItem
                                                icon={BarChart}
                                                title="Sequential View"
                                                description="The default view shows a continuous line chart of all 14 days. Each point shows the date and projected amount. Hover over points to see detailed information."
                                            />
                                            <IconItem
                                                icon={LineChart}
                                                title="Overlap View"
                                                description="Switch to this view to compare weeks directly. Current week shows as a solid line, next week as dotted. When projections match between weeks, hovering shows both dates."
                                            />
                                            <IconItem
                                                icon={TrendingUp}
                                                title="Chart Features"
                                                description="The chart automatically scales to show your data clearly. The y-axis starts slightly below your lowest projection and ends above your highest for optimal visibility."
                                            />
                                        </div>
                                    </InstructionSection>
                                </div>

                                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                    <p className="text-blue-800">
                                        <strong>Best Practices:</strong>
                                        <br />1. Set your standard weekly projections first as a baseline
                                        <br />2. Use future projections for known variations (events, holidays, etc.)
                                        <br />3. Review the upcoming changes section regularly to stay aware of scheduled updates
                                        <br />4. Use the overlap view to easily spot significant variations between weeks
                                    </p>
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