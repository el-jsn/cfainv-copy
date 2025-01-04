import React, { useState, useCallback, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Menu, X, BarChart2, MessageSquare, Calendar, InspectionPanelIcon } from "lucide-react";
import { useAuth } from "./AuthContext";

const NavLink = memo(({ to, icon, label, onClick }) => (
  <Link
    to={to}
    className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </Link>
));

const Sidebar = memo(({ isOpen, toggleMenu, quickAccessLinks }) => (
  <nav className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-40`}>
    <div className="p-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Access</h2>
      <ul className="space-y-4">
        {quickAccessLinks.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} icon={React.cloneElement(link.icon, { className: "w-5 h-5" })} label={link.label} onClick={toggleMenu} />
          </li>
        ))}
      </ul>
    </div>
  </nav>
));

const Layout = memo(({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prevState => !prevState);
  }, []);

  const quickAccessLinks = React.useMemo(() => {
    const links = [
      { to: "/", icon: <Home />, label: "Home" },
      { to: "/thawing-cabinet", icon: <Calendar />, label: "Thawing Cabinet" },
    ];

    if (user && user.isAdmin) {
      links.splice(1, 0, { to: "/update-upt", icon: <BarChart2 />, label: "Update UPT" },
        { to: "/data/message/all", icon: <MessageSquare />, label: "Adjust Allocations" },
        { to: "/closure/plans", icon: <Calendar />, label: "Store Closures" },
        { to: "/instructions", icon: <InspectionPanelIcon />, label: "Allocations Instructions" },
      ); // Insert after Home
    }

    return links;
  }, [user]); // Depend on user to re-evaluate when user changes

  const shouldRenderMenu = location.pathname !== "/thawing-cabinet" && location.pathname !== "/login";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">
      {shouldRenderMenu && (
        <>
          <button
            onClick={toggleMenu}
            className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
          <Sidebar isOpen={isMenuOpen} toggleMenu={toggleMenu} quickAccessLinks={quickAccessLinks} />
        </>
      )}
      <main className={`transition-all duration-300 ${isMenuOpen ? 'ml-64' : 'ml-0'}`}>
        {children}
      </main>
    </div>
  );
});

export default Layout;