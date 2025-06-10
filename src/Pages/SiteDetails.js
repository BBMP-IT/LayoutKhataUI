import React, { useState } from 'react';
import {
   Button, Box, Container, Typography,
  FormControl, MenuItem, Select, InputLabel, FormHelperText,Skeleton 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import '../components/Shake.css';
import LabelWithAsterisk   from '../components/LabelWithAsterisk'
const SiteDetails = () => {
  const [formData, setFormData] = useState({
    features: "",
    Typeofuse: "",
    yearOfConstruction: ""
  });
  const { t } = useTranslation();
  const validationSchema = React.useMemo(() => Yup.object().shape({
    features: Yup.string().required(`${t('usageCategoryRequired')}`).notOneOf(['0'], `${t('UsageCategoryInvalid')}`),
    // Typeofuse: Yup.string().required(`${t('typeOfUseRequired')}`).notOneOf(['0'], `${t('typeOfUseRequiredInvalid')}`),
    yearOfConstruction: Yup.string()
      .required(`${t('yearUsageRequired')}`)

    }), [t]);
  const navigate = useNavigate();
  const [tablesdata2, setTablesData2] = useState([]);
  const [tablesdata3, setTablesData3] = useState([]);
  const [tableYearMaster,setYearMaster] = useState([]);
  const [isInitialEditable,setInitialEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (name === "features") {
      try {
        const response = await axiosInstance.get(`BBMPCITZAPI/GET_MST_FEATURE_BY_FEATUREHEADID?FEATUREHEADID=${value}`);
        if (response.data.Table.length > 0) {
          setTablesData3(response.data.Table);
        }
      } catch (error) {
        toast.error(`${t("error Fetching data")}`, error)
        setTimeout(() => {
          navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
        }, 500);
      }
    }
    

    setFormData({
      ...formData,
      [name]: value
    });
  };


   

  const handleSubmit = async (e) => {
    
if(isInitialEditable){
    const data = {
      propertyCode: JSON.parse(localStorage.getItem('SETPROPERTYCODE')),
      featureheadid: formData.features,
      featureid: formData.Typeofuse || "0",
      builtyear: formData.yearOfConstruction,
      loginId: "crc",
      p_BOOKS_PROP_APPNO: JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))

    }

    try {
      await axiosInstance.post('BBMPCITZAPI/UPD_NCL_PROPERTY_SITE_TEMP_USAGE', data
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
        setInitialEditable(false);
        handleNavigation()
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
  }else{
    handleNavigation()
  }
  };
  const handleEdit = () => {
    if(isInitialEditable)
      {
      setInitialEditable(false);
    }
    else {
      setInitialEditable(true);
    }
  }
  const back = () => {
    navigate('/AreaDimension')
  }
  const handleNavigation = () => {
    localStorage.setItem("userProgress", 9);
    navigate('/ClassificationDocumentUploadPage')

  }
  const fetchData = React.useCallback(async () => {
    
    try {
      setLoading(true);
      const response1 = await axiosInstance.get('BBMPCITZAPI/GetMasterTablesData_React?UlbCode=555&Page=SITE_DETAILS');
      const response2 = await axiosInstance.get(`BBMPCITZAPI/GET_PROPERTY_PENDING_CITZ_NCLTEMP_React?ULBCODE=555&P_BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&Propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&Page=SITE_DETAILS`);;
      const { Table:MasterTable1 = [],Table2:MasterTable2 } = response1.data;
      const { Table1 = [] } = response2.data;
      if(Table1.length === 0){
        setInitialEditable(true)
      }
      const table2Item = Table1.length > 0 ? Table1[0] : [];
      const table16Item = MasterTable1.length > 0 ? MasterTable1 : [];
      const table18Item = MasterTable2.length > 0 ? MasterTable2 : [];
      setYearMaster(table18Item);
      setTablesData2(table16Item);
      
      if (table2Item) {
        if (table2Item.FEATUREHEADID !== null && table2Item.FEATUREHEADID !== "" && table2Item.FEATUREHEADID !== undefined) {
          const response3 = await axiosInstance.get(`BBMPCITZAPI/GET_MST_FEATURE_BY_FEATUREHEADID?FEATUREHEADID=${table2Item.FEATUREHEADID}`);
          if (response3.data.Table.length > 0) {
            setTablesData3(response3.data.Table);
          }
        }
        if (table2Item) {
          
          const updatedFormData = {
            features: table2Item.FEATUREHEADID || "",
            Typeofuse: table2Item.FEATUREID || "",
            yearOfConstruction: table2Item.BUILTYEAR || '',
          }
          setFormData(updatedFormData);
      debugger
      const isValid =await  validationSchema.isValid(updatedFormData);
      if(isValid){
        setInitialEditable(false);
      }else{
        setInitialEditable(true);
      }
        }
      }
      setLoading(false)
    } catch (error) {
      toast.error("something went wrong",error)
      setTimeout(() => {
        navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
      }, 500);
    }

  }, [navigate,validationSchema]);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
    }
  };
  React.useEffect(() => {

    fetchData();

  }, [fetchData]);

  return (
    <Container maxWidth="md">
      {/* <Loaders loading={loading} /> */}
      <ToastContainer />
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
                variant="h5"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                }}
              >
                {t("DetailsOfUsageOfVacantPlot")}
              </Typography>
              {loading ? (
          <>
            <Skeleton variant="text" height={60} sx={{ marginBottom: 3 }}  animation="wave"/>
            <Skeleton variant="rectangular" height={48} sx={{ marginBottom: 3 }}  animation="wave"/>
            <Skeleton variant="rectangular" height={48} sx={{ marginBottom: 3 }} animation="wave" />
            <Skeleton variant="rectangular" height={48} sx={{ marginBottom: 3 }}  animation="wave"/>
          </>
        ) : (
          <>
              <FormControl
                fullWidth
                error={touched.features && !!errors.features}
                sx={{ marginBottom: 3 }}
                className={touched.features && !!errors.features ? 'shake' : ''}
              >
                <InputLabel>
                <LabelWithAsterisk text={t('UsageCategory')} />
                </InputLabel>
                <Select
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ backgroundColor: !isInitialEditable?  '':"#ffff" }}
                      inputProps={{ readOnly: !isInitialEditable }}
                >
                  <MenuItem value="0">--Select--</MenuItem>
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
              <FormControl
                fullWidth
      
              >
                <InputLabel>
                   {t('Typeofuse')}</InputLabel>
                <Select
                  name="Typeofuse"
                  value={formData.Typeofuse}
                  onChange={handleChange}
                
                  sx={{ backgroundColor: !isInitialEditable?  '':"#ffff" }}
                      inputProps={{ readOnly: !isInitialEditable }}
                >
                  <MenuItem value="0">--Select--</MenuItem>
                  {tablesdata3.map((item) => (
                    <MenuItem key={item.FEATUREID} value={item.FEATUREID}>
                      {item.FEATURENAME_EN}
                    </MenuItem>
                  ))}
                </Select>
               
              </FormControl>

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
                      sx={{ backgroundColor: !isInitialEditable?  '':"#ffff" }}
                      inputProps={{ readOnly: !isInitialEditable }}
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
              <Box display="flex" justifyContent="center" gap={2} mt={3}>
                <Button variant="contained" color="primary" onClick={back}>
                  {t("Previous")}
                </Button>
               
                <Button variant="contained" color="primary" onClick={handleEdit}>
                  {t("Edit")}
                </Button>

                <Button variant="contained" color="success" type="submit" >
                  {t("save")}
                </Button>
               
              </Box>
              </>
        )}
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default SiteDetails;
