
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react';
import axios, { Axios } from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import 'dayjs/locale/en-gb';
import '../components/Shake.css';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LabelWithAsterisk from '../components/LabelWithAsterisk'
import {
    Button, Box, Container, Typography, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Link
  } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';


// Start File
  const DbRptCreatedProperty = () =>{

    //Define Constants

    const [Data, setData] = useState([]);
    const navigate = useNavigate();   
    const [startDate, setStartDate] = useState(new Date());   // Start date for filter
    const [endDate, setEndDate] = useState(new Date());   // End date for filter

    //JS On click Functions
    const Fun_ULBWiseReport = async (row,stDate,enDate) => {      
    try {
        localStorage.setItem('DistCode', JSON.stringify(row.DISTRICTCODE));
        let formattedStartDate = formatDate(stDate);
        let formattedEndDate = formatDate(enDate);
      
        console.log(JSON.stringify(row.DISTRICTCODE));
        console.log(JSON.stringify(stDate));
       // let FilterDate= DecideFilteredDate();
        navigate(`/DbRptCreatedPropertyULBWise?StartDate=${formattedStartDate}&EndDate=${formattedEndDate}`)
      } catch (error) 
      {
       // navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
      }
    }
    
    const handleDateChange = (date) => {
      setStartDate(date);    
    };
    const handleEndDateChange = (date) => {
      setEndDate(date);    
    };

    // Convert date to 'dd-MM-yyyy' format
    const formatDate = (date) => {
        return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
    };

    const handleFilterClick = () => {
      
      //  let formattedStartDate = String(StartDate.getDate()).padStart(2, "0") + "-" + String(StartDate.getMonth() + 1).padStart(2, "0") + "-" + StartDate.getFullYear();
       // let formattedEndDate = String(EndDate.getDate()).padStart(2, "0") + "-" + String(EndDate.getMonth() + 1).padStart(2, "0") + "-" + EndDate.getFullYear();
        fetchData();
    };

    //Like On Page Load - starts from here
    useEffect(() => {
      fetchData();  // Fetch data initially
  }, []); // Empty dependency array ensures this runs only once on mount

        
const DecideFilteredDate=() =>{  
 let today = new Date();
        let formattedToday = formatDate(today);
        if (startDate !== null && new Date(startDate) > today) {
            toast.error('Start date cannot be greater than today');
            return formattedToday;
        }
        return formatDate(startDate) || formattedToday;
    }; 

    
const fetchData = async () => {
  let formattedStartDate = formatDate(startDate);
  let formattedEndDate = formatDate(endDate);

  console.log('Fetching data with Start Date:', formattedStartDate, 'and End Date:', formattedEndDate);
  try {
      const response = await axios.get(`https://localhost:44368/v1/Report/DB_RPT_CREATED_PROPERTY?StartDate=${formattedStartDate}&EndDate=${formattedEndDate}`);
      const { Table: data = [] } = response.data;
      setData(data);
  } catch (error) {
      toast.error('Failed to fetch data');
  }
};


// In return we write html code which will be displayed to user 
return (
<>

<div align="center"><h2>Authorized and Un-authorized Created Property Count</h2></div>
<br/>
<div align="RIGHT">
< LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
     <label htmlFor="datePicker">Filter Date:</label>
    <DatePicker
          selected={startDate}
          onChange={date => handleDateChange(date)}  
          placeholder='dd-mm-yyyy'
          dateFormat="dd-MM-yyyy"
        />

    <label htmlFor="datePicker">-</label>
    <DatePicker
          selected={endDate}
          onChange={date => handleEndDateChange(date)}  
          placeholder='dd-mm-yyyy'
          dateFormat="dd-MM-yyyy"
        />
  </LocalizationProvider>
  <button onClick={handleFilterClick}>Filter</button>

</div>

  <TableContainer component={Paper} sx={{ mt: 4, maxHeight: 900  }}>          
  <Table stickyHeader aria-label="sticky table">
    <TableHead>
      <TableRow>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{("DISTRICT NAME")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{("No. of applications submitted for property creation")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{("No. of authorized properties approved")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{("No. of un-authorized properties approved")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{("No. of illegal properties approved")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{("No. of authorized properties rejected")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{("No. of un-authorized properties rejected")}</TableCell>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{("No. of illegal properties rejected")}</TableCell>
       </TableRow>
    </TableHead>
    <TableBody>
      {Data.length === 0 ? (
        <TableRow>
          <TableCell colSpan={12} align="center">
            {("Nodataavailable")}
          </TableCell>
        </TableRow>
      ) : (
        Data
       
        .map((row, index, arr) => {
        return (
            <TableRow key={index}>
              {/* <TableCell>{ row.DISTRICTNAME }</TableCell>   */}
              <TableCell> {row.DISTRICTNAME ? (
                                <Button color="primary" onClick={() => Fun_ULBWiseReport(row,startDate,endDate)}>
                                  {row.DISTRICTNAME}
                                </Button>
                    ) : ""}
              </TableCell>
              <TableCell>{ row.CITIZEN_CREATED_CNT}</TableCell>
              <TableCell>{ row.AUTHORISED_APPROVED_PROPERTY}</TableCell>
              <TableCell>{ row.UNAUTHORISED_APPROVED_PROPERTY}</TableCell>
              <TableCell>{ row.ILLEGEL_APPROVED_PROPERTY}</TableCell>
              <TableCell>{ row.AUTHORISED_REJECTED_PROPERTY}</TableCell>
              <TableCell>{ row.UNAUTHORISED_REJECTED_PROPERTY}</TableCell>
              <TableCell>{ row.ILLEGEL_REJECTED_PROPERTY}</TableCell>
              {/* <TableCell>
                {row.WARDNAME ? (
                  <Button color="primary" onClick={() => handleNavigation(row)}>
                    {row.WARDNAME}
                  </Button>
                ) : ""}
              </TableCell> */}
           
            </TableRow>
          );
        })
      )}
    </TableBody>
  </Table>
</TableContainer>

</>
  )
}

export default DbRptCreatedProperty
