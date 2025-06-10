import React, { useState } from 'react';
import {
  Box, Container, Typography
} from '@mui/material';
import axiosInstance from '../components/Axios';
import { useNavigate, useLocation } from 'react-router-dom';
const EKYCResponse = () => {


  const navigate = useNavigate();
  const location = useLocation();
  const [status1, setStatus] = useState("")
  const [txnos, settxnos] = useState("")
  const fetchData = React.useCallback(async () => {
    const params = new URLSearchParams(location.search);
    const txnno = params.get('txnno');
    const status = params.get('status');
    const vaultrefno = params.get('vaultrefno');
    const LoginId = params.get('LoginId');


    if (txnno !== null) {
      const params1 = {
        txnNo: txnno,
        success: status,
        vaultrefno: vaultrefno,
        loginid: LoginId,
      };
      settxnos(txnno);
      const queryString = new URLSearchParams(params1).toString();
      console.log("txno no" + txnno)
      console.log("Success" + status)
      console.log(" vaultrefno " + vaultrefno)
      console.log("loginid" + LoginId)


      setStatus(status);
      try {
        const response = await axiosInstance.get(`E-KYCAPI/UPDATE_EKYC_OWNER_VAULT_RESPONSE?${queryString}`);
        if (response.status === 200) {
          
          
          navigate(`/ObjectorsPage?txnno=${txnno}`);
         
        } else {

          console.error('Failed to update E-KYC owner vault response:', response);
        }
      } catch (error) {
        console.error('Error during E-KYC owner vault response update:', error);
      }
    }
  },[location.search,navigate])
  React.useEffect(() => {
    fetchData()
  }, [fetchData])




  return (
    <Container maxWidth="lg">

      <Box sx={{ backgroundColor: '#f0f0f0', padding: 4, borderRadius: 2, mt: 8 }}>

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
          This is the  E-KYC Response Page
        </Typography>
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
          This is the status : {status1}
        </Typography>
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
          This is the txn no : {txnos}
        </Typography>
      </Box>
    </Container>
  );
};

export default EKYCResponse;
