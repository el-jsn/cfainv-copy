import React, { useState, useCallback, memo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Upload,
  Hammer,
  CalendarClock,
  BrainCog,
  Calendar,
  LucideFileQuestion,
  ChevronDown,
  BarChart,
  Settings,
  Calculator,
  Code
} from "lucide-react";
import { useAuth } from "./AuthContext";
import Footer from './Footer';
import { NavBar } from "./ui/tubelight-navbar";
import { Button } from "./ui/neon-button";

const Layout = memo(({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [dropdownStates, setDropdownStates] = useState({});
  const [activeRoute, setActiveRoute] = useState('/');

  // Define navItems first
  const navItems = React.useMemo(() => {
    const items = [
      { name: "Dashboard", url: "/", icon: Home },
      {
        name: "Allocations",
        url: "#",
        icon: Calculator,
        hasDropdown: true,
        dropdownLinks: [
          { to: "/thawing-cabinet", label: "Thawing Cabinet" },
          { to: "/prep-allocations", label: "Prep Allocations" },
        ]
      },
    ];

    if (user?.isAdmin) {
      items.push(

        {
          name: "Sales",
          url: "#",
          icon: BarChart,
          hasDropdown: true,
          dropdownLinks: [
            { to: "/update-sales-projection", label: "Update Sales Projections" },
            { to: "/thawing-cabinet/config", label: "Projection Rules" },
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
        }
      );

      items.push({ name: "Guide", url: "/how-to", icon: LucideFileQuestion });

    }


    return items;
  }, [user]);

  // Toggle Navbar visibility based on the route
  useEffect(() => {
    const hiddenRoutes = ["/thawing-cabinet", "/prep-allocations", "/login"];
    setShowNavbar(!hiddenRoutes.includes(location.pathname));
  }, [location.pathname]);

  // Update active route when location changes
  useEffect(() => {
    const currentPath = location.pathname;
    const findMatchingRoute = (items) => {
      for (const item of items) {
        if (item.url === currentPath) {
          return item.url;
        }
        if (item.hasDropdown && item.dropdownLinks) {
          const matchingDropdownLink = item.dropdownLinks.find(link => link.to === currentPath);
          if (matchingDropdownLink) {
            return matchingDropdownLink.to;
          }
        }
      }
      return currentPath;
    };

    setActiveRoute(findMatchingRoute(navItems));
  }, [location.pathname, navItems]);

  const handleToggleMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

  const handleToggleDropdown = useCallback((dropdownId) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  }, []);

  const handleNavigation = useCallback(
    (to) => {
      if (mobileMenuOpen) setMobileMenuOpen(false);
      setDropdownStates({});
      setActiveRoute(to);
      navigate(to);
    },
    [mobileMenuOpen, navigate]
  );

  const handleLogoClick = useCallback(() => {
    setActiveRoute('/');
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen font-sfpro bg-gray-100">
      {showNavbar && (
        <>
          <header className="sticky top-0 z-30 bg-white shadow-md">
            <nav className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <Link
                  to="/"
                  className="flex items-center space-x-2"
                  onClick={handleLogoClick}
                >
                  <img
                    src="./imgs/Chick-fil-A-North-Barrie-Logo.png"
                    alt="Chick-fil-A Logo"
                    className="h-16 w-auto"
                  />

                </Link>

                <div className="flex-1 flex justify-center px-4">
                  {user && (
                    <NavBar
                      items={navItems}
                      activeRoute={activeRoute}
                      onNavigate={handleNavigation}
                    />
                  )}
                </div>

                <Button
                  onClick={user ? logout : () => navigate('/login')}
                  variant="solid"
                  size="default"
                  className="font-medium"
                >
                  {user ? "Logout" : "Login"}
                </Button>
              </div>
            </nav>
          </header>
        </>
      )}

      <main className="flex-1">{children}</main>

      {showNavbar && <Footer />}
    </div>
  );
});

export default Layout;