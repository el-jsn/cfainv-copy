import React from 'react';
import { Link } from 'react-router-dom';
import { Code, HelpCircle, Home, Grid } from 'lucide-react';
import logoSrc from '/imgs/Chick-fil-A-North-Barrie-Logo.png'

// Define link data outside the component for better organization
const quickLinksData = [
    { to: "/", Icon: Home, text: "Dashboard" },
    { to: "/how-to", Icon: HelpCircle, text: "Help Guide" },
    { to: "/thawing-cabinet", Icon: Grid, text: "Thawing Cabinet" },
    { to: "/prep-allocations", Icon: Grid, text: "Prep Allocations" },
];

const supportLinksData = [
    { to: "/dev-info", Icon: Code, text: "Developer Information" },
];

const Footer = React.memo(() => {
    const year = new Date().getFullYear();
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
                                    src={logoSrc}
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
                                {quickLinksData.map(({ to, Icon, text }) => (
                                    <Link key={to} to={to} className="text-gray-600 hover:text-red-600 transition-colors flex items-center group">
                                        <Icon className="w-4 h-4 mr-2 group-hover:text-red-600" />
                                        <span>{text}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Support */}
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Support
                            </h3>
                            <div className="flex flex-col space-y-3">
                                {supportLinksData.map(({ to, Icon, text }) => (
                                    <Link key={to} to={to} className="text-gray-600 hover:text-red-600 transition-colors flex items-center group">
                                        <Icon className="w-4 h-4 mr-2 group-hover:text-red-600" />
                                        <span>{text}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-100 px-4 py-4">
                    <div className="flex justify-center items-center">
                        <p className="text-gray-600 text-sm">
                            © {year} CFA- Internal Tools
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
});

// Set a display name for the memoized component for easier debugging
Footer.displayName = 'Footer';

export default Footer; 