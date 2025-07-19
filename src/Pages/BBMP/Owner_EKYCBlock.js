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
import config from '../../Config/config';
import usericon from '../../assets/usericon.png';
import { Cookie, Stop } from '@mui/icons-material';
import { responsiveProperty } from '@mui/material/styles/cssUtils';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};


const Owner_EKYCBlock = ({ LKRS_ID, ownerName, setIsOwnerEKYCSectionSaved, setValidate_OwnerDataList, landDetails }) => {


    const [phone, setPhone] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(30);
    const [isTimerActive, setIsTimerActive] = useState(false);

    const [showResend, setShowResend] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpInputsRef = useRef([]);
    const [isVerified, setIsVerified] = useState(false);
    const [ekyc_Status, setEKYC_Status] = useState(false);
    const [phone_Status, setPhone_Status] = useState(false)


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
            const phonenumber = "9999999999";
            const response = await sendOtpAPI(phonenumber);

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
            const phonenumber = "9999999999";
            const response = await verifyOtpAPI(phonenumber, enteredOtp);
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
            const phonenumber = "9999999999";
            const response = await sendOtpAPI(phonenumber);
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

    const [selectedOption, setSelectedOption] = useState('owner');
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [createdBy, setCreatedBy] = useState(sessionStorage.getItem('PhoneNumber'));
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');
    const [LKRSID, setLKRSID] = useState('');
    const [localownerName, setLocalOwnerName] = useState('');
    useEffect(() => {
        const storedCreatedBy = sessionStorage.getItem('createdBy');
        const storedCreatedName = sessionStorage.getItem('createdName');
        const storedRoleID = sessionStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);

    }, ["1"]);
    const [localLKRSID, setLocalLKRSID] = useState(() => {
        return sessionStorage.getItem("LKRSID") || "";
    });
    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
            // fetchOwners();
        }
        if (ownerName) {
            setLocalOwnerName(ownerName);
        }
    }, [LKRS_ID]);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [newOwnerName, setNewOwnerName] = useState('');
    const [ownerNameInput, setOwnerNameInput] = useState('');
    const [ownerList, setOwnerList] = useState([]);
    const [loadingOwners, setLoadingOwners] = useState(false);
    const [txnno, setTxnno] = useState('');
    const [ekycData, setEkycData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [ownerData, setOwnerData] = useState(null);

    const [ekyc_Data, setEkyc_Data] = useState(null);

    const [ownerNames, setOwnerNames] = useState('');
    const [transactionNo, setTransactionNo] = useState('');
    const [isPhoneFromAPI, setIsPhoneFromAPI] = useState(false);
    const [isVerifyDisabled, setIsVerifyDisabled] = useState(true);
    const [ownerDataList, setOwnerDataList] = useState([]);

    useEffect(() => {
        // Disable verify button until all OTP digits are entered
        const isComplete = otp.every(digit => digit !== '');
        setIsVerifyDisabled(!isComplete);
    }, [otp]);

    const EKYC_Save = useRef(null);
    useEffect(() => {
        const handleMessage = (event) => {
            // Ensure the message is coming from your domain
            if (event.origin !== `${config.redirectBaseURL}`) return;
            const data = event.data;
            // You can store this in state or use it directly
            setEkyc_Data(data);
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);
    //multiple owner list fetch
    const fetchOwners = async () => {
        try {
            const apiResponse = await ownerEKYC_Details("1", LKRS_ID);

            const owners = (apiResponse || []).map(owner => ({
                name: owner.owN_NAME_EN,
                id: owner.owN_ID,
                phoneNo: owner.owN_MOBILENUMBER,
                ekycStatus: owner.owN_AADHAARVERISTATUS === "Success",
                isCompanyOwned: owner.owN_COMPANYOWNPROPERTY === true,
                companyName: owner.owN_COMPANYNAME || '-',
                additionalInfo: owner.owN_ADDITIONALINFO,
                remarks: owner.owN_REMARKS,
                owN_IDNUMBER: owner.owN_IDNUMBER,
                owN_IDTYPE: owner.owN_IDTYPE,
                owN_COMPANYOWNPROPERTY: owner.owN_COMPANYOWNPROPERTY,
                owN_COMPANYNAME: owner.owN_COMPANYNAME,
                owN_REPRESENTATIVENAME: owner.owN_REPRESENTATIVENAME,
                owN_RELATIONTYPE: owner.owN_RELATIONTYPE,
                owN_RELATIONNAME: owner.owN_RELATIONNAME,
                owN_NAME_KN: owner.owN_NAME_KN,
                owN_VAULT_REMARKS: owner.owN_VAULT_REMARKS,
            }));

            setOwnerList(owners);

            const ownerNameList = owners.map(o => o.name).join(', ');

            setOwnerDataList(apiResponse); // Keep original for insertEKYCDetails
            setOwnerNames(ownerNameList); //  Set comma-separated owner names
            setValidate_OwnerDataList(apiResponse);
            setIsOwnerEKYCSectionSaved(true);
        } catch (error) {
            setOwnerList([]);
            setOwnerNames(''); // fallback if API fails
            setIsOwnerEKYCSectionSaved(false);
        }
    };

    const handleRadioChange = (e) => {
        setSelectedOption(e.target.value);
    };
    const [ekycUrl, setEkycUrl] = useState('');
    const ownerNameInputRef = useRef('');
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== `${config.redirectBaseURL}`) return;
            if (!window.location.pathname.includes("LayoutForm")) return;

            if (event.data.ekycStatus === "Success") {
                if (selectedOwner?.name) {
                    const encodedName = encodeURIComponent(selectedOwner.name);
                    const encodedOwnerNo = encodeURIComponent(selectedOwner.id);
                    fetchEKYC_ResponseDetails(encodedOwnerNo, encodedName, event.data.ekycTxnNo, localLKRSID);
                } else {
                    console.error("No selected owner found.");
                    Swal.fire('Missing Data', 'Please select an owner before starting eKYC.', 'warning');
                    return;
                }

                Swal.fire({
                    title: 'eKYC Result',
                    text: `Status: ${event.data.ekycStatus}`,
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    confirmButtonText: 'OK'
                });
            } else if (event.data.ekycStatus === "Failure") {
                Swal.fire('eKYC Result', `Status: ${event.data.ekycStatus}`, 'error');
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [selectedOwner]);
    //do EKYC API
    const handleDoEKYC = async () => {
        if (!selectedOwner || !selectedOwner.name) {
            Swal.fire('Warning', 'Please select an owner before proceeding with e-KYC.', 'warning');
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
                const OwnerNumber = selectedOwner.id;
                const BOOK_APP_NO = 2;
                const PROPERTY_CODE = 1;
                const redirectSource = "";
                const EkycResponseUrl = `${config.redirectionTypeURL}`;

                // Pass them to your API
                const response = await ekyc_Details({
                    LKRS_ID,
                    OwnerNumber,
                    BOOK_APP_NO,
                    PROPERTY_CODE,
                    redirectSource,
                    EkycResponseUrl
                });

                const resultUrl = response?.ekycRequestUrl;
                sessionStorage.setItem("tranNo", response?.tranNo);
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
                Swal.fire('Error', 'Something went wrong, Please try again later!', 'error');
                console.error('eKYC API call failed:', error);
                stop_loader();
            }
        }
    };
    const fetchEKYC_ResponseDetails = async (ownerNo, ownerName, txnno, localLKRSID) => {
        const transaction_No = sessionStorage.getItem("tranNo");
        
        if (transaction_No === txnno) {
            try {
                // const payload = {
                //     LKRS_ID: LKRS_ID,
                //     OwnerNumber: ownerNo,
                //     transactionNumber: 83,
                //     OwnerType: 'NEWOWNER',
                //     ownName: ownerName,
                //     redirectSource: redirectSource,
                // };
                const transactionNumber = 83;
                const OwnerType = "NEWOWNER";
                const redirectSource = "LYT";



                const response = await ekyc_Response(transactionNumber, OwnerType, ownerName, ownerNo, localLKRSID, redirectSource);
                setOwnerData(response);
                setEKYC_Status(true);


            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {

            }
        } else {

        }

    };
    const insertEKYCDetails = async () => {
        let ownerID = 0;
        let ownerName = "";
        let newOwner;
        let ownerPhoneNo;

        if (!ownerNameInput.trim() || !phone.trim()) {
            Swal.fire({
                text: "Please select an owner and enter the phone number before saving.",
                icon: "warning",
                confirmButtonText: "OK",
            });
            return;
        }

        if (!(ekyc_Status === true && phone_Status === true)) {
            Swal.fire({
                text: "Phone number verification or Owner EKYC is not done",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }




        if (selectedOwner.name && selectedOwner.id) {
            ownerID = selectedOwner.id;
            ownerName = selectedOwner.name;
            ownerPhoneNo = selectedOwner.phoneNo || phone;
            newOwner = false;
        } else { //newly owner sending parameter
            ownerID = 0;
            ownerName = selectedOwner.name;
            newOwner = true;
            ownerPhoneNo = selectedOwner.phoneNo || phone;
        }
const matchedOwner = ownerList.find(owner => owner.id === selectedOwner.id);
        

        const payloadOwner = {
            owN_ID: ownerID,
            owN_LKRS_ID: LKRS_ID,
            owN_NAME_KN: matchedOwner.owN_NAME_KN,
            owN_NAME_EN: matchedOwner.name,
            owN_IDTYPE: matchedOwner.owN_IDTYPE,
            owN_IDNUMBER: matchedOwner.owN_IDNUMBER,
            owN_RELATIONTYPE: matchedOwner.owN_RELATIONTYPE,
            owN_RELATIONNAME: matchedOwner.owN_RELATIONNAME,
            owN_MOBILENUMBER: ownerPhoneNo,
            owN_AADHAARNUMBER: ownerData?.ekycResponse?.maskedAadhaar,
            owN_NAMEASINAADHAAR: ownerData?.ekycResponse?.ownerNameEng,
            owN_AADHAARVERISTATUS: ekyc_Data.ekycStatus,
            owN_NAMEMATCHSCORE: ownerData?.nameMatchScore,
            owN_COMPANYOWNPROPERTY: matchedOwner.owN_COMPANYOWNPROPERTY,
            owN_COMPANYNAME: matchedOwner.owN_COMPANYNAME,
            owN_REPRESENTATIVENAME: matchedOwner.owN_REPRESENTATIVENAME,
            owN_REMARKS: selectedOwner?.remarks,
            owN_ADDITIONALINFO: selectedOwner?.additionalInfo,
            owN_CREATEDBY: createdBy,
            owN_CREATEDNAME: createdName,
            owN_CREATEDROLE: roleID,
            owN_VAULTREFID: ownerData?.ekycResponse?.vaultRefNumber,
            owN_VAULT_REMARKS: matchedOwner.owN_VAULT_REMARKS,
            owN_ALREADYEXIST_INEAASTHI: false,
            owN_AADHAAR_RESPONSE: JSON.stringify(ownerData),
            own_OwnOrRep: selectedOption,
            own_IsNewlyAddedOwner: newOwner,
            own_TransactionNo: ekyc_Data.ekycTxnNo,
        }
        try {
            start_loader();
            const response = await ekyc_insertOwnerDetails(payloadOwner);

            if (response.responseStatus === true) {
                setDisabledEKYCOwners(prev => [...prev, ownerID]);
                const apiResponse = await ownerEKYC_Details("1", LKRS_ID);
                setOwnerDataList(apiResponse);
                Swal.fire({
                    text: response.responseMessage,
                    icon: "success",
                    confirmButtonText: "OK",
                    allowOutsideClick: false, // prevents closing on outside click
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            const response = await ownerEKYC_Details("1", LKRS_ID);
                            setOwnerDataList(response || []);
                            setSelectedOwner(null);
                            setOwnerNameInput('');
                            setPhone('');
                            setIsPhoneFromAPI(false);
                            setIsVerified(false);
                            setOtp(['', '', '', '', '', '']); // if you're using a 6-digit OTP input
                            resetOtpStates();
                        } catch (error) {
                            console.error("Failed to fetch EKYC owner details:", error);
                        }
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
    const buttonRef = useRef(null);
    const [dropdownWidth, setDropdownWidth] = useState('auto');
    useEffect(() => {
        if (buttonRef.current) {
            setDropdownWidth(buttonRef.current.offsetWidth + "px");
        }
    }, [isDropdownOpen]); // update width when dropdown opens
    //Adding new owner name
    const handleAddMoreOwner = () => {
        setShowInput(true);
        setSelectedOwner(null);
        setOwnerNameInput('');
        setPhone('');
        setIsPhoneFromAPI(false);  // ensure input is editable
    };
    const handleAddOwner = async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const trimmedName = newOwnerName.trim();
            if (!trimmedName) {
                Swal.fire({
                    text: "Please enter a valid owner name.",
                    icon: "warning",
                    confirmButtonText: "OK",
                });
                return;
            }

            const payloadOwner = {
                owN_ID: 0,
                owN_LKRS_ID: LKRS_ID,
                owN_NAME_KN: "",
                owN_NAME_EN: trimmedName,
                owN_IDTYPE: "",
                owN_IDNUMBER: "",
                owN_RELATIONTYPE: "",
                owN_RELATIONNAME: "",
                owN_MOBILENUMBER: "",
                owN_AADHAARNUMBER: ownerData?.maskedAadhaar ?? null,
                owN_NAMEASINAADHAAR: ownerData?.ownerNameEng ?? null,
                owN_AADHAARVERISTATUS: "",
                owN_NAMEMATCHSCORE: 0,
                owN_COMPANYOWNPROPERTY: false,
                owN_COMPANYNAME: "",
                owN_REPRESENTATIVENAME: "",
                owN_REMARKS: "",
                owN_ADDITIONALINFO: "",
                owN_CREATEDBY: createdBy,
                owN_CREATEDNAME: createdName,
                owN_CREATEDROLE: roleID,
                owN_VAULTREFID: ownerData?.vaultRefNumber ?? null,
                owN_VAULT_REMARKS: "",
                owN_ALREADYEXIST_INEAASTHI: false,
                owN_AADHAAR_RESPONSE: JSON.stringify(ownerData) ?? null,
                own_OwnOrRep: selectedOption,
                own_IsNewlyAddedOwner: true,
            };

            try {
                start_loader();
                const response = await ekyc_insertOwnerDetails(payloadOwner);

                if (response.responseStatus === true) {
                    Swal.fire({
                        title: response.responseMessage,
                        text: `Owner ID: ${response.own_id}`,
                        icon: "success",
                        confirmButtonText: "OK",
                    });

                    // update owner list with new owner (optional)
                    const newEntry = { id: response.own_id, name: trimmedName };
                    setOwnerList([...ownerList, newEntry]);
                    setSelectedOwner(newEntry);
                    setNewOwnerName("");
                    setShowInput(false);
                    setIsDropdownOpen(false);
                } else {
                    Swal.fire({
                        text: response.responseMessage,
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } catch (error) {
                console.error("API Error:", error);
                Swal.fire({
                    text: "Something went wrong while saving the owner.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            } finally {
                stop_loader();
            }
        }
    };
    const resetOtpStates = () => {
        setIsOtpSent(false);
        setIsVerified(false);
        setShowResend(false);
        setTimer(0);
        setOtp(['', '', '', '', '', '']);
        setIsVerifyDisabled(true);
        setIsTimerActive(false);
    };
    const [disabledEKYCOwners, setDisabledEKYCOwners] = useState([]);
    const [companyName, setCompanyName] = useState('');
    return (
        <div>
            <div className="card"> {loading && <Loader />}
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>Owner/Owner Representative eKYC</h5>
                </div>
                <div className="card-body">
                    <div className='row'>
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                            <label className="form-label">Select Owner / Owner Representative : </label>
                        </div>
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" >
                            <div className="form-check">
                                <input
                                    className="form-check-input radioStyle"
                                    type="radio"
                                    id="ownerRadio"
                                    name="owner"
                                    value="owner"
                                    checked={selectedOption === 'owner'}
                                    onChange={handleRadioChange}
                                />
                                <label className="form-check-label" htmlFor="ownerRadio">Owner</label>
                            </div>
                        </div>
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" >
                            <div className="form-check">
                                <input
                                    className="form-check-input radioStyle"
                                    type="radio"
                                    id="repRadio"
                                    name="Owner_representative"
                                    value="Owner_representative"
                                    checked={selectedOption === 'Owner_representative'}
                                    onChange={handleRadioChange}
                                />
                                <label className="form-check-label" htmlFor="repRadio">Owner Representative</label>
                            </div>
                        </div>


                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-3">
                            <div className='row'>
                                {/* <div className="alert alert-info">Note: Click on eKYC Status button once the ekyc is done to check verification status</div> */}

                                {selectedOption === 'Owner_representative' && (
                                    <>

                                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-2" >
                                            <label className="form-label">Company Name <span className='mandatory_color'>*</span></label>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 mt-2">
                                            <input
                                                type="text"
                                                id="companyName"
                                                className="form-control"
                                                value={companyName}
                                                readOnly
                                            />
                                        </div>
                                    </>
                                )}


                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-2" >
                                    <label className="form-label">Select Owner <span className='mandatory_color'>*</span></label>
                                </div>
                                {/* <div className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 mt-2">
                                    <button
                                        className="form-control text-start"
                                        onClick={() => {
                                            const shouldOpen = !isDropdownOpen;
                                            setIsDropdownOpen(shouldOpen);
                                            if (shouldOpen) {
                                                fetchOwners();
                                            }
                                        }}
                                        ref={buttonRef}  // attach ref here
                                    >
                                        {selectedOwner ? selectedOwner.name : "Select an owner"}
                                    </button>

                                    {isDropdownOpen && (
                                        <ul
                                            className="dropdown-menu show"
                                            style={{
                                                overflowY: "auto",
                                                width: dropdownWidth,
                                                maxHeight: "250px", marginLeft: "13px",
                                            }}
                                        >
                                            {loadingOwners ? (
                                                <li className="px-3 py-2">Loading...</li>
                                            ) : (
                                                ownerList.map((owner, index) => (
                                                    <li key={owner.id || index}>
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                setSelectedOwner(owner);
                                                                setOwnerNameInput(owner.name);
                                                                setPhone(owner.phoneNo || '');
                                                                setIsDropdownOpen(false);
                                                                setIsPhoneFromAPI(!!owner.phoneNo);  // true if phoneNo exists, false if empty
                                                                // RESET OTP RELATED STATES
                                                                setIsOtpSent(false);
                                                                setIsVerified(false);
                                                                setShowResend(false);
                                                                setTimer(0);
                                                                setOtp(['', '', '', '', '', '']);  // Assuming 6-digit OTP
                                                                setIsVerifyDisabled(true);
                                                                setIsTimerActive(false);
                                                            }}
                                                        >
                                                            {owner.name}
                                                        </button>
                                                    </li>
                                                ))
                                            )}

                                            {showInput && (
                                                <li className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Enter owner name"
                                                        value={newOwnerName}
                                                        onChange={(e) => setNewOwnerName(e.target.value)}
                                                        onKeyDown={handleAddOwner}
                                                        autoFocus
                                                    />
                                                </li>
                                            )}

                                            <li>
                                                <button
                                                    className="dropdown-item text-primary"
                                                    onClick={handleAddMoreOwner}
                                                >
                                                    ➕ Add More
                                                </button>
                                            </li>
                                        </ul>

                                    )}
                                </div> */}



                                <div className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 mt-2">
                                    <button
                                        className="form-control text-start"
                                        onClick={() => {
                                            const shouldOpen = !isDropdownOpen;
                                            setIsDropdownOpen(shouldOpen);
                                            if (shouldOpen) {
                                                fetchOwners(); // fetch the owners with updated eKYC status
                                            }
                                        }}
                                        ref={buttonRef}
                                    >
                                        {selectedOwner ? selectedOwner.name : "Select an owner"}
                                    </button>

                                    {isDropdownOpen && (
                                        <ul
                                            className="dropdown-menu show"
                                            style={{
                                                overflowY: "auto",
                                                width: dropdownWidth,
                                                maxHeight: "250px",
                                                marginLeft: "13px",
                                            }}
                                        >
                                            {loadingOwners ? (
                                                <li className="px-3 py-2">Loading...</li>
                                            ) : (
                                                ownerList.map((owner, index) => (
                                                    <li key={owner.id || index}>
                                                        <button
                                                            className="dropdown-item d-flex justify-content-between align-items-center"
                                                            onClick={() => {
                                                                if (owner.ekycStatus) return; // prevent selection if already eKYC done
                                                                setSelectedOwner(owner);
                                                                setOwnerNameInput(owner.name);
                                                                setPhone(owner.phoneNo || '');
                                                                setIsDropdownOpen(false);
                                                                setIsPhoneFromAPI(!!owner.phoneNo);

                                                                // Reset previous owner's state
                                                                setOwnerData(null);
                                                                setEkyc_Data(null);
                                                                setEKYC_Status(false);
                                                                setPhone_Status(false);
                                                                setIsVerified(false);
                                                                resetOtpStates();

                                                                // Set radio option if company owns property
                                                                if (owner.isCompanyOwned) {
                                                                    setSelectedOption('Owner_representative');
                                                                    setCompanyName(owner.companyName);
                                                                } else {
                                                                    setSelectedOption('owner');
                                                                }
                                                            }}
                                                            disabled={owner.ekycStatus}
                                                            style={{
                                                                backgroundColor: owner.ekycStatus ? "#d4edda" : "#fff",
                                                                color: owner.ekycStatus ? "#6c757d" : "#000",
                                                                cursor: owner.ekycStatus ? "not-allowed" : "pointer"
                                                            }}
                                                        >
                                                            <span>{owner.name}</span>
                                                            {owner.ekycStatus && <i className="fa fa-check-circle text-success ms-2"></i>}
                                                        </button>
                                                    </li>
                                                ))
                                            )}

                                            {showInput && (
                                                <li className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Enter owner name"
                                                        value={newOwnerName}
                                                        onChange={(e) => setNewOwnerName(e.target.value)}
                                                        onKeyDown={handleAddOwner}
                                                        autoFocus
                                                    />
                                                </li>
                                            )}
                                            {landDetails === "surveyNo" && (
                                                <li>
                                                    <button className="dropdown-item text-primary" onClick={handleAddMoreOwner}>
                                                        ➕ Add More
                                                    </button>
                                                </li>
                                            )}

                                        </ul>
                                    )}
                                </div>


                                <div className="col-0 col-sm-0 col-md-2 col-lg-2 col-xl-2 mt-2" ></div>

                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-4" >
                                    <label className="form-label">{selectedOption === 'owner' ? "Owner Name" : "Representative Name"}   <span className='mandatory_color'>*</span></label>
                                </div>
                                <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 mt-4" >
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control"
                                        placeholder={selectedOption === 'owner' ? "Enter the Owner Name" : "Enter the Representative Name"}
                                        value={ownerNameInput}
                                    />
                                </div>
                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-4" >

                                    <button
                                        className='btn btn-info btn-block'
                                        onClick={handleDoEKYC}
                                        disabled={
                                            !selectedOwner ||
                                            selectedOwner.ekycStatus ||
                                            disabledEKYCOwners.includes(selectedOwner.id)
                                        }
                                    >
                                        Do eKYC
                                    </button>
                                </div>
                                {/* <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-4" >
                                    <button className='btn btn-info btn-block' onClick={() => fetchEKYC_ResponseDetails()}>eKYC Status</button>
                                </div> */}
                                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-3">
                                    <div className="row mt-3">
                                        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                            <label className="form-label">Phone Number <span className='mandatory_color'>*</span></label>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 mt-3">
                                            <input
                                                type="text"
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                maxLength={10}
                                                className="form-control"
                                                placeholder="Enter the Phone Number"
                                                readOnly={isPhoneFromAPI || isVerified}
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
                                                <button className="btn btn-info btn-block" onClick={handleSendOtp}>
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
                            </div>
                            <div className='row'>
                                <div className="col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10 mt-4" ></div>
                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-4" >
                                    <button className='btn btn-info btn-block' ref={EKYC_Save} onClick={insertEKYCDetails} >Save</button>
                                </div>
                            </div>
                            <br />

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

                            <hr />
                            <div className='row'>
                                <div className='col-12'>
                                    <h5>Owner / Owner Representative EKYC Details</h5>
                                    <table className="table table-striped table-bordered table-hover shadow" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>ಫೋಟೋ / Photo</th>
                                                <th>ಮಾಲೀಕರ ಹೆಸರು / Owner Name</th>
                                                <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಹೆಸರು / EKYC Verified Aadhaar Name</th>
                                                <th>ಇಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿದ ಆಧಾರ್ ಸಂಖ್ಯೆ / EKYC Verified Aadhaar Number</th>
                                                <th>ಲಿಂಗ / Gender</th>
                                                <th>ಹುಟ್ಟಿದ ದಿನಾಂಕ / DOB</th>
                                                <th>ವಿಳಾಸ / Address</th>
                                                <th>ಇಕೆವೈಸಿ ಸ್ಥಿತಿ / EKYC Status</th>
                                                <th>ಹೆಸರು ಹೊಂದಾಣಿಕೆಯ ಸ್ಥಿತಿ / Name Match Status</th>
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
                                                            <td style={{ textAlign: 'center' }}>
                                                                {owner.owN_NAMEMATCHSCORE > 80 ? 'Matched' : 'Not Matched'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Owner_EKYCBlock;