import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react"; // Assuming this is a valid import
import { cn } from "../../lib/utils"; // Assuming this is your classnames utility

const NavBarComponent = ({ items, onNavigate, className }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null); // Stores the name of the open dropdown
    const closeTimeoutRef = useRef(null);
    const location = useLocation();

    // Effect for handling window resize to set mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Memoize active states for items and dropdown links
    // This avoids recalculating on every render for every item
    const activeStates = useMemo(() => {
        const itemStates = {};
        const dropdownLinkStates = {};

        items.forEach(item => {
            // Use item.id or a unique item.name if available, otherwise index might be less stable
            const key = item.id || item.name || item.url; 

            if (item.url === "#" && item.hasDropdown) {
                itemStates[key] = item.dropdownLinks?.some(link => link.to === location.pathname) || false;
            } else {
                itemStates[key] = item.url === location.pathname;
            }

            if (item.hasDropdown) {
                item.dropdownLinks?.forEach(link => {
                    dropdownLinkStates[link.to] = location.pathname === link.to;
                });
            }
        });
        return { itemStates, dropdownLinkStates };
    }, [items, location.pathname]);

    // Memoized event handlers
    const handleMouseEnterItem = useCallback((itemName) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setOpenDropdown(itemName);
    }, []); // setOpenDropdown from useState is stable

    const handleMouseLeaveArea = useCallback(() => {
        closeTimeoutRef.current = setTimeout(() => {
            setOpenDropdown(null);
        }, 300); // 300ms delay for a smoother UX, allows moving mouse to dropdown
    }, []); // setOpenDropdown from useState is stable

    const handleLinkClick = useCallback((url) => {
        setOpenDropdown(null); // Close dropdown on navigation
        onNavigate?.(url);
    }, [onNavigate]); // Dependency on onNavigate (should be memoized in parent)

    // Clear timeout without affecting dropdown state (e.g., for non-dropdown items)
    const clearCloseTimeout = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    }, []);


    return (
        <div className={cn("relative", className)}> {/* Applied className prop */}
            <div className="flex items-center gap-3 bg-white/5 border border-gray-200 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
                {items.map((item) => {
                    // Prefer item.id, then item.name, then item.url as key. Index is last resort.
                    const itemKey = item.id || item.name || item.url; 
                    const Icon = item.icon;
                    const isActive = activeStates.itemStates[itemKey];

                    // Define these once per item in the map
                    const itemMouseEnter = item.hasDropdown ? () => handleMouseEnterItem(item.name) : clearCloseTimeout;
                    const itemMouseLeave = item.hasDropdown ? handleMouseLeaveArea : undefined;

                    return (
                        <div
                            key={itemKey} // Use a stable unique key
                            className="relative"
                            onMouseEnter={itemMouseEnter}
                            onMouseLeave={itemMouseLeave}
                        >
                            {item.hasDropdown ? (
                                <button
                                    type="button" // Explicitly set button type
                                    className={cn(
                                        "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors flex items-center",
                                        "text-gray-600 hover:text-red-600",
                                        isActive && "bg-gray-100 text-red-600" // Active state styling
                                    )}
                                    // onClick is not typically needed for hover dropdowns, but can be used for mobile tap
                                    onClick={() => isMobile && setOpenDropdown(openDropdown === item.name ? null : item.name)}
                                >
                                    <span className="hidden md:inline">{item.name}</span>
                                    {Icon && ( // Conditionally render Icon if it exists
                                        <span className="md:hidden">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </span>
                                    )}
                                    <ChevronDown className="ml-1 w-4 h-4" />
                                    {isActive && (
                                        <motion.div
                                            layoutId="lamp" // Shared layout ID for animation
                                            className="absolute inset-0 w-full bg-red-50 rounded-full -z-10"
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 30,
                                            }}
                                        >
                                            {/* This part is for the "glow" effect. It adds multiple divs.
                                                If performance is extremely critical, simplifying this visual effect
                                                (e.g., fewer blurred divs, or a simpler underline) can reduce DOM complexity
                                                and rendering overhead.
                                            */}
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
                                    onClick={() => handleLinkClick(item.url)}
                                    className={cn(
                                        "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors flex items-center",
                                        "text-gray-600 hover:text-red-600",
                                        isActive && "bg-gray-100 text-red-600" // Active state styling
                                    )}
                                >
                                    <span className="hidden md:inline">{item.name}</span>
                                    {Icon && ( // Conditionally render Icon if it exists
                                        <span className="md:hidden">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </span>
                                    )}
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
                                            {/* Same glow effect consideration as above */}
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
                                    // Keep dropdown open if mouse moves into it
                                    onMouseEnter={() => handleMouseEnterItem(item.name)} 
                                    onMouseLeave={handleMouseLeaveArea}
                                >
                                    {item.dropdownLinks.map((dropdownLink) => (
                                        <Link
                                            key={dropdownLink.to} // `to` should be unique for dropdown links
                                            to={dropdownLink.to}
                                            onClick={() => handleLinkClick(dropdownLink.to)}
                                            className={cn(
                                                "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600",
                                                activeStates.dropdownLinkStates[dropdownLink.to] && "bg-gray-50 text-red-600"
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

// Export the memoized component
export const NavBar = React.memo(NavBarComponent);