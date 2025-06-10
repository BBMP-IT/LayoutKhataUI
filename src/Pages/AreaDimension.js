import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, Tooltip, IconButton,
  Radio, RadioGroup, FormControlLabel, FormControl,
  MenuItem,
  Select,
  InputLabel
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../components/Axios';
import LabelWithAsterisk from '../components/LabelWithAsterisk'
const AreaDimension = () => {
  const [formData, setFormData] = useState({
    east: '',
    Bookeast: '',
    noofSides: "",
    west: '',
    north: '',
    south: '',
    ns: "",
    ew: "",
    plotAreaSqFt: "",
    plotAreaSqMt: "",
    Bookwest: '',
    Booknorth: '',
    Booksouth: '',
    Bookns: "",
    Bookew: "",
    BookplotAreaSqFt: "",
    BookplotAreaSqMt: "",
    builtUpAreaSqFt: "",
    builtUpAreaSqMt: "",
    KaveriAreaSQFT:"",
    KaveriAreaSQMT:"",
    modify: 'no',
    modifycheckbandi: 'no',
    oddSite: '',
    propertyType: "",
    ApartCarpetArea: "",
    ApartAddtionalArea: "",
    ApartSuperBuiltArea: "",
    cal1: "",
    cal2: "",
    cal3: "",
    cal4: "",
    cal5: "",
    cal6: "",
    cal7: "",
    cal8: "",
    cal9: "",
    cal10: "",
    sqFt: "",
    sqMt: "",
  });
  const { t } = useTranslation();
  const [isEditable, setIsEditable] = useState(false);
  const [isEditablecheckbandhi, setIsEditablecheckbandi] = useState(false);
  const navigate = useNavigate();
  const [MatrixData,setMatrixData] = useState();
  const [isOddSiteEnabled, setIsOddSiteEnabled] = useState(false);
  const calculateArea = (numberOfSides, formData) => {

    // Extract the cal values dynamically based on the number of sides
    const values = Array.from({ length: numberOfSides }, (_, i) =>
      parseFloat(formData[`cal${i + 1}`])
    );

    // Check if all relevant values are greater than 0 and not NaN
    if (values.some(val => val <= 0 || isNaN(val))) {
      return { areaFt: "Invalid Data", areaMt: "Invalid Data" }; // Return empty if any value is invalid
    }

    let areaFt = 1;

   if (numberOfSides === 3) {

       const [a, b, c] = values;
       const s = (a + b + c) / 2;
       areaFt = Math.sqrt(s * (s - a) * (s - b) * (s - c));
       areaFt = Math.round(areaFt * 100) / 100;
     } else {

      const s = values.reduce((acc, val) => acc + val, 0) / 2;

      for (const side of values) {
        areaFt *= (s - side);
      }
      areaFt = Math.round(Math.sqrt(areaFt) * 100) / 100;
    }

    // Convert to meters (ft to m conversion)
    const areaMt = areaFt > 0 ? Math.round(areaFt * 0.092903 * 100) / 100 : "Invalid Data";
    if (areaMt === "Invalid Data") {
      areaFt = "Invalid Data"
    }
    return { areaFt, areaMt };

  };
const handleAddressEdit = () => {
  setIsEditable(true);
  setIsEditablecheckbandi(true);
}
  const handleChange = (e) => {

    const { name, value } = e.target;
    const updatedValue = parseFloat(value) || 0;

    if (name === 'ns' || name === 'ew') {
      const nsValue = name === 'ns' ? updatedValue : formData.ns;
      const ewValue = name === 'ew' ? updatedValue : formData.ew;
      if (nsValue !== 0 && ewValue !== 0) {
        const plotAreaSqFt = Math.round((nsValue > 0 ? nsValue : 1) * (ewValue > 0 ? ewValue : 1) * 100) / 100;
        const plotAreaSqMt = Math.round(plotAreaSqFt * 0.092903 * 100) / 100;
        formData.plotAreaSqFt = plotAreaSqFt;
        formData.plotAreaSqMt = plotAreaSqMt;
      }
      else {
        formData.plotAreaSqFt = 0;
        formData.plotAreaSqMt = 0;
      }
    }
   if(name === 'KaveriAreaSQFT'){
    const areaMtKave = value > 0 ? Math.round(value * 0.092903 * 100) / 100 : "Invalid Data";
    formData.KaveriAreaSQMT = areaMtKave;
   }
    if (name.startsWith('cal')) {

      const updatedFormData = {
        ...formData,
        [name]: value,
      };
      const { areaFt, areaMt } = calculateArea(formData.noofSides, updatedFormData);


      formData.sqFt = areaFt;
      formData.sqMt = areaMt;

      setFormData(prevData => ({
        ...prevData,
        // sqFt: areaFt.toString(),
        //  sqMt: areaMt.toString()
      }));
    }
   
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleApparatmentChange = (e) => {
    const { name, value } = e.target;
    if(name === "ApartAddtionalArea"){
      formData.ApartAddtionalArea = value;
    
    }else if(name === "ApartCarpetArea"){
      formData.ApartCarpetArea = value;
    }
    formData.ApartSuperBuiltArea = parseFloat(formData.ApartAddtionalArea) + parseFloat(formData.ApartCarpetArea);
    setFormData({
      ...formData,
      [name]: value
    });
  }
  const validateFormData = React.useCallback(async (formData) => {
    debugger
    const errors = {};

    const isInvalid = (value) => value === '' || value === '0';
    if (formData.propertyType !== 3) {
      if (isInvalid(formData.east) || isInvalid(formData.west) || isInvalid(formData.north) || isInvalid(formData.south)) {
        errors.checkbandhi = `${t("Please ensure all Checkbandhi values are Entered")}`;
      }
    }
    // if (formData.propertyType === 3) {
    //   if (isInvalid(formData.ApartCarpetArea) || isInvalid(formData.ApartAddtionalArea) || isInvalid(formData.ApartSuperBuiltArea)) {
    //     errors.apartmentValues = `${t("Please ensure all Apartment values are Entered and More than 0")}`
    //   }
    // }

    if (formData.oddSite === "Y" && formData.propertyType !== 3 ) {
      if(formData.noofSides.length === 0){
        errors.noofSides = "Please Enter the No of Side";
        
      }
      if(formData.KaveriAreaSQFT !== formData.sqFt && formData.noofSides){
        if(formData.KaveriAreaSQFT === 0){
          errors.KaveriArea = "Please ensure Sq(ft) values are Entered and More than 0."
        }
        const differencePercentage = (Math.abs(formData.KaveriAreaSQFT - formData.sqFt) / formData.sqFt) * 100;
        if (differencePercentage > 30) {
          if(MatrixData === "1"){
          errors.acutalPercentageDifference = "The Deed SqFt value differs by more than 30% from the calculated SqFt value."
          }else {
            errors.acutalPercentageDifference = "The Site Area Sqft value differs by more than 30% from the calculated SqFt value."

          }
        }
      }

      for (let i = 1; i <= formData.noofSides; i++) {
        if (isInvalid(formData[`cal${i}`])) {
          if (i === 1) {
            errors[`cal${i}`] = `Please ensure Road Side Length is Entered and More than 0.`;
          } else {
            errors[`cal${i}`] = `Please ensure Length${i} value is Entered and More than 0.`;

          }
        }
      }
    } else {
      // Validate ns and ew
      if(formData.propertyType !== 3){
      if (isInvalid(formData.ns)) {
        errors.nsEw = 'Please ensure N-S (ft) values are Entered and More than 0.';
      }
      else if (isInvalid(formData.ew)) {
        errors.nsEw = 'Please ensure E-W (ft) values are Entered and More than 0.';
      }
    }
      debugger
      if(formData.propertyType !== 3){
        if(formData.KaveriAreaSQFT === 0){
          errors.KaveriArea = "Please ensure Sq(ft) values are Entered and More than 0."
        }
      if(formData.KaveriAreaSQFT !== formData.plotAreaSqFt){
        const differencePercentage = (Math.abs(formData.KaveriAreaSQFT - formData.plotAreaSqFt) / formData.plotAreaSqFt) * 100;
        if (differencePercentage > 20) {
          if(MatrixData === "1"){
            errors.acutalPercentageDifference = "The Deed SqFt value differs by more than 20% from the calculated SqFt value."

          }else {
            errors.acutalPercentageDifference = "The Site Area Sqft value differs by more than 30% from the calculated SqFt value."

          }
        }
      }
    }
    }

    return errors;
  }, [t]);
  const fetchData = React.useCallback(async () => {

    try {
      const response = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_BBD_DRAFT_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=AREA_DIMENSION`);
      const response2 = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_NCLTEMP_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=AREA_DIMENSION`);
      const {
        Table1: Table1Data = [],
        Table2: Table2Data = [],
        Table3: Table3Data = [],
        Table4: Table4Data = []
      } = response.data;
      const {
        Table1: NCLTable1Data = [],
        Table2: NCLTable2Data = [],
        Table3: NCLTable3Data = [],
        Table4: NCLTable4Data = [],
        Table5: MatrixData = []
      } = response2.data;
     
      const updatedFormData = {
        propertyType: NCLTable1Data.length > 0 ? NCLTable1Data[0].PROPERTYCATEGORYID || "0" : "0",
        east: NCLTable1Data.length > 0 ? NCLTable1Data[0].CHECKBANDI_EAST : "",
        west: NCLTable1Data.length > 0 ? NCLTable1Data[0].CHECKBANDI_WEST || '' : '',
        north: NCLTable1Data.length > 0 ? NCLTable1Data[0].CHECKBANDI_NORTH || '' : '',
        south: NCLTable1Data.length > 0 ? NCLTable1Data[0].CHECKBANDI_SOUTH || '' : '',
        ns: NCLTable3Data.length > 0 ? NCLTable3Data[0].NORTHSOUTH || '' : '',
        ew: NCLTable3Data.length > 0 ? NCLTable3Data[0].EASTWEST || '' : '',
        plotAreaSqFt: NCLTable2Data.length > 0 ? NCLTable2Data[0].SITEAREAFT || '' : '',
        plotAreaSqMt: NCLTable2Data.length > 0 ? NCLTable2Data[0].SITEAREA || '' : '',
        KaveriAreaSQFT:NCLTable2Data.length > 0 ? NCLTable2Data[0].SITEAREA_KAVERI_FT || '' : '',
        KaveriAreaSQMT:NCLTable2Data.length > 0 ? NCLTable2Data[0].SITEAREA_KAVERI_MT || '' : '',
        Bookeast: Table1Data.length > 0 ? Table1Data.CHECKBANDI_EAST || '' : '',
        Bookwest: Table1Data.length > 0 ? Table1Data.CHECKBANDI_WEST || '' : '',
        Booknorth: Table1Data.length > 0 ? Table1Data.CHECKBANDI_NORTH || '' : '',
        Booksouth: Table1Data.length > 0 ? Table1Data.CHECKBANDI_SOUTH || '' : '',
        Bookns: Table3Data.length > 0 ? Table3Data[0].NORTHSOUTH || '' : '',
        Bookew: Table3Data.length > 0 ? Table3Data[0].EASTWEST || '' : '',
        BookplotAreaSqFt: Table2Data.length > 0 ? Table2Data[0].SITEAREAFT || '' : '',
        BookplotAreaSqMt: Table2Data.length > 0 ? Table2Data[0].SITEAREA || '' : '',
        builtUpAreaSqFt: NCLTable2Data.length > 0 ? NCLTable2Data[0].BUILDINGAREAFT || '' : Table2Data.length > 0 ? Table2Data[0].BUILDINGAREAFT || '' : '',
        builtUpAreaSqMt: NCLTable2Data.length > 0 ? NCLTable2Data[0].BUILDINGAREA || '' : Table2Data.length > 0 ? Table2Data[0].BUILDINGAREA || '' : '',
        ApartCarpetArea: NCLTable4Data.length > 0 ? NCLTable4Data[0].CARPETAREA || '' : Table4Data.length > 0 ? Table4Data[0].CARPETAREA || '' : '',
        ApartAddtionalArea: NCLTable4Data.length > 0 ? NCLTable4Data[0].ADDITIONALAREA || '' : Table4Data.length > 0 ? Table4Data[0].ADDITIONALAREA || '' : '',
        ApartSuperBuiltArea: NCLTable4Data.length > 0 ? NCLTable4Data[0].SUPERBUILTUPAREA || 0 : Table4Data.length > 0 ? Table4Data[0].SUPERBUILTUPAREA || '' : '',
        cal1: NCLTable3Data.length > 0 ? NCLTable3Data[0].EWODDSITE1FT || '' : Table3Data.length > 0 ? Table3Data[0].EWODDSITE1FT || '' : '',
        cal2: NCLTable3Data.length > 0 ? NCLTable3Data[0].EWODDSITE2FT || '' : Table3Data.length > 0 ? Table3Data[0].EWODDSITE1FT || '' : '',
        cal3: NCLTable3Data.length > 0 ? NCLTable3Data[0].EWODDSITE3FT || '' : Table3Data.length > 0 ? Table3Data[0].EWODDSITE1FT || '' : '',
        cal4: NCLTable3Data.length > 0 ? NCLTable3Data[0].EWODDSITE4FT || '' : Table3Data.length > 0 ? Table3Data[0].EWODDSITE1FT || '' : '',
        cal5: NCLTable3Data.length > 0 ? NCLTable3Data[0].NSODDSITE1FT || '' : Table3Data.length > 0 ? Table3Data[0].NSODDSITE1FT || '' : '',
        cal6: NCLTable3Data.length > 0 ? NCLTable3Data[0].NSODDSITE2FT || '' : Table3Data.length > 0 ? Table3Data[0].NSODDSITE1FT || '' : '',
        cal7: NCLTable3Data.length > 0 ? NCLTable3Data[0].NSODDSITE3FT || '' : Table3Data.length > 0 ? Table3Data[0].NSODDSITE1FT || '' : '',
        cal8: NCLTable3Data.length > 0 ? NCLTable3Data[0].NSODDSITE4FT || '' : Table3Data.length > 0 ? Table3Data[0].NSODDSITE1FT || '' : '',
        cal9: NCLTable3Data.length > 0 ? NCLTable3Data[0].SIDE9 || '' : Table3Data.length > 0 ? Table3Data[0].SIDE9 || '' : '',
        cal10: NCLTable3Data.length > 0 ? NCLTable3Data[0].SIDE10 || '' : Table3Data.length > 0 ? Table3Data[0].SIDE10 || '' : '',
        noofSides: NCLTable3Data.length > 0 ? NCLTable3Data[0].ODDSITENOOFSIDES || 4 : Table3Data.length > 0 ? Table3Data[0].ODDSITENOOFSIDES || 4 : 4,
        oddSite: NCLTable3Data.length > 0 ? NCLTable3Data[0].ODDSITE || '' : Table3Data.length > 0 ? Table3Data[0].ODDSITE || '' : '',
      }
      setFormData(updatedFormData);
      debugger
      setMatrixData(MatrixData[0].KAVERIDOC_AVAILABLE)
      
      console.log(MatrixData)
      const validationErrors = await validateFormData(updatedFormData);
      debugger
      if (Object.keys(validationErrors).length > 0) {
        setIsEditable(true)
        setIsEditablecheckbandi(true)
      }
      if (NCLTable3Data.length > 0) {
        if (NCLTable3Data[0].ODDSITE === "Y") {
          setIsOddSiteEnabled(true)

        }
        else {
          setIsOddSiteEnabled(false)
        }
      }
      else if (Table3Data.length > 0) {
        if (Table3Data[0].ODDSITE === "Y") {
          setIsOddSiteEnabled(true)

        }
        else {
          setIsOddSiteEnabled(false)
        }
      }
      debugger
     
    }
    catch (error) {
      navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
    }
  }, [navigate,validateFormData]);
 
  
  useEffect(() => {
    // fetchData();
  }, [fetchData]);
 

  const handleCalulation = () => {

    const { areaFt, areaMt } = calculateArea(formData.noofSides, formData);
    formData.sqFt = areaFt;
    formData.sqMt = areaMt;
    setFormData(prevData => ({
      ...prevData,

    }));

  }
 
  const handleCalulationNCL =  React.useCallback(async (TableData) => {

    const { areaFt, areaMt } = calculateArea(formData.noofSides, TableData);
    formData.sqFt = areaFt;
    formData.sqMt = areaMt;
    setFormData(prevData => ({
      ...prevData,
      // sqFt: areaFt.toString(),
      //  sqMt: areaMt.toString()

    }));

  }, [formData]);
  useEffect(() => {
    if (isOddSiteEnabled) {
      handleCalulationNCL(formData);
    }
  }, [handleCalulationNCL,formData, isOddSiteEnabled]);
  
  
  const handleSubmit = async (e) => {
    debugger
    e.preventDefault();
    
    const validationErrors = await validateFormData(formData);

    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).join('\n');
      toast.error(errorMessages);
      return;
    }
    if (isEditablecheckbandhi === true && formData.propertyType !== 3) //only checkbandhi data
    {

      const checkbandhidata =
      {
        propertyCode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
        checkbandI_NORTH: formData.north,
        checkbandI_SOUTH: formData.south,
        checkbandI_EAST: formData.east,
        checkbandI_WEST: formData.west,
        loginId: "crc",
        p_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))
      }

      try {
        await axiosInstance.post('BBMPCITZAPI/UPD_NCL_PROPERTY_MAIN_TEMP_CHECKBANDI', checkbandhidata
        )

        
        setIsEditablecheckbandi(false);
        setFormData({
          ...formData,
          modifycheckbandi: 'no',
        });
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
          navigate('/ErrorPage', { state: { errorMessage: error.message } });
        }, 500);
      }
    }

    if ((formData.propertyType === 1 || formData.propertyType === 2) && (isEditable)) {
      
      if (formData.oddSite === "Y") {
        if (formData.noofSides === "0" || formData.noofSides === "") {
          
          toast.error(`${t("Please Select the no of Sides")}`)
          return
        }
        if(formData.sqFt === "Invalid Data" || formData.sqMt === "Invalid Data"){
          toast.error(`${t("SqFt and SqMt cannot be Invalid")}`)
          return
        }
      
      }
      
      const data = {
        propertyCode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
        evenoroddsite: formData.oddSite === "Y" ? "ODD" : "EVEN",
        sitearea: formData.plotAreaSqMt || null,
        siteareaft: formData.plotAreaSqFt || null,
        buildingarea: formData.builtUpAreaSqMt || null,
        buildingareaft: formData.builtUpAreaSqFt || null,
        eastwest: formData.ew.toString() || null,
        northsouth: formData.ns.toString() || null,
        ewoddsitE1FT: formData.cal1 || null,
        ewoddsitE2FT: formData.cal2 || null,
        ewoddsitE3FT: formData.cal3 || null,
        ewoddsitE4FT: formData.cal4 || null,
        nsoddsitE1FT: formData.cal5 || null,
        nsoddsitE2FT: formData.cal6 || null,
        nsoddsitE3FT: formData.cal7 || null,
        nsoddsitE4FT: formData.cal8 || null,
        sidE9: formData.cal9 || null,
        sidE10: formData.cal10 || null,
        siteareA_KAVERI_FT:formData.KaveriAreaSQFT || null,
        siteareA_KAVERI_MT:formData.KaveriAreaSQMT|| null,
        oddSiteSides: formData.noofSides || null,
        loginId: "crc",
        p_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))
      };

      try {
        await axiosInstance.post('BBMPCITZAPI/UPD_NCL_PROPERTY_SITE_DIMENSION_TEMP', data
        )

        

        setIsEditable(false);
        setIsEditablecheckbandi(false);
        setTimeout(async () => {


          setFormData({
            ...formData,
            modify: 'no',
            modifycheckbandi: 'no',
          });
        }, 500);

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
          navigate('/ErrorPage', { state: { errorMessage: error.message } });
        }, 500);
      }
    }
    else if (formData.propertyType === 3 && isEditable === true) //only 3
    {
      const data = {
        propertyCode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
        carpetarea: formData.ApartCarpetArea || null,
        additionalarea: formData.ApartAddtionalArea || null,
        superbuiltuparea: formData.ApartSuperBuiltArea || null,
        loginId: "crc",
        p_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))
      };

      try {
        await axiosInstance.post('BBMPCITZAPI/UPD_NCL_PROPERTY_APARTMENT_TEMP_AREA', data
        )
        
        setIsEditable(false);
        setTimeout(async () => {


          setFormData({
            ...formData,
            modify: 'no',
          });
        }, 500);

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
          navigate('/ErrorPage', { state: { errorMessage: error.message } });
        }, 500);
      }
    }
    if (isEditable || isEditablecheckbandhi) {
      toast.success(`${t("detailsSavedSuccess")}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setTimeout(() => {

      handleNavigation();
    }, 500);
  };
  const back = () => {
    navigate('/LocationDetails')
  }
  const handleNavigation = async () => {
    

    const validationErrors = await validateFormData(formData);
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).join('\n');
      toast.error(errorMessages);
      return;
    }
    localStorage.setItem("userProgress", 8);
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
  const handleOddSiteChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === 'oddSite' && value === 'N') {
      setIsOddSiteEnabled(false);

    } else if (name === 'oddSite' && value === 'Y') {
      setIsOddSiteEnabled(true);
      handleCalulation()
    }
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (

    <Container maxWidth="lg">
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 4, borderRadius: 2, mt: 8 }}>
        <ToastContainer />
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              marginBottom: 3,
            }}
          >
            {t("PropertyUseDetails")}
          </Typography>

          {formData.propertyType === 3 && (
            <Grid container spacing={3}>

              
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth

                  label={t('CarpetArea')}
                  name="ApartCarpetArea"
                  value={formData.ApartCarpetArea}
                  onChange={handleApparatmentChange}
                  type="number"
                  variant={isEditable ? "outlined" : "filled"}
                  InputProps={{
                    readOnly: !isEditable,
                    style: { backgroundColor: !isEditable ? '' : "#ffff" },
                    endAdornment: (
                      <Tooltip title="Calculated as N-S * E-W">
                        <IconButton>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth

                  label={t('AdditionalArea')}
                  name="ApartAddtionalArea"
                  value={formData.ApartAddtionalArea}
                  onChange={handleApparatmentChange}
                  type="number"
                  variant={isEditable ? "outlined" : "filled"}
                  InputProps={{
                    readOnly: !isEditable,
                    style: { backgroundColor: !isEditable ? '' : "#ffff" },
                    endAdornment: (
                      <Tooltip title="Calculated as N-S * E-W">
                        <IconButton>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth

                  label={t('SuperBuiltArea')}
                  name="ApartSuperBuiltArea"
                  value={formData.ApartSuperBuiltArea}
                  onChange={handleApparatmentChange}
                  type="number"
                  variant={ "filled"}
                  InputProps={{
                   // readOnly: !isEditable,
                   readOnly: true,
                //    style: { backgroundColor: !isEditable ? '' : "#ffff" },
                    endAdornment: (
                      <Tooltip title="Calculated as N-S * E-W">
                        <IconButton>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </Grid>

            </Grid>
          )}
          {(formData.propertyType === 1) && (
            <div>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                {t("ScheduleOfTheProperty")}
              </Typography>
             
              <Typography
                variant="h6"
                align="left"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
                {t("AsPerBBMPBooks")}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label={t("East")}
                    name="Bookeast"
                    value={formData.Bookeast}
                    onChange={handleChange}
                    variant={"filled"}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label={t("West")}
                    name="Bookwest"
                    value={formData.Bookwest}
                    onChange={handleChange}
                    variant={"filled"}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label={t("North")}
                    name="Booknorth"
                    value={formData.Booknorth}
                    onChange={handleChange}
                    variant={"filled"}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label={t("South")}
                    name="Booksouth"
                    value={formData.Booksouth}
                    onChange={handleChange}
                    variant={"filled"}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
              </Grid>
              <br></br>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label={<LabelWithAsterisk text={t('East')} />}
                    name="east"
                    value={formData.east}
                    multiline 
                    onChange={handleChange}
                    variant={isEditablecheckbandhi ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditablecheckbandhi,
                      style: { backgroundColor: !isEditablecheckbandhi ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    name="west"
                    label={<LabelWithAsterisk text={t('West')} />}
                    value={formData.west}
                    onChange={handleChange}
                    multiline 
                    variant={isEditablecheckbandhi ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditablecheckbandhi,
                      style: { backgroundColor: !isEditablecheckbandhi ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth

                    name="north"
                    label={<LabelWithAsterisk text={t('North')} />}
                    value={formData.north}
                    onChange={handleChange}
                    multiline 
                    variant={isEditablecheckbandhi ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditablecheckbandhi,
                      style: { backgroundColor: !isEditablecheckbandhi ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth

                    label={<LabelWithAsterisk text={t('South')} />}
                    name="south"
                    value={formData.south}
                    onChange={handleChange}
                    multiline 
                    variant={isEditablecheckbandhi ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditablecheckbandhi,
                      style: { backgroundColor: !isEditablecheckbandhi ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
              </Grid>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginY: 2 }}>
                {t("Additional Details")}
              </Typography>
             
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginY: 2 }}>
                {t("OddSite")}
              </Typography>
              <FormControl component="fieldset" sx={{ marginBottom: 3 }}>
                <RadioGroup row name="oddSite" value={formData.oddSite} onChange={handleOddSiteChange}>
                  <FormControlLabel value="Y" control={<Radio disabled={!isEditable} />} label={t("Yes")} />
                  <FormControlLabel value="N" control={<Radio disabled={!isEditable} />} label={t("No")} />
                </RadioGroup>
              </FormControl>
              {MatrixData === "1" && 
              <Typography
                variant="h6"
                align="left"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
                {t("Area as per Deed Document")}
                
              </Typography>
}
{MatrixData !== "1" &&
              <Typography
                variant="h6"
                align="left"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
                  {t("Site Area")}
                
              </Typography>
}
              <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
              <TextField
                      fullWidth
                      label={t("Sq (ft)")}
                      name="KaveriAreaSQFT"
                      value={formData.KaveriAreaSQFT}
                      onChange={handleChange}
                      type="number"
                      variant={MatrixData !== "1"  && isEditable ? "outlined": "filled" }
                      InputProps={{
                        readOnly: MatrixData !== "1"  && isEditable ? false : true,
                        style: { backgroundColor: (MatrixData !== "1") && isEditable ? "#ffff"  : ""  },
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">   
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                    </Grid>
                      <Grid item xs={6} sm={3}>
                     <TextField
                      fullWidth
                      label={t("Sq (mt)")}
                      name="KaveriAreaSQMT"
                      value={formData.KaveriAreaSQMT}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly:  true,
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                    </Grid>
                    </Grid>
                    <br></br>
              <Typography variant="h6" sx={{ fontWeight: 'bold', }}>
              </Typography>
              {(isOddSiteEnabled === false) && (
                <>
              <Typography
                variant="h6"
                align="left"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
                {t("AsPerBBMPBooks")}
              </Typography>
              </>
              )}
                {(isOddSiteEnabled === true) && (
                <>
              <Typography
                variant="h6"
                align="left"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
                {t("Area Dimensions")}
              </Typography>
              </>
                )}
              {(isOddSiteEnabled === false) && (

                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("N-S (ft)")}
                      name="Bookns"
                      value={formData.Bookns}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("E-W (ft)")}
                      name="Bookew"
                      value={formData.Bookew}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,

                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("PLOT AREA(N-S*E-W)")}
                      name="BookplotAreaSqFt"
                      value={formData.BookplotAreaSqFt}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Calculated as N-S * E-W">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("Plot Area (Sq.Mt)")}
                      name="BookplotAreaSqMt"
                      value={formData.BookplotAreaSqMt}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />

                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth

                      label={<LabelWithAsterisk text={t('N-S (ft)')} />}
                      name="ns"
                      value={formData.ns}
                      onChange={handleChange}
                      type="number"
                      variant={isEditable ? "outlined" : "filled"}
                      InputProps={{
                        readOnly: !isEditable,
                        style: { backgroundColor: !isEditable ? '' : "#ffff" },
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth

                      label={<LabelWithAsterisk text={t("E-W (ft)")} />}
                      name="ew"
                      value={formData.ew}
                      onChange={handleChange}
                      type="number"
                      variant={isEditable ? "outlined" : "filled"}
                      InputProps={{
                        readOnly: !isEditable,
                        style: { backgroundColor: !isEditable ? '' : "#ffff" },
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("PLOT AREA(N-S*E-W)")}
                      name="plotAreaSqFt"
                      value={formData.plotAreaSqFt}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Calculated as N-S * E-W">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("Plot Area (Sq.Mt)")}
                      name="plotAreaSqMt"
                      value={formData.plotAreaSqMt}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />

                  </Grid>
                </Grid>
              )}
            </div>
          )}
          {(formData.propertyType === 2) && (
            <div>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                {t("ScheduleOfTheProperty")}
              </Typography>
             
              <Typography
                variant="h6"
                align="left"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
                {t("AsPerBBMPBooks")}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label={t("East")}
                    name="Bookeast"

                    value={formData.Bookeast}
                    onChange={handleChange}
                    variant={"filled"}
                    InputProps={{
                      readOnly: true,

                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label={t("West")}
                    name="Bookwest"

                    value={formData.Bookwest}
                    onChange={handleChange}
                    variant={"filled"}
                    InputProps={{
                      readOnly: true,

                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label={t("North")}
                    name="Booknorth"

                    value={formData.Booknorth}
                    onChange={handleChange}
                    variant={"filled"}
                    InputProps={{
                      readOnly: true,

                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label={t("South")}
                    name="Booksouth"

                    value={formData.Booksouth}
                    onChange={handleChange}
                    variant={"filled"}
                    InputProps={{
                      readOnly: true,

                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
              </Grid>
              <br></br>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    multiline 
                    label={<LabelWithAsterisk text={t('East')} />}
                    name="east"
                    value={formData.east}
                    onChange={handleChange}
                    variant={isEditablecheckbandhi ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditablecheckbandhi,
                      style: { backgroundColor: !isEditablecheckbandhi ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth

                    label={<LabelWithAsterisk text={t('West')} />}
                    name="west"
                    multiline 
                    value={formData.west}
                    onChange={handleChange}
                    variant={isEditablecheckbandhi ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditablecheckbandhi,
                      style: { backgroundColor: !isEditablecheckbandhi ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth

                    label={<LabelWithAsterisk text={t('North')} />}
                    name="north"
                    multiline 
                    value={formData.north}
                    onChange={handleChange}
                    variant={isEditablecheckbandhi ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditablecheckbandhi,
                      style: { backgroundColor: !isEditablecheckbandhi ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth

                    label={<LabelWithAsterisk text={t('South')} />}
                    name="south"
                    multiline 
                    value={formData.south}
                    onChange={handleChange}
                    variant={isEditablecheckbandhi ? "outlined" : "filled"}
                    InputProps={{
                      readOnly: !isEditablecheckbandhi,
                      style: { backgroundColor: !isEditablecheckbandhi ? '' : "#ffff" },
                      endAdornment: (
                        <Tooltip title="Converted from Sq.ft">
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
              </Grid>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginY: 2 }}>
                {t("Additional Details")}
              </Typography>
             
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginY: 2 }}>
                {t("OddSite")}
              </Typography>
              <FormControl component="fieldset" sx={{ marginBottom: 3 }}>
                <RadioGroup row name="oddSite" value={formData.oddSite} onChange={handleOddSiteChange}>
                  <FormControlLabel value="Y" control={<Radio />} label={t("Yes")} />
                  <FormControlLabel value="N" control={<Radio />} label={t("No")} />
                </RadioGroup>
              </FormControl>
              <Typography variant="h6" sx={{ fontWeight: 'bold', }}>
              </Typography>
              {MatrixData === "1" && 
              <Typography
                variant="h6"
                align="left"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
                {t("Area as per Deed Document")}
                
              </Typography>
}
{MatrixData !== "1" &&
              <Typography
                variant="h6"
                align="left"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
               {t("Site Area")}
                
              </Typography>
}
              <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
              <TextField
                      fullWidth
                      label={t("Sq (ft)")}
                      name="KaveriAreaSQFT"
                      value={formData.KaveriAreaSQFT}
                      onChange={handleChange}
                      type="number"
                      variant={MatrixData !== "1"  && isEditable ? "outlined": "filled" }
                      InputProps={{
                        readOnly: MatrixData !== "1"  && isEditable ? false : true,
                        style: { backgroundColor: (MatrixData !== "1") && isEditable ? "#ffff"  : ""  },
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                    </Grid>
                      <Grid item xs={6} sm={3}>
                     <TextField
                      fullWidth
                      label={t("Sq (mt)")}
                      name="Bookns"
                      value={formData.KaveriAreaSQMT}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                    </Grid>
                    </Grid>
                    <br></br>
              {(isOddSiteEnabled === false) && (
                <>
              <Typography
                variant="h6"
                align="left"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
              
                {t("AsPerBBMPBooks")}
              </Typography>
              </>
              )}
               {(isOddSiteEnabled === true) && (
                <>
              <Typography
                variant="h6"
                align="left"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
                {t("Area Dimensions")}
              </Typography>
              </>
               )}
              {(isOddSiteEnabled === false) && (
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("N-S (ft)")}
                      name="ns"
                      value={formData.Bookns}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,

                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("E-W (ft)")}
                      name="ew"
                      value={formData.Bookew}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,

                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("PLOT AREA(N-S*E-W)")}
                      name="BookplotAreaSqFt"
                      value={formData.BookplotAreaSqFt}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Calculated as N-S * E-W">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("Plot Area (Sq.Mt)")}
                      name="BookplotAreaSqMt"
                      value={formData.BookplotAreaSqMt}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth

                      label={<LabelWithAsterisk text={t("N-S (ft)")} />}
                      name="ns"
                      value={formData.ns}
                      onChange={handleChange}
                      type="number"
                      variant={isEditable ? "outlined" : "filled"}
                      InputProps={{
                        readOnly: !isEditable,
                        style: { backgroundColor: !isEditable ? '' : "#ffff" },
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={<LabelWithAsterisk text={t("E-W (ft)")} />}
                      name="ew"
                      value={formData.ew}
                      onChange={handleChange}
                      type="number"
                      variant={isEditable ? "outlined" : "filled"}
                      InputProps={{
                        readOnly: !isEditable,
                        style: { backgroundColor: !isEditable ? '' : "#ffff" },
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("PLOT AREA(N-S*E-W)")}
                      name="plotAreaSqFt"
                      value={formData.plotAreaSqFt}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Calculated as N-S * E-W">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("Plot Area (Sq.Mt)")}
                      name="plotAreaSqMt"
                      value={formData.plotAreaSqMt}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("Built-UpArea(ft)")}
                      name="builtUpAreaSqFt"
                      value={formData.builtUpAreaSqFt}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label={t("Built-UpArea(mt)")}
                      name="builtUpAreaSqMt"
                      value={formData.builtUpAreaSqMt}
                      onChange={handleChange}
                      type="number"
                      variant={"filled"}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Converted from Sq.ft">
                            <IconButton>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </div>

          )}
          {isOddSiteEnabled && formData.propertyType !== 3 && (
            <FormControl
              fullWidth
            >
              <InputLabel>
                <LabelWithAsterisk text={t('NoofSides')} />
              </InputLabel>
              <Select
                name="noofSides"
                value={formData.noofSides}
                onChange={handleChange}
                inputProps={{ readOnly: !isEditable }}
                sx={{ backgroundColor: !isEditable ? '' : "#ffff", width: "20%" }}
              >
                <MenuItem value="">--Select--</MenuItem>
                {[3,4, 5, 6, 7, 8, 9, 10].map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>

            </FormControl>
          )}
          <br></br>
          <br></br>
          <br></br>
          {isOddSiteEnabled && formData.propertyType !== 3 && formData.noofSides&& (
            
              
              
           
           
            <Grid container spacing={3} alignItems="center" justifyContent="center" 
            sx={{ 
              border: '5px solid #1976d2', 
              borderRadius: '8px', 
              padding: '16px', // Adds padding inside the border
              width: 'fit-content', // Ensures the grid shrinks to fit content
            }}
            >
              
              <Grid item>
                <Grid container spacing={1} alignItems="center" justifyContent="center">
                  <Grid item>
                    {Array.from({ length: formData.noofSides }).map((_, index) => (
                      <TextField
                        key={index}
                        variant={isEditable ? "outlined" : "filled"}
                        placeholder={index + 1 === 1 ? `${t("RoadFacedSideLength")}` : `${t("Length")} ${index + 1} (Ft)`}
                        name={`cal${index + 1}`}
                        type="number"
                        value={formData[`cal${index + 1}`] || ''}
                        onChange={handleChange}
                        sx={{ width: '31.3%', borderColor: '#016767', paddingRight: '2%', paddingTop: "1%" }}
                        InputProps={{
                          readOnly: !isEditable,
                          style: { backgroundColor: !isEditable ? '' : "#ffff" },
                        }}
                      />
                    ))}
                  </Grid>
                </Grid>
              </Grid>
              {formData.noofSides && (
                <Grid item>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Typography>Sq.Ft.</Typography>
                    </Grid>
                    <Grid item>
                      <TextField
                        variant="filled"
                        size="medium"
                        name="sqFt"

                        value={formData.sqFt}
                        onChange={handleChange}
                        sx={{ width: '300px', borderColor: '#016767' }}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <Typography>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Typography>
                    </Grid>
                    <Grid item>
                      <Typography>Sq.Mt.</Typography>
                    </Grid>
                    <Grid item>
                      <TextField
                        variant="filled"
                        size="medium"
                        name="sqMt"

                        value={formData.sqMt}
                        onChange={handleChange}
                        InputProps={{
                          readOnly: true,
                        }}
                        sx={{ width: '300px', borderColor: '#016767' }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          )}
          <Box display="flex" justifyContent="center" gap={2} mt={3}>
            <Button variant="contained" color="primary" onClick={back}>
              {t("Previous")}
            </Button>
            {!isEditable && !isEditablecheckbandhi && (
                    <Button variant="contained" color="primary" onClick={handleAddressEdit}>
                      {t("Edit")}
                    </Button>
                  )}
            <Button variant="contained" color="success" type="submit">
              {t("save")}
            </Button>

          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default AreaDimension;
