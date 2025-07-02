import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
import DCConversion from './DC_Conversion';
import BDA from './BDA';
import DeclarationBlock from './DeclarationBlock';
import JDA_EKYCBlock from './JDA_EKYCBlock';
import Owner_EKYCBlock from './Owner_EKYCBlock';
import ECDetailsBlock from './ECDetailsBlock';
import Preview_siteDetailsTable from './Preview_siteDetailsTable';
import IndividualGPSBlock from './IndividualGPSBlock';

import usericon from '../../assets/usericon.png';
import { Cookie, Stop } from '@mui/icons-material';
import { responsiveProperty } from '@mui/material/styles/cssUtils';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};


const BBMP_LayoutForm = () => {
    const navigate = useNavigate();
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [zoomLevel] = useState(0.9);
    const [newLanguage, setNewLanguage] = useState(localStorage.getItem('selectedLanguage'));
    const location = useLocation();
    const { LKRSID, DISPLAYLKRSID } = location.state || {};

    const [siteData, setSiteData] = useState([]);
    const [gpsData, setGpsData] = useState({});

    //EPID section disable
    const [isEPIDSectionDisabled, setIsEPIDSectionDisabled] = useState(false);
    const [isSurveyNoSectionDisabled, setIsSurveyNoSectionDisabled] = useState(false);

    const [selectedLandType, setSelectedLandType] = useState("convertedRevenue");

    const [rtc_AddedData, setRtc_AddedData] = useState([]);

    const [approval_details, setApprovalDetails] = useState([]);
    const [order_details, setOrderDetails] = useState([]);

    const [areaSqft, setAreaSqft] = useState("0");
    // const [LKRS_ID, setLKRS_ID] = useState(() => localStorage.getItem("LKRSID") || "");
    const [LKRS_ID, setLKRS_ID] = useState(() => localStorage.getItem("LKRSID") || "");
    const [display_LKRS_ID, setDisplay_LKRS_ID] = useState(() => localStorage.getItem("display_LKRSID") || "");
    const [totalNoofsites, setTotalNoofsites] = useState(0);



    //save button varaiables
    const [isRTCSectionSaved, setIsRTCSectionSaved] = useState(false);
    const [isEPIDSectionSaved, setIsEPIDSectionSaved] = useState(false);
    const [isApprovalSectionSaved, setIsApprovalSectionSaved] = useState(false);
    const [isReleaseSectionSaved, setIsReleaseSectionSaved] = useState(false);
    const [isSitesSectionSaved, setIsSitesSectionSaved] = useState(false);
    const [isECSectionSaved, setIsECSectionSaved] = useState(false);
    const [isOwnerEKYCSectionSaved, setIsOwnerEKYCSectionSaved] = useState(false);
    const [isJDAEKYCSectionSaved, setIsJDAEKYCSectionSaved] = useState(false);

    //OwnerName 
    const [ownerName, setOwnerName] = useState("");
    //fetching ownerDetails
    const [validate_ownerDataList, setValidate_OwnerDataList] = useState([]);

    useEffect(() => {
        document.body.style.zoom = zoomLevel;
    }, [zoomLevel]);

    useEffect(() => {
        const interval = setInterval(() => {
            const storedLang = localStorage.getItem('selectedLanguage') || 'en';
            if (storedLang !== newLanguage) {
                setNewLanguage(storedLang);
            }
        }, 500); // Check every 500ms
        return () => clearInterval(interval); // Cleanup
    }, [newLanguage]);

    const CreatedBy = localStorage.getItem('PhoneNumber');
    const CreatedName = "username";
    const RoleID = "user";

    useEffect(() => {

        // generate_Token();
        localStorage.setItem('createdBy', CreatedBy);
        localStorage.setItem('createdName', CreatedName);
        localStorage.setItem('RoleID', RoleID);

        if (display_LKRS_ID) {
            toast.success(`KRSID: ${display_LKRS_ID}`, {
                autoClose: false,         // Stays open until manually closed
                closeOnClick: false,      // Prevents closing on click
                draggable: false,         // Prevents dragging
                toastId: 'app-number',    // Use a unique ID to prevent duplicates (optional)
            });
        } else if (DISPLAYLKRSID) {
            setDisplay_LKRS_ID(DISPLAYLKRSID);
            toast.success(`KRSID: ${DISPLAYLKRSID}`, {
                autoClose: false,         // Stays open until manually closed
                closeOnClick: false,      // Prevents closing on click
                draggable: false,         // Prevents dragging
                toastId: 'app-number',    // Use a unique ID to prevent duplicates (optional)
            });
        }
        if (LKRS_ID) {
            handleGetLKRSID(LKRS_ID);
        } else if (LKRSID) {
            setLKRS_ID(LKRSID);
            handleGetLKRSID(LKRSID);
        }

    }, [display_LKRS_ID]);


    //fetching Details from LKRSID
    const handleGetLKRSID = async (localLKRSID) => {

        const payload = {
            level: 1,
            LkrsId: localLKRSID,
        };
        try {
            start_loader();
            const response = await fetch_LKRSID(localLKRSID);

            if (response && Object.keys(response).length > 0) {

                // Check the value and update selectedLandType
                if (response.lkrS_LANDTYPE === "surveyNo") {
                    setSelectedLandType("convertedRevenue");
                } else if (response.lkrS_LANDTYPE === "khata") {
                    setSelectedLandType("bbmpKhata");
                }

                stop_loader();
            } else {
                stop_loader();
                console.log("failed to fetch data!")
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to fetch LKRSID data:", error);
        }
    };
    const handleBackToDashboard = (e) => {
        e.preventDefault(); // Prevents the default anchor tag behavior
        navigate("/LayoutDashboard");
    };
    return (
        <>
            {loading && <Loader />}

            <DashboardLayout>

                <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
                    <div className="my-3 my-md-5">
                        <div className="container mt-6">
                            <button
                                onClick={handleBackToDashboard}
                                style={{
                                    position: 'fixed',
                                    bottom: '20px',
                                    left: '20px',
                                    background: 'linear-gradient(45deg, #023e8a, #0077b6)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50px',
                                    padding: '10px 20px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    zIndex: 999,
                                }}
                            >
                                <i className="fa fa-arrow-left" style={{ marginRight: '8px' }}></i>

                            </button>

                            <div className="card">
                                <div className="card-header layout_btn_color" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h5 className="card-title" style={{ margin: 0 }}>Bulk eKhata for layout to Owner / Developer</h5>
                                    <h5 style={{ color: '#fff' }}>KRSID : {display_LKRS_ID}</h5>
                                </div>

                                <div className="card-body">

                                    <div className="row mt-3">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <h6>What is the type of Land on which layout is formed</h6>
                                        </div>

                                        {/* First Radio Button */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-3" >
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    <input
                                                        className="form-check-input radioStyle"
                                                        type="radio"
                                                        name="landType"
                                                        value="convertedRevenue"
                                                        onChange={() => setSelectedLandType("convertedRevenue")}
                                                        checked={selectedLandType === "convertedRevenue"}
                                                        disabled={isEPIDSectionDisabled || isSurveyNoSectionDisabled}
                                                    />
                                                    Converted Revenue Survey Number (No BBMP Khata)
                                                </label>
                                            </div>
                                        </div>
                                        {/* Second Radio Button */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-3">
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    <input
                                                        className="form-check-input radioStyle"
                                                        type="radio"
                                                        name="landType"
                                                        value="bbmpKhata"
                                                        onChange={() => setSelectedLandType("bbmpKhata")}
                                                        checked={selectedLandType === "bbmpKhata"}
                                                        disabled={isEPIDSectionDisabled || isSurveyNoSectionDisabled}
                                                    />
                                                    BBMP A-Khata</label>
                                            </div>
                                        </div>

                                        {/* Section for First Radio Button */}
                                        {/* Section for BBMP A-Khata Selection */}
                                        {selectedLandType === "bbmpKhata" && (
                                            <BBMPKhata onDisableEPIDSection={() => { setIsEPIDSectionDisabled(true); setIsSurveyNoSectionDisabled(true) }} setAreaSqft={setAreaSqft} setLKRS_ID={setLKRS_ID}
                                                LKRS_ID={LKRS_ID} setDisplay_LKRS_ID={setDisplay_LKRS_ID} setIsEPIDSectionSaved={setIsEPIDSectionSaved} setOwnerName={setOwnerName} />
                                        )}

                                        {/* Section for Second Radio Button */}
                                        {selectedLandType === "convertedRevenue" && (
                                            <NoBBMPKhata setAreaSqft={setAreaSqft} Language={newLanguage} rtc_AddedData={rtc_AddedData}
                                                setRtc_AddedData={setRtc_AddedData} setOrderDetails={setOrderDetails}
                                                onDisableEPIDSection={() => { setIsEPIDSectionDisabled(true); setIsSurveyNoSectionDisabled(true) }} LKRS_ID={LKRS_ID}
                                                setDisplay_LKRS_ID={setDisplay_LKRS_ID} setLKRS_ID={setLKRS_ID} setIsRTCSectionSaved={setIsRTCSectionSaved} setOwnerName={setOwnerName} />

                                        )}

                                    </div>
                                </div>
                            </div>
                            {selectedLandType === "convertedRevenue" && (
                                <DCConversion LKRS_ID={LKRS_ID} isRTCSectionSaved={isRTCSectionSaved} isEPIDSectionSaved={isEPIDSectionSaved} />
                            )}


                            <BDA approval_details={approval_details} setApprovalDetails={setApprovalDetails}
                                order_details={order_details} setOrderDetails={setOrderDetails} LKRS_ID={LKRS_ID}
                                isRTCSectionSaved={isRTCSectionSaved} isEPIDSectionSaved={isEPIDSectionSaved} setIsApprovalSectionSaved={setIsApprovalSectionSaved}
                                setIsReleaseSectionSaved={setIsReleaseSectionSaved} setTotalNoofsites={setTotalNoofsites} />

                            <IndividualGPSBlock areaSqft={areaSqft} LKRS_ID={LKRS_ID} createdBy={CreatedBy} createdName={CreatedName} roleID={RoleID} totalNoofsites={totalNoofsites}
                                isRTCSectionSaved={isRTCSectionSaved} isEPIDSectionSaved={isEPIDSectionSaved} setIsSitesSectionSaved={setIsSitesSectionSaved} ownerName={ownerName} />

                            <ECDetailsBlock LKRS_ID={LKRS_ID} isRTCSectionSaved={isRTCSectionSaved} ownerName={ownerName} isEPIDSectionSaved={isEPIDSectionSaved} setIsECSectionSaved={setIsECSectionSaved}
                                setValidate_OwnerDataList={setValidate_OwnerDataList} setIsOwnerEKYCSectionSaved={setIsOwnerEKYCSectionSaved} setIsJDAEKYCSectionSaved={setIsJDAEKYCSectionSaved} />

                            <DeclarationBlock LKRS_ID={LKRS_ID} createdBy={CreatedBy} createdName={CreatedName} roleID={RoleID} display_LKRS_ID={display_LKRS_ID} isRTCSectionSaved={isRTCSectionSaved}
                                isEPIDSectionSaved={isEPIDSectionSaved} isApprovalSectionSaved={isApprovalSectionSaved} isReleaseSectionSaved={isReleaseSectionSaved} validate_ownerDataList={validate_ownerDataList}
                                isSitesSectionSaved={isSitesSectionSaved} isECSectionSaved={isECSectionSaved} isJDAEKYCSectionSaved={isJDAEKYCSectionSaved} isOwnerEKYCSectionSaved={isOwnerEKYCSectionSaved} />
                        </div>

                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
//No BBMP Khata section
const NoBBMPKhata = ({ Language, rtc_AddedData, setRtc_AddedData, onDisableEPIDSection, setAreaSqft, LKRS_ID, setLKRS_ID, setDisplay_LKRS_ID, setIsRTCSectionSaved, setOwnerName }) => {

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [language, setLanguage] = useState(localStorage.getItem("selectedLanguage"));
    const { t, i18n } = useTranslation();
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const [taluks, setTaluks] = useState([]);
    const [selectedTaluk, setSelectedTaluk] = useState("");

    const [hoblis, setHoblis] = useState([]);
    const [selectedHobli, setSelectedHobli] = useState("");

    const [villages, setVillages] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState("");

    const [surveyNumber, setSurveyNumber] = useState("");

    const [surnoc, setSurnoc] = useState('');
    const [surnocOptions, setSurnocOptions] = useState([]);

    const [hissaNo, setHissaNo] = useState('');
    const [hissaOptions, setHissaOptions] = useState([]);
    const [landCode, setLandCode] = useState('');


    const [selectedSurnoc, setSelectedSurnoc] = useState('');
    const [selectedHissaNo, setSelectedHissaNo] = useState('');


    useEffect(() => {
        fetchDistricts(Language);
        if (selectedDistrict) {
            fetchTaluks(selectedDistrict, Language);
        }
    }, [selectedDistrict, Language]);

    // useEffect(() => {
    //     if (selectedDistrict) {
    //         fetchTaluks(selectedDistrict, Language);
    //     }
    // }, [selectedDistrict, Language]);

    const [createdBy, setCreatedBy] = useState(localStorage.getItem('PhoneNumber'));
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');
    const [totalSQFT, setTotalSQFT] = useState('');
    const [localLKRSID, setLocalLKRSID] = useState(LKRS_ID || "");

    useEffect(() => {
        const storedCreatedBy = localStorage.getItem('PhoneNumber');
        const storedCreatedName = localStorage.getItem('createdName');
        const storedRoleID = localStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);

        // if (LKRS_ID) {
        //     handleGetLKRSID(LKRS_ID);
        // }
        if (buttonRef.current) {
            buttonRef.current.click();
        }


    }, [LKRS_ID]);

    const fetch_details = async () => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        if (!localLKRSID) return;
        await delay(1000);
        await handleGetLKRSID(LKRS_ID);
    }


    const [isDistrictReadonly, setIsDistrictReadonly] = useState(false);

    const fetchDistricts = async (newLanguage) => {
        start_loader();
        try {

            const districts = await handleFetchDistricts(newLanguage);
            setDistricts(districts);
            setSelectedDistrict(20);
            setIsDistrictReadonly(true);
            stop_loader();
        } catch (err) {
            console.error("Error fetching districts", err);
            stop_loader();
        } finally {
            stop_loader();
        }
    };
    const fetchTaluks = async (districtCode, Language) => {
        start_loader();
        try {
            const options = await handleFetchTalukOptions(districtCode, language);
            stop_loader();
            setTaluks(options);
        } catch (err) {
            console.error('Failed to load Taluk options:', err);
            stop_loader();
        } finally {
            stop_loader();
        }
    };
    const fetchHoblis = async (districtCode, talukCode, Language) => {
        start_loader();
        try {
            const hobliOptions = await handleFetchHobliOptions(districtCode, talukCode, language);
            setHoblis(hobliOptions);
            stop_loader();
        } catch (err) {
            console.error('Failed to fetch hoblis:', err);
            stop_loader();
        } finally {
            stop_loader();
        }
    };
    const fetchVillages = async (districtCode, talukCode, hobliCode, Language) => {
        start_loader();
        try {
            const villageOptions = await handleFetchVillageOptions(districtCode, talukCode, hobliCode, language);
            setVillages(villageOptions);
            stop_loader();
        } catch (err) {
            console.error('Failed to fetch villages:', err);
            stop_loader();
        } finally {
            stop_loader();
        }
    };
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [rtcAddedData, setRtcAddedData] = useState([]);
    const [rtcData, setRtcData] = useState([]);

    const handleDistrictChange = (e) => {
        const districtCode = e.target.value;


        setSelectedDistrict(districtCode);
        setSelectedTaluk("");
        setSelectedHobli("");
        setSelectedVillage("");
        setTaluks([]);
        setHoblis([]);
        setVillages([]);

        fetchTaluks(districtCode, Language); // Language should be defined
    };
    const handleTalukChange = (e) => {
        const talukCode = e.target.value;
        setSelectedTaluk(talukCode);
        setSelectedHobli('');
        setSelectedVillage('');
        setHoblis([]);        // Clear previous hoblis
        setVillages([]);      // Clear previous villages
        setSurveyNumber('');
        // Reset and disable Surnoc and Hissa
        setSurnocEnabled(false);
        setHissaEnabled(false);
        setSelectedSurnoc('');
        setSelectedHissaNo('');
        setSurnocOptions([]);
        setHissaOptions([]);

        // Fetch hoblis for selected taluk
        fetchHoblis(selectedDistrict, talukCode, Language);
    };
    const handleHobliChange = (e) => {

        const hobliCode = e.target.value;
        setSelectedHobli(hobliCode);
        setSelectedVillage("");
        setVillages([]);
        setSurveyNumber('');

        // Reset and disable Surnoc and Hissa
        setSurnocEnabled(false);
        setHissaEnabled(false);
        setSelectedSurnoc('');
        setSelectedHissaNo('');
        setSurnocOptions([]);
        setHissaOptions([]);

        // Fetch villages for selected hobli
        fetchVillages(selectedDistrict, selectedTaluk, hobliCode, Language);
    };
    const handleVillageChange = (e) => {

        const value = e.target.value;
        setSelectedVillage(value);
        setSurveyNumber(''); // Clear existing survey number

        // Reset and disable Surnoc and Hissa
        setSurnocEnabled(false);
        setHissaEnabled(false);
        setSelectedSurnoc('');
        setSelectedHissaNo('');
        setSurnocOptions([]);
        setHissaOptions([]);
    };
    const handleSurveyNumberChange = (e) => {
        const value = e.target.value;
        if (/^[0-9-/]*$/.test(value)) {  // Only numbers, hyphen, slash
            setSurveyNumber(value);
        }
    };
    const [surnocEnabled, setSurnocEnabled] = useState(false);
    const [hissaEnabled, setHissaEnabled] = useState(false);

    //surveyNo section disabled
    const [isSurveyNoSectionDisabled, setIsSurveyNoSectionDisabled] = useState(false);

    const resetFields = () => {
        setSelectedDistrict('');
        setSelectedTaluk('');
        setSelectedHobli('');
        setSelectedVillage('');
    };
    const handleFetchHissa = () => {
        if (surveyNumber && selectedVillage) {
            fetch_go();
        }
    };

    const fetch_go = async () => {
        start_loader();
        try {
            const hissaData = await handleFetchHissaOptions({
                districtCode: selectedDistrict,
                talukCode: selectedTaluk,
                hobliCode: selectedHobli,
                villageCode: selectedVillage,
                surveyNo: surveyNumber,
            });

            setSelectedSurnoc("");
            setSelectedHissaNo("");
            setSurnocOptions(hissaData.surnocOptions || []);
            setHissaOptions(hissaData.hissaOptions || []);
            setLandCode(hissaData.landCode);

            // Enable Surnoc dropdown, disable Hissa until Surnoc is selected
            setSurnocEnabled(true);
            setHissaEnabled(false);
        } catch (err) {
            console.error("Failed to fetch Hissa data", err);
        } finally {
            stop_loader();
        }
    };

    const viewRTC = async () => {
        // const url = `https://landrecords.karnataka.gov.in/rtconline/About.aspx?dist_code=${selectedDistrict}&taluk_code=${selectedTaluk}&hobli_code=${selectedHobli}&village_code=${selectedVillage}&surveyno=${surveyNumber}&surnoc=${selectedSurnoc}&hissa=${selectedHissaNo}`;
        const url = `https://landrecords.karnataka.gov.in/service2/`;
        window.open(url, '_blank');
    };
    const fetchRTCDetails = async () => {

        if (!selectedDistrict || !selectedTaluk || !selectedHobli || !selectedVillage) {
            setError('Please select all fields (District, Taluk, Hobli, and Village).');
            setShowTable(false);
            return;
        }
        if (!selectedHissaNo || !selectedSurnoc) {
            setError('Please select both Hissa Number and Surnoc.');
            setShowTable(false);
            return;
        }
        try {
            start_loader();
            const result = await fetchRTCDetailsAPI({
                districtCode: selectedDistrict,
                talukCode: selectedTaluk,
                hobliCode: selectedHobli,
                villageCode: selectedVillage,
                landCode: landCode,
            });

            if (result.success) {
                setData(result.data);
                setShowTable(true);
                setError('');
                stop_loader();
            } else {
                setError('Error fetching data: ' + result.message);
                setShowTable(false);
                stop_loader();
            }
        } catch (err) {
            stop_loader();
            console.error('API Error:', err);
            setError('Error: ' + err.message);
            setShowTable(false);
        } finally {
            stop_loader();
        }

    };
    //final RTC details table
    const tableRTCRef = useRef(null);
    //     const handleViewRTC = (item) => {
    //     // Check if the clicked owner is main owner
    //     const isMainOwner = item.ext_acre !== 0 || item.ext_gunta !== 0 || item.ext_fgunta !== 0;

    //     // Filter all owners that belong to the same main_owner_no
    //     const ownersToAdd = isMainOwner
    //         ? data.filter(o => o.main_owner_no === item.main_owner_no)
    //         : [item];  // If joint owner clicked, just add that owner

    //     // Remove duplicates
    //     const newOwners = ownersToAdd.filter((ownerItem) => {
    //         return !rtcAddedData.some(
    //             (data) =>
    //                 data.survey_no === ownerItem.survey_no &&
    //                 data.surnoc === ownerItem.surnoc &&
    //                 data.hissa_no === ownerItem.hissa_no &&
    //                 data.owner === ownerItem.owner &&
    //                 data.father === ownerItem.father
    //         );
    //     });

    //     if (newOwners.length === 0) {
    //         Swal.fire("Duplicate!", "All selected records already exist in the table.", "warning");
    //         return;
    //     }

    //     // Prepare location data
    //     const selectedDistrictObj = districts.find(d => String(d.districT_CODE) === String(selectedDistrict)) || {};
    //     const selectedTalukObj = taluks.find(t => String(t.talukA_CODE) === String(selectedTaluk)) || {};
    //     const selectedHobliObj = hoblis.find(h => String(h.hoblI_CODE) === String(selectedHobli)) || {};
    //     const selectedVillageObj = villages.find(v => String(v.villagE_CODE) === String(selectedVillage)) || {};

    //     const locationData = {
    //         district: selectedDistrictObj.districT_NAME || '',
    //         districtCode: selectedDistrictObj.districT_CODE || '',
    //         taluk: selectedTalukObj.displayName || '',
    //         talukCode: selectedTalukObj.talukA_CODE || '',
    //         hobli: selectedHobliObj.displayName || '',
    //         hobliCode: selectedHobliObj.hoblI_CODE || '',
    //         village: selectedVillageObj.displayName || '',
    //         villageCode: selectedVillageObj.villagE_CODE || ''
    //     };

    //     // Add new owners
    //     const ownersWithLocation = newOwners.map(o => ({
    //         ...o,
    //         ...locationData
    //     }));

    //     setRtcAddedData(prev => [...prev, ...ownersWithLocation]);

    //     toast.success(`${ownersWithLocation.length} record(s) added!`);

    //     setTimeout(() => {
    //         tableRTCRef.current?.scrollIntoView({
    //             behavior: 'smooth',
    //             block: 'nearest',
    //         });
    //     }, 300);
    // };
    const handleViewRTC = (item) => {
        // Always get all owners related to the same main_owner_no
        const ownersToAdd = data.filter(o => o.main_owner_no === item.main_owner_no);

        // Remove duplicates
        const newOwners = ownersToAdd.filter((ownerItem) => {
            return !rtcAddedData.some(
                (data) =>
                    data.survey_no === ownerItem.survey_no &&
                    data.surnoc === ownerItem.surnoc &&
                    data.hissa_no === ownerItem.hissa_no &&
                    data.owner === ownerItem.owner &&
                    data.father === ownerItem.father
            );
        });

        if (newOwners.length === 0) {
            Swal.fire("Duplicate!", "All selected records already exist in the table.", "warning");
            return;
        }

        // Prepare location data
        const selectedDistrictObj = districts.find(d => String(d.districT_CODE) === String(selectedDistrict)) || {};
        const selectedTalukObj = taluks.find(t => String(t.talukA_CODE) === String(selectedTaluk)) || {};
        const selectedHobliObj = hoblis.find(h => String(h.hoblI_CODE) === String(selectedHobli)) || {};
        const selectedVillageObj = villages.find(v => String(v.villagE_CODE) === String(selectedVillage)) || {};

        const locationData = {
            district: selectedDistrictObj.districT_NAME || '',
            districtCode: selectedDistrictObj.districT_CODE || '',
            taluk: selectedTalukObj.displayName || '',
            talukCode: selectedTalukObj.talukA_CODE || '',
            hobli: selectedHobliObj.displayName || '',
            hobliCode: selectedHobliObj.hoblI_CODE || '',
            village: selectedVillageObj.displayName || '',
            villageCode: selectedVillageObj.villagE_CODE || ''
        };

        // Add new owners with location
        const ownersWithLocation = newOwners.map(o => ({
            ...o,
            ...locationData
        }));

        setRtcAddedData(prev => [...prev, ...ownersWithLocation]);

        toast.success(`${ownersWithLocation.length} record(s) added!`);

        setTimeout(() => {
            tableRTCRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }, 300);
    };


    //First block save API
    const handleSaveRTC = async () => {
        if (rtcAddedData.length === 0) {
            Swal.fire("No Data", "Please add at least one record before saving.", "warning");
            return;
        }
        if (totalSqFt === 0) {
            Swal.fire("Area Required", "The area cannot be zero. Please provide a valid area.", "warning");
            return;
        }
        // ✅ Check DC Conversion No
        // if (!dcNumber.trim()) {
        //     Swal.fire("Missing Field", "Please enter DC Conversion Order No.", "warning");
        //     return
        // }
        // if (!uploadedFile) {
        //     Swal.fire("Missing File", "Please upload DC Conversion Order file.", "warning");
        //     return
        // }
        const payload = {
            lkrS_ID: 0,
            lkrS_LANDTYPE: "surveyNo",
            lkrS_EPID: "",
            lkrS_SITEAREA_SQFT: totalSqFt.toFixed(2),
            lkrS_SITEAREA_SQMT: totalSqM.toFixed(2),
            lkrS_REMARKS: "",
            lkrS_ADDITIONALINFO: "",
            lkrS_CREATEDBY: createdBy,
            lkrS_CREATEDNAME: createdName,
            lkrS_CREATEDROLE: roleID,
            khatA_DETAILS: null,
            khatA_OWNER_DETAILS: null,
            surveY_NUMBER_DETAILS: rtcAddedData.map(item => ({
                suR_ID: 0,
                suR_LKRS_ID: 0,
                suR_DISTRICT: item.districtCode,
                suR_TALUK: item.talukCode,
                suR_HOBLI: item.hobliCode,
                suR_VILLAGE: parseInt(item.villageCode),
                suR_SURVEYNO: item.survey_no,
                suR_SURNOC: item.surnoc,
                suR_HISSA: item.hissa_no,
                suR_LANDCODE: item.land_code,
                suR_mainownerno: item.main_owner_no,
                suR_ownerno: item.owner_no,
                suR_OWNERNAME: item.owner,
                suR_EXTACRE: item.ext_acre,
                suR_EXTGUNTA: item.ext_gunta,
                suR_EXTFGUNTA: item.ext_fgunta,
                suR_EXTINSQFT: item.ext_in_sqft,
                suR_EXTINSQMT: item.ext_in_sqmt,
                suR_ISAADHAARSEEDED: 0,
                suR_REMARKS: "",
                suR_ADDITIONALINFO: "",
                suR_CREATEDBY: createdBy,
                suR_CREATEDNAME: createdName,
                suR_CREATEDROLE: roleID
            }))
        };
        //reference error
        // try {
        //     start_loader();
        //     const response = await submitsurveyNoDetails(payload);
        //     if (response.responseStatus === true) {
        //         stop_loader();
        //         localStorage.removeItem('LKRSID');
        //         localStorage.removeItem('display_LKRSID');
        //         localStorage.setItem('LKRSID', response.lkrsid);
        //         localStorage.setItem('display_LKRSID', response.display_LKRSID);
        //         setDisplay_LKRS_ID(response.display_LKRSID);
        //         setLKRS_ID(response.lkrsid);
        //         const ownerNames = rtcAddedData
        //             .map(item => item.owner?.trim())  // Trim each name
        //             .filter(Boolean)                  // Remove empty/null values
        //             .join(', ');                      // Join with comma and space

        //         localStorage.setItem("ownerName", ownerNames);
        //         setOwnerName(ownerNames);
        //         const fetch_payload = {
        //             level: 1,
        //             LkrsId: response.lkrsid,
        //         };
        //         try {
        //             start_loader();
        //             const response_fetch = await fetch_LKRSID(response.lkrsid);

        //             if (response_fetch && response_fetch.surveyNumberDetails && response_fetch.surveyNumberDetails.length > 0) {
        //                 const parsedSurveyDetails = mapSurveyDetails(response_fetch.surveyNumberDetails);

        //                 setRtcAddedData(prev => {
        //                     const existingKeys = new Set(
        //                         prev.map(item => `${item.surveyNumber}_${item.ownerName}`)
        //                     );

        //                     const filteredNewData = parsedSurveyDetails.filter(item => {
        //                         const key = `${item.surveyNumber}_${item.ownerName}`;
        //                         return !existingKeys.has(key);
        //                     });

        //                     return [...prev, ...filteredNewData];
        //                 });
        //                 setIsSurveyNoSectionDisabled(true);
        //                 onDisableEPIDSection();
        //                 setIsRTCSectionSaved(true);
        //                 stop_loader();
        //             } else {
        //                 stop_loader();

        //             }
        //         } catch (error) {
        //             stop_loader();
        //             console.error("Failed to fetch LKRSID data:", error);
        //         }
        //         Swal.fire({
        //             title: response.responseMessage,
        //             // text: response.display_LKRSID,
        //             icon: "success",
        //             confirmButtonText: "OK",
        //         });
        //     } else {
        //         stop_loader();
        //         Swal.fire({
        //             text: response.responseMessage || "Failed to save data",
        //             icon: "error",
        //             confirmButtonText: "OK",
        //         });
        //     }
        // } catch (error) {
        //     stop_loader();
        //     console.error("Failed to insert data:", error);
        // } finally {
        //     stop_loader();
        // }

        try {
            start_loader();
            const saveResponse = await submitsurveyNoDetails(payload);
            if (saveResponse.responseStatus === true) {
                stop_loader();
                localStorage.removeItem('LKRSID');
                localStorage.removeItem('display_LKRSID');
                localStorage.setItem('LKRSID', saveResponse.lkrsid);
                localStorage.setItem('display_LKRSID', saveResponse.display_LKRSID);
                setDisplay_LKRS_ID(saveResponse.display_LKRSID);
                setLKRS_ID(saveResponse.lkrsid);
                const ownerNames = rtcAddedData
                    .map(item => item.owner?.trim())
                    .filter(Boolean)
                    .join(', ');

                localStorage.setItem("ownerName", ownerNames);
                setOwnerName(ownerNames);

                try {
                    start_loader();
                    const fetchResponse = await fetch_LKRSID(saveResponse.lkrsid);

                    if (fetchResponse && fetchResponse.surveyNumberDetails && fetchResponse.surveyNumberDetails.length > 0) {
                        const parsedSurveyDetails = mapSurveyDetails(fetchResponse.surveyNumberDetails);

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
                        setIsSurveyNoSectionDisabled(true);
                        onDisableEPIDSection();
                        setIsRTCSectionSaved(true);
                        stop_loader();
                    } else {
                        stop_loader();
                    }
                } catch (error) {
                    stop_loader();
                    console.error("Failed to fetch LKRSID data:", error);
                }

                Swal.fire({
                    title: saveResponse.responseMessage,
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } else {
                stop_loader();
                Swal.fire({
                    text: saveResponse.responseMessage || "Failed to save data",
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

    };

    const handleAddRTCRow = (apiDataRow) => {
        const selectedDistrictObj = districts.find(item => item.districT_CODE === selectedDistrict) || {};
        const districtName = selectedDistrictObj.districT_NAME || '';
        const districtCode = selectedDistrictObj.districT_CODE || 0;

        const selectedTalukObj = taluks.find(item => item.talukA_CODE === selectedTaluk) || {};
        const talukName = selectedTalukObj.talukA_NAME || '';
        const talukCode = selectedTalukObj.talukA_CODE || 0;

        const selectedHobliObj = hoblis.find(item => item.hoblI_CODE === selectedHobli) || {};
        const hobliName = selectedHobliObj.hoblI_NAME || '';
        const hobliCode = selectedHobliObj.hoblI_CODE || 0;

        const selectedVillageObj = villages.find(item => item.villagE_CODE === selectedVillage) || {};
        const villageName = selectedVillageObj.villagE_NAME || '';
        const villageCode = selectedVillageObj.villagE_CODE || 0;

        const newRow = {
            ...apiDataRow,
            district: districtName,
            districtcode: districtCode,
            taluk: talukName,
            talukCode: talukCode,
            hobli: hobliName,
            hobliCode: hobliCode,
            village: villageName,
            villageCode: villageCode
        };
        setRtcData((prevData) => [...prevData, newRow]);
    };
    let totalAcre = 0;
    let totalGunta = 0;
    let totalFGunta = 0;
    let totalSqFt = 0;
    let totalSqM = 0;

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
            ext_fgunta: item.suR_EXTFGUNTA || 0, // Make sure to handle this if needed
        }));
    };
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


                setIsSurveyNoSectionDisabled(true);
                onDisableEPIDSection();
                setIsRTCSectionSaved(true);
                stop_loader();
            } else {
                stop_loader();
                console.log("failed to fetch data!")
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to fetch LKRSID data:", error);

        }
    };
    //Remove RTC details
    // const handleRemoveRTC = (indexToRemove) => {
    //     setRtcAddedData(prev => prev.filter((_, index) => index !== indexToRemove));
    // };
    const handleRemoveRTC = (rowToRemove) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will remove the owner and all related owners for this main owner!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33"
        }).then((result) => {
            if (result.isConfirmed) {
                setRtcAddedData(prev => prev.filter(item => item.main_owner_no !== rowToRemove.main_owner_no));
                toast.success("Main owner and all related sub-owners removed!");
            }
        });
    };

    const handleView = () => {
        Swal.fire({
            icon: 'info',
            title: 'Implementation in Progress',
            text: 'This feature is under development!',
            confirmButtonText: 'OK'
        });
    };
    const combinedData = [...rtcAddedData, ...rtcData];
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    combinedData.forEach(row => {
        const acre = parseFloat(row.ext_acre || 0);
        const gunta = parseFloat(row.ext_gunta || 0);
        const fgunta = parseFloat(row.ext_fgunta || 0);

        totalAcre += acre;
        totalGunta += gunta;
        totalFGunta += fgunta;

        const sqft = (acre * 43560) + (gunta * 1089) + (fgunta * 68.0625);
        totalSqFt += sqft;
        totalSqM += sqft * 0.092903;

        setAreaSqft(totalSqFt);
        localStorage.setItem('areaSqft', totalSqFt);
    });
    // Normalize fgunta -> gunta and acre
    totalGunta += Math.floor(totalFGunta / 16);
    totalFGunta = totalFGunta % 16;
    totalAcre += Math.floor(totalGunta / 40);
    totalGunta = totalGunta % 40;
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
        setCurrentPage(1); // Reset to first page when page size changes
    };
    const showImplementationAlert = () => {
        if (!dcNumber.trim()) {
            Swal.fire("Missing Field", "Please enter DC Conversion Order No.", "warning");
            return
        }

    };
    const buttonRef = useRef(null);



    const [dcNumber, setDcNumber] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedFileURL, setUploadedFileURL] = useState(null);
    const [errors, setErrors] = useState({
        dcNumber: '',
        file: ''
    });

    const handleDCNumberChange = (e) => {
        setDcNumber(e.target.value);
        setErrors(prev => ({ ...prev, dcNumber: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            if (file.size > 5000 * 1024) {  // 300KB size limit
                setErrors(prev => ({ ...prev, file: 'File size should be less than 5MB.' }));
                setUploadedFile(null);
                setUploadedFileURL(null);
                return;
            }

            setUploadedFile(file);
            setUploadedFileURL(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, file: '' }));
        }
    };


    return (
        <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
            {loading && <Loader />}
            <div className='row mt-5'>

                <button className='btn btn-block' onClick={fetch_details} ref={buttonRef} hidden>Click me</button>
                {/* District */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3" >
                    <label className="form-label">District</label>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)} // Add this

                        className="form-select"
                        disabled={isDistrictReadonly || isSurveyNoSectionDisabled} //  Freeze the dropdown
                    >
                        <option value="" disabled>{t('translation.dropdownValues.district')}</option>
                        {districts
                            .filter(item => item.districT_CODE === 20) //  Only show Bengaluru
                            .map(item => (
                                <option key={item.districT_CODE} value={item.districT_CODE}>
                                    {item.displayName}
                                </option>
                            ))}
                    </select>
                </div>
                {/* Taluk Dropdown */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3"  >
                    <label className="form-label">Taluk</label>
                    <select value={selectedTaluk} onChange={handleTalukChange} className="form-select" disabled={isSurveyNoSectionDisabled}>
                        <option value="" disabled>{t('translation.dropdownValues.taluk')}</option>
                        {taluks.map((item) => (
                            <option key={item.talukA_CODE} value={item.talukA_CODE}>
                                {item.displayName}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Hobli */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3">
                    <label className="form-label">Hobli</label>
                    <select value={selectedHobli} onChange={handleHobliChange} className="form-select" disabled={!selectedTaluk || isSurveyNoSectionDisabled}>
                        <option value="" disabled>{t('translation.dropdownValues.hobli')}</option>
                        {hoblis.map((item) => (
                            <option key={item.hoblI_CODE} value={item.hoblI_CODE}>
                                {item.displayName}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Village */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3">
                    <label className="form-label">Village</label>
                    <select value={selectedVillage} onChange={handleVillageChange} className="form-select" disabled={!selectedHobli || isSurveyNoSectionDisabled}>
                        <option value="" disabled>{t('translation.dropdownValues.village')}</option>
                        {villages.map((item) => (
                            <option key={item.villagE_CODE} value={item.villagE_CODE}>
                                {item.displayName}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Survey Number */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3">
                    <label className="form-label">Survey Number</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Survey Number"
                        value={surveyNumber}
                        onChange={(e) => setSurveyNumber(e.target.value)}
                        disabled={!selectedVillage || isSurveyNoSectionDisabled}
                    />
                </div>
                {/* Go button  */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2 mb-3">
                    <label className="form-label">&nbsp;</label>
                    <button className='btn btn-primary btn-block' disabled={!selectedVillage || !surveyNumber || isSurveyNoSectionDisabled} onClick={handleFetchHissa}>
                        Go
                    </button>
                </div>
                {/* Surnoc */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                    <label className="form-label">Surnoc</label>
                    <select
                        className="form-select"
                        value={selectedSurnoc}
                        onChange={(e) => {
                            setSelectedSurnoc(e.target.value);
                            setHissaEnabled(true); // Enable Hissa dropdown
                        }}
                        disabled={!surnocEnabled || isSurveyNoSectionDisabled}
                    >
                        <option value="" disabled>Select Surnoc</option>
                        {surnocOptions.length > 0
                            ? surnocOptions.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))
                            : <option disabled>{t('translation.dropdownValues.surnoc')}</option>}
                    </select>


                </div>
                {/* Hissa No */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                    <label className="form-label">Hissa Number</label>
                    <select
                        className="form-select"
                        value={selectedHissaNo}
                        onChange={(e) => setSelectedHissaNo(e.target.value)}
                        disabled={!hissaEnabled || isSurveyNoSectionDisabled}
                    >
                        <option value="" disabled>Select Hissa No</option>
                        {hissaOptions.length > 0
                            ? hissaOptions.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))
                            : <option disabled>{t('translation.dropdownValues.hissaNo')}</option>}
                    </select>


                </div>
                {/* Fetch button  */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3">
                    <label className="form-label">&nbsp;</label>
                    <button className='btn btn-primary btn-block' onClick={fetchRTCDetails} disabled={!hissaEnabled || isSurveyNoSectionDisabled}>Fetch</button>
                </div>
                {/* View RTC button */}
                <div className='col-md-2 mb-3'>
                    <label className="form-label">&nbsp;</label>
                    {showTable && (
                        <button className='btn btn-warning btn-block' onClick={viewRTC}>View RTC</button>
                    )}
                </div>

                {/* RTC Land Details Table */}
                {showTable && (
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style={{ display: 'block' }}>
                        <hr />
                        <h4>Revenue Survey Number Details</h4>
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Survey Number / Surnoc / Hissa Number</th>
                                        <th>Owner Name</th>
                                        <th>Father Name</th>
                                        <th>Extent (Acre)</th>
                                        <th>Extent (Gunta)</th>
                                        <th>Extent (Fgunta)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length === 0 ? (
                                        <tr><td colSpan="7">No data available</td></tr>
                                    ) : (
                                        data.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.survey_no} / {item.surnoc} / {item.hissa_no}</td>
                                                <td>{item.owner}</td>
                                                <td>{item.father}</td>
                                                <td>{item.ext_acre}</td>
                                                <td>{item.ext_gunta}</td>
                                                <td>{item.ext_fgunta}</td>
                                                <td>
                                                    <button className='btn btn-primary btn-sm' disabled={isSurveyNoSectionDisabled} onClick={() => handleViewRTC(item)}>Add</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <hr />
                {/* Added RTC Table */}
                {combinedData.length > 0 && (
                    <div className="col-12" ref={tableRTCRef}>
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
                                        <th >Action</th>
                                        <th>S.No</th>
                                        <th>District</th>
                                        <th>Taluk</th>
                                        <th>Hobli</th>
                                        <th>Village</th>
                                        <th>Owner Name</th>
                                        <th>Survey Number / Surnoc / Hissa Number</th>
                                        <th>Extent (Acre.Gunta.Fgunta)</th>
                                        <th>SqFt</th>
                                        <th>SqM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((row, index) => (
                                        <tr key={index}>
                                            <td >
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveRTC(row)}>
                                                    <i className="fa fa-trash" />
                                                </button>
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
                                        <th colSpan={6}></th>
                                        <th colSpan={2} className="text-end fw-bold">Total Area:</th>
                                        <th className="text-left fw-bold" >{`${totalAcre}.${totalGunta}.${totalFGunta}`}</th>
                                        <th className='fw-bold'>{totalSqFt.toFixed(2)}</th>
                                        <th className='fw-bold'>{totalSqM.toFixed(2)}</th>
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


                        <div className="row mt-4">
                            <div className="col-md-10"></div>
                            <div className="col-md-2">
                                <button className="btn btn-success btn-block w-100"
                                    disabled={isSurveyNoSectionDisabled} // <-- disable condition
                                    onClick={handleSaveRTC}>Save and continue</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

    );
};
//BBMP khata section
const BBMPKhata = ({ onDisableEPIDSection, setAreaSqft, LKRS_ID, setLKRS_ID, setDisplay_LKRS_ID, setIsEPIDSectionSaved, setOwnerName }) => {
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [epidNumber, setEpidNumber] = useState("");

    const epidNoRef = useRef(null);
    const buttonRef = useRef(null);
    const [epidshowTable, setEPIDShowTable] = useState(false);
    const [epid_fetchedData, setEPID_FetchedData] = useState(null);


    const [phoneNumbers, setPhoneNumbers] = useState({});
    const [phoneErrors, setPhoneErrors] = useState({});
    const [otpSentIndex, setOtpSentIndex] = useState(null);

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(120);
    const [resendEnabled, setResendEnabled] = useState(false);

    const [otpInputs, setOtpInputs] = useState({});
    const [verifiedNumbers, setVerifiedNumbers] = React.useState({});

    const [isEPIDSectionDisabled, setIsEPIDSectionDisabled] = useState(false);
    const [area_Sqft, setArea_Sqft] = useState();
    const [area_Sqm, setArea_Sqm] = useState();
    const fetchedEPIDData = Array.isArray(epid_fetchedData)
        ? epid_fetchedData
        : [epid_fetchedData];

    useEffect(() => {
        let interval = null;
        if (otpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer <= 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [otpSent, timer]);

    const handlePhoneNumberChange = (e, index) => {
        const value = e.target.value;
        const updatedPhoneNumbers = { ...phoneNumbers };

        if (/^\d{0,10}$/.test(value)) {
            updatedPhoneNumbers[index] = value;
            setPhoneNumbers(updatedPhoneNumbers);

            const updatedErrors = { ...phoneErrors, [index]: '' };
            setPhoneErrors(updatedErrors);
        } else {
            const updatedErrors = { ...phoneErrors, [index]: 'Enter a valid 10-digit number' };
            setPhoneErrors(updatedErrors);
        }
    };

    const handleSendOtp = async (index, row) => {
        const phoneNumber =
            phoneNumbers[index] ??
            row.MobileNumber ??
            epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber ??
            "";

        const phoneRegex = /^[1-9][0-9]{9}$/;

        if (!phoneRegex.test(phoneNumber)) {
            const updatedErrors = {
                ...phoneErrors,
                [index]: "Please enter a valid 10-digit phone number that does not start with zero",
            };
            setPhoneErrors(updatedErrors);
            return;
        }



        const phoneNo = "9999999999";
        start_loader();
        try {
            const response = await sendOtpAPI(phoneNo);

            if (response.responseStatus === true) {
                stop_loader();
                Swal.fire({
                    text: response.responseMessage,
                    icon: "success",
                    timer: 2000,
                    confirmButtonText: "OK",
                })
                setPhoneErrors({ ...phoneErrors, [index]: "" });
                setOtpSentIndex(index);
                setOtpSent(true);
                setTimer(30);
                setResendEnabled(false);

            } else {
                stop_loader();
                Swal.fire({
                    text: "Failed to send OTP. Please try again later.",
                    icon: "error",
                    timer: 2000,
                    confirmButtonText: "OK",
                })
            }
            stop_loader();
        } catch (error) {
            stop_loader();
            console.error("Failed to send OTP:", error);
            // Optional: Handle error in UI
        } finally { stop_loader(); }
    };
    const handleOtpChange = (e, index) => {
        setOtpInputs({ ...otpInputs, [index]: e.target.value });
    };
    const handleVerifyOtp = async (index, row) => {
        const mobileNumber =
            phoneNumbers[index] ??
            row.MobileNumber ??
            epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber ??
            "";

        const otp = otpInputs[index];

        if (!otp || otp.length !== 6) {
            setPhoneErrors((prev) => ({ ...prev, [index]: "Enter a valid 6-digit OTP" }));
            return;
        }

        // Use real mobileNumber and otp here, currently hardcoded for demo
        const phoneno = "9999999999";
        const otp1 = "999999";

        try {
            start_loader();
            const response = await verifyOtpAPI(phoneno, otp);

            if (response.responseStatus === true) {
                stop_loader();
                setVerifiedNumbers((prev) => ({ ...prev, [index]: true }));
                Swal.fire({
                    text: response.responseMessage,
                    icon: "success",
                    timer: 2000,
                    confirmButtonText: "OK",
                })
                toast.success("OTP verified successfully!")
                setPhoneErrors((prev) => ({ ...prev, [index]: "" }));
                setOtpSentIndex(null);
                setTimer(0);
            } else {
                stop_loader();
                setPhoneErrors((prev) => ({
                    ...prev,
                    [index]: response.responseMessage || "OTP verification failed",
                }));
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to verify OTP:", error);
            setPhoneErrors((prev) => ({ ...prev, [index]: "Error verifying OTP" }));
        } finally { stop_loader(); }
    };

    useEffect(() => {
        if (epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber) {
            setPhoneNumbers((prev = []) => {
                const updated = Array.isArray(prev) ? [...prev] : [];
                updated[0] = epid_fetchedData.OwnerDetails[0].mobileNumber;
                return updated;
            });
        }


    }, [epid_fetchedData]);

    const [createdBy, setCreatedBy] = useState(localStorage.getItem('PhoneNumber'));
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');

    useEffect(() => {
        if (area_Sqft && !isNaN(area_Sqft)) {
            const sqm = parseFloat(area_Sqft) * 0.092903;
            setArea_Sqm(sqm.toFixed(2));
        } else {
            setArea_Sqm("");
        }
    }, [area_Sqft]);
    useEffect(() => {
        const storedCreatedBy = localStorage.getItem('createdBy');
        const storedCreatedName = localStorage.getItem('createdName');
        const storedRoleID = localStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);
    }, []);

    const handleResendOtp = async (index, row) => {
        // Reset OTP input & timer as before
        setOtp("");
        setTimer(30);
        setResendEnabled(false);

        // Determine the phone number to resend OTP to (same logic as handleSendOtp)
        const phoneNumber =
            phoneNumbers[index] ??
            row.MobileNumber ??
            epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber ??
            "";

        const phoneRegex = /^[1-9][0-9]{9}$/;

        if (!phoneRegex.test(phoneNumber)) {
            const updatedErrors = {
                ...phoneErrors,
                [index]: "Please enter a valid 10-digit phone number that does not start with zero",
            };
            setPhoneErrors(updatedErrors);
            return;
        }
        const phoneNo = "9999999999";
        try {
            // Call the resend OTP API here (you can use the same sendOtpAPI if it supports resending)
            const response = await sendOtpAPI(phoneNo);

            if (response.responseStatus === true) {
                Swal.fire({
                    text: "OTP resent successfully!",
                    icon: "success",
                    timer: 2000,
                    confirmButtonText: "OK",
                });
                setPhoneErrors({ ...phoneErrors, [index]: "" });
                setOtpSentIndex(index);
                setOtpSent(true);
            } else {
                // Handle failure case (optional)
                Swal.fire({
                    text: response.responseMessage || "Failed to resend OTP",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Failed to resend OTP:", error);
            Swal.fire({
                text: "Error resending OTP. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    const [ownerTableData, setOwnerTableData] = useState([]);

    const handleFetchDetails = async () => {
        start_loader();

        if (!epidNumber.trim()) {
            stop_loader();
            Swal.fire("Error", "Please enter EPID Number!", "error");
            return;
        }

        const epidRegex = /^[1-9][0-9]{9}$/;
        if (!epidRegex.test(epidNumber)) {
            stop_loader();
            Swal.fire("Error", "Please enter a valid 10-digit EPID Number that does not start with 0!", "error");
            return;
        }

        try {
            // localStorage.setItem('isTokenRequired', false);
            const fetchedData = await handleFetchEPIDDetails(epidNumber);

            localStorage.setItem("epid_JSON", JSON.stringify(fetchedData));
            if (fetchedData) {
                const {
                    propertyID,
                    propertyCategory,
                    propertyClassification,
                    wardNumber,
                    wardName,
                    streetName,
                    streetcode,
                    sasApplicationNumber,
                    isMuation,
                    kaveriRegistrationNumber,
                    assessmentNumber,
                    courtStay,
                    enquiryDispute,
                    checkBandi,
                    siteDetails,
                    ownerDetails,
                } = fetchedData;

                //  Safely access and log the first owner's name
                if (Array.isArray(ownerDetails) && ownerDetails.length > 0) {

                } else {
                    console.warn("Owner details array is empty or invalid");
                }
                setOwnerTableData(ownerDetails); // clear table data first
                setEPID_FetchedData({
                    PropertyID: propertyID,
                    PropertyCategory: propertyCategory,
                    PropertyClassification: propertyClassification,
                    WardNumber: wardNumber,
                    WardName: wardName,
                    StreetName: streetName,
                    Streetcode: streetcode,
                    SASApplicationNumber: sasApplicationNumber,
                    IsMuation: isMuation,
                    KaveriRegistrationNumber: kaveriRegistrationNumber,
                    AssessmentNumber: assessmentNumber,
                    courtStay,
                    enquiryDispute,
                    CheckBandi: checkBandi,
                    SiteDetails: siteDetails,
                    OwnerDetails: ownerDetails,
                });
                setAreaSqft(0);
                localStorage.removeItem('areaSqft');
                setAreaSqft(siteDetails.siteArea);
                setArea_Sqft(siteDetails.siteArea);
                localStorage.setItem('areaSqft', siteDetails.siteArea);
                setOwnerTableData(ownerDetails);

                Swal.fire({
                    title: "Success",
                    text: "EPID Details fetched successfully!",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    setEpidNumber("");
                    setEPIDShowTable(true);
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: "EPID is invalid. Please provide a correct EPID",
                    icon: "error",
                    confirmButtonText: "OK",
                    allowOutsideClick: false,    // Prevent clicking outside to close
                    allowEscapeKey: false,       // Prevent pressing ESC to close
                }).then((result) => {
                    if (result.isConfirmed) {
                        // User clicked OK
                        setEpidNumber("");
                        setEPIDShowTable(false);
                        setEPID_FetchedData(false);
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching EPID details:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to fetch EPID Details.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader();
        }

    };

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
            center: true,
            // Access ownerName directly from the 'row' object
            selector: (row) => row.ownerName || 'N/A'
        },

        { name: 'ID Type', width: '120px', selector: () => epid_fetchedData?.OwnerDetails?.[0].idType || 'N/A', center: true },

        { name: 'ID Number', width: '220px', selector: () => epid_fetchedData?.OwnerDetails?.[0].idNumber || 'N/A', center: true },
        // {
        //     name: 'Validate OTP',
        //     width: '250px',
        //     cell: (row, index) => (
        //         <div className='mb-3'><br />
        //             <input
        //                 type="tel"
        //                 className="form-control mb-1"
        //                 placeholder="Mobile Number"
        //                 readOnly
        //                 value={
        //                     phoneNumbers[index] ??
        //                     row.MobileNumber ??
        //                     epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber ??
        //                     ""
        //                 }
        //                 onChange={(e) => handlePhoneNumberChange(e, index)}
        //                 maxLength={10}
        //                 disabled={otpSentIndex === index}
        //             />
        //             {phoneErrors[index] && (
        //                 <label className="text-danger">{phoneErrors[index]}</label>
        //             )}

        //             {/* Show "PHONE NUMBER VERIFIED" if this index is verified */}
        //             {verifiedNumbers[index] ? (
        //                 <div className="text-success font-weight-bold mt-2">
        //                     OTP Verified <i className="fa fa-check-circle"></i>
        //                 </div>
        //             ) : (
        //                 // Else show OTP input, verify button, and timer or resend button
        //                 otpSentIndex !== index ? (
        //                     <button
        //                         className="btn btn-primary btn-sm mt-1"
        //                         onClick={() => handleSendOtp(index, row)}
        //                     >
        //                         Send OTP
        //                     </button>
        //                 ) : (
        //                     <>
        //                         <div className="mb-1">
        //                             <div className="input-group">
        //                                 <input
        //                                     type="text"
        //                                     className="form-control"
        //                                     placeholder="Enter OTP"
        //                                     value={otpInputs[index] || ""}
        //                                     onChange={(e) => handleOtpChange(e, index)}
        //                                     maxLength={6}
        //                                 />
        //                             </div>
        //                             <button
        //                                 className="btn btn-success btn-sm mt-2"
        //                                 disabled={timer <= 0}
        //                                 onClick={() => handleVerifyOtp(index, row)}
        //                             >
        //                                 Verify OTP
        //                             </button>
        //                         </div>
        //                         {timer > 0 ? (
        //                             <p className="text-danger mb-0">Resend OTP in: {timer}s</p>
        //                         ) : (
        //                             <button
        //                                 className="btn btn-warning btn-sm"
        //                                 onClick={() => handleResendOtp(index, row)}
        //                             >
        //                                 Resend OTP
        //                             </button>
        //                         )}
        //                     </>
        //                 )
        //             )}
        //         </div>
        //     ), center: true
        // }
    ];
    const [localLKRSID, setLocalLKRSID] = useState(LKRS_ID || "");
    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
            handleGetLKRSID(LKRS_ID);
            // if (buttonRef.current) {
            //     buttonRef.current.click();
            // }
        }
    }, [LKRS_ID]);
    // useEffect(() => {
    //     if (localLKRSID) {
    //         handleGetLKRSID(localLKRSID);
    //     }
    // }, [localLKRSID]);
    //fetching Details from LKRSID
    const handleGetLKRSID = async (localLKRSID, index = null) => {
        const payload = {
            level: 1,
            LkrsId: localLKRSID,
        };
        try {
            start_loader();
            const response = await fetch_LKRSID(localLKRSID);

            if (response && response.khataDetails != null && response.khataOwnerDetails != null) {
                // The API returns data as per your example:
                // You want to set EPID_FetchedData based on the response structure

                // Parse khataDetails.khatA_JSON if needed (it's a JSON string with property details)
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
                    setAreaSqft(khataDetailsJson.siteDetails.siteArea);
                    localStorage.setItem('areaSqft', khataDetailsJson.siteDetails.siteArea);
                } else {
                    setAreaSqft(0);
                    localStorage.removeItem('areaSqft');
                }

                setOwnerTableData(khataDetailsJson.ownerDetails || []);
                setIsEPIDSectionDisabled(true);
                setEPIDShowTable(true);
                onDisableEPIDSection();
                setIsEPIDSectionSaved(true);

                setOwnerTableData(khataDetailsJson.ownerDetails || []);

                //  Mark all owners as OTP verified if OwnerDetails is present
                if (Array.isArray(khataDetailsJson.ownerDetails)) {
                    const verified = {};
                    khataDetailsJson.ownerDetails.forEach((_, idx) => {
                        verified[idx] = true;
                    });
                    setVerifiedNumbers(verified);
                }
            } else {
                setEPIDShowTable(false);
                setEPID_FetchedData(null);
                setOwnerTableData([]);
                setAreaSqft(0);
                localStorage.removeItem('areaSqft');
            }
        } catch (error) {
            console.error("Failed to fetch LKRSID data:", error);

        } finally {
            stop_loader();
        }
    };
    const handleSaveAndProceed = async (epidNumber) => {
        // const totalRows = fetchedEPIDData?.[0]?.OwnerDetails?.length;

        // if (totalRows > 0) {
        //     for (let i = 0; i < totalRows; i++) {
        //         if (!verifiedNumbers[i]) {
        //             Swal.fire({
        //                 icon: 'error',
        //                 title: 'OTP Not Verified',
        //                 text: `Please verify OTP for record #${i + 1} before proceeding.`,
        //             });
        //             return;
        //         }
        //     }
        // }

        const storedData = localStorage.getItem("epid_JSON");
        let parsedData = storedData ? JSON.parse(storedData) : "";

        const payload = {
            lkrS_ID: 0,
            lkrS_LANDTYPE: "khata",
            lkrS_EPID: epid_fetchedData?.PropertyID, // Use epid_fetchedData
            lkrS_SITEAREA_SQFT: area_Sqft,
            lkrS_SITEAREA_SQMT: area_Sqm,
            lkrS_REMARKS: "",
            lkrS_ADDITIONALINFO: "",
            lkrS_CREATEDBY: createdBy,
            lkrS_CREATEDNAME: createdName,
            lkrS_CREATEDROLE: roleID,
            khatA_DETAILS: {
                khatA_ID: 0,
                khatA_LKRS_ID: 0,
                khatA_EPID: epid_fetchedData?.PropertyID, // Use epid_fetchedData
                khatA_JSON: storedData,
                khatA_TYPE: "A-Khata",
                khatA_REMARKS: "",
                khatA_ADDITIONALINFO: "",
                khatA_CREATEDBY: createdBy,
                khatA_CREATEDNAME: createdName,
                khatA_CREATEDROLE: roleID
            },
            // CHANGE THIS LINE: Use epid_fetchedData.OwnerDetails
            khatA_OWNER_DETAILS: epid_fetchedData?.OwnerDetails.map(owner => ({
                owN_ID: 0,
                owN_LKRS_ID: 0,
                owN_NAME_KN: owner.owN_NAME_KN || "",
                owN_NAME_EN: owner.ownerName || "",
                owN_IDTYPE: owner.idType || "",
                owN_IDNUMBER: owner.idNumber || "",
                owN_RELATIONTYPE: owner.owN_RELATIONTYPE || "",
                owN_RELATIONNAME: owner.owN_RELATIONNAME || "",
                owN_MOBILENUMBER: owner.mobileNumber || "",
                owN_REMARKS: "",
                owN_ADDITIONALINFO: "",
                owN_CREATEDBY: createdBy,
                owN_CREATEDNAME: createdName,
                owN_CREATEDROLE: roleID,
                owN_VAULTREFID: "",
                owN_VAULT_REMARKS: "",
                owN_ALREADYEXIST_INEAASTHI: false,
                owN_AADHAAR_RESPONSE: "",
                own_OwnOrRep: "",
                own_IsNewlyAddedOwner: false,
            })),
            surveY_NUMBER_DETAILS: null
        };
        try {
            start_loader();
            const response = await submitEPIDDetails(payload);

            if (response.responseStatus === true) {
                stop_loader();
                localStorage.removeItem('LKRSID');
                localStorage.setItem('LKRSID', response.lkrsid);
                localStorage.removeItem('display_LKRSID');
                localStorage.setItem('display_LKRSID', response.display_LKRSID);
                setDisplay_LKRS_ID(response.display_LKRSID);
                setLKRS_ID(response.lkrsid);

                const ownerDetails = epid_fetchedData?.OwnerDetails; // Use epid_fetchedData here too
                if (Array.isArray(ownerDetails) && ownerDetails.length > 0) {
                    const ownerNames = ownerDetails
                        .map(owner => owner.ownerName?.trim())
                        .filter(Boolean)
                        .join(', ');
                    localStorage.setItem("ownerName", ownerNames);
                    setOwnerName(ownerNames);
                } else {
                    console.warn("Owner details array is empty or invalid");
                    setOwnerName("");
                }
                Swal.fire({
                    title: response.responseMessage,
                    // text: response.display_LKRSID,
                    icon: "success",
                    confirmButtonText: "OK",
                });

                setIsEPIDSectionDisabled(true);
                onDisableEPIDSection();
                setIsEPIDSectionSaved(true);


            } else {
                stop_loader();
                Swal.fire({
                    text: response.responseMessage || "Failed to resend OTP",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to insert a data:", error);
        } finally { stop_loader(); }
    };
    const showImplementationAlert = () => {
        Swal.fire({
            title: 'Coming Soon!',
            text: 'Implementation is in progress.',
            icon: 'info',
            confirmButtonText: 'OK'
        });
    };

    return (
        <div className="row g-3">
            {loading && <Loader />}
            <button className='btn btn-block' onClick={handleGetLKRSID} ref={buttonRef} hidden>Click me</button>
            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4  mt-3">
                <div className="form-group mt-2">
                    <label className='form-label'>Enter EPID of eKhata of A-property <span className='mandatory_color'>*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        value={epidNumber} ref={epidNoRef}
                        onChange={(e) => {
                            const onlyNums = e.target.value.replace(/\D/g, ""); // remove non-numeric chars
                            setEpidNumber(onlyNums);
                        }}
                        placeholder="Enter EPID of eKhata of A-property"
                        maxLength={10} disabled={isEPIDSectionDisabled} // <-- disable condition
                    />

                </div>
            </div>
            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4  mt-4">
                <div className="form-group mt-5">
                    <label></label>
                    <button className="btn btn-primary mt-2" onClick={handleFetchDetails}
                        disabled={isEPIDSectionDisabled} // <-- disable condition
                    >
                        Fetch Details
                    </button>
                </div>
            </div>



            {/* Table Section */}
            {epidshowTable && epid_fetchedData && (
                <div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-3">
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
                    <div className='row'>
                        <div className="col-0 col-sm-0 col-md-8 col-lg-8 col-xl-8 "></div>
                        <div className="col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2 ">
                            <div className="form-group">
                                <label></label>

                            </div>
                        </div>
                        <div className="col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2">
                            <div className="form-group">
                                <label></label>
                                <button className='btn btn-success btn-block' disabled={isEPIDSectionDisabled} onClick={() => handleSaveAndProceed(epidNumber)}>Save and continue</button>
                            </div>
                        </div>
                    </div>
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
                            <button className='btn btn-warning' onClick={showImplementationAlert} style={{ flexShrink: 0 }}>View eKhata</button>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Property ID</th>
                                    <th>Property Category</th>
                                    <th>Property Classification</th>
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
                                    <td>{epid_fetchedData.WardName}</td>
                                    <td>{epid_fetchedData.StreetName}</td>
                                </tr>
                                <tr>
                                    <th>Street Code</th>
                                    <th>SAS Application Number</th>
                                    <th>Is Mutation</th>
                                    <th>Assessment Number</th>
                                    <th>Court Stay</th>
                                    <th>Enquiry Dispute</th>
                                </tr>
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
                                    <td>{epid_fetchedData.CheckBandi.north}</td>
                                    <td>{epid_fetchedData.CheckBandi.south}</td>
                                    <td>{epid_fetchedData.CheckBandi.east}</td>
                                    <td>{epid_fetchedData.CheckBandi.west}</td>
                                </tr>
                            </tbody>
                        </table>

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
                                    <td>{epid_fetchedData.SiteDetails.siteArea}</td>
                                    <td>{epid_fetchedData.SiteDetails.dimensions.eastWest}</td>
                                    <td>{epid_fetchedData.SiteDetails.dimensions.northSouth}</td>
                                </tr>
                            </tbody>
                        </table>

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
                                {epid_fetchedData.OwnerDetails.map((owner, index) => (
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




        </div>
    );
};

export default BBMP_LayoutForm;



