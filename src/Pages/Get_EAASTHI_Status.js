import React, { useState, useEffect ,useCallback} from 'react';
import {
  Button,  Box, Container, Typography,
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
 
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../components/Axios';


const Get_EAASTHI_Status = () => {
    const [propertyData, setPropertyData] = useState([]);
    const fetchData = async () => {
        debugger
        try {
           
            let response = await axiosInstance.get("Report/GetEAASTHIStatus")
        setPropertyData(response.data.Table || [])
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
        
          e-AASTHI - e-Khatha Status as on 
        </Typography>
    <TableContainer component={Paper} sx={{ mt: 4 }}>
        
    <Table>
      <TableHead>
        <TableRow>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>NO OF APPLICATION SUBMITTED TILL TODAY</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>NO OF APPLICATION FORWARDED TO CW TILL TODAY</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>NO OF APPLICATION AUTO APPROVED TILL TODAY</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>NO OF APPLICATION APPROVED TILL TODAY</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>NO OF APPLICATION SUBMITTED TODAY</TableCell> 
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>NO OF APPLICATION FORWARDED TO CW TODAY</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>NO OF APPLICATION TODAY AUTO APPROVED</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>NO OF APPLICATION TODAY APPROVED</TableCell>

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
                <TableCell style={{ padding: '0.5em 1em' }}>{row.NO_OF_APPLICATIONS_UNTIL_TODAY_SUBMITTED}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.NO_OF_APPLICATIONS_FORWARDED_TO_CW_UNTIL_TODAY}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.TOTAL_AUTO_APPROVED_TILL_TODAY}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.TOTAL_APPL_APPROVED_TILL_TODAY}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }} >{row.NO_OF_APPLICATIONS_TODAY_SUBMITTED}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.NO_OF_APPLICATIONS_FORWARDED_TO_CW_TODAY}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.TODAY_AUTO_APPROVED}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.TODAY_APPL_APPROVED}</TableCell>
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
    export default Get_EAASTHI_Status;    