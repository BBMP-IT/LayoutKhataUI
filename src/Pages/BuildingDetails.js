import React, { useState, useEffect ,useCallback} from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, Tooltip, IconButton,
  FormControl, MenuItem, Select, InputLabel,CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormHelperText
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import '../components/Shake.css';
import LabelWithAsterisk from '../components/LabelWithAsterisk';
import ViewSample from '../components/ViewSample';
const BuildingDetails = () => {
  const [formData, setFormData] = useState({
    BuildingNumber: "1",
    BuildingName: '',
    floornumber: "",
    features: '',
    Typeofuse: '',
    yearOfConstruction: '',
    SelfuseArea: "",
    RentedArea: '',
    TotalArea: '',
    SelfuseAreaMts: "",
    RentedAreaMts: "",
    TotalAreaMts: '',
    BesomCustomerID: '',
    BWSSBMeterNumber: ''
  });
  const { t } = useTranslation();
  const validationSchema = Yup.object().shape({
    BuildingNumber: Yup.string().required(`${t('buildingNumberRequired')}`),
    floornumber: Yup.string().required(`${t('floorNumberRequired')}`),
    features: Yup.string().required(`${t('usageCategoryRequired')}`),
    yearOfConstruction: Yup.string()
      .required(`${t('yearUsageRequired')}`),
    // Typeofuse: Yup.string().required(`${t('typeOfUseRequired')}`),
    SelfuseArea: Yup.string().required(`${t('selfUseAreaRequired')}`),
   // RentedArea:  Yup.string().required(`${t('rentedAreaRequired')}`),
    //  BWSSBMeterNumber: Yup.string().required('BWSSB Meter Number is required'),
    //  BesomCustomerID: Yup.string().required(`${t('Bescom Customer ID is required')}`),

  });
  const [tableData, setTableData] = useState([
  ]);
  const navigate = useNavigate();
  const [tablesdata2, setTablesData2] = useState([]);
  const [tablesdata3, setTablesData3] = useState([]);
  const [tablesdata4, setTablesData4] = useState([]);
  const [tableYearMaster,setYearMaster] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [RentedAreaEnabled,setRentedAreaEnabled] = useState(true)
  const [BescomTable,setBescomTable] = useState([]);
  const [loading,setLoading] = useState(false);
  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "features") {
      try {
        if (value !== "") {
          const response = await axiosInstance.get(`BBMPCITZAPI/GET_MST_FEATURE_BY_FEATUREHEADID?FEATUREHEADID=${value}`);
          if (response.data.Table.length > 0) {
            setTablesData3(response.data.Table);
          }
          else {
            setTablesData3([]);
          }
          
          if(value === 1 || value === 2 || value === 3){
            setRentedAreaEnabled(true)
            
          }else {
            setRentedAreaEnabled(false)
            formData.RentedArea = ""
            formData.RentedAreaMts = ""
          }
        }
        
      } catch (error) {
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
        }, 500);
      }
    }
    if (name === 'SelfuseArea' || name === 'RentedArea') {
      const selfuseAreaValue = name === 'SelfuseArea' ? value : formData.SelfuseArea;
      const RentedAreaValue = name === 'RentedArea' ? value : formData.RentedArea;
      let totalArea = 0;
      if(formData.RentedArea.length > 0){
       totalArea = Math.round(parseFloat(selfuseAreaValue) + parseFloat(RentedAreaValue));
       formData.RentedAreaMts = (parseFloat(RentedAreaValue) * 0.092903).toFixed(2).toString()
      }
      else {
        totalArea = Math.round(parseFloat(selfuseAreaValue))
        formData.RentedAreaMts = 0.00
      }
      formData.TotalArea = totalArea;
      formData.SelfuseAreaMts = (parseFloat(selfuseAreaValue) * 0.092903).toFixed(2).toString()
      
      formData.TotalAreaMts = (parseFloat(totalArea) * 0.092903).toFixed(2).toString()

    }
   

    setFormData({
      ...formData,
      [name]: value
    });
  };


  const fetchData =useCallback(async () => {
    try {
      const response1 = await axiosInstance.get('BBMPCITZAPI/GetMasterTablesData_React?UlbCode=555&Page=BUILDING_DETAILS');
      const response2 = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_NCLTEMP_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=BUILDING_DETAILS`);;
      const { Table:MasterTable1 = [], Table1:MasterTable2 = [],Table2:MasterTable3 } = response1.data;

      const { Table1 = [] ,Table2:NCLTable2} = response2.data;
      const table8Item = Table1.length > 0 ? Table1 : [];
      const table16Item = MasterTable2.length > 0 ? MasterTable2 : [];
      const table15Item = MasterTable1.length > 0 ? MasterTable1 : [];
      const table18Item = MasterTable3.length > 0 ? MasterTable3 : [];
      const tableBescom = NCLTable2.length > 0 ? NCLTable2 : [];
      setTableData(table8Item);
      setTablesData2(table16Item);
      setTablesData4(table15Item);
      setYearMaster(table18Item);
      setBescomTable(tableBescom);
    } catch (error) {
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
      }, 500);
    }

  }, [navigate,t]);
  const handleSubmit = async () => {
    // 
if(RentedAreaEnabled){
  if(formData.RentedArea.length === 0){
    toast.error(`${t("Please enter the Rented Area")}`)
    return
  }
}

    var BUILDINGUSAGETYPEID = 0;
    if (formData.RentedArea === 0) {
      BUILDINGUSAGETYPEID = 4;
    }
    else if (formData.SelfuseArea === 0) {
      BUILDINGUSAGETYPEID = 5;
    }
    else if (formData.SelfuseArea !== 0 && formData.SelfuseArea !== 0) {
      BUILDINGUSAGETYPEID = 6;
    }
    if(BescomTable.length === 0){
      if(formData.BesomCustomerID.length === 0){
        toast.error("Please Enter the Bescom Customer Id or Account No")
        return
      }
    }
    const data = {
      propertyCode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
      floornumberid: formData.floornumber,
      floortypeid: formData.floornumber,
      createdby: "crc",
      buildingusagetypeid: BUILDINGUSAGETYPEID,
      ulbcode: 555,
      featureheadid: formData.features,
      featureid: formData.Typeofuse || "0",
      builtyear: formData.yearOfConstruction,
      rrno: formData.BesomCustomerID || null,
      watermeterno: formData.BWSSBMeterNumber,
      buildingnumberid: formData.BuildingNumber,
      buildingblockname: formData.BuildingName || null,
      ownUseArea: formData.SelfuseArea,
      rentedArea:  formData.RentedArea.length === 0 ? "0" :formData.RentedArea ,
      p_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))
    }

    try {
      await axiosInstance.post('BBMPCITZAPI/DEL_INS_SEL_NCL_PROP_BUILDING_TEMP?ULBCODE=555', data
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
    navigate('/AreaDimension')
  }
  const viewSample = () => {
    setIsDialogOpen(true);
  }
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const handleNavigation = () => {
    if(tableData.length === 0){
      toast.error(`${t("Please Enter and Save the Building Details")}`)
      return
    }
    if(BescomTable.length > 0)
{
  localStorage.setItem("userProgress", 9);
    navigate('/ClassificationDocumentUploadPage');
}else {
  toast.error(`${t("BESCOM Needs to Be Verified")}`)
  return
}
  }
  const handleBescomVerify = async () => {
    
    if(formData.floornumber.length === 0){
      toast.error(`${t("Please Provide Floor Number")}`)
      return
    }
    if(formData.BesomCustomerID.length === 0){
      toast.error(`${t("Please Provide BescomCustomerID or Account No")}`)
      return
    }
    
    setLoading(true)
    const params1 = {
      BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')),
      propertycode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
      BescomAccountNumber: formData.BesomCustomerID,
      LoginId: "crc",
      propertytype: 2,
      FloorNumber: formData.floornumber
    };
    
    const queryString = new URLSearchParams(params1).toString();
    const BescomResponse = await axiosInstance.post(`Bescom/GetBescomData?${queryString}`);
    if(BescomResponse.data === "No Bescom Details Found"){
      toast.error(`${t("No Bescom Details Found")}`);
     
      setLoading(false);
      return
    }
    toast.success(`${t("detailsFetchedSuccess")}`)
    setBescomTable(BescomResponse.data.Table || [])
   setLoading(false);

  }
  const handleDelete = async (id) => {

    const data = {
      propertyCode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
      //  floortypeid: id.FLOORTYPEID,
      floortypeid: id.BUILDINGROWID,
      p_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))
    }
    try {
      await axiosInstance.post('BBMPCITZAPI/DEL_SEL_NCL_PROP_BUILDING_TEMP?ULBCODE=555', data
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

  const handleEdit = async (row) => {
    try {
      if (row.FEATUREHEADID !== null && row.FEATUREHEADID !== "") {
        const response3 = await axiosInstance.get(`BBMPCITZAPI/GET_MST_FEATURE_BY_FEATUREHEADID?FEATUREHEADID=${row.FEATUREHEADID}`);
        if (response3.data.Table.length > 0) {
          setTablesData3(response3.data.Table);
        }
      }
     
      
      setFormData({
        BuildingNumber: row.BUILDINGBLOCKID || 0,
        BuildingName: row.BUILDINGBLOCKNAME || '',
        floornumber: row.FLOORNUMBERID || '',
        features: row.FEATUREHEADID || '',
        Typeofuse: row.FEATUREID || '',
        yearOfConstruction: row.BUILTYEAR || '',
        SelfuseArea: row.AREA || 0,
        RentedArea: row.RENTEDAREA || 0,
        SelfuseAreaMts: (parseFloat(row.AREA) * 0.092903).toFixed(2).toString(),
        RentedAreaMts: (parseFloat(row.RENTEDAREA ) * 0.092903).toFixed(2).toString(),
        TotalAreaMts: (parseFloat(row.TOTALAREA) * 0.092903).toFixed(2).toString(),
        TotalArea: row.TOTALAREA || '',
        BesomCustomerID: row.ACCOUNTID || '',
        BWSSBMeterNumber: row.WATERMETERNO || ''
      });
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

    fetchData();

  }, [fetchData]);
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
  return (
    <Container maxWidth="xl">
      <ToastContainer />
      <ViewSample
        open={isDialogOpen}
        onClose={handleCloseDialog}
        TypofImage={"BESCOM"}
      />
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 4, borderRadius: 2, mt: 8 }}>
        <Formik
          initialValues={formData}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
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
                {t("DetailsOfUsageOfBuilt-upArea")}
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type='number'
                    label={<LabelWithAsterisk text={t('BuildingNumber')} />}

                    name="BuildingNumber"
                    value={formData.BuildingNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}

                    className={touched.BuildingNumber && !!errors.BuildingNumber ? 'shake' : ''}
                    error={touched.BuildingNumber && !!errors.BuildingNumber}
                    helperText={touched.BuildingNumber && errors.BuildingNumber}
                    InputProps={{
                      style: { backgroundColor: '#ffff' },
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
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    InputProps={{
                      style: { backgroundColor: '#ffff' },
                      endAdornment: (
                        <Tooltip title={t("cityInfo")}>
                          <IconButton color="primary">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                    label={t('BuildingName')}

                    name="BuildingName"
                    value={formData.BuildingName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl
                    fullWidth
                    error={touched.floornumber && !!errors.floornumber}
                    sx={{ marginBottom: 3 }}
                    className={touched.floornumber && !!errors.floornumber ? 'shake' : ''}
                  >
                    <InputLabel>     < LabelWithAsterisk text={t('floornumber')} /></InputLabel>
                    <Select
                      name="floornumber"
                      value={formData.floornumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ backgroundColor: '#ffff' }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {tablesdata4.map((item) => (
                        <MenuItem key={item.FLOORNUMBERID} value={item.FLOORNUMBERID}>
                          {item.FLOORNUMBER_EN}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {touched.floornumber && errors.floornumber ? errors.floornumber : ''}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl
                    fullWidth
                    error={touched.features && !!errors.features}
                    sx={{ marginBottom: 3 }}
                    className={touched.features && !!errors.features ? 'shake' : ''}
                  >
                    <InputLabel>  <LabelWithAsterisk text={t('UsageCategory')} /></InputLabel>
                    <Select
                      name="features"
                      value={formData.features}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ backgroundColor: '#ffff' }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {tablesdata2.map((item) => (
                        <MenuItem key={item.FEATUREHEADID} value={item.FEATUREHEADID}>
                          {item.FEATUREHEADNAME_EN}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {touched.features && errors.features ? errors.features : ''}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl
                    fullWidth
                  >
                    <InputLabel>{t('Typeofuse')}</InputLabel>
                    <Select
                      name="Typeofuse"
                      value={formData.Typeofuse}
                      onChange={handleChange}
                      sx={{ backgroundColor: '#ffff' }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {tablesdata3.map((item) => (
                        <MenuItem key={item.FEATUREID} value={item.FEATUREID}>
                          {item.FEATURENAME}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                <FormControl
                    fullWidth
                    error={touched.yearOfConstruction && !!errors.yearOfConstruction}
                    sx={{ marginBottom: 3 }}
                    className={touched.yearOfConstruction && !!errors.yearOfConstruction ? 'shake' : ''}
                  >
                    <InputLabel>      <LabelWithAsterisk text={t('YearUsage')} /></InputLabel>
                    <Select
                      name="yearOfConstruction"
                      value={formData.yearOfConstruction}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ backgroundColor: '#ffff' }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {tableYearMaster.map((item) => (
                        <MenuItem key={item.YEAR} value={item.YEAR}>
                          {item.YEAR}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {touched.yearOfConstruction && errors.yearOfConstruction ? errors.yearOfConstruction : ''}
                    </FormHelperText>
                  </FormControl>
                 
                </Grid>

              </Grid>

              <Grid container spacing={4}>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={<LabelWithAsterisk text={t('SelfUseAreafts')} />}

                    name="SelfuseArea"
                    type="number"
                    value={formData.SelfuseArea}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.SelfuseArea && !!errors.SelfuseArea ? 'shake' : ''}
                    error={touched.SelfuseArea && !!errors.SelfuseArea}
                    helperText={touched.SelfuseArea && errors.SelfuseArea}
                    InputProps={{
                      style: { backgroundColor: '#ffff' },
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
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={<LabelWithAsterisk text={t('RentedAreafts')} />}
                    variant={RentedAreaEnabled ? "outlined" : "filled"}
                    name="RentedArea"
                    type="number"
                    value={formData.RentedArea}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.RentedArea && !!errors.RentedArea ? 'shake' : ''}
                    error={touched.RentedArea && !!errors.RentedArea}
                    helperText={touched.RentedArea && errors.RentedArea}
                    InputProps={{
                      readOnly: !RentedAreaEnabled,
                      style: { backgroundColor: RentedAreaEnabled? '#ffff' : '' },
                      endAdornment: (
                        <Tooltip title={t("streetInfo")}>
                          <IconButton color="primary">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    variant='filled'
                    label={t("TotalAreafts")}
                    name="TotalArea"
                    value={formData.TotalArea}
                    onChange={handleChange}
                    InputProps={{
                      readOnly: true,
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
                  <TextField
                    fullWidth
                    variant='filled'
                    label={t("SelfUseAreamts")}
                    name="SelfuseAreaMts"
                    value={formData.SelfuseAreaMts}
                    onChange={handleChange}
                    InputProps={{
                      readOnly: true,
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
                  <TextField
                    fullWidth
                    variant='filled'
                    label={t("RentedAreamts")}
                    name="RentedAreaMts"
                    value={formData.RentedAreaMts}
                    onChange={handleChange}
                    InputProps={{
                      readOnly: true,
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
                  <TextField
                    fullWidth
                    variant='filled'
                    label={t("TotalAreamts")}
                    name="TotalAreaMts"
                    value={formData.TotalAreaMts}
                    onChange={handleChange}
                    InputProps={{
                      readOnly: true,
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
                  <TextField
                    fullWidth
                    label={t("BESCOMCustomerID")}
                    name="BesomCustomerID"
                    value={formData.BesomCustomerID}
                    onChange={handleChange}
                    onBlur={handleBlur}
       
                    InputProps={{
                      style: { backgroundColor: '#ffff' } ,
                      endAdornment: (
                        <Tooltip title={t("pincodeInfo")}>
                          <IconButton color="primary">
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                
                <Button color="primary" onClick={handleBescomVerify}>{t("Verify with Bescom")}</Button>
                <Button color="primary" onClick={viewSample}>{t("View Sample")}</Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t("BWSSBMeterNumber")}
                    name="BWSSBMeterNumber"
                    value={formData.BWSSBMeterNumber}
                    onChange={handleChange}
                   
                    InputProps={{
                      style: { backgroundColor: '#ffff' } ,
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


                
                <Grid item xs={16} sm={4}>
                  <Button variant="contained" color="success" type="submit">
                    {t("Save+")}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}></Grid>
              </Grid>
             
              {loading ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20vh' }}>
  <GradientCircularProgress />
</Box>
) : (
              BescomTable.length > 0 &&
              <> 
                <Typography  variant="h6">{t("Bescom Data")}</Typography>
              <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Consumer Name")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Account Id")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Escom Name")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("RR No")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Nature Of Business")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("MobileNo")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Email")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Address")}</TableCell>
                
                      
           
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {BescomTable.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center">
                          {t("Nodataavailable")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      BescomTable.map((row,index) => (
                        <TableRow key={index}>
                          <TableCell>{row.CONSUMER_NAME}</TableCell>
                          <TableCell>{row.ACCOUNTID}</TableCell>
                          <TableCell>{row.ESCOM_NAME}</TableCell>
                          <TableCell>{row.RR_NUMBER}</TableCell>
                          <TableCell>{row.BUSINESS_NATURE}</TableCell>
                          <TableCell>{row.MOBILE_NUMBER}</TableCell>
                          <TableCell>{row.EMAIL}</TableCell>
                          <TableCell>{row.ADDRESS}</TableCell>
                     
                      
                        
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              </>
)}
 
              <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("BuildingNumber")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("BuildingName")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("floornumber")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("UsageCategory")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Typeofuse")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("YearUsage")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("SelfUseArea")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("RentedArea")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("TotalArea")}</TableCell>
                       <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("BESCOMCustomerID")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("BWSSBMeterNumber")}</TableCell> 
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Edit")}</TableCell>
                      <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Delete")}</TableCell>
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
                          <TableCell>{row.BUILDINGBLOCKID}</TableCell>
                          <TableCell>{row.BUILDINGBLOCKNAME}</TableCell>
                          <TableCell>{row.FLOORNUMBER_EN}</TableCell>
                          <TableCell>{row.FEATUREHEADNAME_EN}</TableCell>
                          <TableCell>{row.FEATURENAME_EN}</TableCell>
                          <TableCell>{row.BUILTYEAR}</TableCell>
                          <TableCell>{row.AREA}</TableCell>
                          <TableCell>{row.RENTEDAREA}</TableCell>
                          <TableCell>{row.TOTALAREA}</TableCell>
                           <TableCell>{row.ACCOUNTID}</TableCell>
                          <TableCell>{row.WATERMETERNO}</TableCell> 
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton color="primary" onClick={() => handleEdit(row)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
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


                <Button variant="contained" color="primary" onClick={handleNavigation}>
                  {t("next")}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default BuildingDetails;
