import React from 'react';
import { Typography, Container, Paper, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/system';
import Warning from '../assets/warning.png';

// Define custom styled components
const StyledContainer = styled(Container)({
  textAlign: 'center',
  height: '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StyledPaper = styled(Paper)({
  padding: '32px',
  textAlign: 'center',
  margin: '0 auto',
});

const SadImage = styled('img')({
  width: '150px',
  height: '150px',
  marginBottom: '20px',
});

const ErrorPage = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const errorMessage = location.state?.errorMessage || "Unknown error occurred in Sending Error Message";
  const errorLocation = location.state.errorLocation || "Unknown Error Occured in Sending Location"
  const handleSupport = () => {
    window.location.href = "https://www.google.com";
  }

  const handleLoginPage = () => {
    localStorage.clear();
    navigate("/");
  }

  return (
    <StyledContainer maxWidth="xl" fullWidth>
      <StyledPaper >
        <SadImage src={Warning} alt="Warning" />
        <Typography variant="h2" gutterBottom>
          Oops! Something went wrong.
        </Typography>
        <Typography variant="h3" gutterBottom>
          The Error is : {errorMessage}
        </Typography>
        <Typography variant="h3" gutterBottom>
          The Error Location is : {errorLocation}
        </Typography>
        <Button variant="text" color="primary" onClick={handleSupport} style={{ marginRight: '10px' }}>
          Contact Support
        </Button>
        <Button variant="text" color="secondary" onClick={handleLoginPage}>
          Go Back to Login
        </Button>
      </StyledPaper>
    </StyledContainer>
  );
};

export default ErrorPage;
