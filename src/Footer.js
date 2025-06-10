// src/Footer.js
import React from 'react';
import { Box, Typography, } from '@mui/material';

const Footer = () => {
  return (
    
    <Box component="footer" sx={{ p: 5, backgroundColor: '#015454', color: 'white', mt: 'auto'}}>
      <Typography variant="body1" align="center">
        © Copyright BBMP . All rights reserved.
      </Typography>
    </Box>

  );
};

export default Footer;
