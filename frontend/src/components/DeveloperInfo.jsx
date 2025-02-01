import React from 'react';
import { motion } from 'framer-motion';
import { Code, Server, Database, Shield, Github, ExternalLink } from 'lucide-react';

const DeveloperInfo = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto p-6 space-y-12 my-8"
        >
            {/* Hero Section */}
            <motion.div
                variants={itemVariants}
                className="text-center space-y-4 mb-16"
            >
                <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-red-400 text-transparent bg-clip-text">
                    CFA North Barrie Operations Hub
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    A comprehensive solution for managing restaurant operations, inventory, and sales projections
                </p>
            </motion.div>

            {/* Project Overview */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-[1.02] transition-transform duration-300"
            >
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Project Overview</h2>
                <div className="prose prose-lg text-gray-600 max-w-none">
                    <p>
                        This application serves as the central operations hub for Chick-fil-A North Barrie,
                        streamlining various aspects of restaurant management through intelligent automation
                        and data-driven decision making.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-gray-700">Key Features</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Real-time inventory tracking and management</li>
                                <li>AI-powered sales projections</li>
                                <li>Automated thawing cabinet calculations</li>
                                <li>Dynamic prep allocation system</li>
                                <li>Comprehensive reporting dashboard</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-gray-700">Business Impact</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Reduced food waste</li>
                                <li>Improved inventory accuracy</li>
                                <li>Streamlined prep operations</li>
                                <li>Enhanced data-driven decision making</li>
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
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Code className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Frontend</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li>React.js</li>
                        <li>Tailwind CSS</li>
                        <li>Framer Motion</li>
                        <li>Context API</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Server className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Backend</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li>Node.js</li>
                        <li>Express.js</li>
                        <li>RESTful APIs</li>
                        <li>JWT Auth</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Database className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Database</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li>MongoDB</li>
                        <li>Mongoose ODM</li>
                        <li>Atlas Cloud</li>
                        <li>Data Aggregation</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <Shield className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Security</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li>JWT Authentication</li>
                        <li>Role-based Access</li>
                        <li>Data Encryption</li>
                        <li>Secure Headers</li>
                    </ul>
                </div>
            </motion.section>

            {/* Developer Profile */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg">
                        <img
                            src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
                            alt="Jashanpreet Singh"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Jashanpreet Singh</h2>
                            <p className="text-xl text-gray-600">Lead Developer & System Architect</p>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Full-stack developer with expertise in building scalable web applications
                            and implementing efficient business solutions. Specialized in React.js,
                            Node.js, and modern web technologies.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <a
                                href="https://www.linkedin.com/in/eljsn/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                            </a>
                            <a
                                href="mailto:Jashan6103@gmail.com"
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Version Information</h3>
                    <div className="space-y-2">
                        <p className="text-gray-600">Current Version: 2.3.1</p>
                        <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString()}</p>
                        <p className="text-gray-600">Environment: Production</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Support</h3>
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