import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Box, Typography, Tooltip, IconButton,
  FormControl, MenuItem, Select, InputLabel,TableContainer,Paper,
  Table, TableBody, TableCell, TableHead, TableRow,  FormHelperText
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/en-gb';
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

const AmalgamationDocumentUploadPage = ({ setIsDocumentAdded1 }) => {

  const [formData, setFormData] = useState({
    DocumentType: '',
    documentregistereddate: "",
    DocumentDetails: '',
    DocumentNumber: '',
  });
  const { t } = useTranslation();
  
  const [tableData, setTableData] = useState([
  ]);
  const navigate = useNavigate();
  const [tablesdata2, setTablesData2] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileExtension, setfileExtension] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
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

    const { name, value } = e.target;
    if (name === "DocumentType") {
      if (value === 26) {
        setIsEditable(true);
      } else {
        setIsEditable(false);
      }
    }
    setFormData({
      ...formData,
      [name]: value
    });
  };


  const fetchData = React.useCallback(async () => {
    debugger
    try {
      const response1 = await axiosInstance.get('BBMPCITZAPI/GetMasterDocByCategoryOrClaimType?ULBCODE=555&CATEGORYID=1');
    //  const response2 = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_NCLTEMP_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('OBJECTIONID'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=DOCUMENT_DETAILS`);;
      //const response2 = await axiosInstance.get(`ObjectionAPI/GET_PROPERTY_OBJECTORS_CITZ_NCLTEMP?ULBCODE=555&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&objectionid=${JSON.parse(localStorage.getItem('OBJECTIONID'))}`);
     // const response2 = ""
      const { Table1 = [] } = response1.data;
    //  const { Table5: NCLTable5 = [] } = response2.data;
     // setTableData(NCLTable5.length > 0 ? NCLTable5 : []);
      setTablesData2(Table1.length > 0 ? Table1 : []);
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
  const handleSubmit = async (e) => {
debugger
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
    debugger
    let mut =  localStorage.getItem('SETMUTATIONID');
    const data = {
      ordernumber: formData.DocumentNumber,
      createdby: "crc", //pass from the session
      documentextension: fileExtension,
      propertycode: 0,
      documentdetails: formData.DocumentDetails,
      scanneddocument: propertyphoto2, //bytes
      mutapplid:  parseInt(mut), //pass from the session
      orderdate: selectedDate,
      documenttypeid: formData.DocumentType,
      ulbcode: 555,
      objectionId: 123
      //  createdip: string

    }

    try {
    let response =  await axiosInstance.post('AmalgamationAPI/NCL_AMALGAMATION_DOCUMENTS_TEMP_INS?ID_BASIC_PROPERTY=0', data
      )
   
      
      await toast.success(`${t("detailsSavedSuccess")}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(async () => {
       // await fetchData();
       debugger
       setTableData(response.data.Table);
       if(response.data.Table.length > 0){
        if (typeof setIsDocumentAdded1 === "function") {
          setIsDocumentAdded1(true); 
        } else {
          console.error("setIsDocumentAdded is not a function");
        }
       // setIsDocumentAdded(true);
     //  }
     //  else{
     //   setIsDocumentAdded(false);
       }
       else {
        setIsDocumentAdded1(false); 
       }
    
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

    let mut =  localStorage.getItem('SETMUTATIONID');
    try {
    let response =  await axiosInstance.post(`AmalgamationAPI/NCL_AMALGAMATION_DOCUMENT_TEMP_DEL?MutationApplicatioId=${parseInt(mut)}&DocumentId=${row.DOCUMENTID}`
      )
      
      await toast.success(`${t("detailsDeletedSuccess")}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(async () => {
      //  await fetchData();
      setTableData(response.data.Table);
      if(response.data.Table.length > 0){
        if (typeof setIsDocumentAdded1 === "function") {
          setIsDocumentAdded1(true); 
        } else {
          console.error("setIsDocumentAdded is not a function");
        }
       // setIsDocumentAdded(true);
     //  }
     //  else{
     //   setIsDocumentAdded(false);
       }
       else {
        setIsDocumentAdded1(false); 
       }
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
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  useEffect(() => {

console.log("Component is rendered")
    fetchData();

  }, []);
  return (
    
     
      <Box sx={{ backgroundColor: '#f0f0f0',  borderRadius: 2,  }}>
        
         
            
             
              <Typography variant="h6"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontFamily: "sans-serif",
                  marginBottom: 3,
                  color: '#',
                  fontSize: {
                    xs: '1rem',
                    sm: '1rem',
                    md: '1.3rem',
                  }
                }}>
                  Identification Documents
                </Typography>
              <Grid container spacing={4}>


                <Grid item xs={12} sm={4}>
                  <FormControl
                    fullWidth
                 
                    sx={{ marginBottom: 3 }}
                  
                  >
                    <InputLabel>  <LabelWithAsterisk text={t("DocumentType")} /></InputLabel>
                    <Select
                      name="DocumentType"
                      value={formData.DocumentType}
                      onChange={handleChange}
                     
                      sx={{ backgroundColor: "#ffff" }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {tablesdata2.map((item) => (
                        <MenuItem key={item.DOCUMENTTYPEID} value={item.DOCUMENTTYPEID}>
                          {item.DOCUMENTTYPEDESCRIPTION_EN}
                        </MenuItem>
                      ))}
                    </Select>
                  
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3.5}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                    <DatePicker

                      // label={t("DocumentRegisteredDate")}
                      label={<LabelWithAsterisk text={t("DocumentRegisteredDate")} />}
                      name='documentregistereddate'
                      placeholder='dd-mm-yyyy'
                      value={selectedDate}
                      onChange={date => handleDateChange(date)}
                      disableFuture
                      sx={{ width: '100%', backgroundColor: '#ffff' }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    variant={isEditable ? "outlined" : "filled"}
                    // label={t("DocumentDetails")}
                    label={isEditable ? <LabelWithAsterisk text={t("DocumentDetails")} /> : t("DocumentDetails")}
                    placeholder={t("DocumentDetails")}
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

              </Grid>

              <Grid container spacing={4}>



                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth

                    // label={t("DocumentNumber :")}
                    label={<LabelWithAsterisk text={t("DocumentNumber :")} />}
                    name="DocumentNumber"
                    value={formData.DocumentNumber}
                    onChange={handleChange}
                    
                  
                    InputProps={{
                      style: { backgroundColor: "#ffff" },
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
                <Grid item xs={12} sm={4}>
                  <Button variant="contained" color="success" onClick={handleSubmit}>
                    {t("Save+")}
                  </Button>
                </Grid>
              </Grid>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {t("UploadedDocument")}
              </Typography>
              <TableContainer component={Paper} style={{ marginTop: 16 }}>
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
                          <TableCell>{row.ORDERNUMBER}</TableCell>
                          <TableCell>{row.ORDERDATE}</TableCell>
                          <TableCell>
                            {row.SCANNEDDOCUMENT ?
                              <IconButton onClick={() => handleDownload(row.SCANNEDDOCUMENT, row.DOCUMENTEXTENSION, row.DOCUMENTTYPEDESCRIPTION)}>
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
              
              </Box>
       
      </Box>
   
  );
};

export default AmalgamationDocumentUploadPage;
