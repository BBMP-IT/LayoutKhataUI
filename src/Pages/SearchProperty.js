import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, CircularProgress, Tooltip, IconButton, 
  FormControl,  MenuItem, Select, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Radio
  ,FormControlLabel,RadioGroup, Card, Divider,Dialog, DialogContent, DialogActions,Checkbox
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { useNavigate,useLocation } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import ErrorPage from './ErrorPage';
import LabelWithAsterisk from '../components/LabelWithAsterisk'
import MaskingValue from '../components/MaskingValue';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GetAppIcon from '@mui/icons-material/GetApp';
import { styled } from '@mui/material/styles';
import ObjectionDocumentUploadPage from './ObjectionDocumentUploadPage';
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });
const SearchProperty = () => {
  const [formData, setFormData] = useState({
    buildingname: "",
    NearestLandmark: "",
    DoorPlotNo: "",
    areaorlocality: '',
    pincode: '',
    propertyphoto: '',
    loginId: '',
    ZoneName:"",
    ZoneNumber:"",
    wardNumber: "",
    wardName: "",
    IDCategory:"",
    IDDetails:"",
    MOBILEVERIFY:"",
    TypeOfUpload:"",
    MOBILENUMBER:"",
    MOBILENO:"",
    EMAIL:"",
    IsAAdharNumber:"Y",
    IsSASNumber:"N",
    ISHaveOLDEkhata:"N",
    SASNumber:"",
    IDExtension:"",
    IDDocument:"",
    OLDEkhataExtension:"",
    OldEkhataDocument:"",
    SEARCHNAME:"",
    MOBILEVERIFY1:"",
    EMAIL1:""
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [handleSASClicks, sethandleSASClicks] = useState(false);
  const [SAStableData, setSASTableData] = useState([]);
  const [tablesdata8, setTableData8] = useState([]);
  const [otpNumber, setOtpNumber] = useState(0)
  const [alertShown, setAlertShown] = useState(false);
  const [zoneData, setZoneData] = useState([]);
  const [WardData, setWardData] = useState([]);
  const [otpFieldsVisible, setOtpFieldsVisible] = useState(false);
  const [selectedIDFile, setSelectedIDFile] = useState(null);
  const [selectedOldEkhataFile, setSelectedOldEkhataFile] = useState(null);
  const [EkycResponseData,setEkycResponseData] = useState(null);
  const [otpButtonDisabled, setOtpButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(30); 
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [IsAAdhar,setIsAAdhar] = useState(false)
  const [IsSASNumber,setIsSASNumber] = useState(true)
  const [IsOldEkhata,setIsOldEkhata] = useState(true)
 
 
  const handleDownload = (base64Data, documentdescription) => {
    try {
    const filename = `${documentdescription}`;

    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    const mimeType = mimeTypes[".pdf"] || 'application/octet-stream';


    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });


    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();


    URL.revokeObjectURL(link.href);
  }
  catch(error){
    console.log(error)
  }
  };
 
 
  const handleSASDelete = () => {
    setSASTableData([])
  }
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      debugger
      const params = new URLSearchParams(location.search);
      const LoginData = params.get('LoginData');
      if (LoginData !== null && LoginData !== undefined) {
        let response4 = await axiosInstance.get("Auth/DecryptJson?encryptedXML="+LoginData)
        localStorage.setItem('SETLOGINID', JSON.stringify(response4.data.UserId));
        localStorage.setItem("LoginData", JSON.stringify(response4.data)); 
      }
        let response = await axiosInstance.get("BBMPCITZAPI/GetMasterZone")
        setZoneData(response.data.Table || [])
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('There was an error!', error);
      return <ErrorPage errorMessage={error} />;
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = async (e) => {
debugger
    const { name, value } = e.target;
    if(name === "IsAAdharNumber"){
        if(value === "N"){
            setIsAAdhar(true)
           
        }
        else {
          setIsAAdhar(false)
         
            
        }
      
    }
    if(name === "IsSASNumber"){
        if(value === "Y"){
            setIsSASNumber(false)
        }
        else {
          setSASTableData([])
            setIsSASNumber(true)
        }
      
    }
    if(name === "SASNumber"){
      if(formData.IsSASNumber === "N"){
        setSASTableData([])
      }
    }
    if(name === "ISHaveOLDEkhata"){
      if(value === "N"){
        setIsOldEkhata(true)
    }
    else {
        setIsOldEkhata(false)
    }
    }
    if(name === "ZoneName" && value !== ""){
        var response1 = await axiosInstance.get("BBMPCITZAPI/GetMasterWard?ZoneId=" + value)
        setWardData(response1.data.Table)
    }
    
    if (name === "pincode") {
      if (/^\d{0,6}$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
      return
    }
    debugger
    if (name === "MOBILENUMBER") {
      if (formData.MOBILENUMBER === value || value.trim() === "") {
        setOtpFieldsVisible(false);
        setAlertShown(false);
      } else {
       debugger
       let noOfMobile = tablesdata8.filter(row => row.MOBILENUMBER === value);
        if(noOfMobile.length === 0){
        setOtpFieldsVisible(true);
        formData.MOBILEVERIFY = "NOT VERIFIED";
        if (!alertShown) {
          alert(`${t("MobileValidation")}`);
          setAlertShown(true);
          formData.MOBILEVERIFY = "NOT VERIFIED";
        }
      }
      else {
        
       formData.MOBILEVERIFY = "VERIFIED";
       setOtpFieldsVisible(false);
      }
      }
      if (name === "MOBILENUMBER") {
        if (/^\d{0,10}$/.test(value)) {
          setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
          }));
        }
        return
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  React.useEffect(() => {
    return () => {
      clearInterval(countdownInterval);
    };
  }, [countdownInterval]);
  const handleGenerateOtp = async (index) => {
    try {
      const response = await axiosInstance.get("E-KYCAPI/SendOTP?OwnerMobileNo=" + formData.MOBILENUMBER);
      toast.success(response.data.otpResponseMessage);
      setOtpNumber(response.data.otp);
      setOtpButtonDisabled(true);
      setTimer(30);
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      setTimeout(() => {
        setOtpButtonDisabled(false);
        clearInterval(interval);
      }, 30000);
      setCountdownInterval(interval);
      setFormData({
        ...formData,
        MOBILEVERIFY: "NOT VERIFIED",
      });
    } catch (error) {
      console.log("failed to send otp" + error)
    }
  };

  const handleVerifyOtp = () => {
    if (formData.OwnerOTP === otpNumber.toString()) {
      toast.success(`${t("otpVerifiedSuccess")}`);
    //  formData.MOBILEVERIFY = "Verified";
      setOtpFieldsVisible(false);
      setFormData({
        ...formData,
        MOBILEVERIFY: "VERIFIED",
      });
    } else {
      toast.error(`${t("Invalid OTP Entered")}`);
    }
  };
  const handleSASClick = async () => {
debugger
    if (!formData.SASNumber || formData.SASNumber.length === 0) {
      toast.error(`${t("provideSasAppNumber")}`);
      return;
    }

    if (!handleSASClicks) {
      sethandleSASClicks(true);


      try {
        

        const response = await axiosInstance.get(
          `SearchAPI/SEL_OFFLINE_PTAX_BY_APPLICATION_SEARCH?ApplicationNo=${formData.SASNumber}`
        );

        const { Table = [] } = response.data;
        if (Table.length === 0) {
          toast.error(`${t("No SAS Applications Found")}`);
          return
        }
        setSASTableData(Table);
        toast.success(`${t("detailsFetchedSuccess")}`)
      } catch (error) {
        toast.error(`${t("errorFetchingSasDetails")}`);
      } finally {
        sethandleSASClicks(false);

      }
    } else {
      setLoading(false)
      sethandleSASClicks(false);
      setSASTableData([]);
    }
  };
  React.useEffect(() => {
    debugger
    const params = new URLSearchParams(location.search);
    const txnno = params.get('txnno');
try {
    if (txnno !== null && txnno !== undefined) {
     debugger
      console.log('E-KYC completed successfully with txnno:', txnno);
      setFormData({
        ...formData,
        IsAAdharNumber: "Y"
      });
      setIsAAdhar(false)
      setTimeout(() => {
        toast.success("E-KYC completed successfully");
      }, 500);
      let ownerType = JSON.parse(localStorage.getItem('OWNERTYPE'));
      const callEditEYCDate = async () => {
        var ownerNumber = await EditOwnerDetailsFromEKYCData(txnno, ownerType);
        if (ownerNumber !== "") {
          console.log(ownerNumber)
        }
      }
      callEditEYCDate();
    }

    fetchData();
  }
  catch(error){
    console.log(error)
  }  
  }, [location.search,fetchData]);

  const handleIDFileChange = (e) => {
    debugger
    const file = e.target.files[0];
    const maxSize = 200 * 1024;
    if (file && file.size > maxSize) {
      toast.error(`${t("File size exceeds 200 KB limit")}`);
      e.target.value = null;
      setSelectedIDFile(null);
      return;
    }
    if(file === undefined){
      return
    }
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg',].includes(fileExtension)) {
      toast.error(`${t("Please Select Only '.jpg','.jpeg' File")}`);
      e.target.value = null;
      setSelectedIDFile(null);
      return
    }
 //   setfileExtension(fileExtension);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedIDFile(file);
      };
      reader.readAsDataURL(file);
    }
  };
  

  const handleIDFileDelete = () => {
    setSelectedIDFile(null);
  //  setfileExtension('');
  }
 
  const handleOLDEkhataFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024;
    if (file && file.size > maxSize) {
      toast.error(`${t("File size exceeds 500 MB limit")}`);
      e.target.value = null;
      setSelectedOldEkhataFile(null);
      return;
    }
    if(file === undefined){
      return
    }
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    if (!['pdf'].includes(fileExtension)) {
      toast.error(`${t("Please Select Only '.pdf' File")}`);
      e.target.value = null;
      setSelectedOldEkhataFile(null);
      return
    }
 //   setfileExtension(fileExtension);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedOldEkhataFile(file);
      };
      reader.readAsDataURL(file);
    }
  };
  

  const handleOldEkhataFileDelete = () => {
    setSelectedOldEkhataFile(null);
  //  setfileExtension('');
  }




  const handleBack = () => {
   setPdfUrl('')
   window.location.href = "https://bbmpeaasthi.karnataka.gov.in";
  }
  const EditOwnerDetailsFromEKYCData = async (txno, ownerType) => {
    
    ownerType = "NEWOWNER"
    try {
     const ekycResponse =  await axiosInstance.get("Name_Match/GET_BBD_NCL_OWNER_BYEKYCTRANSACTION?transactionNumber=" + txno + "&OwnerType=" + ownerType)
   
       
       if(ownerType === "OLDOWNER")
        {
       
      formData.IDENTIFIERNAME = ekycResponse.data.identifierNameEng;

        setEkycResponseData(ekycResponse.data);
        setFormData((prevState) => ({
          ...prevState,
          IDENTIFIERNAME: ekycResponse.data.identifierNameEng,
        }));
       }
       if(ownerType === "NEWOWNER"){
        setEkycResponseData(ekycResponse.data);
     
     formData.IDENTIFIERNAME = ekycResponse.data.identifierNameEng;
     setFormData((prevState) => ({
      ...prevState,
      IDENTIFIERNAME: ekycResponse.data.identifierNameEng,
    }));
       }
       return ""
    } catch (error) {
      console.log("EditOwnerDetailsFromEKYCData", error)
    }

  };
  const AddEKYCOwner = async () => {
try {
    var response = await axiosInstance.post("E-KYCAPI/INS_NCL_SEARCH_MAIN")


    window.location.href = response.data; 
}
    catch(error)
    {
      console.log(error)
    }
  };
  
  const handleSave = async (Type) => {

    try {

      if (otpFieldsVisible) {
        toast.error(`${t("verifyOtp")}`)
        return
      }
   
     
      if (formData.MOBILENUMBER === null || formData.MOBILENUMBER === undefined) {
        toast.error(`${t("enterValidMobileNumber")}`)
        return
      }
      if (formData.MOBILENUMBER.length <= 0 || formData.MOBILENUMBER.length < 10 || formData.MOBILENUMBER.length > 11) {
        toast.error(`${t("enterValidMobileNumber")}`)
        return
      }
    

       if(Type === "EKYC"){
      
      const params = {
      
      
        MOBILENUMBER: formData.MOBILENUMBER || "0",
        MOBILEVERIFY: formData.MOBILEVERIFY !== "" ? formData.MOBILEVERIFY : "NOT VERIFIED",
        loginId: JSON.parse(localStorage.getItem('SETLOGINID')),
        EMAIL:formData.EMAIL || "No Email Provided",
      };

      const queryString = new URLSearchParams(params).toString();

     
      const response = await axiosInstance.post(`SearchAPI/INS_NCL_PROPERTY_SEARCH_TEMP_WITH_EKYCDATA?${queryString}`,EkycResponseData);
      console.log(response.data);
      
    debugger
      toast.success(`${t("ownerEditedSuccess")}`)
      setEkycResponseData(null);
      setTableData8(response.data.Table || [])
      localStorage.setItem('SETSEARCHREQID',response.data.Table[0].SEARCH_REQ_ID)
    }
    } catch (error) {
      toast.error(`${t("errorSavingData")}`, error)
    }

  };
  const getPropertyphoto = (selectedFile) => {
    return new Promise((resolve, reject) => {
      if (!selectedFile) {
        resolve(''); // Return an empty string if no file is selected
        return "";
      }
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = () => {
        const propertyphoto = reader.result.split(',')[1];
        resolve(propertyphoto);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  const handleValidation = async () =>{ //change this
    debugger
    let propertyDocumentID = "";
    let propertyOldEkhatha = "";
  debugger
    try {
      if(formData.IsAAdharNumber === "N"){
    if (selectedIDFile !== null) {
      propertyDocumentID = await getPropertyphoto(selectedIDFile);
    }
    if(propertyDocumentID === "" || propertyDocumentID === undefined ||propertyDocumentID === null)
      {
        
      toast.error("Please Upload the ID Document");
      return false
      
    }
    
        if(formData.DoorPlotNo === null|| formData.DoorPlotNo === undefined || formData.DoorPlotNo === ""){
          toast.error("Please Enter the Door No")
          return false
        }
        if(formData.areaorlocality === null || formData.areaorlocality === undefined || formData.areaorlocality === ""){
          toast.error("Please Enter the Area of Locality")
          return false
        }
        if(formData.pincode === null || formData.pincode === undefined || formData.pincode === ""){
          toast.error("Please Enter the Pincode")
          return false
        }else if(formData.pincode.length < 6){
          toast.error("The Pincode must be 6 Digits")
          return false
        }
      if(formData.SEARCHNAME === "" || formData.SEARCHNAME === undefined || formData.SEARCHNAME === null){
        toast.error("Please enter the Owner Name")
        return false
      }
      
      if(formData.IDCategory === 0 || formData.IDCategory === "" || formData.IDCategory === undefined || formData.IDCategory === null)
        {
        toast.error("Please Select the ID Type ");
        return false
      }
      if(formData.IDDetails === null || formData.IDDetails === undefined || formData.IDDetails === ""){
        toast.error("Please Enter the ID Number ");
        return false
      }
      if (formData.MOBILENUMBER === null || formData.MOBILENUMBER === undefined) {
        toast.error(`${t("enterValidMobileNumber")}`)
        return false
      }
      if (formData.MOBILENUMBER.length <= 0 || formData.MOBILENUMBER.length < 10 || formData.MOBILENUMBER.length > 11) {
        toast.error(`${t("enterValidMobileNumber")}`)
        return false
      }
      if(formData.MOBILEVERIFY !== "VERIFIED"){
        toast.error("Mobile Number not verified.")
        return false
      }
    }
    else if(formData.IsAAdharNumber === "Y"){
      if(tablesdata8.length ===0){
        toast.error("Please Verify with Atleast one EKYC Owner")
        return false
      }
    }
    if(formData.IsSASNumber === "N")
      {
if(formData.SASNumber === null || formData.SASNumber === undefined || formData.SASNumber === ""){
  toast.error("Please Enter 10 Digit SAS Property Tax ID ")
  return false
}
if(SAStableData.length === 0){
  toast.error("Please Fetch with the SAS Property Tax ID ")
  return false
}
      }
if(formData.IsSASNumber === "Y")
  {
    if(formData.ZoneName === "" || formData.ZoneName === null || formData.ZoneName === undefined){
      toast.error("Please Select your Zone Name")
      return false
    }
    if(formData.wardName === "" || formData.wardName === null || formData.wardName === undefined){
      toast.error("Please Select your Ward Name")
      return false
    }
  }
  
if (selectedOldEkhataFile !== null) {
  propertyOldEkhatha = await getPropertyphoto(selectedOldEkhataFile);
}
if(propertyOldEkhatha === "" || propertyOldEkhatha === undefined ||propertyOldEkhatha === null)
  {
    
  toast.error("Please Scan and Upload your manual BBMP Khata");
  return false
    
}

      return true
    }
      catch(error){
toast.error(error)
console.log(error)
      }
    }
    const fetchAcknowedgeMentPdf = async (searchReqId) => {
      try {
        debugger
       
        
          setLoading(true)
        const response = await axiosInstance.get(
          `Report/GetFinalSearchAcknowledgementReport?SearchReqID=${searchReqId}`,
          {
            responseType: 'blob',  
          }
        );
  
        
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
  
        setPdfUrl(pdfUrl);
        setLoading(false) 
        toast.success(`${t("Your application has been successfully submitted. Please download the acknowledgment for your records. Avoid resubmitting the application multiple times, as it has already been received.")}`)
      // }
      // else {
      //   toast.error(response1.data)
      // }
      } catch (error) {
        console.error("Error fetching PDF: ", error);
        setLoading(false)
      }
    };

  
  const handleFinalSubmit = async (e) => { //change this
    
    if (e.key === 'Enter') {
      e.preventDefault();
    }
       debugger
      let IsValidation = await handleValidation() 
      if(IsValidation){ 
      setLoading(true);
      debugger
      let propertyDocumentID = await getPropertyphoto(selectedIDFile);
      let propertyOldEkhatha = await getPropertyphoto(selectedOldEkhataFile);
      let searchreqId = 0;
      searchreqId = JSON.parse(localStorage.getItem("SETSEARCHREQID"))
      if (searchreqId === "" || searchreqId === undefined || searchreqId === null){
          searchreqId = 0
      }
      else{
        searchreqId = JSON.parse(localStorage.getItem("SETSEARCHREQID"))
      }
      debugger
      if(formData.IsAAdharNumber === "Y"){
        formData.SEARCHNAME = tablesdata8[0].SEARCHNAME_EN
      }
      
      
      const data = {
        
  search_Req_Id: searchreqId,
  isHaveAAdhaarNumber: formData.IsAAdharNumber,
  isHaveSASNumber: formData.IsSASNumber,
  doorNo: formData.DoorPlotNo || null,
  buildingName: formData.buildingname || null,
  areaOrLocality: formData.areaorlocality || null,
  pincode: formData.pincode || null,
  idDocument: propertyDocumentID || null,
  idCardType: formData.IDCategory || null,
  idCardNumber: formData.IDDetails || null,
  mobileNumber: formData.MOBILENUMBER || null,
  mobiverify: formData.MOBILEVERIFY || null,
  email: formData.EMAIL1 || null,
  zoneId: formData.IsSASNumber === "N" ? SAStableData[0].ZONEID || null : formData.ZoneName || null,
  wardId:   formData.IsSASNumber === "N" ? SAStableData[0].WARDID || null  : formData.wardName  || null,
  searchName: formData.SEARCHNAME || null,
  sasApplicationNumber: formData.SASNumber || null,
  loginId: JSON.parse(localStorage.getItem('SETLOGINID')).toString(),
  isHaveOldEkhata:formData.ISHaveOLDEkhata,
  oldEkhataDocument:propertyOldEkhatha || null,
  //loginId:"crc"
      };
      
      try {
      let response3 =  await axiosInstance.post('SearchAPI/INS_NCL_PROPERTY_SEARCH_FINAL_SUBMIT', data
        )
        if(response3.data.Table[0].STATUS === "DUPLICATE ENTRY"){
          setTimeout(() => {
            toast.error(`An Application has Already Been Submitted for this Mobile Number.Please Wait until Search For Current Property is Completed.You will Recieve an Acknoweledgement to Your Given Mobile Number Once Completed.`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }, 100)
          setLoading(false);
          return
        }
        setTimeout(() => {
        toast.success(`${t("detailsSavedSuccess")}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }, 100)
   
 setLoading(false);

    await fetchAcknowedgeMentPdf(response3.data.Table[0].SEARCHREQID);
    setLoading(false);
     
      } catch (error) {
        await toast.error(`${t("errorSavingData")}`, error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setLoading(false);
        setTimeout(() => {
          navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
        }, 500);
      }
    } else {
      setLoading(false);
    }
    setLoading(false);
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
  variant="body1"
  sx={{
    color: '#1565c0',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    fontSize: '2rem',
    textAlign: 'center', // Correct alignment property
  }}
>
Search Property Request
</Typography>

<br></br>
       
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
          link.download = 'SEARCH REQUEST ACKNOWLEDGMENT.pdf'; // Set your desired filename here
          link.click();
        }}
        color="primary"
      >
        Download PDF
      </Button>

      <Button onClick={() => handleBack()} color="primary">
        Close PDF and Finish
      </Button>
    </DialogActions>
  </Dialog>
)}

      
<Grid item xs={12} sm={6}>
  <Box display="flex" alignItems="center">
    <Typography variant="body1" sx={{ ml: 1, mr: 2 }}>
      AADHAR Available ?
    </Typography>
    <FormControl component="fieldset" sx={{ ml: 1, mb: 0.5 }}>
      <RadioGroup
        row
        name="IsAAdharNumber"
        value={formData.IsAAdharNumber}
        onChange={handleChange}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <FormControlLabel value="Y" control={<Radio disabled={!isEditable} />} label={t("Yes")} sx={{ mr: 4 }} />
        <FormControlLabel value="N" control={<Radio disabled={!isEditable} />} label={t("No")} />
      </RadioGroup>
    </FormControl>
    {tablesdata8.length === 0 && IsAAdhar === false&& (
      <Button
        variant="contained"
        color="primary"
        onClick={() => AddEKYCOwner()}
        sx={{ ml: 2 }}
      >
        {t("VerifyE-KYC")}
      </Button>
    )}
  </Box>
</Grid>


             
{IsAAdhar === false && 
<>
      <br></br>
     
          

      <Grid container >
      {EkycResponseData !== null &&
      <>
      <Grid item xs={12} sm={2}>
                    <div style={{ marginLeft: '20px', position: 'relative', textAlign: 'center' }}>
                      <img
                        src={`data:image/png;base64,${EkycResponseData.photoBytes}`}
                        alt="No Images Found"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '8px',
                        }}
                      />
                    </div>
                  </Grid>
                  <Grid container spacing={2}>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('OwnerName')}
                        name="OwnerName"
                        value={EkycResponseData.ownerNameEng || ''}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="filled"
                      />
                    </Grid>
                   
                    <Grid item xs={12} sm={6}>
                      </Grid>
                   
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {t("Gender")}
                      </Typography>
                      <FormControl component="fieldset" sx={{ marginBottom: 3 }}>
                        <RadioGroup row name="Gender" value={EkycResponseData.gender} onChange={handleChange}>
                          <FormControlLabel value="M" control={<Radio disabled={true} />} label={t("Male")} />
                          <FormControlLabel value="F" control={<Radio disabled={true} />} label={t("Female")} />
                          <FormControlLabel value="O" control={<Radio disabled={true} />} label={t("Other")} />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('DateOfBirth')}
                        name="DateOfBirth"
                        value={EkycResponseData.dateOfBirth || ''}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('Address')}
                        name="Address"
                        value={EkycResponseData.addressEng || ''}
                        multiline
                        rows={2}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="filled"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('OwnerMaskedAadhar')}
                        name="OwnerAadhar"
                        value={EkycResponseData.maskedAadhaar || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                    
                          <TextField
                            fullWidth
                            label={< LabelWithAsterisk text={t("MobileNumber")} />}
                            name="MOBILENUMBER"
                            value={formData.MOBILENUMBER || ''}
                            onChange={handleChange}
                            variant="outlined"
                            InputProps={{
                           
                              style: { backgroundColor:  "#ffff" },
                            }}
                          />
  {otpFieldsVisible && (
                            <Grid>
                              <br></br>
                              {!otpButtonDisabled && (
                                <>
                                  <Button variant="contained" color="primary" onClick={() => handleGenerateOtp()}>
                                    {t("GenerateOTP")}
                                  </Button>
                                </>
                              )}
                              {otpButtonDisabled && (
                                <Typography >
                                  Resend OTP in {timer} seconds
                                </Typography>

                              )}
                              <br></br>
                              <br></br>
                              
                              <TextField
                                fullWidth
                                label={t('Enter OTP')}
                                name="OwnerOTP"
                                value={formData.OwnerOTP}
                                onChange={handleChange}
                                variant="filled"
                                InputProps={{
                           
                                  style: { backgroundColor:  "#ffff" },
                                }}
                              />
<br></br><br></br>
                              <Button variant="contained" color="primary" onClick={() => handleVerifyOtp()}>
                                Verify OTP
                              </Button>
                              <br></br>
                            </Grid>
                          )}
                         
                              </Grid>
                  
                    <Grid item xs={12} sm={6}>
                    
                        <Typography sx={{
            fontWeight: 'bold',
            fontFamily: "sans-serif",
            marginTop: 2,
            color: '#',
            fontSize: {
              xs: '1rem',
              sm: '1rem',
              md: '1.2rem',
            }
          }}>{t('MobileVerification')} : {formData.MOBILEVERIFY}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={t('Email')}
                          name="EMAIL"
                          value={formData.EMAIL}
                          onChange={handleChange}
                          InputProps={{
                           
                            style: { backgroundColor:  "#ffff" },
                          }}
                          variant="outlined"
                        />
                  </Grid>
                  </Grid>
                  
                  <br></br>
                  <br></br>
                  <br></br>
                  <Grid item xs={15} sm={12}>
                    <Box display="flex" justifyContent="center" gap={10}>
                        <Button variant="contained" color="primary" onClick={() => handleSave("EKYC")}>
                          {t("Save")}
                        </Button>
                     
                    </Box>
                  </Grid>
               
              
                  </>
                  
      }
        </Grid>
        {tablesdata8.length > 0 && 
        <>
        <Typography>E-Kyc Verifed Details</Typography>
<TableContainer component={Paper} sx={{ mt: 4 }}>
  <Table>
    <TableHead>
      <TableRow>
        {/* <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("Slno.")}</TableCell> */}
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("OwnerName")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("Address")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("MobileNumber")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("OwnerPhoto")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   EMAIL</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}> {t('MobileVerification')}</TableCell>
        {/* <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("E-KYCStatus")}</TableCell> */}
        {/* <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("NAMEMATCHSTATUS")}</TableCell> */}
      </TableRow>
    </TableHead>
    <TableBody>
      {tablesdata8.length === 0 ? (
        <TableRow>
          <TableCell colSpan={12} align="center">
            {t("Nodataavailable")}
          </TableCell>
        </TableRow>
      ) : (
        tablesdata8.map((row,index) => {

          return (
            <TableRow key={index}>
              {/* <TableCell>{row.OWNERNUMBER}</TableCell> */}
              <TableCell>{row.SEARCHNAME_EN}</TableCell>
              <TableCell>{row.SEARCHADDRESS_EN}</TableCell>
              <TableCell>{MaskingValue({value:row.MOBILENUMBER,maskingLength:4}) || 'N/A'}</TableCell>
              <TableCell> <img
                src={`data:image/png;base64,${row.OWNERPHOTO}`}
                alt="No Images Found"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: '8px',
                }}
              /></TableCell>
              <TableCell>{row.EMAIL === undefined|| ""}</TableCell>
              <TableCell>{row.MOBILEVERIFY}</TableCell>
            
            </TableRow>
          );
        })
      )}
    </TableBody>
  </Table>
</TableContainer>
</>
        }
</>

}
<br></br>
{/* <Grid item xs={12} sm={6}>
  <Box display="flex" alignItems="center">
    <Typography variant="body1" sx={{ ml: 1, mr: 2 }}>
      Do you have Old khata ?
    </Typography>
    <FormControl component="fieldset" sx={{ml: 1, mb: 0.5 }}>
      <RadioGroup
        row
        name="ISHaveOLDEkhata"
        value={formData.ISHaveOLDEkhata}
        onChange={handleChange}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <FormControlLabel value="Y" control={<Radio disabled={!isEditable} />} label={t("Yes")} sx={{ mr: 4 }} />
        <FormControlLabel value="N" control={<Radio disabled={!isEditable} />} label={t("No")} />
      </RadioGroup>
    </FormControl>
  </Box>
</Grid>    */}

{IsAAdhar === true &&
<>
<Grid container spacing={2} >
  {/* Door No */}
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={1}>
    <Grid item xs={12} sm={3.2} style={{ textAlign: "left" }} >
      <span style={{ fontWeight: "bold" }}>{<LabelWithAsterisk text={t('Any one Owner Name of the Property')} />}</span>
    </Grid>
    <Grid item xs={12} sm={5.9}>
    <TextField
                    
                    fullWidth 
                    label={<LabelWithAsterisk text={"Enter Owner Name"} />}
                    name="SEARCHNAME"
                    value={formData.SEARCHNAME}
                    onChange={handleChange}
                
                    variant={isEditable ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditable,
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
                      
                    }}
                  />
    </Grid>
  </Grid>
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={2}>
    <Grid item xs={12} sm={3} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>{<LabelWithAsterisk text={t('Door No')} />}</span>
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={<LabelWithAsterisk text={t('doorPlotNo')} />}
        name="DoorPlotNo"
        value={formData.DoorPlotNo}
        onChange={handleChange}
        variant={isEditable ? "outlined" : "filled"}
        InputProps={{
          readOnly: !isEditable,
          style: { backgroundColor: !isEditable ? '' : "#ffff" },
        }}
      />
    </Grid>
  </Grid>

  {/* Building/Land Name */}
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={2}>
    <Grid item xs={12} sm={3} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>{t("buildingLandName")}</span>
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={t("buildingLandName")}
        name="buildingname"
        value={formData.buildingname}
        onChange={handleChange}
        variant={isEditable ? "outlined" : "filled"}
        InputProps={{
          readOnly: !isEditable,
          style: { backgroundColor: !isEditable ? '' : "#ffff" },
        }}
      />
    </Grid>
  </Grid>

  {/* Area/Locality */}
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={2}>
    <Grid item xs={12} sm={3} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>{<LabelWithAsterisk text={t('areaLocality')} />}</span>
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={<LabelWithAsterisk text={t('areaLocality')} />}
        name="areaorlocality"
        value={formData.areaorlocality}
        onChange={handleChange}
        variant={isEditable ? "outlined" : "filled"}
        InputProps={{
          readOnly: !isEditable,
          style: { backgroundColor: !isEditable ? '' : "#ffff" },
        }}
      />
    </Grid>
  </Grid>

  {/* Pincode */}
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={2}>
    <Grid item xs={12} sm={3} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>{<LabelWithAsterisk text={t('pincode')} />}</span>
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={<LabelWithAsterisk text={t('pincode')} />}
        name="pincode"
        type="number"
        value={formData.pincode}
        onChange={handleChange}
        variant={isEditable ? "outlined" : "filled"}
        InputProps={{
          readOnly: !isEditable,
          style: { backgroundColor: !isEditable ? '' : "#ffff" },
        }}
      />
    </Grid>
  </Grid>
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={2}>
    <Grid item xs={12} sm={3} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>{<LabelWithAsterisk text={t('Select ID card')} />}</span>
    </Grid>
    <Grid item xs={12} sm={6}>
    
                  <FormControl
                    fullWidth

                   // error={touched.streetid && !!errors.streetid}
                    sx={{ marginBottom: 3 }}
                 //   className={touched.streetid && !!errors.streetid ? 'shake' : ''}
                  >
                    
                    <Select
                      name="IDCategory"
                      value={formData.IDCategory}
                      onChange={handleChange}
                      inputProps={{ readOnly: !isEditable }}
                    //  onBlur={handleBlur}
                      sx={{ backgroundColor: !isEditable ? '' : "#ffff" }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                    
                       <MenuItem value="1">Voter ID</MenuItem>
                       <MenuItem value="2">Passport Number</MenuItem>
                       <MenuItem value="3">Driving License</MenuItem>
                       <MenuItem value="4">PAN Number</MenuItem>
                      
                    </Select>
                  </FormControl>
    </Grid>
  </Grid>
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={2}>
    <Grid item xs={12} sm={3} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>{<LabelWithAsterisk text={t('Id Card Number')} />}</span>
    </Grid>
    <Grid item xs={12} sm={6}>
      
    <TextField
    fullWidth
                    label={<LabelWithAsterisk text={"Enter ID Card Number"} />}
                    name="IDDetails"
                    value={formData.IDDetails}
                    onChange={handleChange}
                    
                    variant={isEditable ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditable,
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
                      
                    }}
                  />
    </Grid>
  </Grid>
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={2}>
    <Grid item xs={12} sm={3} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>{<LabelWithAsterisk text={t('Scan and Upload Relavant ID')} />}</span>
    </Grid>
    <Grid item xs={12} sm={6}>
    <Box display="flex" alignItems="center" flexDirection="column" textAlign="center" mb={2}>
                
    
                  
    
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 1, mb: 1, px: 1, py: 1 }}
                  >
                    {t("Uploadfile")}
                    <VisuallyHiddenInput type="file" accept=".jpg,.jpeg" onChange={handleIDFileChange} />
                  </Button>
    
                  {selectedIDFile && (
                    <Box display="flex" alignItems="center" justifyContent="center" mt={2} sx={{ color: 'text.secondary' }}>
                      <Typography variant="h6">{selectedIDFile.name}</Typography>
                      <Button color="error" onClick={handleIDFileDelete} sx={{ ml: 2 }}>
                        {t("Delete")}
                      </Button>
                    </Box>
                  )}
    
                  <Typography variant="body2" sx={{ mt: 1, color: '#df1414',fontSize:'1rem' }}>
                  Maximum File Size should not exceed 200 KB
                  </Typography>
                </Box>
    
                {formData.IDExtension && (
                  <Box display="flex" alignItems="center" justifyContent="center" mt={2} sx={{ p: 1, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                    <Typography variant="h6" color="textSecondary" sx={{ mr: 1 }}>
                      {t("Uploaded Document:")}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mr: 2 }}>
                      {formData.IDExtension}
                    </Typography>
                    <IconButton onClick={() => handleDownload(formData.IDDocument, formData.IDExtension)}>
                      <GetAppIcon color="primary" />
                    </IconButton>
                  </Box>
                )}
   
    </Grid>
  </Grid>
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={2}>
    <Grid item xs={12} sm={3} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>{<LabelWithAsterisk text={t('Mobile Number')} />}</span>
    </Grid>
    <Grid item xs={12} sm={6}>
    <TextField
                      fullWidth
                      label={< LabelWithAsterisk text={t("Enter Mobile Number")} />}
                      name="MOBILENUMBER"
                      value={formData.MOBILENUMBER || ''}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                     
                        style: { backgroundColor:  "#ffff" },
                      }}
                    />
{otpFieldsVisible && (
                      <Grid>
                        <br></br>
                        {!otpButtonDisabled && (
                          <>
                            <Button variant="contained" color="primary" onClick={() => handleGenerateOtp()}>
                              {t("GenerateOTP")}
                            </Button>
                          </>
                        )}
                        {otpButtonDisabled && (
                          <Typography >
                            Resend OTP in {timer} seconds
                          </Typography>

                        )}
                        <br></br>
                        <br></br>
                        
                        <TextField
                          fullWidth
                          label={t('Enter OTP')}
                          name="OwnerOTP"
                          value={formData.OwnerOTP}
                          onChange={handleChange}
                          variant="filled"
                          InputProps={{
                     
                            style: { backgroundColor:  "#ffff" },
                          }}
                        />
<br></br><br></br>
                        <Button variant="contained" color="primary" onClick={() => handleVerifyOtp()}>
                          Verify OTP
                        </Button>
                        <br></br>
                      </Grid>
                    )}
                   
                     <Box display="flex" justifyContent="space-between" alignItems="center">
    
 
                    
    <Typography sx={{
fontWeight: 'bold',
fontFamily: "sans-serif",
marginTop: 2,
color: '#',
fontSize: {
xs: '1rem',
sm: '1rem',
md: '1.2rem',
}
}}>{t('MobileVerification')} : {formData.MOBILEVERIFY}</Typography>

</Box>
</Grid>
    
  </Grid>
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={2}>
    <Grid item xs={12} sm={3} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>Email</span>
    </Grid>
    <Grid item xs={12} sm={6}>
    <TextField
                fullWidth

                label={t("Enter Email")}
              
                name="EMAIL1"
                value={formData.EMAIL1}
                onChange={handleChange}
                InputProps={{
                  style: { backgroundColor: "#ffff" },
                
                }}
              />
    </Grid>
  </Grid>
</Grid>
</>
}
<br></br>
{IsOldEkhata === true &&
  <Grid container item xs={12} sm={12} alignItems="center" justifyContent="center" gap={2}>
    <Grid item xs={12} sm={4} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>{<LabelWithAsterisk text={t('Scan and Upload your manual BBMP Khata')} />}</span>
    </Grid>
    <Grid item xs={12} sm={6}>
    <Box display="flex" alignItems="center" flexDirection="column" textAlign="center" mb={2}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 1, mb: 1, px: 1, py: 1 }}
                  >
                    {t("Uploadfile")}
                    <VisuallyHiddenInput type="file" accept=".pdf" onChange={handleOLDEkhataFileChange} />
                  </Button>
    
                  {selectedOldEkhataFile && (
                    <Box display="flex" alignItems="center" justifyContent="center" mt={2} sx={{ color: 'text.secondary' }}>
                      <Typography variant="h6">{selectedOldEkhataFile.name}</Typography>
                      <Button color="error" onClick={handleOldEkhataFileDelete} sx={{ ml: 2 }}>
                        {t("Delete")}
                      </Button>
                    </Box>
                  )}
    
                  <Typography variant="body2" sx={{ mt: 1, color: '#df1414',fontSize:'1rem' }}>
                  Maximum File Size should not exceed 5 MB
                  </Typography>
                </Box>
                
                </Grid></Grid>
}
<br></br>
{IsOldEkhata  === true&& 
  <>
  <Typography  variant="body2" 
        sx={{ color: 'red', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.1rem' }}>Note :- If you do not have BBMP Khata ,then wait and apply online at BBMP New Khata system which will be rolled out soon.</Typography>
  </>
}
<br></br>


<br></br>
{IsSASNumber  === true&& 
<>
<Grid container spacing={6} alignItems="center">
<Grid item xs={12} sm={4} style={{ textAlign: "right" }}>
      <span style={{ fontWeight: "bold" }}>< LabelWithAsterisk text={t("Enter 10 Digit SAS Property Tax ID ")} /></span>
    </Grid>
            <Grid item xs={5}>
              <TextField
                fullWidth

                label={< LabelWithAsterisk text={t("Enter 10 Digit SAS Property Tax ID ")} />}
              
                name="SASNumber"
                value={formData.SASNumber}
                onChange={handleChange}
                InputProps={{
                  style: { backgroundColor: "#ffff" },
                  endAdornment: (
                    <Tooltip title={t("propertyEIDInfo")}>
                      <IconButton color="primary">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={3}>
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Button
      variant="contained"
      color="success"
      onClick={handleSASClick}
      style={{ height: '100%' }}
    >
     {t("Fetch")}
    </Button>
  
  </Box>
</Grid>
</Grid>




{SAStableData.length > 0 && 
<TableContainer component={Paper} sx={{ mt: 3 ,alignItems:"center"}}>
<Table>
<TableHead>
  <TableRow>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("ApplicationNumber")}</TableCell>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>PID</TableCell>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("KHATHASURVEYNO")}</TableCell>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("OwnerName")}</TableCell>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("PropertyAddress")}</TableCell>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("PropertyNature")}</TableCell>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("SiteArea")}</TableCell>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("BuiltUpArea")}</TableCell>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Zone Number")}</TableCell>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Ward Number")}</TableCell>
    <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}></TableCell>
  </TableRow>
</TableHead>
<TableBody>
  {SAStableData.length === 0 ? (
    <TableRow>
      <TableCell colSpan={12} align="center">
        {t("Nodataavailable")}
      </TableCell>
    </TableRow>
  ) : (
    SAStableData.map((row,index) => (
      <TableRow key={index}>
        <TableCell>{row.APPLICATIONNUMBER}</TableCell>
        <TableCell>{row.PID}</TableCell>
        <TableCell>{row.KHATHA_SURVEY_NO}</TableCell>
        <TableCell>{row.OWNERNAME}</TableCell>
        <TableCell>{row.PROPERTYADDRESS}</TableCell>
        <TableCell>{row.NATUREOFPROPERTY}</TableCell>
        <TableCell>{row.SITEAREA}</TableCell>
        <TableCell>{row.BUILTUPAREA}</TableCell>
        <TableCell>{row.ZONENUMBER}</TableCell>
        <TableCell>{row.WARDNUMBER}</TableCell>
        <TableCell><Button variant='outlined' color='error' onClick={handleSASDelete} disabled={!isEditable}>Delete</Button></TableCell>
      </TableRow>
    ))
  )}
</TableBody>
</Table>
</TableContainer>
}
</>
}
<Grid item xs={12} sm={6}>
  <Box display="flex" alignItems="center">
    <Typography variant="body1" sx={{ ml: 1, mr: 2 }}>
      Do not have Property Tax ID ?
    </Typography>
    <FormControl component="fieldset" sx={{ ml: 1, mb: 0.5 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.IsSASNumber === "Y"}
            onChange={(event) =>
              handleChange({
                target: {
                  name: "IsSASNumber",
                  value: event.target.checked ? "Y" : "N",
                },
              })
            }
            disabled={!isEditable}
          />
        }
        label={t("Yes")}
      />
    </FormControl>
  </Box>
</Grid>

{IsSASNumber  === false&& 
  <>
  <Typography  variant="body2" 
        sx={{ color: 'red', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '1.1rem' }}>Note :- If you do not have Property Tax ID the search will be delayed.</Typography>
  </>
  
}
<br></br>
{IsSASNumber  === false&& 
<Grid 
  container 
  spacing={5} 
  alignItems="center" 
  justifyContent="center"
>
  <Grid item xs={12} sm={5} md={4}>
    <FormControl fullWidth sx={{ marginBottom: 3 }}>
      <InputLabel>{t("Select Zone Name")}</InputLabel>
      <Select
        name="ZoneName"
        value={formData.ZoneName}
        onChange={handleChange}
        sx={{ backgroundColor: "#ffff" }}
      >
        <MenuItem value="">--Select--</MenuItem>
        {zoneData.map((item) => (
          <MenuItem key={item.ZONEID} value={item.ZONEID}>
            {item.ZONENAME}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>
  <Grid item xs={12} sm={3} md={4}>
    <FormControl fullWidth sx={{ marginBottom: 3 }}>
      <InputLabel>{t("Select Ward Name")}</InputLabel>
      <Select
        name="wardName"
        value={formData.wardName}
        onChange={handleChange}
        sx={{ backgroundColor: "#ffff" }}
      >
        <MenuItem value="">--Select--</MenuItem>
        {WardData.map((item) => (
          <MenuItem key={item.WARDID} value={item.WARDID}>
            {item.WARDNAME}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>
</Grid>
}
<br></br>

<br></br>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" gap={2}>
                  <Button variant="contained" color="primary" onClick={handleBack}>
                    {t("Previous")}
                  </Button>
                 
                  <Button variant="contained" color="success" onClick={handleFinalSubmit} >
                  Submit
                  </Button>
                </Box>
              </Grid>
      </Box>
    </Container>
  );
};


export default SearchProperty;
