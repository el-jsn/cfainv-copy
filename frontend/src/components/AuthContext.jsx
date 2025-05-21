import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

// Helper function to decode token and extract user data
const getUserDataFromToken = (token) => {
    if (!token) return null;
    try {
        const decodedToken = jwtDecode(token);
        return {
            id: decodedToken.id,
            name: decodedToken.name, // Assuming it's in your token
            role: decodedToken.role,
            isAdmin: decodedToken.isAdmin
        };
    } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('authToken'); // Clean up invalid token
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authCheckCompleted, setAuthCheckCompleted] = useState(false);

    // Effect for initial authentication check on component mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = getUserDataFromToken(token);
        setUser(userData);
        setAuthCheckCompleted(true); // Mark that the initial auth check has completed
    }, []); // Empty dependency array ensures this runs only once on mount

    // Memoized login function
    const login = useCallback((token) => {
        localStorage.setItem('authToken', token);
        const userData = getUserDataFromToken(token);
        setUser(userData);
        // console.log('AuthContext: User set on login:', userData);
    }, []); // `setUser` is stable, so `useCallback` effectively memoizes this

    // Memoized logout function
    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        setUser(null);
    }, []); // `setUser` is stable

    // Memoize the context value to prevent unnecessary re-renders of consumers
    // This is a key optimization for context providers.
    const value = useMemo(() => ({
        user,
        login,
        logout,
        authCheckCompleted // Exposing this can be useful for consumers
    }), [user, login, logout, authCheckCompleted]);

    // Do not render children until the initial authentication check is complete.
    // This prevents a flash of content (e.g., brief login page) if the user is already authenticated.
    // You could render a loading spinner here instead of null for better UX.
    if (!authCheckCompleted) {
        return null; // Or <YourGlobalLoadingSpinner />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};