// config.local.js

import { Dashboard } from "@mui/icons-material";

const ApiCredentials = {
    credentials: {
        apiUrl: "https://testapps.bbmpgov.in/LayoutKhataAPI",
        loginUrl: "https://testapps.bbmpgov.in/testEaasthiAPI/api/values",
        username: "BBMPOTP",
        password: "10750b6bdc29495297efd2fb29047a94",
        layoutForm: "http://localhost:3001",
        
    }
};

const config = {
      apiBaseUrl: ApiCredentials.credentials.apiUrl,
      apiLoginBaseUrl: ApiCredentials.credentials.loginUrl,
      redirectBaseURL: ApiCredentials.credentials.layoutForm,

  credentials: ApiCredentials.credentials, 

    endpoints: {
        sendOTP: '/fnSendOtp',
        verifyOTP: '/fnValidateOtp',
        epid: '/api/eaasthi/FnGetOwnerKhataDetails',
        send_OTP: '/api/otp/fnSendOtp',
        verify_OTP: '/api/otp/fnValidateOtp',
        kaveriDistrict: '/api/Bhoomi/GetDistrictName',
        kaveriTaluk: '/api/Bhoomi/GetTalukName',
        kaveriHobli: '/api/Bhoomi/GetHobliName',
        kaveriVillage: '/api/Bhoomi/GetVillageName',
        kaveriHissa: '/api/Bhoomi/GetHissaList',
        kaveriFetchDetails: '/api/Bhoomi/GetRTCDetailsWithBhoomiVillage',
        EPIDFetchDetails: '/api/LKRS/fnInsertLKRSinfo',
        insertApprovalInfo: '/api/Approval/fnInsertApprovalinfo',
        listApprovalInfo: '/api/Approval/fnGetApprovalList',
        deleteApprovalInfo: '/api/Approval/fnDeleteApprovalinfo',
        insertReleaseInfo: '/api/Release/fnInsertReleaseinfo',
        deleteReleaseInfo: '/api/Release/fnDeleteReleaseOrderinfo',
        listReleaseInfo: '/api/Release/fnGetReleaseList',
        fileUpload: '/api/Document/fnUploadDocuments',
        fileUploadList: '/api/Document/fnGetDocumentList',
        insertJDAInfo: '/api/JDA/fnInsertJDAinfo',
        fetchJDAInfo: '/api/JDA/fnGetJDAinfo',
        multipleOwnerfetch: '/api/Owner/fnGetOwnerInfo',
        individualSiteDetails: '/api/Site/fnInsertSiteinfo', 
        fetchIndividualSiteDetails: '/api/Site/fnGetSiteInfo', 
        fetchECDetails: '/api/Kaveri/FnKaveriGetECDetails',
        fetchDeedDetails: '/api/Kaveri/FnKaveriGetDeedDetails',
        fetchDeedDetailsDoc: '/api/Kaveri/FnKaveriGetDeedDocumentDetails',
        ekyc_request: '/api/EKYC/RequestEKYC',
        ekyc_response: '/api/EKYC/GetEKYCResponse',
        ekyc_ownerInsert: '/api/Owner/fnInsertOwnerinfo',
        delete_siteInfo: '/api/Site/fnDeleteSiteinfo',
        fetchLKRSID: '/api/LKRS/fnGetLKRSInfo',
        layoutKhata_Save: '/api/LKRS/fnSaveLKRSinfo',
        releasePercentage:'/api/Release/fnGetReleasePercentage',
        releaseSites: '/api/Site/fnReleaseSites',
        jdaEKYCOwnerfetch: '/api/JDA/fnGetJDAEkycinfo',
        jdaEKYCInsert: '/api/JDA/fnInsertJDAEkycinfo',
        dashboardcount: '/api/LKRS/fnGetDashCount',
        dashboardData: '/api/LKRS/fnGetDashData',
    }
};

export default config;