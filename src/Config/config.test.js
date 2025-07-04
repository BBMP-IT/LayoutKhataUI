// config.prod.js

// ApiCredentials.js

const ApiCredentials = {
    credentials: {
        apiUrl: "https://testapps.bbmpgov.in/ekhata/api/values",
        username: "BBMPOTP",
        password: "10750b6bdc29495297efd2fb29047a94"
    }
};

const config = {
    apiBaseUrl: ApiCredentials.credentials.apiUrl,

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
        insertApprovalInfo: '/api/Approval/fnInsertApprovalinfo',
        listApprovalInfo: '/api/Approval/fnGetApprovalList',
        insertReleaseInfo: '/api/Release/fnInsertReleaseinfo',
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

    }
};


export default config;