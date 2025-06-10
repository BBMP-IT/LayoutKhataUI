import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, CircularProgress, Tooltip, IconButton,
  FormControl,  MenuItem, Select, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import ErrorPage from './ErrorPage';
import LabelWithAsterisk from '../components/LabelWithAsterisk'
import ViewSample from '../components/ViewSample';
import KaveriData from './KaveriData';

const TaxDetails = () => {
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
    verifySASNUM: "",
    lat1: 0,
    long1: 0,
    wardNumber: "",
    wardName: "",
    BBDOldWardNumber: "",
    BBDOldPropertyNumber: "",
    BBDSasApplicationNumber:"",
    BBDAddress:"",
    BBDPropertyType:"",
    BBDPropertyCategory:"",
    
  });
  const { t } = useTranslation();
 

  const navigate = useNavigate();

 
  //const [fileExtension, setfileExtension] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [handleSASClicks, sethandleSASClicks] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

 
  const [SAStableData, setSASTableData] = useState([]);
  const fetchData = React.useCallback(async () => {
    setLoading(false);
    
    let response2 = null;
    let book = JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))
    try {
      const response = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_BBD_DRAFT_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=ADDRESS`);
      if(book !== null){
       response2 = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_NCLTEMP_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=TAX_DETAILS`);
      }
      else {
        response2 = null
      }
     

      const { Table1 = [], Table5 = [], } = response.data;
      let NCLtable1Item = [];
     
      
      if (response2) {
        const {  Table1: NCLTABLE1 = [] } = response2.data;
        NCLtable1Item = NCLTABLE1.length > 0 ? NCLTABLE1[0] : [];
       
       
       
       

      } else {
        setIsEditable(true)
      }
      
      const table1Item = Table1.length > 0 ? Table1[0] : [];

      const table5Item = Table5.length > 0 ? Table5[0] : [];

      
     
   

      setFormData({
        propertyType: NCLtable1Item.PROPERTYCATEGORYID || "0",
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
        verifySASNUM: NCLtable1Item.PUID !== null ? NCLtable1Item.PUID || "" : "",
      });

   
      
      const sasNum = NCLtable1Item.PUID !== null ? NCLtable1Item.PUID || 0 : table1Item.PUID ? table1Item.PUID : 0;
      const responseSAS = await axiosInstance.get('BBMPCITZAPI/GetTaxDetails?applicationNo=' + sasNum + '&propertycode=' + JSON.parse(localStorage.getItem('SETPROPERTYCODE')) + '&P_BOOKS_PROP_APPNO=' + JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')) + '&loginId=crc')
      const { Table = [] } = responseSAS.data;

      if (Table.length === 0) {
        toast.error(`${t("No SAS Applications Found")}`);
      }
      setSASTableData(Table);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('There was an error!', error);
      return <ErrorPage errorMessage={error} />;
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {

    const { name, value } = e.target;
    
    if (name === "verifySASNUM") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData(prevFormData => ({
          ...prevFormData,
          [name]: value
        }));
      }
      return
    }
    setFormData({
      ...formData,
      [name]: value
    });
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



 
  
  const handleBack = () => {
   
    localStorage.removeItem("P_BOOKS_PROP_APPNO");
    localStorage.removeItem("SETPROPERTYCODE");
    localStorage.removeItem("SETPROPERYID");
    navigate("/PropertyList");
  }
 
  
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
    if (formData.propertyType === "0") {
      toast.error(`${t("Please Select the Property Type")}`)
      return
    }
    if(formData.verifySASNUM.length === 0){
      toast.error(`${t("provideSasAppNumber")}`);
      return
    }
    const response = await axiosInstance.get(
      'BBMPCITZAPI/GetTaxDetails', {
      params: {
        applicationNo: formData.verifySASNUM,
        propertycode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
        P_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')),
        loginId: 'crc'
      }
    }
    );

    const { Table = [] } = response.data;
    if (Table.length === 0) {
      toast.error(`${t("No SAS Applications Found")}`);
      return
    }
 
    if (isEditable) {
      
     
     
       await CopyBookData();
      
     
  //change sp
      setLoading(true);
      const data = {
       propertyCode: formData.propertyNumber,
        categoryId: formData.propertyType,
    
        puidNo: formData.verifySASNUM,
        loginId: "crc",
        P_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')),
 
      };
      try {
        await axiosInstance.post('BBMPCITZAPI/INS_UPD_NCL_PROPERTY_CATEGORY_SASDATA_TEMP', data
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
        setIsEditable(false);
        setLoading(false);
        localStorage.setItem("userProgress", 4);
          navigate('/KaveriData')
    
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
      localStorage.setItem("userProgress", 4);
        navigate('/KaveriData')
    
    }
    setLoading(false);
  }
    

  

  const handleSASClick = async () => {

    if (!formData.verifySASNUM || formData.verifySASNUM.length === 0) {
      toast.error(`${t("provideSasAppNumber")}`);
      return;
    }

    if (!handleSASClicks) {
      sethandleSASClicks(true);


      try {
        const copy = await CopyBookData();
        if (copy) {
          //   toast.success("Copy From BBMP Books Data Was Successful.");
        } else {
          toast.error(`${t("copyFailed")}`);
          sethandleSASClicks(false);
          setLoading(false)
          return;
        }

        const response = await axiosInstance.get(
          'BBMPCITZAPI/GetTaxDetails', {
          params: {
            applicationNo: formData.verifySASNUM,
            propertycode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
            P_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO')),
            loginId: 'crc'
          }
        }
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
}
const handleSASDelete = () => {
  setSASTableData([])
}

const viewSample = () => {
  setIsDialogOpen(true);
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
    <Container maxWidth="lg">
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 4, borderRadius: 2, mt: 8 }}>
        <ToastContainer />
        <ViewSample
        open={isDialogOpen}
        onClose={handleCloseDialog}
        TypofImage={"SAS"}
      />
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
          <Grid item xs={12} sm={12}>
            <FormControl fullWidth  >
              <InputLabel>
                <LabelWithAsterisk text={t('SelectthePropertyType')} />
              </InputLabel>
              <Select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                inputProps={{ readOnly: !isEditable }}

                sx={{ backgroundColor: !isEditable ? '' : "#ffff" }}
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
                    variant={isEditable ? "outlined" : "filled"}
                    label={<LabelWithAsterisk text={t('SASBaseApplicationNo')} />}
                    name="verifySASNUM"
                    value={formData.verifySASNUM}
                    onChange={handleChange}
                   
             
                    InputProps={{
                      readOnly: !isEditable,
                      style: { backgroundColor: !isEditable ? '' : "#ffff" },
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
                <Grid item xs={12} sm={6}>
                  <Button color='success'
                    variant={"contained"}
                    disabled={!isEditable}
                    onClick={handleSASClick}>
                    {t("VerifySASApplicationNumber")}
                  </Button>
                  <Button color="primary" onClick={viewSample}>{t("View Sample")}</Button>
                </Grid>


             </Grid>

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
                          <TableCell><Button variant='outlined' color='error' onClick={handleSASDelete} disabled={!isEditable}>Delete</Button></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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
                 
                  <Button variant="contained" color="success" onClick={handleSubmit} >
                    {t("save")}
                  </Button>
                </Box>
              </Grid>
            <KaveriData />
       
      </Box>
    </Container>
  );
};


export default TaxDetails;
