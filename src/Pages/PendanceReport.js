import React, { useState, useEffect ,useCallback} from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, CircularProgress, Dialog, DialogContent,DialogActions,
  FormControl, MenuItem, Select, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination,RadioGroup,FormControlLabel,Radio
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';

const PendanceReport = () => {
  const [formData, setFormData] = useState({
    ZoneName: "",
    WardName: "",
    AROName: "",
    Search: "",
    ReportType:"AROType",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formattedDate,setFormattedDate] = useState("")
  const [propertyData, setPropertyData] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [AROData, setAROData] = useState([]);
  const [WardData, setWardData] = useState([]);
  const [page, setPage] = useState(0);
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [LoginData,setLoginData] = useState("")
  const { t } = useTranslation();
  
  const fetchData = useCallback(async (page = 1, rowsPerPage = 10) => {
    debugger
    setLoading(true)
    try {
      let response = await axiosInstance.get("BBMPCITZAPI/GetMasterZone")
      setZoneData(response.data.Table || [])
      
    
   debugger
     
      setPropertyData([])
      const today = new Date(); // Get current date
      const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${today.getFullYear()} ${String(
        today.getHours()
      ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
        today.getSeconds()
      ).padStart(2, "0")}`;
      setFormattedDate(formattedDate)
      setLoading(false)
      
     
    } catch (error) {
      navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
    }
   
  }, [navigate]);

  useEffect( () => {
    localStorage.setItem("userProgress", 2);
    fetchData();
  }, [fetchData]);

const handleChange = async (e) => {
  const { name, value } = e.target;
  debugger
  if(name === "ZoneName" && formData.ReportType === "WardType" && value !== "All")
    {
  var response1 = await axiosInstance.get("BBMPCITZAPI/GetMasterWard?ZoneId=" + value)
  setWardData(response1.data.Table)
  }
  if(name === "ZoneName" && formData.ReportType === "AROType" && value !== "All")
    {
  var response1 = await axiosInstance.get("Report/GET_ARO_BY_ZONE?zoneid=" + value)
  setAROData(response1.data.Table)
  }
  if(name === "AROName" && formData.ReportType === "AROType" && value !== "All")
    {
  var response1 = await axiosInstance.get("Report/GET_WARD_BY_ARO?AROID=" + value)
  setWardData(response1.data.Table)
  }
  if(name === "ZoneName" && value === "All")
    {
      formData.AROName = ""
      formData.WardName = ""
      setAROData([])
  setWardData([])
  }
  if(name === "AROName" && value === "All")
    {
     formData.WardName = ""
  setWardData([])
  }
  
  setFormData({
    ...formData,
    [name]: value
  });
}
const handleRadioChange = async (e) => {
  const { name, value } = e.target;

  setFormData({
    ...formData,
    ZoneName: "",
    WardName:"",
    AROName:"",
    [name]:value
  });
}
const handleValidation = (ZoneName,AROName,WardName) => {
  debugger
  if(formData.ReportType === "AROType"){
  if(ZoneName === "" || AROName === "" || WardName === "")
    {
    return "0";
  }
}
else {
  if(ZoneName === ""  || WardName === "")
    {
    return "0";
  }
}
if(formData.ReportType === "AROType"){
  if(ZoneName === "All" && AROName === "All" && WardName === "All" ){
    formData.ZoneName = 0;
    formData.AROName = 0;
    formData.WardName = 0;
    return "1"; //no condition
  }
  else if(AROName === "All" && WardName === "All")
    {
      formData.AROName = 0;
      formData.WardName = 0;
      return "2"; //based on zone
    }
    else if(WardName === "All"){
      formData.WardName = 0;
  
      return "3"; //based on zone and ARO
    }
    else {
      return "4" //based on 3 values
    }
}
else
{
   if(ZoneName === "All" && WardName === "All")
    {
      formData.ZoneName = 0;
      formData.AROName = 0;
      formData.WardName = 0;
      return "1"; //no condition
    }
    else if(WardName === "All"){
      formData.WardName = 0;
      formData.AROName = 0;
      return "2"; //based on zone 
    }
    else {
      formData.AROName = 0;
      return "5" //based on zone and ward
    }
}
  
  
 
   
   
} 
 const handleSearch = async () => {

    let valid = handleValidation(formData.ZoneName,formData.AROName,formData.WardName);
    if(valid === "0"){
      toast.error("Please Select All fields");
      return
    }
    debugger
 setLoading(true)
    const response = await axiosInstance.get(`Report/GET_PENDENCE_REPORT?ZoneId=${formData.ZoneName}&AROId=${formData.AROName}&WARDID=${formData.WardName}&SEARCHTYPE=${valid}`);
    setPropertyData(response.data.Table || [])
  
    
    setFormData({
      ...formData,
      ZoneName: formData.ZoneName === 0 ? "All" : formData.ZoneName,
      WardName:formData.WardName === 0 ? "All" : formData.WardName,
      AROName:formData.AROName === 0 ? "All" : formData.AROName,
    
    });
    setLoading(false)
 }
const handleReset = async () => {
  const response =  await axiosInstance.get(`Report/GET_PENDENCE_REPORT?ZoneId=${0}&AROId=${0}&WARDID=${0}&SEARCHTYPE=${"1"}`);
  setPropertyData(response.data.Table || [])
  setFormData({
    ...formData,
    ZoneName: "",
    WardName:"",
    AROName:"",
    ReportType:"AROType"
  });
}
const getBBDRecord = () => {

}
const fetchDailyDetails = (row,role) => {
  debugger
  navigate("/PendanceReportDetails", {
    state: {
        WARDNUMBER: row,
        TYPEOFROLE:role
    }
});

}
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

  if (false) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <GradientCircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 1, borderRadius: 2, mt: 1 }}>
        <ToastContainer />
       
          
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
          {/* {t("PendingPropertyList")} */}
         Pendance Report as on - {formattedDate}
        </Typography>
        
       
                <Grid item xs={6} sm={3}         align="center">
          <FormControl component="fieldset" sx={{ marginBottom: 3 }}>
            <RadioGroup row name="ReportType" value={formData.ReportType} onChange={handleRadioChange}>
              <FormControlLabel value="AROType" control={<Radio />} label={"Based on Zone And ARO Report"} />
              <FormControlLabel value="WardType" control={<Radio />} label={
                 <>
               {"Based on Zone and Ward Report"}
             </>
              }
                />
              
            </RadioGroup>
          </FormControl>
          
        </Grid>

        <Grid container spacing={5} alignItems={"center"}>
          <Grid item xs={12} sm={5} md={4}>
            <FormControl
              fullWidth
              sx={{ marginBottom: 3 }}
            >
              <InputLabel>{t("ZoneName")}</InputLabel>
              <Select
                name="ZoneName"
                value={formData.ZoneName}
                onChange={handleChange}
                sx={{ backgroundColor: "#ffff" }}
              
              >
                <MenuItem value="All">--All--</MenuItem>
                {zoneData.map((item) => (
                  <MenuItem key={item.ZONEID} value={item.ZONEID}>
                    {item.ZONENAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {formData.ReportType === "AROType" &&
          <Grid item xs={12} sm={3} md={4}>
            <FormControl
              fullWidth
              sx={{ marginBottom: 3 }}
            >
              <InputLabel>{t("ARO Name")}</InputLabel>
              <Select
                name="AROName"
                sx={{ backgroundColor: "#ffff" }}
               
                value={formData.AROName}
                onChange={handleChange}
              >
            <MenuItem value="All">--All--</MenuItem>
                {AROData.map((item) => (
                  <MenuItem key={item.AROID} value={item.AROID}>
                    {item.ARONAME_EN}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
}
          <Grid item xs={12} sm={3} md={4}>
            <FormControl
              fullWidth
              sx={{ marginBottom: 3 }}
            >
              <InputLabel>{t("WardName")}</InputLabel>
              <Select
                name="WardName"
                value={formData.WardName}
                onChange={handleChange}
                sx={{ backgroundColor: "#ffff" }}
               
              >
                <MenuItem value="All">--All--</MenuItem>
                {WardData.map((item) => (
                  <MenuItem key={item.WARDID} value={item.WARDID}>
                    {item.WARDNAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
         
         
          
          <Box display="flex" justifyContent="center" gap={2} mt={0.1} width="100%">
         
            <Button variant="contained" color="success" onClick={async ()  =>handleSearch()}>
              {t("Search")}
            </Button>
            <Button variant="contained" color="primary" onClick={async ()  =>handleReset()}>
              {t("Reset")}
            </Button>
          
          </Box>
        </Grid>
      
       
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
            <TableRow>
        </TableRow>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }} colSpan={3} align='center' ></TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }} colSpan={4} align='center'> No of ekhata Application Pending with</TableCell>
              
               
              <TableRow>
              <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }} colSpan={1} align='center' >Zone Name</TableCell> 
              {formData.ReportType === "AROType" &&
              <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }} colSpan={1} align='center' >ARO Name</TableCell> 
            }
              <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' , borderRight: '4px solid #ddd' }} colSpan={1} align='center' >Ward Name</TableCell> 
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }} colSpan={1} align='center' >Case Worker</TableCell> 
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }} colSpan={1} align='center' >ARO</TableCell>
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }} colSpan={1} align='center' >RO</TableCell>
                {/* <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}colSpan={1} align='center' >Total</TableCell> */}
                
              </TableRow>
            </TableHead>
            <TableBody>
              {propertyData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    {t("Nodataavailable")}
                  </TableCell>
                </TableRow>
              ) : (
                propertyData
                  .map((row, index) => (
                    <TableRow key={index} style={{ height: '0.1em' }}>
                    
                
                    
                      <TableCell  style={{ padding: '0.5em 1em' }} colSpan={1} align='center' >{row.ZONENAME_EN}</TableCell>
                      {formData.ReportType === "AROType" &&
                      <TableCell  style={{ padding: '0.5em 1em' }} colSpan={1} align='center'>{row.ARONAME_EN}</TableCell>
}
                      <TableCell  style={{ padding: '0.5em 1em' }} colSpan={1} align='center'>{row.WARDNAME_EN}</TableCell>
                      <TableCell  style={{ padding: '0.5em 1em' }} colSpan={1} align='center'>   <Button color="primary" style={{ width: '2rem',height:"0.1rem" }} onClick={() =>fetchDailyDetails(row.WARDNUMBER,"CASE_WORKER")}>{row.CW_PENDING_COUN}</Button></TableCell>
                     <TableCell  style={{ padding: '0.5em 1em' }} colSpan={1} align='center'>  <Button color="primary" style={{ width: '2rem',height:"0.1rem" }} onClick={() =>fetchDailyDetails(row.WARDNUMBER,"ARO")}>{row.ARO_PENDING_COUN}</Button></TableCell>
                      {/* <TableCell  style={{ padding: '0.5em 1em' }} colSpan={1} align='center'>{row.CW_PENDING_COUN}
                      <TableCell  style={{ padding: '0.5em 1em' }} colSpan={1} align='center'>{row.ARO_PENDING_COUN}</TableCell> */}
                      <TableCell  style={{ padding: '0.5em 1em' }} colSpan={1} align='center'>{row.RI_PENDING_COUN}</TableCell>
                      {/* <TableCell  style={{ padding: '0.5em 1em' }} colSpan={1} align='center'>Total</TableCell> */}
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

export default PendanceReport;
