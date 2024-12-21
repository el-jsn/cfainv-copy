import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">
      {location.pathname !== "/thawing-cabinet" && (
        <Link
          to="/"
          className="fixed top-4 left-4 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
          aria-label="Go to home page"
        >
          <Home className="w-6 h-6 text-gray-600" />
        </Link>
      )}
      {children}
    </div>
  );
};

export default Layout;