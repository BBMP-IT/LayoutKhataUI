// authService.js
import apiService from './apiService';
import Swal from 'sweetalert2';
import config from '../Config/config';
import axios from 'axios';

// Access token API
export const getAccessToken = async () => {
  const formData = new FormData();
  formData.append("username", "admin");
  formData.append("password", "admin@123");

  return await apiService.postRequest('/Token', formData);
};
export const checkTokenExpiry = () => {
  const sessionData = JSON.parse(sessionStorage.getItem('sessionData'));
  if (sessionData) {
    const currentTime = Date.now();
    if (currentTime >= sessionData.expiry) {
      // Expired
      sessionStorage.clear();
      return false;
    }
    return true;
  }
  return false;  // no session data
};
//Regenerate token API
export const regenerateToken = async () => {
  const formData = new FormData();
  formData.append("username", "admin");
  formData.append("password", "admin@123");

  const response = await axios.post('https://testapps.bbmpgov.in/LayoutKhataAPI/Token', formData);
  return response.data?.access_token; // Ensure this matches the actual token key in your response
};
//handle session expired
export const handleSessionExpired = () => {
  // Clear the token or set a session-expired flag
  sessionStorage.removeItem('access_token');
  sessionStorage.setItem('sessionExpired', 'true');
};
//send otp API
export const sendOtpAPI = async (mobileNumber) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.send_OTP}`, {
      mobileNumber: mobileNumber,
      source: "Layout khata",
    });
    return response;
  } catch (error) {
    console.error("OTP Send Error:", error);
    throw error;
  }
};
//verify OTP API
export const verifyOtpAPI = async (mobileNumber, otp) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.verify_OTP}`, {
      mobileNumber,
      otp,
      source: "Layout khata",
    });
    return response;
  } catch (error) {
    console.error("OTP Verification Error:", error);
    throw error;
  }
};
//District API 
export const handleFetchDistricts = async (newLanguage) => {
  try {


    const response = await apiService.getRequest(`${config.endpoints.kaveriDistrict}`, {}); // assuming relative path only

    if (response.responsE_CODE === "200") {
      const modifiedDistricts = response.district.map((dist) => ({
        ...dist,
        displayName: newLanguage === 'kn' ? dist.districT_NAME_KN : dist.districT_NAME
      }));

      return modifiedDistricts; // return processed data
    } else {
      throw new Error(`Unexpected response code: ${response.responsE_CODE}`);
    }
  } catch (err) {
    console.error("Error fetching districts", err);
    throw err;
  }
};
//taluk API
export const handleFetchTalukOptions = async (districtCode, language) => {
  try {


    const response = await apiService.postRequest(`${config.endpoints.kaveriTaluk}`, {
      districT_CODE: String(districtCode),
    });

    if (response.responsE_CODE === "200") {
      const talukOptions = response.taluk.map((item) => ({
        ...item,
        displayName: language === 'kn' ? item.talukA_NAME_KN : item.talukA_NAME,
      }));

      return talukOptions;
    } else {
      console.error('Unexpected response code while fetching taluks:', response);
      throw new Error(response.responsE_DESC || 'Taluk fetch failed');
    }
  } catch (err) {
    console.error("Error fetching taluk options:", err);
    throw err;
  }
};
//Hobli API
export const handleFetchHobliOptions = async (districtCode, talukCode, language) => {
  try {

    const response = await apiService.postRequest(`${config.endpoints.kaveriHobli}`, {
      districT_CODE: String(districtCode),
      taluK_CODE: String(talukCode),
    });

    if (response.responsE_CODE === "200") {
      return response.hobli.map(item => ({
        ...item,
        displayName: language === 'kn' ? item.hoblI_NAME_KN : item.hoblI_NAME
      }));
    }

    console.error("Error in hobli API response:", response);
    return [];
  } catch (err) {
    console.error("Error fetching hoblis:", err);
    throw err;
  }
};
//Village API
export const handleFetchVillageOptions = async (districtCode, talukCode, hobliCode, language) => {
  try {

    const response = await apiService.postRequest(`${config.endpoints.kaveriVillage}`, {
      districT_CODE: String(districtCode),
      taluK_CODE: String(talukCode),
      hoblI_CODE: String(hobliCode),
    });

    if (response.responsE_CODE === "200") {
      return response.village.map(item => ({
        ...item,
        displayName: language === 'kn' ? item.villagE_NAME_KN : item.villagE_NAME
      }));
    }

    console.error("Error in village API response:", response);
    return [];
  } catch (err) {
    console.error("Error fetching villages:", err);
    throw err;
  }
};
//GO btn fetch API
export const handleFetchHissaOptions = async ({
  districtCode,
  talukCode,
  hobliCode,
  villageCode,
  surveyNo
}) => {
  try {
    const payload = {
      bhm_dist_code: String(districtCode),
      bhm_taluk_code: String(talukCode),
      bhm_hobli_code: String(hobliCode),
      village_code: String(parseInt(villageCode)),
      survey_no: String(surveyNo),
    };

    const response = await apiService.postRequest(`${config.endpoints.kaveriHissa}`, payload);

    if (response?.surnoc && response?.hissaNo && response?.landCode) {
      return {
        surnocOptions: [response.surnoc],
        hissaOptions: [response.hissaNo],
        landCode: response.landCode,
      };
    } else {
      console.warn("No valid Hissa data received", response);
      return {
        surnocOptions: [],
        hissaOptions: [],
        landCode: '',
      };
    }
  } catch (error) {
    console.error("Error in handleFetchHissaOptions:", error);
    throw error;
  }
};
//RTC details API
export const fetchRTCDetailsAPI = async ({
  districtCode,
  talukCode,
  hobliCode,
  villageCode,
  landCode
}) => {
  try {
    const payload = {
      disT_CODE: districtCode.toString(),
      taluK_CODE: talukCode.toString(),
      hoblI_CODE: hobliCode.toString(),
      villagE_CODE: villageCode.toString(),
      lanD_CODE: landCode.toString(),
    };

    const response = await apiService.postRequest(`${config.endpoints.kaveriFetchDetails}`, payload);

    if (response?.responsE_CODE === '200') {
      const parsedData = JSON.parse(response.data);
      return { success: true, data: parsedData };
    } else {
      return { success: false, message: response.responsE_MESSAGE };
    }
  } catch (error) {
    console.error("Error in fetchRTCDetailsAPI:", error);
    throw error;
  }
};
//Survey Number first block Save API
export const submitsurveyNoDetails = async (payload) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.EPIDFetchDetails}`, payload);
    return response;
  } catch (error) {
    console.error("EPID Fetching Details Error:", error);
    throw error;
  }
};
//EPID fetching API
// export const handleFetchEPIDDetails = async (epidNumber) => {
//   try {

//     const response = await apiService.postRequest(`${config.endpoints.epid}`, {
//       propertyEPID: epidNumber,
//     });

//     // The API returns approvedPropertyDetails inside epidKhataDetails.response
//     const parsedResponse = response.epidKhataDetails?.response;

//     if (parsedResponse?.isValueExists === "Y") {
//       if (response.responseCode === 200 && response.responseStatus === true) {
//         const approvedDetails = parsedResponse.approvedPropertyDetails;

//         if (!approvedDetails) {
//           throw new Error("No property details found");
//         }

//         return approvedDetails;
//       } else {
//         var message = response.responseMessage;
//         if(message === "NOT AUTHORISED"){
//           message = "NOT AUTHORISED";

//         }
//         Swal.fire({
//         title: "Error",
//         text: message,
//         icon: "error",
//         confirmButtonText: "OK",
//       });
//       }
//     } else {
//       Swal.fire({
//         title: "Error",
//         text: "EPID is invalid. Please provide a correct EPID",
//         icon: "error",
//         confirmButtonText: "OK",
//       });
//     }
//   } catch (err) {
//     console.error("Error fetching EPID details:", err);
//     throw err;
//   }
// };

export const handleFetchEPIDDetails = async (epidNumber) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.epid}`, {
      propertyEPID: epidNumber,
    });

    const epidKhataDetails = response?.epidKhataDetails;
    const parsedResponse = epidKhataDetails?.response;

    // Check if value exists and approved details are present
    if (parsedResponse?.isValueExists === "Y") {
      const approvedDetails = parsedResponse?.approvedPropertyDetails;

      if (!approvedDetails) {
        return {
          error: "No property details found",
          responseMessage: response?.responseMessage || "No response message",
          fullResponse: response
        };
      }

      // If response is successful
      if (
        response?.responseCode === 200 &&
        response?.responseStatus === true &&
        response?.responseMessage === "Success"
      ) {
        return {
          epidKhataDetails,
          data: parsedResponse,
          responseCode: response.responseCode,
          responseStatus: response.responseStatus,
          responseMessage: response.responseMessage,
        };
      } else {
        return {
          error: response?.responseMessage || "Unknown error",
          responseMessage: response?.responseMessage,
          fullResponse: response
        };
      }
    } else {
      return {
        error: "EPID is invalid. Please provide a correct EPID",
        responseMessage: response?.responseMessage,
        fullResponse: response
      };
    }
  } catch (err) {
    console.error("Error fetching EPID details:", err);
    return {
      error: "Unable to retrieve data due to temporary issue with Eaasthi. Please try again later.",
      responseMessage: err?.message,
      exception: err
    };
  }
};



