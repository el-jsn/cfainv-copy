import React from 'react';
import { Link } from 'react-router-dom';
import { Code } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white shadow-md mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <p className="text-gray-600">© {new Date().getFullYear()} CFA-North Barrie</p>
                    <Link
                        to="/dev-info"
                        className="flex items-center text-gray-600 
                        px-3 py-1.5 rounded-md transition-all duration-300 ease-in-out
                        bg-gradient-to-r from-red-50 to-white
                        border border-red-100 shadow-sm
                        hover:text-red-600 hover:bg-red-50 hover:scale-105
                        active:scale-95 active:bg-red-100 group
                        animate-pulse-subtle"
                    >
                        <Code className="w-4 h-4 mr-1.5 transition-transform duration-300 group-hover:rotate-12" />
                        <span className="font-medium">Developer Info</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 