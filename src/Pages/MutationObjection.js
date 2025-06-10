import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, CircularProgress, IconButton, 
  FormControl,  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Radio
  ,FormControlLabel,RadioGroup, Card, Divider,Dialog, DialogContent, DialogActions
} from '@mui/material';
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
const MutationObjection = () => {
  const [formData, setFormData] = useState({
    propertyCode: '',
    propertyNumber: "",
    propertyEID: "",
    loginId: '',
    wardNumber: "",
    wardName: "",
    ReasonDetails:"",
    MOBILEVERIFY:"",
    MOBILENUMBER:"",
    EMAIL:"",
    NameExtension:"",
    NameDocument:""
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [tablesdata8, setTableData8] = useState([]);
  const [otpNumber, setOtpNumber] = useState(0)
  const [alertShown, setAlertShown] = useState(false);
 
  const [otpFieldsVisible, setOtpFieldsVisible] = useState(false);
  const [selectedNameFile, setSelectedNameFile] = useState(null);
  const [selectedReasonFile, setSelectedReasonFile] = useState(null);
  // const [fileExtension, setfileExtension] = useState([]);
  const [EkycResponseData,setEkycResponseData] = useState(null);
  const [otpButtonDisabled, setOtpButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(30); 
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  
 
 
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
  
 
 
  

  const handleChange = (e) => {

    const { name, value } = e.target;
    
    if (name === "ReasonDetails") {
      if (/^[a-zA-Z0-9\s]{0,4000}$/.test(value)) { 
        setFormData(prevFormData => ({
          ...prevFormData,
          [name]: value
        })); 
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
    //  formData.MOBILEVERIFY = "NOT VERIFIED";
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
  
  React.useEffect(() => {
    debugger
    const params = new URLSearchParams(location.search);
    const txnno = params.get('txnno');
try {
    if (txnno !== null && txnno !== undefined) {
     debugger
      console.log('E-KYC completed successfully with txnno:', txnno);
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
  }
  catch(error){
    console.log(error)
  }  
  }, [location.search]);

  const handleReasonFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024;
    if (file && file.size > maxSize) {
      toast.error(`${t('fileSizeExceeded')}`);
      e.target.value = null;
      setSelectedReasonFile(null);
      return;
    }
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    if (!['pdf'].includes(fileExtension)) {
      toast.error(`${t("selectPdfFileOnly")}`);
      e.target.value = null;
      setSelectedReasonFile(null);
      return
    }
 //   setfileExtension(fileExtension);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedReasonFile(file);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleNameFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024;
    if (file && file.size > maxSize) {
      toast.error(`${t('fileSizeExceeded')}`);
      e.target.value = null;
      setSelectedNameFile(null);
      return;
    }
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    if (!['pdf'].includes(fileExtension)) {
      toast.error(`${t("selectPdfFileOnly")}`);
      e.target.value = null;
      setSelectedNameFile(null);
      return
    }
  //  setfileExtension(fileExtension);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedNameFile(file);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleFileNameDelete = () => {
    setSelectedNameFile(null);
  //  setfileExtension('');
  }
  const handleFileReasonDelete = () => {
    setSelectedReasonFile(null);
  //  setfileExtension('');
  }
 
  
  const handleBack = () => {
    localStorage.removeItem('SETPROPERTYMUTATIONEPID');
    localStorage.removeItem('SETMUTATATIONREQID');
    localStorage.removeItem('SETPROPERTYMUTATIONAPPLID');
    localStorage.removeItem('SETPROPERTYMUTATIONPRORPERTYCODE');
    navigate("/PendingMutationReport");
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
    localStorage.setItem("OWNERTYPE", JSON.stringify("NEWOWNER"))
    var response = await axiosInstance.post("E-KYCAPI/INS_NCL_MUTATION_OBJECTION_MAIN")


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

     
      const response = await axiosInstance.post(`MutationObjectionAPI/INS_NCL_MUTATION_OBJECTION_TEMP_WITH_EKYCDATA?${queryString}`,EkycResponseData);
      console.log(response.data);
      
     
      toast.success(`${t("ownerEditedSuccess")}`)
       setTableData8(response.data.Table || [])
            localStorage.setItem('SETMUTATATIONREQID',response.data.Table[0].MUTATION_OBJECTION_REQ_ID)
      setEkycResponseData(null);
     
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
  const handleValidation = async () =>{
    debugger
    let propertyDocumentName = "";
    let PropertyDocumentReason = "";
    try {
    if (selectedNameFile !== null) {
      propertyDocumentName = await getPropertyphoto(selectedNameFile);
    }
    if(propertyDocumentName === "" || propertyDocumentName === undefined ||propertyDocumentName === null)
      {
        if(formData.NameDocument === "" || formData.NameDocument === undefined || formData.NameDocument === null){
      toast.error("Please Scan and Upload the Objection Document");
      return false
        }
    }
    
      debugger
    
    
        
        
     
        if(formData.ReasonDetails === "" || formData.ReasonDetails === undefined || formData.ReasonDetails === null){
          toast.error("Please enter the Reason Details")
          return false
        }
      
      if(tablesdata8.length ===0){
        toast.error("Please Verify with Atleast one EKYC Owner")
        return false
      }
     
      return true
    }
      catch(error){
toast.error(error)
console.log(error)
      }
    }
    const fetchAcknowedgeMentPdf = async (MUTATIONOBJREQID) => {
      try {
        debugger
        
        
          setLoading(true)
        const response = await axiosInstance.get(
          `Report/GetFinalMutationAcknowledgementReport?mutationRequestId=${MUTATIONOBJREQID}`,
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

  
  const handleFinalSubmit = async (e) => {
    
    if (e.key === 'Enter') {
      e.preventDefault();
    }
       
    let propertyDocumentName = "";
   
    
      
      let IsValidation = await handleValidation() 
      
      if(IsValidation){ 
      setLoading(true);
      debugger
    
        
      
           if(selectedNameFile !== null){
        propertyDocumentName = await getPropertyphoto(selectedNameFile);
        }
        if(formData.NameDocument.length > 0){
          propertyDocumentName = formData.NameDocument;
        }
      
      const data = {
        mutatation_Req_Id: JSON.parse(localStorage.getItem('SETMUTATATIONREQID')),
        propertyEpid: JSON.parse(localStorage.getItem("SETPROPERTYMUTATIONEPID")),
        objectionDocument: propertyDocumentName,
        reasondetails: formData.ReasonDetails || null,
        objectionDocumentName: selectedNameFile.name,
        mutationApplId:JSON.parse(localStorage.getItem("SETPROPERTYMUTATIONAPPLID")), 
        propertycode:JSON.parse(localStorage.getItem("SETPROPERTYMUTATIONPRORPERTYCODE")),
        loginId: JSON.parse(localStorage.getItem('SETLOGINID')).toString(),
       //  loginId: "crc",
      };
      
      try {
       let response3 = await axiosInstance.post('MutationObjectionAPI/INS_NCL_MUTATION_OBJECTION_FINAL_SUBMIT', data
        )
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
    await fetchAcknowedgeMentPdf(response3.data.Table[0].MUTATIONOBJECTIONREQID);
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
        setTimeout(() => {
          navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
        }, 500);
      }
    } else {
      setLoading(false);
      localStorage.setItem("userProgress", 4);
       
    
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
    <Container maxWidth="xl">
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 1, borderRadius: 2}}>
        <ToastContainer />
        <Typography
  variant="body1"
  sx={{
    color: '#1565c0',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    fontSize: '2.5rem',
    textAlign: 'center', // Correct alignment property
  }}
>
Mutation Objection
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
          link.download = 'MUTATION OBJECTION ACKNOWLEDGMENT.pdf'; // Set your desired filename here
          link.click();
        }}
        color="primary"
      >
        Download PDF
      </Button>

      <Button  onClick={() => handleBack()} color="primary">
      Close PDF and Finish
      </Button>
    </DialogActions>
  </Dialog>
)}

   
             

      <br></br>
     <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontFamily: "sans-serif",
              marginBottom: 3,
              color: '#',
              fontSize: {
                xs: '1.5rem',
                sm: '2rem',
                md: '2rem',
              }
            }}
          >
           Aadhar Authentication of the Objector 
          </Typography>
          
          <Grid item xs={12} sm={6}>

          <Box display="flex" alignItems="center">
                    <Typography variant="h6" sx={{ ml: 1 }}>
                     Aadhar Authentication <span style={{ color: 'red' }}> (If you do not want to give Aadhar ,you can file physical objection application to ARO office) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>
                    </Typography>
                    {tablesdata8.length === 0 &&
                    <Button variant="contained" color="primary" onClick={() => AddEKYCOwner()}>
                        {t("VerifyE-KYC")}
                      </Button>
}
                  </Box>
               
</Grid>
<br></br>
<br></br>
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
                    {/* <TextField
                          fullWidth
                          label={t('MobileVerification')}
                          name="MOBILEVERIFY"
                          value={formData.MOBILEVERIFY}
                          onChange={handleChange}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="filled"
                        /> */}
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
                  <Grid item xs={12} sm={12}>
                    <Box display="flex" justifyContent="center" gap={2}>
                        <Button variant="contained" color="primary" onClick={() => handleSave("EKYC")}>
                          {t("Save")}
                        </Button>
                     
                    </Box>
                  </Grid>
               
              
                  </>
                  
      }
        </Grid>
        <Typography>Actual Objectors with E-Kyc Verifed</Typography>
<TableContainer component={Paper} sx={{ mt: 4 }}>
  <Table>
    <TableHead>
      <TableRow>
       
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("Objector Name")}</TableCell>
               <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("Address")}</TableCell>
               <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("MobileNumber")}</TableCell>
               <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("Objector Photo")}</TableCell>
               <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   EMAIL</TableCell>
               <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}> {t('MobileVerification')}</TableCell>
       
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
              <TableCell>{row.MUT_OBJECTOR_NAME_EN}</TableCell>
              <TableCell>{row.MUT_OBJECTOR_ADDRESS_EN}</TableCell>
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
              <TableCell>{row.EMAIL}</TableCell>
              <TableCell>{row.MOBILEVERIFY}</TableCell>
            
            </TableRow>
          );
        })
      )}
    </TableBody>
  </Table>
