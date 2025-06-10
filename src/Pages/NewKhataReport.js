import React, { useState, useEffect ,useCallback} from 'react';
import {
  Button,  Box, Container, Typography,
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
 CircularProgress
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../components/Axios';
import { useNavigate } from 'react-router-dom';

const GetNewKhataReport = () => {
    const [propertyData, setPropertyData] = useState([]);
    const [loading,setLoading] = useState(false);
    const [formattedDate,setFormattedDate] = useState("")
    const [totals1,settotals] = useState([]);
    const navigate = useNavigate();
    
    const fetchData = async () => {
        debugger
        try {
          setLoading(true)
            let response = await axiosInstance.get("Report/GET_NEW_KHATA_REPORT")
        setPropertyData(response.data.Table || [])
      //setPropertyData([])
        const today = new Date(); // Get current date
        setFormattedDate(`${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`)
    debugger
    
        setLoading(false)
        }
catch(error){
  setLoading(false)
console.log(error)
}
    }
  
  
    const cellStyle = {
        fontWeight: 'bold',
        backgroundColor: "#5ba6d0",
        textAlign: 'center',
        padding: '8px',
        fontSize: "1em",
        borderBottom: '2px solid #ddd',
      };
      
      const subCellStyle = {
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: "#5ba6d0",
        padding: '6px',
        borderBottom: '1px solid #ddd',
      };
      const bodyCellStyle = {
        padding: '8px',
        textAlign: 'center',
        borderRight: '1px solid #ddd',
        borderBottom: '1px solid #ddd',
      };      
      

    useEffect( () => {
        fetchData();
      }, []);
      function GradientCircularProgress() {
        return (
          <React.Fragment>
            <svg width={0} height={0}>
              <defs>
                <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e01cd5" />
                  <stop offset="100%" stopColor="#1CB5E0" />
                </linearGradient>
              </defs>
            </svg>
            <CircularProgress sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
          </React.Fragment>
        );
      }
    
      if (loading) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <GradientCircularProgress />
          </Box>
        );
      }
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
        
          New khata Daily Report - {formattedDate}
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 4, border: '1px solid #ddd' }}>
  <Table sx={{ borderCollapse: 'collapse' }}>
    <TableHead>
      {/* Main Headers */}
      <TableRow>
        <TableCell
          rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          Zone
        </TableCell>
        <TableCell
          rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          RO
        </TableCell>
        <TableCell
          rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          ARO
        </TableCell>
        <TableCell
          colSpan={9}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          New Khata
        </TableCell>
       
        <TableCell
          colSpan={9}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          e-Khatha Corrections
        </TableCell>
       
       
      </TableRow>
      {/* Subheaders */}
      <TableRow>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>TOTALCOUNT</TableCell> 
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>YESTERDAY_COUNT</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>CW_APPROVED_YESTERDAY</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>APPROVED_YESTERDAY</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>CW_PENDING</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>PENDING</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>REJECTED</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>TOTAL_APPROVED</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>AUTO_APPROVED</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>CR_TOTALCOUNT</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>CR_YESTERDAY_COUNT</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>CR_CW_APPROVED_YESTERDAY</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>CR_APPROVED_YESTERDAY</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>CR_CW_PENDING</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>CR_PENDING</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>CR_REJECTED</TableCell>
        <TableCell style={subCellStyle}>CR_APPROVED</TableCell>
        
      </TableRow>
    </TableHead>
    <TableBody>
      {propertyData.length === 0 ? (
        <TableRow>
          <TableCell colSpan={13} align="center" style={{ padding: '16px' }}>
            No Data Available
          </TableCell>
        </TableRow>
      ) : (
        propertyData.map((row, index) => (
          <TableRow key={index}>
            <TableCell style={bodyCellStyle}>
            {row.ZONENAME_EN}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.RONAME_EN}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.WARDNUMBER} - {row.WARDNAME_EN}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.TOTALCOUNT}
            </TableCell>
            <TableCell style={bodyCellStyle}>
          {row.YESTERDAY_COUNT}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.CW_APPROVED_YESTERDAY}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.APPROVED_YESTERDAY}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.CW_PENDING}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.PENDING}
            </TableCell>
            {/* <TableCell style={bodyCellStyle}>
              {row.ARO_APPROVED + row.AUTO_APPROVED}
            </TableCell> */}
            <TableCell style={bodyCellStyle}>
            {row.REJECTED}
            </TableCell>
            <TableCell style={bodyCellStyle}>
           {row.TOTAL_APPROVED}
            </TableCell>
            <TableCell style={bodyCellStyle}>
           {row.AUTO_APPROVED}
            </TableCell>
            <TableCell style={bodyCellStyle}>
           {row.CR_TOTALCOUNT}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.CR_YESTERDAY_COUNT}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.CR_CW_APPROVED_YESTERDAY}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.CR_APPROVED_YESTERDAY}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.CR_CW_PENDING}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.CR_PENDING}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.CR_REJECTED}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.CR_APPROVED}
            </TableCell>
           
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
export default GetNewKhataReport;