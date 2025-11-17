import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Home,
    BarChart,
    Settings,
    Calculator,
    LucideFileQuestion,
    Menu, X
} from "lucide-react";
import { useAuth } from "./AuthContext";
import Footer from './Footer';
import { NavBar } from "./ui/tubelight-navbar"; 
import { Button } from "./ui/neon-button"; 

const CHICKFILA_RED_TEXT = "text-red-600"; 
const CHICKFILA_RED_BG = "bg-red-600";    
const CHICKFILA_RED_BG_HOVER = "hover:bg-red-700"; 
const CHICKFILA_RED_TEXT_HOVER_LIGHT_BG = `hover:text-red-600 hover:bg-red-50`;
const CHICKFILA_RED_ACTIVE_TEXT_LIGHT_BG = `text-red-600 bg-red-50`;
const Layout = React.memo(({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = useMemo(() => [
        { name: "Dashboard", url: "/", icon: Home },
        {
            name: "Allocations", url: "#", icon: Calculator, hasDropdown: true,
            dropdownLinks: [
                { to: "/allocations-dashboard", label: "Allocations Dashboard" },
                { to: "/thawing-cabinet", label: "Thawing Cabinet" },
                { to: "/prep-allocations", label: "Prep Allocations" },
            ]
        },
        ...(user?.isAdmin ? [
            {
                name: "Sales", url: "#", icon: BarChart, hasDropdown: true,
                dropdownLinks: [
                    { to: "/update-sales-projection", label: "Update Sales Projections" },
                    { to: "/thawing-cabinet/config", label: "Projection Rules" },
                    { to: "/truck-items", label: "Truck Inventory" },
                ]
            },
            {
                name: "Settings", url: "#", icon: Settings, hasDropdown: true,
                dropdownLinks: [
                    { to: "/update-upt", label: "UPT Settings" },
                    { to: "/data/message/all", label: "Allocation Adjustments" },
                    { to: "/instructions", label: "Allocation Instructions" },
                    { to: "/closure/plans", label: "Store Closures" },
                ]
            },
            { name: "Guide", url: "/how-to", icon: LucideFileQuestion }
        ] : [])
    ], [user]);

    const showNavbar = useMemo(() => {
        const hiddenRoutes = ["/thawing-cabinet", "/prep-allocations", "/login", "/allocations-dashboard"];
        return !hiddenRoutes.includes(location.pathname);
    }, [location.pathname]);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    const handleNavigation = useCallback((to) => {
        navigate(to);
    }, [navigate]);

    const handleMobileNavigation = useCallback((to) => {
        navigate(to);
        setIsMobileMenuOpen(false);
    }, [navigate]);

    useEffect(() => {
        setIsMobileMenuOpen(false); 
    }, [location.pathname]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLogoClick = useCallback(() => {
        navigate('/');
        setIsMobileMenuOpen(false);
    }, [navigate]);

    const handleLogout = useCallback(() => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false); // Ensure menu closes on logout
    }, [logout, navigate]);

    if (!showNavbar) {
        return <main className="flex-1 p-4 md:p-6 bg-neutral-50">{children}</main>;
    }

    // Common classes for mobile menu links
    const mobileLinkBaseClasses = "block py-2.5 px-3.5 rounded-md text-base font-medium transition-colors duration-150 ease-in-out";
    const mobileLinkDefaultClasses = "text-neutral-700";


    return (
        <div className="flex flex-col min-h-screen font-sfpro bg-neutral-50"> {/* Cleaner page background */}
            <header className="sticky top-0 z-[45] bg-white shadow-sm"> {/* Slightly softer shadow */}
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-2 shrink-0" onClick={handleLogoClick}>
                            <img
                                src="./imgs/cfa.png" // Ensure this path is correct relative to public folder
                                alt="Chick-fil-A Logo"
                                className="h-16 w-auto" // Slightly smaller logo
                            />
                        </Link>

                        <div className="hidden md:flex flex-1 justify-center px-4">
                            <NavBar
                                items={navItems}
                                onNavigate={handleNavigation}
                                // activeRoute prop is removed as NavBar uses useLocation internally
                            />
                        </div>

                        <div className="hidden md:flex items-center shrink-0">
                            <Button
                                onClick={user ? handleLogout : () => navigate('/login')}
                                // Assuming your Button component uses 'variant' or can be styled via className
                                // For a Chick-fil-A red button:
                                className={`font-medium ${CHICKFILA_RED_BG} text-white ${CHICKFILA_RED_BG_HOVER} px-4 py-2 rounded-md`}
                                // If your button has variants: variant="primary" or variant="solidRed"
                            >
                                {user ? "Logout" : "Login"}
                            </Button>
                        </div>

                        <div className="md:hidden">
                            <Button
                                onClick={toggleMobileMenu}
                                variant="ghost" // Assuming this makes it transparent
                                size="icon"
                                className={`text-neutral-600 hover:${CHICKFILA_RED_TEXT}`} // Themed hover
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </nav>

                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg z-50 p-4 border-t border-neutral-200">
                        <ul className="space-y-1">
                            {navItems.map((item) => (
                                <li key={item.name}>
                                    {item.hasDropdown ? (
                                        <div>
                                            <span className="font-semibold text-neutral-700 block py-2 px-3.5 text-sm">{item.name}</span>
                                            <ul className="pl-4 space-y-0.5">
                                                {item.dropdownLinks.map(link => (
                                                    <li key={link.to}>
                                                        <Link
                                                            to={link.to}
                                                            onClick={() => handleMobileNavigation(link.to)}
                                                            className={`${mobileLinkBaseClasses} text-sm ${
                                                                location.pathname === link.to
                                                                    ? CHICKFILA_RED_ACTIVE_TEXT_LIGHT_BG
                                                                    : `${mobileLinkDefaultClasses} ${CHICKFILA_RED_TEXT_HOVER_LIGHT_BG}`
                                                            }`}
                                                        >
                                                            {link.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.url}
                                            onClick={() => handleMobileNavigation(item.url)}
                                            className={`${mobileLinkBaseClasses} ${
                                                location.pathname === item.url
                                                    ? CHICKFILA_RED_ACTIVE_TEXT_LIGHT_BG
                                                    : `${mobileLinkDefaultClasses} ${CHICKFILA_RED_TEXT_HOVER_LIGHT_BG}`
                                            }`}
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                            <li>
                                <Button
                                    onClick={() => {
                                        if (user) handleLogout();
                                        else handleMobileNavigation('/login');
                                    }}
                                    className={`w-full font-medium mt-4 ${CHICKFILA_RED_BG} text-white ${CHICKFILA_RED_BG_HOVER} py-2.5 rounded-md`}
                                >
                                    {user ? "Logout" : "Login"}
                                </Button>
                            </li>
                        </ul>
                    </div>
                )}
            </header>

            <main className="flex-1 p-4 md:p-6">{children}</main>

            <Footer />
        </div>
    );
});

Layout.displayName = 'Layout'; // Good practice for React.memo components

export default Layout;