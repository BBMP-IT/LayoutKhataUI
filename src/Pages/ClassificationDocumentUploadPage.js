import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, Tooltip, IconButton,
  FormControl, MenuItem, Select, InputLabel, FormHelperText,FormLabel,RadioGroup,FormControlLabel,Radio,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/en-gb';
import DisclaimerDialog from '../components/Disclamer';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import '../components/Shake.css';
import LabelWithAsterisk from '../components/LabelWithAsterisk'
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

const ClassificationDocumentUploadPage = () => {

  const [formData, setFormData] = useState({
    DocumentType: '',
    documentregistereddate: "",
    DocumentDetails: '',
    DocumentNumber: '',
    PropertyClasssficationAsperBooks: "",
    PropertyClassification: "",
    AKatha: "",
    propertyType: "",
    isDocumentAvailable:"DocumentAvailable"
  });
  const { t } = useTranslation();
  const validationSchema = Yup.object().shape({
    DocumentType: Yup.string().required(`${t('documentTypeRequired')}`),
  //  DocumentNumber: Yup.string().required(`${t('documentNumberRequired')}`),
    //   AKatha: Yup.string().required('This is required').test('not-zero', 'A Katha Claim cannot be Select', value => value !== "0")
  });
  const [tableData, setTableData] = useState([
  ]);
  const navigate = useNavigate();
  const [tablesdata2, setTablesData2] = useState([]);
  const [MasterTableData, setMasterTableData] = useState([]);
  const [MasterAkathaTableData,setMasterAkathaTableData]= useState([])
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileExtension, setfileExtension] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [isHaveDocument,setHaveDocument] = useState(false);
  const [DOnothaveanyDocument,setDonotHaveAnyDocument] = useState(false)
  const [IsDocumentAvailable,setIsDocumentAvailable] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClassificationEditable, setIsClassificationEditable] = useState(false);
  const handleDateChange = (date) => {
    debugger
    // let newdate = new Date();
    // newdate = date;
    setSelectedDate(date);
  };
  const handleAkathaDropdownValueChange = async (e) => {
debugger
    try {
      const { name, value } = e.target;
      let updatedClassification = "";

      if (name === "AKatha") {

        if (value !== "") {
          if (value !== 51) {
            updatedClassification = "4";
          } else {
            updatedClassification = "5";
          }
        } else {
          updatedClassification = "0";
        }
       if(value === 57){
        setDonotHaveAnyDocument(true)
       }else{
        setDonotHaveAnyDocument(false)
       }

        const response = await axiosInstance.get(`BBMPCITZAPI/GET_NPM_MST_CLASS_DOCUMENT_BY_CATEGORY_SUBCLASS?PROPERTYCATEGORYID=${formData.propertyType}&CLASSIFICATIONID=1&SUBCLASSIFICATIONID=${value}`)
        const { Table } = response.data;
        setTablesData2(Table.length > 0 ? Table : []);
      }
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        PropertyClassification: updatedClassification,
      }));
    } catch (error) {
      toast.error(`${t("errorSavingData")}`, error, {
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

  };

  const getPropertyphoto = (selectedFile) => {
    return new Promise((resolve, reject) => {
      if (!selectedFile) {
        resolve(''); // Return an empty string if no file is selected
        return;
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

  const handleChange = async (e) => {
debugger
    const { name, value } = e.target;
    debugger
    if(name === "DocumentType" || name === "isDocumentAvailable"){
      if(value === "26"){
        setIsEditable(true);
      }else {
        setIsEditable(false);
      }
      if(value === "243" || value === "DoNotHaveIt"){
      if(value === "DoNotHaveIt"){
        setIsDocumentAvailable(false)
      }
      else {
        setIsDocumentAvailable(true)
      }
          setHaveDocument(true)
       
        setSelectedFile(null)
        setfileExtension([])
        if(value !== "DoNotHaveIt"){
        setFormData({
          ...formData,
          documentregistereddate: "",
          DocumentNumber: "",
          DocumentDetails: "",
          DocumentType:value,
          isDocumentAvailable:"DoNotHaveIt",
        });
      }
      else {
        setFormData({
          ...formData,
          documentregistereddate: "",
          DocumentNumber: "",
          DocumentDetails: "",
          isDocumentAvailable:value,
        });
      }
        return
      }
      else {
        setHaveDocument(false)
        setIsDocumentAvailable(false)
        formData.isDocumentAvailable ="DocumentAvailable"
      }
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const fetchData = React.useCallback(async () => {
    
    try {
      const responeMaster = await axiosInstance.get('BBMPCITZAPI/GetMasterTablesData_React?UlbCode=555&Page=DOCUMENT_CLASSIFICATION_DETAILS');
      const response2 = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_BBD_DRAFT_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=DOCUMENT_CLASSIFICATION_DETAILS`);;
      const response3 = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_NCLTEMP_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=DOCUMENT_CLASSIFICATION_DETAILS`);

      const { Table1: BBDTable1 = [] } = response2.data;
      const { Table:MasterTable1 = [],Table1:MasterTable2 } = responeMaster.data;
      const { Table2: NCLTable2 = [], Table1: NCLTable1 = [] } = response3.data;
      setTableData(NCLTable2.length > 0 ? NCLTable2 : []);

      setMasterTableData(MasterTable1.length > 0 ? MasterTable1 : [])
      setMasterAkathaTableData(MasterTable2.length > 0 ? MasterTable2 : [])
      setFormData((prevFormData) => ({
        ...prevFormData,
        PropertyClasssficationAsperBooks: BBDTable1.length > 0 ? BBDTable1[0].PROPERTYCLASSIFICATIONID : "",
        PropertyClassification: NCLTable1.length > 0 ? NCLTable1[0].PROPERTYCLASSIFICATIONID : '',
        DocumentDetails: NCLTable1.length > 0 ? NCLTable1[0].SUBCLASSIFICATION === null ? "" : NCLTable1[0].SUBCLASSIFICATION : "",
        AKatha: NCLTable1.length > 0 ? NCLTable1[0].SUBCLASSIFICATIONID : "",
        propertyType: NCLTable1.length > 0 ? NCLTable1[0].PROPERTYCATEGORYID || "0" : "0",
      }));

      if (NCLTable1.length > 0) {
        if(NCLTable1[0].SUBCLASSIFICATIONID === 57){
          setDonotHaveAnyDocument(true)
        }
        else {
          setDonotHaveAnyDocument(false)
        }
        if (NCLTable1[0].SUBCLASSIFICATIONID === null) {
          setIsClassificationEditable(false)
         
        } else {
          setIsClassificationEditable(true)
          debugger
          const response = await axiosInstance.get(`BBMPCITZAPI/GET_NPM_MST_CLASS_DOCUMENT_BY_CATEGORY_SUBCLASS?PROPERTYCATEGORYID=${NCLTable1[0].PROPERTYCATEGORYID}&CLASSIFICATIONID=1&SUBCLASSIFICATIONID=${NCLTable1[0].SUBCLASSIFICATIONID}`)
          const { Table } = response.data;
          setTablesData2(Table.length > 0 ? Table : []);
        }
      }
    } catch (error) {
      toast.error(`${t("errorSavingData")}`, error, {
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



  },[navigate,t])
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024;
    if (file && file.size > maxSize) {
      toast.error(`${t('fileSizeExceeded')}`);
      e.target.value = null;
      setSelectedFile(null);
      return;
    }
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    if (!['pdf'].includes(fileExtension)) {
      toast.error(`${t("selectPdfFileOnly ")}`);
      e.target.value = null;
      setSelectedFile(null);
      return
    }
    setfileExtension(fileExtension);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleFileDelete = () => {
    setSelectedFile(null);
    setfileExtension('');
  }
  const onClassifySave = async () => {

    if (formData.AKatha === "0") {
      toast.error(`${t("selectKathaClaim")}`)
      return
    }
    if (String(formData.AKatha) === 51) {
      if (formData.DocumentDetails.length === 0) {
        toast.error(`${t("enterDocumentDetails")}`)
        return
      }
    }
    const data = {
      BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')),
      propertyCode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
      CLASSIFICATIONID: formData.PropertyClassification,
      SUBCLASSIFICATIONID: formData.AKatha,
      CREATEDBY: 'crc',
      SUBCLASSIFICATION: formData.AKatha === 51 ? formData.DocumentDetails : ""
    }
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([value]) => value !== '' && value !== null)
    );


    const queryString = new URLSearchParams(filteredData).toString();

    await axiosInstance.post(`BBMPCITZAPI/INS_NCL_PROPERTY_SUBCLASS?${queryString}`);

    
    setIsClassificationEditable(true);
    setIsEditable(false);
    toast.success(`${t("classificationSavedSuccess")}`);
    setTimeout(async () => {
      await fetchData();
    }, 500);
  }
  const isEditClassification = () => {
    setIsClassificationEditable(false);

  }
  const handleSubmit = async (e) => {
    let data = {};
    
    if(formData.DocumentType !== "243" && formData.isDocumentAvailable !== "DoNotHaveIt")
      {

    
    var propertyphoto2 = "";
    if (isEditable) {
      if (formData.DocumentDetails.length === 0) {
        toast.error(`${t("Please Provide Document Details")}`)
        return
      }
    }
    if (selectedFile) {
      propertyphoto2 = await getPropertyphoto(selectedFile);
    }
    if(formData.DocumentNumber.length === 0){
      toast.error(`${t("Please enter the Document Number")}`);
      return
    }

    if (!isClassificationEditable) {
      toast.error(`${t("saveClassificationBeforeUpload")}`);
      return
    }
    if (fileExtension.length === 0) {
      toast.error(`${t("uploadRequiredDocument")}`);
      return
    }
    if (selectedDate === null) {
      toast.error(`${t("provideRegisteredDate")}`);
      return
    }
    const today = new Date();
    if (new Date(selectedDate) > today) {
      toast.error(`${t("Document Registered Date cannot be greater than today")}`);
      return;
    }
    
     data = {
      documentnumber: formData.DocumentNumber,
      createdby: "crc",
      documentextension: fileExtension,
      propertycode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
      documentdetails: formData.DocumentDetails,
      scanneddocument: propertyphoto2, //bytes
      classificationid: formData.AKatha,
      subclassificationid: 0,
      documentdate: selectedDate,
      documenttypeid: formData.DocumentType,
      ulbcode: 555,
      p_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))
    }
  }
  else
   {
    if (!isClassificationEditable) {
      toast.error(`${t("saveClassificationBeforeUpload")}`);
      return
    }
     data = {
      documentnumber: null,
      createdby: "crc",
      documentextension: null,
      propertycode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
      documentdetails:  "Do Not Have it" ,
      scanneddocument: "", 
      documentdate: null,
      documenttypeid:  formData.DocumentType ,
      ulbcode: 555,
      p_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))
    }
  }
    try {
      await axiosInstance.post('BBMPCITZAPI/INS_NCL_PROPERTY_CLASS_DOC_ID_BBD_TEMP', data
      )

      
      await toast.success(`${t("Document Uploaded Successfully")}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(async () => {
        await fetchData();
        //    handleNavigation()
      }, 500);
    } catch (error) {
      await toast.error(`${t("errorSavingData")}` + error, {
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

  };
  const back = () => {
    if (formData.propertyType === 1) {
      navigate('/SiteDetails')
    } else if (formData.propertyType === 2) {
      navigate('/BuildingDetails')
    }
    else if (formData.propertyType === 3) {

      navigate('/MultiStoreyBuildingDetails')
    } else {

      toast.error(`${t("propertyTypeNotFound")}`);
      setTimeout(() => {
        navigate("/TaxDetails")
      }, 500);

    }
  }

  const handleDownload = (base64Data, fileExtension, documentdescription) => {
    const filename = `${documentdescription}.${fileExtension.toLowerCase()}`;

    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    const mimeType = mimeTypes[fileExtension.toLowerCase()] || 'application/octet-stream';


    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });


    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();


    URL.revokeObjectURL(link.href);
  };
  const handleDelete = async (row) => {

    const data = {
      PROPERTYCODE: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
      P_DOC_SCAN_ID: row.DOC_SCAN_ID,
      p_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))
    }
    const queryString = new URLSearchParams(data).toString();
    try {
      await axiosInstance.get(`BBMPCITZAPI/DEL_NCL_PROPERTY_CLASS_DOC_ID_BBD_TEMP?${queryString}`
      )
       await axiosInstance.get('BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_NCLTEMP?ULBCODE=555&P_BOOKS_PROP_APPNO=' + JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')) + '&Propertycode=' + JSON.parse(localStorage.getItem('SETPROPERTYCODE')) + '');
      
       toast.success(`${t("detailsDeletedSuccess")}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(async () => {
        await fetchData();
        //    handleNavigation()
      }, 500);

    } catch (error) {
      await toast.error(`${t("Error Deleting data!")}` + error, {
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
  };



  const handleOpenDialog = () => {
    if(DOnothaveanyDocument === false){
    if(tableData.length === 0){
      toast.error(`${t("Please Upload the Document")}`)
      return
    }
  }
  if (!isClassificationEditable) {
    toast.error(`${t("saveClassificationBeforeUpload")}`);
    return
  }
    localStorage.setItem("userProgress", 9);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleAgree = () => {
    // Save the agreement state here
  
    setIsDialogOpen(false);
    // Navigate to the next page or perform any action
    // navigate('/ClassificationDocumentUploadPage');
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  useEffect(() => {

    fetchData();

  }, [fetchData]);
  return (
    <Container maxWidth="xl">
      <ToastContainer />
      <DisclaimerDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onAgree={handleAgree}
      />
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 4, borderRadius: 2, mt: 8 }}>
        <Formik
          initialValues={formData}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={handleChange}
          enableReinitialize
        >
          {({ errors, touched, handleBlur }) => (
            <Form onKeyDown={handleKeyDown}>
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
                {t("PropertyClassificationDocuments")}
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth sx={{ marginBottom: 3 }}>
                    <InputLabel>{t("PropertyClassificationAsPerBooks")}</InputLabel>
                    <Select
                      name="PropertyClasssficationAsperBooks"
                      value={formData.PropertyClasssficationAsperBooks}
                      onChange={handleChange}
                      //  disabled
                      inputProps={{ readOnly: true }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {MasterTableData.map((item) => (
                        <MenuItem key={item.PROPERTYCLASSIFICATIONID} value={item.PROPERTYCLASSIFICATIONID}>
                          {item.PROPERTYCLASSIFICATION_EN}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth sx={{ marginBottom: 3 }}>
                    <InputLabel>{t("PropertyClassification")}</InputLabel>
                    <Select
                      name="PropertyClassification"
                      value={formData.PropertyClassification}
                      onChange={handleChange}
                      //  disabled
                      inputProps={{ readOnly: true }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {MasterTableData.map((item) => (
                        <MenuItem key={item.PROPERTYCLASSIFICATIONID} value={item.PROPERTYCLASSIFICATIONID}>
                          {item.PROPERTYCLASSIFICATION_EN}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl
                    fullWidth
                    error={touched.AKatha && !!errors.AKatha}
                    sx={{ marginBottom: 3 }}
                    className={touched.AKatha && !!errors.AKatha ? 'shake' : ''}

                  >
                    <InputLabel> <LabelWithAsterisk text={t("AKhathaclaimbasedon")} /> </InputLabel>
                    <Select
                      name="AKatha"
                      value={formData.AKatha}
                      onChange={handleAkathaDropdownValueChange}
                      onBlur={handleBlur}
                      sx={{ backgroundColor: isClassificationEditable ? '' : "#ffff" }}
                      inputProps={{ readOnly: isClassificationEditable }}
                    >
                      <MenuItem value="0">--Select--</MenuItem>
                      {MasterAkathaTableData.map((item) => (
                        <MenuItem key={item.SUBCLASSIFICATIONID} value={item.SUBCLASSIFICATIONID}>
                          {item.SUBCLASSIFICATION_EN}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {touched.AKatha && errors.AKatha ? errors.AKatha : ''}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}></Grid>
                
                {!isClassificationEditable ?
                  <Grid item xs={12} sm={4}><Button variant="contained" color="success" onClick={onClassifySave}>
                    {t("SaveClassificationDetails")}
                  </Button></Grid>
                  :
                  <Grid item xs={12} sm={4}><Button variant="contained" color="secondary" onClick={isEditClassification}>
                    {t("EditClassificationDetails")}
                  </Button></Grid>
                }
                  {!DOnothaveanyDocument &&
                  <>
                <Grid item xs={12} sm={4}></Grid>
              
                <Grid item xs={12} sm={4}>
                <FormControl
    fullWidth
    error={touched.DocumentType && !!errors.DocumentType}
    sx={{ marginBottom: 3 }}
    className={touched.DocumentType && !!errors.DocumentType ? 'shake' : ''}
  >
    <FormLabel>
      <LabelWithAsterisk text={t("DocumentType")} />
    </FormLabel>
    <RadioGroup
      name="DocumentType"
      value={formData.DocumentType}
      onChange={handleChange}
      onBlur={handleBlur}
    >
     
      {tablesdata2.map((item) => (
        <FormControlLabel
          key={item.DOCUMENTTYPEID}
          value={item.DOCUMENTTYPEID}
          control={<Radio />}
          label={item.DOCUMENTTYPEDESCRIPTION_EN}
        />
      ))}
    </RadioGroup>
    <FormHelperText>
      {touched.DocumentType && errors.DocumentType ? errors.DocumentType : ''}
    </FormHelperText>
  </FormControl>
                
                </Grid>

                {!IsDocumentAvailable && 
                <Grid item xs={12} sm={4}>
                <FormControl
    fullWidth
    error={touched.isDocumentAvailable && !!errors.isDocumentAvailable}
    sx={{ marginBottom: 3 }}
    className={touched.isDocumentAvailable && !!errors.isDocumentAvailable ? 'shake' : ''}
  >
    <FormLabel>
      <LabelWithAsterisk text={""} />
    </FormLabel>
    <RadioGroup
      name="isDocumentAvailable"
      value={formData.isDocumentAvailable}
      onChange={handleChange}
      onBlur={handleBlur}
    >
     <FormControlLabel
      value="DocumentAvailable"
      control={<Radio />}
      label={t("Document Available")}
    />
    <FormControlLabel
      value="DoNotHaveIt"
      control={<Radio />}
      label={t("Do not have it")}
    />
    </RadioGroup>
    <FormHelperText>
      {touched.isDocumentAvailable && errors.isDocumentAvailable ? errors.isDocumentAvailable : ''}
    </FormHelperText>
  </FormControl>
                </Grid>
}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    variant={isEditable ? "outlined" : "filled"}

                    label={isEditable ? <LabelWithAsterisk text={t("DocumentDetails")} /> : t("DocumentDetails")}

                    placeholder='Document Details'
                    name="DocumentDetails"
                    value={formData.DocumentDetails}
                    onChange={handleChange}
                    InputProps={{
                      readOnly: !isEditable,
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title={t("doorPlotNoInfo")}>
                          <IconButton color="primary">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                    <DatePicker
                      //label={<LabelWithAsterisk text={t("DocumentRegisteredDate")} />}
                      variant={isHaveDocument ? "outlined" : "filled"}

                      label={!isHaveDocument ? <LabelWithAsterisk text={t("DocumentRegisteredDate")} /> : t("DocumentRegisteredDate")}
                      name='documentregistereddate'
                      placeholder='dd-mm-yyyy'
                      value={selectedDate}
                      onChange={date => handleDateChange(date)}
                      disableFuture
                      sx={{ width: '100%',backgroundColor: isHaveDocument ? '' : "#ffff" }}
                     
                    disabled={isHaveDocument}
                    />
                  </LocalizationProvider>
                </Grid>



                {/* </Grid>

              <Grid container spacing={4}> */}



                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                   // label={<LabelWithAsterisk text={t("DocumentNumber :")} />}
                    variant={isHaveDocument ? "outlined" : "filled"}

                    label={!isHaveDocument ? <LabelWithAsterisk text={t("DocumentNumber :")} /> : t("DocumentNumber :")}
                    name="DocumentNumber"
                    value={formData.DocumentNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.DocumentNumber && !!errors.DocumentNumber ? 'shake' : ''}
                    error={touched.DocumentNumber && !!errors.DocumentNumber}
                    helperText={touched.DocumentNumber && errors.DocumentNumber}
                    InputProps={{
                      readOnly:isHaveDocument,
                      style: { backgroundColor: isHaveDocument ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title={t("nearestLandmarkInfo")}>
                          <IconButton color="primary">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      {t("EligibilityDocuments")}
                    </Typography>
                    <Button
                      component="label"
                      variant="contained"
                      disabled={isHaveDocument}
                      startIcon={<CloudUploadIcon />}
                      sx={{ ml: 2 }}
                      
                    >
                      {t("Uploadfile")}
                      <VisuallyHiddenInput type="file" accept=".pdf" onChange={handleFileChange} />
                    </Button>

                  </Box>
                  {selectedFile && (
                    <Box display="flex" alignItems="center" mt={2}>
                      <Typography variant="body1">{selectedFile.name}</Typography>
                      <Button color="error" onClick={handleFileDelete} sx={{ ml: 2 }}>
                        {t("Delete")}
                      </Button>
                    </Box>
                  )}
                  <Typography variant="body1" sx={{ ml: 1, color: '#df1414' }}>
                    {t("MaximumFileSizeMB")}
                  </Typography>
                </Grid>
                {!IsDocumentAvailable &&
                <Grid item xs={12} sm={4}>
                  </Grid>
          }
                <Grid item xs={12} sm={4}>
                  <Button variant="contained" color="success" type="submit" >
                    {t("AddDocument+")}
                  </Button>
                
                </Grid>
</>
}
              </Grid>
        
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {t("DocumentsUploaded")}
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>Sl No.</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Document")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("DocumentDetails")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("DocumentNumber :")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("DocumentRegistered Date")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("UploadedDocument")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Delete")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center">
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      tableData.map((row,index) => (
                        <TableRow key={index}>
                          <TableCell>{row.DOC_SCAN_ID}</TableCell>
                          <TableCell>{row.DOCUMENTTYPEDESCRIPTION}</TableCell>
                          <TableCell>{row.DOCUMENTDETAILS}</TableCell>
                          <TableCell>{row.DOCUMENTNUMBER}</TableCell>
                          <TableCell>{row.DOCUMENTDATE}</TableCell>
                          <TableCell>
                            {row.SCANNEDDOCUMENT ?
                              <IconButton onClick={() => handleDownload(row.SCANNEDDOCUMENT, "pdf", row.DOCUMENTTYPEDESCRIPTION)}>
                                <GetAppIcon color='primary' />
                              </IconButton>
                              :
                              ""
                            }
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Delete">
                              <IconButton color="secondary" onClick={() => handleDelete(row)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box display="flex" justifyContent="center" gap={2} mt={3}>
                <Button variant="contained" color="primary" onClick={back}>
                  {t("Previous")}
                </Button>

                <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                  {t("Finish")}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default ClassificationDocumentUploadPage;