//EPID first block Save API
export const submitEPIDDetails = async (payload) => {
  try {

    const response = await apiService.postRequest(`${config.endpoints.EPIDFetchDetails}`, payload);

    return response;
  } catch (error) {
    console.error("EPID Fetching Details Error:", error);
    throw error;
  }
};
//Approval Order API
export const insertApprovalInfo = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.insertApprovalInfo, payload);
    return response;
  } catch (error) {
    console.error("Insert Approval Info Error:", error);
    throw error;
  }
};
//Approval Order List API
export const listApprovalInfo = async ({ level, aprLkrsId, aprId }) => {
  try {
    const url = `${config.endpoints.listApprovalInfo}?level=${level}&aprLkrsId=${aprLkrsId}&aprId=${aprId}`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("Insert Approval Info Error:", error);
    throw error;
  }
};
//Delete Approval information
export const deleteApprovalInfo = async (payload) => {
  try {
    const response = await apiService.deleteRequest(`${config.endpoints.deleteApprovalInfo}`, payload);
    return response;
  } catch (error) {
    console.error("Deleting approval info Details Error:", error);
    throw error;
  }
};
//release Order API
export const insertReleaseInfo = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.insertReleaseInfo, payload);
    return response;
  } catch (error) {
    console.error("Insert Approval Info Error:", error);
    throw error;
  }
};
//Delete Release Order information
export const deleteReleaseInfo = async (payload) => {
  try {
    const response = await apiService.deleteRequest(`${config.endpoints.deleteReleaseInfo}`, payload);
    return response;
  } catch (error) {
    console.error("Deleting approval info Details Error:", error);
    throw error;
  }
};
//release Order List API
export const listReleaseInfo = async ({ level, lkrsId, siteRelsId }) => {
  try {
    const url = `${config.endpoints.listReleaseInfo}?level=${level}&siteRelsId=${siteRelsId}&lkrsId=${lkrsId}`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("Insert Approval Info Error:", error);
    throw error;
  }
};
//File upload API
export const fileUploadAPI = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.fileUpload, payload);
    return response;
  } catch (error) {
    console.error("File upload Error:", error);
    throw error;
  }
};
//File upload get list API
export const fileListAPI = async (level, LKRSID, MSTDOCID, docID) => {
  try {
    const url = `${config.endpoints.fileUploadList}?level=${level}&docLkrsId=${LKRSID}&MdocId=${MSTDOCID}&docId=${docID}`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("File upload Error:", error);
    throw error;
  }
};
//JDA DETAILS save API
export const insertJDA_details = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.insertJDAInfo, payload);
    return response;
  } catch (error) {
    console.error("insert data Error:", error);
    throw error;
  }
};
//JDA details fetch API
export const fetchJDA_details = async (level, lkrsId, jdaId) => {
  try {

    const url = `${config.endpoints.fetchJDAInfo}?level=${level}&lkrsId=${lkrsId}&jdaId=${jdaId}`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("fetch details Error:", error);
    throw error;
  }
};
//EKYC owner list API
export const ownerEKYC_Details = async (level, LKRSID) => {
  try {
    const url = `${config.endpoints.multipleOwnerfetch}?level=${level}&ownLkrsId=${LKRSID}&aprId=0`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("multiple Owner fetch Error:", error);
    throw error;
  }
};
//EKYC JDA Owner list API
export const jdaEKYC_Details = async (level, LKRSID) => {
  try {
    const url = `${config.endpoints.jdaEKYCOwnerfetch}?level=${level}&lkrsId=${LKRSID}&jdaId=0&jdaEkycJdaId=0`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("multiple Owner fetch Error:", error);
    throw error;
  }
};

