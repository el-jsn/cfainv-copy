import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Server, Database, Shield, Github, ExternalLink } from 'lucide-react';

const DeveloperInfo = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto p-6 space-y-10 my-8"
        >
            {/* Hero Section */}
            <motion.div
                variants={itemVariants}
                className="text-center space-y-6 mb-16"
            >
                <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-transparent bg-clip-text">
                    CFA North Barrie Allocations Hub
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    An intelligent platform revolutionizing restaurant allocations through
                    advanced automation and data-driven insights
                </p>
            </motion.div>

            {/* Project Overview */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-3xl shadow-xl p-10 transform hover:scale-[1.01] transition-all duration-300"
            >
                <div className="flex flex-col md:flex-row gap-12">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Project Overview</h2>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            The CFA North Barrie Allocations Hub is a comprehensive management system designed to streamline
                            restaurant allocations through intelligent automation and real-time analytics. The platform
                            integrates sales projections, inventory tracking, and preparation planning into a unified system.
                        </p>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Core Features
                            </h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    Advanced Sales Projections
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    Intelligent Thawing System
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    Dynamic Prep Planning
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    Real-time Analytics
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Key Capabilities
                            </h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    Automated Calculations
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    Custom Sales Rules
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    Inventory Management
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    Operation Instructions
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Technical Stack */}
            <motion.section
                variants={itemVariants}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {[
                    {
                        icon: <Code className="w-8 h-8 text-red-500" />,
                        title: "Frontend",
                        items: ["React.js", "Tailwind CSS", "Framer Motion", "Context API"]
                    },
                    {
                        icon: <Server className="w-8 h-8 text-red-500" />,
                        title: "Backend",
                        items: ["Node.js", "Express.js", "RESTful APIs", "JWT Auth"]
                    },
                    {
                        icon: <Database className="w-8 h-8 text-red-500" />,
                        title: "Database",
                        items: ["MongoDB", "Mongoose ODM", "Atlas Cloud", "Data Aggregation"]
                    },
                    {
                        icon: <Shield className="w-8 h-8 text-red-500" />,
                        title: "Security",
                        items: ["JWT Authentication", "Role-based Access", "Data Encryption", "Secure Headers"]
                    }
                ].map((stack, index) => (
                    <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="bg-red-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                            {stack.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">{stack.title}</h3>
                        <ul className="space-y-3">
                            {stack.items.map((item, i) => (
                                <li key={i} className="text-gray-600 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </motion.section>

            {/* Developer Profile */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-3xl shadow-xl p-10"
            >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                        <svg
                            className="w-32 h-32 text-white/90"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>
                    <div className="flex-1 space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Jashanpreet Singh</h2>
                            <p className="text-xl text-gray-600">Lead Developer & System Architect</p>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Full-stack developer with expertise in modern web frameworks and automation solutions.
                            Specialized in building scalable applications using Next.js, Django, and Nest.js.
                            Passionate about creating efficient business solutions through intelligent automation
                            and implementing robust architectures.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a
                                href="https://www.linkedin.com/in/eljsn/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                            </a>
                            <a
                                href="https://github.com/el-jsn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors"
                            >
                                <Github className="w-5 h-5" />
                                GitHub
                            </a>
                            <a
                                href="https://eljsn.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Version Info */}
            <motion.section
                variants={itemVariants}
                className="grid md:grid-cols-2 gap-6"
            >
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Version Information
                    </h3>
                    <div className="space-y-3">
                        <p className="text-gray-600">Current Version: 2.3.1</p>
                        <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString()}</p>
                        <p className="text-gray-600">Environment: Production</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Support
                    </h3>
                    <p className="text-gray-600">
                        For technical support or feature requests, please contact:
                        <a href="mailto:Jashan6103@gmail.com" className="text-red-600 hover:text-red-700 ml-1">
                            Jashan6103@gmail.com
                        </a>
                    </p>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default DeveloperInfo; 