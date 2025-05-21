import React, { useState, useMemo } from 'react';
import {
    LayoutDashboard, ShoppingBag, MessageSquare, Calendar, Settings, TrendingUp,
    BarChart2, HelpCircle, Inbox, Database, RefreshCw, AlertTriangle, ArrowUpRight,
    Lightbulb, CloudUpload, Search, PlusCircle, Clock, Package, Edit2,
    FileText, Trash2, Save, Layers, ListChecks, Grid, Coffee, Info, Copy,
    Sliders, LayoutTemplate, MousePointer, Percent, AlertCircle, GripVertical,
    RotateCcw, DollarSign, CalendarPlus, ArrowRight, BarChart, LineChart, Eye,
    Calculator, Truck, Link as LinkIcon, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

// Define Chick-fil-A Red
const chickFilARed = '#DD0031';

const InstructionSection = ({ title, children, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-8 ${className}`}
    >
        <h2
            className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 pb-3 border-b-2"
            style={{ borderColor: chickFilARed }} // Use Chick-fil-A red for border
        >
            {title}
        </h2>
        <div className="space-y-5">
            {children}
        </div>
    </motion.div>
);

const IconItem = ({ icon: IconComponent, title, description, to }) => {
    const content = (
        <motion.div
            whileHover={{ scale: 1.01, boxShadow: '0 6px 14px rgba(0,0,0,0.07)' }}
            className={`flex items-start space-x-4 p-4 rounded-lg bg-white border border-gray-200 transition-all duration-150 ease-in-out ${to ? 'hover:border-red-300 hover:bg-red-50' : 'hover:bg-gray-50'}`}
        >
            <div
                className="flex-shrink-0 p-3 rounded-full"
                style={{ backgroundColor: to ? `${chickFilARed}1A` : '#f3f4f6' }} // Light red or gray
            >
                <IconComponent
                    className="h-6 w-6"
                    style={{ color: to ? chickFilARed : '#4b5563' }} // Red or dark gray
                />
            </div>
            <div className="flex-1">
                <h3 className={`text-lg font-semibold ${to ? `text-[${chickFilARed}]` : 'text-gray-800'} flex items-center`}>
                    {title}
                    {to && <LinkIcon className="h-4 w-4 ml-2 opacity-70" />}
                </h3>
                <p className="text-gray-600 mt-1 text-sm leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );

    return to ? <Link to={to} className={`group block rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${chickFilARed}]`}>{content}</Link> : <div className="rounded-lg">{content}</div>;
};

const NavigationItem = ({ section, title, icon: IconComponent, activeSection, setActiveSection }) => {
    const isActive = activeSection === section;
    return (
        <motion.button
            whileHover={{ scale: isActive ? 1 : 1.02, x: isActive ? 0 : 2 }}
            whileTap={{ scale: isActive ? 1 : 0.98 }}
            onClick={() => setActiveSection(section)}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-md transition-all duration-150 ease-in-out text-left
                ${isActive
                    ? `bg-red-700 text-white font-semibold shadow-md`
                    : `text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100`
                } focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red`}
        >
            <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
            <span className="text-sm">{title}</span>
        </motion.button>
    );
};

