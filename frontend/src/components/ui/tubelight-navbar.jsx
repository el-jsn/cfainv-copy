import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export const NavBar = ({ items, activeRoute, onNavigate, className }) => {
    const [activeTab, setActiveTab] = useState(items[0].name);
    const [isMobile, setIsMobile] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleDropdownClick = (itemName) => {
        setOpenDropdown(openDropdown === itemName ? null : itemName);
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-3 bg-white/5 border border-gray-200 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;

                    return (
                        <div key={index} className="relative">
                            {item.hasDropdown ? (
                                <button
                                    onClick={() => {
                                        setActiveTab(item.name);
                                        handleDropdownClick(item.name);
                                    }}
                                    className={cn(
                                        "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors flex items-center",
                                        "text-gray-600 hover:text-red-600",
                                        isActive && "bg-gray-100 text-red-600",
                                        activeRoute === item.url ||
                                            item.dropdownLinks?.some(link => link.to === activeRoute)
                                            ? 'active'
                                            : ''
                                    )}
                                >
                                    <span className="hidden md:inline">{item.name}</span>
                                    <span className="md:hidden">
                                        <Icon size={18} strokeWidth={2.5} />
                                    </span>
                                    <ChevronDown className="ml-1 w-4 h-4" />
                                    {isActive && (
                                        <motion.div
                                            layoutId="lamp"
                                            className="absolute inset-0 w-full bg-red-50 rounded-full -z-10"
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 30,
                                            }}
                                        >
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-600 rounded-b-full">
                                                <div className="absolute w-12 h-6 bg-red-200/50 rounded-full blur-md -bottom-2 -left-2" />
                                                <div className="absolute w-8 h-6 bg-red-200/50 rounded-full blur-md -bottom-1" />
                                                <div className="absolute w-4 h-4 bg-red-200/50 rounded-full blur-sm bottom-0 left-2" />
                                            </div>
                                        </motion.div>
                                    )}
                                </button>
                            ) : (
                                <Link
                                    to={item.url}
                                    onClick={() => {
                                        setActiveTab(item.name);
                                        setOpenDropdown(null);
                                        onNavigate(item.url);
                                    }}
                                    className={cn(
                                        "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors flex items-center",
                                        "text-gray-600 hover:text-red-600",
                                        isActive && "bg-gray-100 text-red-600",
                                        activeRoute === item.url ? 'active' : ''
                                    )}
                                >
                                    <span className="hidden md:inline">{item.name}</span>
                                    <span className="md:hidden">
                                        <Icon size={18} strokeWidth={2.5} />
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="lamp"
                                            className="absolute inset-0 w-full bg-red-50 rounded-full -z-10"
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 30,
                                            }}
                                        >
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-600 rounded-b-full">
                                                <div className="absolute w-12 h-6 bg-red-200/50 rounded-full blur-md -bottom-2 -left-2" />
                                                <div className="absolute w-8 h-6 bg-red-200/50 rounded-full blur-md -bottom-1" />
                                                <div className="absolute w-4 h-4 bg-red-200/50 rounded-full blur-sm bottom-0 left-2" />
                                            </div>
                                        </motion.div>
                                    )}
                                </Link>
                            )}

                            {/* Dropdown Menu */}
                            {item.hasDropdown && openDropdown === item.name && (
                                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    {item.dropdownLinks.map((dropdownLink) => (
                                        <Link
                                            key={dropdownLink.to}
                                            to={dropdownLink.to}
                                            onClick={() => {
                                                setOpenDropdown(null);
                                                onNavigate(dropdownLink.to);
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                                        >
                                            {dropdownLink.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 