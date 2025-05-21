import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react"; // Assuming this is a valid import
import { cn } from "../../lib/utils"; // Assuming this is your classnames utility

// Define your Chick-fil-A red. Ideally, this comes from your Tailwind config.
// For this example, let's assume 'chickfila-red' is a class you've defined.
// If not, replace 'text-chickfila-red', 'bg-chickfila-red', etc., with 'text-red-600', 'bg-red-600'.
const CHICKFILA_RED_TEXT = "text-red-600"; // Example: text-chickfila-red
const CHICKFILA_RED_BG = "bg-red-600";     // Example: bg-chickfila-red
const CHICKFILA_RED_BORDER = "border-red-600"; // Example: border-chickfila-red
const CHICKFILA_RED_HOVER_BG_LIGHT = "hover:bg-red-50"; // Example: hover:bg-chickfila-red-50
const CHICKFILA_RED_ACTIVE_BG_LIGHT = "bg-red-50";   // Example: bg-chickfila-red-50


const NavBarComponent = ({ items, onNavigate, className }) => {
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

    const activeStates = useMemo(() => {
        const itemStates = {};
        const dropdownLinkStates = {};
        items.forEach(item => {
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

    const handleMouseEnterItem = useCallback((itemName) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setOpenDropdown(itemName);
    }, []);

    const handleMouseLeaveArea = useCallback(() => {
        closeTimeoutRef.current = setTimeout(() => {
            setOpenDropdown(null);
        }, 200); // Slightly reduced delay
    }, []);

    const handleLinkClick = useCallback((url) => {
        setOpenDropdown(null);
        onNavigate?.(url);
    }, [onNavigate]);

    const clearCloseTimeout = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    }, []);

    // Base styles for nav items (links and buttons)
    const navItemBaseClasses = "relative cursor-pointer text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-150 ease-in-out flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500";
    const navItemDefaultTextColor = "text-neutral-700"; // Darker gray for better contrast on white
    const navItemHoverTextColor = `hover:${CHICKFILA_RED_TEXT}`;
    // Active state: Chick-fil-A red text and a subtle background or just bold red text
    const navItemActiveClasses = `${CHICKFILA_RED_TEXT} font-semibold`; // Simpler: just red and bold
    // Alternative active state with a light red background:
    // const navItemActiveClasses = `${CHICKFILA_RED_TEXT} ${CHICKFILA_RED_ACTIVE_BG_LIGHT} font-semibold`;


    return (
        <nav className={cn("relative", className)}>
            <div className="flex items-center gap-2 bg-white py-1.5 px-2 rounded-full shadow-md border border-neutral-200">
                {items.map((item) => {
                    const itemKey = item.id || item.name || item.url;
                    const Icon = item.icon;
                    const isActive = activeStates.itemStates[itemKey];

                    const itemMouseEnter = item.hasDropdown ? () => handleMouseEnterItem(item.name) : clearCloseTimeout;
                    const itemMouseLeave = item.hasDropdown ? handleMouseLeaveArea : undefined;

                    const sharedItemClasses = cn(
                        navItemBaseClasses,
                        navItemDefaultTextColor,
                        navItemHoverTextColor,
                        isActive && navItemActiveClasses
                    );

                    return (
                        <div
                            key={itemKey}
                            className="relative" // Keep this for dropdown positioning
                            onMouseEnter={itemMouseEnter}
                            onMouseLeave={itemMouseLeave}
                        >
                            {item.hasDropdown ? (
                                <button
                                    type="button"
                                    className={sharedItemClasses}
                                    onClick={() => isMobile && setOpenDropdown(openDropdown === item.name ? null : item.name)}
                                    aria-haspopup="true"
                                    aria-expanded={openDropdown === item.name}
                                >
                                    <span className="hidden md:inline mr-1">{item.name}</span>
                                    {Icon && (
                                        <span className="md:hidden">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </span>
                                    )}
                                    <ChevronDown
                                      className={cn("ml-1 w-4 h-4 transition-transform duration-200", openDropdown === item.name && "rotate-180")}
                                    />
                                    {/* Clean active indicator: subtle underline (optional) */}
                                    {/* {isActive && (
                                        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-3/5 h-[2px] ${CHICKFILA_RED_BG} rounded-full`} />
                                    )} */}
                                </button>
                            ) : (
                                <Link
                                    to={item.url}
                                    onClick={() => handleLinkClick(item.url)}
                                    className={sharedItemClasses}
                                >
                                    <span className="hidden md:inline">{item.name}</span>
                                    {Icon && (
                                        <span className="md:hidden">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </span>
                                    )}
                                    {/* Clean active indicator: subtle underline (optional) */}
                                    {/* {isActive && (
                                        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-3/5 h-[2px] ${CHICKFILA_RED_BG} rounded-full`} />
                                    )} */}
                                </Link>
                            )}

                            {/* Dropdown Menu - Styled with Chick-fil-A colors */}
                            {item.hasDropdown && openDropdown === item.name && (
                                <div
                                    className="absolute left-0 mt-2 w-52 bg-white rounded-lg shadow-xl py-1 z-[999]" // Standard z-index
                                    onMouseEnter={() => handleMouseEnterItem(item.name)} // Keep dropdown open
                                    onMouseLeave={handleMouseLeaveArea}
                                >
                                    {item.dropdownLinks.map((dropdownLink) => (
                                        <Link
                                            key={dropdownLink.to}
                                            to={dropdownLink.to}
                                            onClick={() => handleLinkClick(dropdownLink.to)}
                                            className={cn(
                                                "block px-4 py-2.5 text-sm text-neutral-700 transition-colors duration-150 ease-in-out",
                                                CHICKFILA_RED_HOVER_BG_LIGHT, // hover:bg-red-50
                                                `hover:${CHICKFILA_RED_TEXT}`, // hover:text-red-600
                                                activeStates.dropdownLinkStates[dropdownLink.to] && `${CHICKFILA_RED_ACTIVE_BG_LIGHT} ${CHICKFILA_RED_TEXT} font-medium`
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
        </nav>
    );
};

export const NavBar = React.memo(NavBarComponent);