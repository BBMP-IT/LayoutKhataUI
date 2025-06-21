import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import DashboardLayout from '../../Layout/DashboardLayout';
import { useTranslation } from "react-i18next";
import i18n from "../../localization/i18n";
import SAS_Sample from '../../assets/Sample_SAS_APPLICATIONNO.jpeg';
import SampleDeep_no from '../../assets/deedNo.jpg';
import Swal from "sweetalert2";
import Loader from "../../Layout/Loader";
import DataTable from "react-data-table-component";
import axios from 'axios';
import { useTable, usePagination } from "react-table";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { toast, Toaster } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import apiService from '../../API/apiService';
import {
    handleFetchDistricts, handleFetchTalukOptions, handleFetchHobliOptions, handleFetchVillageOptions,
    handleFetchHissaOptions, fetchRTCDetailsAPI, handleFetchEPIDDetails, getAccessToken, sendOtpAPI, verifyOtpAPI, submitEPIDDetails, submitsurveyNoDetails,
    insertApprovalInfo, listApprovalInfo, deleteApprovalInfo, insertReleaseInfo, listReleaseInfo, fileUploadAPI, fileListAPI, insertJDA_details, ownerEKYC_Details, ekyc_Details, ekyc_Response, ekyc_insertOwnerDetails,
    individualSiteAPI, individualSiteListAPI, fetchECDetails, fetchDeedDocDetails, fetchDeedDetails, fetchJDA_details, deleteSiteInfo, fetch_LKRSID, update_Final_SaveAPI
} from '../../API/authService';

import usericon from '../../assets/usericon.png';
import { Cookie, Stop } from '@mui/icons-material';
import { responsiveProperty } from '@mui/material/styles/cssUtils';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};