//DO EKYC API
export const ekyc_Details = async ({ LKRS_ID, OwnerNumber, BOOK_APP_NO, PROPERTY_CODE, redirectSource, EkycResponseUrl }) => {
  try {
    const query = `?LKRS_ID=${LKRS_ID}&OwnerNumber=${OwnerNumber}&BOOK_APP_NO=${BOOK_APP_NO}&PROPERTY_CODE=${PROPERTY_CODE}&redirectSource=${redirectSource}&EkycResponseUrl=${EkycResponseUrl}`;
    const url = config.endpoints.ekyc_request + query;

    const response = await apiService.postRequest(url); // No payload needed
    return response;
  } catch (error) {
    console.error("EKYC request Error:", error);
    throw error;
  }
};
//EKYC Resposne API
export const ekyc_Response = async (transactionNumber, OwnerType,  ownerName, ownerNo, LKRS_ID, redirectSource) => {  
  try {
    // const queryParams = new URLSearchParams({
    //   transactionNumber: payload.transactionNumber,
    //   OwnerType: payload.OwnerType,
    //   ownName: payload.ownName,
    // }).toString();

    // const url = `${config.endpoints.ekyc_response}?${queryParams}`;

    const query = `?LKRS_ID=${LKRS_ID}&OwnerNumber=${ownerNo}&transactionNumber=${transactionNumber}&OwnerType=${OwnerType}&ownName=${ownerName}&redirectSource=${redirectSource}`;
    const url = config.endpoints.ekyc_response + query;


    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("EKYC request Error:", error);
    throw error;
  }
};
//EKYC Owner Insert API
export const ekyc_insertOwnerDetails = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.ekyc_ownerInsert, payload);
    return response;
  } catch (error) {
    console.error("EKYC insert owner details Error:", error);
    throw error;
  }
};
//EKYC JDA Insert API
export const ekyc_insertJDADetails = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.jdaEKYCInsert, payload);
    return response;
  } catch (error) {
    console.error("EKYC insert owner details Error:", error);
    throw error;
  }
};
//Individual Site details API
export const individualSiteAPI = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.individualSiteDetails, payload);
    return response;
  } catch (error) {
    console.error("File upload Error:", error);
    throw error;
  }
};
//Individual site table details APi
export const individualSiteListAPI = async ({ level, LkrsId, SiteID }) => {
  try {
    const url = `${config.endpoints.fetchIndividualSiteDetails}?level=${level}&LkrsId=${LkrsId}&SiteID=${SiteID}`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("fetch individual site Info Error:", error);
    throw error;
  }
};
//EC fetch Details API
export const fetchECDetails = async (payload) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.fetchECDetails}`, payload);
    return response;
  } catch (error) {
    console.error("EC Fetching Details Error:", error);
    throw error;
  }
};
//Deed fetch Details API
export const fetchDeedDetails = async (payload) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.fetchDeedDetails}`, payload);
    return response;
  } catch (error) {
    console.error("EC Fetching Details Error:", error);
    throw error;
  }
};
//Deed Document fetch Details API
export const fetchDeedDocDetails = async (payload) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.fetchDeedDetailsDoc}`, payload);
    return response;
  } catch (error) {
    console.error("EC Fetching Details Error:", error);
    throw error;
  }
};
//Delete Site information
export const deleteSiteInfo = async (payload) => {
  try {
    const response = await apiService.deleteRequest(`${config.endpoints.delete_siteInfo}`, payload);
    return response;
  } catch (error) {
    console.error("Deleting site info Details Error:", error);
    throw error;
  }
};
//Fetch LKRSID
export const fetch_LKRSID = async (localLKRSID) => {
  try {
    const url = `${config.endpoints.fetchLKRSID}?level=1&LkrsId=${localLKRSID}`;

    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("Fetch LKRSID Info Error:", error);
    throw error;
  }
};
//final Save button API
export const update_Final_SaveAPI = async (payload) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.layoutKhata_Save}`, payload);
    return response;
  } catch (error) {
    console.error("EC Fetching Details Error:", error);
    throw error;
  }
};
//release dashoard Percentage
export const fetch_releasePercentageDetails = async (lkrsId) => {
  try {
    const url = `${config.endpoints.releasePercentage}?lkrsId=${lkrsId}`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("Fetch LKRSID Info Error:", error);
    throw error;
  }
};
//final Save button API
export const final_Release_Sites = async (payload) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.releaseSites}`, payload);
    return response;
  } catch (error) {
    console.error("Sites release Details Error:", error);
    throw error;
  }
};
//Layoutkhata dashoard Counts
export const fetch_DashboardDetails = async (CreatedBy) => {
  try {
    const url = `${config.endpoints.dashboardcount}?level=1&LKRS_CREATEDBY=${CreatedBy}`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("Fetch LKRSID Info Error:", error);
    throw error;
  }
};
//Layoutkhata dashoard Data
export const fetch_DashboarddataDetails = async (level, CreatedBy) => {
  try {
    const url = `${config.endpoints.dashboardData}?level=${level}&LKRS_CREATEDBY=${CreatedBy}`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("Fetch LKRSID Info Error:", error);
    throw error;
  }
};
//EKYC Release Insert API
export const ekyc_insertReleaseDetails = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.releaseEKYCInsert, payload);
    return response;
  } catch (error) {
    console.error("EKYC insert owner details Error:", error);
    throw error;
  }
};
//DC conversion Insert API
export const dc_insertDetails = async (payload) => {
  try {
    const response = await apiService.postRequest(config.endpoints.insertDCconversion, payload);
    return response;
  } catch (error) {
    console.error("DC conversion insert details Error:", error);
    throw error;
  }
};
//DC conversion Fetch API 
export const dcConversionListAPI = async (LKRSID, dcID) => {
  try {
    const url = `${config.endpoints.fetchDCconversion}?level=1&lkrsId=${LKRSID}`;
    const response = await apiService.getRequest(url);
    return response;
  } catch (error) {
    console.error("DC conversion fetch Error:", error);
    throw error;
  }
};
//DC conversion Fetch from Bhoomi API 
export const bhommiDCConversionFetchAPI = async (affidavitID) => {
  try {
    const response = await apiService.postRequest(
      `${config.endpoints.fetchDCconversion}`,
      { affidavitID: affidavitID }
    );
    return response;
  } catch (error) {
    console.error("DC conversion fetch Error:", error);
    throw error;
  }
};
//Delete DCconversion information
export const deleteDCconversionInfo = async (payload) => {
  try {
    const response = await apiService.deleteRequest(`${config.endpoints.deleteDCconversion}`, payload);
    return response;
  } catch (error) {
    console.error("Deleting approval info Details Error:", error);
    throw error;
  }
};
//zone fetch API 
export const fetchZoneFromWardList = async (wardIds, lkrS_ID = 600) => {
  try {
    const response = await apiService.postRequest(`${config.endpoints.fetchZoneWard}`, {
      wardId: wardIds,
      lkrS_ID: lkrS_ID,
    });

    return response;
  } catch (error) {
    console.error("Error fetching zone from ward list", error);
    throw error;
  }
};