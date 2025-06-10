// src/App.js
import React from 'react';
import AppRoutes from './Routes';
import './localization/i18n';
import './App.css'; 



function App() {
  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
}

export default App;
