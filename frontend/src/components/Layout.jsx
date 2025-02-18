import React, { useState, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BarChart,
  Settings,
  Calculator,
  LucideFileQuestion,
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
          { to: "/truck-items", label: "Truck Order Calculator" },
        ]
      },
      {
        name: "Settings",
        url: "#",
        icon: Settings,
        hasDropdown: true,
        dropdownLinks: [
          { to: "/update-upt", label: "UTP Settings" },
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
    const hiddenRoutes = ["/thawing-cabinet", "/prep-allocations", "/login"];
    return !hiddenRoutes.includes(location.pathname);
  }, [location.pathname]);

  // Navigation handlers
  const handleNavigation = useCallback((to) => {
    setActiveRoute(to);
    navigate(to);
  }, [navigate]);

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
              onClick={user ? handleLogout : () => navigate('/login')}
              variant="solid"
              size="default"
              className="font-medium"
            >
              {user ? "Logout" : "Login"}
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;