const SearchBar = ({ value, onChange, onClear }) => (
    <div className="relative w-full max-w-2xl mx-auto mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
            type="text"
            placeholder="Search documentation... (e.g., 'dashboard', 'analytics')"
            className={`w-full pl-12 pr-10 py-3 rounded-full border-2 border-gray-200 bg-white shadow-sm
                        focus:ring-2 focus:ring-[${chickFilARed}] focus:border-[${chickFilARed}] transition-all duration-200
                        text-gray-900 placeholder-gray-500 text-base focus:outline-none`}
            value={value}
            onChange={onChange}
        />
        {value && (
            <button
                onClick={onClear}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[${chickFilARed}] p-1 rounded-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[${chickFilARed}]`}
                aria-label="Clear search"
            >
                <X className="h-5 w-5" />
            </button>
        )}
    </div>
);

const HowToUse = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    const sectionsData = useMemo(() => ({
        dashboard: { title: "Using the Dashboard", content: ["Dashboard Overview", "UPTs by Product", "Weekly Sales Projection", "Buffer Information", "Buffer Toggle", "Thawing Cabinet"] },
        analytics: { title: "Using the Sales Analytics Suite", content: ["Upload Sales Data", "Key Performance Indicators", "Performance Trends", "Top Performers", "Discrepancy Alerts", "Promotional Insights", "Record UPT Data", "Bottom Performing Items", "Filter and Search"] },
        allocation: { title: "Using the Allocation Adjustment Center", content: ["View Active Modifications", "Time Remaining", "Modification Details", "Delete Modifications", "Add New Modifications", "Set Day", "Select Product", "Set Cases and Bags", "Set Duration", "Review Summary", "Bulk Modify Allocations", "Using the Bulk Modify Form", "Set Days", "Select Products", "Set Cases and Bags", "Set Duration", "Review Summary"] },
        instructions: { title: "Using the Instructions Board", content: ["Set Day", "Select Products", "Input Instruction Message", "Save/Update Instruction", "Edit Instructions", "Delete Instruction", "Instruction Placement", "Viewing Instructions", "Modifying Instructions", "Instruction Details"] },
        closure: { title: "Using the Store Closure Feature", content: ["View Closure Plans", "Add New Closure Plan", "Closure Details", "Edit Closure Plan", "Delete Closure Plan", "Set Day", "Set Reason", "Set Duration"] },
        thawing: { title: "Using the Thawing Cabinet", content: ["Understanding Calculations", "Displaying Allocations", "Data Layout", "Closed Days", "Product Allocations", "Instruction Messages"] },
        prep: { title: "Using the Prep Allocations", content: ["Understanding Calculations", "Displaying Allocations", "Data Layout", "Closed Days", "Product Allocations", "Instruction Messages"] },
        truckorder: { title: "Truck Order Calculator", content: ["Manage Truck Items", "Sales Mix Upload", "Usage Calculation", "Order Suggestion", "Inventory Management", "Storage Info", "Bulk Import", "Filtering", "Reorder List", "Storage Overview"] },
        tips: { title: "Tips & Best Practices", content: ["File Format Tips", "Navigation Tips", "Best Practices"] },
        salesrules: { title: "Sales Projection Configuration", content: ["Configure Projection Rules", "Using Presets", "Quick Setup", "Custom Distribution", "Validation"] },
        projections: { title: "Managing Sales Projections", content: ["Projections Dashboard", "Weekly Projections", "Future Projections Calendar", "Upcoming Changes", "Projection Views"] }
    }), []);


    const filteredSections = useMemo(() => {
        if (!searchQuery) return activeSection;
        const lowerSearchQuery = searchQuery.toLowerCase();

        const foundSection = Object.keys(sectionsData).find(key => {
            const section = sectionsData[key];
            const sectionTitle = section.title.toLowerCase();
            const sectionContent = section.content.join(' ').toLowerCase();
            return sectionTitle.includes(lowerSearchQuery) || sectionContent.includes(lowerSearchQuery);
        });

        return foundSection || activeSection; // If search finds a section, make it active
    }, [searchQuery, activeSection, sectionsData]);

    // Effect to update activeSection when searchQuery changes and finds a new section
    React.useEffect(() => {
        if (searchQuery) {
            const lowerSearchQuery = searchQuery.toLowerCase();
            const foundSectionKey = Object.keys(sectionsData).find(key => {
                const section = sectionsData[key];
                const sectionTitle = section.title.toLowerCase();
                const sectionContent = section.content.join(' ').toLowerCase();
                return sectionTitle.includes(lowerSearchQuery) || sectionContent.includes(lowerSearchQuery);
            });
            if (foundSectionKey && foundSectionKey !== activeSection) {
                setActiveSection(foundSectionKey);
            }
        }
    }, [searchQuery, sectionsData, activeSection]);


    return (
        <div className="min-h-screen bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
                <div className="flex flex-col items-center mb-12 sm:mb-16 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
                        System Usage Guide
                    </h1>
                    <p className="text-gray-600 text-lg max-w-3xl">
                        Detailed instructions and best practices for utilizing all system features effectively.
                    </p>
                </div>

                <SearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                />

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
                    <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-24 self-start">
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 overflow-y-auto lg:max-h-[calc(100vh-8rem)] ">
                            <h3 className="text-sm font-semibold text-gray-500 mb-4 px-1 uppercase tracking-wider">
                                Sections
                            </h3>
                            <nav className="space-y-1.5">
                                <NavigationItem section="dashboard" title="Dashboard" icon={LayoutDashboard} activeSection={filteredSections} setActiveSection={setActiveSection} />
                                <NavigationItem section="analytics" title="Analytics Suite" icon={BarChart2} activeSection={filteredSections} setActiveSection={setActiveSection} />
                                <NavigationItem section="allocation" title="Allocation Adjustments" icon={Package} activeSection={filteredSections} setActiveSection={setActiveSection} />
                                <NavigationItem section="instructions" title="Instructions Board" icon={FileText} activeSection={filteredSections} setActiveSection={setActiveSection} />
                                <NavigationItem section="closure" title="Store Closure" icon={ListChecks} activeSection={filteredSections} setActiveSection={setActiveSection} />
                                <NavigationItem section="thawing" title="Thawing Cabinet" icon={Grid} activeSection={filteredSections} setActiveSection={setActiveSection} />
                                <NavigationItem section="prep" title="Prep Allocations" icon={Coffee} activeSection={filteredSections} setActiveSection={setActiveSection} />
                                <NavigationItem section="projections" title="Sales Projections" icon={DollarSign} activeSection={filteredSections} setActiveSection={setActiveSection} />
                                <NavigationItem section="salesrules" title="Sales Rules (Thawing)" icon={Sliders} activeSection={filteredSections} setActiveSection={setActiveSection} />
                                <NavigationItem section="truckorder" title="Truck Order Calculator" icon={Truck} activeSection={filteredSections} setActiveSection={setActiveSection} />
                                <NavigationItem section="tips" title="Tips & Best Practices" icon={Lightbulb} activeSection={filteredSections} setActiveSection={setActiveSection} />
                            </nav>
                        </div>
                    </aside>

                    <main className="flex-1 min-w-0">
                        {filteredSections === 'dashboard' && (
                            <InstructionSection title="Using the Dashboard">
                                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-5">
                                    <IconItem icon={LayoutDashboard} title="Dashboard Overview" description="The main dashboard (Admin only) provides real-time access to critical business metrics (sales, totals, averages), sales projections, UPT data, and buffer information." to="/" />
                                </div>
                                <InstructionSection title="Sales Projections Card" className="md:col-span-2 mt-6">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <IconItem icon={TrendingUp} title="14-Day Forecast" description="View a 14-day sales projection chart (current + next week). Future projections override standard weekly ones and are highlighted." />
                                        <IconItem icon={BarChart2} title="View Options" description="Toggle between 'Sequential' (14 days in order) and 'Overlap' (compare weeks side-by-side) views." />
                                        <IconItem icon={MousePointer} title="Interactive Chart" description="Hover over chart points to see date, projected sales, and default sales (if overridden by a future projection)." />
                                        <IconItem icon={Calendar} title="Daily Breakdown Cards" description="Below the chart, view individual day cards showing date, day name, and projected sales. Days with future projections are highlighted." />
                                    </div>
                                </InstructionSection>
                                <InstructionSection title="UPT Information (Admin Only)" className="md:col-span-2 mt-6">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <IconItem icon={Database} title="UPT by Product" description="View Units Per Thousand (UPT) data for thawing product categories. This data is crucial for allocation calculations." />
                                        <IconItem icon={Edit2} title="Navigate to UPT Update" description="Use the 'Update' button to navigate to the Sales Analytics Suite to upload new sales mix data and update UPTs." to="/update-upt" />
                                        <IconItem icon={ArrowUpRight} title="UPT Trend Indicators" description="The chart shows trends (up/down arrows and percentage change) compared to previous UPT values." />
                                    </div>
                                </InstructionSection>
                                <InstructionSection title="Buffer Management (Admin Only)" className="md:col-span-2 mt-6">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <IconItem icon={Layers} title="Buffer Overview" description="Monitor and manage global buffer percentages for thawing products (Chicken view) and prep items (Prep view)." />
                                        <IconItem icon={ArrowRight} title="Buffer View Toggle" description="Switch between 'Chicken' and 'Prep' views to see relevant product buffers." />
                                        <IconItem icon={Edit2} title="Quick Buffer Updates" description="Click the edit icon next to a product to modify its global buffer percentage. Changes are saved instantly." />
                                        <IconItem icon={Percent} title="Buffer Value Display" description="Shows the current buffer percentage for each item, with arrows indicating positive or negative values." />
                                    </div>
                                </InstructionSection>
                                <InstructionSection title="Dashboard Actions" className="md:col-span-2 mt-6">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <IconItem icon={Settings} title="Navigate to Settings" description="Use buttons like 'Update Sales Projection' or 'Update UPT' to quickly access relevant configuration pages." />
                                        <IconItem icon={RefreshCw} title="Real-Time Data" description="The dashboard displays the most current data available from the backend." />
                                        <IconItem icon={LayoutDashboard} title="Combined View" description="The Allocations Dashboard page provides a combined view toggling between Thawing Cabinet and Prep Allocations." to="/allocations-dashboard" />
                                    </div>
                                </InstructionSection>
                                <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                                    <h4 className={`text-lg font-semibold text-[${chickFilARed}] mb-3`}>Dashboard Best Practices</h4>
                                    <ul className={`list-disc list-inside space-y-1.5 text-red-700 text-sm`}>
                                        <li>Review the 14-day sales forecast daily, noting any future projections.</li>
                                        <li>Use the 'Overlap' view to compare weekly trends effectively.</li>
                                        <li>(Admin) Monitor UPT trends and update via the Analytics Suite as needed.</li>
                                        <li>(Admin) Adjust global buffers based on operational needs or observed trends.</li>
                                        <li>Utilize the Allocations Dashboard for a unified view of Thawing and Prep.</li>
                                    </ul>
                                </div>
                            </InstructionSection>
                        )}

                        {filteredSections === 'analytics' && (
                            <InstructionSection title="Using the Sales Analytics Suite">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <IconItem icon={CloudUpload} title="Upload Sales Mix Report" description="Upload your Excel (.xlsx, .xls) sales mix report. The system automatically parses it." to="/update-upt" />
                                    <IconItem icon={Database} title="UPT Calculation" description="Calculates and displays UPTs for both Thawing and Prep items based on the uploaded report." />
                                    <IconItem icon={BarChart} title="UPT Visualization" description="View calculated UPTs in bar charts for both Thawing and Prep categories." />
                                    <IconItem icon={TrendingUp} title="Performance Overview" description="Shows top and bottom performing items based on '# Sold Per 1000'." />
                                    <IconItem icon={AlertTriangle} title="Discrepancy & Insight Tables" description="Identifies potential issues: negative counts, low sales volume, high promo redemptions, and sales variance (Total Count vs. Sold Count)." />
                                    <IconItem icon={Info} title="Report Metadata" description="Displays the store name, report generation time, and reporting period extracted from the uploaded file." />
                                    <IconItem icon={Save} title="Submit UPT Data" description="Submit the calculated UPTs (Thawing and Prep separately) to update the system's allocation calculations." to="/update-upt" />
                                    <IconItem icon={Search} title="Filter Tables" description="Use the search fields above each analysis table (Discrepancies, Low Sales, etc.) to filter the results." />
                                </div>
                            </InstructionSection>
                        )}

                        {filteredSections === 'allocation' && (
                            <InstructionSection title="Using the Allocation Adjustment Center">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <IconItem icon={MessageSquare} title="View Active Modifications" description="Review current manual adjustments (+/- cases/bags) for *Thawing products only*." to="/data/message/all" />
                                    <IconItem icon={Clock} title="Time Remaining" description="See how long each manual adjustment will remain active before expiring." />
                                    <IconItem icon={Package} title="Modification Details" description="View the specific product, day, and quantity change for each adjustment." />
                                    <IconItem icon={Trash2} title="Delete Modifications" description="Remove an active manual adjustment using the trash icon." />
                                    <IconItem icon={PlusCircle} title="Add New Modification" description="Create a new manual adjustment for a specific Thawing product." to="/data/message/add" />
                                </div>
                                <InstructionSection title="Using the Add Allocation Adjustment Form" className="mt-6">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <IconItem icon={Calendar} title="Set Day(s)" description="Choose one or more days for the modification to apply." />
                                        <IconItem icon={Package} title="Select Product" description="Choose the specific Thawing product (Filets, Nuggets, etc.) to adjust." />
                                        <IconItem icon={Edit2} title="Set Cases/Bags Adjustment" description="Specify the quantity to add (+) or remove (-) for cases and/or bags." />
                                        <IconItem icon={Clock} title="Set Duration" description="Define how long the adjustment remains active (in days or weeks)." />
                                        <IconItem icon={Info} title="Expiry Preview" description="See the calculated expiry date and time based on the duration set." />
                                    </div>
                                </InstructionSection>
                            </InstructionSection>
                        )}

                        {filteredSections === 'instructions' && (
                            <InstructionSection title="Using the Instructions Board">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <IconItem icon={Coffee} title="Mode Selection" description="Toggle between 'Thawing' and 'Prep' modes at the top to manage instructions for each area separately." to="/instructions" />
                                    <IconItem icon={Calendar} title="Select Day(s)" description="Choose one or more days for the instruction using the day buttons." />
                                    <IconItem icon={ShoppingBag} title="Select Product(s) (Optional)" description="Optionally, select specific products (Thawing or Prep based on mode) for the instruction. Disabled products already have an instruction for a selected day." />
                                    <IconItem icon={FileText} title="Enter Instruction" description="Type the instruction message in the text area. Prep instructions are automatically tagged '[PREP]'." />
                                    <IconItem icon={Save} title="Save/Update Instruction" description="Save the new instruction or update the currently selected one." to="/instructions" />
                                    <IconItem icon={ListChecks} title="View Instructions List" description="See all instructions for the current week, filtered by the selected mode (Thawing/Prep)." to="/instructions" />
                                    <IconItem icon={Edit2} title="Edit Instruction" description="Click the pencil icon on an instruction in the list to load it for editing." />
                                    <IconItem icon={Trash2} title="Delete Instruction" description="Click the trash icon on an instruction to remove it." />
                                    <IconItem icon={Lightbulb} title="Instruction Placement" description="Instructions without products appear at the top of the day card. Product-specific instructions appear under that product's allocation." />
                                </div>
                            </InstructionSection>
                        )}

                        {filteredSections === 'closure' && (
                            <InstructionSection title="Using the Store Closure Feature">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <IconItem icon={ListChecks} title="View Closure Plans" description="Review scheduled store closures, including date, reason, duration, and status (Active/Expired)." to="/closure/plans" />
                                    <IconItem icon={Search} title="Search & Filter" description="Search closures by reason or date, and filter by status (All, Active, Expired)." />
                                    <IconItem icon={PlusCircle} title="Add New Closure Plan" description="Navigate to the form to schedule a new closure period." to="/closure/plan/add" />
                                    <IconItem icon={Trash2} title="Delete Closure Plan" description="Remove a scheduled closure using the trash icon (appears on hover). This action cannot be undone." />
                                </div>
                                <InstructionSection title="Using the Add Closure Plan Form" className="mt-6">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <IconItem icon={Calendar} title="Set Closure Date" description="Select the start date for the store closure using the date picker." />
                                        <IconItem icon={Info} title="Enter Reason" description="Provide a brief reason for the closure in the text area." />
                                        <IconItem icon={Clock} title="Set Duration" description="Specify the length of the closure (number) and the unit (Days or Weeks)." />
                                        <IconItem icon={CalendarPlus} title="Expiry Preview" description="The form shows the calculated end date and time based on the duration entered." />
                                    </div>
                                </InstructionSection>
                            </InstructionSection>
                        )}

                        {filteredSections === 'thawing' && (
                            <InstructionSection title="Using the Thawing Cabinet">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <IconItem icon={Lightbulb} title="Understanding Calculations" description="Estimates required cases/bags for Thawing products. Uses future sales projections (based on Sales Rules), UPTs, global buffers, and manual adjustments. Divides projected usage by servings per case/bag." />
                                    <IconItem icon={Grid} title="Allocation Display" description="Shows calculated allocations (cases/bags) for each Thawing product on daily cards." to="/thawing-cabinet" />
                                    <IconItem icon={LayoutDashboard} title="Data Layout" description="Each day (Mon-Sat) is a card displaying product allocations. The current day is highlighted." />
                                    <IconItem icon={AlertTriangle} title="Closed Days" description="Days affected by a scheduled Store Closure will display 'CLOSED' and the reason." />
                                    <IconItem icon={ShoppingBag} title="Product Allocations" description="Displays cases and/or bags needed for each product. Manually adjusted amounts are highlighted." />
                                    <IconItem icon={FileText} title="Instruction Messages" description="Shows general daily instructions or product-specific instructions entered via the Instructions Board (Thawing mode)." />
                                    <IconItem icon={Eye} title="Admin View" description="(Admin Only) Toggle Admin View to see detailed sales calculation breakdowns and the source of projections (weekly vs. future)." />
                                    <IconItem icon={Calendar} title="Week Toggle" description="(Admin Only) Switch between viewing the Current Week and Next Week's projected allocations." />
                                </div>
                            </InstructionSection>
                        )}

                        {filteredSections === 'prep' && (
                            <InstructionSection title="Using the Prep Allocations">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <IconItem icon={Lightbulb} title="Understanding Calculations" description="Calculates required pans/buckets for Prep items based on the *current day's* sales projection, UPTs, global buffers, and *daily* buffer adjustments. Divides projected usage by servings per pan/bucket. Unlike Thawing, Prep does *not* use future day projections or complex sales rules." />
                                    <IconItem icon={Grid} title="Allocation Display" description="Shows calculated allocations (pans/buckets) for each Prep item on daily cards." to="/prep-allocations" />
                                    <IconItem icon={LayoutDashboard} title="Data Layout" description="Each day (Mon-Sat) is a card displaying prep product allocations. The current day is highlighted." />
                                    <IconItem icon={AlertTriangle} title="Closed Days" description="Days affected by a scheduled Store Closure will display 'CLOSED' and the reason." />
                                    <IconItem icon={ShoppingBag} title="Product Allocations" description="Displays pans and/or buckets needed. Manually adjusted amounts are highlighted." />
                                    <IconItem icon={FileText} title="Instruction Messages" description="Shows general daily instructions or product-specific instructions entered via the Instructions Board (Prep mode)." />
                                    <IconItem icon={Eye} title="Admin View" description="(Admin Only) Toggle Admin View to see detailed sales calculation breakdowns and daily buffer adjustments applied." />
                                    <IconItem icon={Calendar} title="Week Toggle" description="(Admin Only) Switch between viewing the Current Week and Next Week's projected allocations." />
                                    <IconItem icon={Settings} title="Daily Buffer Adjustments" description="(Admin Only) Click the settings icon on a day card to open a modal and set specific buffer percentages (+/-) for prep items for that day only." />
                                </div>
                            </InstructionSection>
                        )}

                        {filteredSections === 'salesrules' && (
                            <InstructionSection title="Sales Projection Configuration (Thawing)">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <IconItem icon={Sliders} title="Configure Thawing Rules" description="Define how the Thawing Cabinet calculates its projections by specifying which future day's sales data to use for each day's thaw calculation." to="/thawing-cabinet/config" />
                                    <IconItem icon={LayoutTemplate} title="Preset Templates" description="Use presets ('Next Day', 'Two Days Ahead', 'Split Days') for common thawing schedules." />
                                    <IconItem icon={GripVertical} title="Drag & Drop Assignment" description="Drag a 'Source Day' token onto a target day's column to assign its sales data for calculation." />
                                    <IconItem icon={Percent} title="Percentage Weighting" description="Click on the percentage value of an assigned source day to edit it. You can split the calculation across multiple source days (must total 100%)." />
                                    <IconItem icon={Trash2} title="Remove Assignment" description="Drag an assigned source day token from a column to the 'Remove' zone (appears during drag) to delete that assignment." />
                                    <IconItem icon={Save} title="Save Configuration" description="Save your rules. The 'Save Changes' button is enabled only when changes have been made." to="/thawing-cabinet/config" />
                                </div>
                                <div className={`mt-6 p-5 bg-red-50 border border-red-200 rounded-lg`}>
                                    <h4 className={`text-md font-semibold text-[${chickFilARed}] mb-2`}>Example Scenario</h4>
                                    <p className={`text-sm leading-relaxed text-red-700`}>
                                        To set Wednesday's thaw based 70% on Thursday's sales and 30% on Friday's:
                                        <br />1. Drag 'Thursday' token to Wednesday's column.
                                        <br />2. Click the '100%' on the Thursday token in Wednesday's column, change it to '70'.
                                        <br />3. Drag 'Friday' token to Wednesday's column (it will default to the remaining 30%).
                                        <br />4. Save changes.
                                    </p>
                                </div>
                            </InstructionSection>
                        )}

                        {filteredSections === 'tips' && (
                            <InstructionSection title="Tips & Best Practices">
                                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className={`bg-white rounded-lg p-5 border-2 border-[${chickFilARed}] shadow-md`}>
                                        <h3 className={`text-lg font-semibold text-[${chickFilARed}] mb-2 flex items-center gap-2`}><FileText size={20} />File Format Tips</h3>
                                        <p className="text-gray-700 text-sm">Ensure your Excel Sales Mix reports are in .xlsx or .xls format and maintain the expected structure for correct parsing.</p>
                                    </div>
                                    <div className={`bg-white rounded-lg p-5 border-2 border-blue-500 shadow-md`}> {/* Different accent for variety */}
                                        <h3 className="text-lg font-semibold text-blue-600 mb-2 flex items-center gap-2"><MousePointer size={20} />Navigation Tips</h3>
                                        <p className="text-gray-700 text-sm">Use the main navigation bar for major sections. The 'Allocations Dashboard' provides a combined view of Thawing and Prep.</p>
                                    </div>
                                    <div className={`bg-white rounded-lg p-5 border-2 border-green-500 shadow-md`}> {/* Different accent for variety */}
                                        <h3 className="text-lg font-semibold text-green-600 mb-2 flex items-center gap-2"><Lightbulb size={20} />Best Practices</h3>
                                        <p className="text-gray-700 text-sm">Regularly upload fresh Sales Mix data for accurate UPTs. Review future projections and adjust as needed for events or holidays. Use manual adjustments sparingly.</p>
                                    </div>
                                </div>
                            </InstructionSection>
                        )}

                        {filteredSections === 'projections' && (
                            <InstructionSection title="Managing Sales Projections">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <IconItem icon={LayoutDashboard} title="Projections Dashboard Overview" description="Manage both standard weekly sales projections and specific future date projections from one place." to="/update-sales-projection" />
                                </div>
                                <InstructionSection title="Weekly Projections" className="md:col-span-2 mt-6">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <IconItem icon={Calendar} title="Standard Weekly Setup" description="Set the default sales projection ($ amount) for each day (Mon-Sat). These are used when no specific future projection exists for a date." />
                                        <IconItem icon={DollarSign} title="Input Format" description="Enter whole dollar amounts (no $ sign or decimals)." />
                                        <IconItem icon={Save} title="Update Weekly Projections" description="Save changes made to the standard weekly projections." to="/update-sales-projection" />
                                    </div>
                                </InstructionSection>
                                <InstructionSection title="Future Projections" className="md:col-span-2 mt-6">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <IconItem icon={CalendarPlus} title="Calendar View" description="Use the interactive calendar to manage projections for specific future dates." to="/update-sales-projection" />
                                        <IconItem icon={DollarSign} title="Set/Update Future Projection" description="Click a future date on the calendar to open a dialog and enter a specific sales projection amount. This overrides the standard weekly projection for that date." />
                                        <IconItem icon={Eye} title="View Existing Projections" description="Dates with future projections display the amount directly on the calendar." />
                                        <IconItem icon={Trash2} title="Remove Future Projection" description="Click a date with an existing future projection, then use the delete icon in the dialog to remove it. The system will revert to using the standard weekly projection for that date." />
                                    </div>
                                </InstructionSection>
                                <div className={`mt-8 p-6 bg-red-50 border border-red-200 rounded-lg`}>
                                    <h4 className={`text-lg font-semibold text-[${chickFilARed}] mb-3`}>Projections Best Practices</h4>
                                    <ul className={`list-disc list-inside space-y-1.5 text-red-700 text-sm`}>
                                        <li>Maintain accurate standard weekly projections as your baseline.</li>
                                        <li>Use the Future Projections calendar to account for holidays, events, or known variations.</li>
                                        <li>Regularly review and clean up past future projections if needed.</li>
                                    </ul>
                                </div>
                            </InstructionSection>
                        )}

                        {filteredSections === 'truckorder' && (
                            <InstructionSection title="Using the Truck Order Calculator">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <IconItem icon={Package} title="Manage Truck Items" description="Add, edit, or delete inventory items received via truck delivery. Define details like UOM, cost, units per case, par levels, storage info, and usage parameters." to="/truck-items" />
                                    <IconItem icon={CloudUpload} title="Sales Mix Upload" description="Upload your Excel Sales Mix report to link truck items to menu items sold. This is crucial for usage calculations." to="/truck-items" />
                                    <IconItem icon={Calculator} title="Usage Calculation" description="The system calculates projected usage for each truck item over a selected date range based on linked menu item UPTs (from Sales Mix) and sales projections." />
                                    <IconItem icon={ShoppingBag} title="Order Suggestion" description="Calculates a suggested order quantity (in cases) based on projected need, current on-hand quantity, minimum par level, and waste percentage." />
                                    <IconItem icon={Inbox} title="Inventory Management" description="Track minimum/maximum par levels, current on-hand quantity, lead time, and shelf life for each item." />
                                    <IconItem icon={Info} title="Storage & Priority" description="Assign storage type (dry, refrigerated, frozen), specific location, and priority level (critical, high, etc.) to items." />
                                    <IconItem icon={Copy} title="Bulk Import" description="Import multiple items at once by pasting tab-separated data (Description, UOM, Cost) into the bulk import dialog." />
                                    <IconItem icon={Search} title="Search & Filter" description="Search items by description, UOM, or associated menu items. Use advanced filters for storage type, priority, location, reorder status, cost, and quantity." />
                                    <IconItem icon={ListChecks} title="Reorder List View" description="Quickly view only items that are below their reorder point (On Hand <= Min Par Level), sorted by priority." />
                                    <IconItem icon={Grid} title="Storage Overview" description="View items grouped by storage type (Dry, Refrigerated, Frozen) and location." />
                                    <IconItem icon={Edit2} title="Quick Stock Update" description="Click directly on the 'On Hand' quantity in the main table to quickly update the stock level for an item." />
                                </div>
                                <div className={`mt-8 p-6 bg-red-50 border border-red-200 rounded-lg`}>
                                    <h4 className={`text-lg font-semibold text-[${chickFilARed}] mb-3`}>Truck Order Best Practices</h4>
                                    <ul className={`list-disc list-inside space-y-1.5 text-red-700 text-sm`}>
                                        <li>Ensure your Sales Mix data is up-to-date before calculating orders.</li>
                                        <li>Accurately link truck items to all relevant menu items they are used in.</li>
                                        <li>Keep On-Hand Quantities and Par Levels current for accurate suggestions.</li>
                                        <li>Use the Reorder List and Filters to prioritize ordering.</li>
                                        <li>Regularly review suggested orders against actual needs and adjust item parameters (par levels, waste %) as necessary.</li>
                                    </ul>
                                </div>
                            </InstructionSection>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default HowToUse;