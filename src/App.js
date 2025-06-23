// src/App.js
import React from 'react';
import AppRoutes from './Routes';
import './localization/i18n';
import './App.css'; 
import { AuthProvider } from './AuthContext';


function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
}

export default App;
