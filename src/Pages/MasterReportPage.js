import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import { useSpring, animated } from '@react-spring/web';

const MasterReportPage = () => {
  const navigate = useNavigate();

  // Animation for cards
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 },
  });

  // Animation for announcements
  const bounceIn = useSpring({
    from: { transform: 'scale(0.8)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    config: { tension: 120, friction: 14 },
  });

  // List of reports
  const reports = [
    { id: 1, name: 'EAASTHI STATUS ', path: '/Get_EAASTHI_Status' },
    { id: 2, name: 'DAILY REPORT', path: '/GetDailyReport' },
    { id: 3, name: 'EC DAILY REPORT', path: '/ECDailyReport' },
    { id: 4, name: 'MUTATION DAILY ', path: '/MutationDailyReport' },
    { id: 5, name: 'PENDANCY REPORT', path: '/PendanceReport' },
    { id: 6, name: 'PUBLIC NOTICES ', path: '/PublicNoticesReport' },
    { id: 7, name: 'PENDING MUTATION ', path: '/PendingMutationReport' },
    { id: 8, name: 'NEW KHATA DAILY', path: '/GetNewKhataReport' },
  ];

  // Upcoming report announcement
  const upcomingReports = [
   
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg">
      {/* Header Section */}
      <Box
        sx={{
            background: 'linear-gradient(135deg, #04BA71 0%, #FDC827 100%)', // Light green to blue gradient
            color: 'white',
          padding: 2,
          borderRadius: 3,
          marginTop: 2,
          color: 'white',
          boxShadow: 3,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            marginBottom: 2,
            color:'black',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          }}
        >
           Master Report Page
        </Typography>
        <Typography variant="h6" sx={{
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            marginBottom: 1,
            color:'black',
           
          }}>
          Select a report to view details or explore upcoming releases below!
        </Typography>
      </Box>

      {/* Reports Section */}
      <Box sx={{ marginTop: 2 }}>
        <Grid container spacing={4}>
          {reports.map((report) => (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <animated.div style={fadeIn}>
              <Card
  sx={{
    background: 'linear-gradient(135deg, #04BA71 0%, #FDC827 100%)', // Light green to blue gradient
    color: 'white',
    borderRadius: 3,
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
    padding: 2,
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
    },
  }}
>
  <CardContent>
    {/* Report Name */}
    <Typography
      variant="h5"
      align="center"
      sx={{
        fontWeight: 'bold',
        marginBottom: 1,
        color: 'white',  // white text for contrast
      }}
    >
      {report.name}
    </Typography>

   

    {/* Click Here Button */}
    <Button
      fullWidth
      variant="contained"
      onClick={() => handleNavigation(report.path)}
      sx={{
        backgroundColor: '#04454D', // Purple background
        '&:hover': { backgroundColor: '#04454D' },
        color: 'white',
        fontWeight: 'bold',
        padding: '10px 0',
      }}
    >
      Click Here
    </Button>
  </CardContent>
</Card>


              </animated.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Upcoming Reports Section */}
      <Box
        sx={{
          marginTop: 4,
          padding: 4,
          backgroundColor: '#f3e5f5',
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <animated.div style={bounceIn}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', color: '#6a1b9a', marginBottom: 3 }}
          >
            Upcoming Reports
          </Typography>
        </animated.div>
        {upcomingReports.length === 0 ? (
    <Typography
    variant="h6"
    align="center"
    gutterBottom
    sx={{ fontWeight: 'bold', color: '#6a1b9a'}}
    >
      No Upcoming Reports !
    </Typography>
  ) : (
        <Grid container spacing={4}>
   

          {upcomingReports.map((report) => (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <animated.div style={bounceIn}>
                <Paper
                  sx={{
                    padding: 3,
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 2,
                    boxShadow: 4,
                    '&:hover': {
                      transform: 'scale(1.03)',
                      transition: 'transform 0.3s',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#4a148c' }}
                  >
                    {report.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ marginTop: 1, color: '#6a1b9a' }}
                  >
                    Release Date: {report.releaseDate}
                  </Typography>
                </Paper>
              </animated.div>
            </Grid>
            ))}
            </Grid>
          )}
      </Box>
    </Container>
  );
};

export default MasterReportPage;
