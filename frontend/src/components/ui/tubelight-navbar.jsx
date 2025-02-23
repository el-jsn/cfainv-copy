import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export const NavBar = ({ items, onNavigate, className }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const closeTimeoutRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Function to determine if an item is active based on the current route
    const isItemActive = (item) => {
        if (item.url === "#") {
            return item.dropdownLinks?.some(link => link.to === location.pathname);
        }
        return item.url === location.pathname;
    };

    // Function to determine if a dropdown link is active
    const isDropdownLinkActive = (to) => {
        return location.pathname === to;
    };

    const handleMouseEnter = (itemName) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
        if (itemName) {
            setOpenDropdown(itemName);
        }
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setOpenDropdown(null);
        }, 300);
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-3 bg-white/5 border border-gray-200 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item);

                    return (
                        <div
                            key={index}
                            className="relative"
                            onMouseEnter={() => handleMouseEnter(item.hasDropdown ? item.name : null)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {item.hasDropdown ? (
                                <button
                                    className={cn(
                                        "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors flex items-center",
                                        "text-gray-600 hover:text-red-600",
                                        isActive && "bg-gray-100 text-red-600"
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
                                        setOpenDropdown(null);
                                        onNavigate?.(item.url);
                                    }}
                                    className={cn(
                                        "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors flex items-center",
                                        "text-gray-600 hover:text-red-600",
                                        isActive && "bg-gray-100 text-red-600"
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
                                <div
                                    className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[9999]"
                                    onMouseEnter={() => handleMouseEnter(item.name)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {item.dropdownLinks.map((dropdownLink) => (
                                        <Link
                                            key={dropdownLink.to}
                                            to={dropdownLink.to}
                                            onClick={() => {
                                                setOpenDropdown(null);
                                                onNavigate?.(dropdownLink.to);
                                            }}
                                            className={cn(
                                                "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600",
                                                isDropdownLinkActive(dropdownLink.to) && "bg-gray-50 text-red-600"
                                            )}
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
}; 