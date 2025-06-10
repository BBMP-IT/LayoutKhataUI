import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, CircularProgress, Tooltip, IconButton, 
  FormControl,  MenuItem, Select, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Radio
  ,FormControlLabel,RadioGroup, Card, Divider,Dialog, DialogContent, DialogActions
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
const ObjectorsPage = () => {
  const [formData, setFormData] = useState({
    propertyCode: '',
    propertyNumber: "",
    propertyEID: "",
    district: "",
    ulbname: "",
    buildingname: "",
    NearestLandmark: "",
    DoorPlotNo: "",
    streetid: '',
    streetName: "",
    nclStreetName:"",
    Street: "",
    doorno: '',
    areaorlocality: '',
    landmark: '',
    pincode: '',
    propertyphoto: '',
    loginId: '',
    wardNumber: "",
    wardName: "",
    BBDOldWardNumber: "",
    BBDOldPropertyNumber: "",
    BBDSasApplicationNumber:"",
    BBDAddress:"",
    BBDPropertyType:"",
    BBDPropertyCategory:"",
    ReasonCategory:"",
    ReasonDetails:"",
    MOBILEVERIFY:"",
    TypeOfUpload:"",
    MOBILENUMBER:"",
    EMAIL:"",
    communicationAddress:"N",
    ReasonExtension:"",
    ReasonDocument:"",
    NameExtension:"",
    NameDocument:""
  });
  const { t } = useTranslation();
 

  const navigate = useNavigate();
  const location = useLocation();
 
 
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [tablesdata8, setTableData8] = useState([]);
  const [KAVERI_DOC_DETAILS, setKAVERI_DOC_DETAILS] = useState([]);
  const [KAVERI_PROP_DETAILS, setKAVERI_PROP_DETAILS] = useState([]);
  const [KAVERI_PARTIES_DETAILS, setKAVERI_PARTIES_DETAILS] = useState([]);
  const [otpNumber, setOtpNumber] = useState(0)
  const [alertShown, setAlertShown] = useState(false);
  const [tableIdentifier,setIdentifier] = useState([])
 
  const [otpFieldsVisible, setOtpFieldsVisible] = useState(false);
  const [selectedNameFile, setSelectedNameFile] = useState(null);
  const [selectedReasonFile, setSelectedReasonFile] = useState(null);
  // const [fileExtension, setfileExtension] = useState([]);
  const [EkycResponseData,setEkycResponseData] = useState(null);
  const [otpButtonDisabled, setOtpButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(30); 
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [isCommunicationAddress,setIsCommunicationAddress] = useState(false)
  
 
 
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
  const handleKaveriDocumentData = async () => {

    if (formData.RegistrationNumber.length === 0) {
      toast.error(`${t("Please Enter the Registration Number")}`);
      return
    }
if(tablesdata8.length ===0){
  toast.error("Please Verify with Atleast one EKYC Owner")
  return
}

    try {
      setLoading(true)
      let response = await axiosInstance.post(`ObjectionAPI/GetObjectionKaveriDocData?RegistrationNoNumber=${formData.RegistrationNumber}&objectionid=${JSON.parse(localStorage.getItem('OBJECTIONID'))}&PropertyCode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&LoginId=${JSON.parse(localStorage.getItem('SETLOGINID'))}`)
      const result = response.data;
      if (result.success) {
        await fetchData("Kaveri")
        setLoading(false)
      }
      else {
        setTimeout(() => {
          toast.error(result.message)
        }, 200);
        setLoading(false)
        return
      }
      setTimeout(() => {
        toast.success(`${t("detailsFetchedSuccess")}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,

        });
      }, 500)
    }
    catch (error) {
      toast.error(`${t("errorSavingData")}` + error, {
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
      }, 1000);
    }
  };
  const DocumentUploadedValidation = (Table1) => {

    if (Table1.length === 0) {
      return { isValid: false, data: [] };
    }
    else {
      return { isValid: true, data: Table1 };
    }
  }
 
  const fetchData = React.useCallback(async (ISKaveri) => {
    setLoading(true);
    
    let response2 = null;

    let objectionid = "0";

    
       objectionid = JSON.parse(localStorage.getItem('OBJECTIONID'));
      
  if(objectionid === undefined || objectionid === null || objectionid === ""){
     objectionid = "0";
  }
    
    try {
      
      const response = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_BBD_DRAFT_React?ULBCODE=555&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=ADDRESS`);
      if(objectionid === "0"){
       response2 = await axiosInstance.get(`ObjectionAPI/GET_PROPERTY_OBJECTORS_CITZ_NCLTEMP?ULBCODE=555&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&objectionid=${1}`);
      }else{
        response2 = await axiosInstance.get(`ObjectionAPI/GET_PROPERTY_OBJECTORS_CITZ_NCLTEMP?ULBCODE=555&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&objectionid=${JSON.parse(localStorage.getItem('OBJECTIONID'))}`);
      }
      const {Table1:Identifier=[],Table2:TableMain=[],Table3:TableReasons=[],Table4:TableOwner=[],Table5:KaveriDocument=[],Table6:ReasonDocument=[],Table7:TableKaveriDocument=[],Table8:TableKaveriprop=[],Table9:TableKaveriParties=[]} = response2.data;
      setIdentifier(Identifier.length > 0 ? Identifier : [])
      setTableData8(TableOwner.length > 0 ? TableOwner : [])
      // setKaveriDocumentOld(KaveriDocument.length > 0 ? KaveriDocument : [])
      setKAVERI_DOC_DETAILS(TableKaveriDocument.length > 0 ? TableKaveriDocument : [])
      setKAVERI_PROP_DETAILS(TableKaveriprop.length > 0 ? TableKaveriprop : [])
      setKAVERI_PARTIES_DETAILS(TableKaveriParties.length > 0 ? TableKaveriParties : [])
      
      const allDocuments = [...ReasonDocument]; 
      let objs = {}
 if(ISKaveri === "Kaveri"){
  // setKaveriDocumentOld(KaveriDocument.length > 0 ? KaveriDocument : [])
  setKAVERI_DOC_DETAILS(TableKaveriDocument.length > 0 ? TableKaveriDocument : [])
  setKAVERI_PROP_DETAILS(TableKaveriprop.length > 0 ? TableKaveriprop : [])
  setKAVERI_PARTIES_DETAILS(TableKaveriParties.length > 0 ? TableKaveriParties : [])
  objs = DocumentUploadedValidation(TableKaveriDocument.length > 0 ? TableKaveriDocument : [])
  return objs
 }
 if(ISKaveri === "KaveriDocument"){
  // setKaveriDocumentOld(KaveriDocument.length > 0 ? KaveriDocument : [])
  setKAVERI_DOC_DETAILS(TableKaveriDocument.length > 0 ? TableKaveriDocument : [])
  setKAVERI_PROP_DETAILS(TableKaveriprop.length > 0 ? TableKaveriprop : [])
  setKAVERI_PARTIES_DETAILS(TableKaveriParties.length > 0 ? TableKaveriParties : [])
  objs = DocumentUploadedValidation(KaveriDocument.length > 0 ? KaveriDocument : [])
  return objs
 }
      
      let response3 = []
      response3 = TableMain;
      if (response3.length > 0 && ISKaveri !== "Kaveri") {
        let reasonDocuments = allDocuments.filter(x => x.TYPEOFDOCUMENT === "R");
        let nameDocuments = allDocuments.filter(x => x.TYPEOFDOCUMENT === "N");
        const { Table1 = [], Table5 = [], } = response.data;
        const table1Item = Table1.length > 0 ? Table1[0] : [];
        const table5Item = Table5.length > 0 ? Table5[0] : [];
       
        setFormData({
          communicationAddress:TableMain.length > 0? TableMain[0].ISCOMMUNICATION :"N",
          TypeOfUpload:TableMain.length > 0? TableMain[0].TYPEOFKAVERIUPLOAD :"",
          ReasonCategory:TableReasons.length > 0 ?TableReasons[0].REASONID.toString() : "",
          ReasonDetails:TableReasons.length > 0 ?TableReasons[0].REASONDETAILS : "",
          doorno:TableOwner.length > 0 ? TableOwner[0].DOORNO : "",
          areaorlocality: TableOwner.length > 0 ?TableOwner[0].LOCALITY : "",
          buildingname:TableOwner.length > 0 ? TableOwner[0].BUILDINGNAME : "",
          pincode:TableOwner.length > 0 ? TableOwner[0].PINCODE : "",
          ReasonExtension: reasonDocuments.length > 0 ? reasonDocuments[0].DOCUMENTDETAILS : "",
          ReasonDocument: reasonDocuments.length > 0 ? reasonDocuments[0].SCANNEDDOCUMENT : "",
          NameExtension:nameDocuments.length > 0 ?nameDocuments[0].DOCUMENTDETAILS:"" ,
          NameDocument:nameDocuments.length > 0 ?nameDocuments[0].SCANNEDDOCUMENT:"",
          propertyEID: table1Item.PROPERTYID || '',
          address: table1Item.ADDRESS || '',
          district: table1Item.DISTRICTNAME || '',
          BBDOldWardNumber:table1Item.OLDWARDNUMBER198 || "",
          BBDOldPropertyNumber:table1Item.MUNICIPALOLDNUMBER || "",
          BBDSasApplicationNumber:table1Item.PUID || "",
          BBDAddress:table1Item.ADDRESS ? table1Item.ADDRESS : "",
          BBDPropertyType:table1Item.PROPERTYCATEGORYID  ? table1Item.PROPERTYCATEGORYID : "0",
          BBDPropertyCategory:table1Item.PROPERTYCLASSIFICATIONID ? table1Item.PROPERTYCLASSIFICATIONID === 1 ? "ನಮೂನೆ-ಎ ವಹಿ" : "ನಮೂನೆ-ಬಿ ವಹಿ": "",
          wardNumber: table1Item.WARDID || '',
          wardName: table1Item.WARDNAME || "",
          propertyNumber: table1Item.PROPERTYCODE || '',
          ulbname: table1Item.ULBNAME || '',
          ownerName: table5Item.OWNERNAME || '',
          streetName: table1Item.STREETNAME_EN || '',
        });
        if(TableMain[0].ISCOMMUNICATION === "Y"){
          setIsCommunicationAddress(true)
        }else {
          setIsCommunicationAddress(false)
        }
      } else if(ISKaveri !== "Kaveri") {
        setIsEditable(true)
        const { Table1 = [], Table5 = [], } = response.data;
      const table1Item = Table1.length > 0 ? Table1[0] : [];
      const table5Item = Table5.length > 0 ? Table5[0] : [];
      setFormData({
        propertyEID: table1Item.PROPERTYID || '',
        address: table1Item.ADDRESS || '',
        district: table1Item.DISTRICTNAME || '',
        BBDOldWardNumber:table1Item.OLDWARDNUMBER198 || "",
        BBDOldPropertyNumber:table1Item.MUNICIPALOLDNUMBER || "",
        BBDSasApplicationNumber:table1Item.PUID || "",
        BBDAddress:table1Item.ADDRESS ? table1Item.ADDRESS : "",
        BBDPropertyType:table1Item.PROPERTYCATEGORYID  ? table1Item.PROPERTYCATEGORYID : "0",
        BBDPropertyCategory:table1Item.PROPERTYCLASSIFICATIONID ? table1Item.PROPERTYCLASSIFICATIONID === 1 ? "ನಮೂನೆ-ಎ ವಹಿ" : "ನಮೂನೆ-ಬಿ ವಹಿ": "",
        wardNumber: table1Item.WARDID || '',
        wardName: table1Item.WARDNAME || "",
        propertyNumber: table1Item.PROPERTYCODE || '',
        ulbname: table1Item.ULBNAME || '',
        ownerName: table5Item.OWNERNAME || '',
        streetName: table1Item.STREETNAME_EN || '',
      });
      }
      
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

  const handleChange = (e) => {

    const { name, value } = e.target;
    if(name === "communicationAddress"){
        if(value === "Y"){
            setIsCommunicationAddress(true)
        }
        else {
            setIsCommunicationAddress(false)
        }
      
    }
    else if(name === "ReasonCategory"){
        if(value !== "3"){
            formData.TypeOfUpload = ""
        }
    }
    if(name === "TypeOfUpload"){
      if(value === "OldRegistrationNumber"){
      if(tablesdata8.length === 0){
        toast.error("Please Verify with Atleast One Ekyc Owner");
       formData.TypeOfUpload = ""
      }
    }
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

    fetchData();
  }
  catch(error){
    console.log(error)
  }  
  }, [location.search,fetchData]);

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
   
    localStorage.removeItem("OBJECTIONID");
    localStorage.removeItem("SETPROPERTYCODE");
    localStorage.removeItem("SETPROPERYID");
    navigate("/PropertyList");
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
    var response = await axiosInstance.post("E-KYCAPI/INS_NCL_OBJECTION_MAIN?ULBCODE=" + 555 +  "&Propertycode=" + JSON.parse(localStorage.getItem('SETPROPERTYCODE')) + "&PropertyEID="+JSON.parse(localStorage.getItem('SETPROPERYID')) )


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
     
      if (formData.MOBILENUMBER === null || formData.MOBILENUMBER === undefined) {
        toast.error(`${t("enterValidMobileNumber")}`)
        return
      }
      if (formData.MOBILENUMBER.length <= 0 || formData.MOBILENUMBER.length < 10 || formData.MOBILENUMBER.length > 11) {
        toast.error(`${t("enterValidMobileNumber")}`)
        return
      }
    

      if(Type === "AFTEREKYC")
      {
     
      const params = {
        P_BOOKS_PROP_APPNO: 1,
        propertyCode: formData.PROPERTYCODE,
        ownerNumber: formData.OWNERNUMBER,
        IDENTIFIERTYPE: formData.IDENTIFIERTYPEID || 0,
        IDENTIFIERNAME_EN: formData.IDENTIFIERNAME || "",
        MOBILENUMBER: formData.MOBILENUMBER || "0",
        MOBILEVERIFY: formData.MOBILEVERIFY !== "" ? formData.MOBILEVERIFY : "NOT VERIFIED",
        EMAIL:formData.EMAIL,
        PROPERTYID:JSON.parse(localStorage.getItem('SETPROPERYID')),
        loginId: JSON.parse(localStorage.getItem('SETLOGINID'))
      };

      const queryString = new URLSearchParams(params).toString();


      const response = await axiosInstance.get(`Name_Match/UPD_NCL_PROPERTY_OWNER_TEMP_MOBILEVERIFY?${queryString}`);
      console.log(response.data);
      toast.success(`${t("ownerEditedSuccess")}`)
      await fetchData();
    }
    else if(Type === "EKYC"){
      
      const params = {
        IDENTIFIERTYPE: formData.IDENTIFIERTYPEID || 0,
        IdentifierName:formData.IDENTIFIERNAME,
        NAMEMATCHSCORE:0,
        MOBILENUMBER: formData.MOBILENUMBER || "0",
        MOBILEVERIFY: formData.MOBILEVERIFY !== "" ? formData.MOBILEVERIFY : "NOT VERIFIED",
        loginId: JSON.parse(localStorage.getItem('SETLOGINID')),
        EMAIL:formData.EMAIL,
        PROPERTYID:JSON.parse(localStorage.getItem('SETPROPERYID')),
      };

      const queryString = new URLSearchParams(params).toString();

     
      const response = await axiosInstance.post(`ObjectionAPI/INS_NCL_PROPERTY_OBJECTOR_TEMP_WITH_EKYCDATA?${queryString}`,EkycResponseData);
      console.log(response.data);
      
      localStorage.setItem('OBJECTIONID',response.data.Table[0].OBJECTIONID)
      toast.success(`${t("ownerEditedSuccess")}`)
      setEkycResponseData(null);
      await fetchData();
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
      toast.error("Please Upload the Name Document");
      return false
        }
    }
    
      debugger
      if(formData.communicationAddress === "" || formData.communicationAddress === null|| formData.communicationAddress === undefined){
        toast.error("Please Select the Communication Address Option")
        return false
      }
      if(formData.communicationAddress === "Y"){
        if(formData.doorno === null|| formData.doorno === undefined || formData.doorno === ""){
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
      }
      if(formData.ReasonCategory === 0 || formData.ReasonCategory === "" || formData.ReasonCategory === undefined || formData.ReasonCategory === null)
        {
        toast.error("Please Select the Reason ");
        return false
      }
      debugger
      if(formData.ReasonCategory !== "3" && formData.ReasonCategory !== "5"){
        if(selectedReasonFile !== null) {
        PropertyDocumentReason = await getPropertyphoto(selectedReasonFile);
        }
        if(PropertyDocumentReason === "" || PropertyDocumentReason === undefined || PropertyDocumentReason === null)
          {
            if(formData.ReasonDocument.length === 0){
          toast.error("Please Upload the Reason Document")
          return false
            }
        }
        }
      if(formData.ReasonCategory === "5")
        {
        if(formData.ReasonDetails === "" || formData.ReasonDetails === undefined || formData.ReasonDetails === null){
          toast.error("Please enter the Reason Details")
          return false
        }
      }
      if(tablesdata8.length ===0){
        toast.error("Please Verify with Atleast one EKYC Owner")
        return false
      }
      if(formData.ReasonCategory === "3"){
      
        
      if(formData.TypeOfUpload === "" || formData.TypeOfUpload === undefined || formData.TypeOfUpload === null){
        setTimeout(() => {
        toast.error("Please Select the Type of Registration Document")
      }, 100)
        return false
      }
      else if(formData.TypeOfUpload === "RegistrationNumber") {
        let kaveridata =  await fetchData("Kaveri")
        if(kaveridata.data.length === 0){
          setTimeout(() => {
          toast.error("Please Verify with the Registation No")
        }, 100)
          return false
        }
      }
      else if(formData.TypeOfUpload === "OldRegistrationNumber"){
        let KaveriDcoumentdata =  await fetchData("KaveriDocument")
        if(KaveriDcoumentdata.data.length === 0){
          setTimeout(() => {
        toast.error("Please Upload the Kaveri Document")
      }, 100)
        return false
        }
      }
    }
      return true
    }
      catch(error){
toast.error(error)
console.log(error)
      }
    }
    const fetchAcknowedgeMentPdf = async () => {
      try {
        debugger
        //for saving Matrix Details
     //   const response1 = await axiosInstance.get(`Report/FinalSubmitValidation?propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&LoginId=crc`,)
      //  if(response1.data === "SUCCESS")
      //  {
        
          setLoading(true)
        const response = await axiosInstance.get(
          `Report/GetFinalObjectionAcknowledgementReport?propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&OBJECTIONID=${JSON.parse(localStorage.getItem('OBJECTIONID'))}&LoginId=${JSON.parse(localStorage.getItem('SETLOGINID'))}&WardId=${JSON.parse(localStorage.getItem('DraftWardId'))}`,
          {
            responseType: 'blob',  
          }
        );
  
        
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
  
        setPdfUrl(pdfUrl);
        setLoading(false) 
        toast.success(`${t("Please Download the Acknowlegement for Future Reference")}`)
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
    let PropertyDocumentReason = ""
    if (isEditable) { 
      
      let IsValidation = await handleValidation() 
      
      if(IsValidation){ 
      setLoading(true);
      debugger
    
        if(selectedReasonFile !== null){
        PropertyDocumentReason = await getPropertyphoto(selectedReasonFile);
        }
        if(formData.ReasonDocument.length > 0){
          PropertyDocumentReason =  formData.ReasonDocument;
        }
      
           if(selectedNameFile !== null){
        propertyDocumentName = await getPropertyphoto(selectedNameFile);
        }
        if(formData.NameDocument.length > 0){
          propertyDocumentName = formData.NameDocument;
        }
        
        // if(formData.ReasonCategory === "3"){
        //   if(formData.TypeOfUpload === ""){
        //    await fetchData()
        //   }
        // }
      const data = {
        objectionid: JSON.parse(localStorage.getItem('OBJECTIONID')),
        propertycode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
        scanneddocumentobjection: propertyDocumentName,
        reasondocument: PropertyDocumentReason,
        iscommunicationaddress: formData.communicationAddress,
        reasonid: formData.ReasonCategory,
        reasondetails: formData.ReasonDetails ?? "",
        ulbcode: 555,
        namedocumentdetails: selectedNameFile !== null  ? selectedNameFile.name : formData.NameExtension,
        reasondocumentdetails: selectedReasonFile !== null ? selectedReasonFile.name : formData.ReasonExtension,
        documentextension: "pdf",
        doorno: formData.doorno,
        buildingname: formData.buildingname,
        arealocatlity: formData.areaorlocality,
        pincode: formData.pincode,
        createdby: JSON.parse(localStorage.getItem('SETLOGINID')).toString(),
        typeofdocument:formData.TypeOfUpload
      };
      
      try {
        await axiosInstance.post('ObjectionAPI/INS_NCL_PROPERTY_OBJECTORS_FINAL_SUBMIT', data
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
       // setIsEditable(false);
 //   await   fetchData();
 setLoading(false);
    //handleBack();
    await fetchAcknowedgeMentPdf();
    setLoading(false);
        // localStorage.setItem("userProgress", 4);
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
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 4, borderRadius: 2, mt: 8 }}>
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
Objection can be filed only to stop issuance of final eKhata or against issued final eKhata
</Typography>
<Typography
  variant="body1"
  sx={{
    color: '#1565c0',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    textAlign: 'center', // Correct alignment property
  }}
>
(module for corrections in eKhata will be released separately)
</Typography>
<br></br>
        <Typography
          variant="h5"
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
          {t("DataAvailableInBBMPBooks")}
        </Typography>
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
          link.download = 'OBJECTION ACKNOWLEDGMENT.pdf'; // Set your desired filename here
          link.click();
        }}
        color="primary"
      >
        Download PDF
      </Button>

      <Button onClick={() => setPdfUrl('')} color="primary">
        Close PDF
      </Button>
    </DialogActions>
  </Dialog>
)}

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="filled"
              label={t("propertyEID")}
              name="propertyEID"
              value={formData.propertyEID}
              onChange={handleChange}
              InputProps={{
                readOnly: true,
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
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="filled"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title={t("cityInfo")}>
                    <IconButton color="primary">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
              label={t("city")}
              name="ulbname"
              value={formData.ulbname}
              onChange={handleChange}

            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="filled"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title={t("districtInfo")}>
                    <IconButton color="primary">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
              label={t("district")}
              name="district"
              value={formData.district}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="filled"
              label={t("wardNumber")}
              name="wardNumber"
              value={formData.wardNumber + " ," + formData.wardName}
              onChange={handleChange}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title={t("wardNumberInfo")}>
                    <IconButton color="primary">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="filled"
              label={t("oldWardNo")}
              name="BBDOldWardNumber"
              value={formData.BBDOldWardNumber}
              onChange={handleChange}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title={t("propertyNumberInfo")}>
                    <IconButton color="primary">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="filled"
              label={t("oldPropertyNo")}
              name="BBDOldPropertyNumber"
              value={formData.BBDOldPropertyNumber}
              onChange={handleChange}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title={t("ownerNameInfo")}>
                    <IconButton color="primary">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="filled"
              label={t("SASBaseApplicationNo")}
              name="BBDSasApplicationNumber"
              value={formData.BBDSasApplicationNumber}
              onChange={handleChange}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title={t("ownerNameInfo")}>
                    <IconButton color="primary">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="filled"
              label={t("PropertyAddress")}
              name="BBDAddress"
              value={formData.BBDAddress}
              onChange={handleChange}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title={t("ownerNameInfo")}>
                    <IconButton color="primary">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth  variant="filled" >
              <InputLabel>
                {t('PropertyType')}
              </InputLabel>
              <Select
                name="BBDPropertyType"
                value={formData.BBDPropertyType}
                onChange={handleChange}
                inputProps={{ readOnly: true }}
              >
                <MenuItem value="0">Select</MenuItem>
                <MenuItem value="1">Vacant Site</MenuItem>
                <MenuItem value="2">Site with Building</MenuItem>
                <MenuItem value="3">Multistorey Flats</MenuItem>
              </Select>

            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="filled"
              label={t("Property Category(A/B)")}
              name="BBDPropertyCategory"
              value={formData.BBDPropertyCategory}
              onChange={handleChange}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title={t("ownerNameInfo")}>
                    <IconButton color="primary">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="filled"
              label={t("streetName")}
              name="streetName"
              value={formData.streetName}
              onChange={handleChange}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title={t("streetNameInfo")}>
                    <IconButton color="primary">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Grid>
             </Grid>

             

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
        
      <Grid container spacing={3}>
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
                     
                        <FormControl fullWidth sx={{ marginBottom: 3 }}>
                          <InputLabel>< LabelWithAsterisk text={t("RelationshipType")} /></InputLabel>
                          <Select
                            name="IDENTIFIERTYPEID"
                            value={formData.IDENTIFIERTYPEID}
                            onChange={handleChange}
                            sx={{backgroundColor: "#ffff" }}
                          >
                            <MenuItem value="">--Select--</MenuItem>
                            {tableIdentifier.map((item) => (
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
                          variant="outlined"
                          InputProps={{
                           
                            style: { backgroundColor:  "#ffff" },
                          }}
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
        {/* <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("Slno.")}</TableCell> */}
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("OwnerName")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>   {t("Father/Mother/Husband/SpouseName")}</TableCell>
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
              <TableCell>{row.OBJECTIONNAME_EN}</TableCell>
              <TableCell>{row.IDENTIFIERNAME_EN}</TableCell>
              <TableCell>{row.OBJECTIONADDRESS_EN}</TableCell>
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
<br></br>
          
<Grid item xs={12} sm={6}>
      <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center" flexDirection="column" textAlign="center" mb={2}>
          <Typography variant="h5" color="primary" gutterBottom>
          {t("Upload detailed objection in writing with your signature, name, mobile number, and address")}
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
<Grid item xs={12} sm={6}>
  <Box display="flex" alignItems="center">
    <Typography variant="body1" sx={{ ml: 1, mr: 2 }}>
      Is Communication Address different than Aadhar Address:
    </Typography>
    <FormControl component="fieldset" sx={{ml: 1, mb: 0.5 }}>
      <RadioGroup
        row
        name="communicationAddress"
        value={formData.communicationAddress}
        onChange={handleChange}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <FormControlLabel value="Y" control={<Radio disabled={!isEditable} />} label={t("Yes")} sx={{ mr: 4 }} />
        <FormControlLabel value="N" control={<Radio disabled={!isEditable} />} label={t("No")} />
      </RadioGroup>
    </FormControl>
  </Box>
</Grid>

{isCommunicationAddress &&
<Grid container spacing={2}>
 
<Grid item xs={4} sm={4}>
                  <TextField
                    fullWidth
                    label={<LabelWithAsterisk text={t('doorPlotNo')} />}
                    name="doorno"
                    value={formData.doorno}
                    onChange={handleChange}
                    variant={isEditable ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditable,
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
                    
                    }}
                  />
                </Grid>
                <Grid item xs={4} sm={4}>
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

                <Grid item xs={4} sm={4}>
                  <TextField
                    fullWidth
                   label={<LabelWithAsterisk text={t('areaLocality')} />}
                    name="areaorlocality"
                    value={formData.areaorlocality}
                    onChange={handleChange}
                 //   onBlur={handleBlur}
                  
                    variant={isEditable ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditable,
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
                     
                    }}
                  />
                </Grid>
                <Grid item xs={4} sm={4}>
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
}
              <br></br>
              <br></br>

              <Grid item xs={12} sm={6}>
              <InputLabel>Reason /Basis for Objection to not issue ekhata<span style={{ color: 'red' }}> *</span>
              </InputLabel>
                  <FormControl
                    fullWidth

                   // error={touched.streetid && !!errors.streetid}
                    sx={{ marginBottom: 3 }}
                 //   className={touched.streetid && !!errors.streetid ? 'shake' : ''}
                  >
                    
                    <Select
                      name="ReasonCategory"
                      value={formData.ReasonCategory}
                      onChange={handleChange}
                      inputProps={{ readOnly: !isEditable }}
                    //  onBlur={handleBlur}
                      sx={{ backgroundColor: !isEditable ? '' : "#ffff" }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {/* {tableData.map((item) => (
                        <MenuItem key={item.STREETID} value={item.STREETID}>
                          {item.STREETNAME1}
                        </MenuItem>
                      ))} */}
                       <MenuItem value="1">It is Govt/BBMP land</MenuItem>
                       <MenuItem value="2">Court Order</MenuItem>
                       <MenuItem value="3">Latest Registration/Sale Deed in another person name</MenuItem>
                       <MenuItem value="4">Inheritance /Succession Dispute</MenuItem>
                       <MenuItem value="5">Others(specify)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {formData.ReasonCategory === "3"&&
                <Grid item xs={6} sm={3}>
          <FormControl component="fieldset" sx={{ marginBottom: 3 }}>
            <RadioGroup row name="TypeOfUpload" value={formData.TypeOfUpload} onChange={handleChange}>
              <FormControlLabel value="RegistrationNumber" control={<Radio />} label={t("RegistrationNumber")} />
              <FormControlLabel value="OldRegistrationNumber" control={<Radio />} label={
                 <>
                {t("oldRegistrationNumber")}{" "}
                {/* <Typography component="span" style={{ color: 'red' }}>
        {t("CaseRefertoARO")}
      </Typography> */}
                </>
              }
                />
              {/* <FormControlLabel value="DoNotHaveRegistrationDeed" control={<Radio />} label={
    <>
      {t("DoNotHaveRegistrationDeed")}{" "}
      <Typography component="span" style={{ color: 'red' }}>
        {t("CaseRefertoARO")}
      </Typography>
    </>
  }
/> */}
            </RadioGroup>
          </FormControl>
          
        </Grid>
}
        {formData.TypeOfUpload === "RegistrationNumber" && formData.ReasonCategory === "3" && (
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={8}>
              <TextField
                fullWidth

                label={< LabelWithAsterisk text={t("RegistrationNumber")} />}
                placeholder='NMG-X-XXXX-XXXX-XX'
                name="RegistrationNumber"
                value={formData.RegistrationNumber}
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
      onClick={handleKaveriDocumentData}
      style={{ height: '100%' }}
    >
      {t("KaveriDocumentData")}
    </Button>
  
  </Box>
</Grid>

           
          </Grid>
        )}
        {(formData.TypeOfUpload === "RegistrationNumber" && formData.ReasonCategory === "3" && KAVERI_DOC_DETAILS.length > 0 && KAVERI_PROP_DETAILS.length > 0 && KAVERI_PARTIES_DETAILS.length > 0) &&
          <TableContainer component={Paper} style={{ marginTop: 16 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="h6" >{t("DocumentInformation")}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>{t("ApplicationNumber")}</strong></TableCell>
                  <TableCell><strong>{t("RegistrationDatetime")}</strong></TableCell>
                  <TableCell><strong>{t("NatureDeed")}</strong></TableCell>
                  <TableCell><strong>{t("FinalRegistrationNumber")}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {KAVERI_DOC_DETAILS.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      {t("")}  No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  KAVERI_DOC_DETAILS.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.APPLICATIONNUMBER || 'N/A'}</TableCell>
                      <TableCell>{row.REGISTRATIONDATETIME || 'N/A'}</TableCell>
                      <TableCell>{row.NATUREDEED || 'N/A'}</TableCell>
                      <TableCell>{row.REGISTRATIONNUMBER || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Property Info Table */}
            <TableContainer component={Paper} style={{ marginTop: 16 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="h6">{t("PropertyInformation")}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>{t("PropertyID")}</strong></TableCell>
                    <TableCell><strong>{t("DocumentID")}</strong></TableCell>
                    <TableCell><strong>{t("VillageName")}</strong></TableCell>
                    <TableCell><strong>{t("SRONAME")}</strong></TableCell>
                    <TableCell><strong>{t("HOBLI")}</strong></TableCell>
                    <TableCell><strong>{t("ZoneName")}</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {KAVERI_PROP_DETAILS.map((property, index) => (


                    <TableRow key={index}>
                      <TableCell>{property.PROPERTYID || 'N/A'}</TableCell>
                      <TableCell>{property.DOCUMENTID || 'N/A'}</TableCell>
                      <TableCell>{property.VILLAGENAME || 'N/A'}</TableCell>
                      <TableCell>{property.SRONAME || 'N/A'}</TableCell>
                      <TableCell>{property.HOBLINAME || 'N/A'}</TableCell>
                      <TableCell>{property.ZONENAME || 'N/A'}</TableCell>
                    </TableRow>
                  )
                  )}


                </TableBody>
              </Table>
            </TableContainer>


            {/* Party Info Table */}
            <TableContainer component={Paper} style={{ marginTop: 16 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography variant="h6">{t("PartyInformation")}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>

                    <TableCell><strong>{t("PartyName")}</strong></TableCell>

                    <TableCell><strong>{t("Address")}</strong></TableCell>
                    <TableCell><strong>{t("Id ProofType")}</strong></TableCell>
                    <TableCell><strong>{t("Id ProofNumber")}</strong></TableCell>
                    <TableCell><strong>{t("Party Type")}</strong></TableCell>
                    <TableCell><strong>{t("Admission Date")}</strong></TableCell>
                    {/* <TableCell><strong>{t("EKYC Owner Name")}</strong></TableCell>
                      <TableCell><strong>{t("Name Match Status")}</strong></TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {KAVERI_PARTIES_DETAILS.map((party, index) => (

                    <TableRow key={index}>

                      <TableCell>{party.PARTYNAME || 'N/A'}</TableCell>

                      <TableCell>{party.PARTYADDRESS || 'N/A'}</TableCell>
                      <TableCell>{party.IDPROOFTYPE || 'N/A'}</TableCell>
                      <TableCell>{MaskingValue({value:party.IDPROOFNUMBER,maskingLength:4}) || 'N/A'}</TableCell>
                      <TableCell>{party.PARTYTYPE || 'N/A'}</TableCell>
                      <TableCell>{party.ADMISSIONDATE || 'N/A'}</TableCell>
                      {/* <TableCell>{party.PARTYTYPE === "Claimant" ? party.EKYC_OWNERNAME : 'N/A'}</TableCell>
                            <TableCell>{party.PARTYTYPE === "Claimant" ? party.NAMEMATCH_SCORE > 60 ? "Matched" : "Not Matched" || 'N/A': 'N/A'}</TableCell> */}
                    </TableRow>
                  )
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          </TableContainer>

        }

        {formData.TypeOfUpload === "OldRegistrationNumber" && formData.ReasonCategory === "3" &&

          <ObjectionDocumentUploadPage />
        }
        {((formData.ReasonCategory === "1") || (formData.ReasonCategory === "2") || (formData.ReasonCategory === "4")) &&
              <Grid item xs={12} sm={6}>
              <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box display="flex" alignItems="center" flexDirection="column" textAlign="center" mb={2}>
                  <Typography variant="h6" color="primary" gutterBottom>
                  {t("Upload file with relevant documents")}
                  </Typography>
                  <Divider sx={{ width: '100%', mb: 2 }} />
    
                  
    
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 2, mb: 2, px: 3, py: 1 }}
                  >
                    {t("Uploadfile")}
                    <VisuallyHiddenInput type="file" accept=".pdf" onChange={handleReasonFileChange} />
                  </Button>
    
                  {selectedReasonFile && (
                    <Box display="flex" alignItems="center" justifyContent="center" mt={2} sx={{ color: 'text.secondary' }}>
                      <Typography variant="h6">{selectedReasonFile.name}</Typography>
                      <Button color="error" onClick={handleFileReasonDelete} sx={{ ml: 2 }}>
                        {t("Delete")}
                      </Button>
                    </Box>
                  )}
    
                  <Typography variant="body2" sx={{ mt: 1, color: '#df1414',fontSize:'1rem' }}>
                    {t("MaximumFileSizeMB")}
                  </Typography>
                </Box>
    
                {formData.ReasonExtension && (
                  <Box display="flex" alignItems="center" justifyContent="center" mt={2} sx={{ p: 1, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                    <Typography variant="h6" color="textSecondary" sx={{ mr: 1 }}>
                      {t("Uploaded Document:")}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mr: 2 }}>
                      {formData.ReasonExtension}
                    </Typography>
                    <IconButton onClick={() => handleDownload(formData.ReasonDocument, formData.ReasonExtension)}>
                      <GetAppIcon color="primary" />
                    </IconButton>
                  </Box>
                )}
              </Card>
            </Grid>
}
<br></br>
{formData.ReasonCategory === "5"&&
<Grid item xs={14} sm={7}>

          <Box display="flex" alignItems="center">
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Please State the Reason :
                    </Typography>
                    <TextField
                    
                    multiline 
                    label={<LabelWithAsterisk text={"Reason"} />}
                    name="ReasonDetails"
                    value={formData.ReasonDetails}
                    onChange={handleChange}
                    sx={{ ml: 1, width: '50%' }} 
                    variant={isEditable ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditable,
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
                      
                    }}
                  />

                  </Box>
</Grid>
}
<br></br>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" gap={2}>
                  <Button variant="contained" color="primary" onClick={handleBack}>
                    {t("Previous")}
                  </Button>
                  {/* <Button variant="contained" color="primary" onClick={handleAddressEdit}>
                      {t("Edit")}
                    </Button> */}
                  <Button variant="contained" color="success" onClick={handleFinalSubmit} >
                  Submit
                  </Button>
                </Box>
              </Grid>
      </Box>
    </Container>
  );
};


export default ObjectorsPage;
