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
    ekyc_Details, ekyc_Response, ekyc_insertOwnerDetails, jdaEKYC_Details, ekyc_insertJDADetails,
    individualSiteAPI, individualSiteListAPI, fetchECDetails, fetchDeedDocDetails, fetchDeedDetails, fetchJDA_details, deleteSiteInfo, fetch_LKRSID, update_Final_SaveAPI
} from '../../API/authService';

import usericon from '../../assets/usericon.png';
import { Cookie, Stop } from '@mui/icons-material';
import { responsiveProperty } from '@mui/material/styles/cssUtils';
import config from '../../Config/config';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};

const JDA_EKYCBlock = ({ LKRS_ID, jdaID }) => {
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const [selectedOption, setSelectedOption] = useState('JDArepresentative');

    const handleRadioChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const [phone, setPhone] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(30);
    const [isTimerActive, setIsTimerActive] = useState(false);

    const [showResend, setShowResend] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpInputsRef = useRef([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [ownerData, setOwnerData] = useState(null);
    const [isVerified, setIsVerified] = useState(false);

    const [createdBy, setCreatedBy] = useState(null);
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');
    const [LKRSID, setLKRSID] = useState('');
    const [jdaRepName, setJdaRepName] = useState('');

    const [ekyc_Status, setEKYC_Status] = useState(false);
    const [phone_Status, setPhone_Status] = useState(false);
    const [ownerDataList, setOwnerDataList] = useState([]);
    const [ekyc_Data, setEkyc_Data] = useState(null);
    const [jda_ID, setJDA_ID] = useState('');
    useEffect(() => {
        const storedCreatedBy = localStorage.getItem('createdBy');
        const storedCreatedName = localStorage.getItem('createdName');
        const storedRoleID = localStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);

    }, ["1"]);
    const [localLKRSID, setLocalLKRSID] = useState(() => {
        return localStorage.getItem("LKRSID") || "";
    });

    useEffect(() => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);

            delay(1000);
            fetchOwners(LKRS_ID);
        }
        if (jdaID) {
            setJDA_ID(jdaID);
        } else {
            const JDAID = localStorage.getItem('jdA_ID');

            setJDA_ID(JDAID);
        }
    }, [LKRS_ID, jdaID]);

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,10}$/.test(value)) {
            setPhone(value);
        }
    };
    const validatePhoneNumber = (phone) => {
        // Check if it's exactly 10 digits and only digits
        if (!/^\d{10}$/.test(phone)) {
            return "Phone number must be exactly 10 digits and contain only numbers.";
        }
        // Should not start with 0
        if (phone.startsWith('0')) {
            return "Phone number should not start with 0.";
        }
        // Should not be all zeros
        if (/^0+$/.test(phone)) {
            return "Phone number cannot be all zeros.";
        }
        return null; // Valid
    };
    //send OTP
    const handleSendOtp = async () => {
        const error = validatePhoneNumber(phone);
        if (error) {
            Swal.fire({
                text: error,
                icon: "error",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: false,
            });
            return;
        }
        start_loader();
        try {
            const response = await sendOtpAPI(phone);

            if (response.responseStatus === true) {
                stop_loader();
                Swal.fire({
                    text: response.responseMessage,
                    icon: "success",
                    timer: 3000,
                    confirmButtonText: "OK",
                });
                toast.success(response.responseMessage);
                setIsOtpSent(true);
                startTimer();
            } else {
                stop_loader();
                Swal.fire({
                    text: "Failed to send OTP. Please try again later.",
                    icon: "error",
                    timer: 2000,
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to send OTP:", error);
        } finally {
            stop_loader();
        }
    };
    //verify OTP
    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6) {
            Swal.fire({
                text: "Please enter the 6-digit OTP.",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }
        start_loader();
        try {
            const response = await verifyOtpAPI(phone, enteredOtp);
            if (response.responseStatus === true) {
                setIsOtpSent(false);
                Swal.fire({
                    text: response.responseMessage,
                    icon: "success",
                    timer: 2000,
                    confirmButtonText: "OK",
                });
                toast.success(response.responseMessage);
                setPhone_Status(true);
                setIsVerified(true);

            } else {
                Swal.fire({
                    text: response.responseMessage || "OTP verification failed",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            Swal.fire({
                text: "Error verifying OTP.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader();
        }
    };
    //Resend OTP
    const handleResendOtp = async () => {
        start_loader();
        try {
            const response = await sendOtpAPI(phone);
            if (response.responseStatus === true) {
                Swal.fire({
                    text: response.responseMessage,
                    icon: "success",
                    timer: 2000,
                    confirmButtonText: "OK",
                });
                setIsOtpSent(true);
                setOtp(Array(6).fill(''));
                startTimer();
            } else {
                Swal.fire({
                    text: "Failed to resend OTP. Please try again later.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            Swal.fire({
                text: "Error resending OTP.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader();
        }
    };
    const startTimer = () => {
        setTimer(30); // 30 seconds or your choice
        setIsTimerActive(true);
        setIsTimerActive(true);
        setShowResend(false);
    };
    useEffect(() => {
        let interval = null;
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerActive(false);
            setShowResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timer]);

    const isVerifyDisabled = otp.some(d => !d);

    const handleOtpChange = (input, idx) => {
        const value = input.value.replace(/\D/g, ''); // Only digits
        if (value.length > 1) return; // Only single digit

        const newOtp = [...otp];
        newOtp[idx] = value;
        setOtp(newOtp);

        // Move focus to next input if digit entered
        if (value && idx < otp.length - 1) {
            otpInputsRef.current[idx + 1].focus();
        }
    };
    const handleOtpKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpInputsRef.current[idx - 1].focus();
        }
    };

    const [ekycUrl, setEkycUrl] = useState('');
    const [ownerList, setOwnerList] = useState([]);
    const [ownerNames, setOwnerNames] = useState('');
    const [ownerEKYCDataList, setownerEKYCDataList] = useState([]);
    //multiple owner list fetch
    const fetchOwners = async (LKRSID) => {
        try {
            const apiResponse = await jdaEKYC_Details("1", LKRSID);

            const owners = (apiResponse || []).filter(owner => owner.jdAekyc_ID !== 0);

            if (owners.length > 0) {
                console.table(owners);
                setownerEKYCDataList(owners);
                setIsEKYCCompleted(true);
            } else {
                setownerEKYCDataList([]);
                setIsEKYCCompleted(false);
            }
        } catch (error) {
            console.error("Error fetching owner data:", error);
            setownerEKYCDataList([]);
            setIsEKYCCompleted(false);
        }
    };

    // useEffect(() => {
    //     const handleMessage = (event) => {
    //         // Ensure the message is coming from your domain
    //         if (event.origin !== `${config.redirectBaseURL}`) return;

    //         const data = event.data;

    //         console.log("ekyc",data);
    //         // You can store this in state or use it directly
    //         setEkyc_Data(data);
    //     };

    //     window.addEventListener("message", handleMessage);

    //     return () => window.removeEventListener("message", handleMessage);
    // }, []);


    // useEffect(() => {
    //     const handleMessage = (event) => {
    //         // Check origin
    //         if (event.origin !== `${config.redirectBaseURL}`) return;
    //         // Check path
    //         if (window.location.pathname !== "/LayoutForm") return;
    //         if (event.data.ekycStatus === "Success") {
    //             Swal.fire({
    //                 title: 'eKYC Result',
    //                 text: `Status: ${event.data.ekycStatus}`,
    //                 icon: 'success',
    //                 allowOutsideClick: false,
    //                 allowEscapeKey: false,
    //                 confirmButtonText: 'OK'
    //             }).then((result) => {
    //                 if (result.isConfirmed) {
    //                     // Use the latest value from the ref
    //                     fetchEKYC_ResponseDetails(jdaRepName, event.data.ekycTxnNo);
    //                 }
    //             });
    //         } else if (event.data.ekycStatus === "Failure") {
    //             Swal.fire('eKYC Result', `Status: ${event.data.ekycStatus}`, 'error');
    //         }
    //     };
    //     window.addEventListener("message", handleMessage);
    //     return () => window.removeEventListener("message", handleMessage);
    // }, []);

    //do EKYC API
    const [isEKYCCompleted, setIsEKYCCompleted] = useState(false);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== `${config.redirectBaseURL}`) return;

            const data = event.data;
            setEkyc_Data(data);

            if (window.location.pathname !== "/LayoutForm") return;

            if (data.ekycStatus === "Success") {
                Swal.fire({
                    title: 'eKYC Result',
                    text: `Status: ${data.ekycStatus}`,
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetchEKYC_ResponseDetails(jdaRepName, data.ekycTxnNo);
                    }
                });
            } else if (data.ekycStatus === "Failure") {
                Swal.fire('eKYC Result', `Status: ${data.ekycStatus}`, 'error');
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [jdaRepName]);


    const handleDoEKYC = async () => {
        if (!jdaRepName.trim()) {
            Swal.fire('Validation Error', 'Please enter the JDA Representative Name.', 'warning');
            return;
        }
        const swalResult = await Swal.fire({
            title: 'Redirecting for e-KYC Verification',
            text: 'You are being redirected to another tab for e-KYC verification. Once the e-KYC verification is complete, please return to this tab and click the verify e-KYC button.',
            icon: 'info',
            confirmButtonText: 'OK',
            allowOutsideClick: false
        });

        if (swalResult.isConfirmed) {
            start_loader();
            try {
                // Use selectedOwner.id and selectedOwner.name
                const OwnerNumber = 1;
                const BOOK_APP_NO = 2;
                const PROPERTY_CODE = 1;

                // Pass them to your API
                const response = await ekyc_Details({
                    OwnerNumber,
                    BOOK_APP_NO,
                    PROPERTY_CODE
                });

                const resultUrl = response?.ekycRequestUrl;
                localStorage.setItem("tranNo", response?.tranNo);
                if (resultUrl) {
                    window.open(
                        resultUrl,
                        '_blank',
                        `toolbar=0,location=0,menubar=0,width=${window.screen.width},height=${window.screen.height},top=0,left=0`
                    );
                    stop_loader();
                } else {
                    stop_loader();
                    Swal.fire('Error', 'No redirect URL returned', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'eKYC API call failed', 'error');
                console.error('eKYC API call failed:', error);
                stop_loader();
            }
        }
    };
    const [jdaDataList, setJDADataList] = useState([]);
    const fetchEKYC_ResponseDetails = async (jdaRepName, txnno) => {
        const transaction_No = localStorage.getItem("tranNo");
        if (transaction_No === txnno) {
            try {
                const payload = {
                    transactionNumber: 83,
                    OwnerType: 'NEWOWNER',
                    ownName: jdaRepName,
                };
                const transactionNumber = 83;
                const OwnerType = "NEWOWNER";

                const response = await ekyc_Response(transactionNumber, OwnerType, jdaRepName);
                setOwnerData(response);
                setEKYC_Status(true);
                setIsEKYCCompleted(true);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {

            }
        } else {

        }
    };
    const insertEKYCDetails = async () => {
        if (ekyc_Status === false && phone_Status === false) {
            Swal.fire({
                text: "Please do a JDA / JDA Representative EKYC",
                icon: "error",
                confirmButtonText: "OK",
            });
            return
        }
        const payloadJDAOwner = {
            jdaekyC_ID: 0,
            jdaekyC_LKRS_ID: parseInt(LKRS_ID),
            jdaekyC_JDA_ID: parseInt(jda_ID),
            jdaekyC_JDA_NAME: jdaRepName,
            jdaekyC_IS_REPRESENTATIVE: true,
            jdaekyC_REPRESENTATIVENAME: "",
            jdaekyC_AADHAARNumber: ownerData?.ekycResponse?.maskedAadhaar ?? null,
            jdaekyC_NAMEASINAADHAAR: ownerData?.ekycResponse?.ownerNameEng ?? null,
            jdaekyC_AADHAARVERISTATUS: ekyc_Data.ekycStatus,
            jdaekyC_NAMEMATCHSCORE: ownerData?.nameMatchScore,
            jdaekyC_REMARKS: "",
            jdaekyC_ADDITIONALINFO: "",
            jdaekyC_CREATEDBY: parseInt(createdBy),
            jdaekyC_CREATEDNAME: createdName,
            jdaekyC_CREATEDROLE: roleID,
            jdaekyC_VAULTREFID: ownerData?.ekycResponse?.vaultRefNumber ?? null,
            jdaekyC_VAULT_REMARKS: "",
            jdaekyC_ALREADYEXIST_INEAASTHI: false,
            jdaekyC_AADHAAR_RESPONSE: JSON.stringify(ownerData) ?? null,




        }
        try {
            start_loader();
            const response = await ekyc_insertJDADetails(payloadJDAOwner);

            if (response.responseStatus === true) {

                Swal.fire({
                    text: response.responseMessage,
                    icon: "success",
                    confirmButtonText: "OK",
                    allowOutsideClick: false, // prevents closing on outside click
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        fetchOwners(LKRS_ID);
                    }
                });

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

    return (
        <div className="card"> {loading && <Loader />}
            <div className="card-header layout_btn_color" >
                <h5 className="card-title" style={{ textAlign: 'center' }}>JDA / JDA Representative eKYC</h5>

            </div>
            <div className="card-body">
                <div className='row'>
                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                        <label className="form-label">JDA / JDA Representative  </label>
                    </div>
                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" >
                        <div className="form-check">
                            <label> <input
                                type="radio"
                                name="JDArepresentative"
                                value="JDArepresentative"
                                checked={selectedOption === 'JDArepresentative'}
                                onChange={handleRadioChange}
                            />
                                JDA Representative</label>
                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-3">
                        <div className='row'>
                            <div className="alert alert-warning">[Note: Click on eKYC Status button once the ekyc is done to check verification status]</div>
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3" >
                                <label className="form-label">JDA Representative Name <span className='mandatory_color'>*</span></label>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" >
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter the JDA Representative Name"
                                    value={jdaRepName}
                                    onChange={(e) => setJdaRepName(e.target.value)}
                                    readOnly={isEKYCCompleted}
                                />

                            </div>
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2" >
                                <button className='btn btn-info btn-block' disabled={isEKYCCompleted} onClick={handleDoEKYC}>Do eKYC</button>
                            </div>
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2" hidden>
                                <button className='btn btn-info btn-block' onClick={fetchEKYC_ResponseDetails}>eKYC Status</button>
                            </div>
                            {ekycUrl && (
                                <iframe
                                    src={ekycUrl}
                                    title="eKYC Verification"
                                    width="100%"
                                    height="600"
                                    style={{ border: '1px solid #ccc', marginTop: '20px' }}
                                />
                            )}
                            <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-2" ></div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-3">
                        <div className="row mt-3">
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                <label className="form-label">Phone Number <span className='mandatory_color'>*</span></label>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mt-3">
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    maxLength={10}
                                    className="form-control"
                                    placeholder="Enter the Phone Number"
                                    readOnly={isVerified || ownerEKYCDataList.length > 0}
                                    onInput={e => {
                                        // Remove non-digit characters
                                        e.target.value = e.target.value.replace(/\D/g, '');
                                        handlePhoneChange(e);
                                    }}
                                />
                                {isOtpSent && (
                                    <>
                                        {isTimerActive && (
                                            <div className="mb-2">
                                                <strong>Resend OTP in : {timer} s</strong>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-3'>
                                {!isOtpSent && !isVerified && (
                                    <button className="btn btn-info btn-block" onClick={handleSendOtp} disabled={ownerEKYCDataList.length > 0}>
                                        Send OTP
                                    </button>
                                )}
                                {isVerified && (
                                    <div className="text-success mt-2">
                                        <strong>OTP Verified <i className="fa fa-check-circle"></i></strong>
                                    </div>
                                )}
                            </div>
                        </div><br />
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-2">

                            </div>
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-2">
                                {isOtpSent && !isVerified && (
                                    <>
                                        <label className="form-label">Enter the OTP <span className='mandatory_color'>*</span></label>
                                        <div className="d-flex gap-2">

                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    type="text"
                                                    maxLength={1}
                                                    className="form-control text-center"
                                                    style={{ width: '40px' }}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(e.target, index)}
                                                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                                    ref={(el) => (otpInputsRef.current[index] = el)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                            </div>
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-2">
                                {isOtpSent && !isVerified && (
                                    <div className="row">
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-6" >
                                            <button className="btn btn-success btn-block mb-2"
                                                disabled={isVerifyDisabled}
                                                onClick={handleVerifyOtp}
                                            >
                                                Verify OTP
                                            </button>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-6" >
                                            {showResend && (
                                                <button className="btn btn-warning btn-block" onClick={handleResendOtp}>
                                                    Resend OTP
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                    <div className="col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10 mt-3"></div>
                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-3">
                        <button className='btn btn-success btn-block' onClick={insertEKYCDetails} disabled={ownerEKYCDataList.length > 0}>Save and continue</button>
                    </div>
                </div>

                <div className='row'>

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
                                        <th>ಹೆಸರು ಹೊಂದಾಣಿಕೆಯ ಸ್ಥಿತಿ / Name Match Status</th> {/* New column */}
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
                                                <td style={{ textAlign: 'center'}}><img src={usericon} alt="Owner" width="50" height="50" /></td>
                                                
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
                                                <td style={{ textAlign: 'center' }}>{nameMatchStatus}</td>
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
    );
};


export default JDA_EKYCBlock;