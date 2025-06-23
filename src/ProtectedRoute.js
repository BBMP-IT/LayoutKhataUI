import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element }) => {
    const { isAuthenticated } = useAuth();
    // console.log(isAuthenticated,"ProRout")
    return isAuthenticated ? element : <Navigate to="/" replace />
}

export default ProtectedRoute;