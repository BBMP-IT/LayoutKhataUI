import React, { useState, useEffect ,useCallback} from 'react';
import {
  Button,  Box, Container, Typography,
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
 
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../components/Axios';


const DraftDownloadedReport = () => {
    const [propertyData, setPropertyData] = useState([]);
    const fetchData = async () => {
        debugger
        try {
           
            let response = await axiosInstance.get("Report/GetDraftDownloaded")
        setPropertyData(response.data.Table || [])
        
        }
catch(error){
   
console.log(error)
}
    }
  


    useEffect(() => {
        // Fetch data immediately
        fetchData();

        // Set an interval to fetch data every 5 seconds
        const interval = setInterval(() => {
            fetchData();
        }, 5000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);
    return (
        <Container maxWidth="xl">
       <Box sx={{ backgroundColor: '#f0f0f0', padding: 1, borderRadius: 2, mt: 1 }}>
       <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontFamily: "sans-serif",
          
            color: '#1565c0',
            fontSize: {
              xs: '1.5rem',
              sm: '2rem',
              md: '2.5rem',
            }
          }}
        >
        
        Draft Downloaded
        </Typography>
    <TableContainer component={Paper} sx={{ mt: 4 }}>
        
    <Table>
      <TableHead>
        <TableRow>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>WARD NUMBER</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>WARD NAME</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>XML GENERATED</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>DRAFT GENERATED</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>COMPLETED</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {propertyData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={12} align="center">
         No Data Available 
            </TableCell>
          </TableRow>
        ) : (
          propertyData
            .map((row, index) => (
              <TableRow key={index} style={{ height: '0.1em' }}>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.WARDNUMBER}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.WARDNAME_EN}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.TTL_XML}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.DRAFT_GENERATED}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.COMPLETED}</TableCell>
              </TableRow>
            ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
  
            </Box>
  </Container>
   );
};
    export default DraftDownloadedReport;    