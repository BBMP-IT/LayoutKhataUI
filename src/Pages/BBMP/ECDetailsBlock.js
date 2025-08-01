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
import JDA_EKYCBlock from './JDA_EKYCBlock';
import Owner_EKYCBlock from './Owner_EKYCBlock';
import usericon from '../../assets/usericon.png';
import { Cookie, Stop } from '@mui/icons-material';
import { responsiveProperty } from '@mui/material/styles/cssUtils';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};

const ECDetailsBlock = ({ LKRS_ID, isRTCSectionSaved, isEPIDSectionSaved, setIsECSectionSaved, ownerName, setIsJDAEKYCSectionSaved, setIsOwnerEKYCSectionSaved, setValidate_OwnerDataList, landDetails }) => {
    const [ecNumber, setECNumber] = useState("");
    const [ecNumberError, setEcNumberError] = useState('');
    const [hasJDA, setHasJDA] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [deedNumber, setDeedNumber] = useState("");
    const [deedError, setDeedError] = useState('');

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const [fetchJDA, setFetchJDA] = useState('false');

    const [jdaFile, setJdaFile] = useState(null);
    const [error, setError] = useState('');
    const [deedNoURL, setDeedNoURL] = useState(null);
    const deedNoURLRef = useRef(null);
    const [createdBy, setCreatedBy] = useState(sessionStorage.getItem('PhoneNumber'));
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');
    const [jdaID, setJdaID] = useState('');
    useEffect(() => {
        return () => {
            if (deedNoURL) URL.revokeObjectURL(deedNoURL);
        };
    }, [deedNoURL]);
    useEffect(() => {
        const storedCreatedBy = sessionStorage.getItem('createdBy');
        const storedCreatedName = sessionStorage.getItem('createdName');
        const storedRoleID = sessionStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);

    }, []);
    const [localLKRSID, setLocalLKRSID] = useState("");

    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        } else {
            // fallback to sessionStorage if needed
            const id = sessionStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
        }
    }, [LKRS_ID]);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.click();
        }
    }, [localLKRSID]);


    const loadData = async () => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        if (localLKRSID) {
            await delay(1000);
            handleGetLKRSID(localLKRSID);
            await delay(1000);
            fetchJDAInfo(localLKRSID);
        }
    };
    const handleGetLKRSID = async (localLKRSID) => {

        const payload = {
            level: 1,
            LkrsId: localLKRSID,
        };
        try {
            start_loader();
            const response = await fetch_LKRSID(localLKRSID);

            if (response) {
                if (response.lkrS_ECNUMBER) {
                    setECNumber(response.lkrS_ECNUMBER); //  set ecNumber from response

                    setIsJDASectionDisabled(true);
                    setShowViewECButton(true);
                    setIsECSectionSaved(true);
                    stop_loader();
                }

            } else {
                stop_loader();
                console.warn("EC Number is missing in the response.");
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to fetch LKRSID data:", error);

        }
    };

    const fetchJDAInfo = async (localLKRSID) => {
        try {
            start_loader();
            const response = await fetchJDA_details(1, parseInt(localLKRSID, 10), 0);

            if (response && Object.keys(response).length > 0) {

                setHasJDA(response[0].lkrS_IsJDAEXITS);
                setIsRegistered(response[0].jdA_ISREGISTERED);
                setShowViewDeedButton(true);

                if (response[0].jdA_ISREGISTERED === true) {
                    setDeedNumber(response[0].jdA_DEED_NO);
                    setIsECSectionSaved(true);
                } else if (response[0].jdA_ISREGISTERED === false) {
                    const deedFileResponse = await fileListAPI(3, localLKRSID, 4, 0);
                    setJdaDocumentId(response[0].jdA_DEED_NO);
                    const dateStr = response[0].jdA_REGISTEREDDATE?.split('T')[0];
                    setJdaDocumentDate(dateStr);
                    const base64String = deedFileResponse[0]?.doctrN_DOCBASE64;
                    setIsECSectionSaved(true);
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

    const [showViewECButton, setShowViewECButton] = useState(false);
    const [base64Data, setBase64Data] = useState('');
    const [isECReadOnly, setIsECReadOnly] = useState(false);
    const [isFetchDisabled, setIsFetchDisabled] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);

    const [showViewDeedButton, setShowViewDeedButton] = useState(false);
    const [deedbase64Data, setDeedBase64Data] = useState('');
    const [isDEEDReadOnly, setIsDEEDReadOnly] = useState(false);
    const [isdeedFetchDisabled, setIsdeedFetchDisabled] = useState(false);
    const [showDeedEditButton, setShowDeedEditButton] = useState(false);

    const [jdaDocumentId, setJdaDocumentId] = useState('');
    const [jdaDocumentDate, setJdaDocumentDate] = useState('');
    const [jdaDocumentIdError, setJdaDocumentIdError] = useState('');
    const [jdaDocumentDateError, setJdaDocumentDateError] = useState('');


    const [checkECStatus, setCheckECStatus] = useState(false);
    const [checkDeedStatus, setCheckDeedStatus] = useState(false);



    const handleJDAFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
            setJdaFile(file);
            const url = URL.createObjectURL(file);
            setDeedNoURL(url);
        } else {
            setJdaFile(null);
            setDeedNoURL(null);
        }
    };
    const handleEC_FetchDetails = async () => {
        const ecNumberPattern = /^[A-Z0-9-]+$/;
        if (!ecNumber) {
            setEcNumberError('EC Number is required');
            return;
        }
        if (!ecNumberPattern.test(ecNumber)) {
            setEcNumberError('Only uppercase letters, numbers, and hyphens are allowed');
            return;
        }
        if (/^0/.test(ecNumber)) {
            setEcNumberError('EC Number cannot start with zero');
            return;
        }
        if (/^0+$/.test(ecNumber.replace(/-/g, ''))) {
            setEcNumberError('EC Number cannot be all zeros');
            return;
        }
        setEcNumberError('');



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
                setBase64Data(response.base64);
                setShowViewECButton(true);
                setIsECReadOnly(true);
                setIsFetchDisabled(true);
                setShowEditButton(true);
                setCheckECStatus(true);

                Swal.fire({
                    title: response.responseMessage,
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } else {
                Swal.fire({
                    text: response.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
                setShowViewECButton(false);
            }
        } catch (error) {
            console.error("Failed to insert data:", error);
            Swal.fire({
                text: "Unable to retrieve EC. Please try again",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader();
        }

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

    const handleEcNumberChange = (e) => {
        let value = e.target.value.toUpperCase(); // Convert to uppercase

        const ecNumberPattern = /^[A-Z0-9-]+$/;

        setECNumber(value);

        if (!ecNumberPattern.test(value)) {
            setEcNumberError('Only uppercase letters, numbers, and hyphens are allowed');
        } else if (/^0/.test(value)) {
            setEcNumberError('EC Number cannot start with zero');
        } else if (/^0+$/.test(value.replace(/-/g, ''))) {
            setEcNumberError('EC Number cannot be all zeros');
        } else {
            setEcNumberError('');
        }
    };

    const handleDeedNumberChange = (e) => {
        let value = e.target.value.toUpperCase(); // Convert to uppercase

        const deedNumberPattern = /^[A-Z0-9-]+$/;

        setDeedNumber(value);

        if (!deedNumberPattern.test(value)) {
            setDeedError('Only uppercase letters, numbers, and hyphens are allowed');
        } else if (/^0/.test(value)) {
            setDeedError('Deed Number cannot start with zero');
        } else if (/^0+$/.test(value.replace(/-/g, ''))) {
            setDeedError('Deed Number cannot be all zeros');
        } else {
            setDeedError('');
        }
    };
    const validateDeedNumber = (value) => {
        const regex = /^[A-Z]+-([1-9][0-9]*)-\d+-\d{4}-\d{2}$/;
        if (!regex.test(value)) {
            setDeedError('Invalid Deed Number format');
            return false;
        }
        setDeedError('');
        return true;
    };

    const handleDeedChange = (e) => {
        setDeedNumber(e.target.value.toUpperCase());
        validateDeedNumber(e.target.value);
    };
    const [isJDASectionDisabled, setIsJDASectionDisabled] = useState(false);

    const handleJDASave = async (file) => {
        let JDAReg;
        //First section save button condition
        if (!isRTCSectionSaved && !isEPIDSectionSaved) {
            Swal.fire("Please save the land or Khata details before proceeding with site details", "", "warning");
            return;
        }

        if (hasJDA !== true && hasJDA !== false) {
            Swal.fire({
                text: "Please select whether a Joint Development Agreement exists.",
                icon: "warning",
                confirmButtonText: "OK",
            });
            return;
        }
        const deedRegex = /^[A-Z]+-([1-9][0-9]*)-\d+-\d{4}-\d{2}$/;

        // Validate deed number if registered
        if (hasJDA === true) {
            if (isRegistered === true) {
                if (!deedNumber || !deedRegex.test(deedNumber)) {
                    Swal.fire({
                        text: "Invalid Deed Number format. Example: XXX-1-0000-YYYY-YY. The number after the first hyphen cannot start with 0.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                    return;
                }
                JDAReg = true;
            } else if (isRegistered === false) {
                JDAReg = false;
                if (!jdaDocumentId.trim()) {
                    Swal.fire({
                        text: "JDA Document ID is required.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                    return;
                }
                if (!jdaDocumentDate) {
                    Swal.fire({
                        text: "JDA Document Date is required.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                    return;
                }
                if (!file) {
                    Swal.fire({
                        text: "File is required. Please upload the JDA document.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                    return;
                }
            }
        } else {
            setJdaDocumentDate("2025-06-23T08:31:07.668Z");
        }

        start_loader();

        try {
            const payload = {
                jdA_ID: 0,
                jdA_LKRS_ID: localLKRSID,
                jdA_ISREGISTERED: JDAReg,
                jdA_DEED_NO: isRegistered === true ? deedNumber : jdaDocumentId,
                jdA_REMARKS: "",
                jdA_ADDITIONALINFO: "",
                jdA_CREATEDBY: createdBy,
                jdA_CREATEDNAME: createdName,
                jdA_CREATEDROLE: roleID,
                lkrS_EC: ecNumber,
                lkrS_IsJDAEXITS: hasJDA,
                jdA_REGISTEREDDATE: jdaDocumentDate ? jdaDocumentDate : null

            };

            if (checkECStatus === true) {
                if (hasJDA === false) {
                    const response = await insertJDA_details(payload);

                    if (response.responseStatus === true) {
                        stop_loader();
                        Swal.fire({
                            text: response.responseMessage,
                            icon: "success",
                            confirmButtonText: "OK",
                        });
                        sessionStorage.setItem('jdA_ID', response.jdA_ID);
                        console.log("JDAID", sessionStorage.setItem('jdA_ID', response.jdA_ID));
                        setJdaID(response.jdA_ID);
                        setIsJDASectionDisabled(true);
                        setIsECSectionSaved(true);
                    } else {
                        stop_loader();
                        Swal.fire({
                            text: "Failed to save JDA details. Please try again later.",
                            icon: "error",
                            timer: 2000,
                            confirmButtonText: "OK",
                        });
                    }
                    return;
                } else if (hasJDA === true) {
                    const response = await insertJDA_details(payload);

                    if (response.responseStatus === true) {


                        if (isRegistered === false) {
                            const JDA_uploadSuccess = await file_UploadAPI(
                                4, // master document ID
                                "",
                                file,
                                "",
                                response.jdA_ID,
                                "JDA Not Registered"
                            );

                            if (!JDA_uploadSuccess) {
                                Swal.fire({
                                    text: "Failed to upload file. Please try again.",
                                    icon: "error",
                                    timer: 2000,
                                    confirmButtonText: "OK",
                                });
                                return;
                            }
                        }

                        sessionStorage.setItem('jdA_ID', response.jdA_ID);
                        console.log("JDAID", sessionStorage.setItem('jdA_ID', response.jdA_ID));
                        setJdaID(response.jdA_ID);
                        setIsJDASectionDisabled(true);
                        setIsECSectionSaved(true);
                        stop_loader();
                        Swal.fire({
                            text: response.responseMessage || "JDA details saved successfully.",
                            icon: "success",
                            confirmButtonText: "OK",
                        });

                        //  Optional: Reset form fields only on success
                        // setDeedNumber("");
                        // setFile(null);

                    } else {
                        stop_loader();
                        Swal.fire({
                            text: "Failed to save JDA details. Please try again later.",
                            icon: "error",
                            timer: 2000,
                            confirmButtonText: "OK",
                        });
                    }
                } else {
                    stop_loader();
                    Swal.fire({
                        text: "JDA status not identified.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } else {
                stop_loader();
                Swal.fire({
                    text: "EC not found!",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to save JDA details:", error);
            Swal.fire({
                text: "An error occurred while saving JDA details.",
                icon: "error",
                timer: 2000,
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader(); // Just in case
        }
    };
    const handleViewEC = () => {
        const pdfWindow = window.open();
        pdfWindow.document.write(
            `<iframe width='100%' height='100%' src='data:application/pdf;base64,${base64Data}'></iframe>`
        );
    };
    const handleEditClick = () => {
        setIsECReadOnly(false);
        setIsFetchDisabled(false);
        setShowEditButton(false);
        setShowViewECButton(false);
        setBase64Data('');
        setECNumber(''); // ← This clears the EC input field
        setEcNumberError(''); // (Optional) Clears any validation error
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

                Swal.fire({
                    title: response.responseMessage,
                    icon: "success",
                    confirmButtonText: "OK",
                });
                stop_loader();
            } else {
                stop_loader();
                newTab.close(); // Close the tab if the request fails
                Swal.fire({
                    text: response.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
                setShowViewDeedButton(false);
            }
        } catch (error) {
            stop_loader();
            newTab.close(); // Close tab on error
            console.error("Failed to fetch deed data:", error);

        } finally {
            stop_loader();
        }
    };
    const handleDeedEditClick = () => {
        setIsDEEDReadOnly(false);
        setIsdeedFetchDisabled(false);
        setShowDeedEditButton(false);
        setShowViewDeedButton(false);
        setDeedBase64Data('');
        setDeedNumber(''); // ← This clears the EC input field
        setDeedError(''); // (Optional) Clears any validation error
    };
    const handleDeed_FetchDetails = async () => {
        const deedNumberPattern = /^[A-Z0-9-/]+$/;
        if (!deedNumber) {
            setDeedError('Deed Number is required');
            return;
        }
        if (!deedNumberPattern.test(deedNumber)) {
            setDeedError('Only uppercase letters, numbers, slash and hyphens are allowed');
            return;
        }
        if (/^0/.test(deedNumber)) {
            setDeedError('Deed Number cannot start with zero');
            return;
        }
        if (/^0+$/.test(deedNumber.replace(/-/g, ''))) {
            setDeedError('Deed Number cannot be all zeros');
            return;
        }
        setDeedError('');

        try {
            start_loader();
            const payload = {
                finalRegNumber: deedNumber,
                lkrsid: localLKRSID,
            }
            const response = await fetchDeedDetails(payload);

            if (
                response.responseStatus === true &&
                response.json
            ) {
                const deedData = JSON.parse(response.json);
                setJdaDocumentDate(deedData.registrationdatetime);
                setShowViewDeedButton(true);
                setIsDEEDReadOnly(true);
                setIsdeedFetchDisabled(true);
                setShowDeedEditButton(true);
                setCheckDeedStatus(true);
                Swal.fire({
                    title: response.responseMessage,
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } else {
                Swal.fire({
                    text: response.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
                setShowViewECButton(false);
            }
        } catch (error) {
            console.error("Failed to insert data:", error);

        } finally {
            stop_loader();
        }
    };
    const handleJdaDocumentIdChange = (e) => {
        const value = e.target.value;

        // Allow only alphanumeric and spaces (adjust regex if you want to allow hyphens, slashes, etc.)
        const pattern = /^[a-zA-Z0-9\s-]*$/;

        if (pattern.test(value)) {
            setJdaDocumentId(value);
            setJdaDocumentIdError('');
        } else {
            setJdaDocumentIdError('Special characters are not allowed.');
        }
    };
    const handleJdaDocumentDateChange = (e) => {
        const value = e.target.value;
        const today = new Date().toISOString().split('T')[0];

        if (value > today) {
            setJdaDocumentDateError('Future dates are not allowed.');
        } else {
            setJdaDocumentDateError('');
        }

        setJdaDocumentDate(value);
    };

    return (
        <div>
            {loading && <Loader />}

            <div className="card">
                <button className='btn btn-block' onClick={loadData} ref={buttonRef} hidden>Click me</button>
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>EC Details & JDA Registration</h5>

                </div>
                <div className="card-body">
                    <div className='row'>
                        <div className="alert alert-info">Note : EC should be atleast 1 day before registered deed of property until 31-10-2024 or later. If sale / registered deed date is before 01-04-2004 then EC should be from 01-04-2004 to 31-10-2024 or after</div>
                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-3">
                            <div className="form-group mt-2">
                                <label className='form-label'>Enter EC Number of Mother Property <span className='mandatory_color'>*</span></label>
                                <input
                                    type="text"
                                    className={`form-control ${ecNumberError ? 'is-invalid' : ''}`}
                                    placeholder="Enter EC Number of Mother Property"
                                    value={ecNumber}
                                    maxLength={50}
                                    onChange={handleEcNumberChange}
                                    readOnly={isECReadOnly || isJDASectionDisabled}
                                />
                                {ecNumberError && <div className="invalid-feedback">{ecNumberError}</div>}
                            </div>
                        </div>

                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-4">
                            <div className="form-group mt-6">
                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={handleEC_FetchDetails}
                                    disabled={isFetchDisabled || isJDASectionDisabled}
                                >
                                    Fetch EC Details
                                </button>
                            </div>
                        </div>

                        {showEditButton && (
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-4">
                                <div className="form-group mt-6">
                                    <button
                                        className="btn btn-info btn-block"
                                        onClick={handleEditClick}
                                        disabled={isJDASectionDisabled}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {showViewECButton && (
                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                            <div className="text-success">
                                <strong>EC Check successfully <i className="fa fa-check-circle"></i></strong>
                            </div>
                            <div className="form-group">
                                <button className="btn btn-warning btn-block" onClick={handleViewEC}>
                                    View EC
                                </button>
                            </div>
                        </div>
                    )}


                    <div className='row'>
                        <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                            <div className="d-flex align-items-center gap-3">
                                <label className="form-check-label">Is there a Joint Development Agreement?</label>
                                <div className="form-check">
                                    <label className="form-check-label">
                                        <input
                                            className="form-check-input radioStyle"
                                            type="radio"
                                            name="hasJDA"
                                            value="yes"
                                            checked={hasJDA === true}
                                            onChange={() => setHasJDA(true)}
                                            disabled={isJDASectionDisabled}
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
                                            disabled={isJDASectionDisabled}
                                        />
                                        No</label>
                                </div>
                            </div>
                        </div>
                        <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                            {hasJDA === true && (
                                <div className="d-flex align-items-center gap-3 ">
                                    <label className="form-check-label">Is Joint Development Agreement Registered?</label>
                                    <div className="form-check">
                                        <label className="form-check-label">
                                            <input
                                                className="form-check-input radioStyle"
                                                type="radio"
                                                name="isRegistered"
                                                value="yes"
                                                checked={isRegistered === true}
                                                onChange={() => setIsRegistered(true)}
                                                disabled={isJDASectionDisabled}
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
                                                disabled={isJDASectionDisabled}
                                            />
                                            No</label>
                                    </div>
                                </div>
                            )}
                            {hasJDA === false && (
                                <><h6 hidden>JDA Not Exist</h6></>
                            )}

                        </div>
                        {isRegistered === true && hasJDA === true && (
                            <>
                                <div className='row'>
                                    <hr />
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6" >
                                        <label className='form-label'>Enter JDA registered Deed Number <span className='mandatory_color'>*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter your Deed Number"
                                            value={deedNumber}
                                            onChange={handleDeedChange} maxLength={50} readOnly={isJDASectionDisabled}
                                        />
                                        {deedError && <div className="text-danger">{deedError}</div>}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                        <div className="form-group ">
                                            <label> </label>
                                            <button className="btn btn-primary btn-block " onClick={handleDeed_FetchDetails}
                                                disabled={isdeedFetchDisabled || isJDASectionDisabled}>
                                                Fetch Deed
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2">
                                        {showDeedEditButton && (
                                            <div className="form-group ">
                                                <label> </label>
                                                <button
                                                    className="btn btn-info btn-block"
                                                    onClick={handleDeedEditClick}
                                                    disabled={isJDASectionDisabled}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                                <div className='row'>
                                    {showViewDeedButton && (<>
                                        <div className="text-success">
                                            <strong>Deed Check successfully <i className="fa fa-check-circle"></i></strong>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">

                                            <div className="form-group">

                                                <button className="btn btn-warning btn-block" onClick={handleViewDeed}>
                                                    View Deed
                                                </button>
                                            </div>

                                        </div>
                                    </>)}
                                </div>

                            </>
                        )}
                        {hasJDA === true && isRegistered === false && (
                            <>
                                <div className='row'>
                                    <hr />
                                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                        <label className='form-label'>Enter JDA Document ID <span className='mandatory_color'>*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter your JDA Document ID"
                                            value={jdaDocumentId}
                                            onChange={handleJdaDocumentIdChange}
                                            maxLength={15}
                                            readOnly={isJDASectionDisabled}
                                        />
                                        {jdaDocumentIdError && <div className="text-danger">{jdaDocumentIdError}</div>}
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                        <label className='form-label'>Enter JDA Document Date <span className='mandatory_color'>*</span></label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={jdaDocumentDate}
                                            onChange={handleJdaDocumentDateChange}
                                            readOnly={isJDASectionDisabled}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {jdaDocumentDateError && <div className="text-danger">{jdaDocumentDateError}</div>}
                                    </div>


                                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                        <label className='form-label'>Scan & upload the JDA <span className='mandatory_color'>*</span></label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleJDAFileChange}
                                            accept="application/pdf"
                                            disabled={isJDASectionDisabled}
                                        />
                                        <label className="note_color">[ Only PDF files are allowed, file size must be less than 5MB ]</label>
                                        {deedNoURL && (
                                            <div style={{ marginTop: '10px' }}>
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
                                        )}

                                        {jdaFile && deedNoURL && (
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
                                                        src={deedNoURL}
                                                        width="100%"
                                                        height="100%"
                                                        title="JDA Document"
                                                        onClick={() => window.open(deedNoURL, "_blank")}
                                                        style={{ cursor: "pointer", border: "none" }}
                                                    />
                                                </div>
                                                <p className="mt-1" style={{ fontSize: "0.875rem" }}>
                                                    Current File:{" "}
                                                    <a
                                                        href={deedNoURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            textDecoration: "underline",
                                                            color: "#007bff",
                                                            fontSize: "0.875rem",
                                                        }}
                                                    >
                                                        {jdaFile.name}
                                                    </a>
                                                </p>
                                            </div>
                                        )}
                                    </div>



                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 ">
                                        <div className="alert alert-info">Note: Please do EKYC of JDA / JDA Representative.</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className='row'>
                        <div className="col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10 "></div>
                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                            <div className="form-group">
                                <label></label>
                                <button className="btn btn-success btn-block" disabled={isJDASectionDisabled} onClick={() => handleJDASave(jdaFile)}>
                                    Save and continue
                                </button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
            <>
                <Owner_EKYCBlock LKRS_ID={LKRS_ID} ownerName={ownerName} setIsOwnerEKYCSectionSaved={setIsOwnerEKYCSectionSaved}
                    setValidate_OwnerDataList={setValidate_OwnerDataList} landDetails={landDetails} />

                {hasJDA && <JDA_EKYCBlock LKRS_ID={LKRS_ID} jdaID={jdaID} setIsJDAEKYCSectionSaved={setIsJDAEKYCSectionSaved} />}
            </>
        </div>
    );
};

export default ECDetailsBlock;