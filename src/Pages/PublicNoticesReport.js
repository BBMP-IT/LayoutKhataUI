import React, { useState, useEffect ,useCallback} from 'react';
import {
  Button,  Box, Container, Typography,
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
 TablePagination,Dialog, DialogContent,DialogActions,CircularProgress
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../components/Axios';


const PublicNoticesReport = () => {
    const [propertyData, setPropertyData] = useState([]);
    const [formattedDate,setFormattedDate] = useState("");
     const [page, setPage] = useState(0);
      const [loading, setLoading] = useState(false);
     const [rowsPerPage, setRowsPerPage] = useState(10);
       const [pdfUrl, setPdfUrl] = useState('');
    const fetchData = async (page = 1, rowsPerPage = 10) => {
        debugger
        try {
           
            let response = await axiosInstance.get(`Report/GetPublicNoticesReport?PAGENO=${page}&PAGECOUNT=${rowsPerPage}`)
        setPropertyData(response.data.Table || [])
 
        }
catch(error){
   
console.log(error)
}
    }
    function base64ToBlob(base64, type = "application/octet-stream") {
      const binStr = atob(base64);
      const len = binStr.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
      }
      return new Blob([arr], { type: type });
  }
    const handlePageDownload = async (row) => {
      debugger
      setLoading(true)
     try {
   const response = await axiosInstance.post(
    `Report/DownloadNoticePDF?MutApplId=${row.MUTAPPLID}&Propcode=${row.PROPERTYCODE}`,
    null,
    {
      responseType: 'blob', 
    }
  );
  debugger
 const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
const pdfUrl = URL.createObjectURL(pdfBlob);
  
  setPdfUrl(pdfUrl);
  setLoading(false)
 
}catch(error){
  setLoading(false)
console.log(error)
 }
}  
    


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
           {pdfUrl && (
                    
                  <Dialog open={Boolean(pdfUrl)} onClose={() => setPdfUrl('')} maxWidth="md" fullWidth>
                    <DialogContent>
                       <iframe src={pdfUrl} width="100%" height="600px" title="PDF Viewer"></iframe> 
                     
                    </DialogContent>
                    <DialogActions>
                <Button onClick={() => setPdfUrl('')} color="primary">
                  Close
                </Button>
              </DialogActions>
                    </Dialog>
                    
                  )}
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
        
        Public Notices Report
        </Typography>
    <TableContainer component={Paper} sx={{ mt: 4 }}>
        
    <Table>
      <TableHead>
        <TableRow>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ಆಸ್ತಿ ಸಂಖ್ಯೆ</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ನಿರ್ದರಣಾ ಸಂಖ್ಯೆ</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ವಾರ್ಡ್ ಹೆಸರು</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ಬ್ಲಾಕ್ ಹೆಸರು</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ಮಾಲೀಕರ ಹೆಸರು</TableCell> 
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ಅರ್ಜಿಯ ಸಂಖ್ಯೆ & ದಿನಾಂಕ</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ಮ್ಯುಟೇಶನ್ ಪ್ರಕಾರ</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ಸೂಚನೆ ರಚಿಸಿದೆ ದಿನಾಂಕ</TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF',padding: '0.6em' }}>ಡೌನ್ಲೋಡ್ ಸೂಚನೆ</TableCell>

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
                <TableCell style={{ padding: '0.5em 1em' }}>{row.PROPERTYID}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.ASSESMENTNUMBER}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.WARD}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.BLOCK}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }} >{row.OWNERNAME}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.APPLICATION}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.TRANSACTIONTYPE}</TableCell>
                <TableCell style={{ padding: '0.5em 1em' }}>{row.NOTICEGENERATED}</TableCell>
                {/* <TableCell style={{ padding: '0.5em 1em' }}>{row.MUTAPPLID}</TableCell> */}
                <TableCell style={{ padding: '0.5em 1em' }}><Button color="primary" onClick={() => handlePageDownload(row)}>ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ</Button></TableCell>
              </TableRow>
            ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
  
            </Box>
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
  </Container>
   );
};
    export default PublicNoticesReport;    