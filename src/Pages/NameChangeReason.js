import React, { useState, useEffect ,useCallback} from 'react';
import {
  Button,  Box, Container, Typography,
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,TablePagination,
 CircularProgress,Dialog, DialogContent,DialogActions,Grid,TextField
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../components/Axios';
import {  useNavigate ,useLocation} from 'react-router-dom';
import { toast } from 'react-toastify';

const NameChangeReason = () => {
   const [formData, setFormData] = useState({
    BESCOMBILL:"",
    BWWSBBILL:"",
    });
    const [propertyData, setPropertyData] = useState([]);
    const [loading,setLoading] = useState(false);
      const location = useLocation();
        const [LoginData,setLoginData] = useState(null)
     const [page, setPage] = useState(0);
   
     const [rowsPerPage, setRowsPerPage] = useState(10);
     
            const [pdfUrl, setPdfUrl] = useState('');
  

    
    

const handleChange = (e) =>{
  const { name, value } = e.target;
     
  setFormData({
    ...formData,
    [name]: value
  });
}
const handleBESCOMSearch = async () =>{
  if(formData.PropertyEPID.length === 0){
    toast.error("Please Enter the BESCOM BILL Number")
    return
  }
  try {
    setLoading(true)
    let response = await axiosInstance.get(`MutationObjectionAPI/Get_Pending_Mutation_Details?TypeOfSearch=${2}&PropertyEPID=${formData.PropertyEPID}&PageNo=${1}&PageCount=${10}`)
  setPropertyData(response.data.Table || [])
  setLoading(false)
  }
  catch(ex){
    setLoading(false)
    console.log(ex)
  }
}

const handleReset = async () => {
  try {
    setLoading(true)
   // let response = await axiosInstance.get(`MutationObjectionAPI/Get_Pending_Mutation_Details?TypeOfSearch=${1}&PropertyEPID=${0}&PageNo=${1}&PageCount=${10}`)
  setPropertyData([])
  setLoading(false)
  }
  catch(ex){
    setLoading(false)
    console.log(ex)
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
        padding: '15px',
        textAlign: 'center',
        borderRight: '1px solid #ddd',
        borderBottom: '1px solid #ddd',
      };      
      

    useEffect( () => {
     //   fetchData();
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
        
        BESCOM & BWSSB ನ ವಿವರಗಳು
        </Typography>
        <Grid container spacing={2} alignItems={"center"} justifyContent="center">
         
         
          <Grid item xs={12} sm={6} >
            <TextField
              label={("BESCOM 10-ಅಂಕಿಯ ಖಾತೆ ಐಡಿ:")}
              name="PropertyEPID"
              value={formData.PropertyEPID}
              onChange={handleChange}
              fullWidth
              
              sx={{ marginBottom: 3,backgroundColor:"#ffff"  }}
            />
          </Grid>
          
          <Box display="flex" justifyContent="center" gap={2} mt={0.5} width="100%">
      
            <Button variant="contained" color="success" onClick={handleBESCOMSearch}>
              {("FETCH")}
            </Button>
            <Button variant="contained" color="primary" onClick={handleReset}>
              {("Reset")}
            </Button>
          
          </Box>
        </Grid>
       
        <TableContainer component={Paper} sx={{ mt: 4, border: '1px solid #ddd' }}>
  <Table sx={{ borderCollapse: 'collapse' }}>
    <TableHead>
      {/* Main Headers */}
      <TableRow>
        <TableCell
          rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          SI NO
        </TableCell>
        <TableCell
          rowSpan={1}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          ಗ್ರಾಹಕ ಹೆಸರು
        </TableCell>
        <TableCell
         rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
         BESCOM ಖಾತೆ ಐಡಿ
        </TableCell>
        <TableCell
          rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
       ವಿಳಾಸ
        </TableCell>
        <TableCell
         rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
        
        </TableCell>
        <TableCell
         rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
        
        </TableCell>
        
         
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
           <Typography color="Highlight">Reg Number :</Typography>  {row.REGISTRATIONNUMBER}  <Typography color="Highlight">Registration Date :</Typography> {row.REGISTRATIONDATE}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.MUTATIONTYPE_EN}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.PROPERTYID}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.SELLER} 
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.RECEIVER}
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
export default NameChangeReason;