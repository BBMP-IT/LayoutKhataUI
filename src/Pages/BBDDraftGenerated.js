import React, { useState, useEffect } from 'react';
import {
  Button, Box, Container, Typography, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Link
} from '@mui/material';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import ErrorPage from './ErrorPage';
import '../components/Shake.css';

const BBDDraftGenerated = () => {
  

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [Data, setData] = useState([]);
  const location = useLocation();
  const [LoginDetails,setLoginDetails] = useState('')
 
  const { t } = useTranslation();
  const fetchData = async () => {
    try {
      setLoading(true)
    var response = await axiosInstance.get("BBMPCITZAPI/GET_PROPERTY_BBD_Draft_Generated_Wards")
    debugger
    const uniqueData = response.data.Table.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.WARDID === value.WARDID )
      );
    setData(uniqueData || [])
    debugger
    setLoading(false)
    const params = new URLSearchParams(location.search);
      const LoginData = params.get('LoginData');
      if (LoginData !== null && LoginData !== undefined) {
        let response4 = await axiosInstance.get("Auth/DecryptJson?encryptedXML="+LoginData)
        console.log(response4.data)
        setLoginDetails(response4.data)
        localStorage.setItem("LoginData", JSON.stringify(response4.data)); 
      }
    }
    catch(error){
      return <ErrorPage errorMessage={error} />;
    }
  };

  useEffect(() => {
    localStorage.setItem("userProgress", 1);
    fetchData();
  }, []);
const handleWardGooglemap = (row) => {
  localStorage.setItem('DraftZoneId', JSON.stringify(row.ZONEID));
  navigate("/GoogleMapsWardCoordinates")
}

const handleSearchNavigation = async () => {
  debugger
 
           try{
            let now = new Date();
let txtDate = now.getFullYear().toString() +
              (now.getMonth() + 1).toString().padStart(2, '0') +
              now.getDate().toString().padStart(2, '0') + 'T' +
              now.getHours().toString().padStart(2, '0') + ':' +
              now.getMinutes().toString().padStart(2, '0') + ':' +
              now.getSeconds().toString().padStart(2, '0');
           if(LoginDetails !== null && LoginDetails !== undefined && LoginDetails !== ""){
            const data = {
              userId: LoginDetails.UserId,
              propertyCode:"123",
              propertyEPID:  "123" ,
              sessionValues: "",
              execTime: txtDate,
              isLogin: true
              }
              
              const response5 = await axiosInstance.post("Auth/EncryptJsons",data)
              let re = response5.data;
     
              
     localStorage.setItem('SETLOGINID', LoginDetails.UserId);
            window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_core/SearchProperty?BookDraft="+re;
         //  window.location.href = "https://bbmpeaasthi.karnataka.gov.in/objection_form_test/SearchProperty?BookDraft="+re;
          }
          else {
            alert("Please Log-In To Apply For Property Searching. Click On The Do not find my Property Draft eKhata After Logging In.")
            const data = {
              userId: "",
              propertyCode: "123",
              propertyEPID:  "123",
              sessionValues: "",
              execTime: txtDate,
              isLogin: false
              }
             
      
      console.log(txtDate); // Outputs: "20241018T13:44:09" (for example)
      
            // let json = "{\"UserId\":\"" + Convert.ToString(Session["LoginId"]) + "\",\"PropertyCode\":\"\",\"PropertyEPID\":\"\",\"SessionValues\":[],\"ExecTime\":\"" + txtDate + "\"}";
              
              const response = await axiosInstance.post("Auth/EncryptJsons",data)
           window.location.href = "https://bbmpeaasthi.karnataka.gov.in/CitzLogin.aspx?BookDraft="+response.data;
        //   window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_test2/CitzLogin.aspx?BookDraft="+response.data;
          }
        }
        catch(error){
console.log(error)
        }
                  
}
const handleBack =() => {
  localStorage.clear();
  window.location.href = "https://bbmpeaasthi.karnataka.gov.in";
}
  const handleNavigation = async (row) => {
    //  navigate('/AddressDetails')
debugger

try {
      localStorage.setItem('DraftZoneId', JSON.stringify(row.ZONEID));
      localStorage.setItem('DraftWardId', JSON.stringify(row.WARDID));
      localStorage.setItem("userProgress", 2);
      localStorage.setItem("FromGoogleMaps","2")
        navigate('/PropertyList')
      } catch (error) {

        navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
      }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <GradientCircularProgress />
      </Box>
    );
  }

  return (
    
    <Container maxWidth="lg">
       
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 1, borderRadius: 2, mt: 2 }}>
      <ToastContainer />
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontFamily: "sans-serif",
            marginBottom: 3,
            color: '#1565c0',
            fontSize: {
              xs: '.2rem',
              sm: '2rem',
              md: '2.5rem',
            }
          }}
        >
        
        Welcome to Faceless, Contactless, Online enmass eKhata Issuance System
        </Typography>
        <Box display="flex" justifyContent="right" gap={1} mt={0.1} width="100%">
      <Button variant="contained" color="primary" onClick={handleBack}>
      {t("Previous")}
            </Button>
            </Box>
        <Box sx={{ backgroundColor: '#ffffff', padding: 1, borderRadius: 2, mt: 1 }}>
        <Typography
  variant="body1"
  sx={{
    color: '#1565c0',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    fontSize: '1rem',
    textAlign: 'center', // Correct alignment property
  }}
