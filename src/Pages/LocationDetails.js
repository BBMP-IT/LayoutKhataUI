import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, CircularProgress, Tooltip, IconButton,
  FormControl, FormHelperText, MenuItem, Select, InputLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import ErrorPage from './ErrorPage';
import GoogleMaps from '../components/GoogleMaps';
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

const LocationDetails = () => {
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
    propertyType: '',
    pincode: '',
    propertyphoto: '',
    categoryId: 2,
    puidNo: '',
    loginId: 'crc',
    lat1: 0,
    long1: 0,
    wardNumber: "",
    wardName: "",
  
    
  });
  const { t } = useTranslation();
  const validationSchema = React.useMemo(() =>Yup.object().shape({
    DoorPlotNo: Yup.string().required(`${t("doorPlotNumber")}`).notOneOf(['0'], `${t('doorName')}`),
    areaorlocality: Yup.string().required(`${t('areaLocalityRequired')}`),
    pincode: Yup.string()
      .required(`${t('pincodeRequired')}`)
      .matches(/^\d{6}$/, `${t('pincodeInvalid')}`),
    streetid: Yup.string().required(`${t('streetNameRequired')}`).notOneOf(['0'], `${t('streetNameInvalid')}`),
    lat1: Yup.string().required(`${t('latitudeRequired')}`).notOneOf(['0'], `${t('latitudeInvalid')}`),
    long1: Yup.string().required(`${t('longitudeRequired')}`).notOneOf(['0'], `${t('longitudeInvalid')}`),
  }), [t]);

  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  //const [fileExtension, setfileExtension] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
 
  const [lat2 ] = useState(0);
  const [long2] = useState(0);
  const [GoogleMapLoad, setGoogleMapLoad] = useState(false);
  const [wardlat, setWardLat] = useState(13.0074);
  const [wardLong, setWardLong] = useState(77.5688)

  const [tableData, setTableData] = useState([
  ]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    
    let response2 = null;
    let book = JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))
    try {
      const response = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_BBD_DRAFT_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=ADDRESS`);
      if(book !== null){
       response2 = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_NCLTEMP_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=ADDRESS`);
      }
      else {
        response2 = null
      }
      const response3 = await axiosInstance.get('BBMPCITZAPI/GetMasterTablesData_React?UlbCode=555&Page=ADDRESS');

      const { Table1 = [], Table5 = [], } = response.data;
      let NCLtable1Item = [];
      let Table11Item = [];
      let table4Item = [];
      if (response2) {
        const { Table3 = [], Table1: NCLTABLE1 = [], Table2 = [] } = response2.data;
        NCLtable1Item = NCLTABLE1.length > 0 ? NCLTABLE1[0] : [];
        Table11Item = Table3.length > 0 ? Table3[0] : [];
        table4Item = Table2.length > 0 ? Table2[0] : [];
        setPreviewUrl(`data:image1/png;base64,${Table11Item.PROPERTYPHOTO || ""}`);
        setPropertyPhoto(Table11Item.PROPERTYPHOTO || "");

      } 
      const { Table:MasterTable1 = [] } = response3.data;
      const table1Item = Table1.length > 0 ? Table1[0] : [];

      const table5Item = Table5.length > 0 ? Table5[0] : [];

      
      const filteredData = MasterTable1.filter(item =>
        item.STREETID !== 99999 && item.WARDID === table1Item.WARDID
      );
      setTableData(filteredData);
      const updatedFormData = {
        propertyType: NCLtable1Item.PROPERTYCATEGORYID || "0",
        propertyEID: table1Item.PROPERTYID || '',
        address: table1Item.ADDRESS || '',
        district: table1Item.DISTRICTNAME || '',
        wardNumber: table1Item.WARDID || '',
        wardName: table1Item.WARDNAME || "",
        propertyNumber: table1Item.PROPERTYCODE || '',
        ulbname: table1Item.ULBNAME || '',
        ownerName: table5Item.OWNERNAME || '',
        streetName: table1Item.STREETNAME_EN || '',
        nclStreetName:Table11Item.STREETNAME,
        DoorPlotNo: Table11Item.DOORNO || '',
        buildingname: Table11Item.BUILDINGNAME || '',
        streetid: NCLtable1Item.STREETID || '',
        NearestLandmark: Table11Item.LANDMARK || '',
        pincode: Table11Item.PINCODE || '',
        areaorlocality: Table11Item.AREAORLOCALITY || '',
        lat1: table4Item.LATITUDE || "",
        long1: table4Item.LONGITUDE || "",
      }
      setFormData(updatedFormData);
      debugger
      const isValid =await  validationSchema.isValid(updatedFormData);
      if(isValid){
        setIsEditable(false);
      }else{
        setIsEditable(true);
      }
      setGoogleMapLoad(false)
      const GetWardCordinates = await axiosInstance.get("BBMPCITZAPI/GetWardCordinates?wardNumber=" + table1Item.WARDID)
      const { Table: ward = [] } = GetWardCordinates.data;

      if (table4Item.length > 0) {
        setWardLat(table4Item.LATITUDE);
        setWardLong(table4Item.LONGITUDE);
        setGoogleMapLoad(true)
      }
      else {
        setWardLat(ward[0].WARDLATITUDE);
        setWardLong(ward[0].WARDLONGITUDE);
        setGoogleMapLoad(true)
      }
    
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('There was an error!', error);
      return <ErrorPage errorMessage={error} />;
    }
    setLoading(false);
  }, [validationSchema]);

  useEffect(() => {
    // fetchData();
  }, [fetchData]);

  const handleChange = (e) => {

    const { name, value } = e.target;
    if (name === "pincode") {
      if (/^\d{0,6}$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
      return
    }
   
    setFormData({
      ...formData,
      [name]: value
    });
  };


  const [previewUrl, setPreviewUrl] = useState('');
  const [propertyPhoto, setPropertyPhoto] = useState('');

  const handleFileChange = (e) => {
    if (!isEditable) return;
    setSelectedFile(e.target.files[0]);
    const file = e.target.files[0];
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();


    if (!['jpg', 'jpeg'].includes(fileExtension)) {
      toast.error(`${t("Please Select Only '.jpg','.jpeg' File")}`);
      e.target.value = null;
      setSelectedFile(null);
      return
    }
   // setfileExtension(fileExtension);
    const maxSize = 500 * 1024;
    if (file && file.size > maxSize) {
      toast.error(`${t("File size exceeds 500 KB limit")}`);
      e.target.value = null;
      setSelectedFile(null);
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(file);
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  //  setfileExtension('');
  };
  const handleBack = () => {
 
    navigate("/OwnerDetails");
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  const handleAddressEdit = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (isEditable === false) {
      setIsEditable(true);
    } else {
      setIsEditable(false);
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

  const CopyBookData = async () => {
    try {
      if (JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')) === null) {
        await axiosInstance.get(`BBMPCITZAPI/COPY_DATA_FROM_BBDDRAFT_NCLTEMP?LoginId=crc&propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&propertyid=${JSON.parse(localStorage.getItem('SETPROPERYID'))}`);
        const response3 = await axiosInstance.get(`BBMPCITZAPI/Get_Ctz_ObjectionModPendingAppl?LoginId=crc&propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&propertyid=${JSON.parse(localStorage.getItem('SETPROPERYID'))}`);
        if (response3.data === "There is a issue while copying the data from Book Module.No Data Found") {
          toast.error(`${t("There is a issue while copying the data from Book Module.No Data Found")}`)
          return false
        }
        localStorage.setItem('P_BOOKS_PROP_APPNO', JSON.stringify(response3.data.P_BOOKS_PROP_APPNO));
        return true;
      }
      else {
        return true;
      }
    } catch (error) {
      <ErrorPage errorMessage={error} />
      return false;
    }

  }

  const handleSubmit = async (e) => {
    
    if (e.key === 'Enter') {
      e.preventDefault();
    }

    let propertyphoto2 = "";
    if (isEditable) {
      if (selectedFile != null) {
        propertyphoto2 = await getPropertyphoto(selectedFile);
      }
      if (propertyPhoto.length === 0) {
        if (propertyphoto2.length === 0) {
          toast.error(`${t("Please Upload the New Property Photo")}`);
          return;
        }

      }
    
     
      
     
       await CopyBookData();
      
     

      setLoading(true);
      const data = {
        propertyCode: formData.propertyNumber,
     
        streetid: formData.streetid,
        streetName:formData.nclStreetName,
        doorno: formData.DoorPlotNo,
        buildingname: formData.buildingname,  
        areaorlocality: formData.areaorlocality,
        landmark: formData.NearestLandmark,
        pincode: formData.pincode,
        propertyphoto: propertyphoto2.length > 0 ? propertyphoto2 : propertyPhoto,
       
        loginId: "crc",
        P_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')),
        latitude: formData.lat1.toString(),
        longitude: formData.long1.toString()
      };
      try {
        await axiosInstance.post('BBMPCITZAPI/INS_UPD_NCL_PROPERTY_ADDRESS_TEMP2', data
        )
        setSelectedFile(null);
        
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
        setIsEditable(false);
        setLoading(false);

      
        localStorage.setItem("userProgress", 7);
          navigate('/AreaDimension')
    
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

     

      localStorage.setItem("userProgress", 7);
        navigate('/AreaDimension')
    
    }
    setLoading(false);
  }






  const handleAddressChange = (newAddress) => {


    if (!newAddress || !newAddress.address) {
      toast.error('Address is undefined');
      return;
    }
    var parts = newAddress.address.split(', ');
    var doorNo = "";
    var pincode = "";
    var area = "";


    if (parts.length === 3) {
      area = parts[0].trim();
      setFormData((prevData)=>({
        ...prevData,
        lat1: lat2 !== undefined ? newAddress.lat : 0,
        long1: long2 !== undefined ? newAddress.lng : 0,
        areaorlocality: area

      }));
    } else {
      var pincodeRegex = /\b\d{6}\b/;
      var pincodes = newAddress.address.match(pincodeRegex);
      doorNo = parts[0].trim();
      if (pincodes != null) {
        pincode = pincodes[0];
      }
      area = parts[0].trim();
      setFormData((prevData)=>({
        ...prevData,
        lat1: lat2 !== undefined ? newAddress.lat : 0,
        long1: long2 !== undefined ? newAddress.lng : 0,
        DoorPlotNo: doorNo.length > 0 ? doorNo : "",
        pincode: pincode,
        areaorlocality: area

      }));
    }

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
    <Container maxWidth="lg">
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 4, borderRadius: 2, mt: 8 }}>
        <ToastContainer />

        
      <br></br>
     
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontFamily: "sans-serif",
            marginTop: 3,
            color: '#1565c0',
            fontSize: {
              xs: '1rem',
              sm: '2rem',
              md: '1rem',
            }
          }}
        >
      {t("LocationTitle")}
        </Typography>
        {GoogleMapLoad &&
          <GoogleMaps lat={wardlat} long={wardLong} onLocationChange={handleAddressChange} />
        }
       <Typography>  {t("Please Click on the Map of Your Property to get the Address and Coordinates")}</Typography>
       <Typography variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontFamily: "sans-serif",
            marginTop: 3,
            color: '#1565c0',
            fontSize: {
              xs: '1rem',
              sm: '1rem',
              md: '1.5rem',
            }
          }}>  {t("PostalAddressofProperty")}</Typography>
        <Formik
          initialValues={formData}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}

          validateOnChange={false}
          enableReinitialize
        >
          {({ errors, touched, handleBlur }) => (
            <Form onKeyDown={handleKeyDown}>
              <br></br>
              <br></br>

              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<LabelWithAsterisk text={t('doorPlotNo')} />}
                    name="DoorPlotNo"
                    value={formData.DoorPlotNo}
                    onChange={handleChange}
                    variant={isEditable ? "outlined" : "filled"}
                    onBlur={handleBlur}
                    className={touched.DoorPlotNo && !!errors.DoorPlotNo ? 'shake' : ''}
                    error={touched.DoorPlotNo && !!errors.DoorPlotNo}
                    helperText={touched.DoorPlotNo && errors.DoorPlotNo}
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
                      endAdornment: (
                        <Tooltip title={t("buildingLandNameInfo")}>
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
                    label={t("nearestLandmark")}
                    name="NearestLandmark"
                    value={formData.NearestLandmark}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  
                    variant={isEditable ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditable,
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<LabelWithAsterisk text={t('pincode')} />}

                    name="pincode"
                    type="number"
                    value={formData.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.pincode && !!errors.pincode ? 'shake' : ''}
                    error={touched.pincode && !!errors.pincode}
                    helperText={touched.pincode && errors.pincode}
                    variant={isEditable ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditable,
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title={t("pincodeInfo")}>
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
                    label={<LabelWithAsterisk text={t('areaLocality')} />}
                    name="areaorlocality"
                    value={formData.areaorlocality}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.areaorlocality && !!errors.areaorlocality ? 'shake' : ''}
                    error={touched.areaorlocality && !!errors.areaorlocality}
                    helperText={touched.areaorlocality && errors.areaorlocality}
                    variant={isEditable ? "outlined" : "filled"}
                    InputProps={{
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
                      readOnly: !isEditable,
                      endAdornment: (
                        <Tooltip title={t("areaLocalityInfo")}>
                          <IconButton color="primary">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>

                  <FormControl
                    fullWidth

                    error={touched.streetid && !!errors.streetid}
                    sx={{ marginBottom: 3 }}
                    className={touched.streetid && !!errors.streetid ? 'shake' : ''}
                  >
                    <InputLabel > {t("Select Street/Nearst Street From List Of Ward Streets")} <span style={{ color: 'red' }}> *</span>
                    </InputLabel>
                    <Select
                      name="streetid"
                      value={formData.streetid}
                      onChange={handleChange}
                      inputProps={{ readOnly: !isEditable }}
                      onBlur={handleBlur}
                      sx={{ backgroundColor: !isEditable ? '' : "#ffff" }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {tableData.map((item) => (
                        <MenuItem key={item.STREETID} value={item.STREETID}>
                          {item.STREETNAME1}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {touched.streetid && errors.streetid ? errors.streetid : ''}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={ t('Street/Nearst Street')}
                    name="nclStreetName"
                    value={formData.nclStreetName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                
                    variant={isEditable ? "outlined" : "filled"}
                    InputProps={{
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
                      readOnly: !isEditable,
                      endAdornment: (
                        <Tooltip title={t("areaLocalityInfo")}>
                          <IconButton color="primary">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<LabelWithAsterisk text={t('lattitude')} />}

                    name="lat1"
                    value={formData.lat1}
                    onChange={handleChange}
                    variant={"filled"}
                    className={touched.lat1 && !!errors.lat1 ? 'shake' : ''}
                    error={touched.lat1 && !!errors.lat1}
                    helperText={touched.lat1 && errors.lat1}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Tooltip title={t("areaLocalityInfo")}>
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
                    label={<LabelWithAsterisk text={t('Longitude')} />}

                    name="long1"
                    value={formData.long1}
                    onChange={handleChange}
                    variant={"filled"}
                    className={touched.long1 && !!errors.long1 ? 'shake' : ''}
                    error={touched.long1 && !!errors.long1}
                    helperText={touched.long1 && errors.long1}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Tooltip title={t("areaLocalityInfo")}>
                          <IconButton color="primary">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
           
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      {t("uploadPropertyPhoto")}
                    </Typography>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      sx={{ ml: 2 }}
                      disabled={!isEditable}
                    >
                      {t("Uploadfile")}
                      <VisuallyHiddenInput type="file" accept=".jpg,.jpeg" onChange={handleFileChange} />
                    </Button>

                  </Box>
                  {previewUrl && (
                    <div style={{ marginLeft: '10px', position: 'relative' }}>
                      <img
                        src={previewUrl}
                        alt="No Images Found"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          width: 'auto', // Allow the width to adjust responsively
                          height: 'auto', // Allow the height to adjust responsively
                        }}
                      />
                    </div>
                  )}

                  {selectedFile != null && (
                    <Box display="flex" alignItems="center" mt={2}>
                      <Typography variant="body1">{selectedFile.name}</Typography>
                      <Button color="error" variant='outlined' onClick={handleFileDelete} sx={{ ml: 2 }}>
                        {t("DeleteImage")}
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
              <br></br>
            

              <br></br>
              <br></br>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" gap={2}>
                  <Button variant="contained" color="primary" onClick={handleBack}>
                    {t("Previous")}
                  </Button>
                  {!isEditable && (
                    <Button variant="contained" color="primary" onClick={handleAddressEdit}>
                      {t("Edit")}
                    </Button>
                  )}
                
                  <Button variant="contained" color="success" type="submit" >
                    {t("save")}
                  </Button>
                </Box>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default LocationDetails;