</TableContainer>
<br></br>
          
<Grid item xs={12} sm={6}>
      <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center" flexDirection="column" textAlign="center" mb={2}>
          <Typography variant="h5" color="primary" gutterBottom>
          {t("Scan and Upload Objection")}
          </Typography>
          <Divider sx={{ width: '100%', mb: 2 }} />

       

          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2, mb: 2, px: 3, py: 1 }}
          >
            {t("Uploadfile")}
            <VisuallyHiddenInput type="file" accept=".pdf" onChange={handleNameFileChange} />
          </Button>

          {selectedNameFile && (
            <Box display="flex" alignItems="center" justifyContent="center" mt={2} sx={{ color: 'text.secondary' }}>
              <Typography variant="h6">{selectedNameFile.name}</Typography>
              <Button color="error" onClick={handleFileNameDelete} sx={{ ml: 2 }}>
                {t("Delete")}
              </Button>
            </Box>
          )}
          
          <Typography variant="caption" sx={{ mt: 1, color: '#df1414',fontSize:'1rem'  }}>
            {t("MaximumFileSizeMB")}
          </Typography>
        </Box>

        {formData.NameExtension && (
          <Box display="flex" alignItems="center" justifyContent="center" mt={2} sx={{ p: 1, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
            <Typography variant="h6" color="InfoText" sx={{ mr: 1 }}>
              {t("Uploaded Document:")}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mr: 2 }}>
              {formData.NameExtension}
            </Typography>
            <IconButton onClick={() => handleDownload(formData.NameDocument, formData.NameExtension)}>
              <GetAppIcon color="primary" />
            </IconButton>
          </Box>
        )}
      </Card>
    </Grid>

<br></br>
<br></br>


<Grid item xs={14} sm={7}>

          <Box display="flex" alignItems="center">
                    <Typography variant="h6" sx={{ ml: 1 }}>
                    <LabelWithAsterisk text={"Remarks / Objection in Brief :"} />
                    </Typography>
                    <TextField
                    
                    multiline 
                    rows={4}
                    label={<LabelWithAsterisk text={"Remarks / Objection in Brief"} />}
                    name="ReasonDetails"
                    value={formData.ReasonDetails}
                    onChange={handleChange}
                    sx={{ ml: 1, width: '50%' }} 
                    variant={true ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !true,
                      style: { backgroundColor: !true ? '' : "#ffff" },
                      
                    }}
                  />

                  </Box>
</Grid>

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


export default MutationObjection;
