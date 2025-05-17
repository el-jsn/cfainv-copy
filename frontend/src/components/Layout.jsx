import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BarChart,
  Settings,
  Calculator,
  LucideFileQuestion,
  Menu, X // Added icons for mobile menu
} from "lucide-react";
import { useAuth } from "./AuthContext";
import Footer from './Footer';
import { NavBar } from "./ui/tubelight-navbar";
import { Button } from "./ui/neon-button";

const Layout = React.memo(({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState(location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation structure
  const navItems = useMemo(() => [
    {
      name: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      name: "Allocations",
      url: "#",
      icon: Calculator,
      hasDropdown: true,
      dropdownLinks: [
        { to: "/allocations-dashboard", label: "Allocations Dashboard" },
        { to: "/thawing-cabinet", label: "Thawing Cabinet" },
        { to: "/prep-allocations", label: "Prep Allocations" },
      ]
    },
    ...(user?.isAdmin ? [
      {
        name: "Sales",
        url: "#",
        icon: BarChart,
        hasDropdown: true,
        dropdownLinks: [
          { to: "/update-sales-projection", label: "Update Sales Projections" },
          { to: "/thawing-cabinet/config", label: "Projection Rules" },
          { to: "/truck-items", label: "Truck Inventory" },
        ]
      },
      {
        name: "Settings",
        url: "#",
        icon: Settings,
        hasDropdown: true,
        dropdownLinks: [
          { to: "/update-upt", label: "UPT Settings" },
          { to: "/data/message/all", label: "Allocation Adjustments" },
          { to: "/instructions", label: "Allocation Instructions" },
          { to: "/closure/plans", label: "Store Closures" },
        ]
      },
      {
        name: "Guide",
        url: "/how-to",
        icon: LucideFileQuestion,
      }
    ] : [])
  ], [user]);

  // Determine if navbar should be shown
  const showNavbar = useMemo(() => {
    const hiddenRoutes = ["/thawing-cabinet", "/prep-allocations", "/login", "/allocations-dashboard"];
    return !hiddenRoutes.includes(location.pathname);
  }, [location.pathname]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Navigation handlers
  const handleNavigation = useCallback((to) => {
    setActiveRoute(to);
    navigate(to);
  }, [navigate]);

  const handleMobileNavigation = useCallback((to) => {
    setActiveRoute(to);
    navigate(to);
    setIsMobileMenuOpen(false); // Close menu on navigation
  }, [navigate, setActiveRoute]);

  // Close mobile menu on route change (e.g., browser back/forward)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { // Cleanup on component unmount
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogoClick = useCallback(() => {
    setActiveRoute('/');
    navigate('/');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  if (!showNavbar) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen font-sfpro bg-gray-100">
      <header className="sticky top-0 z-[45] bg-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-2"
              onClick={() => {
                handleLogoClick();
                setIsMobileMenuOpen(false); // Close mobile menu on logo click
              }}
            >
              <img
                src="./imgs/Chick-fil-A-North-Barrie-Logo.png"
                alt="Chick-fil-A Logo"
                className="h-16 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 justify-center px-4">
                <NavBar
                  items={navItems}
                  activeRoute={activeRoute}
                  onNavigate={handleNavigation}
                />
            </div>

            {/* Desktop Login/Logout Button */}
            <div className="hidden md:block">
              <Button
                onClick={user ? handleLogout : () => navigate('/login')}
                variant="solid"
                size="default"
                className="font-medium"
              >
                {user ? "Logout" : "Login"}
              </Button>
            </div>

            {/* Mobile Menu Hamburger Button */}
            <div className="md:hidden">
              <Button
                onClick={toggleMobileMenu}
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-blue-500"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg z-50 p-4 border-t">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  {item.hasDropdown ? (
                    <div>
                      <span className="font-semibold text-gray-700 block py-2">{item.name}</span>
                      <ul className="pl-4 space-y-1">
                        {item.dropdownLinks.map(link => (
                          <li key={link.to}>
                            <Link
                              to={link.to}
                              onClick={() => handleMobileNavigation(link.to)}
                              className={`block py-2 px-3 rounded-md text-sm font-medium ${
                                activeRoute === link.to
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
                      className={`block py-2 px-3 rounded-md text-base font-medium ${
                        activeRoute === item.url
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
              {/* Login/Logout button for mobile menu */}
              <li>
                <Button
                  onClick={() => {
                    if (user) {
                      handleLogout(); // handleLogout already navigates and closes menu via useEffect
                    } else {
                      handleMobileNavigation('/login');
                    }
                  }}
                  variant="solid"
                  size="default"
                  className="w-full font-medium mt-4"
                >
                  {user ? "Logout" : "Login"}
                </Button>
              </li>
            </ul>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;