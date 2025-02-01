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
                    <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
                        <svg
                            className="w-32 h-32 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Jashanpreet Singh</h2>
                            <p className="text-xl text-gray-600">Lead Developer & System Architect</p>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Full-stack developer specializing in modern web frameworks and automation solutions.
                            Experienced in building scalable applications using Next.js, Django, Nuxt.js, and Nest.js.
                            Passionate about creating efficient business solutions through intelligent automation
                            and implementing robust architectures. Proficient in both frontend and backend development,
                            with expertise in React.js, Node.js, and various modern web technologies.
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
                                href="https://github.com/el-jsn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                            >
                                <Github className="w-5 h-5" />
                                Portfolio
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

            {/* Website Preview */}
            <motion.section
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-xl p-8"
            >
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Portfolio Preview</h3>
                <a
                    href="https://eljsn.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative w-full aspect-video rounded-lg overflow-hidden shadow-lg group"
                >
                    <iframe
                        src="https://eljsn.vercel.app/"
                        title="Portfolio Preview"
                        className="w-full h-full border-0"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-75 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                        <div className="text-white flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <span className="text-lg font-semibold">Visit Full Site</span>
                            <ExternalLink className="w-5 h-5" />
                        </div>
                    </div>
                </a>
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