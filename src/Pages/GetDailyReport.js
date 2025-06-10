import React, { useState, useEffect ,useCallback} from 'react';
import {
  Button,  Box, Container, Typography,
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
 CircularProgress
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../components/Axios';
import { useNavigate } from 'react-router-dom';

const GetDailyReport = () => {
    const [propertyData, setPropertyData] = useState([]);
    const [loading,setLoading] = useState(false);
    const [formattedDate,setFormattedDate] = useState("")
    const [totals1,settotals] = useState([]);
    const navigate = useNavigate();
    const fetchDailyDetails = (row,reportType) => {
      debugger
      navigate("/DailyReportDetails", {
        state: {
            WARDNUMBER: row,
            REPORTTYPE: reportType
        }
    });

    }
    const fetchData = async () => {
        debugger
        try {
          setLoading(true)
            let response = await axiosInstance.get("Report/GetEAASTHIDailyReport")
        setPropertyData(response.data.Table || [])
        const today = new Date(); // Get current date
        setFormattedDate(`${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`)
    debugger
    const totals = {
      TOTAL_RECEIVED: response.data.Table.reduce((sum, row) => sum + (row.TOTAL_RECEIVED || 0), 0),
      YEST_RECEIVED: response.data.Table.reduce((sum, row) => sum + (row.YEST_RECEIVED || 0), 0),
      ACTIVE_CW: response.data.Table.reduce((sum, row) => sum + (row.ACTIVE_CW || 0), 0),
      ACTIVE_ARO: response.data.Table.reduce((sum, row) => sum + (row.ACTIVE_ARO || 0), 0),
      ARO_APPROVED: response.data.Table.reduce((sum, row) => sum + (row.ARO_APPROVED || 0), 0),
      AUTO_APPROVED: response.data.Table.reduce((sum, row) => sum + (row.AUTO_APPROVED || 0), 0),
      YEST_CW_DISPOSED_COUNT: response.data.Table.reduce((sum, row) => sum + (row.YEST_CW_DISPOSED_COUNT || 0), 0),
      YEST_RI_DISPOSED_COUNT: response.data.Table.reduce((sum, row) => sum + (row.YEST_RI_DISPOSED_COUNT || 0), 0),
      YEST_AR0_DISPOSED_COUNT: response.data.Table.reduce((sum, row) => sum + (row.YEST_AR0_DISPOSED_COUNT || 0), 0),
      CW_PENDING_COUNT: response.data.Table.reduce((sum, row) => sum + (row.CW_PENDING_COUNT || 0), 0),
      ARO_PENDING_COUNT: response.data.Table.reduce((sum, row) => sum + (row.ARO_PENDING_COUNT || 0), 0),
      RI_PENDING_COUNT: response.data.Table.reduce((sum, row) => sum + (row.RI_PENDING_COUNT || 0), 0),
  };
  settotals(totals || [])
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
        
          Daily Report - {formattedDate}
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
          ARO
        </TableCell>
        <TableCell
          colSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          e-Khatha Applications Received
        </TableCell>
        <TableCell
          colSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          Active No of
        </TableCell>
        <TableCell
          colSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          e-Khatha Approved
        </TableCell>
        <TableCell
          colSpan={3}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          Disposal in 24-hour
        </TableCell>
        <TableCell colSpan={3} style={cellStyle}>
          Pending with
        </TableCell>
      </TableRow>
      {/* Subheaders */}
      <TableRow>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>Total</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>
          In 24 Hours
        </TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>CW Login</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>
          ARO Login
        </TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>By ARO</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>Automate</TableCell>
        {/* <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>
          Total
        </TableCell> */}
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>Case Worker</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>RI</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>
          ARO
        </TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>Case Worker</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>RI</TableCell>
        <TableCell style={subCellStyle}>ARO</TableCell>
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
            {row.WARDNUMBER} - {row.WARDNAME_EN}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.TOTAL_RECEIVED}
            </TableCell>
            <TableCell style={bodyCellStyle}>
          {row.YEST_RECEIVED}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.ACTIVE_CW}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.ACTIVE_ARO}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.ARO_APPROVED}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.AUTO_APPROVED}
            </TableCell>
            {/* <TableCell style={bodyCellStyle}>
              {row.ARO_APPROVED + row.AUTO_APPROVED}
            </TableCell> */}
            <TableCell style={bodyCellStyle}>
            {row.YEST_CW_DISPOSED_COUNT}
            </TableCell>
            <TableCell style={bodyCellStyle}>
           {0}
            </TableCell>
            <TableCell style={bodyCellStyle}>
           {row.YEST_AR0_DISPOSED_COUNT}
            </TableCell>
            <TableCell style={bodyCellStyle}>
           {row.CW_PENDING_COUNT}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {0}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.ARO_PENDING_COUNT}
            </TableCell>
          </TableRow>
          
        ))
      )}
       <TableRow>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }} colSpan={2}>
                    Total
                </TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{totals1.TOTAL_RECEIVED}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{totals1.YEST_RECEIVED}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{totals1.ACTIVE_CW}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{totals1.ACTIVE_ARO}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{totals1.ARO_APPROVED}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{totals1.AUTO_APPROVED}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{totals1.YEST_CW_DISPOSED_COUNT}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{0}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{totals1.YEST_AR0_DISPOSED_COUNT}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{totals1.CW_PENDING_COUNT}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{0}</TableCell>
                <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>{totals1.ARO_PENDING_COUNT}</TableCell>
            </TableRow>
    </TableBody>
    
  </Table>
</TableContainer>
            </Box>
  </Container>
   );
};
export default GetDailyReport;