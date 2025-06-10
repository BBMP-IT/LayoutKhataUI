import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, CircularProgress, Tooltip, IconButton, 
  FormControl,  MenuItem, Select, InputLabel, Table, TableBody, TableCell, TableContainer,  TableRow, Paper,Radio
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GetAppIcon from '@mui/icons-material/GetApp';
import { styled } from '@mui/material/styles';
import ViewSample from '../components/ViewSample';
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
const UploadECPage = () => {
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
    RegistrationNumber:"",
    RequestId:"",
    ECDocumentNumber:"",
   
    isSaleDeed:"N",

    NewECDocumentExtension:"",
    NewECDocument:""
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [KAVERIEC_PROP_DETAILS, setKAVERIEC_PROP_DETAILS] = useState([]);
  const [KAVERIEC_PARTIES_DETAILS, setKAVERIEC_PARTIES_DETAILS] = useState([]);
  const [RegistationNumber,setRegistrationNumber] = useState("");
  const [RegistationDate,setRegistationDate] = useState("")
  const [selectedOldFile, setSelectedOldFile] = useState(null);
  const [IsNewData,setISNewData] = useState(false)
  const [IsAllowECDocumnet,setIsAllowECDocument] = useState(false)
  const [IsOtherOptionSelected,setIsOtherOptionSelected] = useState(false)
  const [TypofImage,setTypofImage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
  const handleECPropertyData = async () => {

    debugger
    
        
        if (formData.ECDocumentNumber.length === 0) {
          setTimeout(() => {
            toast.error(`${t("enterEcDocumentNumber")}`)
          }, 100)
          return
        }
    
        try {
          setLoading(true)
    debugger
    let loginId = localStorage.getItem('SETLOGINID');
    try {
        loginId = JSON.parse(loginId);
    } catch (e) {
        loginId = loginId || ""; 
    }
    
    console.log(loginId.toString());
    
      const data = {
        
          ecNumber: formData.ECDocumentNumber,
          registrationNoNumber: RegistationNumber,
          propertyCode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
          loginId: loginId.toString(), 
        registeredDateTime:RegistationDate ? RegistationDate:null,
        registrationType:IsNewData === true ? 1 : 2
      }    
  let  response = await axiosInstance.post(`KaveriAPI/GetKaveriEC`,data)
          const result = response.data;
          debugger
          if (result.success) {
            
              formData.RequestId = result.requestId;
              localStorage.setItem("Reqid", result.requestId);
              fetchData();
              setTimeout(() => {
                toast.success("Details Fetched Success", {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
              }, 500)
            }
          else {
    
            setLoading(false)
            setTimeout(() => {
              toast.error(result.message)
            }, 100)
            return
          }
    
        }
        catch (error) {
          toast.error(`${t("errorFetchingEcData")}` + error, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          console.log(error)
          setTimeout(() => {
            navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
          }, 1000);
        }
      }
 
 
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    debugger
    let response2 = null;
    let Reqid = "0";
       Reqid = JSON.parse(localStorage.getItem('Reqid'));
  if(Reqid === undefined || Reqid === null || Reqid === ""){
     Reqid = "0";
  }
  let propertycode = JSON.parse(localStorage.getItem('SETPROPERTYCODE'))

  let book_app_no = "0"
  book_app_no = JSON.parse(localStorage.getItem('BOOKS_PROP_APPNO')) || "0"
    try {
      const response = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_BBD_DRAFT_React?ULBCODE=555&Propertycode=${JSON.parse(localStorage.getItem('SETBOOKPROPERTYCODE'))}&Page=ADDRESS`);
   
       response2 = await axiosInstance.get(`KaveriAPI/GET_KAVERI_UPLOAD_DETAILS?ReqId=${Reqid}&Propertycode=${propertycode}&BOOKS_APP_NO=${book_app_no}`);
    
      const {Table:KaveriDOCDetails =[],Table1:KaveriOLDDocDetails =[],Table2:KaveriECDOCDetails=[],Table3:KaveriECOwnerDetails=[]} = response2.data;
      debugger
        if(KaveriDOCDetails.length > 0){
          setISNewData(true)
          setIsAllowECDocument(KaveriECDOCDetails.length > 0 ?(KaveriECDOCDetails[0].STATUS === "REC" || KaveriECDOCDetails[0].STATUS === "APR") ? true : false : false );
          setRegistrationNumber(KaveriDOCDetails[0].REGISTRATIONNUMBER);
          setRegistationDate(KaveriDOCDetails[0].REGISTRATIONDATETIME);
        }
        else if(KaveriOLDDocDetails.length > 0) {
          setIsAllowECDocument(KaveriECDOCDetails.length > 0 ?( KaveriECDOCDetails[0].STATUS === "REC" || KaveriECDOCDetails[0].STATUS === "APR") ? true : false : false);
          setRegistrationNumber(KaveriOLDDocDetails[0].ORDERNUMBER);
          setRegistationDate(KaveriOLDDocDetails[0].ORDERDATE);
          setISNewData(false);
        }
        else if(KaveriDOCDetails.length === 0 && KaveriOLDDocDetails.length === 0) {
          setIsOtherOptionSelected(true);
          setISNewData(false);
          setIsAllowECDocument(true);
        }
        
        setKAVERIEC_PROP_DETAILS(KaveriECDOCDetails.length > 0 ? KaveriECDOCDetails : [])
        setKAVERIEC_PARTIES_DETAILS(KaveriECOwnerDetails.length > 0 ? KaveriECOwnerDetails : [])
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
        RequestId:KaveriECDOCDetails.length > 0 ? KaveriECDOCDetails[0].REQID: 0,
        NewECDocument:KaveriECDOCDetails.length > 0 ? KaveriECDOCDetails[0].OLD_KAVERI_SCAN_DOC: "",
        NewECDocumentExtension:KaveriECDOCDetails.length > 0 ? KaveriECDOCDetails[0].OLD_KAVERI_SCAN_DOCUMENT_NAME: ""
      });
      
      
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
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleNameFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024;
    if (file && file.size > maxSize) {
      toast.error(`${t('fileSizeExceeded')}`);
      e.target.value = null;
      setSelectedOldFile(null);
      return;
    }
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    if (!['pdf'].includes(fileExtension)) {
      toast.error(`${t("selectPdfFileOnly")}`);
      e.target.value = null;
      setSelectedOldFile(null);
      return
    }
  //  setfileExtension(fileExtension);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedOldFile(file);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleFileNameDelete = () => {
    setSelectedOldFile(null);
  //  setfileExtension('');
  }
  
  
  const handleBack = () => {
   
    localStorage.removeItem("Reqid");
    localStorage.removeItem("SETPROPERTYCODE");
    localStorage.removeItem("SETPROPERYID");
    localStorage.removeItem("BOOKS_PROP_APPNO")
    localStorage.removeItem("SETBOOKPROPERTYCODE")
    navigate("/PropertyList");
  }
 
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
      try {
        if(KAVERIEC_PROP_DETAILS.length === 0){
          toast.error("Please Verify the EC Document First")
          return false
         }
         if(IsNewData === false){
          if (selectedOldFile !== null) {
            propertyDocumentName = await getPropertyphoto(selectedOldFile);
          }
          if(propertyDocumentName === "" || propertyDocumentName === undefined ||propertyDocumentName === null)
            {
              if(formData.NewECDocument === "" || formData.NewECDocument === undefined || formData.NewECDocument === null){
            toast.error("Please Upload the EC Document");
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
    

  
  const handleFinalSubmit = async (e) => {
    debugger
    if (e.key === 'Enter') {
      e.preventDefault();
    }
       
    let propertyDocumentName = null;
 
   
      
      let IsValidation = await handleValidation() 
      
      if(IsValidation){ 
     
      debugger
      if(formData.NewECDocument !== "" && formData.NewECDocument !== undefined && formData.NewECDocument !== null){
        propertyDocumentName =  formData.NewECDocument;
      }
      if(selectedOldFile !== null){
       
          propertyDocumentName = await getPropertyphoto(selectedOldFile);
        if(propertyDocumentName === "" || propertyDocumentName === undefined || propertyDocumentName === null){
          
          toast.error("Please Upload a Valid EC Document")
          
          return
        }
        }
        
        setLoading(true);
       
      
         
        let loginID = JSON.parse(localStorage.getItem('SETLOGINID')).toString();
       let propcode = JSON.parse(localStorage.getItem('SETPROPERTYCODE')).toString();
       const data = {
          propertycode: propcode,
          reqId: formData.RequestId,
          kaveriECDoc: propertyDocumentName,
          loginId: loginID ,
          kaveriDocName:selectedOldFile !== null ? selectedOldFile.name : formData.NewECDocumentExtension || "No PDF Required",
        }
      
      try {
      let response3 =  await axiosInstance.post('KaveriAPI/INS_KAVERI_API_ECDOC_SUBMIT', data
        )
        if(response3.data.Table[0].CORRECTION_COUNT > 0){
          setTimeout(() => {
            toast.error(`${t("This Property is in Correction, after Correction approval by ARO then only you will Be Able to Submit EC.")}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }, 500)
          setLoading(false);
          return
         
        }
        setTimeout(() => {
        toast.success(`${t("Details Submitted Successfully")}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }, 500)
       // setIsEditable(false);
 //   await   fetchData();
 setLoading(false);
    //handleBack();
    navigate("/")
     
    setLoading(false);
        // localStorage.setItem("userProgress", 4);
      } catch (error) {
        console.log(error)
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
    
  const viewSample = (TypeOfImage) => {
    if(TypeOfImage === "DEED"){
      setTypofImage("DEED")

    }else {
      setTypofImage("EC")

    }
    setIsDialogOpen(true);
  }
  const handleEcDownload = async () => {
    if (formData.ECDocumentNumber.length === 0) {
      setTimeout(() => {
        toast.error(`${t("enterEcDocumentNumber")}`)
      }, 100)
      return
    }
    try {
      const response = await axiosInstance.post(
        `KaveriAPI/GetKavBase64?RegistrationNoECNumber=${formData.ECDocumentNumber}`,
        null,
        { responseType: 'blob' } // Specify response type as blob
      );
  
      // Create a blob from the response
      const fileBlob = new Blob([response.data], { type: response.headers['content-type'] });
  
      // Create a URL for the blob
      const fileUrl = URL.createObjectURL(fileBlob);
  
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = fileUrl;
  
      // Set the file name for download (you can customize this)
      link.download = `${formData.ECDocumentNumber}.pdf`; // Change to desired file name and extension
  
      // Append the link to the document, trigger click, and remove the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Revoke the blob URL after download
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }

  }
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  



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
        <ViewSample
        open={isDialogOpen}
        onClose={handleCloseDialog}
        TypofImage={TypofImage}
      />
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
Upload EC Document
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
      {IsNewData === false  && IsOtherOptionSelected === false &&(
<Grid item xs={12} sm={6}>
      <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center" flexDirection="column" textAlign="center" mb={2}>
          <Typography variant="h5" color="primary" gutterBottom>
          {t("Upload EC Document")}
         
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

          {selectedOldFile && (
            <Box display="flex" alignItems="center" justifyContent="center" mt={2} sx={{ color: 'text.secondary' }}>
              <Typography variant="h6">{selectedOldFile.name}</Typography>
              <Button color="error" onClick={handleFileNameDelete} sx={{ ml: 2 }}>
                {t("Delete")}
              </Button>
            </Box>
          )}
          
          <Typography variant="caption" sx={{ mt: 1, color: '#df1414',fontSize:'1rem'  }}>
            {t("MaximumFileSizeMB")}
          </Typography>
        </Box>

        {formData.NewECDocumentExtension && (
          <Box display="flex" alignItems="center" justifyContent="center" mt={2} sx={{ p: 1, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
            <Typography variant="h6" color="InfoText" sx={{ mr: 1 }}>
              {t("Uploaded Document:")}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mr: 2 }}>
              {formData.NewECDocumentExtension}
            </Typography>
            <IconButton onClick={() => handleDownload(formData.NewECDocument, formData.NewECDocumentExtension)}>
              <GetAppIcon color="primary" />
            </IconButton>
          </Box>
        )}
      </Card>
    </Grid>
      )}
<br></br>
<br></br>
<>
        <Typography variant='h6'>{t("KaveriMessage1")}</Typography>

        <br></br>
        <Typography>{t("KaveriMessage2")}</Typography>
        <br></br>
        <Typography>{t("KaveriMessage3")}</Typography>
        <br></br>
        <Typography>{t("KaveriMessage4")}</Typography>
        <br></br>
        <Typography>{t("KaveriMessage5")}</Typography>
        <br></br>
        {IsNewData === true &&  IsOtherOptionSelected === false &&
        <>
        <Box display="flex" justifyContent="center" gap={2}>
<Typography variant='h6'>After 2004 Registration Deed No :- {RegistationNumber}</Typography>
</Box>

<Box display="flex" justifyContent="center" gap={2}>
<Typography variant='h6'>Registation Deed Date  :- {RegistationDate}</Typography>
</Box>
<br></br>
</>

}
{IsNewData  === false &&  IsOtherOptionSelected === false &&
        <>
<Box display="flex" justifyContent="center" gap={2}>
<Typography variant='h6'>Before 2004 Registation Deed No :- {RegistationNumber}</Typography>
</Box>
<Box display="flex" justifyContent="center" gap={2}>
<Typography variant='h6'>Before 2004 Registation Date :- {RegistationDate}</Typography>
</Box>
<Box display="flex" justifyContent="center" gap={2}>
<Typography variant='h6'  sx={{ color: 'red', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '0.9rem' }}>Note :- If you are unable to fetch EC Details .Please Contact your Respective ARO .</Typography>
</Box>
<br></br>
</>
}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <TextField
              fullWidth

              label={< LabelWithAsterisk text={t("ECDocumentNumber")} />}
              name="ECDocumentNumber"
              placeholder='NMG-EC-A-XXXXXX-XXXX-XX'
              value={formData.ECDocumentNumber}
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

          <Grid item xs={6} style={{ display: 'flex', alignItems: 'center' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
          {IsAllowECDocumnet === false &&
            <Button
              variant="contained"
              color="success"
              onClick={handleECPropertyData}
              style={{ height: '100%' }}
            >
              {t("FetchECData")}
            </Button>
}
            <Button color="primary" onClick={()=>viewSample("EC")}>
            {t("View Sample")}
    </Button>
    <Button color="primary" onClick={()=>handleEcDownload()}>
         Download Physical EC Document
    </Button>
  </Box>
          </Grid>
        </Grid>
        <TableContainer component={Paper}>
          {KAVERIEC_PROP_DETAILS.length === 0 ? (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography>{t("Nodataavailable")}</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableBody>
                <TableRow>

                  <TableCell>
                    <Typography variant="subtitle1"><strong>{t("District Name")}</strong></Typography>
                    <Typography variant="body2">
                      {KAVERIEC_PROP_DETAILS[0].DISTRICTNAME || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle1"><strong>{t("Taluka Name")}</strong></Typography>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                      {KAVERIEC_PROP_DETAILS[0].TALUKANAME || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle1"><strong>{t("Village Name")}</strong></Typography>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                      {KAVERIEC_PROP_DETAILS[0].VILLAGENAME || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1"><strong>{t("Hobli Name")}</strong></Typography>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                      {KAVERIEC_PROP_DETAILS[0].HOBLINAME || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1"><strong>{t("Article Name")}</strong></Typography>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                      {KAVERIEC_PROP_DETAILS[0].ARTICLENAME || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1"><strong>{t("Latest Registration Number")}</strong></Typography>
                    <Typography variant="body2">{KAVERIEC_PROP_DETAILS[0].LATEST_REGISTRATIONNO || 'No document summary available'}</Typography>
                  </TableCell>
                  <TableCell>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle1"><strong>{t("Is Latest Registration Number")}</strong></Typography>
                    <Typography variant="body2">{KAVERIEC_PROP_DETAILS[0].IS_LATEST_REGISTRATIONNO === 'Y' ? "Yes" : "No" || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1"><strong>{t("Registration Date")}</strong></Typography>
                    <Typography variant="body2">
                      {KAVERIEC_PROP_DETAILS[0].EXECUTIONDATE
                        ? new Date(KAVERIEC_PROP_DETAILS[0].EXECUTIONDATE).toLocaleString()
                        : 'No execution date available'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1"><strong>{t("Executant Names")}</strong></Typography>
                    {KAVERIEC_PARTIES_DETAILS && KAVERIEC_PARTIES_DETAILS.length > 0 ? (
                      KAVERIEC_PARTIES_DETAILS.map((item, index) => (
                        <Typography key={index} variant="body2">{item.ISCLAIMANTOREXECUTANT === 'E' ? item.OWNERNAME : ""}</Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">No executants available</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                  </TableCell>
                  <TableCell>
                  </TableCell>
                  <TableCell>
                  </TableCell>
                  <TableCell>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle1"><strong>{t("Claimant Names")}</strong></Typography>
                    {KAVERIEC_PARTIES_DETAILS && KAVERIEC_PARTIES_DETAILS.length > 0 ? (
                      KAVERIEC_PARTIES_DETAILS.map((item, index) => (
                        <Typography key={index} variant="body2">{item.ISCLAIMANTOREXECUTANT === 'C' ? item.OWNERNAME : ""}</Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">No Claimants available</Typography>
                    )}
                  </TableCell>

          
                </TableRow>
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <br></br>
        <br></br>
        <br></br>
</>
<br></br>
{IsAllowECDocumnet && IsOtherOptionSelected === false &&
<Box display="flex" justifyContent="center" gap={2}>
<Typography variant='h6'>EC Submitted Successfully !!</Typography>
</Box>
}
{IsOtherOptionSelected  &&
<Box display="flex" justifyContent="center" gap={2}>
<Typography variant='h6'>No Registration Deed Available For this !!</Typography>
</Box>
}
<br></br>

              <Grid item xs={12}>
             
                <Box display="flex" justifyContent="center" gap={2}>
              
                  <Button variant="contained" color="primary" onClick={handleBack}>
                    {t("Previous")}
                  </Button>
                  {IsAllowECDocumnet === false &&
                  <Button variant="contained" color="success" onClick={handleFinalSubmit} >
                  Submit
                  </Button>
}
                </Box>
              </Grid>
      </Box>
    </Container>
  );
};


export default UploadECPage;
