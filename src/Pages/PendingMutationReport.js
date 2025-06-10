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

const PendingMutationReport = () => {
   const [formData, setFormData] = useState({
    PropertyEPID:""
    });
    const [propertyData, setPropertyData] = useState([]);
    const [loading,setLoading] = useState(false);
      const location = useLocation();
        const [LoginData,setLoginData] = useState(null)
     const [page, setPage] = useState(0);
    const [formattedDate,setFormattedDate] = useState("");
     const [rowsPerPage, setRowsPerPage] = useState(10);
     
            const [pdfUrl, setPdfUrl] = useState('');
    const [totals1,settotals] = useState([]);
    const navigate = useNavigate();
    const fetchDailyDetails = (row) => {
      debugger
      //localStorage.setItem("SETPROPERTYMUTATIONEPID",row.PROPERTYEPID)
    
      if(LoginData !== null && LoginData !== undefined){

        localStorage.setItem("SETPROPERTYMUTATIONAPPLID", JSON.stringify(row.MUTAPPLID))
        localStorage.setItem("SETPROPERTYMUTATIONPRORPERTYCODE", JSON.stringify(row.PROPERTYCODE))
        localStorage.setItem("SETPROPERTYMUTATIONEPID", JSON.stringify(row.PROPERTYID))
        navigate("/MutationObjection")
       
      }else {
       
        alert("Please Log-In To File Mutation Objections. Click On The File Mutation Objection Link After Logging In.")
        //   window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_test2/CitzLogin.aspx";
           window.location.href = "https://bbmpeaasthi.karnataka.gov.in/CitzLogin.aspx";
      }

      // localStorage.setItem("SETPROPERTYMUTATIONAPPLID", JSON.stringify(row.MUTAPPLID))
      // localStorage.setItem("SETPROPERTYMUTATIONPRORPERTYCODE", JSON.stringify(row.PROPERTYCODE))
      // localStorage.setItem("SETPROPERTYMUTATIONEPID", JSON.stringify(row.PROPERTYID))
      //  navigate("/MutationObjection")

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

const handleChange = (e) =>{
  const { name, value } = e.target;
     
  setFormData({
    ...formData,
    [name]: value
  });
}
const handleSearch = async () =>{
  if(formData.PropertyEPID.length === 0){
    toast.error("Please Enter the Property EPID")
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
const handleBack = () => {
window.location.href = "https://bbmpeaasthi.karnataka.gov.in";
}
const handleReset = async () => {
  try {
    setLoading(true)
    let response = await axiosInstance.get(`MutationObjectionAPI/Get_Pending_Mutation_Details?TypeOfSearch=${1}&PropertyEPID=${0}&PageNo=${1}&PageCount=${10}`)
  setPropertyData(response.data.Table || [])
  setLoading(false)
  }
  catch(ex){
    setLoading(false)
    console.log(ex)
  }
}
    const fetchData = async (page = 1, rowsPerPage = 10) => {
        debugger
        try {
          setLoading(true)
          let response = await axiosInstance.get(`MutationObjectionAPI/Get_Pending_Mutation_Details?TypeOfSearch=${1}&PropertyEPID=${0}&PageNo=${page}&PageCount=${rowsPerPage}`)
        setPropertyData(response.data.Table || [])
          const params = new URLSearchParams(location.search);
      const LoginData = params.get('LoginData');
      if (LoginData !== null && LoginData !== undefined) {
        let response4 = await axiosInstance.get("Auth/DecryptJson?encryptedXML="+LoginData)
        localStorage.setItem('SETLOGINID', JSON.stringify(response4.data.UserId));
        localStorage.setItem("LoginData", JSON.stringify(response4.data)); 
        setLoginData(JSON.parse(localStorage.getItem('LoginData')))
      }
      localStorage.removeItem('SETPROPERTYMUTATIONEPID');
      localStorage.removeItem('SETMUTATATIONREQID');
      localStorage.removeItem('SETPROPERTYMUTATIONAPPLID');
      localStorage.removeItem('SETPROPERTYMUTATIONPRORPERTYCODE');    
      
   
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
        padding: '15px',
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
        
        Pending Mutations
        </Typography>
        <Grid container spacing={2} alignItems={"center"} justifyContent="center">
         
         
          <Grid item xs={12} sm={6} >
            <TextField
              label={("Search Property EPID")}
              name="PropertyEPID"
              value={formData.PropertyEPID}
              onChange={handleChange}
              fullWidth
              
              sx={{ marginBottom: 3,backgroundColor:"#ffff"  }}
            />
          </Grid>
          
          <Box display="flex" justifyContent="center" gap={2} mt={0.5} width="100%">
          <Button variant="contained" color="primary" onClick={handleBack}>
              {("Previous")}
            </Button>
            <Button variant="contained" color="success" onClick={handleSearch}>
              {("Search")}
            </Button>
            <Button variant="contained" color="primary" onClick={handleReset}>
              {("Reset")}
            </Button>
          
          </Box>
        </Grid>
        {pdfUrl && (
          <Dialog open={Boolean(pdfUrl)} onClose={() => setPdfUrl('')} maxWidth="md" fullWidth>
            <DialogContent>
              <iframe src={pdfUrl} width="100%" height="600px" title="PDF Viewer"></iframe>
            </DialogContent>
            <DialogActions>
              {/* Button to download the PDF with a custom filename */}
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = pdfUrl;
                  link.download = 'Public Notice.pdf'; // Set your desired filename here
                  link.click();
                }}
                color="primary"
              >
                Download PDF
              </Button>
        
              <Button  onClick={() => setPdfUrl("")} color="primary">
              Close PDF 
              </Button>
            </DialogActions>
          </Dialog>
        )}
        <TableContainer component={Paper} sx={{ mt: 4, border: '1px solid #ddd' }}>
  <Table sx={{ borderCollapse: 'collapse' }}>
    <TableHead>
      {/* Main Headers */}
      <TableRow>
        <TableCell
          rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          Date of Registered Deed or Mutation Application
        </TableCell>
        <TableCell
          rowSpan={1}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          Basis of Mutation (Regd Deed/inheritance/Court Order/Bank Order)
        </TableCell>
        <TableCell
         rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          Property EPID 
        </TableCell>
        <TableCell
          rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
         Seller / Giving Party Name
        </TableCell>
        <TableCell
         rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          Purchased/Receiving Party Name
        </TableCell>
        <TableCell
         rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
          Date of Issuance of Public Notice
        </TableCell>
        {/* <TableCell colSpan={4} style={{...cellStyle ,borderRight: '4px solid #ddd' }}>
          Pending with whom
        </TableCell> */}
         <TableCell
         rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
           Pending with whom
        </TableCell>
        <TableCell
         rowSpan={2}
          style={{ ...cellStyle, borderRight: '4px solid #ddd' }}
        >
         File Objection
        </TableCell>
      </TableRow>
      {/* Subheaders */}
      {/* <TableRow>
        
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>Name</TableCell>
        <TableCell  style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>Designation</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>Mobile Number</TableCell>
        <TableCell style={{ ...subCellStyle, borderRight: '4px solid #ddd' }}>In - Date</TableCell> 
      </TableRow> */}
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
            <TableCell style={bodyCellStyle}>
            {/* {row.NOTICEGENERATEDON} */}
            {(row.NOTICE_STATUS === "2" || row.NOTICE_STATUS === "3") ?  <Button color="primary" style={{ width: '2rem',height:"1rem" }} onClick={() =>handlePageDownload(row)}>{row.NOTICEGENERATEDON}</Button>:"Notice Not Generated"}
            </TableCell>
            <TableCell style={bodyCellStyle}>
            {row.NOTICE_STATUS !== "2" ? row.LOGIN_DETAILS : ""}
            </TableCell>
           {/*  <TableCell style={bodyCellStyle}>
            {row.AUTO_APPROVED}
            </TableCell>
          
            <TableCell style={bodyCellStyle}>
            {row.AUTO_APPROVED} 
            </TableCell> 
            <TableCell style={bodyCellStyle}>
            {row.AUTO_APPROVED}
            </TableCell> */}
            <TableCell style={bodyCellStyle}>
            {row.NOTICE_STATUS === "2" ?  <Button color="primary" style={{ width: '2rem',height:"5rem" }} onClick={() =>fetchDailyDetails(row)}>Click Here</Button> : ""}
            </TableCell>
           
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
export default PendingMutationReport;