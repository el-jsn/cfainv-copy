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

const Layout = memo(({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [dropdownStates, setDropdownStates] = useState({});

  // Toggle Navbar visibility based on the route
  useEffect(() => {
    const hiddenRoutes = ["/thawing-cabinet", "/prep-allocations", "/login"];
    setShowNavbar(!hiddenRoutes.includes(location.pathname));
  }, [location.pathname]);

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
      setDropdownStates({});  // Close all dropdowns
      navigate(to);
    },
    [mobileMenuOpen, navigate]
  );

  const quickAccessLinks = React.useMemo(() => {
    const links = [
      { to: "/", icon: <Home />, label: "Dashboard" },
      {
        to: "/allocations",
        icon: <Calculator />,
        label: "Allocations",
        hasDropdown: true,
        dropdownLinks: [
          { to: "/thawing-cabinet", label: "Thawing Cabinet" },
          { to: "/prep-allocations", label: "Prep Allocations" },
        ],
      },
    ];

    if (user?.isAdmin) {
      links.push(
        {
          to: "/sales",
          icon: <BarChart />,
          label: "Sales Management",
          hasDropdown: true,
          dropdownLinks: [
            { to: "/update-sales-projection", label: "Update Sales Data" },
            { to: "/thawing-cabinet/config", label: "Projection Rules" },
          ],
        },
        {
          to: "/settings",
          icon: <Settings />,
          label: "Settings",
          hasDropdown: true,
          dropdownLinks: [
            { to: "/update-upt", label: "UPT Settings" },
            { to: "/data/message/all", label: "Instructions" },
            { to: "/closure/plans", label: "Store Closures" },
          ],
        }
      );
    }

    links.push({ to: "/how-to", icon: <LucideFileQuestion />, label: "Guide" });

    return links;
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen font-sfpro bg-gray-100">
      {/* Navbar: Hidden on specific routes */}
      {showNavbar && (
        <header className="sticky top-0 z-30 bg-white shadow-md">
          <nav className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* App Name */}
              <Link to="/" className="text-2xl font-bold text-red-600 flex items-center space-x-2">
                <span>CFA-North Barrie</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                {quickAccessLinks.map((link, index) => (
                  <div key={link.to || index} className="relative group">
                    {link.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => handleToggleDropdown(link.label)}
                          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 group"
                        >
                          <span className="mr-2">{link.icon}</span>
                          {link.label}
                          <ChevronDown className="ml-1 w-4 h-4 transform transition-transform duration-200 group-hover:rotate-180" />
                        </button>
                        {dropdownStates[link.label] && (
                          <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            {link.dropdownLinks.map((dropdownLink) => (
                              <Link
                                key={dropdownLink.to}
                                to={dropdownLink.to}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              >
                                {dropdownLink.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={link.to}
                        className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      >
                        <span className="mr-2">{link.icon}</span>
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={handleToggleMenu}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Logout button */}
              <button
                onClick={logout}
                className="hidden md:flex items-center px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Logout
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-2">
                {quickAccessLinks.map((link) => (
                  <div key={link.to} className="px-2 pt-2 pb-3 space-y-1">
                    {link.hasDropdown ? (
                      <>
                        <button
                          onClick={() => handleToggleDropdown(link.label)}
                          className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <span className="mr-2">{link.icon}</span>
                          {link.label}
                          <ChevronDown className="ml-auto w-4 h-4" />
                        </button>
                        {dropdownStates[link.label] && (
                          <div className="pl-4 space-y-1">
                            {link.dropdownLinks.map((dropdownLink) => (
                              <Link
                                key={dropdownLink.to}
                                to={dropdownLink.to}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                              >
                                {dropdownLink.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={link.to}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      >
                        <span className="mr-2">{link.icon}</span>
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="px-4 py-3 border-t border-gray-200">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-4 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </nav>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer: Show only when navbar is shown */}
      {showNavbar && <Footer />}
    </div>
  );
});

export default Layout;