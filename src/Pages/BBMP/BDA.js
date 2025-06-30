import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
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
    insertApprovalInfo, listApprovalInfo, deleteApprovalInfo, insertReleaseInfo, deleteReleaseInfo, listReleaseInfo, fileUploadAPI, fileListAPI, insertJDA_details, ownerEKYC_Details,
    ekyc_Details, ekyc_Response, ekyc_insertOwnerDetails, jdaEKYC_Details,
    individualSiteAPI, individualSiteListAPI, fetchECDetails, fetchDeedDocDetails, fetchDeedDetails, fetchJDA_details, deleteSiteInfo, fetch_LKRSID, update_Final_SaveAPI
} from '../../API/authService';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};

const BDA = ({ approval_details, setApprovalDetails, order_details, setOrderDetails, LKRS_ID, isRTCSectionSaved, isEPIDSectionSaved, setIsApprovalSectionSaved,
    setIsReleaseSectionSaved, setTotalNoofsites }) => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        layoutApprovalNumber: "",
        approvalOrder: null,
        approvalMap: null,
        dateOfApproval: "",
        approvalAuthority: "",
        layoutApprovalAuthority: "", // NEW
        totalSites: "",              // NEW
        releaseType: "",
    });
    const { loading, start_loader, stop_loader } = useLoader();
    const [errors, setErrors] = useState({});
    const [records, setRecords] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const fileApprovalOrderInputRef = useRef(null);
    const fileApprovalMapInputRef = useRef(null);
    //edit approval button disable
    const [isApprovalEditing, setisApprovalEditing] = useState(false);

    const [createdBy, setCreatedBy] = useState(null);
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');
    const [LKRSID, setLKRSID] = useState('');
    const buttonRef = useRef(null);
    const [localLKRSID, setLocalLKRSID] = useState(() => {
        return localStorage.getItem("LKRSID") || "";
    });
    useEffect(() => {
        const storedCreatedBy = localStorage.getItem('createdBy');
        const storedCreatedName = localStorage.getItem('createdName');
        const storedRoleID = localStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
            if (buttonRef.current) {
                buttonRef.current.click();
            }
        }

    }, [LKRS_ID, isRTCSectionSaved, isEPIDSectionSaved]);

    const loadData = async () => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        if (localLKRSID && (isRTCSectionSaved || isEPIDSectionSaved)) {
            delay(1000);
            fetchApprovalList(localLKRSID);

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

            if (Array.isArray(listResponse) && listResponse.length > 0) {


                const formattedList = listResponse.map((item, index) => {
                    const totalSites = listResponse.map(item => item.lkrS_NUMBEROFSITES);


                    localStorage.setItem('totalNoOfSites', JSON.stringify(totalSites));
                    setTotalNoofsites(totalSites);

                    return {
                        layoutApprovalNumber: item.apr_Approval_No,
                        dateOfApproval: item.apr_Approval_Date,
                        approvalOrder: approvalFileResponse[index]?.doctrN_DOCBASE64 || null,
                        approvalMap: approvalMapFileResponse[index]?.doctrN_DOCBASE64 || null,
                        approvalAuthority: item.apR_APPROVALDESIGNATION,
                        approvalAuthorityPlanning: item.apR_APPROVALAUTHORITY_Text,
                        releaseType: item.sitE_RELS_SITE_RELSTYPE,
                        totalNoOfSites: totalSites,
                        approvalID: item.apr_Id,
                        // Include these IDs for delete API
                        approvalOrderDocID: approvalFileResponse[index]?.doctrN_ID || null,
                        approvalOrderMdocID: approvalFileResponse[index]?.doctrN_MDOC_ID || null,
                        approvalMapDocID: approvalMapFileResponse[index]?.doctrN_ID || null,
                        approvalMapMdocID: approvalMapFileResponse[index]?.doctrN_MDOC_ID || null,
                    };
                });


                setIsEditing(false);
                setisApprovalEditing(true); // Disable edit button
                setRecords(formattedList); //  important
                setIsApprovalSectionSaved(true);
            } else {
                console.warn("Empty or invalid approval list");
                setRecords([]); // clear any stale data
            }
        } catch (error) {
            console.error("Error fetching approval list:", error);
        } finally {
            stop_loader();
        }
    };

    const fetchReleaseList = async (localLKRSID) => {
        start_loader();
        try {
            const listPayload = {
                level: 1,
                lkrsId: localLKRSID,
                siteRelsId: 0,
            };

            const listResponse = await listReleaseInfo(listPayload);
            const listFileResponse = await fileListAPI(3, localLKRSID, 3, 0); //level, LKRSID, MdocID, docID

            if (Array.isArray(listResponse) && listResponse.length > 0) {
                const formattedList = listResponse.map((item, index) => ({
                    layoutReleaseNumber: item.sitE_RELS_ORDER_NO,
                    dateOfOrder: item.sitE_RELS_DATE,
                    orderReleaseFile: listFileResponse[index]?.doctrN_DOCBASE64 || null,
                    releaseAuthority: item.sitE_RELS_APPROVALDESIGNATION,
                    releaseType: item.sitE_RELS_SITE_RELSTYPE,
                    releaseOrderDocID: listFileResponse[index]?.doctrN_ID || null,
                    releaseID: item.sitE_RELS_ID || null,
                }));

                setIsOrderEditing(true); // Disable edit button
                setIsOrder_EditingArea(false); // Disable editing mode
                setOrder_Records(formattedList);
                setIsReleaseSectionSaved(true);
            } else {
                console.warn("Empty or invalid approval list");
                setOrder_Records([]); // clear any stale data
            }
            stop_loader();
        } catch (error) {
            stop_loader();
            console.error("Error fetching approval list:", error);
        } finally {
            stop_loader();
        }
    }
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "totalSites") {
            if (!/^\d*$/.test(value)) return;
        }
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };
    const [approvalOrderURL, setApprovalOrderURL] = useState(null);
    const [approvalMapURL, setApprovalMapURL] = useState(null);
    const [releaseOrderURL, setReleaseOrderURL] = useState(null);

    // Clean up object URLs on unmount or when files change
    useEffect(() => {
        return () => {
            if (approvalOrderURL) URL.revokeObjectURL(approvalOrderURL);
            if (approvalMapURL) URL.revokeObjectURL(approvalMapURL);
            if (releaseOrderURL) URL.revokeObjectURL(releaseOrderURL);
        };
    }, [approvalOrderURL, approvalMapURL, releaseOrderURL]);

    const handleFileApprovalOrderChange = (e) => {
        if (!e || !e.target || !e.target.files) {
            console.error("Invalid event or no files found.");
            return;
        }

        const file = e.target.files[0];
        if (!file) {
            setFormData({ ...formData, approvalOrder: null });
            setApprovalOrderURL(null);
            setErrors({ ...errors, approvalOrder: "No file selected." });
            return;
        }

        if (file.type !== "application/pdf") {
            setErrors({ ...errors, approvalOrder: "Only PDF files are allowed." });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors({ ...errors, approvalOrder: "File size must be less than 5MB." });
            return;
        }

        // Revoke old URL
        if (approvalOrderURL) URL.revokeObjectURL(approvalOrderURL);

        setFormData({ ...formData, approvalOrder: file });
        setApprovalOrderURL(URL.createObjectURL(file));
        setErrors({ ...errors, approvalOrder: "" });
    };
    const handleFileApprovalMapChange = (e) => {
        if (!e || !e.target || !e.target.files) {
            console.error("Invalid event or no files found.");
            return;
        }

        const file = e.target.files[0];
        if (!file) {
            setFormData({ ...formData, approvalMap: null });
            setApprovalMapURL(null);
            setErrors({ ...errors, approvalMap: "No file selected." });
            return;
        }

        if (file.type !== "application/pdf") {
            setErrors({ ...errors, approvalMap: "Only PDF files are allowed." });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setErrors({ ...errors, approvalMap: "File size must be less than 10MB." });
            return;
        }

        // Revoke old URL
        if (approvalMapURL) URL.revokeObjectURL(approvalMapURL);

        setFormData({ ...formData, approvalMap: file });
        setApprovalMapURL(URL.createObjectURL(file));
        setErrors({ ...errors, approvalMap: "" });
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.layoutApprovalNumber.trim()) {
            newErrors.layoutApprovalNumber = "Layout Approval Number is required.";
        }
        if (!formData.approvalOrder) {
            newErrors.approvalOrder = "Please upload a valid PDF (max 5MB).";
        }
        if (!formData.approvalMap) {
            newErrors.approvalMap = "Please upload a valid PDF (max 10MB).";
        }
        if (!formData.dateOfApproval) {
            newErrors.dateOfApproval = "Date of approval is required.";
        } else if (new Date(formData.dateOfApproval) > new Date()) {
            newErrors.dateOfApproval = "Future dates are not allowed.";
        }
        if (!formData.layoutApprovalAuthority) {
            newErrors.layoutApprovalAuthority = "Layout approval authority is required.";
        }
        if (!formData.approvalAuthority.trim()) {
            newErrors.approvalAuthority = "Approval authority designation is required.";
        }
        if (!formData.totalSites.trim()) {
            newErrors.totalSites = "Total number of sites is required.";
        } else if (!/^\d+$/.test(formData.totalSites)) {
            newErrors.totalSites = "Total number of sites must be numeric.";
        }
        if (!formData.releaseType) {
            newErrors.releaseType = "Please select a Release Type.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    //edit button method
    const handleEditApproval = () => {
        setisApprovalEditing(false); // Disable edit button
        setIsEditing(true); // Enable editing mode for area
    }
    //Approval order delete info button
    const handleDeleteApproval = async (approvalID, approvalOrderDocID, approvalMapDocID) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    start_loader();

                    const deletePayload = {
                        level: 1,
                        lkrS_ID: localLKRSID,
                        apr_Id: approvalID,
                        apr_Remarks: "",
                        apr_AdditionalInfo: "",
                        apR_UPDATEDBY: createdBy,
                        apR_UPDATEDNAME: createdName,
                        apR_UPDATEDROLE: roleID,
                        apr_Order_DOCTRN_ID: approvalOrderDocID,
                        apr_Order_map_DOCTRN_ID: approvalMapDocID
                    };

                    const response = await deleteApprovalInfo(deletePayload);

                    if (response.responseStatus === true) {
                        Swal.fire(response.responseMessage,"", "success");
                        setTotalNoofsites(0);
                        localStorage.removeItem('totalNoOfSites');
                        
                        setisApprovalEditing(false);
                        setIsEditing(true);
                        fetchApprovalList(localLKRSID);
                        setIsApprovalSectionSaved(false);
                    } else {
                        Swal.fire("Error!", "Failed to delete. Please try again.", "error");
                    }
                } catch (error) {
                    console.error("Delete Error:", error);
                    Swal.fire("Error!", "Something went wrong.", "error");
                } finally {
                    stop_loader();
                }
            }
        });
    };
    //Approval  Order Save button
    const handleSave = async () => {
        if (!validateForm()) return;

        //First section save button condition
        if (!isRTCSectionSaved && !isEPIDSectionSaved) {
            Swal.fire("Please save the land details before proceeding with layout approval", "", "warning");
            return;
        }

        //  Proceed to next step here if any one is true
        const payload = {
            apR_ID: 0,
            apR_LKRS_ID: localLKRSID,
            apR_APPROVAL_NO: formData.layoutApprovalNumber,
            apR_APPROVAL_DATE: new Date(formData.dateOfApproval).toISOString(),
            apR_REMARKS: "",
            apR_ADDITIONALINFO: "",
            apR_CREATEDBY: createdBy,
            apR_CREATEDNAME: createdName,
            apR_CREATEDROLE: roleID,
            apR_APPROVALDESIGNATION: formData.approvalAuthority,
            lkrS_NUMBEROFSITES: formData.totalSites,
            apR_APPROVALAUTHORITY: formData.layoutApprovalAuthority,
            apR_SITE_RELSTYPE_ID: formData.releaseType,
        };

        try {
            start_loader();
            const response = await insertApprovalInfo(payload);

            if (response.responseStatus === true) {
                const approval_uploadSuccess = await file_UploadAPI(
                    1, // master document ID
                    formData.layoutApprovalNumber,
                    formData.approvalOrder,
                    formData.dateOfApproval,
                    response.apR_ID,
                    "Approval Order"
                );
                const approvalMap_uploadSuccess1 = await file_UploadAPI(
                    2, // master document ID 
                    formData.layoutApprovalNumber,
                    formData.approvalMap,
                    formData.dateOfApproval,
                    response.apR_ID,
                    "Approval Map"
                );

                if (approval_uploadSuccess === true && approvalMap_uploadSuccess1 === true) {
                    start_loader();
                    try {
                        const listPayload = {
                            level: 1,
                            aprLkrsId: localLKRSID,
                            aprId: 0,
                        };

                        const listResponse = await listApprovalInfo(listPayload);

                        const approvalFileResponse = await fileListAPI(3, localLKRSID, 1, 0); //level, LKRSID, MdocID, docID
                        const approvalMapFileResponse = await fileListAPI(3, localLKRSID, 2, 0); //level, LKRSID, MdocID, docID


                        if (Array.isArray(listResponse)) {

                            const formattedList = listResponse.map((item, index) => {
                                const totalSites = item.lkrS_NUMBEROFSITES;

                                setTotalNoofsites(totalSites);
                                localStorage.setItem('totalNoOfSites', totalSites);

                                return {
                                    layoutApprovalNumber: item.apr_Approval_No,
                                    dateOfApproval: item.apr_Approval_Date,
                                    approvalOrder: approvalFileResponse[index]?.doctrN_DOCBASE64 || null,
                                    approvalMap: approvalMapFileResponse[index]?.doctrN_DOCBASE64 || null,
                                    approvalAuthority: item.apR_APPROVALDESIGNATION,
                                    approvalAuthorityPlanning: item.apR_APPROVALAUTHORITY_Text,
                                    releaseType: item.sitE_RELS_SITE_RELSTYPE,
                                    totalNoOfSites: totalSites,
                                    approvalID: item.apr_Id,
                                    // Include these IDs for delete API
                                    approvalOrderDocID: approvalFileResponse[index]?.doctrN_ID || null,
                                    approvalOrderMdocID: approvalFileResponse[index]?.doctrN_MDOC_ID || null,
                                    approvalMapDocID: approvalMapFileResponse[index]?.doctrN_ID || null,
                                    approvalMapMdocID: approvalMapFileResponse[index]?.doctrN_MDOC_ID || null,
                                };
                            });



                            setIsApprovalSectionSaved(true);
                            setIsEditing(false);
                            // setisApprovalEditing(true); // Disable edit button
                            setRecords(formattedList);
                        }
                        stop_loader();

                    } catch (error) {
                        stop_loader();
                        console.error("Error fetching approval list:", error);
                    } finally {
                        stop_loader();
                    }


                    Swal.fire({
                        title: response.responseMessage,
                        icon: "success",
                        confirmButtonText: "OK",
                    }).then(async () => {
                        // Reset inputs and form
                        if (fileApprovalMapInputRef.current) fileApprovalMapInputRef.current.value = "";
                        if (fileApprovalOrderInputRef.current) fileApprovalOrderInputRef.current.value = "";

                        setFormData({
                            layoutApprovalAuthority: "",
                            totalSites: "",
                            releaseType: "",
                            layoutApprovalNumber: "",
                            approvalOrder: null,
                            approvalMap: null,
                            dateOfApproval: "",
                            approvalAuthority: "",
                            approvalAuthorityPlanning: "",
                        });

                        setErrors({});
                        setEditIndex(null);

                        // Fetch list and update table

                    });
                    stop_loader();
                }
                else {
                    stop_loader();
                    Swal.fire({
                        title: response.responseMessage,
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } else {
                stop_loader();
                Swal.fire({
                    title: "Error",
                    text: "Something went wrong. Please try again later!",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            stop_loader();
            console.error("Error saving approval info:", error);
        } finally {
            stop_loader();
        }
    };
    const handleEdit = (index) => {
        setEditIndex(index);
        const selectedRecord = records[index];

        setFormData({
            layoutApprovalNumber: selectedRecord.layoutApprovalNumber,
            approvalOrder: selectedRecord.approvalOrder,
            approvalMap: selectedRecord.approvalMap, // Keep file reference
            dateOfApproval: selectedRecord.dateOfApproval,
            approvalAuthority: selectedRecord.approvalAuthority,
        });
    };
    const handleDelete = (index) => {
        setRecords(records.filter((_, i) => i !== index));
    };
    const columns = [
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
        {
            name: "Release Type",
            selector: row => row.releaseType,
            sortable: true,
            minWidth: '150px', center: true,
        },
        {
            name: t('translation.BDA.table.action'),
            cell: (row, index) => (
                <div>
                    {/* <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(index)} disabled={!isEditing}
                    >
                        <i className="fa fa-pencil"></i>
                    </button> */}
                    <button
                        className="btn btn-danger btn-sm"
                        // onClick={() => handleDelete(index)}  
                        onClick={() =>
                            handleDeleteApproval(
                                row.approvalID,
                                row.approvalOrderDocID,
                                row.approvalMapDocID
                            )
                        }
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];
    const customStyles = {
        headCells: {
            style: {
                backgroundColor: '#f0f0f0', // Light grey background
                color: '#333',              // Dark grey text
                fontWeight: 'bold',         // Bold text
            },
        },
    };

    const [layoutSiteCount, setLayoutSiteCount] = useState("");
    const [layoutSiteCountError, setLayoutSiteCountError] = useState("");

    const handleLayoutSiteCountChange = (e) => {

        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" }); // Clear error on input
    };
    const [isEditing, setIsEditing] = useState(true); // Controls edit mode
    const [savedRecords, setSavedRecords] = useState([]); // Stores saved records
    const handleAddMore_again = () => {
        setIsEditing(true); // Enable editing mode
    };
    //Order of site Release
    const [release_formData, setRelease_FormData] = useState({
        layoutOrderNumber: "",
        release_Order: null,
        dateOfOrder: "",
        orderAuthority: "",
        releaseType: ''
    });
    const [release_errors, setRelease_Errors] = useState({});
    const [order_records, setOrder_Records] = useState([]);
    const [edit_OrderIndex, setEdit_OrderIndex] = useState(null);
    const fileReleaseOrderInputRef = useRef(null);
    const [isOrder_EditingArea, setIsOrder_EditingArea] = useState(true);
    const [savedOrder_Records, setSavedOrder_Records] = useState([]);

    //Edit button disable variable
    const [isOrderEditing, setIsOrderEditing] = useState(false);
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
            selector: row => row.releaseType, center: true,
            sortable: true,
        },
        {
            name: t('translation.BDA.table1.action'),
            center: true,
            cell: (row, index) => (
                <div>
                    {/* <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleOrderEdit(index)} disabled={!isOrder_Editing}
                    >
                        <i className="fa fa-pencil"></i>
                    </button> */}
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                            handleDeleteRelease(
                                row.releaseID,
                                row.releaseOrderDocID
                            )
                        }
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];
    const handleOrderEdit = (index) => {
        setEdit_OrderIndex(index);
        const selectedRecord = order_records[index];

        setRelease_FormData({
            layoutOrderNumber: selectedRecord.layoutOrderNumber,
            release_Order: selectedRecord.release_Order,
            dateOfOrder: selectedRecord.dateOfOrder,
            orderAuthority: selectedRecord.orderAuthority,
        });
    };
    const handleOrderDelete = (index) => {
        setOrder_Records(order_records.filter((_, i) => i !== index));
    };
    const handleOrderChange = (e) => {
        const { name, value } = e.target;
        setRelease_FormData({ ...release_formData, [name]: value });
        setRelease_Errors({ ...release_errors, [name]: "" }); // Clear error on input
    };
    const handleFilereleaseOrderChange = (e) => {
        if (!e || !e.target || !e.target.files) {
            console.error("Invalid event or no files found.");
            return;
        }

        const file = e.target.files[0];

        if (!file) {
            setRelease_FormData({ ...release_formData, release_Order: null });
            setReleaseOrderURL(null); // Clear preview
            setRelease_Errors({ ...release_errors, release_Order: "No file selected." });
            return;
        }

        if (file.type !== "application/pdf") {
            setRelease_Errors({ ...release_errors, release_Order: "Only PDF files are allowed." });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setRelease_Errors({ ...release_errors, release_Order: "File size must be less than 5MB." });
            return;
        }

        // Clear old preview URL
        if (releaseOrderURL) {
            URL.revokeObjectURL(releaseOrderURL);
        }

        setRelease_FormData({ ...release_formData, release_Order: file });
        setReleaseOrderURL(URL.createObjectURL(file)); // Set new preview
        setRelease_Errors({ ...release_errors, release_Order: "" });
    };
    const validateOrderForm = () => {
        let newErrors = {};

        if (!release_formData.layoutOrderNumber.trim()) {
            newErrors.layoutOrderNumber = "Layout Order of site release Number is required.";
        }

        if (!release_formData.release_Order) {
            newErrors.release_Order = "Please upload a valid PDF (max 5MB).";
        }

        if (!release_formData.dateOfOrder) {
            newErrors.dateOfOrder = "Date of approval is required.";
        } else if (new Date(release_formData.dateOfOrder) > new Date()) {
            newErrors.dateOfOrder = "Future dates are not allowed.";
        }

        if (!release_formData.orderAuthority.trim()) {
            newErrors.orderAuthority = "Approval authority designation is required.";
        }

        if (!release_formData.releaseType) {
            newErrors.releaseType = "Please select a Release Type.";
        }

        setRelease_Errors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleOrderSave = async () => {
        if (!validateOrderForm()) return;

        //First section save button condition
        if (!isRTCSectionSaved && !isEPIDSectionSaved) {
            Swal.fire("Please save the land details before proceeding with layout approval", "", "warning");
            return;
        }

        const payload = {
            sitE_RELS_ID: 0,
            sitE_RELS_LKRS_ID: localLKRSID,
            sitE_RELS_ORDER_NO: release_formData.layoutOrderNumber,
            sitE_RELS_DATE: release_formData.dateOfOrder,
            sitE_RELS_REMARKS: "",
            sitE_RELS_ADDITIONALINFO: "",
            sitE_RELS_CREATEDBY: createdBy,
            sitE_RELS_CREATEDNAME: createdName,
            sitE_RELS_CREATEDROLE: roleID,
            sitE_RELS_APPROVALDESIGNATION: release_formData.orderAuthority,
            sitE_RELS_SITE_RELSTYPE_ID: release_formData.releaseType,
        };

        try {
            start_loader();
            const response = await insertReleaseInfo(payload);

            if (response.responseStatus === true) {
                const uploadSuccess = await file_UploadAPI(
                    3,
                    release_formData.layoutOrderNumber,
                    release_formData.release_Order,
                    release_formData.dateOfOrder,
                    response.sitE_RELS_ID,
                    "Release Order"
                );

                if (uploadSuccess) {
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
                                releaseOrderDocID: listFileResponse[index]?.doctrN_ID || null,
                                releaseID: item.sitE_RELS_ID || null,
                            }));
                            setOrder_Records(formattedList);
                            setIsOrderEditing(true); // Disable edit button
                            setIsOrder_EditingArea(false); // Disable editing mode
                            setIsReleaseSectionSaved(true);
                        }
                        stop_loader();
                    } catch (error) {
                        stop_loader();
                        console.error("Error fetching approval list:", error);
                    } finally {
                        stop_loader();
                    }

                    Swal.fire({
                        title: response.responseMessage,
                        icon: "success",
                        confirmButtonText: "OK",
                    });

                    // Reset form
                    if (fileReleaseOrderInputRef.current) {
                        fileReleaseOrderInputRef.current.value = "";
                    }
                    setRelease_FormData({
                        layoutOrderNumber: "",
                        release_Order: null,
                        dateOfOrder: "",
                        orderAuthority: "",
                    });
                    setRelease_Errors({});
                } else {
                    stop_loader();
                    Swal.fire({
                        title: "Upload Error",
                        text: "Document upload failed. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } else {
                stop_loader();
                Swal.fire({
                    title: "Error",
                    text: "Something went wrong. Please try again later!",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            stop_loader();
            console.error("Error saving approval info:", error);
        } finally {
            stop_loader();
        }
    };
    const handleEditRelease = () => {
        setIsOrderEditing(false); // Disable edit button
        setIsOrder_EditingArea(true); // Enable editing mode for area
    };
    //file Upload API
    const file_UploadAPI = async (MstDocumentID, documentnumber, file, date, uniqueID, DocName) => {
        const formData = new FormData();

        try {
            start_loader();
            formData.append("DOCTRN_ID", 0);
            formData.append("DOCTRN_LKRS_ID", localLKRSID);
            formData.append("DOCTRN_MDOC_ID", MstDocumentID);
            formData.append("DOCTRN_REMARKS", "");
            formData.append("DOCTRN_ADDITIONALINFO", "");
            formData.append("DOCTRN_CREATEDBY", createdBy);
            formData.append("DOCTRN_CREATEDNAME", createdName);
            formData.append("DOCTRN_CREATEDROLE", roleID);
            formData.append("DocTrn_Document_No", documentnumber);
            formData.append("DocTrn_Document_Date", date);
            formData.append("DocTrn_UniqueIdentifier", uniqueID);
            formData.append("DOCTRN_DOCUMENTTYPE", DocName)
            formData.append("file", file);

            const listResponse = await fileUploadAPI(formData);

            stop_loader();

            // Assuming listResponse has a boolean flag
            return listResponse?.responseStatus === true;

        } catch (error) {
            stop_loader();
            console.error("Error Uploading file:", error);
            return false;
        } finally {
            stop_loader();
        }
    };
    const showImplementationAlert = () => {
        Swal.fire({
            title: 'Coming Soon!',
            text: 'Implementation is in progress.',
            icon: 'info',
            confirmButtonText: 'OK'
        });
    };
    //Release order delete info button
    const handleDeleteRelease = async (releaseID, releaseOrderDocID) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    start_loader();

                    const deletePayload = {
                        level: 1,
                        lkrS_ID: localLKRSID,
                        sitE_RELS_ID: releaseID,
                        sitE_RELS_REMARKS: "",
                        sitE_RELS_ADDITIONALINFO: "",
                        site_Rels_UpdatedBy: createdBy,
                        site_Rels_UpdatedName: createdName,
                        site_Rels_UpdatedRole: roleID,
                        sitE_RELS_DOCUMENT_ID: releaseOrderDocID
                    };

                    const response = await deleteReleaseInfo(deletePayload);

                    if (response.responseStatus === true) {
                        Swal.fire("Deleted!", response.responseMessage, "success");
                        setIsOrderEditing(false);
                        setIsOrder_EditingArea(true);
                        setIsReleaseSectionSaved(false);
                        fetchReleaseList(localLKRSID);
                    }
                    else {
                        Swal.fire("Error!", "Failed to delete. Please try again.", "error");
                    }
                } catch (error) {
                    console.error("Delete Error:", error);
                    Swal.fire("Error!", "Something went wrong.", "error");
                } finally {
                    stop_loader();
                }
            }
        });
    };

    return (
        <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
            {loading && <Loader />}
            <div className="card">
                <button className='btn btn-block' onClick={loadData} ref={buttonRef} hidden></button>
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>{t('translation.BDA.heading')}</h5>
                </div>
                <div className="card-body">
                    <h6 className='fw-normal fs-5 ' style={{ color: '#0077b6' }}>{t('translation.BDA.Subdivision.heading')}</h6>
                    <hr className='mt-1' style={{ border: '1px dashed #0077b6' }} />
                    <div className="mt-5">
                        <div className="row">
                            {/* Layout Approval Number */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        Approval Number <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder={t('translation.BDA.Subdivision.approvalNoPlaceholder')}
                                        name="layoutApprovalNumber"
                                        value={formData.layoutApprovalNumber}
                                        onChange={handleChange}
                                        disabled={!isEditing} // Disable when not editing
                                    />
                                    {errors.layoutApprovalNumber && (
                                        <small className="text-danger">{errors.layoutApprovalNumber}</small>
                                    )}
                                </div>
                            </div>
                            {/* Date of Approval */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision.dateOfApproval')} <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="dateOfApproval"
                                        value={formData.dateOfApproval}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        max={new Date().toISOString().split("T")[0]} // Restrict to today or earlier
                                    />
                                    {errors.dateOfApproval && (
                                        <small className="text-danger">{errors.dateOfApproval}</small>
                                    )}

                                </div>
                            </div>
                            {/* Scan & Upload Layout Approval order */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        Scan & Upload Layout Approval Order
                                        <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="form-control"
                                        onChange={handleFileApprovalOrderChange}
                                        ref={fileApprovalOrderInputRef}
                                        disabled={!isEditing}
                                    />
                                    {formData.approvalOrder && approvalOrderURL && (
                                        <div className="mt-2">
                                            <div
                                                className="iframe-container"
                                                style={{
                                                    border: "1px solid #ddd",
                                                    borderRadius: "5px",
                                                    overflow: "hidden",
                                                    padding: "0",
                                                    width: "120px",
                                                    height: "120px",
                                                }}
                                            >
                                                <iframe
                                                    src={approvalOrderURL}
                                                    width="100%"
                                                    height="100%"
                                                    title="Approval Order"
                                                    onClick={() =>
                                                        window.open(approvalOrderURL, "_blank")
                                                    }
                                                    style={{ cursor: "pointer", border: "none" }}
                                                />
                                            </div>
                                            <p className="mt-1" style={{ fontSize: "0.875rem" }}>
                                                Current File:{" "}
                                                <a
                                                    href={approvalOrderURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        textDecoration: "underline",
                                                        color: "#007bff",
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {formData.approvalOrder.name}
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                    <span className="note_color">
                                        {t("translation.BDA.Subdivision.fileSize&format")}
                                    </span>
                                    <br />
                                    {errors.approvalOrder && (
                                        <small className="text-danger">{errors.approvalOrder}</small>
                                    )}
                                </div>
                            </div>
                            {/* Upload Layout Approved Map */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t("translation.BDA.Subdivision.scanUploadMap")}{" "}
                                        <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="form-control"
                                        onChange={handleFileApprovalMapChange}
                                        ref={fileApprovalMapInputRef}
                                        disabled={!isEditing}
                                    />
                                    {formData.approvalMap && approvalMapURL && (
                                        <div className="mt-2">
                                            <div
                                                style={{
                                                    width: "120px",
                                                    height: "120px",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "8px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <iframe
                                                    src={approvalMapURL}
                                                    title="Approval Map"
                                                    width="100%"
                                                    height="100%"
                                                    style={{ cursor: "pointer", border: "none" }}
                                                    onClick={() =>
                                                        window.open(approvalMapURL, "_blank")
                                                    }
                                                />
                                            </div>
                                            <p className="mt-1" style={{ fontSize: "0.875rem" }}>
                                                Current File:{" "}
                                                <a
                                                    href={approvalMapURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        textDecoration: "underline",
                                                        color: "#007bff",
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {formData.approvalMap.name}
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                    <span className="note_color">
                                        {t("translation.BDA.Subdivision.fileSize&format10")}
                                    </span>
                                    <br />
                                    {errors.approvalMap && (
                                        <small className="text-danger">{errors.approvalMap}</small>
                                    )}
                                </div>
                            </div>
                            {/* Layout Approval Authority */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <label className="form-label">Layout Approval Authority <span className='mandatory_color'>*</span></label>
                                <div className="d-flex align-items-center gap-3">
                                    <select
                                        className="form-select"
                                        value={formData.layoutApprovalAuthority}
                                        onChange={(e) => setFormData({ ...formData, layoutApprovalAuthority: e.target.value })}
                                        disabled={!isEditing}
                                    >
                                        <option value="">Select Layout Approval Authority</option>
                                        <option value="1">BDA</option>
                                        <option value="2">BMICAPA </option>
                                        <option value="3">KIADB </option>
                                    </select>

                                </div>
                                {errors.layoutApprovalAuthority && (
                                    <small className="text-danger">{errors.layoutApprovalAuthority}</small>
                                )}
                            </div>
                            {/* Approval Authority */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision.designation')}
                                        <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t('translation.BDA.Subdivision.placeholderDesignation')}
                                        name="approvalAuthority"
                                        value={formData.approvalAuthority}
                                        onChange={handleChange}
                                        disabled={!isEditing} // Disable when not editing
                                    />
                                    {errors.approvalAuthority && (
                                        <small className="text-danger">{errors.approvalAuthority}</small>
                                    )}
                                </div>
                            </div>
                            {/* Total number of sites */}
                            <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                                <div className="form-group">
                                    <label className='form-label'>
                                        Total Number of Sites <span className='mandatory_color'>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="totalSites"
                                        placeholder="Enter Total number of sites"
                                        value={formData.totalSites}
                                        maxLength={15}
                                        onChange={handleChange}
                                        disabled={!isEditing}

                                    />
                                    {errors.totalSites && (
                                        <small className="text-danger">{errors.totalSites}</small>
                                    )}
                                </div>
                            </div>
                            {/* Release Type */}
                            <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                                <div className="form-group mt-2">
                                    <label className='form-label'>
                                        Release Type <span className='mandatory_color'>*</span>
                                    </label>
                                    <div className='row'>
                                        <div className='col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4'>
                                            <div className="form-check">
                                                <label className="form-check-label fw-bold">
                                                    <input
                                                        className="form-check-input me-2 radioStyle"
                                                        type="radio"
                                                        name="releaseType"
                                                        value="1"
                                                        checked={formData.releaseType === "1"}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, releaseType: e.target.value })
                                                        } disabled={!isEditing}
                                                    />
                                                    100%</label>
                                            </div>
                                        </div>
                                        <div className='col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4'>
                                            <div className="form-check">
                                                <label className="form-check-label fw-bold">
                                                    <input
                                                        className="form-check-input me-2 radioStyle"
                                                        type="radio"
                                                        name="releaseType"
                                                        value="2"
                                                        checked={formData.releaseType === "2"}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, releaseType: e.target.value })
                                                        } disabled={!isEditing}
                                                    />
                                                    60% * 40%</label>
                                            </div>
                                        </div>
                                        <div className='col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4'>
                                            <div className="form-check">
                                                <label className="form-check-label fw-bold">
                                                    <input
                                                        className="form-check-input me-2 radioStyle"
                                                        type="radio"
                                                        name="releaseType"
                                                        value="3"
                                                        checked={formData.releaseType === "3"}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, releaseType: e.target.value })
                                                        } disabled={!isEditing}
                                                    />
                                                    40% * 30% * 30%</label>
                                            </div>
                                        </div>
                                        {errors.releaseType && (
                                            <small className="text-danger">{errors.releaseType}</small>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10 mt-5"></div>
                            {/* Edit button */}
                            {/* <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-5">
                                <div className="form-group">
                                    <button className="btn btn-info btn-block" disabled={!isApprovalEditing} onClick={handleEditApproval}>
                                        Edit
                                    </button>
                                </div>
                            </div> */}
                            {/* Add More or Update Button */}
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-5">
                                <div className="form-group">
                                    <button className="btn btn-success btn-block" onClick={handleSave} disabled={!isEditing}>
                                        Save and continue
                                    </button>
                                </div>
                            </div>


                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                <div className="form-group">
                                    {records.length > 0 && (
                                        <div className="mt-4">
                                            <h4>Layout Approval order</h4>
                                            <DataTable
                                                columns={columns}
                                                data={records}
                                                customStyles={customStyles}
                                                pagination
                                                highlightOnHover
                                                striped
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Table to Display Records */}

                        </div>
                    </div>






                    <div className="mt-5" hidden>
                        <hr className='mt-1' />
                        <h6 className='fw-normal fs-5' style={{ color: '#0077b6' }}>{t('translation.BDA.Subdivision1.heading')}</h6>
                        <hr className='mt-1' style={{ border: '1px dashed #0077b6' }} />
                        <div className="row">
                            {/* release Order Number */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision1.orderNo')} <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder={t('translation.BDA.Subdivision1.orderNoPlaceholder')}
                                        name="layoutOrderNumber"  // <-- Corrected here
                                        value={release_formData.layoutOrderNumber}
                                        onChange={handleOrderChange}
                                        disabled={!isOrder_EditingArea}
                                    />
                                    {release_errors.layoutOrderNumber && (
                                        <small className="text-danger">{release_errors.layoutOrderNumber}</small>
                                    )}

                                </div>
                            </div>
                            {/* Date of order */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision1.dateofOrder')} <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="dateOfOrder"
                                        value={release_formData.dateOfOrder}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={handleOrderChange}
                                        disabled={!isOrder_EditingArea} // Disable when not editing
                                    />
                                    {release_errors.dateOfOrder && (
                                        <small className="text-danger">{release_errors.dateOfOrder}</small>
                                    )}
                                </div>
                            </div>
                            {/* Scan & Upload Layout release order */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision1.scanUploadOrder')}
                                        <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="form-control"
                                        onChange={handleFilereleaseOrderChange}
                                        ref={fileReleaseOrderInputRef}
                                        disabled={!isOrder_EditingArea} // Disable when not editing
                                    />
                                    {release_formData.release_Order && releaseOrderURL && (
                                        <div className="mt-2">
                                            <div
                                                style={{
                                                    width: "120px",
                                                    height: "120px",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "8px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <iframe
                                                    src={releaseOrderURL}
                                                    title="Release Order"
                                                    width="100%"
                                                    height="100%"
                                                    style={{ cursor: "pointer", border: "none" }}
                                                    onClick={() =>
                                                        window.open(releaseOrderURL, "_blank")
                                                    }
                                                />
                                            </div>
                                            <p className="mt-1" style={{ fontSize: "0.875rem" }}>
                                                Current File:{" "}
                                                <a
                                                    href={releaseOrderURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        textDecoration: "underline",
                                                        color: "#007bff",
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {release_formData.release_Order.name}
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                    <span className="note_color">
                                        {t('translation.BDA.Subdivision1.noteFile')}
                                    </span>
                                    <br />
                                    {release_errors.release_Order && (
                                        <small className="text-danger">{release_errors.release_Order}</small>
                                    )}
                                </div>
                            </div>
                            {/* release Authority */}
                            <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        {t('translation.BDA.Subdivision1.designation')}
                                        <span className="mandatory_color">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={t('translation.BDA.Subdivision1.placeholderDesignation')}
                                        name="orderAuthority"
                                        value={release_formData.orderAuthority}
                                        onChange={handleOrderChange}
                                        disabled={!isOrder_EditingArea} // Disable when not editing
                                    />
                                    {release_errors.orderAuthority && (
                                        <small className="text-danger">{release_errors.orderAuthority}</small>
                                    )}
                                </div>
                            </div>


                            <div className='col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10'></div>
                            {/* edit button */}
                            {/* <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                <div className="form-group">
                                    <button className="btn btn-info btn-block" disabled={!isOrderEditing} onClick={handleEditRelease}>
                                        Edit
                                    </button>
                                </div>
                            </div> */}
                            {/* Save Button */}
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                <div className="form-group">
                                    <button className="btn btn-success btn-block" onClick={handleOrderSave} disabled={!isOrder_EditingArea}>
                                        Save and continue
                                    </button>
                                </div>
                            </div>
                            {/* Save Button */}
                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                <div className="form-group">
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
                                </div>
                            </div>
                            {/* Table to Display Records */}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BDA;