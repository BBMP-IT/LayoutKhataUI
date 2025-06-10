import React, { useState,useEffect } from 'react';
import CssBaseline from '@mui/joy/CssBaseline';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/Axios';
import { toast, ToastContainer } from 'react-toastify';
import AppartMent from "../assets/Appartment.png"
import CryptoJS from 'crypto-js';
import { useAuth } from '../context/AuthProvider';


const Login = () => {
  const [formData, setFormData] = useState({
    MOBILEVERIFY: "0",
    Password: "",
    UserId: "",
    captcha1: ""
  })
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  }
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [otpNumber, setOtpNumber] = useState(0);
  const [ipAddress,setipAddress] = useState("")
  const [otpButtonDisabled, setOtpButtonDisabled] = useState(false);
  const [timer, setTimer] = useState(30);
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleGenerateOtp = async () => {
    if (formData.UserId.length === 0) {
      toast.error("Enter the UserId");
      return
    }
    try {
      const responseMobile = await axiosInstance.get("Auth/GetCitzMobileNumber?UserId=" + formData.UserId)
      if (responseMobile.data === "Mobile number is not available." || responseMobile.data === "INVALID USER ID" || responseMobile.data === "") {
        toast.error(responseMobile.data)
        return
      }

      const response = await axiosInstance.get("E-KYCAPI/SendOTP?OwnerMobileNo=" + responseMobile.data);

      toast.success(response.data.otpResponseMessage);

      setOtpNumber(response.data.otp);
      setOtpButtonDisabled(true);
      setTimer(30);
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      setTimeout(() => {
        setOtpButtonDisabled(false);
        clearInterval(interval);
      }, 30000);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const fetchIPAddress = async () => {
    const response = await axiosInstance.get("Auth/GetServerIpAddress")
    setipAddress(response.data.ip)
  }
  useEffect(() => {
    // fetchIPAddress()
  }, [])
  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  }
  const handleCapthaChange = async (e) => {
    const { name, value } = e.target;
    formData.captcha1 = value;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  }
  const regenerateCaptcha = () => {
    setCaptcha(generateCaptcha());
  };
  const handleLogin = async (e) => {
    try {
      if (formData.UserId.length === 0 && formData.Password.length === 0) {
        toast.error("Please enter the password and User name");
        return
      }
      if (otpButtonDisabled) {
        if (formData.UserId.length === 0) {
          toast.error("Enter the UserId ");
          return
        }
      }
      // if(formData.captcha1.length === 0)
      //   {
      //     toast.error("Please enter the Captcha");
      //     return
      //   }
      // if(formData.captcha1 !== captcha){
      //   toast.error("the Captcha Entered Does not Match")
      //   return;
      // }
      const hashedPassword = CryptoJS.MD5(formData.Password).toString();
      const data = {
        UserId: formData.UserId,
        Password: hashedPassword,
        IsOTPGenerated: otpButtonDisabled
      }
      const queryString = new URLSearchParams(data).toString();
      const response = await axiosInstance.post(`Auth/CitizenLogin?${queryString}`);
      if (response.data) {

        if (otpButtonDisabled) {
          if (formData.Password !== otpNumber) {
            toast.error("The Entered OTP is Wrong.Please Enter the Correct OTP")
            return
          }
        }
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          setToken(response.data.token);
        } else {
          
          toast.error('Login Not Authorized');
          localStorage.clear();
          return
        }
        toast.success("Login Successfull !!");
         localStorage.setItem("userProgress", 1);
        setTimeout(() => {
          
           navigate("/BBDDraftGenerated");
        }, 500);
       
    }
      else {
        toast.error("The Given UserId or Password is wrong")
      }
    } catch (error) {

      navigate('/ErrorPage', { state: { errorMessage: error.message, errorLocation: window.location.pathname } });
    }
  
  }
  return (

    <main>
      <CssBaseline />
      <ToastContainer />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100vh' }}>
        {/* Left side for "Welcome Back" text */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fffff',
            padding: 4,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              maxWidth: '70%',   // Ensures the image container doesn’t exceed the width of its container
              height: 'auto',     // Maintains aspect ratio
              display: 'block',   // Prevents extra space below the image
            }}
          >
            {/* <img
              src={AppartMent}
              alt='no images found'
              style={{
                maxWidth: '90%',  // Responsive width
                height: 'auto',    // Maintains aspect ratio
              }}
            /> */}

            <h3>IMPORTANT INSTRUCTIONS/ಪ್ರಮುಖ ಸೂಚನೆಗಳು</h3>
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            padding: 4,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Existing login form components */}
          <Typography
            level="h6"
            component="h6"
            sx={{ fontSize: { xs: '4rem', md: '4rem' }, color: "#00000" }}
          >
            Welcome Back!
          </Typography>
          
          <FormControl sx={{ width: '100%', maxWidth: '500px' }}>
            <FormLabel>User Id</FormLabel>
            <Input
              name="UserId"
              type="text"
              placeholder="User Id"
              fullWidth
              value={formData.UserId}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl sx={{ width: '100%', maxWidth: '500px', marginTop: 2 }}>
            <FormLabel>Password</FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Input
                name="Password"
                type="password"
                placeholder="password"
                sx={{ flex: 1 }}
                value={formData.Password}
                onChange={handleChange}
              /></Box>
              <br/>
              {!otpButtonDisabled && (
                <>
                  <Button variant="solid" color="primary" onClick={handleGenerateOtp}>Send OTP</Button>
                </>
              )}
              {otpButtonDisabled && (
                <Typography >
                  Resend OTP in {timer} seconds
                </Typography>

              )}


            
          </FormControl>
          <FormControl sx={{ width: '100%', maxWidth: '500px', marginTop: 2 }}>
            <FormLabel>CAPTCHA</FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '150px',
                  height: '50px',
                  backgroundColor: '#e0e0e0',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  userSelect: 'none',
                }}
              >
                {captcha.split('').map((char, index) => (
                  <span key={index}>
                    {char}
                  </span>
                ))}
              </Box>
              <Button variant="outlined" onClick={regenerateCaptcha}>Regenerate</Button>
            </Box>
            <Input
              name="captcha"
              type="text"
              placeholder="Enter CAPTCHA"
              value={formData.captcha1}
              onChange={handleCapthaChange}
              sx={{ mt: 1 }}
              fullWidth
            />
          </FormControl>
          <FormControl sx={{ width: '100%', maxWidth: '500px'}}>
          <Button sx={{ mt: 3 }} onClick={handleLogin}>Log in</Button>
          </FormControl>
          <br></br>
          <br></br>
          <Typography variant='solid'>IP Connected:{ipAddress}</Typography>
        </Box>
        
      </Box>
     
    </main>
  );
}
export default Login;
