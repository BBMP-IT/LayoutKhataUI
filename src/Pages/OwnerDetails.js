import React, { useState } from 'react';
import {
  Button, Box, Container, Typography, Grid, TextField, Radio, RadioGroup, FormControlLabel, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem, Select, InputLabel, CircularProgress
} from '@mui/material';
//import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import { toast, ToastContainer } from 'react-toastify';
import LabelWithAsterisk from '../components/LabelWithAsterisk'
import MaskingValue from '../components/MaskingValue';
const OwnerDetails = () => {
  const [formData, setFormData] = useState({
    relato: "0",
    MOBILEVERIFY: "",
    IDENTIFIERNAME: ""
  });
  const [tableData, setTableData] = useState([
  ]);
  const navigate = useNavigate();
  const location = useLocation();
  const [tabledata5EkycVerifed, setTablesDataEKYCVerified] = useState([]);
  const [tabledata5EkycNotVerifed, setTablesDataEkycNotVerifed] = useState([]);
  const [tablesdata8, setTableData8] = useState([]);
  const [coreArea, setCoreArea] = useState(0)
  const [loading, setLoading] = useState(false);
  const [editableIndex, setEditableIndex] = useState(-1);
  const [otpFieldsVisible, setOtpFieldsVisible] = useState(false);
  const [alertShown, setAlertShown] = useState(false);
  const [EkycResponseData,setEkycResponseData] = useState(null)
  const [otpNumber, setOtpNumber] = useState(0)
  const { t } = useTranslation();
  const [otpButtonDisabled, setOtpButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(30); 
  const [countdownInterval, setCountdownInterval] = useState(null);
  const handleChange = (e) => {
debugger
    const { name, value } = e.target;
    if (name === "MOBILENUMBER") {
      if (formData.MOBILENUMBER === value || value.trim() === "") {
        setOtpFieldsVisible(false);
        setAlertShown(false);
      } else {
       debugger
       let noOfMobile = tabledata5EkycNotVerifed.filter(row => row.MOBILENUMBER === value);
        if(noOfMobile.length === 0){
        setOtpFieldsVisible(true);
        if (!alertShown) {
          alert(`${t("MobileValidation")}`);
          setAlertShown(true);
        }
      }
      else {
       formData.MOBILEVERIFY = "Verified";
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
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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
      formData.MOBILEVERIFY = "NOT VERIFIED";
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
    } catch (error) {
      console.log("failed to send otp" + error)
    }

  };

  const handleVerifyOtp = () => {
    if (formData.OwnerOTP === otpNumber.toString()) {
      toast.success(`${t("otpVerifiedSuccess")}`);
      formData.MOBILEVERIFY = "Verified";
      setOtpFieldsVisible(false);
    } else {
      toast.error(`${t("Invalid OTP Entered")}`);
    }
  };
  const handleEdit = (index) => {
    
    setEditableIndex(index);
    setFormData(tabledata5EkycNotVerifed[index]);
  };
  const handleDelete = async (index) => {
    try {
      const ownerToDelete = tabledata5EkycNotVerifed[index];
      await axiosInstance.get(`Name_Match/DEL_SEL_NCL_PROP_OWNER_TEMP?P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&propertyCode=${ownerToDelete.PROPERTYCODE}&ownerNumber=${ownerToDelete.OWNERNUMBER}`);
      toast.error(`${t("ownerDeletedSuccess")}`);
      await fetchData();
    } catch (error) {
      console.log(error)
    }

  };

  const handleNavigation = () => { 
    
debugger
   
    let atLeastOneMobileVerified = false;
    let relationshiptype = true;
    let relationname = true;
    let BookOwnerMisMatch = true;
    
    if(tabledata5EkycVerifed.some(x=>x.MOBILEVERIFY === "Verified")){
      atLeastOneMobileVerified = true;
    }
    if(tabledata5EkycVerifed.length !== tableData.length){
      BookOwnerMisMatch = false;
    }
    for (let data of tabledata5EkycVerifed) {
       
        if (data.IDENTIFIERNAME === null || data.IDENTIFIERNAME === "" || data.IDENTIFIERNAME === undefined) {
          relationname = false;
        }
        if (data.IDENTIFIERTYPEID === "0" || data.IDENTIFIERTYPEID === null || data.IDENTIFIERTYPEID === undefined) {
          relationshiptype = false;
        }
      }
    if (atLeastOneMobileVerified && relationname && relationshiptype && tabledata5EkycVerifed.length > 0 && BookOwnerMisMatch) {
      if (coreArea === 1) {
        localStorage.setItem("userProgress", 6);
        navigate("/LocationDetails")
      }else {
        localStorage.setItem("userProgress", 6);
        navigate("/LocationDetails")
      }
    }
    else {
      if (atLeastOneMobileVerified) {
        toast.error(`${t("ownersMobileNotVerified")}`);
      }
      if(!BookOwnerMisMatch){
        toast.error("The No of Owners E-KYC Verified Should Match Book Owners");
      }
      if (!relationname) {
        toast.error(`${t("ownersRelationNameMissing")}`);
      }
      if (!relationshiptype) {
        toast.error(`${t("ownersRelationTypeMissing")}`);
      }
      if (tabledata5EkycVerifed.length === 0) {
        toast.error(`${t("atleastOneOwnerRequired")}`);
      }
    }
  }



  const handleSave = async (Type) => {

    try {

      if (otpFieldsVisible) {
        toast.error(`${t("verifyOtp")}`)
        return
      }
      if (formData.IDENTIFIERTYPEID === null || formData.IDENTIFIERTYPEID === undefined || formData.IDENTIFIERTYPEID === 0) {
        toast.error(`${t("selectRelationshipType")}`)
        return
      }
      if (formData.IDENTIFIERTYPEID.length === 0) {
        toast.error(`${t("selectRelationshipType")}`)
        return
      }
      if (formData.IDENTIFIERNAME === null || formData.IDENTIFIERNAME === undefined) {
        toast.error(`${t("enterRelationName")}`)
        return
      }
      if (formData.IDENTIFIERNAME.length <= 0) {
        toast.error(`${t("enterRelationName")}`)
        return
      }
      let s = tabledata5EkycNotVerifed.some(x =>x.MOBILEVERIFY === "Verified");
      if(!s){
      if (formData.MOBILENUMBER === null || formData.MOBILENUMBER === undefined) {
        toast.error(`${t("enterValidMobileNumber")}`)
        return
      }
      if (formData.MOBILENUMBER.length <= 0 && formData.MOBILENUMBER.length < 10) {
        toast.error(`${t("enterValidMobileNumber")}`)
        return
      }
    }

      if(Type === "AFTEREKYC")
      {
      setEditableIndex(-1);
      const params = {
        P_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')),
        propertyCode: formData.PROPERTYCODE,
        ownerNumber: formData.OWNERNUMBER,
        IDENTIFIERTYPE: formData.IDENTIFIERTYPEID || 0,
        IDENTIFIERNAME_EN: formData.IDENTIFIERNAME || "",
        MOBILENUMBER: formData.MOBILENUMBER || "0",
        MOBILEVERIFY: formData.MOBILEVERIFY !== "" ? formData.MOBILEVERIFY : "NOT VERIFIED",
        loginId: 'crc'
      };

      const queryString = new URLSearchParams(params).toString();


      const response = await axiosInstance.get(`Name_Match/UPD_NCL_PROPERTY_OWNER_TEMP_MOBILEVERIFY?${queryString}`);
      console.log(response.data);
      toast.success(`${t("ownerEditedSuccess")}`)
      await fetchData();
    }
    else if(Type === "EKYC"){
      debugger
      const params = {
        IDENTIFIERTYPE: formData.IDENTIFIERTYPEID || 0,
        IdentifierName:formData.IDENTIFIERNAME,
        NAMEMATCHSCORE:0,
        MOBILENUMBER: formData.MOBILENUMBER || "0",
        MOBILEVERIFY: formData.MOBILEVERIFY !== "" ? formData.MOBILEVERIFY : "NOT VERIFIED",
        loginId: 'crc'
      };

      const queryString = new URLSearchParams(params).toString();

     
      const response = await axiosInstance.post(`Name_Match/INS_NCL_PROPERTY_OWNER_TEMP_WITH_EKYCDATA?${queryString}`,EkycResponseData);
      console.log(response.data);
      toast.success(`${t("ownerEditedSuccess")}`)
      setEkycResponseData(null);
      await fetchData();
    }
    } catch (error) {
      toast.error(`${t("errorSavingData")}`, error)
    }

  };
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response1 = await axiosInstance.get('Name_Match/GetMasterTablesData_React?UlbCode=555&Page=OWNER_DETAILS');
      const response2 = await axiosInstance.get(`Name_Match/GET_PROPERTY_PENDING_CITZ_BBD_DRAFT_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=OWNER_DETAILS`);
      const response3 = await axiosInstance.get(`Name_Match/GET_PROPERTY_PENDING_CITZ_NCLTEMP_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=OWNER_DETAILS`);
      const { Table1:BBDTable1 = [] } = response2.data;
      const { Table2: NCLTable2 = [], Table1: NCLTable1Data = [], } = response3.data;
      const { Table:MasterTable1 = [] } = response1.data;
      setCoreArea(NCLTable1Data.length > 0 ? NCLTable1Data[0].AREA_TYPE : 2)
      setTableData8(MasterTable1.length > 0 ? MasterTable1 : [])
      setTableData(BBDTable1.length > 0 ? BBDTable1 : []);
      setTablesDataEKYCVerified(NCLTable2.length > 0 ? NCLTable2.filter(item => item.EKYCSTATUS === "DONE" 
        && (item.IDENTIFIERNAME !== null || item.IDENTIFIERNAME !== "" || item.IDENTIFIERNAME !== undefined)
        && (item.IDENTIFIERTYPEID !== "0" || item.IDENTIFIERTYPEID !== null || item.IDENTIFIERTYPEID !== undefined)
      ) : []);
      setTablesDataEkycNotVerifed(NCLTable2.length > 0 ? NCLTable2 : [])
      setLoading(false);
    } catch (error) {
      toast.error(`${t("Error Getting data!")}` + error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

  },[t])

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txnno = params.get('txnno');

    if (txnno !== null && txnno !== undefined) {
     
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

    // fetchData();
  }, [location.search,fetchData]);
  const handleSubmit = (e) => {

    // Submit form data logic here
  };
 
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
     //   setEditableIndex(NCLTable2.length -1);
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
  const back = () => {
   
      navigate('/KaveriData')
    
  };
  const AddEKYCOwner = async () => {
    var ownerNumber = 1;

    if (tabledata5EkycVerifed.length > 0) {
      const maxOwnerNumber = Math.max(...tabledata5EkycVerifed.map(item => item.OWNERNUMBER));
      ownerNumber = maxOwnerNumber + 1;
    }
    localStorage.setItem("OWNERTYPE", JSON.stringify("NEWOWNER"))
    var response = await axiosInstance.post("E-KYCAPI/RequestEKYC?OwnerNumber=" + ownerNumber + "&BOOK_APP_NO=" + JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')) + "&PROPERTY_CODE=" + JSON.parse(localStorage.getItem('SETPROPERTYCODE')))


    window.location.href = response.data;
  };
  const VerfiyEKYC = async (row) => {

    let ownerNumber = 0;
    if (row.OWNERNUMBER !== "") {
      ownerNumber = row.OWNERNUMBER;
      
    } else {
      ownerNumber = row.SLNO;
    
    }
    localStorage.setItem("OWNERTYPE", JSON.stringify("OLDOWNER"))
    
    var response = await axiosInstance.post("E-KYCAPI/RequestEKYC?OwnerNumber=" + ownerNumber + "&BOOK_APP_NO=" + JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')) + "&PROPERTY_CODE=" + JSON.parse(localStorage.getItem('SETPROPERTYCODE')))
    window.location.href = response.data;
  }
  const ReaddDeletedOwner = async (row) => {
    let ownerNumber = 0;
    if (row.OWNERNUMBER !== "") {
      ownerNumber = row.OWNERNUMBER;
    } else {
      ownerNumber = row.SLNO;
    }
    var response = await axiosInstance.get("Name_Match/COPY_OWNER_FROM_BBDDRAFT_NCLTEMP?&P_BOOKS_PROP_APPNOAPPNO=" + JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')) + "&propertyCode=" + JSON.parse(localStorage.getItem('SETPROPERTYCODE')) + "&ownerNumber=" + ownerNumber)
    console.log(response.data)
    const { Table1 = [] } = response.data;
    setTablesDataEkycNotVerifed(Table1);
  }
  const OwnerExists = (BBDOwnerNumber) => {
    const exists = tabledata5EkycNotVerifed.some(item => item.OWNERNUMBER === BBDOwnerNumber);
    return exists;
  }
  const OwnerEKYCVerfiedExists = (BBDOwnerNumber) => {
    const exists = tabledata5EkycVerifed.some(item => item.OWNERNUMBER === BBDOwnerNumber && item.EKYCSTATUS === "DONE");
    return exists;
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
      <ToastContainer />
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 4, borderRadius: 2, mt: 8 }}>
        <form onSubmit={handleSubmit}>
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
                md: '2.5rem',
              }
            }}
          >
            {t("OwnerShipDetails")}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {t("ExistingDigitization")}
            </Typography>
            <Button variant="contained" color="warning" onClick={AddEKYCOwner}>
              {t("ADDNEWOWNER")}
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ mt: 4 }}>
            <Table>
              <TableHead>
                <TableRow>

                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("OwnerNo.")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("OwnerName")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Father/Mother/Husband/SpouseName")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Address")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("E-KYCStatus")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("OwnerStatus")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("VerifyE-KYC")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}></TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      {t("Nodataavailable")}
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((row,index) => (
                    <TableRow key={index}>
                      <TableCell>{row.OWNERNUMBER}</TableCell>
                      <TableCell>{row.OWNERNAME}</TableCell>
                      <TableCell>{row.IDENTIFIERTYPE} {row.IDENTIFIERNAME}</TableCell>
                      <TableCell>{row.OWNERADDRESS} {MaskingValue({value:row.MOBILENUMBER,maskingLength:4})}</TableCell>
                      <TableCell>{OwnerEKYCVerfiedExists(row.OWNERNUMBER) ? "Verifed" : row.EKYCSTATUS}</TableCell>
                      <TableCell>{OwnerExists(row.OWNERNUMBER) ? `${t("RETAINED")}` : `${t("DELETED")}`}</TableCell>
                      <TableCell>{OwnerEKYCVerfiedExists(row.OWNERNUMBER) ?
                      ""
                        :
                        <Button variant="contained" color="primary" onClick={() => VerfiyEKYC(row)}>
                        {t("VerifyE-KYC")}
                      </Button>
                      }
                      </TableCell>
                      
                      <TableCell>{OwnerExists(row.OWNERNUMBER) ?
                        ""
                        :
                        <Button variant="contained" color="primary" onClick={() => ReaddDeletedOwner(row)}>
                          {t("Re-AddDeletedOwner")}
                        </Button>
                      }
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <br></br>
          <Grid container spacing={3}>
           {EkycResponseData !== null &&
              <Grid item xs={12} >
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f7f7f7' }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {t('OwnersToBeAddedine-Khatha')}
                  </Typography>
                  <Grid item xs={12} sm={2}>
                    <div style={{ marginLeft: '10px', position: 'relative', textAlign: 'center' }}>
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
                     
                        <FormControl fullWidth sx={{ marginBottom: 3 }}>
                          <InputLabel>< LabelWithAsterisk text={t("RelationshipType")} /></InputLabel>
                          <Select
                            name="IDENTIFIERTYPEID"
                            value={formData.IDENTIFIERTYPEID}
                            onChange={handleChange}
                          >
                            <MenuItem value="">--Select--</MenuItem>
                            {tablesdata8.map((item) => (
                              <MenuItem key={item.IDENTIFIERTYPEID} value={item.IDENTIFIERTYPEID}>
                                {item.IDENTIFIERTYPE_EN}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                     
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      
                        <TextField
                          fullWidth
                          label={< LabelWithAsterisk text={t("RelationName")} />}
                          name="IDENTIFIERNAME"
                          value={formData.IDENTIFIERNAME}
                          onChange={handleChange}
                          variant="standard"
                        />
                      
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
                            variant="standard"
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
                              <TextField
                                fullWidth
                                label={t('Enter OTP')}
                                name="OwnerOTP"
                                value={formData.OwnerOTP}
                                onChange={handleChange}
                                variant="standard"
                              />

                              <Button variant="contained" color="primary" onClick={() => handleVerifyOtp()}>
                                Verify OTP
                              </Button>
                              <br></br>
                            </Grid>
                          )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={t('MobileVerification')}
                          name="MOBILEVERIFY"
                          value={formData.MOBILEVERIFY === null ? "NOT VERIFIED" : formData.MOBILEVERIFY}
                          onChange={handleChange}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="filled"
                        />
                  </Grid>
                  </Grid>
                  <br></br>
                  <Grid item xs={12} sm={12}>
                    <Box display="flex" justifyContent="center" gap={2}>
                        <Button variant="contained" color="primary" onClick={() => handleSave("EKYC")}>
                          {t("Save")}
                        </Button>
                      <Button variant="contained" color="error" onClick={() => handleDelete()}>
                        {t("DELETEOWNER")}
                      </Button>
                    </Box>
                  </Grid>
                </Paper>
              </Grid>
          }
            {tabledata5EkycNotVerifed.map((owner, index) => (
              <Grid item xs={12} key={index}>
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, backgroundColor: '#f7f7f7' }}>
                  {!EkycResponseData &&
                <Typography variant="h6" color="primary" gutterBottom>
                    {t('OwnersToBeAddedine-Khatha')}
                  </Typography>
                  }
                  <Grid item xs={12} sm={2}>
                    <div style={{ marginLeft: '10px', position: 'relative', textAlign: 'center' }}>
                      <img
                        src={`data:image/png;base64,${owner.OWNERPHOTO}`}
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
                        value={owner.OWNERNAME || ''}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="filled"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                   
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {editableIndex === index ? (
                        <FormControl fullWidth sx={{ marginBottom: 3 }}>
                          <InputLabel>< LabelWithAsterisk text={t("RelationshipType")} /></InputLabel>
                          <Select
                            name="IDENTIFIERTYPEID"
                            value={formData.IDENTIFIERTYPEID}
                            onChange={handleChange}
                          >
                            <MenuItem value="">--Select--</MenuItem>
                            {tablesdata8.map((item) => (
                              <MenuItem key={item.IDENTIFIERTYPEID} value={item.IDENTIFIERTYPEID}>
                                {item.IDENTIFIERTYPE_EN}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <FormControl fullWidth sx={{ marginBottom: 3 }}>
                          <InputLabel>< LabelWithAsterisk text={t("RelationshipType")} /></InputLabel>
                          <Select
                            name="RelationShiptype"
                            value={owner.IDENTIFIERTYPEID}
                            onChange={handleChange}
                            // disabled
                            inputProps={{ readOnly: true }}
                          >
                            <MenuItem value="">--Select--</MenuItem>
                            {tablesdata8.map((item) => (
                              <MenuItem key={item.IDENTIFIERTYPEID} value={item.IDENTIFIERTYPEID}>
                                {item.IDENTIFIERTYPE_EN}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {editableIndex === index ? (
                        <TextField
                          fullWidth
                          label={< LabelWithAsterisk text={t("RelationName")} />}

                          name="IDENTIFIERNAME"
                          value={formData.IDENTIFIERNAME || ''}
                          onChange={handleChange}
                          variant="standard"
                        />
                      ) : (
                        <TextField
                          fullWidth
                          label={< LabelWithAsterisk text={t("RelationName")} />}
                          name="RelationName"
                          value={owner.IDENTIFIERNAME || ''}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="filled"
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {t("Gender")}
                      </Typography>
                      <FormControl component="fieldset" sx={{ marginBottom: 3 }}>
                        <RadioGroup row name="Gender" value={owner.GENDER} onChange={handleChange}>
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
                        value={owner.DATEOFBIRTH || ''}
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
                        value={owner.OWNERADDRESS || ''}
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
                        value={owner.OWNERIDENTITYSLNO || ""}
                        InputProps={{
                          readOnly: true,
                        }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {editableIndex === index ? (
                        <>
                          <TextField
                            fullWidth
                            label={< LabelWithAsterisk text={t("MobileNumber")} />}

                            name="MOBILENUMBER"
                            value={formData.MOBILENUMBER || ''}
                          
                            onChange={handleChange}
                            variant="standard"
                          />

                          {otpFieldsVisible && (
                            <Grid>
                              <br></br>
                              {!otpButtonDisabled && (
                                <>
                                  <Button variant="contained" color="primary" onClick={() => handleGenerateOtp(index)}>
                                    {t("GenerateOTP")}
                                  </Button>
                                </>
                              )}
                              {otpButtonDisabled && (
                                <Typography >
                                  Resend OTP in {timer} seconds
                                </Typography>

                              )}
                              <TextField
                                fullWidth
                                label={t('Enter OTP')}
                                name="OwnerOTP"
                                value={formData.OwnerOTP}
                                onChange={handleChange}
                                variant="standard"
                              />

                              <Button variant="contained" color="primary" onClick={() => handleVerifyOtp(index)}>
                                Verify OTP
                              </Button>
                              <br></br>
                            </Grid>
                          )}
                        </>
                      ) : (
                        <TextField
                          fullWidth
                          label={< LabelWithAsterisk text={t("MobileNumber")} />}
                          name="MobileNumber"
                          value={MaskingValue({value:owner.MOBILENUMBER,maskingLength:4})|| ''}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="filled"
                        />
                      )}

                    </Grid>

                    <Grid item xs={12} sm={6}>
                      {editableIndex === index ? (
                        <TextField
                          fullWidth
                          label={t('MobileVerification')}
                          name="MOBILEVERIFY"
                          value={formData.MOBILEVERIFY === null ? "NOT VERIFIED" : formData.MOBILEVERIFY}
                          onChange={handleChange}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="filled"
                        />
                      ) : (
                        <TextField
                          fullWidth
                          label={t('MobileVerification')}
                          name="MOBILEVERIFY"
                          value={owner.MOBILEVERIFY === null ? "NOT VERIFIED":owner.MOBILEVERIFY}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="filled"
                        />
                      )}
                    </Grid>




                  </Grid>

                  <br></br>
                  <Grid item xs={12} sm={12}>
                    <Box display="flex" justifyContent="center" gap={2}>
                      {editableIndex === index ? (
                        <Button variant="contained" color="primary" onClick={() => handleSave("AFTEREKYC")}>
                          {t("Save")}
                        </Button>
                      ) : (
                        <Button variant="contained" color="secondary" onClick={() => handleEdit(index)}>
                          {t("Edit")}
                        </Button>
                      )}
                      <Button variant="contained" color="error" onClick={() => handleDelete(index)}>
                        {t("DELETEOWNER")}
                      </Button>
                    </Box>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>



          <br></br>
          <Typography>{t("ActualOwners")}</Typography>

          <TableContainer component={Paper} sx={{ mt: 4 }}>
            <Table>
              <TableHead>
                <TableRow>

                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("OwnerNo.")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("OwnerName")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("Father/Mother/Husband/SpouseName")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("Address")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("MobileNumber")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("OwnerPhoto")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("MobileVerification")}</TableCell>
                  <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("E-KYCStatus")}</TableCell>
                  {/* <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("NAMEMATCHSTATUS")}</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {tabledata5EkycVerifed.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      {t("Nodataavailable")}
                    </TableCell>
                  </TableRow>
                ) : (
                  tabledata5EkycVerifed.map((row,index) => {

                    return (
                      <TableRow key={index}>
                        <TableCell>{row.OWNERNUMBER}</TableCell>
                        <TableCell>{row.OWNERNAME}</TableCell>
                        <TableCell>{row.IDENTIFIERNAME}</TableCell>
                        <TableCell>{row.OWNERADDRESS}</TableCell>
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
                        <TableCell>{row.MOBILEVERIFY}</TableCell>
                        <TableCell>{row.EKYCSTATUS}</TableCell>
                        {/* <TableCell>


                          {row.NAMEMATCHSCORE > 60 ? OwnerEKYCVerfiedExists(row.OWNERNUMBER) ? "Name Matching" : "New Owner" : "Name Not Matching"}

                        </TableCell> */}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="center" gap={2} mt={3}>
            <Button variant="contained" color="primary" onClick={back}>
              {t("Previous")}
            </Button>
            <Button variant="contained" color="success" onClick={handleNavigation}>
              {t("next")}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default OwnerDetails;
