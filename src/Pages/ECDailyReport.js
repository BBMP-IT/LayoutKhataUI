import React, { useState, useEffect ,useCallback} from 'react';
import {
  Button,  Box, Container, Typography,
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
 
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../components/Axios';


const ECDailyReport = () => {
    const [propertyData, setPropertyData] = useState([]);
    const [formattedDate,setFormattedDate] = useState("")
    const fetchData = async () => {
        debugger
        try {
           
            let response = await axiosInstance.get("Report/GetECDailyReport")
        setPropertyData(response.data.Table || [])
        let today= new Date();
        setFormattedDate(`${String(today.getDate()).padStart(2, "0")}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}-${today.getFullYear()}`)
        }
catch(error){
   
console.log(error)
}
    }
  


    useEffect( () => {
        fetchData();
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
        
        EC Daily Report as on - {formattedDate}
        </Typography>
    <TableContainer component={Paper} sx={{ mt: 4 }}>
        
    <Table>
      <TableHead>
        <TableRow>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ZONE NAME</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>WARD NAME</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>TOTAL APPLICATION RECIEVED</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>APPLICATION IN CW</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>APPLICATION APPROVED</TableCell> 
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>APPLICATION REJECTED</TableCell>
          

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
                <TableCell style={{ padding: '0.5em 1em' }}>{row.ZONENAME_EN}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.WARDNAME_EN}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.TOTAL_APPLICATION_REC}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.AVAILABLE_IN_CW}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }} >{row.APR}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.REJ}</TableCell>
                
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
    export default ECDailyReport;    