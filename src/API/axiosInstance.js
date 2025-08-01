import axios from 'axios';
import Swal from "sweetalert2";
import { triggerLogout } from '../AuthContext';
import config from '../Config/config';


const axiosInstance = axios.create({
  // baseURL: 'https://testapps.bbmpgov.in/LayoutKhataAPI',
  baseURL: config.apiBaseUrl,
  headers: {
    Accept: '*/*',
  },
});

// Request interceptor for adding Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem('access_token');
    const isTokenRequired = sessionStorage.getItem('isTokenRequired');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      debugger;
      if (status === 401) {
        console.error('401 Unauthorized, redirecting to login...');
        sessionStorage.clear();
        Swal.fire({
          title: "Unauthorized",
          text: "Your session has expired or you are unauthorized. Please re-login.",
          icon: "warning",
          confirmButtonText: "Re-login",
          allowOutsideClick: false
        }).then(() => {
         triggerLogout();
          window.location.href = "/Login"; 
        });

      } else if (status === 403) {
        debugger;
        console.error('403 Forbidden, access denied...');

        Swal.fire({
          title: "Something went wrong, Please try again later!",
          // text: "You do not have permission to access this resource.",
          icon: "error",
          confirmButtonText: "Ok",
          allowOutsideClick: false
        })
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
















// import axios from 'axios';
// import Swal from "sweetalert2";
// import { regenerateToken, handleSessionExpired } from './authService';


// const axiosInstance = axios.create({
//   baseURL: 'https://testapps.bbmpgov.in/LayoutKhataAPI',
//   headers: {
//     Accept: '*/*',
//   },
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const accessToken = sessionStorage.getItem('access_token');
//     const isTokenRequired = sessionStorage.getItem('isTokenRequired');

//     if (accessToken && isTokenRequired === "false") {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers['Authorization'] = 'Bearer ' + token;
//             return axiosInstance(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const newToken = await regenerateToken();
//         sessionStorage.setItem('access_token', newToken);
//         processQueue(null, newToken);

//         originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
//         return axiosInstance(originalRequest);
//       } catch (err) {
//         processQueue(err, null);

//         // Instead of redirecting
//         Swal.fire({
//           title: "Session Expired",
//           text: "Unable to refresh token. Please login again.",
//           icon: "warning",
//           confirmButtonText: "OK",
//           allowOutsideClick: false,
//         });

//         // Custom handler here instead of redirecting
//         handleSessionExpired();

//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
