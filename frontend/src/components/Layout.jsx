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
} from "lucide-react";
import { useAuth } from "./AuthContext";

const Layout = memo(({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [allocationsMenuOpen, setAllocationsMenuOpen] = useState(false);


  // Toggle Navbar visibility based on the route
  useEffect(() => {
    const hiddenRoutes = ["/thawing-cabinet", "/prep-allocations", "/login"];
    setShowNavbar(!hiddenRoutes.includes(location.pathname));
  }, [location.pathname]);

  const handleToggleMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

  const handleToggleAllocationsMenu = useCallback(() => {
    setAllocationsMenuOpen(!allocationsMenuOpen);
  }, [allocationsMenuOpen]);

  const handleNavigation = useCallback(
    (to) => {
      if (mobileMenuOpen) handleToggleMenu();
      if (allocationsMenuOpen) handleToggleAllocationsMenu();
      navigate(to);
    },
    [mobileMenuOpen, handleToggleMenu, navigate, allocationsMenuOpen, handleToggleAllocationsMenu]
  );

  const quickAccessLinks = React.useMemo(() => {
    const links = [
      { to: "/", icon: <Home />, label: "Home" },
      {
        to: "/allocations",
        icon: <Calendar />,
        label: "Allocations",
        hasDropdown: true,
        dropdownLinks: [
          { to: "/thawing-cabinet", label: "Thawing Cabinet" },
          { to: "/prep-allocations", label: "Prep Allocations" },
        ],
      },
      { to: "/how-to", icon: <LucideFileQuestion />, label: "How to Use" },
    ];

    if (user && user.isAdmin) {
      links.splice(1, 0,
        { to: "/update-upt", icon: <Upload />, label: "Update UPT" },
        { to: "/data/message/all", icon: <Hammer />, label: "Adjust Allocations" },
        { to: "/closure/plans", icon: <CalendarClock />, label: "Store Closures" },
        { to: "/instructions", icon: <BrainCog />, label: "Instructions Board" }
      );
    }

    return links;
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen font-sfpro bg-gray-100">
      {/* Navbar: Hidden on specific routes */}
      {showNavbar && (
        <header className="sticky top-0 z-30 bg-white shadow-md">
          <nav className="flex items-center justify-between px-4 py-2">
            {/* App Name */}
            <Link to="/" className="text-2xl font-bold text-red-600">
              CFA-North Barrie
            </Link>

            {/* Hamburger Menu for Mobile */}
            <button
              onClick={handleToggleMenu}
              className="sm:hidden p-2 rounded-md focus:outline-none hover:bg-gray-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Navigation Links */}
            <div
              className={`sm:flex sm:items-center ${mobileMenuOpen ? "block" : "hidden"
                }`}
            >
              <ul className="flex flex-col sm:flex-row sm:space-x-4">
                {quickAccessLinks.map((link) => (
                  <li key={link.to} className="relative">
                    {link.hasDropdown ? (
                      <AllocationDropdown
                        label={link.label}
                        icon={link.icon}
                        onToggle={handleToggleAllocationsMenu}
                        isOpen={allocationsMenuOpen}
                        links={link.dropdownLinks}
                        handleNavigation={handleNavigation}
                      />
                    ) : (
                      <NavLink
                        to={link.to}
                        icon={link.icon}
                        label={link.label}
                        onClick={() => handleNavigation(link.to)}
                        active={location.pathname === link.to}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
});

const NavLink = memo(({ to, icon, label, onClick, active }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${active
        ? "bg-red-100 text-red-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`}
    >
      <div className="mr-2">{icon}</div>
      {label}
    </Link>
  );
});


const AllocationDropdown = memo(({ label, icon, onToggle, isOpen, links, handleNavigation }) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800"
      >
        <div className="mr-2">{icon}</div>
        {label}
        <ChevronDown className={`ml-1 w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleNavigation(link.to)}
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
});

export default Layout;