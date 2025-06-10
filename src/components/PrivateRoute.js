// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

// Helper functions for user progress
const getUserProgress = () => localStorage.getItem("userProgress");

const PrivateRoute = ({ element, requiredStep }) => {
  const { token } = useAuth();
  const location = useLocation();
  
  // Get user progress from localStorage
  const userProgress = getUserProgress();

  // If no token or user hasn't completed the required step, redirect
  // if (!token || userProgress < requiredStep) {
  //   return <Navigate to="/" state={{ from: location }} />;
  // }

  // If both token and progress are valid, render the element
  return element;
};

export default PrivateRoute;
