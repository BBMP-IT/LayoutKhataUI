
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));
    const UseLogin = (token) => {
        if (token) {
            setIsAuthenticated(true);
            sessionStorage.setItem('token', token);
        }
    };

    const UseLogout = () => {
        sessionStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, UseLogin, UseLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('Use Auth must be used within an Auth Provider');
    }
    return context;
};

