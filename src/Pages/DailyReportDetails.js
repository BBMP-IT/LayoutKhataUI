import React, { useState, useEffect ,useCallback} from 'react';
import {
  Button,  Box, Container, Typography,
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
 TablePagination,
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../components/Axios';
import { useLocation ,useNavigate} from 'react-router-dom';

const DailyReportDetails = () => {
    const [propertyData, setPropertyData] = useState([]);
    const location = useLocation();
    const [page, setPage] = useState(0);
    const [formattedDate,setFormattedDate] = useState("")
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();
    const fetchData = async (page = 1, rowsPerPage = 10) => {
        debugger
        try {
            // const params = new URLSearchParams(location.search);
            // const wardNumber = params.get('WARDNUMBER');
            // const QueryName = params.get('REPORTTYPE');
            const today = new Date(); // Get current date
            setFormattedDate(`${String(today.getDate()).padStart(2, "0")}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}-${today.getFullYear()}`)
            const { WARDNUMBER, REPORTTYPE } = location.state || {};
            let response = await axiosInstance.get(`Report/GetEAASTHIDailyReportDetails?wardNumber=${WARDNUMBER}&QueryName=${REPORTTYPE}&pageNo=${page}&PageSize=${rowsPerPage}`)
        setPropertyData(response.data.Table || [])
      
        }
catch(error){
   
console.log(error)
}
    }
  
    const handleBack =() => {
        navigate("/GetDailyReport")
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
        
          Daily Report Details -  {formattedDate} 
        </Typography>
        <Box display="flex" justifyContent="right" gap={1} mt={0.1} width="100%">
      <Button variant="contained" color="primary" onClick={handleBack}>
      {"Previous"}
            </Button>
            </Box>
    <TableContainer component={Paper} sx={{ mt: 4 }}>
        
    <Table>
      <TableHead>
        <TableRow>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>WARD NAME</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>STREET NAME</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>PROPERTYID</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ASSESSMENT NUMBER</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>CITIZEN SUBMITTED DATE</TableCell> 


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
                <TableCell style={{ padding: '0.5em 1em' }}>{row.WARDNAME}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.STREETNAME}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.PROPERTYID}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.ASSESMENTNUMBER}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }} >{row.CITIZEN_SUBMITTED_DATE}</TableCell>
              </TableRow>
            ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
  <TablePagination
  rowsPerPageOptions={[10, 25, 50, 100]}
  component="div"
  count={propertyData.length > 0 ? propertyData[0].TOTAL_COUNT : 10} 
  rowsPerPage={rowsPerPage}
  page={page}
  onPageChange={ async (event, newPage) => {
    setPage(newPage);
  await  fetchData(newPage + 1, rowsPerPage); 
  }}
  onRowsPerPageChange={ async(event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
   await  fetchData(1, parseInt(event.target.value, 10)); 
  }}
  labelRowsPerPage="Properties per Page:"
  labelDisplayedRows={({ from, to, count }) => 
    `Properties: ${from}–${to} of ${count !== -1 ? count : `more than ${to}`} `
  }
/>
            </Box>
  </Container>
   );
};
    export default DailyReportDetails;    