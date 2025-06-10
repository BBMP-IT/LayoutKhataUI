import React, { useState, useEffect ,useCallback} from 'react';
import {
  TextField, Button, Grid, Box, Container, Typography, CircularProgress, Dialog, DialogContent,DialogActions,
  FormControl, MenuItem, Select, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';

const PropertyList = () => {
  const [formData, setFormData] = useState({
    ZoneName: "",
    WardName: "",
    SelectType: "",
    Search: ""
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [propertyData, setPropertyData] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [WardData, setWardData] = useState([]);
  const [page, setPage] = useState(0);
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [LoginData,setLoginData] = useState("")
  const { t } = useTranslation();
  
  const fetchData = useCallback(async (page = 1, rowsPerPage = 10) => {
    debugger
    setLoading(true)
    try {
      let response = await axiosInstance.get("BBMPCITZAPI/GetMasterZone")
      setZoneData(response.data.Table || [])
      
      var response1 = await axiosInstance.get("BBMPCITZAPI/GetMasterWard?ZoneId=" + JSON.parse(localStorage.getItem('DraftZoneId')))
      setWardData(response1.data.Table)
   debugger
      let response2 = await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS`, {
        params: {
          ZoneId: JSON.parse(localStorage.getItem('DraftZoneId')),
          WardId: JSON.parse(localStorage.getItem('DraftWardId')),
          SerachType: 0,
          Search: "thushar",
          page: page,
          pageSize: rowsPerPage,
        },
      });
      setPropertyData(response2.data.Table || [])
      
      setLoading(false)
      
      setLoginData(JSON.parse(localStorage.getItem('LoginData')))
    } catch (error) {
      navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
    }
    setFormData(prevData => ({
      ...prevData,
      ZoneName: JSON.parse(localStorage.getItem('DraftZoneId')),
      WardName: JSON.parse(localStorage.getItem('DraftWardId'))
    }));
  }, [navigate]);

  useEffect( () => {
    localStorage.setItem("userProgress", 2);
    fetchData();
  }, [fetchData]);


 const getBBDRecord = async (page = 1, rowsPerPage = 10) => {
  debugger
  let searchtype = 0;
  let searchText = "";
  if (formData.SelectType === "") {
     searchtype = 0;
  }else{
     searchtype = formData.SelectType;
  }
 
    if (formData.Search.length === 0) {
       searchText = "thushar";
    }
    else {
       searchText = formData.Search;
    }
    if(selectedLetter === null || selectedLetter === "" || selectedLetter === undefined){
  let response2 = await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS`, {
    params: {
      ZoneId: JSON.parse(localStorage.getItem('DraftZoneId')),
      WardId: JSON.parse(localStorage.getItem('DraftWardId')),
      SerachType: searchtype,
      Search: searchText,
      page: page,
      pageSize: rowsPerPage,
    },
  });
  setPropertyData(response2.data.Table || [])
    }
    else {
      let response2 = await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS`, {
        params: {
          ZoneId: JSON.parse(localStorage.getItem('DraftZoneId')),
          WardId: JSON.parse(localStorage.getItem('DraftWardId')),
          SerachType: 6,
          Search: selectedLetter,
          page: page,
          pageSize: rowsPerPage,
        },
      });
      setPropertyData(response2.data.Table || [])
    }
 } 
  const handleChange = async (e) => {
    try {

      const { name, value } = e.target;
     
      setFormData({
        ...formData,
        [name]: value
      });
    } catch (error) {
      setLoading(false);
      console.log(error)
    }
  };

  const handleSearch = async () => {

    if (formData.ZoneName === "") {
      toast.error(`${t("selectZone")}`)
      return
    }
    if (formData.WardName === "") {
      toast.error(`${t("selectWard")}`);
      return
    }
    if (formData.SelectType === "") {
      toast.error(`${t("enterSearchType")}`)
      return
    }
    else {
      if (formData.Search.length === 0) {
        toast.error(`${t("enterSearchText")}`);
        return
      }
      else {
       // let response = await 
        let response = await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS`, {
          params: {
            ZoneId: formData.ZoneName,
            WardId: formData.WardName,
            SerachType: formData.SelectType,
            Search: formData.Search,
            page: 1,
            pageSize: rowsPerPage,
          },
        });
        setPage(0);
        setRowsPerPage(10);
      //  axiosInstance.get("BBMPCITZAPI/LOAD_BBD_RECORDS?ZoneId=" + formData.ZoneName + "&WardId=" + formData.WardName + "&SerachType=" + formData.SelectType + "&Search=" + formData.Search + "")
        setPropertyData(response.data.Table || [])
      }
    }
  }
  const handleAlphabeticalSearch = async (Alphbet) => {
    debugger
    try {
    let response = 
    await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS`, {
      params: {
        ZoneId: formData.ZoneName,
        WardId: formData.WardName,
        SerachType: 6,
        Search: Alphbet,
        page: 1,
        pageSize: rowsPerPage,
      },
    });
    
  //  await axiosInstance.get("BBMPCITZAPI/LOAD_BBD_RECORDS?ZoneId=" + formData.ZoneName + "&WardId=" + formData.WardName + "&SerachType=" + 6 + "&Search=" + Alphbet + "")
    setPropertyData(response.data.Table || [])
    setPage(0);
    setRowsPerPage(10);
    }
    catch(error){
      console.log(error)
    }
  }
  
  const handleBack = () => {
    localStorage.removeItem("DraftZoneId")
    localStorage.removeItem("DraftWardId")
   let goo =  JSON.parse(localStorage.getItem('FromGoogleMaps'))
   debugger
   if(goo === 2){
    navigate('/')
   }else {
    navigate("/GoogleMapsWardCoordinates")
   }
  }
  const alphabet = Array.from(Array(26)).map((_, i) => String.fromCharCode(i + 65));
  const handleReset = async () => {
    let response =
    await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS`, {
      params: {
        ZoneId: formData.ZoneName,
        WardId: formData.WardName,
        SerachType: 0,
        Search: "thushar",
        page: 1,
        pageSize: rowsPerPage,
      },
    });
    
   // await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS?ZoneId=${formData.ZoneName}&WardId=${formData.WardName}&SerachType=${0}&Search=${"thushar"}`)
    setPropertyData(response.data.Table || [])
    setSelectedLetter(null)
    setPage(0);
    setRowsPerPage(10);
    setFormData({
      ...formData,
     // ZoneName: "",
     // WardName: "",
      SelectType: "",
      Search: ""
    });
  }

  const handleSearchNavigation = async () => {
    debugger
   
             try{
              let now = new Date();
  let txtDate = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0') + 'T' +
                now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0') + ':' +
                now.getSeconds().toString().padStart(2, '0');
             if(LoginData !== null && LoginData !== undefined && LoginData !== ""){
              const data = {
                userId: LoginData.UserId,
                propertyCode:"123",
                propertyEPID:  "123" ,
                sessionValues: "",
                execTime: txtDate,
                isLogin: true
                }
                
                const response5 = await axiosInstance.post("Auth/EncryptJsons",data)
                let re = response5.data;
       
                
       localStorage.setItem('SETLOGINID', LoginData.UserId);
              window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_core/SearchProperty?BookDraft="+re;
           //  window.location.href = "https://bbmpeaasthi.karnataka.gov.in/objection_form_test/SearchProperty?BookDraft="+re;
            }
            else {
              alert("Please Log-In To Apply For Property Searching. Click On The Do not find my Property Draft eKhata After Logging In.")
              const data = {
                userId: "",
                propertyCode: "123",
                propertyEPID:  "123",
                sessionValues: "",
                execTime: txtDate,
                isLogin: false
                }
               
        
        console.log(txtDate); // Outputs: "20241018T13:44:09" (for example)
        
              // let json = "{\"UserId\":\"" + Convert.ToString(Session["LoginId"]) + "\",\"PropertyCode\":\"\",\"PropertyEPID\":\"\",\"SessionValues\":[],\"ExecTime\":\"" + txtDate + "\"}";
                
                const response = await axiosInstance.post("Auth/EncryptJsons",data)
             window.location.href = "https://bbmpeaasthi.karnataka.gov.in/CitzLogin.aspx?BookDraft="+response.data;
          //   window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_test2/CitzLogin.aspx?BookDraft="+response.data;
            }
          }
          catch(error){
console.log(error)
          }
                    
  }

  // const handleNavigation = async (row) => {
  //   //  navigate('/AddressDetails')


  //   const response3 = await axiosInstance.get(`BBMPCITZAPI/Get_Ctz_ObjectionModPendingAppl?LoginId=crc&propertycode=${row.PROPERTYCODE}&propertyid=${row.PROPERTYID}`);

  //   if (response3.data === "There is a issue while copying the data from Book Module.No Data Found") {

     
  //     localStorage.setItem('SETPROPERTYCODE', JSON.stringify(row.PROPERTYCODE));
      
  //     localStorage.setItem('SETPROPERYID', row.PROPERTYID);
      
  //     localStorage.setItem("userProgress", 3);
  //       navigate('/TaxDetails')
    
  //   }
  //   else {
  //     localStorage.setItem('P_BOOKS_PROP_APPNO', JSON.stringify(response3.data.P_BOOKS_PROP_APPNO || 0));
  //     localStorage.setItem('SETPROPERTYCODE', JSON.stringify(response3.data.PropertyId || 0));
  //     try {
       

       
  //       localStorage.setItem("userProgress", 3);
  //         navigate('/TaxDetails')
     

  //     } catch (error) {

  //       navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
  //     }
  //   }
  // }
  const handleUploadECNavigation = async (row) => {
    debugger
    if(row.PROPERTYID === null || row.PROPERTYID  === undefined|| row.PROPERTYID.length === 0){
      alert("Property ePID is not Generated . Please Click on Draft Ekatha to Generate the Property ePID And Click Here")
        return
      }
      if(row.NPM_PROPERTYCODE === null || row.NPM_PROPERTYCODE  === undefined|| row.NPM_PROPERTYCODE.length === 0){
             toast.error("Property Code does not exist for this property")
               return
             }
             try{
              let now = new Date();
  let txtDate = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0') + 'T' +
                now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0') + ':' +
                now.getSeconds().toString().padStart(2, '0');
             if(LoginData !== null && LoginData !== undefined){
              const data = {
                userId: LoginData.UserId,
                propertyCode: row.NPM_PROPERTYCODE.toString(),
                propertyEPID:  row.PROPERTYID ? row.PROPERTYID.toString() : "",
                sessionValues: "",
                execTime: txtDate,
                isLogin: true
                }
                
                const response5 = await axiosInstance.post("Auth/EncryptJsons",data)
                let re = response5.data;
                localStorage.setItem('SETPROPERTYCODE', JSON.stringify(row.NPM_PROPERTYCODE));
                localStorage.setItem('SETBOOKPROPERTYCODE', JSON.stringify(row.PROPERTYCODE));
                localStorage.setItem('SETPROPERYID', JSON.stringify(row.PROPERTYID));
                localStorage.setItem('BOOKS_PROP_APPNO', JSON.stringify(row.BOOKS_PROP_APPNO));
                localStorage.setItem('Reqid', JSON.stringify(row.REQID));
                
       localStorage.setItem('SETLOGINID', LoginData.UserId);
          //    window.location.href = "https://bbmpeaasthi.karnataka.gov.in/objection_form_test/UploadECPage?BookDraft="+re;
              window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_core/UploadECPage?BookDraft="+re;
            }
            else {
              alert("Please Log-In To Upload EC. Click On The File Objection Link After Logging In.")
              const data = {
                userId: "",
                propertyCode: row.PROPERTYCODE.toString(),
                propertyEPID: row.PROPERTYID ? row.PROPERTYID.toString() : "",
                sessionValues: "",
                execTime: txtDate,
                isLogin: false
                }
               
        
        console.log(txtDate); // Outputs: "20241018T13:44:09" (for example)
        
              // let json = "{\"UserId\":\"" + Convert.ToString(Session["LoginId"]) + "\",\"PropertyCode\":\"\",\"PropertyEPID\":\"\",\"SessionValues\":[],\"ExecTime\":\"" + txtDate + "\"}";
                
                const response = await axiosInstance.post("Auth/EncryptJsons",data)
             window.location.href = "https://bbmpeaasthi.karnataka.gov.in/CitzLogin.aspx?BookDraft="+response.data;
          //   window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_test2/CitzLogin.aspx?BookDraft="+response.data;
            }
          }
          catch(error){
console.log(error)
          }
                    
  }
  //     const handleUploadECNavigation = async (row) => {
  //     //  navigate('/AddressDetails')
  // debugger
  //                  localStorage.setItem('SETPROPERTYCODE', JSON.stringify(row.PROPERTYCODE));
    
  //               localStorage.setItem('SETPROPERYID', JSON.stringify(row.PROPERTYID));
  //               localStorage.setItem('BOOKS_PROP_APPNO', JSON.stringify(row.BOOKS_PROP_APPNO));
  //               localStorage.setItem('Reqid', JSON.stringify(row.REQID));
  //    try {

  //         navigate('/UploadECPage')
  //       } catch (error) {
  
  //         navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
  //       }
  //     }
  const handleObjectionNavigation = async (row) => {
    
    if(row.PROPERTYID === null || row.PROPERTYID  === undefined|| row.PROPERTYID.length === 0){
      alert("Property ePID is not Generated . Please Click on Draft Ekatha to Generate the Property ePID And Click Here")
        return
      }
      if(row.PROPERTYCODE === null || row.PROPERTYCODE  === undefined|| row.PROPERTYCODE.length === 0){
             toast.error("Property Code does not exist for this property")
               return
             }
             try{
              let now = new Date();
  let txtDate = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0') + 'T' +
                now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0') + ':' +
                now.getSeconds().toString().padStart(2, '0');
             if(LoginData !== null && LoginData !== undefined){
              const data = {
                userId: LoginData.UserId,
                propertyCode: row.PROPERTYCODE.toString(),
                propertyEPID:  row.PROPERTYID ? row.PROPERTYID.toString() : "",
                sessionValues: "",
                execTime: txtDate,
                isLogin: true
                }
                
                const response5 = await axiosInstance.post("Auth/EncryptJsons",data)
                let re = response5.data;
                localStorage.setItem('SETPROPERTYCODE', JSON.stringify(row.PROPERTYCODE));
       localStorage.setItem('OBJECTIONID', JSON.stringify(row.OBJECTIONID)); //should pass from the table.
       localStorage.setItem('SETPROPERYID', JSON.stringify(row.PROPERTYID));
       localStorage.setItem('SETLOGINID', JSON.stringify(LoginData.UserId));
           //   window.location.href = "https://bbmpeaasthi.karnataka.gov.in/objection_form_test/ObjectorsPage?BookDraft="+re;
             window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_core/ObjectorsPage?BookDraft="+re;
            }
            else {
              alert("Please Log-In To File Objections. Click On The File Objection Link After Logging In.")
              const data = {
                userId: "",
                propertyCode: row.PROPERTYCODE.toString(),
                propertyEPID: row.PROPERTYID ? row.PROPERTYID.toString() : "",
                sessionValues: "",
                execTime: txtDate,
                isLogin: false
                }
               
        
        console.log(txtDate); // Outputs: "20241018T13:44:09" (for example)
        
               // let json = "{\"UserId\":\"" + Convert.ToString(Session["LoginId"]) + "\",\"PropertyCode\":\"\",\"PropertyEPID\":\"\",\"SessionValues\":[],\"ExecTime\":\"" + txtDate + "\"}";
                
                const response = await axiosInstance.post("Auth/EncryptJsons",data)
             window.location.href = "https://bbmpeaasthi.karnataka.gov.in/CitzLogin.aspx?BookDraft="+response.data;
           //   window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_test2/CitzLogin.aspx?BookDraft="+response.data;
            }
          }
          catch(error){
console.log(error)
          }
    }
  
//     const handleObjectionNavigation = async (row) => {
//       //  navigate('/AddressDetails')
  
  
//      try {
// if(row.OBJECTIONID === "" || row.OBJECTIONID === null || row.OBJECTIONID === undefined){
//   localStorage.setItem('OBJECTIONID', "0");
// }else {
//   localStorage.setItem('OBJECTIONID', JSON.stringify(row.OBJECTIONID));
// }


//         localStorage.setItem('SETPROPERTYCODE', JSON.stringify(row.PROPERTYCODE));
    
//         localStorage.setItem('SETPROPERYID', JSON.stringify(row.PROPERTYID));
//         localStorage.setItem("userProgress", 3);
//           navigate('/ObjectorsPage')
//         } catch (error) {
  
//           navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
//         }
//       }
    const finalEktha =  () => {
      window.location.href = "https://bbmpeaasthi.karnataka.gov.in/office/frmKhathaDownload.aspx";
    }
    const finalPreviousEkhata = async (row) =>{
      if(row.PROPERTYID === null || row.PROPERTYID  === undefined|| row.PROPERTYID.length === 0){
        alert("Property ePID is not Generated . Please Click on Draft Ekatha to Generate the Property ePID And Click Here")
          return
        }
        const data = {
          userId: null,
          propertyCode: null,
          propertyEPID:  row.PROPERTYID ? row.PROPERTYID.toString() : "",
          sessionValues: "",
          execTime: null,
          isLogin: true
          }
          
          const response5 = await axiosInstance.post("Auth/EncryptJsons",data)
          let re = response5.data;
      window.location.href = `https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2View.aspx?formid=report&Data=${re}`;
    }
  const viewDraftEkatha = async (row) => {
    debugger
     if(row.PROPERTYCODE === null || row.PROPERTYCODE  === undefined|| row.PROPERTYCODE.length === 0){
    toast.error("Property Code does not exist for this property")
      return
    }
    
   const data = {
    
      propertyCode: row.PROPERTYCODE.toString() || "",
      properytyId: row.PROPERTYID ? row.PROPERTYID.toString() : "",
      bookNumber: row.BOOKNUMBER ? row.BOOKNUMBER.toString() : "",
      bookId: row.BOOKID ? row.BOOKID.toString() : ""
    }
   try {
    setLoading(true)
 const response = await axiosInstance.post(
  `Report/DownloadDraftPDF`,
  data,
  {
    responseType: 'blob', 
  }
);


const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
const pdfUrl = URL.createObjectURL(pdfBlob);
if(row.ASSESMENTNUMBER !== null || row.ASSESMENTNUMBER  !== undefined|| row.ASSESMENTNUMBER.length > 0){
  let response2 = 
  await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS`, {
    params: {
      ZoneId: formData.ZoneName,
      WardId: formData.WardName,
      SerachType: 3,
      Search: row.ASSESMENTNUMBER,
      page: 1,
      pageSize: rowsPerPage,
    },
  });
  
  
 // await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS?ZoneId=${JSON.parse(localStorage.getItem('DraftZoneId'))}&WardId=${JSON.parse(localStorage.getItem('DraftWardId'))}&SerachType=${3}&Search=${row.ASSESMENTNUMBER}`)
  setPropertyData(response2.data.Table || [])

}
else if(row.OWNERNAME !== null || row.OWNERNAME  !== undefined|| row.OWNERNAME.length > 0){
  let response2 = 
  await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS`, {
    params: {
      ZoneId: formData.ZoneName,
      WardId: formData.WardName,
      SerachType: 2,
      Search: row.OWNERNAME,
      page: 1,
      pageSize: rowsPerPage,
    },
  });
  
  
 // await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS?ZoneId=${JSON.parse(localStorage.getItem('DraftZoneId'))}&WardId=${JSON.parse(localStorage.getItem('DraftWardId'))}&SerachType=${2}&Search=${row.OWNERNAME}`)
  setPropertyData(response2.data.Table || [])
 }
setPdfUrl(pdfUrl);
setLoading(false)
   }
   catch(error){
    setLoading(false)
  console.log(error)
  if(row.ASSESMENTNUMBER !== null || row.ASSESMENTNUMBER  !== undefined|| row.ASSESMENTNUMBER.length > 0){
    let response2 =
    await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS`, {
      params: {
        ZoneId: formData.ZoneName,
        WardId: formData.WardName,
        SerachType: 3,
        Search: row.ASSESMENTNUMBER,
        page: 1,
        pageSize: rowsPerPage,
      },
    });
    
    
  //  await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS?ZoneId=${JSON.parse(localStorage.getItem('DraftZoneId'))}&WardId=${JSON.parse(localStorage.getItem('DraftWardId'))}&SerachType=${3}&Search=${row.ASSESMENTNUMBER}`)
    setPropertyData(response2.data.Table || [])

  }
  else if(row.OWNERNAME !== null || row.OWNERNAME  !== undefined|| row.OWNERNAME.length > 0){
    let response2 =
    await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS`, {
      params: {
        ZoneId: formData.ZoneName,
        WardId: formData.WardName,
        SerachType: 2,
        Search: row.OWNERNAME,
        page: 1,
        pageSize: rowsPerPage,
      },
    });
    
    
 //   await axiosInstance.get(`BBMPCITZAPI/LOAD_BBD_RECORDS?ZoneId=${JSON.parse(localStorage.getItem('DraftZoneId'))}&WardId=${JSON.parse(localStorage.getItem('DraftWardId'))}&SerachType=${2}&Search=${row.OWNERNAME}`)
    setPropertyData(response2.data.Table || [])
   }
   }
  }
    const handleBBMPRedirection = async (row) => {
  
      //let prpEID = "";
debugger
try {
// if( row.PROPERTYID === "" || row.PROPERTYID === null)
//   {
//   if(row.PROPERTYCODE === null || row.PROPERTYCODE  === undefined|| row.PROPERTYCODE.length === 0){
//     toast.error("Property Code does not exist for this property")
//       return
//     }
    
    
//    const data = {
    
//       propertyCode: row.PROPERTYCODE.toString() || "",
//       properytyId: row.PROPERTYID ? row.PROPERTYID.toString() : "",
//       bookNumber: row.BOOKNUMBER ? row.BOOKNUMBER.toString() : "",
//       bookId: row.BOOKID ? row.BOOKID.toString() : ""
//     }
   
//     setLoading(true)
//  const response = await axiosInstance.post(
//   `Report/DownloadDraftPDF`,
//   data,
//   {
//     responseType: 'blob', 
//   }
// );
// prpEID = response.data.PropertyId;
// }
if(row.PROPERTYID === null || row.PROPERTYID  === undefined|| row.PROPERTYID.length === 0){
  alert("Property ePID is not Generated . Please Click on Draft Ekatha to Generate the Property ePID And Click Here")
    return
  }
  if(row.PROPERTYCODE === null || row.PROPERTYCODE  === undefined|| row.PROPERTYCODE.length === 0){
         toast.error("Property Code does not exist for this property")
           return
         }
  let now = new Date();
  let txtDate = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0') + 'T' +
                now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0') + ':' +
                now.getSeconds().toString().padStart(2, '0');
    if(LoginData !== null && LoginData !== undefined){
    //  window.location.href = "https://bbmpeaasthi.karnataka.gov.in/CitzLogin.aspx";
    const data = {
      userId: LoginData.UserId,
      propertyCode: row.PROPERTYCODE.toString(),
      propertyEPID:  row.PROPERTYID ? row.PROPERTYID.toString() : "",
      sessionValues: "",
      execTime: txtDate,
      isLogin: true
      }
      
      const response5 = await axiosInstance.post("Auth/EncryptJsons",data)
      let re = response5.data;
    window.location.href = "https://bbmpeaasthi.karnataka.gov.in/forms/CitzBookModuleHome.aspx?BookDraft="+re;
 //   window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_test2/forms/CitzBookModuleHome.aspx?BookDraft="+re;
    }
    else {
      alert("Please Log-In To Update Property Information Or To File Objections. Click On The Get e-Khatha Link After Logging In.")
      const data = {
        userId: "",
        propertyCode: row.PROPERTYCODE.toString(),
        propertyEPID: row.PROPERTYID ? row.PROPERTYID.toString() : "",
        sessionValues: "",
        execTime: txtDate,
        isLogin: false
        }
       

console.log(txtDate); // Outputs: "20241018T13:44:09" (for example)

       // let json = "{\"UserId\":\"" + Convert.ToString(Session["LoginId"]) + "\",\"PropertyCode\":\"\",\"PropertyEPID\":\"\",\"SessionValues\":[],\"ExecTime\":\"" + txtDate + "\"}";
        
        const response = await axiosInstance.post("Auth/EncryptJsons",data)
      window.location.href = "https://bbmpeaasthi.karnataka.gov.in/CitzLogin.aspx?BookDraft="+response.data;
 //    window.location.href = "https://bbmpeaasthi.karnataka.gov.in/citizen_test2/CitzLogin.aspx?BookDraft="+response.data;
    }
  }
    catch(error){
      console.log(error)
    }
    }
    function base64ToBlob(base64, type = "application/octet-stream") {
      const binStr = atob(base64);
      const len = binStr.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
      }
      return new Blob([arr], { type: type });
  }
    const handlePageDownload = async (row) => {
      debugger
      setLoading(true)
     try {
   const response = await axiosInstance.post(
    `Report/DownloadPagePDF?BookNo=${row.BOOKID}&pageno=${row.PAGENUMBER}`,
    {
      responseType: 'blob', 
    }
  );
  debugger
  const pdfBlob =base64ToBlob(response.data, 'application/pdf');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  setPdfUrl(pdfUrl);
  setLoading(false)
 
}
     catch(error){
      setLoading(false)
    console.log(error)
     }
    }  
  // const handleChangePage = (event, newPage) => {
  //   setPage(newPage);
  // };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(parseInt(event.target.value, 10));
  //   setPage(0);
  // };

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
      <Box sx={{ backgroundColor: '#f0f0f0', padding: 1, borderRadius: 2, mt: 1 }}>
        <ToastContainer />
        {pdfUrl && (
          
        <Dialog open={Boolean(pdfUrl)} onClose={() => setPdfUrl('')} maxWidth="md" fullWidth>
          <DialogContent>
             <iframe src={pdfUrl} width="100%" height="600px" title="PDF Viewer"></iframe> 
           
          </DialogContent>
          <DialogActions>
      <Button onClick={() => setPdfUrl('')} color="primary">
        Close
      </Button>
    </DialogActions>
          </Dialog>
          
        )}
          
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontFamily: "sans-serif",
          
            color: '#1565c0',
            fontSize: {
              xs: '1.5rem',
              sm: '2rem',
              md: '2.5rem',
            }
          }}
        >
          {/* {t("PendingPropertyList")} */}
         Property List
        </Typography>
        <Grid container spacing={2} alignItems={"center"}>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl
              fullWidth
              sx={{ marginBottom: 3 }}
            >
              <InputLabel>{t("ZoneName")}</InputLabel>
              <Select
                name="ZoneName"
                value={formData.ZoneName}
                onChange={handleChange}
                sx={{ backgroundColor: "" }}
                inputProps={{ readOnly: true }}
              >
                <MenuItem value="">--Select--</MenuItem>
                {zoneData.map((item) => (
                  <MenuItem key={item.ZONEID} value={item.ZONEID}>
                    {item.ZONENAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl
              fullWidth
              sx={{ marginBottom: 3 }}
            >
              <InputLabel>{t("WardName")}</InputLabel>
              <Select
                name="WardName"
                value={formData.WardName}
                onChange={handleChange}
                sx={{ backgroundColor: "" }}
                inputProps={{ readOnly: true }}
              >
                <MenuItem value="">--Select--</MenuItem>
                {WardData.map((item) => (
                  <MenuItem key={item.WARDID} value={item.WARDID}>
                    {item.WARDNAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl
              fullWidth
              sx={{ marginBottom: 3 }}
            >
              <InputLabel>{t("SearchType")}</InputLabel>
              <Select
                name="SelectType"
                sx={{ backgroundColor: "#ffff" }}
               
                value={formData.SelectType}
                onChange={handleChange}
              >
                <MenuItem value="0">--Select--</MenuItem>
                <MenuItem value="1">Property EPID</MenuItem>
                <MenuItem value="2">Owner Name</MenuItem>
                <MenuItem value="3">Assessment No</MenuItem>
                <MenuItem value="4">Property Address</MenuItem>
                <MenuItem value="7">Book No</MenuItem> 
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label={t("Search")}
              name="Search"
              value={formData.Search}
              onChange={handleChange}
              fullWidth
              
              sx={{ marginBottom: 3,backgroundColor:"#ffff"  }}
            />
          </Grid>
          
          <Box display="flex" justifyContent="center" gap={2} mt={0.5} width="100%">
          <Button variant="contained" color="primary" onClick={handleBack}>
              {t("Previous")}
            </Button>
            <Button variant="contained" color="success" onClick={handleSearch}>
              {t("Search")}
            </Button>
            <Button variant="contained" color="primary" onClick={handleReset}>
              {t("Reset")}
            </Button>
            <Button variant="contained" color="primary" onClick={handleSearchNavigation}>
              {t("Do not find my Property Draft eKhata")}
            </Button>
          </Box>
        </Grid>
        <div>
          <br></br>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
  <span style={{ marginRight: '12px', fontSize: '17px', fontWeight: 'bold', color: '#e74c3c' }}>
      Sort by:
    </span>
    {alphabet.map((letter) => (
    
      <span
      key={letter}
      onClick={() => {
          handleAlphabeticalSearch(letter);
          setSelectedLetter(letter); // Set the clicked letter as selected
      }}
      style={{
          margin: '8px',
          cursor: 'pointer',
          color: selectedLetter === letter ? '#e74c3c' : '#3498db', // Change color if selected
          fontSize: '17px',
          fontFamily: 'Arial, sans-serif',
          transition: 'color 0.3s ease, transform 0.2s ease',
          fontWeight: selectedLetter === letter ? 'bold' : 'normal', // Make it bold if selected
      }}
      onMouseOver={(e) => {
          e.target.style.color = selectedLetter === letter ? '#c0392b' : '#2980b9'; // Darker blue or red on hover
          e.target.style.transform = 'scale(1.1)'; // Slight scale up on hover
      }}
      onMouseOut={(e) => {
          e.target.style.color = selectedLetter === letter ? '#e74c3c' : '#3498db'; // Reset to original color
          e.target.style.transform = 'scale(1)'; // Reset scale
      }}
  >
      {letter}
  </span>
      
    ))}
    <Button  onClick={() => handleAlphabeticalSearch("9")} >Others</Button>
  </div>
</div>
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>Sl No</TableCell>
                {/* <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("PropertyID")}</TableCell> */}
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("propertyEID")}</TableCell> 
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("OwnerName")}</TableCell>
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Download")}</TableCell>
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("OpenProperty")}</TableCell>
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>Object not to issue final eKhata</TableCell> 
                 <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>Ready for Registration at Sub Registrar</TableCell> 
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("AssessmentNo")}</TableCell>
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("Address")}</TableCell>
                {/* <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("SASApplicationNo")}</TableCell> */}
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("BookNO")}</TableCell>
                <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{t("PageNumber")}</TableCell>
                
              </TableRow>
            </TableHead>
            <TableBody>
              {propertyData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    {t("Nodataavailable")}
                  </TableCell>
                </TableRow>
              ) : (
                propertyData
                  .map((row, index) => (
                    <TableRow key={index} style={{ height: '0.1em' }}>
                      <TableCell>{(page * rowsPerPage) + index + 1}</TableCell> 
                      <TableCell style={{ padding: '0.5em 1em' }} >{row.PROPERTYID}</TableCell>
                      <TableCell style={{ padding: '0.5em 1em' }}>{row.OWNERNAME}</TableCell>
                      <TableCell style={{ padding: '0.5em 1em' }}>{row.PROPERTYSTATUS === "APR" ? 
                      <>  <Button color="primary" style={{ width: '10rem',height:"0.1rem" }}   onClick={() => finalPreviousEkhata(row)} >Previous Print /</Button>  
                       <Button color="primary" style={{ width: '10rem',height:"0.1rem" }}   onClick={() => finalEktha()} >Latest Print</Button> </>: <Button color="primary" style={{ width: '8rem',height:"0.1rem" }}  onClick={() => viewDraftEkatha(row) } >Draft Ekhata</Button>} </TableCell>
                      <TableCell style={{ padding: '0.5em 1em' }}>{row.PROPERTYSTATUS === "APR" ? "": <Button color="primary" style={{ width: '8rem',height:"0.1rem" }}  onClick={() => handleBBMPRedirection(row)}>{t("ClickHere")}</Button>}</TableCell>
                         <TableCell style={{ padding: '0.5em 0.5em' }}><Button color="primary" style={{ width: '8rem',height:"0.1rem" }}  onClick={() => handleObjectionNavigation(row)}>{t("ClickHere")}</Button></TableCell> 
                         <TableCell style={{ padding: '0.5em 0.5em' }}>
  {row.PROPERTYSTATUS === "APR" && row.ISTRANSACTABLE === "Y" ? (
    "Yes"
  ) : row.PROPERTYSTATUS === "APR" && row.ISTRANSACTABLE !== "Y" ? (
    <Button 
      color="primary" 
      style={{ width: '8rem', height: '1.5rem' }} 
      onClick={() => handleUploadECNavigation(row)}
    >
      {t("Upload EC")}
    </Button>
  ) : (
    ""
  )}
</TableCell>
{/* <TableCell style={{ padding: '0.5em 1em' }}> <Button 
      color="primary" 
      style={{ width: '8rem', height: '1.5rem' }} 
      onClick={() => handleUploadECNavigation(row)}
    >
      {t("Upload EC")}
    </Button></TableCell> */}
                      <TableCell style={{ padding: '0.5em 1em' }}>{row.ASSESMENTNUMBER}</TableCell>
                      <TableCell style={{ width: '10rem',height:"0.1rem" }}>{row.ADDRESS}</TableCell>
                      <TableCell style={{ padding: '0.5em 1em' }}>{row.BOOKNUMBER}</TableCell>
                      <TableCell style={{ padding: '0.5em 1em' }}>{row.PAGENUMBER ? <Button color="primary" onClick={() => handlePageDownload(row)}>{row.PAGENUMBER}</Button> : ""}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
  rowsPerPageOptions={[10, 25, 50, 100]}
  component="div"
  count={propertyData.length > 0 ? propertyData[0].TOTAL_COUNT : 10} 
  rowsPerPage={rowsPerPage}
  page={page}
  onPageChange={ async (event, newPage) => {
    setPage(newPage);
  await  getBBDRecord(newPage + 1, rowsPerPage); 
  }}
  onRowsPerPageChange={ async(event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
   await  getBBDRecord(1, parseInt(event.target.value, 10)); 
  }}
  labelRowsPerPage="Properties per Page:"
  labelDisplayedRows={({ from, to, count }) => 
    `Properties: ${from}–${to} of ${count !== -1 ? count : `more than ${to}`} `
  }
/>

      </Box>
    </Container>
  );
};

export default PropertyList;
