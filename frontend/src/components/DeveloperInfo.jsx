import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Server, Database, Shield, ExternalLink, Workflow, Route, Settings2, PlayCircle } from 'lucide-react'; // Added icons

const DeveloperInfo = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto p-6 space-y-8 my-8"
        >
            {/* Header */}
            <motion.div
                variants={itemVariants}
                className="text-center space-y-4 mb-12"
            >
                <h1 className="text-5xl font-bold text-gray-800">
                    Technical Overview: CFA  Allocations
                </h1>
            </motion.div>

            {/* Project Purpose */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Workflow className="w-6 h-6 text-red-500" /> Project Purpose & Core Functionality
                </h2>
                <p className="text-gray-600 leading-relaxed">
                    This MERN stack application serves as an internal management tool for the Chick-fil-A  location.
                    Its primary goal is to automate and streamline inventory allocation, thawing/prep scheduling, and truck ordering.
                    It achieves this by integrating sales projections (historical and future), Units Per Thousand (UPT) data,
                    configurable product buffer percentages, and operational messages/closures into a unified system.
                    The system provides dashboards, calculation views, configuration interfaces, and reporting tools for restaurant management.
                </p>
            </motion.section>

            {/* Architecture & Tech Stack */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Server className="w-6 h-6 text-red-500" /> Architecture & Technology Stack
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            icon: <Code className="w-7 h-7 text-red-500" />,
                            title: "Frontend",
                            items: ["React.js (Vite)", "Tailwind CSS", "React Router DOM", "SWR (Data Fetching)", "Context API (Auth)", "Framer Motion (Animation)"]
                        },
                        {
                            icon: <Server className="w-7 h-7 text-red-500" />,
                            title: "Backend",
                            items: ["Node.js", "Express.js", "RESTful APIs", "JWT Authentication", "Mongoose ODM", "Security Middleware (Helmet, CORS, etc.)"]
                        },
                        {
                            icon: <Database className="w-7 h-7 text-red-500" />,
                            title: "Database",
                            items: [ "MongoDB Atlas (Cloud Hosting)", "Mongoose Schemas"]
                        },
                        {
                            icon: <Shield className="w-7 h-7 text-red-500" />,
                            title: "Key Libraries/Tools",
                            items: ["Axios", "Bcrypt (Pin Hashing)", "Node-cron (Scheduled Tasks)", "Lucide Icons", "Material Tailwind (UI Components)"]
                        }
                    ].map((stack, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                {stack.icon}
                                <h3 className="text-lg font-semibold text-gray-700">{stack.title}</h3>
                            </div>
                            <ul className="space-y-2">
                                {stack.items.map((item, i) => (
                                    <li key={i} className="text-gray-600 text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Core Modules */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Route className="w-6 h-6 text-red-500" /> Core Modules & Components
                </h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Backend (API Routes & Controllers)</h3>
                        <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/auth</code>: User login/registration (<code className="text-xs">user.controller.js</code>)</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/upt</code>: UPT data management (<code className="text-xs">salesData.controller.js</code>)</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/sales</code>: Projected sales (<code className="text-xs">projectedSales.controller.js</code>)</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/buffer</code>: Product buffer percentages (<code className="text-xs">productBuffer.controller.js</code>)</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/projections/future</code>: Specific date future projections (<code className="text-xs">futureProjection.controller.js</code>)</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/sales-projection-config</code>: Rules for thawing/prep calculations (<code className="text-xs">salesProjectionConfig.route.js</code>)</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/truck-items</code>: Inventory and ordering (<code className="text-xs">truckItem.route.js</code>)</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/closure</code>: Closure planning (<code className="text-xs">closure.controller.js</code>)</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/messages</code>: Operational messages (<code className="text-xs">message.route.js</code>)</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">/api/adjustment</code>: Manual adjustments (<code className="text-xs">dayData.controller.js</code>)</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Frontend (Key Components)</h3>
                        <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                            <li><code className="text-xs bg-gray-100 px-1 rounded">HomePage.jsx</code>: Main dashboard, sales charts, buffer overview.</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">ThawingCabinet.jsx</code>: Calculates and displays thawing needs.</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">PrepAllocations.jsx</code>: Calculates and displays prep needs.</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">TruckItems.jsx</code>: Manages truck inventory, calculates reorder points.</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">UpdateUPTs.jsx</code> / <code className="text-xs">UpdateSalesProjection.jsx</code>: Interfaces for updating core data.</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">SalesProjectionConfig.jsx</code>: UI for configuring calculation rules.</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">AuthContext.jsx</code> / <code className="text-xs">LoginPage.jsx</code>: Handles authentication state and login.</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">App.jsx</code>: Main router setup, lazy loading, SWR config.</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">useCalculateThawingData</code> (in ThawingCabinet): Core hook using sales config, projections, UPTs, global buffers.</li>
                            <li><code className="text-xs bg-gray-100 px-1 rounded">useCalculatePrepData</code> (in PrepAllocations): Core hook using projections, UPTs, daily/global buffers, drink multiplier.</li>
                        </ul>
                    </div>
                </div>
            </motion.section>

            {/* Key Configuration Points */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings2 className="w-6 h-6 text-red-500" /> Key Configuration Points & Data Sources
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                    The application's calculations rely on several configurable data points fetched from the backend:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                    <li><strong className="font-semibold text-gray-700">Projected Sales</strong> (<code className="text-xs bg-gray-100 px-1 rounded">/api/sales</code>): Base weekly sales forecast per day.</li>
                    <li><strong className="font-semibold text-gray-700">Future Projections</strong> (<code className="text-xs bg-gray-100 px-1 rounded">/api/projections/future</code>): Overrides projected sales for specific future dates.</li>
                    <li><strong className="font-semibold text-gray-700">UPTs</strong> (<code className="text-xs bg-gray-100 px-1 rounded">/api/upt</code>): Units Through Put per product, used in most calculations. Stored in <code className="text-xs bg-gray-100 px-1 rounded">SalesData</code> model (includes <code className="text-xs bg-gray-100 px-1 rounded">oldUPT</code> for trends).</li>
                    <li><strong className="font-semibold text-gray-700">Global Buffers</strong> (<code className="text-xs bg-gray-100 px-1 rounded">/api/buffer</code>): Base buffer percentage per product. Stored in <code className="text-xs bg-gray-100 px-1 rounded">ProductBuffer</code> model.</li>
                    <li><strong className="font-semibold text-gray-700">Daily Buffers</strong> (<code className="text-xs bg-gray-100 px-1 rounded">/api/daily-buffer</code>): Optional buffer percentage overrides for specific products on specific days (used only in Prep calculations). Stored in <code className="text-xs bg-gray-100 px-1 rounded">DailyBuffer</code> model.</li>
                    <li><strong className="font-semibold text-gray-700">Sales Projection Config</strong> (<code className="text-xs bg-gray-100 px-1 rounded">/api/sales-projection-config</code>): Defines rules for Thawing calculations, specifying which future day's sales (and percentage) to use for the current day's thaw. Stored in <code className="text-xs bg-gray-100 px-1 rounded">SalesProjectionConfig</code> model.</li>
                    <li><strong className="font-semibold text-gray-700">Manual Adjustments</strong> (<code className="text-xs bg-gray-100 px-1 rounded">/api/adjustment</code>): Allows adding/subtracting cases/pans/buckets for specific products/days. Messages tagged <code className="text-xs bg-gray-100 px-1 rounded">[PREP]</code> affect Prep, others affect Thawing. Stored in <code className="text-xs bg-gray-100 px-1 rounded">DayData</code> model.</li>
                    <li><strong className="font-semibold text-gray-700">Closures</strong> (<code className="text-xs bg-gray-100 px-1 rounded">/api/closure</code>): Defines periods when the store is closed, impacting display. Stored in <code className="text-xs bg-gray-100 px-1 rounded">ClosurePlan</code> model.</li>
                    <li><strong className="font-semibold text-gray-700">Messages</strong> (<code className="text-xs bg-gray-100 px-1 rounded">/api/messages</code>): General operational messages displayed on relevant day cards. Stored in <code className="text-xs bg-gray-100 px-1 rounded">Message</code> model.</li>
                    <li><strong className="font-semibold text-gray-700">Truck Items / Sales Mix</strong> (<code className="text-xs bg-gray-100 px-1 rounded">/api/truck-items</code>, <code className="text-xs bg-gray-100 px-1 rounded">/api/salesmix</code>): Used for inventory tracking and reorder calculations.</li>
                </ul>
            </motion.section>

            {/* Key Data Flows */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Workflow className="w-6 h-6 text-red-500" /> Key Data Flows
                </h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">1. Thawing Calculation (Chicken)</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            <code className="text-xs bg-gray-100 px-1 rounded">ThawingCabinet.jsx</code> fetches data (Sales, UPTs, Global Buffers, Sales Projection Config, Future Projections, Adjustments).
                            The <code className="text-xs">useCalculateThawingData</code> hook determines the relevant *source sales day* based on the <code className="text-xs">salesProjectionConfig</code> (e.g., Wed thaw uses Thu sales). It prioritizes future projections for the source day's sales figure.
                            It then calculates needed cases/bags using the source sales, product UPT, product-specific divisor, and global buffer percentage. Manual adjustments (non-`[PREP]`) are applied. Results shown in <code className="text-xs">DayCard</code>.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">2. Prep Calculation</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            <code className="text-xs bg-gray-100 px-1 rounded">PrepAllocations.jsx</code> fetches data (Sales, UPTs, Global Buffers, Daily Buffers, Future Projections, Adjustments).
                            The <code className="text-xs">useCalculatePrepData</code> hook uses the projected sales for the *target day* (prioritizing future projections).
                            It calculates needed pans/buckets using the target sales, product UPT, product-specific divisor/formula, and buffer percentage (prioritizing *daily* buffers over global ones). A drink multiplier (0.75 Mon-Fri, 1.0 Sat) is used for lemonades. Manual adjustments tagged `[PREP]` are applied. Results shown in <code className="text-xs">DayCard</code>.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">3. User Authentication</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            User enters credentials in <code className="text-xs bg-gray-100 px-1 rounded">LoginPage.jsx</code>, which sends a request to <code className="text-xs">/api/auth/login</code>.
                            The backend (<code className="text-xs">user.controller.js</code>) verifies credentials (hashed PIN) against the <code className="text-xs">User</code> model.
                            On success, it generates a JWT and sends it back (likely via HTTP-only cookie).
                            <code className="text-xs">AuthContext.jsx</code> manages the user state and token persistence.
                            <code className="text-xs">axiosInstance.jsx</code> likely attaches the token to subsequent requests.
                            <code className="text-xs">ProtectedRoute</code> in <code className="text-xs">App.jsx</code> checks the auth state before rendering protected routes.
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* Setup & Running */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <PlayCircle className="w-6 h-6 text-red-500" /> Setup & Running
                </h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-600">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Frontend</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Built with Vite.</li>
                            <li>Run locally: <code className="text-xs bg-gray-100 px-1 rounded">npm run dev</code> (or `yarn dev`) in the <code className="text-xs">frontend</code> directory.</li>
                            <li>Build for production: <code className="text-xs bg-gray-100 px-1 rounded">npm run build</code> (or `yarn build`).</li>
                            <li>Requires backend API to be running.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Backend</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Node.js/Express application.</li>
                            <li>Likely run using <code className="text-xs bg-gray-100 px-1 rounded">node backend/server.js</code> or a process manager like PM2.</li>
                            <li>Requires environment variables for configuration (e.g., <code className="text-xs">DATABASE_URL</code>, <code className="text-xs">PORT</code>, <code className="text-xs">JWT_SECRET</code>). Check deployment environment or look for a <code className="text-xs">.env</code> file template.</li>
                            <li>Connects to a MongoDB database.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Utilities & Considerations</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li><code className="text-xs bg-gray-100 px-1 rounded">KeepBackendWarm.jsx</code> component periodically pings the backend health check endpoint (<code className="text-xs">/api/health</code>) to prevent serverless function cold starts.</li>
                            <li>Screen Wake Lock API is used in <code className="text-xs bg-gray-100 px-1 rounded">App.jsx</code> to attempt preventing the screen from sleeping, useful for dashboard views.</li>
                        </ul>
                    </div>
                </div>
            </motion.section>

            {/* Developer Profile */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Placeholder or actual image */}
                    <div className="w-36 h-36 rounded-full overflow-hidden shadow-md bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-24 h-24 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">Jashanpreet Singh</h2>
                            <p className="text-lg text-gray-500">Original Developer</p>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Full-stack developer with expertise in modern web frameworks, mobile apps and automation solutions.
                            Specialized in building scalable applications using MERN stack, Next.js, Django, and Nest.js.
                            Passionate about creating efficient business solutions through intelligent automation.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-1">
                            <a
                                href="https://eljsn.vercel.app/#contact"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] text-sm"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Version Info & Support */}
            <motion.section
                variants={itemVariants}
                className="grid md:grid-cols-2 gap-6 text-sm"
            >
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Version Information</h3>
                    <div className="space-y-1 text-gray-600">
                        {/* Consider making this dynamic if possible, otherwise keep static */}
                        <p>Current Version: 4.1.1</p>
                        <p>Last Updated: 04/06/2025</p>
                        <p>Environment: Production</p>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default DeveloperInfo;
