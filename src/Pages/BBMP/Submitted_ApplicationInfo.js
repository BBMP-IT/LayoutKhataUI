import React, { useEffect, useState, useRef, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import DashboardLayout, { LoaderContext } from '../../Layout/DashboardLayout';
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
    handleFetchDistricts, handleFetchTalukOptions, handleFetchHobliOptions, handleFetchVillageOptions, jdaEKYC_Details, dcConversionListAPI,
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
    // const { loading, start_loader, stop_loader } = useLoader();
    const { loading, start_loader, stop_loader } = useContext(LoaderContext);
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
            const id = sessionStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
        }
    }, [LKRS_ID]);
    const fetch_details = async () => {
        if (!localLKRSID) return;
        await handleGetLKRSID(localLKRSID);
        await fetch_DCConversion(localLKRSID);
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
    let totalAcre = 0;
    let totalGunta = 0;
    let totalFGunta = 0;
    let totalSqFt = 0;
    let totalSqM = 0;

    let totalAcre_LDA = 0;
    let totalGunta_LDA = 0;
    let totalFGunta_LDA = 0;
    let totalSqFt_LDA = 0;
    let totalSqM_LDA = 0;
    const [total_SqFt, setTotalSqFt] = useState(0); // Changed to number (0)
    const [total_SqM, setTotalSqM] = useState(0);



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
            ext_fgunta: item.suR_EXTFGUNTA || 0,
            lda_acre: item.suR_LDA_APR_EXTACRE || 0,
            lda_gunta: item.suR_LDA_APR_EXTGUNTA || 0,
            lda_fgunta: item.suR_LDA_APR_EXTFGUNTA || 0,

            // ✅ Add these new values
            lda_sqft: item.suR_LDA_APR_EXTINSQFT || 0,
            lda_sqm: item.suR_LDA_APR_EXTINSQMT || 0
        }));
    };
    const combinedData = [...rtcAddedData, ...rtcData];


    combinedData.forEach(row => {
        const acre = parseFloat(row.ext_acre || 0);
        const gunta = parseFloat(row.ext_gunta || 0);
        const fgunta = parseFloat(row.ext_fgunta || 0);

        const acre_LDA = parseFloat(row.lda_acre || 0);
        const gunta_LDA = parseFloat(row.lda_gunta || 0);
        const fgunta_LDA = parseFloat(row.lda_fgunta || 0);

        totalAcre += acre;
        totalGunta += gunta;
        totalFGunta += fgunta;

        totalAcre_LDA += acre_LDA;
        totalGunta_LDA += gunta_LDA;
        totalFGunta_LDA += fgunta_LDA;

        const sqft = (acre * 43560) + (gunta * 1089) + (fgunta * 68.0625);
        const sqft_LDA = (acre_LDA * 43560) + (gunta_LDA * 1089) + (fgunta_LDA * 68.0625);

        totalSqFt += sqft;
        totalSqM += sqft * 0.092903;

        totalSqFt_LDA += sqft_LDA;
        totalSqM_LDA += sqft_LDA * 0.092903;
    });

    // Normalize Non-LDA
    totalGunta += Math.floor(totalFGunta / 16);
    totalFGunta = totalFGunta % 16;
    totalAcre += Math.floor(totalGunta / 40);
    totalGunta = totalGunta % 40;

    // Normalize LDA
    totalGunta_LDA += Math.floor(totalFGunta_LDA / 16);
    totalFGunta_LDA = totalFGunta_LDA % 16;
    totalAcre_LDA += Math.floor(totalGunta_LDA / 40);
    totalGunta_LDA = totalGunta_LDA % 40;

    // ✅ Calculate overall total in FGunta
    const totalFG_Acre = totalAcre * 640 + totalGunta * 16 + totalFGunta;
    const totalFG_LDA = totalAcre_LDA * 640 + totalGunta_LDA * 16 + totalFGunta_LDA;
    const overallTotalFG = totalFG_Acre + totalFG_LDA;

    // ✅ Convert back to Acre.Gunta.FGunta format
    let overallAcre = Math.floor(overallTotalFG / 640);
    let remainingFG = overallTotalFG % 640;
    let overallGunta = Math.floor(remainingFG / 16);
    let overallFGunta = remainingFG % 16;

    const formattedOverall = `${overallAcre}.${overallGunta}.${overallFGunta}`;

    // Optional: Store for later use
    // setAreaSqft(totalSqFt_LDA);
    sessionStorage.setItem('areaSqft', totalSqFt_LDA);

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


    const [dcrecords, setDCRecords] = useState([]);
    //fetch DC conversion values
    const fetch_DCConversion = async (localLKRSID) => {
        try {
            start_loader();

            let dC_id = 0;
            const listResponse = await dcConversionListAPI(localLKRSID, dC_id);
            console.table(listResponse);
            const listFileResponse = await fileListAPI(3, localLKRSID, 5, 0); //level, LKRSID, MdocID, docID



            if (Array.isArray(listResponse)) {
                const formattedList = listResponse.map((item, index) => ({
                    layoutDCNumber: item.dC_Conversion_No,
                    dateOfOrder: item.dC_Conversion_Date,
                    DCFile: listFileResponse[index]?.doctrN_DOCBASE64 || null,
                    dc_id: item.dC_id,
                    DCconversionDocID: listFileResponse[index]?.doctrN_ID || null,

                }));
                setDCRecords(formattedList);
            }
            stop_loader();
        } catch (error) {
            stop_loader();
            console.error("Error fetching DC conversion list:", error);
        } finally {
            stop_loader();
        }
    }
    const dccolumns = [
        {
            name: 'S.no',
            cell: (row, index) => index + 1,
            width: '80px',
            center: true,
        },
        {
            name: "DC Conversion Number",
            selector: row => row.layoutDCNumber,
            sortable: true,
            center: true,
            with: '150px'
        },
        {
            name: 'DC Conersion Date',
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
            center: true,
            width: '200px',
        },
        // {
        //     name: `Uploaded DC Conversion File`,
        //     cell: row => {
        //         if (row.DCFile) {
        //             const blob = base64ToBlob(row.DCFile);

        //             if (blob) {
        //                 const fileUrl = URL.createObjectURL(blob);
        //                 return (
        //                     <a
        //                         href={fileUrl}
        //                         target="_blank"
        //                         rel="noopener noreferrer"
        //                         className="stableBlueLink"
        //                         onClick={() => {
        //                             setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
        //                         }}
        //                     >
        //                         View File
        //                     </a>
        //                 );
        //             } else {
        //                 return 'Invalid file';
        //             }
        //         } else {
        //             return 'No file';
        //         }
        //     },
        //     center: true,
        // },


    ];

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
            name: 'Owner Name',
            selector: row => row.ownerName || '-',
            sortable: true
        },
        {
            name: 'ID Type',
            selector: row => row.idType || '-',
            sortable: true
        },
        // {
        //     name: 'ID Number',
        //     selector: row => row.idNumber
        //         ? row.idNumber.replace(/\d(?=\d{4})/g, 'X')  // masks all digits except last 4
        //         : '-',
        //     sortable: true
        // },
        {
            name: 'Relation Type',
            selector: row => row.relationShipType || '-',
        },
        {
            name: 'Identifier Name',
            selector: row => row.identifierName || '-',
        },

        {
            name: 'Mobile Number',
            selector: row => row.mobileNumber || '-',
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
            const response = await fetch_LKRSID(localLKRSID);

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
            } else if (
                response &&
                response.khataDetails &&
                response.khataOwnerDetails &&
                response.khataOwnerDetails.length > 0
            ) {
                setSelectedLandType(response.lkrS_LANDTYPE); // Store the land type
                setECNumber(response.lkrS_ECNUMBER); // Set EC Number
                setHasJDA(response.lkrS_ISJDA === "1");
                setEPIDShowTable(true);

                let khataDetailsJson = {};
                if (response.khataDetails?.khatA_JSON) {
                    try {
                        const parsedJson = JSON.parse(response.khataDetails.khatA_JSON);
                        khataDetailsJson = parsedJson.response?.approvedPropertyDetails || {};
                    } catch (err) {
                        console.warn("Failed to parse khatA_JSON", err);
                    }
                }

                const ownerDetailsFromJson = khataDetailsJson.ownerDetails || [];

                const ownerDetailsFromApi =
                    response.khataOwnerDetails?.map((item) => {
                        let aadhaarResponse = {};
                        try {
                            aadhaarResponse = JSON.parse(item.owN_AADHAAR_RESPONSE || "{}")?.ekycResponse || {};
                        } catch (err) {
                            console.warn("Failed to parse owN_AADHAAR_RESPONSE", err);
                        }

                        return {
                            ownerName: item.owN_NAME_EN || "",
                            idType: item.owN_IDTYPE || "AADHAR",
                            idNumber: item.owN_IDNUMBER || item.owN_AADHAARNUMBER || "",
                            ownerAddress: aadhaarResponse.addressEng || "",
                            identifierName: aadhaarResponse.identifierNameEng || "",
                            gender: aadhaarResponse.gender || "",
                            mobileNumber: aadhaarResponse.mobileNumber || "",
                        };
                    }) || [];

                const combined = [...ownerDetailsFromJson, ...ownerDetailsFromApi];

                // Deduplicate based on ownerName + idNumber
                const uniqueOwnerMap = new Map();
                combined.forEach((owner) => {
                    const key = `${owner.ownerName}_${owner.idNumber}`;
                    if (!uniqueOwnerMap.has(key)) {
                        uniqueOwnerMap.set(key, owner);
                    }
                });

                const mergedOwnerDetails = Array.from(uniqueOwnerMap.values());

                setEPID_FetchedData({
                    PropertyID: response.lkrS_EPID || "",
                    PropertyCategory: khataDetailsJson.propertyCategory || "",
                    PropertyClassification: khataDetailsJson.propertyClassification || "",
                    WardNumber: khataDetailsJson.wardNumber || "",
                    WardName: khataDetailsJson.wardName || "",
                    StreetName: khataDetailsJson.streetName || "",
                    Streetcode: khataDetailsJson.streetcode || "",
                    SASApplicationNumber: khataDetailsJson.sasApplicationNumber || "",
                    IsMuation: khataDetailsJson.isMuation || "",
                    KaveriRegistrationNumber: khataDetailsJson.kaveriRegistrationNumber || [],
                    AssessmentNumber: khataDetailsJson.assessmentNumber || "",
                    courtStay: khataDetailsJson.courtStay || "",
                    enquiryDispute: khataDetailsJson.enquiryDispute || "",
                    CheckBandi: khataDetailsJson.checkBandi || {},
                    SiteDetails: khataDetailsJson.siteDetails || {},
                    OwnerDetails: mergedOwnerDetails,
                    rawResponse: response,
                });

                if (khataDetailsJson.siteDetails?.siteArea) {
                    setTotalSqFt(khataDetailsJson.siteDetails.siteArea);
                    sessionStorage.setItem("areaSqft", khataDetailsJson.siteDetails.siteArea);
                }
                else {
                    stop_loader();
                    Swal.fire({
                        text: "Something went wrong, please try again later!",
                        icon: "warning",
                        confirmButtonText: "OK",
                    });
                }
            }
            else {
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
        // {
        //     name: "Release Type",
        //     selector: row => row.releaseType,
        //     center: true,
        //     sortable: true,
        // },
    ];

    const approval_columns = [
        {
            name: t('translation.BDA.table.slno'),
            cell: (row, index) => index + 1,
            width: '80px',
            center: true,
        },
        {
            name: "Approval No",
            selector: row => row.layoutApprovalNumber,
            sortable: true,
            center: true,
            with: '150px'
        },
        {
            name: 'Date of Approval',
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
            center: true,
            width: '150px',
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
            center: true,
            width: '150px',
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
            center: true,
        },
        {
            name: 'Layout Approval Authority',
            selector: row => row.approvalAuthorityPlanning,
            sortable: true,
            minWidth: '220px', center: true,
        },
        {
            name: "Designation of Approval Authority",
            selector: row => row.approvalAuthority,
            sortable: true,
            minWidth: '280px', center: true,
        },
        {
            name: "Total No of sites",
            selector: row => row.totalNoOfSites,
            sortable: true,
            minWidth: '150px', center: true,
        },
        // {
        //     name: "Release Type",
        //     selector: row => row.releaseType,
        //     sortable: true,
        //     minWidth: '150px', center: true,
        // },
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
                        approvalAuthorityPlanning: item.apR_APPROVALAUTHORITY_Text,
                        releaseType: item.sitE_RELS_SITE_RELSTYPE,
                        totalNoOfSites: item.lkrS_NUMBEROFSITES,
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
                console.table("Site released", response);

                if (response.every(site => site.sitE_IS_SITE_RELEASED === true)) {
                    setShouldShowReleaseButton(false); // hide button
                } else {
                    setShouldShowReleaseButton(true); // show button
                }
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
    const [ownerNames, setOwnerNames] = useState('');
    const [ownerList, setOwnerList] = useState([]);
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
            const apiResponse = await ownerEKYC_Details("1", LKRS_ID);
            const owners = (apiResponse || []).map(owner => ({
                name: owner.owN_NAME_EN,
                id: owner.owN_ID,
                phoneNo: owner.owN_MOBILENUMBER,
            }));

            setOwnerList(owners);

            const ownerNameList = owners.map(o => o.name).join(', ');
            setOwnerNames(ownerNameList); //  Set comma-separated owner names
            setOwnerDataList(apiResponse);
        } catch (error) {
            setOwnerList([]);
            setOwnerNames(''); // fallback if API fails
        }
    }
    const JDA_EKYCDetails = async (localLKRSID) => {


        try {
            const apiResponse = await jdaEKYC_Details("1", localLKRSID);

            const owners = (apiResponse || []).filter(owner => owner.jdAekyc_ID !== 0);

            if (owners.length > 0) {
                console.table(owners);
                setownerEKYCDataList(owners);
            } else {
                setownerEKYCDataList([]);
            }
        } catch (error) {
            console.error("Error fetching owner data:", error);
            setownerEKYCDataList([]);
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
    const [shouldShowReleaseButton, setShouldShowReleaseButton] = useState(true);


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

                    setJdaDocumentId(response[0].jdA_DEED_NO);
                    const dateStr = response[0].jdA_REGISTEREDDATE?.split('T')[0];
                    setJdaDocumentDate(dateStr);
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
        navigate('/SiteRelease', {
            state: {
                LKRS_ID,
                display_LKRS_ID
            }
        });
    }
    const handleBackToDashboard = (e) => {
        e.preventDefault(); // Prevents the default anchor tag behavior
        navigate("/LayoutDashboard");
    };
    return (
        <>
            {/* {loading && <Loader />}
            <DashboardLayout>
                <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}> */}
            <div className="my-3 my-md-5">
                <button className='btn btn-block' onClick={fetch_details} ref={buttonRef} hidden>Click me</button>
                <div className="container mt-6">
                    <div className="card">
                        <div className="card-header layout_btn_color" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h5 className="card-title" style={{ margin: 0 }}>Submitted Application information</h5>
                            <h5 style={{ color: '#fff' }}>KRSID : {display_LKRS_ID}</h5>
                        </div>

                        <div className="card-body">
                            <Link
                                onClick={handleBackToDashboard}
                                style={{ textDecoration: 'none', color: '#006879', display: 'flex', alignItems: 'center' }}
                            >
                                <i className='fa fa-arrow-left' style={{ marginRight: '8px' }}></i>
                                Back to Dashboard
                            </Link>
                            <div className='row'>
                                <div className='col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10 mt-3'></div>
                                {shouldShowReleaseButton && (
                                    <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-3'>
                                        <button className='btn btn-success btn-block' onClick={final_Save_Release}>
                                            Proceed to Release
                                        </button>
                                    </div>
                                )}
                            </div>


                            <div style={{ padding: '20px' }}>
                                {/* survey number preview block */}
                                {selectedLandType === "surveyNo" && (
                                    <>
                                        {combinedData.length > 0 && (
                                            <div className="col-12">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h4 className=" m-0">Added Survey Number Details</h4>
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
                                                                <th>S.No</th>
                                                                <th>District</th>
                                                                <th>Taluk</th>
                                                                <th>Hobli</th>
                                                                <th>Village</th>
                                                                <th>Owner Name</th>
                                                                <th>Survey Number / Surnoc / Hissa Number</th>
                                                                <th>Bhoomi Extent (Acre.Gunta.Fgunta)</th>
                                                                <th>LDA Extent (Acre.Gunta.Fgunta)</th>
                                                                <th>LDA Total Area in SqFt</th>
                                                                <th>LDA Total Area in SqM</th>
                                                                <th>Bhoomi Total Area in SqFt</th>
                                                                <th>Bhoomi Total Area in SqM</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {paginatedData.map((row, index) => (



                                                                <tr key={index}>

                                                                    <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                                                                    <td>{row.district}</td>
                                                                    <td>{row.taluk}</td>
                                                                    <td>{row.hobli}</td>
                                                                    <td>{row.village}</td>
                                                                    <td>{row.owner}</td>
                                                                    <td>{`${row.survey_no}/${row.surnoc}/${row.hissa_no}`}</td>
                                                                    {/* Bhoomi extent */}
                                                                    <td>{`${row.ext_acre}.${row.ext_gunta}.${row.ext_fgunta}`}</td>
                                                                    {/* LDA extent */}
                                                                    <td>{`${row.lda_acre ?? ''}.${row.lda_gunta ?? ''}.${row.lda_fgunta ?? ''}`}</td>
                                                                    {/* LDA extent total area */}
                                                                    <td>
                                                                        {Math.floor(
                                                                            (parseFloat(row.lda_acre) * 43560) +
                                                                            (parseFloat(row.lda_gunta) * 1089) +
                                                                            (parseFloat(row.lda_fgunta) * 68.0625)
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {(
                                                                            (
                                                                                (parseFloat(row.lda_acre) * 43560) +
                                                                                (parseFloat(row.lda_gunta) * 1089) +
                                                                                (parseFloat(row.lda_fgunta) * 68.0625)
                                                                            ) * 0.092903
                                                                        ).toFixed(1)}
                                                                    </td>
                                                                    {/* Bhommi extent total area */}
                                                                    <td>
                                                                        {Math.floor(
                                                                            (parseFloat(row.ext_acre) * 43560) +
                                                                            (parseFloat(row.ext_gunta) * 1089) +
                                                                            (parseFloat(row.ext_fgunta) * 68.0625)
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {(
                                                                            (
                                                                                (parseFloat(row.ext_acre) * 43560) +
                                                                                (parseFloat(row.ext_gunta) * 1089) +
                                                                                (parseFloat(row.ext_fgunta) * 68.0625)
                                                                            ) * 0.092903
                                                                        ).toFixed(1)}
                                                                    </td>


                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr>
                                                                <th colSpan={5}></th>
                                                                <th colSpan={2} className="text-end fw-bold">Total Area:</th>
                                                                <th className="text-left fw-bold">{`${totalAcre}.${totalGunta}.${totalFGunta}`}</th>
                                                                <th className="text-left fw-bold">{`${totalAcre_LDA}.${totalGunta_LDA}.${totalFGunta_LDA}`}</th>
                                                                <th className='fw-bold' style={{ backgroundColor: 'orange', color: '#fff' }}>
                                                                    {Math.floor(totalSqFt_LDA)}
                                                                </th>
                                                                <th className='fw-bold' style={{ backgroundColor: 'orange', color: '#fff' }}>
                                                                    {totalSqM_LDA.toFixed(1)}
                                                                </th>
                                                                <th className='fw-bold'>{Math.floor(totalSqFt)}</th>
                                                                <th className='fw-bold'>{totalSqM.toFixed(1)}</th>
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
                                                <br />

                                            </div>
                                        )}
                                        <hr />
                                        {dcrecords.length > 0 && (
                                            <div className="mt-4">
                                                <h4>DC Conversion Details</h4>
                                                <DataTable
                                                    columns={dccolumns}
                                                    data={dcrecords}
                                                    customStyles={customStyles}
                                                    pagination
                                                    highlightOnHover
                                                    striped
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                                {/* EPID preview block */}
                                {(selectedLandType === "khata") && (
                                    <>
                                        {epidshowTable && epid_fetchedData && (
                                            <div>
                                                <h5>Property Owner details as per BBMP eKhata</h5>
                                                <h6>Note: Plot-wise New Khata will be issued in owner's name. Hence, if owner has changed then first get Mutation done in eKhata.</h6>

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

                                        {epid_fetchedData && (
                                            <>
                                                <style>{`
      /* Wrapper for horizontal scroll on small screens */
      .table-responsive-wrapper { /* Renamed to avoid conflict if parent also uses table-responsive */
      width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin-bottom: 20px;
        border: 2px solid lightgray; /* stronger outer border */
        padding: 20px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        font-family: Arial, sans-serif;
        min-width: 600px; /* ensures horizontal scroll on small screens */
      }
      th, td {
        border: 1.5px solid lightblue; /* distinct cell borders */
        padding: 8px;
        text-align: left;
      }
      th {
        font-weight: bold;
        color: #000;
        background-color: lightblue;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      tr:hover {
        background-color: #f1f1f1;
      }
      h3, h4 {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      .header-with-button {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px; /* Space between heading/button and table */
      }
    `}</style>
                                                <div className="table-responsive-wrapper">
                                                    <div className="header-with-button">
                                                        <h4>Property Details</h4>
                                                        {/* <button className='btn btn-warning' onClick={showImplementationAlert}>View eKhata</button> */}
                                                    </div>

                                                    {/* Property Details */}
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Property ID</th>
                                                                <th>Category</th>
                                                                <th>Classification</th>
                                                                <th>Ward Number</th>
                                                                <th>Ward Name</th>
                                                                <th>Street Name</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{epid_fetchedData.PropertyID}</td>
                                                                <td>{epid_fetchedData.PropertyCategory}</td>
                                                                <td>{epid_fetchedData.PropertyClassification}</td>
                                                                <td>{epid_fetchedData.WardNumber}</td>
                                                                <td>{epid_fetchedData.WardName?.trim()}</td>
                                                                <td>{epid_fetchedData.StreetName?.trim()}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Kaveri Registration Numbers */}
                                                    {epid_fetchedData.KaveriRegistrationNumber?.length > 0 && (
                                                        <>
                                                            <h4>Kaveri Registration Numbers</h4>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Registration Number</th>
                                                                        <th>EC Number</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {epid_fetchedData.KaveriRegistrationNumber.map((item, idx) => (
                                                                        <tr key={idx}>
                                                                            <td>{item.kaveriRegistrationNumber}</td>
                                                                            <td>{item.kaveriECNumber}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </>
                                                    )}

                                                    {/* More Property Info */}
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Street Code</th>
                                                                <th>SAS Application No</th>
                                                                <th>Is Mutation</th>
                                                                <th>Assessment No</th>
                                                                <th>Court Stay</th>
                                                                <th>Enquiry Dispute</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{epid_fetchedData.Streetcode}</td>
                                                                <td>{epid_fetchedData.SASApplicationNumber}</td>
                                                                <td>{epid_fetchedData.IsMuation}</td>
                                                                <td>{epid_fetchedData.AssessmentNumber}</td>
                                                                <td>{epid_fetchedData.courtStay}</td>
                                                                <td>{epid_fetchedData.enquiryDispute}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Check Bandi */}
                                                    <h4>Check Bandi</h4>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>North</th>
                                                                <th>South</th>
                                                                <th>East</th>
                                                                <th>West</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{epid_fetchedData.CheckBandi?.north}</td>
                                                                <td>{epid_fetchedData.CheckBandi?.south}</td>
                                                                <td>{epid_fetchedData.CheckBandi?.east}</td>
                                                                <td>{epid_fetchedData.CheckBandi?.west}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Site Details */}
                                                    <h4>Site Details</h4>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Site Area (sq ft)</th>
                                                                <th>East-West Dimension</th>
                                                                <th>North-South Dimension</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{epid_fetchedData.SiteDetails?.siteArea}</td>
                                                                <td>{epid_fetchedData.SiteDetails?.dimensions?.eastWest || '-'}</td>
                                                                <td>{epid_fetchedData.SiteDetails?.dimensions?.northSouth || '-'}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Owner Details */}
                                                    <h4>Owner Details</h4>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Owner Name</th>
                                                                <th>ID Type</th>
                                                                <th>ID Number</th>
                                                                <th>Address</th>
                                                                <th>Identifier Name</th>
                                                                <th>Gender</th>
                                                                <th>Mobile Number</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {epid_fetchedData.OwnerDetails?.map((owner, index) => (
                                                                <tr key={index}>
                                                                    <td>{owner.ownerName}</td>
                                                                    <td>{owner.idType}</td>
                                                                    <td>{owner.idNumber}</td>
                                                                    <td>{owner.ownerAddress}</td>
                                                                    <td>{owner.identifierName}</td>
                                                                    <td>{owner.gender}</td>
                                                                    <td>{owner.mobileNumber}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
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
                                                {hasJDA === true && isRegistered === true && (
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
                                                {hasJDA === true && isRegistered === false && (
                                                    <>

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
                                                    </>
                                                )}
                                                {hasJDA === false && (
                                                    <></>
                                                )}
                                            </div>



                                        </div>
                                        <hr />
                                    </>
                                )}
                                {/* Owner EKYC */}
                                <div className='row'>
                                    <div className='col-12'>
                                        <h5>Owner / Owner Representative EKYC Details</h5>
                                        <table className="table table-striped table-bordered table-hover shadow" style={{ fontFamily: 'Arial, sans-serif' }}>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>ಫೋಟೋ / Photo</th>
                                                    <th>ಮಾಲೀಕರ ಹೆಸರು / Owner Name</th>
                                                    <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಹೆಸರು / EKYC Verified Aadhar Name</th>
                                                    <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಸಂಖ್ಯೆ / EKYC Verified Aadhar Number</th>
                                                    <th>ಲಿಂಗ / Gender</th>
                                                    <th>ಹುಟ್ಟಿದ ದಿನಾಂಕ / DOB</th>
                                                    <th>ವಿಳಾಸ / Address</th>
                                                    <th>ಇಕೆವೈಸಿ ಸ್ಥಿತಿ / EKYC Status</th>
                                                    {/* <th>ಹೆಸರು ಹೊಂದಾಣಿಕೆಯ ಸ್ಥಿತಿ / Name Match Status</th> */}
                                                </tr>
                                            </thead>
                                            <tbody>
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
                                                            <tr key={index}>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <img src={usericon} alt="Owner" width="50" height="50" />
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>{owner.owN_NAME_EN || 'N/A'}</td>
                                                                <td style={{ textAlign: 'center' }}>{parsedAadhaar.ownerNameEng || 'N/A'}</td>
                                                                <td style={{ textAlign: 'center' }}>{parsedAadhaar.maskedAadhaar || 'N/A'}</td>
                                                                <td style={{ textAlign: 'center' }}>{parsedAadhaar.gender || 'N/A'}</td>
                                                                <td style={{ textAlign: 'center' }}>{parsedAadhaar.dateOfBirth || 'N/A'}</td>
                                                                <td style={{ textAlign: 'center' }}>{parsedAadhaar.addressEng || 'N/A'}</td>
                                                                <td style={{ textAlign: 'center' }}>Verified</td>
                                                                {/* <td style={{ textAlign: 'center' }}>
                                                                    {owner.owN_NAMEMATCHSCORE > 80 ? 'Matched' : 'Not Matched'}
                                                                </td> */}
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* JDA EKYC */}



                                {ownerEKYCDataList.length > 0 && (
                                    <div className="col-12">
                                        <h5>JDA / JDA Representative EKYC Details</h5>
                                        <table className="table table-striped table-bordered table-hover shadow" style={{ fontFamily: 'Arial, sans-serif' }}>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>ಫೋಟೋ / Photo</th>
                                                    <th>ಜೆಡಿಎ ಹೆಸರು / JDA Name</th>
                                                    <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಹೆಸರು / EKYC Verified Aadhar Name</th>
                                                    <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಸಂಖ್ಯೆ / EKYC Verified Aadhar Number</th>
                                                    <th>ಲಿಂಗ / Gender</th> {/* New column */}
                                                    <th>ಹುಟ್ಟಿದ ದಿನಾಂಕ / DOB</th> {/* New column */}
                                                    <th>ವಿಳಾಸ / Address</th> {/* New column */}
                                                    <th>ಇಕೆವೈಸಿ ಸ್ಥಿತಿ / EKYC Status</th> {/* New column */}
                                                    <th>ಹೆಸರು ಹೊಂದಾಣಿಕೆಯ ಸ್ಥಿತಿ / Name Match Status</th> New column
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ownerEKYCDataList.map((owner, index) => {
                                                    let aadhaarResponse = {};
                                                    try {
                                                        aadhaarResponse = JSON.parse(owner.jdaekyC_AADHAAR_RESPONSE || '{}').ekycResponse || {};
                                                    } catch (e) {
                                                        console.error("Error parsing AADHAAR_RESPONSE:", e);
                                                    }

                                                    const nameMatchStatus = parseFloat(owner.jdAekyc_NameMatchScore) > 60 ? 'Name Match Successful' : 'Not Matched';
                                                    const ekycStatus = aadhaarResponse.maskedAadhaar ? 'Verified' : 'Not Verified'; // Assuming if maskedAadhaar exists, EKYC is complete

                                                    return (
                                                        <tr key={index}>
                                                            <td style={{ textAlign: 'center' }}><img src={usericon} alt="Owner" width="50" height="50" /></td>

                                                            <td style={{ textAlign: 'center' }}>{owner.jdAekyc_JDA_Name || 'N/A'}</td>
                                                            <td style={{ textAlign: 'center' }}>{aadhaarResponse.ownerNameEng || 'N/A'}</td>
                                                            <td style={{ textAlign: 'center' }}>{owner.jdAekyc_AadhaarNumber || 'N/A'}</td>
                                                            <td style={{ textAlign: 'center' }}>{aadhaarResponse.gender || 'N/A'}</td>
                                                            <td style={{ textAlign: 'center' }}>{aadhaarResponse.dateOfBirth || 'N/A'}</td>
                                                            <td style={{ textAlign: 'center' }}>{aadhaarResponse.addressEng || 'N/A'}</td>

                                                            {/*                                                
                                                <td style={{ textAlign: 'center' }}>
                                                    {aadhaarResponse.photoContent ? <img src={`data:image/jpeg;base64,${aadhaarResponse.photoContent}`} alt="Aadhaar Photo" style={{ width: '50px', height: '50px' }} /> : 'No Photo'}
                                                </td> */}



                                                            <td style={{ textAlign: 'center' }}>{ekycStatus}</td>
                                                            {/* <td style={{ textAlign: 'center' }}>{nameMatchStatus}</td> */}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* </div>
            </DashboardLayout> */}
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
                Header: "Is Released",
                accessor: (row) => {
                    return row.sitE_IS_SITE_RELEASED ? "YES" : "NO";
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
            initialState: { pageIndex: 0, pageSize: 10 },
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
            <h4>

            </h4>
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
                            {[10, 20, 50, 100, 500, 1000].map(size => (
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