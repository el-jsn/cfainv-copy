import React from 'react';
import { Link } from 'react-router-dom';
import { Code, HelpCircle, Home, Grid } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto">
                {/* Main Footer Content */}
                <div className="px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Logo and About */}
                        <div className="flex flex-col space-y-4">
                            <Link to="/" className="flex items-center space-x-2">
                                <img
                                    src="./imgs/Chick-fil-A-North-Barrie-Logo.png"
                                    alt="Chick-fil-A Logo"
                                    className="h-16 w-auto"
                                />
                            </Link>
                            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                                Internal inventory management and operations system
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Quick Links
                            </h3>
                            <div className="flex flex-col space-y-3">
                                <Link to="/" className="text-gray-600 hover:text-red-600 transition-colors flex items-center group">
                                    <Home className="w-4 h-4 mr-2 group-hover:text-red-600" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link to="/how-to" className="text-gray-600 hover:text-red-600 transition-colors flex items-center group">
                                    <HelpCircle className="w-4 h-4 mr-2 group-hover:text-red-600" />
                                    <span>Help Guide</span>
                                </Link>
                                <Link to="/thawing-cabinet" className="text-gray-600 hover:text-red-600 transition-colors flex items-center group">
                                    <Grid className="w-4 h-4 mr-2 group-hover:text-red-600" />
                                    <span>Thawing Cabinet</span>
                                </Link>
                                <Link to="/prep-allocations" className="text-gray-600 hover:text-red-600 transition-colors flex items-center group">
                                    <Grid className="w-4 h-4 mr-2 group-hover:text-red-600" />
                                    <span>Prep Allocations</span>
                                </Link>
                            </div>
                        </div>

                        {/* Support */}
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Support
                            </h3>
                            <div className="flex flex-col space-y-3">
                                <Link to="/dev-info" className="text-gray-600 hover:text-red-600 transition-colors flex items-center group">
                                    <Code className="w-4 h-4 mr-2 group-hover:text-red-600" />
                                    <span>Developer Information</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-100 px-4 py-4">
                    <div className="flex justify-center items-center">
                        <p className="text-gray-600 text-sm">
                            © {new Date().getFullYear()} CFA-North Barrie Internal Tools
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 