import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkToken = async () => { // Make async to handle potential delays
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    console.log('Decoded token:', decodedToken);
                    setUser({
                        id: decodedToken.id,
                        role: decodedToken.role,
                        isAdmin: decodedToken.isAdmin // Assuming role 1 is admin
                    });
                } catch (error) {
                    console.error("Invalid token", error);
                    localStorage.removeItem('authToken');
                }
            }
        }
        checkToken()
    }, []);

    const login = (token) => {
        localStorage.setItem('authToken', token);
        const decodedToken = jwtDecode(token);
        console.log('Decoded token:', decodedToken);
        setUser({
            id: decodedToken.id,
            role: decodedToken.role,
            isAdmin: decodedToken.isAdmin
        });
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
    };

    // Provide context without loading state
    const value = { user, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);