import React from 'react';
import { Link } from 'react-router-dom';
import { Code, HelpCircle, Home, Grid } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Quick Links */}
                    <div className="flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Quick Links
                        </h3>
                        <div className="flex flex-col space-y-2">
                            <Link to="/" className="text-gray-600 hover:text-red-600 transition-colors flex items-center">
                                <Home className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                            <Link to="/how-to" className="text-gray-600 hover:text-red-600 transition-colors flex items-center">
                                <HelpCircle className="w-4 h-4 mr-2" />
                                Help Guide
                            </Link>
                            <Link to="/thawing-cabinet" className="text-gray-600 hover:text-red-600 transition-colors flex items-center">
                                <Grid className="w-4 h-4 mr-2" />
                                Thawing Cabinet
                            </Link>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Support
                        </h3>
                        <div className="text-gray-600 space-y-2">
                            <p>Need help? Contact Developer</p>
                        </div>
                    </div>

                    {/* Copyright and Dev Info */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <p className="text-gray-600">© {new Date().getFullYear()} CFA-North Barrie</p>
                            <p className="text-gray-500 text-sm mt-1">All rights reserved</p>
                        </div>
                        <Link
                            to="/dev-info"
                            className="flex items-center text-gray-500 hover:text-gray-700 
                                     text-sm mt-4 transition-colors w-fit"
                        >
                            <Code className="w-6 h-6 mr-1.5" />
                            <span>Developer Information</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 