const BBMP_SubmittedInfo = () => {
    const { loading, start_loader, stop_loader } = useLoader();
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { LKRS_ID, createdBy, createdName, roleID, display_LKRS_ID } = location.state || {};

    const [selectedLandType, setSelectedLandType] = useState("");
    const [ecNumber, setECNumber] = useState("");
    const buttonRef = useRef(null);
    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
            if (buttonRef.current) {
                buttonRef.current.click();
            }
        } else {
            const id = localStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
        }
    }, [LKRS_ID]);
    const fetch_details = async () => {
        if (!localLKRSID) return;
        await handleGetLKRSID(localLKRSID);
        await fetchApprovalList(localLKRSID);
        await fetchReleaseList(localLKRSID);
        await fetchSiteDetails(localLKRSID);
        await fetchJDAInfo(localLKRSID);
        await owner_EKYCDetails(localLKRSID);
        await JDA_EKYCDetails(localLKRSID);
    }
    // =======================================================survey no details starts=========================================
    const [rtcAddedData, setRtcAddedData] = useState([]);
    const [rtcData, setRtcData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Define state variables for your totals - keep them as numbers
    const [totalAcre, setTotalAcre] = useState(0);
    const [totalGunta, setTotalGunta] = useState(0);
    const [totalFGunta, setTotalFGunta] = useState(0);
    const [totalSqFt, setTotalSqFt] = useState(0); // Changed to number (0)
    const [totalSqM, setTotalSqM] = useState(0); // Changed to number (0)


    const combinedData = [...rtcAddedData, ...rtcData];

    useEffect(() => {
        let calculatedTotalAcre = 0;
        let calculatedTotalGunta = 0;
        let calculatedTotalFGunta = 0;
        let calculatedTotalSqFt = 0;
        let calculatedTotalSqM = 0;

        combinedData.forEach((row) => {
            const acre = parseFloat(row.ext_acre || 0);
            const gunta = parseFloat(row.ext_gunta || 0);
            const fgunta = parseFloat(row.ext_fgunta || 0);

            calculatedTotalAcre += acre;
            calculatedTotalGunta += gunta;
            calculatedTotalFGunta += fgunta;

            const sqft = (acre * 43560) + (gunta * 1089) + (fgunta * 68.0625);
            calculatedTotalSqFt += sqft;
            calculatedTotalSqM += sqft * 0.092903;
        });

        // Normalize fgunta -> gunta -> acre
        calculatedTotalGunta += Math.floor(calculatedTotalFGunta / 16);
        calculatedTotalFGunta = calculatedTotalFGunta % 16;
        calculatedTotalAcre += Math.floor(calculatedTotalGunta / 40);
        calculatedTotalGunta = calculatedTotalGunta % 40;

        // Update state variables with the calculated totals
        setTotalAcre(calculatedTotalAcre);
        setTotalGunta(calculatedTotalGunta);
        setTotalFGunta(calculatedTotalFGunta);
        // Store them as numbers in state
        setTotalSqFt(calculatedTotalSqFt);
        setTotalSqM(calculatedTotalSqM);

        // Store the rounded value in localStorage if that's what's intended
        localStorage.setItem('areaSqft', calculatedTotalSqFt.toFixed(2));

    }, [combinedData]);

    const totalPages = Math.ceil(combinedData.length / rowsPerPage);
    const paginatedData = combinedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handlePageSizeChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const [localLKRSID, setLocalLKRSID] = useState(LKRS_ID || "");
    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        }
    }, [LKRS_ID]);

    const mapSurveyDetails = (surveyDetails) => {
        return surveyDetails.map((item) => ({
            district: item.suR_DISTRICT_Name || "—",
            taluk: item.suR_TALUK_Name || "—",
            hobli: item.suR_HOBLI_Name || "—",
            village: item.suR_VILLAGE_Name || "—",
            owner: item.suR_OWNERNAME || "—",
            survey_no: item.suR_SURVEYNO,
            surnoc: item.suR_SURNOC,
            hissa_no: item.suR_HISSA,
            ext_acre: item.suR_EXTACRE || 0,
            ext_gunta: item.suR_EXTGUNTA || 0,
            ext_fgunta: item.suR_EXTFgunta || 0,
        }));
    };


    // =======================================================Khata details starts=========================================
    const [epidshowTable, setEPIDShowTable] = useState(false);
    const [epid_fetchedData, setEPID_FetchedData] = useState(null);
    const [phoneNumbers, setPhoneNumbers] = useState({});
    const [ownerTableData, setOwnerTableData] = useState([]);
    const [hasJDA, setHasJDA] = useState(false);

    const customStyles = {
        headCells: {
            style: {
                fontWeight: 'bold',
                fontSize: '14px',
            },
        },
        cells: {
            style: {
                fontSize: '16px', // table data font size
            },
        },
    };
    const columns = [
        { name: 'S.No', selector: (row, index) => index + 1, width: '70px', center: true },
        { name: 'Property ID', width: '140px', selector: () => epid_fetchedData?.PropertyID, center: true },
        {
            name: 'Owner Name', center: true,

            cell: () => (
                <div style={{

                }}>
                    {epid_fetchedData?.OwnerDetails?.[0].ownerName || 'N/A'}
                </div>
            )
        },

        { name: 'ID Type', width: '120px', selector: () => epid_fetchedData?.OwnerDetails?.[0].idType || 'N/A', center: true },
        { name: 'ID Number', width: '220px', selector: () => epid_fetchedData?.OwnerDetails?.[0].idNumber || 'N/A', center: true },
        {
            name: 'Validate OTP',
            width: '250px',
            cell: (row, index) => (
                <div className='mb-3'><br />
                    <input
                        type="tel"
                        className="form-control mb-1"
                        placeholder="Mobile Number"
                        readOnly
                        value={
                            phoneNumbers[index] ??
                            row.MobileNumber ??
                            epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber ??
                            ""
                        }
                        maxLength={10}
                    />

                    <div className="text-success font-weight-bold mt-2">
                        OTP Verified <i className="fa fa-check-circle"></i>
                    </div>

                </div>
            ), center: true
        }
    ];

    //fetching Details from LKRSID
    const handleGetLKRSID = async (localLKRSID) => {
        const payload = {
            level: 1,
            LkrsId: localLKRSID,
        };
        try {
            start_loader();
            const response = await fetch_LKRSID(payload);

            if (response && response.surveyNumberDetails && response.surveyNumberDetails.length > 0) {

                setSelectedLandType(response.lkrS_LANDTYPE); //  Store the land type
                setECNumber(response.lkrS_ECNUMBER);         // Set EC Number
                if (response.lkrS_ISJDA === "1") {
                    setHasJDA(true);
                } else {
                    setHasJDA(false);
                }


                const parsedSurveyDetails = mapSurveyDetails(response.surveyNumberDetails);

                setRtcAddedData(prev => {
                    const existingKeys = new Set(
                        prev.map(item => `${item.surveyNumber}_${item.ownerName}`)
                    );

                    const filteredNewData = parsedSurveyDetails.filter(item => {
                        const key = `${item.surveyNumber}_${item.ownerName}`;
                        return !existingKeys.has(key);
                    });

                    return [...prev, ...filteredNewData];
                });
                stop_loader();
            } else if (response && response.khataDetails && response.khataOwnerDetails && response.khataOwnerDetails.length > 0) {
                setSelectedLandType(response.lkrS_LANDTYPE); //  Store the land type
                setECNumber(response.lkrS_ECNUMBER);         // Set EC Number
                if (response.lkrS_ISJDA === "1") {
                    setHasJDA(true);
                } else {
                    setHasJDA(false);
                }
                setEPIDShowTable(true);
                let khataDetailsJson = {};
                if (response.khataDetails?.khatA_JSON) {
                    try {
                        khataDetailsJson = JSON.parse(response.khataDetails.khatA_JSON);
                    } catch (err) {
                        console.warn("Failed to parse khatA_JSON", err);
                    }
                }

                setEPID_FetchedData({
                    PropertyID: response.lkrS_EPID || '',
                    PropertyCategory: khataDetailsJson.propertyCategory || '',
                    PropertyClassification: khataDetailsJson.propertyClassification || '',
                    WardNumber: khataDetailsJson.wardNumber || '',
                    WardName: khataDetailsJson.wardName || '',
                    StreetName: khataDetailsJson.streetName || '',
                    Streetcode: khataDetailsJson.streetcode || '',
                    SASApplicationNumber: khataDetailsJson.sasApplicationNumber || '',
                    IsMuation: khataDetailsJson.isMuation || '',
                    KaveriRegistrationNumber: khataDetailsJson.kaveriRegistrationNumber || [],
                    AssessmentNumber: khataDetailsJson.assessmentNumber || '',
                    courtStay: khataDetailsJson.courtStay || '',
                    enquiryDispute: khataDetailsJson.enquiryDispute || '',
                    CheckBandi: khataDetailsJson.checkBandi || {},
                    SiteDetails: khataDetailsJson.siteDetails || {},
                    OwnerDetails: khataDetailsJson.ownerDetails || [],
                    // Optionally add raw API response too if needed
                    rawResponse: response,
                });

                // Optionally update area sqft if siteDetails present
                if (khataDetailsJson.siteDetails?.siteArea) {
                    setTotalSqFt(khataDetailsJson.siteDetails.siteArea);
                    localStorage.setItem('areaSqft', khataDetailsJson.siteDetails.siteArea);
                } else {
                    setTotalSqFt(0);
                    localStorage.removeItem('areaSqft');
                }

                setOwnerTableData(khataDetailsJson.ownerDetails || []);
            } else {
                stop_loader();
                Swal.fire({
                    text: "No survey details found.",
                    icon: "warning",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to fetch LKRSID data:", error);
        }
    };

    // ================================================Approval and release order Details starts=======================
    const [records, setRecords] = useState([]);
    const [order_records, setOrder_Records] = useState([]);
    const order_columns = [
        {
            name: t('translation.BDA.table1.slno'),
            cell: (row, index) => index + 1, // Adding 1 to start serial numbers from 1
            width: '80px', // Adjust width as needed
            center: true,
        },
        {
            name: t('translation.BDA.table1.siteOrderNo'),
            selector: row => row.layoutReleaseNumber,
            sortable: true, center: true,
        },
        {
            name: t('translation.BDA.table1.dateOforder'),
            center: true,
            selector: row => {
                const date = new Date(row.dateOfOrder);

                // Ensure the date is valid
                if (isNaN(date)) {
                    return '';  // Handle invalid date by returning an empty string or a placeholder
                }

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();

                return `${day}-${month}-${year}`;
            },
            sortable: true,
        },
        {
            name: t('translation.BDA.table1.siteOrder'),
            center: true,
            cell: row => {
                if (row.orderReleaseFile) {
                    const blob = base64ToBlob(row.orderReleaseFile);

                    if (blob) {
                        const fileUrl = URL.createObjectURL(blob);
                        return (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="stableBlueLink"
                                onClick={() => {
                                    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
                                }}
                            >
                                View File
                            </a>
                        );
                    } else {
                        return 'Invalid file';
                    }
                } else {
                    return 'No file';
                }
            },
        },
        {
            name: t('translation.BDA.table1.approvalAuthority'),
            selector: row => row.releaseAuthority,
            sortable: true,
            center: true,
        },
        {
            name: "Release Type",
            selector: row => row.releaseType,
            center: true,
            sortable: true,
        },
    ];

    const approval_columns = [
        {
            name: t('translation.BDA.table.slno'),
            cell: (row, index) => index + 1,
            width: '80px',
        },
        {
            name: t('translation.BDA.table.approvalNo'),
            selector: row => row.layoutApprovalNumber,
            sortable: true,
        },
        {
            name: t('translation.BDA.table.dateOfApproval'),
            selector: row => {
                const date = new Date(row.dateOfApproval);

                // Ensure the date is valid
                if (isNaN(date)) {
                    return '';  // Handle invalid date by returning an empty string or a placeholder
                }

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();

                return `${day}-${month}-${year}`;
            },
            sortable: true,
        },
        {
            name: t('translation.BDA.table.approvalOrder'),
            cell: row => {
                if (row.approvalOrder) {
                    const blob = base64ToBlob(row.approvalOrder);

                    if (blob) {
                        const fileUrl = URL.createObjectURL(blob);
                        return (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="stableBlueLink"
                                onClick={() => {
                                    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
                                }}
                            >
                                View File
                            </a>
                        );
                    } else {
                        return 'Invalid file';
                    }
                } else {
                    return 'No file';
                }
            },
        },
        {
            name: t('translation.BDA.table.approvalMap'),
            cell: row => {
                if (row.approvalMap) {
                    const blob = base64ToBlob(row.approvalMap);

                    if (blob) {
                        const fileUrl = URL.createObjectURL(blob);
                        return (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="stableBlueLink"
                                onClick={() => {
                                    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
                                }}
                            >
                                View File
                            </a>
                        );
                    } else {
                        return 'Invalid file';
                    }
                } else {
                    return 'No file';
                }
            },
        },

        {
            name: t('translation.BDA.table.approvalAuthority'),
            selector: row => row.approvalAuthority,
            sortable: true,
        },
    ];
    const base64ToBlob = (dataUrl, mimeType = 'application/pdf') => {
        try {
            // If it's a full Data URL, split it
            const base64 = dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : dataUrl;

            const byteCharacters = atob(base64);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = Array.from(slice).map(char => char.charCodeAt(0));
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            return new Blob(byteArrays, { type: mimeType });
        } catch (error) {
            console.error("Invalid base64 input:", dataUrl);
            return null; // return null if decoding fails
        }
    };
    const fetchApprovalList = async (localLKRSID) => {
        start_loader();
        try {
            const listPayload = {
                level: 1,
                aprLkrsId: localLKRSID,
                aprId: 0,
            };

            const listResponse = await listApprovalInfo(listPayload);

            const approvalFileResponse = await fileListAPI(3, localLKRSID, 1, 0);
            const approvalMapFileResponse = await fileListAPI(3, localLKRSID, 2, 0);

            if (Array.isArray(listResponse)) {
                const formattedList = listResponse.map((item, index) => {
                    // Try to match approval number with current formData if available
                    const isCurrent = item.apr_Approval_No;

                    return {
                        layoutApprovalNumber: item.apr_Approval_No,
                        dateOfApproval: item.apr_Approval_Date,
                        approvalOrder: approvalFileResponse[index]?.doctrN_DOCBASE64 || null,
                        approvalMap: approvalMapFileResponse[index]?.doctrN_DOCBASE64 || null,
                        approvalAuthority: item.apR_APPROVALDESIGNATION,
                    };
                });

                setRecords(formattedList);
            }
            stop_loader();

        } catch (error) {
            stop_loader();
            console.error("Error fetching approval list:", error);
        } finally {
            stop_loader();
        }
    }
    const fetchReleaseList = async (localLKRSID) => {
        start_loader();
        try {
            const listPayload = {
                level: 1,
                lkrsId: localLKRSID,
                siteRelsId: 0,
            };

            const listResponse = await listReleaseInfo(listPayload);
            console.table(listResponse);
            const listFileResponse = await fileListAPI(3, localLKRSID, 3, 0); //level, LKRSID, MdocID, docID

            if (Array.isArray(listResponse)) {
                const formattedList = listResponse.map((item, index) => ({
                    layoutReleaseNumber: item.sitE_RELS_ORDER_NO,
                    dateOfOrder: item.sitE_RELS_DATE,
                    orderReleaseFile: listFileResponse[index]?.doctrN_DOCBASE64 || null,
                    releaseAuthority: item.sitE_RELS_APPROVALDESIGNATION,
                    releaseType: item.sitE_RELS_SITE_RELSTYPE,
                }));
                setOrder_Records(formattedList);

            }
            stop_loader();
        } catch (error) {
            stop_loader();
            console.error("Error fetching approval list:", error);
        } finally {
            stop_loader();
        }
    }


    // ============================================Individual site details starts==============================
    const [allSites, setAllSites] = useState([]);
    const [layoutSiteCount, setLayoutSiteCount] = useState("");


    const totalSitesCount = Number(layoutSiteCount);

    const fetchSiteDetails = async (LKRS_ID) => {
        try {

            const listPayload = {
                level: 1,
                LkrsId: localLKRSID,
                SiteID: 0,
            };
            start_loader();
            const response = await individualSiteListAPI(listPayload);

            if (response.length >= 0) {
                setAllSites(response); //  Update state with API data


            } else {
                Swal.fire({
                    text: response.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Failed to insert data:", error);

        } finally {
            stop_loader();
        }
    }

    // =============================================OwnerEKYC details starts=====================================

    const [ownerDataList, setOwnerDataList] = useState([]);
    const owner_columns = [
        {
            name: 'Name',
            selector: row => row.owN_NAME_EN || 'N/A',
            sortable: true,
        },
        {
            name: 'Aadhar Number',
            selector: row => row.owN_AADHAARNUMBER || 'N/A',
        },
        {
            name: 'Aadhaar Verification Status',
            selector: row => row.owN_AADHAARVERISTATUS || 'N/A',
        },
        {
            name: 'Name match Status',
            selector: row => row.owN_IDNUMBER || 'N/A',
        },

        {
            name: 'EKYC status',
            selector: row => row.owN_IDNUMBER || 'N/A',
        },
    ];

    const [ownerEKYCDataList, setownerEKYCDataList] = useState([]);
    const owner_EKYCDetails = async (localLKRSID) => {
        try {
            const response = await ownerEKYC_Details("1", localLKRSID);
            setownerEKYCDataList(response); // assuming response is the array you shared
        } catch (error) {
            console.error("Failed to fetch EKYC owner details:", error);
        }
    }
    const JDA_EKYCDetails = async (localLKRSID) => {
        try {
            const response = await ownerEKYC_Details("1", localLKRSID);
            setOwnerDataList(response); // assuming response is the array you shared
        } catch (error) {
            console.error("Failed to fetch EKYC owner details:", error);
        }
    }



    //========================================EC Details Start======================
    
        const [jdaDocumentId, setJdaDocumentId] = useState('');
        const [jdaDocumentDate, setJdaDocumentDate] = useState('');
    const viewEC = async (ecNumber) => {
        try {
            start_loader();
            const payload = {
                finalRegNumber: ecNumber,
                lkrsid: localLKRSID,
            }
            const response = await fetchECDetails(payload);

            if (
                response.responseStatus === true &&
                response.base64 &&
                response.json
            ) {


                const pdfWindow = window.open();
                pdfWindow.document.write(
                    `<iframe width='100%' height='100%' src='data:application/pdf;base64,${response.base64}'></iframe>`
                );
                stop_loader();
            } else {
                stop_loader();
                Swal.fire({
                    text: response.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });

            }
        } catch (error) {
            stop_loader();
            console.error("Failed to insert data:", error);

        } finally {
            stop_loader();
        }
    }
    const [isRegistered, setIsRegistered] = useState(false);
    const [deedNumber, setDeedNumber] = useState("");
    const [deedNoURL, setDeedNoURL] = useState(null);


    const fetchJDAInfo = async (localLKRSID) => {
        try {
            start_loader();
            const response = await fetchJDA_details(1, parseInt(localLKRSID, 10), 0);

            if (response && Object.keys(response).length > 0) {

                setHasJDA(response[0].lkrS_IsJDAEXITS);
                setIsRegistered(response[0].jdA_ISREGISTERED);

                if (response[0].jdA_ISREGISTERED === true) {
                    setDeedNumber(response[0].jdA_DEED_NO);
                } else if (response[0].jdA_ISREGISTERED === false) {
                    
                    setJdaDocumentId(response[0].jdA_REGISTEREDDATE);
                    setJdaDocumentDate(response[0].jdA_DEED_NO);
                    const deedFileResponse = await fileListAPI(3, localLKRSID, 4, 0);
                    const base64String = deedFileResponse[0]?.doctrN_DOCBASE64;
                    if (base64String) {
                        const blob = base64ToBlob(base64String, 'application/pdf');
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            setDeedNoURL(url);
                        }
                    }
                }
            }
            stop_loader();
        } catch (error) {
            stop_loader();
            console.error("Failed to fetch LKRSID data:", error);
        }
    };
    const handleViewDeed = async () => {
        let newTab = window.open('', '_blank'); // Open early to avoid popup block

        if (!newTab) {
            Swal.fire({
                text: "Pop-up blocked. Please allow pop-ups to view the document.",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }

        try {
            start_loader();

            const payload = {
                finalRegNumber: deedNumber,
                lkrsid: localLKRSID,
            };

            const response = await fetchDeedDocDetails(payload);

            if (response.responseStatus === true && response.base64) {
                const binary = atob(response.base64.replace(/\s/g, ''));
                const len = binary.length;
                const buffer = new Uint8Array(len);

                for (let i = 0; i < len; i++) {
                    buffer[i] = binary.charCodeAt(i);
                }

                const blob = new Blob([buffer], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(blob);

                // Redirect the already opened tab to the blob URL
                newTab.location.href = pdfUrl;

                stop_loader();
            } else {
                stop_loader();
                newTab.close(); // Close the tab if the request fails
                Swal.fire({
                    text: response.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            stop_loader();
            newTab.close(); // Close tab on error
            console.error("Failed to fetch deed data:", error);

        } finally {
            stop_loader();
        }
    };
    const final_Save_Release = async () => {
        navigate('/release', {
            state: {
                LKRS_ID,
                display_LKRS_ID
            }
        });
    }

    return (
        <>
            {loading && <Loader />}
            <DashboardLayout>
                <button className='btn btn-block' onClick={fetch_details} ref={buttonRef} hidden>Click me</button>
                <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
                    <div className="my-3 my-md-5">
                        <div className="container mt-6">
                            <div className="card">
                                <div className="card-header layout_btn_color" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h5 className="card-title" style={{ margin: 0 }}>Submitted Application information</h5>
                                    <h5 style={{ color: '#fff' }}>KRSID : {display_LKRS_ID}</h5>
                                </div>

                                <div className="card-body">
                                    <div className='row'>
                                        <div className='col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10 mt-3'></div>
                                        <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-3'>
                                            <button className='btn btn-success btn-block' onClick={final_Save_Release}>Proceed to Release</button>
                                        </div>
                                    </div>


                                    <div style={{ padding: '20px' }}>
                                        {/* survey number preview block */}
                                        {selectedLandType === "surveyNo" && (
                                            <>
                                                {combinedData.length > 0 && (
                                                    <div className="col-12">
                                                        <div className="">
                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                <h4 className=" m-0">Added Survey No Details</h4>
                                                                <div className="d-flex align-items-center">
                                                                    <label className="me-2 mb-0">Rows per page:</label>
                                                                    <select
                                                                        className="form-select form-select-sm w-auto"
                                                                        value={rowsPerPage}
                                                                        onChange={handlePageSizeChange}
                                                                    >
                                                                        {[5, 10, 15, 20, 25, 30].map((size) => (
                                                                            <option key={size} value={size}>{size}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <div className="table-responsive custom-scroll-table">
                                                                <table className="table table-striped table-hover table-bordered rounded-table">
                                                                    <thead className="table-primary sticky-header">
                                                                        <tr>
                                                                            <th hidden>Action</th>
                                                                            <th>S.No</th>
                                                                            <th>District</th>
                                                                            <th>Taluk</th>
                                                                            <th>Hobli</th>
                                                                            <th>Village</th>
                                                                            <th>Owner Name</th>
                                                                            <th>Survey No / Surnoc / Hissa No</th>
                                                                            <th>Extent (Acre.Gunta.Fgunta)</th>
                                                                            <th>SqFt</th>
                                                                            <th>SqM</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {paginatedData.map((row, index) => (
                                                                            <tr key={index}>
                                                                                <td hidden>
                                                                                </td>
                                                                                <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                                                                                <td>{row.district}</td>
                                                                                <td>{row.taluk}</td>
                                                                                <td>{row.hobli}</td>
                                                                                <td>{row.village}</td>
                                                                                <td>{row.owner}</td>
                                                                                <td>{`${row.survey_no}/${row.surnoc}/${row.hissa_no}`}</td>
                                                                                <td>{`${row.ext_acre}.${row.ext_gunta}.${row.ext_fgunta}`}</td>
                                                                                <td>
                                                                                    {(
                                                                                        (parseFloat(row.ext_acre) * 43560) +
                                                                                        (parseFloat(row.ext_gunta) * 1089) +
                                                                                        (parseFloat(row.ext_fgunta) * 68.0625)
                                                                                    ).toFixed(2)}
                                                                                </td>
                                                                                <td>
                                                                                    {(
                                                                                        (
                                                                                            (parseFloat(row.ext_acre) * 43560) +
                                                                                            (parseFloat(row.ext_gunta) * 1089) +
                                                                                            (parseFloat(row.ext_fgunta) * 68.0625)
                                                                                        ) * 0.092903
                                                                                    ).toFixed(2)}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                    <tfoot >
                                                                        <tr>
                                                                            <th colSpan={5}></th>
                                                                            <th colSpan={2} className="text-end fw-bold">Total Area:</th>
                                                                            <th className="text-left fw-bold" >{`${totalAcre}.${totalGunta}.${totalFGunta}`}</th>
                                                                            <th className='fw-bold'>{totalSqFt.toFixed(2)}</th>
                                                                            <th className='fw-bold'>{totalSqFt.toFixed(2)}</th>
                                                                        </tr>
                                                                    </tfoot>
                                                                </table>
                                                            </div>

                                                            {/* Pagination Summary and Controls */}
                                                            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                                                                <div>
                                                                    Showing {Math.min((currentPage - 1) * rowsPerPage + 1, combinedData.length)}–{Math.min(currentPage * rowsPerPage, combinedData.length)} of {combinedData.length} records
                                                                </div>

                                                                <div>
                                                                    <button
                                                                        className="btn btn-outline-secondary btn-sm mx-1"
                                                                        onClick={() => goToPage(currentPage - 1)}
                                                                        disabled={currentPage === 1}
                                                                    >
                                                                        Previous
                                                                    </button>
                                                                    {[...Array(totalPages).keys()].map((num) => (
                                                                        <button
                                                                            key={num}
                                                                            className={`btn btn-sm mx-1 ${currentPage === num + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                                                                            onClick={() => goToPage(num + 1)}
                                                                        >
                                                                            {num + 1}
                                                                        </button>
                                                                    ))}
                                                                    <button
                                                                        className="btn btn-outline-secondary btn-sm mx-1"
                                                                        onClick={() => goToPage(currentPage + 1)}
                                                                        disabled={currentPage === totalPages}
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                )}
                                                <hr />
                                            </>
                                        )}
                                        {/* EPID preview block */}
                                        {(selectedLandType === "khata") && (
                                            <>
                                                {epidshowTable && epid_fetchedData && (
                                                    <div>
                                                        <h5>Property Owner details as per BBMP eKhata</h5>
                                                        <h6>Note: Plot-wise New Khata will be issued in owner's name. Hence, if owner has changed then first get Mutation done in eKhata.</h6>
                                                        {/* <h6>If there has been a change in ownership, the Mutation process in eKhata must be completed first, as the New Khata will be issued in the owner's name.</h6> */}
                                                        <DataTable
                                                            columns={columns}
                                                            data={epid_fetchedData?.OwnerDetails || []}
                                                            pagination
                                                            noHeader
                                                            dense={false}
                                                            customStyles={customStyles}
                                                        />

                                                    </div>
                                                )}
                                                <hr />
                                            </>
                                        )}

                                        {records.length > 0 && (
                                            <div className="mt-4">
                                                <h4>Layout Approval order</h4>
                                                <DataTable
                                                    columns={approval_columns}
                                                    data={records}
                                                    customStyles={customStyles}
                                                    pagination
                                                    highlightOnHover
                                                    striped
                                                />
                                                <hr />
                                            </div>
                                        )}
                                        {order_records.length > 0 && (
                                            <div className="mt-4">
                                                <h4>{t('translation.BDA.table1.heading')}</h4>
                                                <DataTable
                                                    columns={order_columns}
                                                    data={order_records}
                                                    customStyles={customStyles}
                                                    pagination
                                                    highlightOnHover
                                                    striped
                                                />
                                            </div>
                                        )}
                                        {allSites.length > 0 && (
                                            <>
                                                <Preview_siteDetailsTable
                                                    data={allSites}
                                                    setData={setAllSites}
                                                    totalSitesCount={totalSitesCount}
                                                    LKRS_ID={localLKRSID}
                                                    createdBy={createdBy}
                                                    createdName={createdName}
                                                    roleID={roleID}
                                                />
                                                <hr />
                                            </>
                                        )}

                                        {/* EC Details */}
                                        {(ecNumber || typeof isJDA === 'boolean') && (
                                            <>
                                                <div style={{ marginTop: '20px' }}>
                                                    <h5>EC Details & JDA Details</h5>
                                                    <p className='mb-4'>Note : EC should be atleast 1 day before registered deed of property until 31-10-2024 or later. If sale / registered deed date is before 01-04-2004 then EC should be from 01-04-2004 to 31-10-2024 after</p>

                                                    <div className='row'>
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-3">
                                                            <div className="form-group mt-2">
                                                                <label className='form-label'>EC Number of Mother Property</label>
                                                                <input
                                                                    type="text"
                                                                    className='form-control'
                                                                    placeholder="Enter EC Number of Mother Property"
                                                                    value={ecNumber}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <div className="text-success">
                                                                <strong>EC Check successfully <i className="fa fa-check-circle"></i></strong>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-7">
                                                            <div className="form-group">
                                                                <button className="btn btn-warning btn-block" onClick={() => viewEC(ecNumber)}>
                                                                    View EC
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <hr />
                                                        <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <label className="form-check-label fw-bold">Is there a Joint Development Agreement?</label>
                                                                <div className="form-check">
                                                                    <label className="form-check-label">
                                                                        <input
                                                                            className="form-check-input radioStyle"
                                                                            type="radio"
                                                                            name="hasJDA"
                                                                            value="yes"
                                                                            checked={hasJDA === true}
                                                                            onChange={() => setHasJDA(true)}
                                                                            disabled
                                                                        />
                                                                        Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <label className="form-check-label">
                                                                        <input className="form-check-input radioStyle"
                                                                            type="radio"
                                                                            name="hasJDA"
                                                                            value="no"
                                                                            checked={hasJDA === false}
                                                                            onChange={() => setHasJDA(false)}
                                                                            disabled
                                                                        />
                                                                        No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {hasJDA === true && (
                                                            <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                                                                <div className="d-flex align-items-center gap-3 ">
                                                                    <label className="form-check-label fw-bold">Is Joint Development Agreement Registered?</label>
                                                                    <div className="form-check">
                                                                        <label className="form-check-label">
                                                                            <input
                                                                                className="form-check-input radioStyle"
                                                                                type="radio"
                                                                                name="isRegistered"
                                                                                value="yes"
                                                                                checked={isRegistered === true}
                                                                                onChange={() => setIsRegistered(true)}
                                                                                disabled
                                                                            />
                                                                            Yes</label>
                                                                    </div>
                                                                    <div className="form-check">
                                                                        <label className="form-check-label">
                                                                            <input
                                                                                className="form-check-input radioStyle"
                                                                                type="radio"
                                                                                name="isRegistered"
                                                                                value="yes"
                                                                                checked={isRegistered === false}
                                                                                onChange={() => setIsRegistered(false)}
                                                                                disabled
                                                                            />
                                                                            No</label>
                                                                    </div>
                                                                </div></div>
                                                        )}
                                                        {isRegistered === true && (
                                                            <>
                                                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6" >
                                                                    <label className='form-label'>Enter JDA registered Deed Number <span className='mandatory_color'>*</span></label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Enter your Deed Number"
                                                                        value={deedNumber}
                                                                        maxLength={50} readOnly
                                                                    />
                                                                    <div className="text-success">
                                                                        <strong>Deed Check successfully <i className="fa fa-check-circle"></i></strong>
                                                                    </div>
                                                                </div>
                                                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-5">
                                                                    <div className="form-group">
                                                                        <button className="btn btn-warning btn-block" onClick={handleViewDeed}>
                                                                            View Deed
                                                                        </button>
                                                                    </div>

                                                                </div>
                                                            </>
                                                        )}
                                                        {isRegistered === false && (
                                                            <>
                                                                {deedNoURL && (
                                                                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                                        <div style={{ marginTop: '10px' }}>
                                                                            <label className='form-check-label fw-bold'>Uploaded the JDA Document</label> &nbsp;
                                                                            <span
                                                                                onClick={() => window.open(deedNoURL, '_blank')}
                                                                                style={{
                                                                                    cursor: 'pointer',
                                                                                    color: '#007bff',
                                                                                    textDecoration: 'none',
                                                                                    fontSize: '0.875rem',
                                                                                    userSelect: 'none',
                                                                                }}
                                                                                role="button"
                                                                                tabIndex={0}
                                                                                onKeyPress={(e) => { if (e.key === 'Enter') window.open(deedNoURL, '_blank'); }}
                                                                            >
                                                                                View file
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                                    <label className='form-label'>Enter JDA Document ID <span className='mandatory_color'>*</span></label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Enter your JDA Document ID"
                                                                        value={jdaDocumentId}
                                                                        maxLength={15}
                                                                        readOnly
                                                                    />
                                                                </div>

                                                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                                    <label className='form-label'>Enter JDA Document Date <span className='mandatory_color'>*</span></label>
                                                                    <input
                                                                        type="date"
                                                                        className="form-control"
                                                                        value={jdaDocumentDate}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                            </>
                                                        )}

                                                    </div>



                                                </div>
                                                <hr />
                                            </>
                                        )}
                                        {/* Owner EKYC */}
                                        {ownerDataList.filter(owner => owner.owN_AADHAARVERISTATUS === "Success")
                                            .map((owner, index) => {
                                                let parsedAadhaar = {};
                                                try {
                                                    parsedAadhaar = JSON.parse(owner.owN_AADHAAR_RESPONSE).ekycResponse || {};
                                                } catch (err) {
                                                    console.warn("Invalid Aadhaar JSON for owner:", owner.owN_NAME_EN);
                                                }

                                                return (
                                                    <div className='col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12'>
                                                        <h5>Owner / Owner Representative EKYC Details</h5>
                                                        <table className="table table-striped table-bordered table-hover shadow" style={{ fontFamily: 'Arial, sans-serif' }}>
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th>ಫೋಟೋ / Photo</th>
                                                                    <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಹೆಸರು / EKYC Verified Aadhar Name</th>
                                                                    <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಸಂಖ್ಯೆ / EKYC Verified Aadhar Number</th>
                                                                    <th>ಲಿಂಗ / Gender</th>
                                                                    <th>ಹುಟ್ಟಿದ ದಿನಾಂಕ / DOB</th>
                                                                    <th>ವಿಳಾಸ / Address</th>
                                                                    <th>ಇಕೆವೈಸಿ ಸ್ಥಿತಿ / EKYC Status</th>
                                                                    <th>ಹೆಸರು ಹೊಂದಾಣಿಕೆಯ ಸ್ಥಿತಿ / Name Match Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr key={index}>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <img src={usericon} alt="Owner" width="50" height="50" />
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>{parsedAadhaar.ownerNameEng || 'N/A'}</td>
                                                                    <td style={{ textAlign: 'center' }}>{parsedAadhaar.maskedAadhaar || 'N/A'}</td>
                                                                    <td style={{ textAlign: 'center' }}>{parsedAadhaar.gender || 'N/A'}</td>
                                                                    <td style={{ textAlign: 'center' }}>{parsedAadhaar.dateOfBirth || 'N/A'}</td>
                                                                    <td style={{ textAlign: 'center' }}>{parsedAadhaar.addressEng || 'N/A'}</td>
                                                                    <td style={{ textAlign: 'center' }}>Verified</td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {owner.owN_NAMEMATCHSCORE > 80 ? 'Matched' : 'Not Matched'}
                                                                    </td>
                                                                </tr>
                                                            </tbody>

                                                        </table>
                                                    </div>
                                                );
                                            })
                                        }

                                        {/* JDA EKYC */}
                                        {ownerDataList
                                            .filter(owner => owner.owN_AADHAARVERISTATUS === "Success")
                                            .map((owner, index) => {
                                                let parsedAadhaar = {};
                                                try {
                                                    parsedAadhaar = JSON.parse(owner.owN_AADHAAR_RESPONSE).ekycResponse || {};
                                                } catch (err) {
                                                    console.warn("Invalid Aadhaar JSON for owner:", owner.owN_NAME_EN);
                                                }

                                                return (
                                                    <div className='col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12'>
                                                        <h5>JDA / JDA Representative EKYC Details</h5>
                                                        <table className="table table-striped table-bordered table-hover shadow" style={{ fontFamily: 'Arial, sans-serif' }}>
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th>ಫೋಟೋ / Photo</th>
                                                                    <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಹೆಸರು / EKYC Verified Aadhar Name</th>
                                                                    <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಸಂಖ್ಯೆ / EKYC Verified Aadhar Number</th>
                                                                    <th>ಲಿಂಗ / Gender</th>
                                                                    <th>ಹುಟ್ಟಿದ ದಿನಾಂಕ / DOB</th>
                                                                    <th>ವಿಳಾಸ / Address</th>
                                                                    <th>ಇಕೆವೈಸಿ ಸ್ಥಿತಿ / EKYC Status</th>
                                                                    <th>ಹೆಸರು ಹೊಂದಾಣಿಕೆಯ ಸ್ಥಿತಿ / Name Match Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr key={index}>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <img src={usericon} alt="Owner" width="50" height="50" />
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>{parsedAadhaar.ownerNameEng || 'N/A'}</td>
                                                                    <td style={{ textAlign: 'center' }}>{parsedAadhaar.maskedAadhaar || 'N/A'}</td>
                                                                    <td style={{ textAlign: 'center' }}>{parsedAadhaar.gender || 'N/A'}</td>
                                                                    <td style={{ textAlign: 'center' }}>{parsedAadhaar.dateOfBirth || 'N/A'}</td>
                                                                    <td style={{ textAlign: 'center' }}>{parsedAadhaar.addressEng || 'N/A'}</td>
                                                                    <td style={{ textAlign: 'center' }}>Verified</td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {owner.owN_NAMEMATCHSCORE > 80 ? 'Matched' : 'Not Matched'}
                                                                    </td>
                                                                </tr>
                                                            </tbody>

                                                        </table>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
const Preview_siteDetailsTable = ({ data, setData, totalSitesCount, }) => {

    useEffect(() => {
    }, [data]);

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const totalAddedSites = data.length;

    const columns = React.useMemo(
        () => [

            {
                Header: "S.No",
                id: "serialNo",
                accessor: (row, index) => index + 1,
            },
            {
                Header: "Shape",
                accessor: (row) => {
                    return `${row.sitE_SHAPETYPE} `;
                },
            },
            {
                Header: "Site Number",
                accessor: (row) => {
                    return `${row.sitE_NO}`;
                },
            },
            {
                Header: "Block/Area",
                accessor: (row) => {
                    return `${row.sitE_AREA}`;
                },
            },
            {
                Header: "Number of sides",
                accessor: (row) => {
                    return `${row.sitE_NO_OF_SIDES}`;
                },
            },
            {
                Header: "Dimension",
                accessor: (row) => {

                    if (row.sitE_SHAPETYPE === "Regular") {
                        // Extract arrays for each property
                        const feetSides = row.siteDimensions.map(dim => dim.sitediM_SIDEINFT);
                        const meterSides = row.siteDimensions.map(dim => dim.sitediM_SIDEINMT);
                        const roadFacingStatuses = row.siteDimensions.map(dim => dim.sitediM_ROADFACING ? "yes" : "no");

                        return (
                            <>
                                {feetSides.join(" x ")} (ft)<br />
                                {meterSides.join(" x ")} (mtr)<br />
                                <b>Road Facing:</b> {roadFacingStatuses.join(", ")}
                            </>
                        );
                    } else if (row.sitE_SHAPETYPE === "Irregular" && Array.isArray(row.siteDimensions)) {
                        const feetString = row.siteDimensions.map(side => side.sitediM_SIDEINFT).join(' x ');
                        const meterString = row.siteDimensions.map(side => side.sitediM_SIDEINMT).join(' x ');
                        const roadFacingString = row.siteDimensions.map(side => side.sitediM_ROADFACING ? "Yes" : "No").join(', ');

                        return (
                            <div>
                                <div>{feetString} (ft)</div>
                                <div>{meterString} (m)</div>
                                <div><b>Road Facing:</b> {roadFacingString}</div>
                            </div>
                        );
                    }

                },
            },

            {
                Header: "Total Area",
                accessor: (row) => {
                    return `${row.sitE_AREAINSQFT} [Sq.ft], ${row.sitE_AREAINSQMT} [Sq.mtr]`;
                },
            },
            {
                Header: "Corner Site",
                accessor: (row) => {
                    return row.sitE_CORNERPLOT ? "YES" : "NO";
                },
            },
            {
                Header: "Type of Site",
                accessor: (row) => {
                    return `${row.sitE_TYPE}`;
                },
            },
            {
                id: "chakbandi",  // 👈 you must add this
                Header: (
                    <>
                        Chakbandi<br />
                        [East | West | North | South]
                    </>
                ),
                accessor: (row) => {
                    return `${row.sitE_EAST} | ${row.sitE_WEST} | ${row.sitE_NORTH} | ${row.sitE_SOUTH}`;
                },
            },
            {
                Header: "Latitude, Longitude",
                accessor: (row) => {
                    return `${row.sitE_LATITUDE}, ${row.sitE_LONGITUDE}`;
                },
            },
        ],
        []
    );
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 5 },
        },
        usePagination
    );
    const paginationBtnStyle = {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        backgroundColor: "#f3f4f6",
        color: "#1f2937",
        cursor: "pointer",
        transition: "background-color 0.2s",
        fontWeight: "500",
        margin: "0 2px",
    };
    const disabledBtnStyle = {
        ...paginationBtnStyle,
        backgroundColor: "#e5e7eb",
        cursor: "not-allowed",
        opacity: 0.6,
    };

    return (
        <div>
            {loading && <Loader />}
            <h4>Layout & Individual sites Details</h4>
            <div style={{ overflowX: "auto", padding: "1rem" }}>
                <table
                    {...getTableProps()}
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        minWidth: "1500px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                    }}
                >
                    <thead>
                        {headerGroups.map((headerGroup, idx) => (
                            <tr {...headerGroup.getHeaderGroupProps()} key={idx} style={{ backgroundColor: "#f9fafb" }}>
                                {headerGroup.headers.map((column, i) => (
                                    <th
                                        {...column.getHeaderProps()}
                                        key={i}
                                        colSpan={column.columns ? column.columns.length : 1}
                                        style={{
                                            border: "1px solid #e5e7eb",
                                            padding: "12px 16px",
                                            fontWeight: "600",
                                            textAlign: "center",
                                            backgroundColor: "#f3f4f6",
                                            color: "#374151",
                                        }}
                                    >
                                        {column.render("Header")}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {page.map((row, rowIndex) => {
                            prepareRow(row);
                            return (
                                <tr
                                    {...row.getRowProps()}
                                    key={rowIndex}
                                    style={{
                                        backgroundColor: rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
                                        transition: "background 0.3s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb")}
                                >
                                    {row.cells.map((cell, cellIndex) => (
                                        <td
                                            {...cell.getCellProps()}
                                            key={cellIndex}
                                            style={{
                                                border: "1px solid #e5e7eb",
                                                padding: "10px",
                                                textAlign: "center",
                                                color: "#374151",
                                            }}
                                        >
                                            {cell.render("Cell")}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div
                    style={{
                        marginTop: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                    }}
                >
                    <div>
                        Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>{" "}&nbsp;
                        (<strong>Total: {totalAddedSites} records</strong>)
                    </div>

                    <div style={{ display: "flex", gap: "5px" }}>
                        <button disabled={!canPreviousPage} onClick={() => gotoPage(0)} style={paginationBtnStyle}>{`<<`}</button>
                        <button disabled={!canPreviousPage} onClick={() => previousPage()} style={paginationBtnStyle}>{`<`}</button>
                        <button disabled={!canNextPage} onClick={() => nextPage()} style={paginationBtnStyle}>{`>`}</button>
                        <button disabled={!canNextPage} onClick={() => gotoPage(pageCount - 1)} style={paginationBtnStyle}>{`>>`}</button>
                    </div>

                    <div>
                        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}>
                            {[5, 10, 20, 50].map(size => (
                                <option key={size} value={size}>
                                    Show {size}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

};
export default BBMP_SubmittedInfo;