>
  {t("eKhata Roll-Out Status and Information")}
</Typography>

        <Typography 
        variant="body1" 
        sx={{ color: 'red', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '0.9rem' }}
      >

NOTE 1: IF YOU DON'T FIND YOUR PROPERTY IN THE WARD LIST. PLEASE CLICK ON <Link  sx={{ color: 'red', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '0.9rem',cursor: 'pointer' }} onClick={() =>handleSearchNavigation()}>"DO NOT FIND MY PROPERTY DRAFT EKHATA"</Link> OPTION AND SUBMIT THE DETAILS.BBMP WILL REVERT WITH SOLUTION/REPLY.
</Typography>
<Typography 
        variant="body1" 
        sx={{ color: 'red', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '0.9rem' }}
      >NOTE 2: You can see your Ward Number & Name in Property Tax Receipt for your property.</Typography>
      </Box>
        <TableContainer component={Paper} sx={{ mt: 4, maxHeight: 900  }}>
          
  <Table stickyHeader aria-label="sticky table">
    <TableHead>
      <TableRow>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("ZONE")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("ARO or Subdivision")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Ward Name and Number Where Draft eKhata rolled out")}</TableCell>
        {/* <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Status of Draft eKhata rolled out in ward")}</TableCell> */}
      
      </TableRow>
    </TableHead>
    <TableBody>
      {Data.length === 0 ? (
        <TableRow>
          <TableCell colSpan={12} align="center">
            {t("Nodataavailable")}
          </TableCell>
        </TableRow>
      ) : (
        Data
       
        .map((row, index, arr) => {
         // const showZoneName = index === 0 || row.ZONEID !== arr[index - 1].ZONEID;
        //  const showAROName = index === 0 || row.AROID !== arr[index - 1].AROID;

          return (
            <TableRow key={index}>
             
              <TableCell>{ row.ZONENAME }</TableCell>
             
              <TableCell>{ row.ARONAME}</TableCell>
              <TableCell>
                {row.WARDNAME ? (
                  <Button color="primary" onClick={() => handleNavigation(row)}>
                    {row.WARDNAME}
                  </Button>
                ) : ""}
              </TableCell>
              {/* <TableCell>{row.STATUS}</TableCell> */}
             
            </TableRow>
          );
        })
      )}
    </TableBody>
  </Table>
</TableContainer>
        
      </Box>
     
    </Container>
  );
};

export default BBDDraftGenerated;
