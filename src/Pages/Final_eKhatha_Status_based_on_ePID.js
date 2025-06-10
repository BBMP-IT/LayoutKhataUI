import React, { useState, useEffect ,useCallback} from 'react';
import {
  Button,  Box, Container, Typography,
 Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
 TablePagination,Grid,TextField
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../components/Axios';
import { useLocation ,useNavigate} from 'react-router-dom';
import PendanceReport from './PendanceReport';
import { toast } from 'react-toastify';

const Final_eKhatha_Status_based_on_ePID = () => {
    const [formData, setFormData] = useState({
      
        Search: "",
       
      });
    const [propertyData, setPropertyData] = useState([]);
    const location = useLocation();
    const [page, setPage] = useState(0);
    const [formattedDate,setFormattedDate] = useState("")
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [wardNumber,setWardNumber] = useState("")
    const [TypeOfRole,setTypeOfRole] = useState("");
    const [LoginDetails ,setLoginDetails] = useState([])
    const navigate = useNavigate();
    const handleChange = async (e) => {
        const { name, value } = e.target;
        
        setFormData({
          ...formData,
          [name]: value
        });
      }
      const handleSearch = async () => {
        if(formData.Search === "" || formData.Search.length === 0){
            toast.error("Please Enter the EPID")
            return
        }
        debugger
        let response = await axiosInstance.get(`Report/GET_Final_eKhatha_Status_Based_on_ePID?PropertyEpid=${formData.Search}`)
        setPropertyData(response.data.Table || [])
      }
     const handleReset = async () => {
        let response = await axiosInstance.get(`Report/GET_Final_eKhatha_Status_Based_on_ePID?PropertyEpid=${0}`)
        setPropertyData(response.data.Table || [])
     }
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
            const { WARDNUMBER,TYPEOFROLE } = location.state || {};
            setWardNumber(WARDNUMBER)
            setTypeOfRole(TYPEOFROLE)
            let response = await axiosInstance.get(`Report/GET_Final_eKhatha_Status_Based_on_ePID?PropertyEpid=${0}`)
            debugger
        setPropertyData(response.data.Table || [])
        }
catch(error){
   
console.log(error)
}
    }
  
    const handleBack =() => {
        window.location.href = "https://bbmpeaasthi.karnataka.gov.in/";
      }

    useEffect( () => {
        fetchData();
      }, []);
    return (
        <Container maxWidth="lg">
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
        
        Final eKhatha Status
        </Typography>
        <Grid container spacing={5} alignItems={"center"}  justifyContent="center">
          <Grid item xs={12} sm={5} md={4}>
          <TextField
              label={("Search on EPID")}
              name="Search"
              value={formData.Search}
              onChange={handleChange}
              fullWidth
              
              sx={{ marginBottom: 3,backgroundColor:"#ffff"  }}
            />
          </Grid>
          </Grid>
          <Box display="flex" justifyContent="center" gap={2} mt={0.1} width="100%">
         
            <Button variant="contained" color="success" onClick={handleSearch}>
              {("Search")}
            </Button>
            <Button variant="contained" color="primary" onClick={handleReset}>
              {("Reset")}
            </Button>
          
          </Box>
        <Box display="flex" justifyContent="right" gap={1} mt={0.1} width="100%">
      <Button variant="contained" color="primary" onClick={handleBack}>
      {"Previous"}
            </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 3 }}>
  {/* Table for LoginDetails */}
  

  {/* Table for propertyData */}
  <TableContainer component={Paper} sx={{ maxWidth: '100%', margin: '0 auto' }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>
            EPID
          </TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>
            PROPERTY TYPE
          </TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>
          ASSESMENTNUMBER
          </TableCell>
         
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>
          CHECKBANDI NORTH
          </TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>
          CHECKBANDI SOUTH
          </TableCell>
          
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>
          CHECKBANDI EAST
          </TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>
          CHECKBANDI WEST
          </TableCell>
          <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>
            STATUS
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {propertyData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} align="center">
              No Data Available
            </TableCell>
          </TableRow>
        ) : (
          propertyData.map((row, index) => (
            <TableRow key={index} style={{ height: '0.1em' }}>
              <TableCell style={{ padding: '0.5em 1em' }}>{row.PROPERTYID}</TableCell>
              <TableCell style={{ padding: '0.5em 1em' }}>{row.PROPERTYCATEGORYID === 1 ? "Vacant Site" : row.PROPERTYCATEGORYID === 2? "Site with Building" :row.PROPERTYCATEGORYID === 3 ? "Multistorey Flats" :row.PROPERTYCATEGORYID === 4 ? "MULTI-OWNERSHIP BUILDING": "" }</TableCell>
              <TableCell style={{ padding: '0.5em 1em' }}>{row.ASSESMENTNUMBER}</TableCell>
              <TableCell style={{ padding: '0.5em 1em' }}>{row.CHECKBANDI_NORTH}</TableCell>
              <TableCell style={{ padding: '0.5em 1em' }}>{row.CHECKBANDI_SOUTH}</TableCell>
              <TableCell style={{ padding: '0.5em 1em' }}>{row.CHECKBANDI_EAST}</TableCell>
              <TableCell style={{ padding: '0.5em 1em' }}>{row.CHECKBANDI_WEST}</TableCell>
              <TableCell style={{ padding: '0.5em 1em' }}>{row.STATUS}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
</Box>

  
            </Box>
  </Container>
   );
};
    export default Final_eKhatha_Status_based_on_ePID;    