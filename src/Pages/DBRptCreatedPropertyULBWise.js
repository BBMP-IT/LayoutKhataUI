
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react';
import axios, { Axios } from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Button, Box, Container, Typography, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Link
  } from '@mui/material';

function DbRptCreatedPropertyULBWise(props) {

  const [Data, setData] = useState([]);
  const navigate = useNavigate();
//featching query parameters
const location = useLocation();
const queryParams = new URLSearchParams(location.search);
let Prm_StartDate = queryParams.get('StartDate');
let Prm_EndDate = queryParams.get('EndDate');

useEffect(() => {
    debugger
    const fetchData = async () => {
      console.log ('hi');
    //   For taking data from DB 
    let Prm_DistCode = localStorage.getItem('DistCode');
    // console.log("Prm_StartDatefggg",Prm_StartDate);
    // console.log("Prm_EndDatefggg",Prm_EndDate);
    // console.log (Prm_DistCode);
    const response = await axios.get(`https://localhost:44368/v1/Report/DB_RPT_CREATED_PROPERTY_ULBWise?DistCode=${Prm_DistCode}&StartDate=${Prm_StartDate}&EndDate=${Prm_EndDate}`);
    const { Table:Data = [] } = response.data; //extract the Table property from response.data and assign it to a variable called response1
    setData(Data);
     };

  fetchData();
}, []);

  return (

<>
    <div align="center"><h2>ULB Wise Authorized and Un-authorized Created Property Count {Prm_StartDate} to {Prm_EndDate}</h2></div>
<TableContainer component={Paper} sx={{ mt: 4, maxHeight: 900  }}>
          
  <Table stickyHeader aria-label="sticky table">
    <TableHead>
      <TableRow>
        <TableCell style={{ backgroundColor: '#0276aa', fontWeight: 'bold', color: '#FFFFFF' }}>{("ULB NAME")}</TableCell>
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
              <TableCell>{ row.ULBNAME }</TableCell>  
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
                ) : ""} hi
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

DbRptCreatedPropertyULBWise.propTypes = {}

export default DbRptCreatedPropertyULBWise
