import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Menu, X, BarChart2, MessageSquare, Calendar, Settings, InspectionPanelIcon } from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const quickAccessLinks = [
    { to: "/", icon: <Home />, label: "Home" },
    { to: "/update-upt", icon: <BarChart2 />, label: "Update UPT" },
    { to: "/data/message/all", icon: <MessageSquare />, label: "Adjust Allocations" },
    { to: "/closure/plans", icon: <Calendar />, label: "Store Closures" },
    { to: "/instructions", icon: <InspectionPanelIcon />, label: "Allocations Instructions" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">
      {location.pathname !== "/thawing-cabinet" && location.pathname !== "/login" && (
        <>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>

          <nav className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} z-40`}>
            <div className="p-5">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Access</h2>
              <ul className="space-y-4">
                {quickAccessLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {React.cloneElement(link.icon, { className: "w-5 h-5" })}
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </>
      )}
      <main className={`transition-all duration-300 ${isMenuOpen ? 'ml-64' : 'ml-0'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
