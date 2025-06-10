// //axiosInstance.js
// import axios from 'axios';
// import { Navigate } from 'react-router-dom';
// import Swal from "sweetalert2";

// const axiosInstance = axios.create({
//     // baseURL: 'https://localhost:7277/api/Bhoomi/',
//     baseURL: 'https://testapps.bbmpgov.in/LayoutKhataAPI',
//     headers: {
//         Accept: '*/*',  
//     },
// });

// // Request interceptor for adding Authorization header
// axiosInstance.interceptors.request.use(
//     (config) => {
//         const accessToken = localStorage.getItem('access_token');
//          const isTokenRequired = localStorage.getItem('isTokenRequired');
    
//         if (accessToken && isTokenRequired === "false") {
//             config.headers.Authorization = `Bearer ${accessToken}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // Response interceptor for handling errors
// axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         // Handle token expiration or other errors globally
//         if (error.response.status === 401 ||  error.response.status === 403) {
//             console.error('Unauthorized, redirecting to login...');
//             Swal.fire({
//                 title: "Session Expired",
//                 text: "Your token has expired. Please re-login to access the dashboard.",
//                 icon: "warning",
//                 confirmButtonText: "Re-login",
//                 allowOutsideClick: false, // Prevent closing by clicking outside
//               }).then((result) => {
//                 if (result.isConfirmed) {
//                   // Navigate to the login page
//                   window.location.href = "/"; // Replace with your login page route
//                 }
//               });
              
//         }
//         return Promise.reject(error);
//     }
// );

// export default axiosInstance;




import axios from 'axios';
import Swal from "sweetalert2";
import { regenerateToken, handleSessionExpired } from './authService';


const axiosInstance = axios.create({
  baseURL: 'https://testapps.bbmpgov.in/LayoutKhataAPI',
  headers: {
    Accept: '*/*',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    const isTokenRequired = localStorage.getItem('isTokenRequired');

    if (accessToken && isTokenRequired === "false") {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await regenerateToken();
        localStorage.setItem('access_token', newToken);
        processQueue(null, newToken);

        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // Instead of redirecting
        Swal.fire({
          title: "Session Expired",
          text: "Unable to refresh token. Please login again.",
          icon: "warning",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        });

        // Custom handler here instead of redirecting
        handleSessionExpired();

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
