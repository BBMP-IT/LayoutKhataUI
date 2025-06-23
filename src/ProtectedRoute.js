import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../src/API/authService'; // adjust path


const ProtectedRoute = ({ element: Component }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      let token = localStorage.getItem('access_token');

      if (!token) {
        // If no token, try generating one
        token = await getAccessToken();
      }

      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkToken();
  }, []);

  if (isLoading) {
    // You can show a spinner, skeleton, etc.
    return 
  }

  return isAuthenticated ? Component : <Navigate to="/" replace />;
};

export default ProtectedRoute;
