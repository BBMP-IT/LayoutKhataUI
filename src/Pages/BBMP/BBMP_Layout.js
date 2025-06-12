import React, { useEffect, useState, useRef } from 'react';
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
    individualSiteAPI, individualSiteListAPI, fetchECDetails, fetchDeedDocDetails, fetchDeedDetails, fetchJDA_details, deleteSiteInfo, fetch_LKRSID
} from '../../API/authService';

import usericon from '../../assets/usericon.png';
import { Cookie } from '@mui/icons-material';
import { responsiveProperty } from '@mui/material/styles/cssUtils';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};


const BBMP_LayoutForm = () => {

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [zoomLevel] = useState(0.9);
    const [newLanguage, setNewLanguage] = useState(localStorage.getItem('selectedLanguage'));

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
    const [LKRS_ID, setLKRS_ID] = useState(() => localStorage.getItem("LKRSID") || "");
    const [display_LKRSID, setDisplay_LKRSID] = useState("");

    //save button varaiables
    const [isRTCSectionSaved, setIsRTCSectionSaved] = useState(false);
    const [isEPIDSectionSaved, setIsEPIDSectionSaved] = useState(false);



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

    const CreatedBy = 1;
    const CreatedName = "username";
    const RoleID = "user";

    useEffect(() => {
        generate_Token();
        localStorage.setItem('createdBy', CreatedBy);
        localStorage.setItem('createdName', CreatedName);
        localStorage.setItem('RoleID', RoleID);

        if (display_LKRSID) {
            toast.success(`Application Number: ${display_LKRSID}`, {
                autoClose: false,         // Stays open until manually closed
                closeOnClick: false,      // Prevents closing on click
                draggable: false,         // Prevents dragging
                toastId: 'app-number',    // Use a unique ID to prevent duplicates (optional)
            });
        }
        if (LKRS_ID) {
            handleGetLKRSID(LKRS_ID);
        }

    }, [display_LKRSID]);

    const generate_Token = async () => {
        try {
            const response = await getAccessToken();
            localStorage.setItem('access_token', response.access_token);
        } catch (err) {
            console.error("Error fetching districts", err);
        } finally {

        }
    };

    //fetching Details from LKRSID
    const handleGetLKRSID = async (localLKRSID) => {
        const payload = {
            level: 1,
            LkrsId: localLKRSID,
        };
        try {
            start_loader();
            const response = await fetch_LKRSID(payload);

            if (response) {
                console.log("firstblock", response);

                // Check the value and update selectedLandType
                if (response.lkrS_LANDTYPE === "surveyNo") {
                    setSelectedLandType("convertedRevenue");
                } else if (response.lkrS_LANDTYPE === "khata") {
                    setSelectedLandType("bbmpKhata");
                }

                stop_loader();
            } else {
                stop_loader();
                Swal.fire({
                    text: "No survey details found12",
                    icon: "warning",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to fetch LKRSID data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.Lkrsid",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    return (
        <>
            {loading && <Loader />}

            <DashboardLayout>

                <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
                    <div className="my-3 my-md-5">
                        <div className="container mt-6">
                            <div className="card">
                                <div className="card-header layout_btn_color" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h5 className="card-title" style={{ margin: 0 }}>Bulk eKhata for layout to owner / developer</h5>
                                    <h5 style={{ color: '#fff' }}>Application Number: {display_LKRSID}</h5>
                                </div>

                                <div className="card-body">
                                    <div className="row">
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
                                                    Converted Revenue Survey No (No BBMP Khata)
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
                                                LKRS_ID={LKRS_ID} setDisplay_LKRSID={setDisplay_LKRSID} setIsEPIDSectionSaved={setIsEPIDSectionSaved} />
                                        )}

                                        {/* Section for Second Radio Button */}
                                        {selectedLandType === "convertedRevenue" && (
                                            <NoBBMPKhata setAreaSqft={setAreaSqft} Language={newLanguage} rtc_AddedData={rtc_AddedData}
                                                setRtc_AddedData={setRtc_AddedData} setOrderDetails={setOrderDetails}
                                                onDisableEPIDSection={() => { setIsEPIDSectionDisabled(true); setIsSurveyNoSectionDisabled(true) }} LKRS_ID={LKRS_ID}
                                                setDisplay_LKRSID={setDisplay_LKRSID} setLKRS_ID={setLKRS_ID} setIsRTCSectionSaved={setIsRTCSectionSaved} />
                                        )}

                                    </div>
                                </div>
                            </div>

                            <BDA approval_details={approval_details} setApprovalDetails={setApprovalDetails}
                                order_details={order_details} setOrderDetails={setOrderDetails} LKRS_ID={LKRS_ID}
                                isRTCSectionSaved={isRTCSectionSaved} isEPIDSectionSaved={isEPIDSectionSaved} />

                            <IndividualGPSBlock areaSqft={areaSqft} LKRS_ID={LKRS_ID} createdBy={CreatedBy} createdName={CreatedName} roleID={RoleID} isRTCSectionSaved={isRTCSectionSaved} isEPIDSectionSaved={isEPIDSectionSaved} />

                            <ECDetailsBlock LKRS_ID={LKRS_ID} isRTCSectionSaved={isRTCSectionSaved} isEPIDSectionSaved={isEPIDSectionSaved} />

                            <DeclarationBlock LKRS_ID={LKRS_ID} createdBy={CreatedBy} createdName={CreatedName} roleID={RoleID} />
                        </div>

                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
//No BBMP Khata section
const NoBBMPKhata = ({ Language, rtc_AddedData, setRtc_AddedData, onDisableEPIDSection, setAreaSqft, LKRS_ID, setLKRS_ID, setDisplay_LKRSID, setIsRTCSectionSaved }) => {

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
    }, [Language]);

    useEffect(() => {
        if (selectedDistrict) {
            fetchTaluks(selectedDistrict, Language);
        }
    }, [selectedDistrict, Language]);

    const [createdBy, setCreatedBy] = useState(null);
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');
    const [totalSQFT, setTotalSQFT] = useState('');
    useEffect(() => {
        const storedCreatedBy = localStorage.getItem('createdBy');
        const storedCreatedName = localStorage.getItem('createdName');
        const storedRoleID = localStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);
    }, []);

    const [isDistrictReadonly, setIsDistrictReadonly] = useState(false);

    const fetchDistricts = async (newLanguage) => {

        try {
            const districts = await handleFetchDistricts(newLanguage);
            setDistricts(districts);
            setSelectedDistrict(20);
            setIsDistrictReadonly(true);

        } catch (err) {
            console.error("Error fetching districts", err);

        } finally {
        }
    };
    const fetchTaluks = async (districtCode, Language) => {
        try {
            const options = await handleFetchTalukOptions(districtCode, language);
            setTaluks(options);
        } catch (err) {
            console.error('Failed to load Taluk options:', err);

        } finally {
        }
    };
    const fetchHoblis = async (districtCode, talukCode, Language) => {

        try {
            const hobliOptions = await handleFetchHobliOptions(districtCode, talukCode, language);
            setHoblis(hobliOptions);

        } catch (err) {
            console.error('Failed to fetch hoblis:', err);

        } finally {

        }
    };
    const fetchVillages = async (districtCode, talukCode, hobliCode, Language) => {
        try {
            const villageOptions = await handleFetchVillageOptions(districtCode, talukCode, hobliCode, language);
            setVillages(villageOptions);

        } catch (err) {
            console.error('Failed to fetch villages:', err);
        } finally {
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
    const handleViewRTC = (item) => {
        const exists = rtcAddedData.some(
            (data) =>
                data.survey_no === item.survey_no &&
                data.surnoc === item.surnoc &&
                data.hissa_no === item.hissa_no &&
                data.owner === item.owner &&
                data.father === item.father
        );

        if (exists) {
            Swal.fire("Duplicate!", "This record already exists in the table.", "warning");
        } else {
            const selectedDistrictObj = districts.find(
                d => String(d.districT_CODE) === String(selectedDistrict)
            ) || {};

            const districtName = selectedDistrictObj.districT_NAME || '';
            const districtCode = selectedDistrictObj.districT_CODE || '';

            const selectedTalukObj = taluks.find(
                t => String(t.talukA_CODE) === String(selectedTaluk)
            ) || {};

            const talukName = selectedTalukObj.displayName || '';
            const talukCode = selectedTalukObj.talukA_CODE || '';

            const selectedHobliObj = hoblis.find(
                h => String(h.hoblI_CODE) === String(selectedHobli)
            ) || {};

            const hobliName = selectedHobliObj.displayName || '';
            const hobliCode = selectedHobliObj.hoblI_CODE || '';

            const selectedVillageObj = villages.find(
                v => String(v.villagE_CODE) === String(selectedVillage)
            ) || {};

            const villageName = selectedVillageObj.displayName || '';
            const villageCode = selectedVillageObj.villagE_CODE || '';

            const itemWithLocation = {
                ...item,
                district: districtName,
                districtCode: districtCode,
                taluk: talukName,
                talukCode: talukCode,
                hobli: hobliName,
                hobliCode: hobliCode,
                village: villageName,
                villageCode: villageCode
            };

            setRtcAddedData((prev) => [...prev, itemWithLocation]);

            // ✅ Show success toast
            toast.success("Record Added!");


            // ✅ Scroll to the added table
            setTimeout(() => {
                tableRTCRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });

            }, 300);
        }
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
        // Correct state update to flatten array items
        setRtc_AddedData([...rtc_AddedData, ...rtcAddedData]);
        const payload = {
            lkrS_ID: 0,
            lkrS_LANDTYPE: "surveyNo",
            lkrS_EPID: "9999999999",
            lkrS_SITEAREA_SQFT: 0,
            lkrS_SITEAREA_SQMT: 0,
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

        try {
            start_loader();
            const response = await submitsurveyNoDetails(payload);
            if (response.responseStatus === true) {
                stop_loader();
                localStorage.removeItem('LKRSID');
                localStorage.setItem('LKRSID', response.lkrsid);
                setDisplay_LKRSID(response.display_LKRSID);
                setLKRS_ID(response.lkrsid);
                setIsSurveyNoSectionDisabled(true);
                onDisableEPIDSection();
                setIsRTCSectionSaved(true);
                Swal.fire({
                    title: response.responseMessage,
                    text: response.display_LKRSID,
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } else {
                stop_loader();
                Swal.fire({
                    text: response.responseMessage || "Failed to save data",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to insert data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.1",
                icon: "error",
                confirmButtonText: "OK",
            });
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
    const [localLKRSID, setLocalLKRSID] = useState(LKRS_ID || "");
    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        }
    }, [LKRS_ID]);
    useEffect(() => {
        if (localLKRSID) {
            handleGetLKRSID(localLKRSID);
        }
    }, [localLKRSID]);
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
            ext_fgunta: item.suR_EXTFgunta || 0, // Make sure to handle this if needed
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
            const response = await fetch_LKRSID(payload);

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

            }
        } catch (error) {
            stop_loader();
            console.error("Failed to fetch LKRSID data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.Lkrsid",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };
    //Remove RTC details
    const handleRemoveRTC = (indexToRemove) => {
        setRtcAddedData(prev => prev.filter((_, index) => index !== indexToRemove));
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
        console.log("sqftRounded", totalSqFt);
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
        Swal.fire({
            title: 'Coming Soon!',
            text: 'Implementation is in progress.',
            icon: 'info',
            confirmButtonText: 'OK'
        });
    };

    return (
        <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
            {loading && <Loader />}
            <div className='row mt-5'>

                {/* District */}
                <div className="col-12 col-sm-12 col-md-6 col-lg-2 col-xl-2  mb-3" >
                    <label className="form-label">District</label>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)} // ✅ Add this

                        className="form-select"
                        disabled={isDistrictReadonly || isSurveyNoSectionDisabled} // ✅ Freeze the dropdown
                    >
                        <option value="" disabled>{t('translation.dropdownValues.district')}</option>
                        {districts
                            .filter(item => item.districT_CODE === 20) // ✅ Only show Bengaluru
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
                    <label className="form-label">Hissa No</label>
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
                    <button className='btn btn-primary btn-block' onClick={fetchRTCDetails} disabled={isSurveyNoSectionDisabled}>Fetch</button>
                </div>
                {/* View RTC button */}
                <div className='col-md-2 mb-3'>
                    <label className="form-label">&nbsp;</label>
                    {showTable && (
                        <button className='btn btn-warning btn-block' onClick={showImplementationAlert}>View RTC</button>
                    )}
                </div>

                {/* RTC Land Details Table */}
                {showTable && (
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style={{ display: 'block' }}>
                        <hr />
                        <h4>Revenue Survey No Details</h4>
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Survey No/Surnoc/Hissa No</th>
                                        <th>Owner</th>
                                        <th>Father</th>
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
                                                <td>{item.survey_no}/{item.surnoc}/{item.hissa_no}</td>
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
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveRTC(index + (currentPage - 1) * rowsPerPage)}>
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
                                            <th colSpan={5}></th>
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

                            <div className="row mt-4">
                                <div className="col-md-10"></div>
                                <div className="col-md-2">
                                    <button className="btn btn-success btn-block w-100"
                                        disabled={isSurveyNoSectionDisabled} // <-- disable condition
                                        onClick={handleSaveRTC}>Save and continue</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

    );
};
//BBMP khata section
const BBMPKhata = ({ onDisableEPIDSection, setAreaSqft, LKRS_ID, setLKRS_ID, setDisplay_LKRSID, setIsEPIDSectionSaved }) => {
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [epidNumber, setEpidNumber] = useState("");

    const epidNoRef = useRef(null);

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

    const [createdBy, setCreatedBy] = useState(null);
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');

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
            localStorage.setItem('isTokenRequired', false);
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

                // ✅ Safely access and log the first owner's name
                if (Array.isArray(ownerDetails) && ownerDetails.length > 0) {

                } else {
                    console.warn("Owner details array is empty or invalid");
                }
                setOwnerTableData([]); // clear table data first
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
                localStorage.setItem('areaSqft', siteDetails.siteArea);
                console.log("siteDetails.siteArea", siteDetails.siteArea);
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
                        onChange={(e) => handlePhoneNumberChange(e, index)}
                        maxLength={10}
                        disabled={otpSentIndex === index}
                    />
                    {phoneErrors[index] && (
                        <label className="text-danger">{phoneErrors[index]}</label>
                    )}

                    {/* Show "PHONE NUMBER VERIFIED" if this index is verified */}
                    {verifiedNumbers[index] ? (
                        <div className="text-success font-weight-bold mt-2">
                            OTP Verified <i className="fa fa-check-circle"></i>
                        </div>
                    ) : (
                        // Else show OTP input, verify button, and timer or resend button
                        otpSentIndex !== index ? (
                            <button
                                className="btn btn-primary btn-sm mt-1"
                                onClick={() => handleSendOtp(index, row)}
                            >
                                Send OTP
                            </button>
                        ) : (
                            <>
                                <div className="mb-1">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter OTP"
                                            value={otpInputs[index] || ""}
                                            onChange={(e) => handleOtpChange(e, index)}
                                            maxLength={6}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-success btn-sm mt-2"
                                        disabled={timer <= 0}
                                        onClick={() => handleVerifyOtp(index, row)}
                                    >
                                        Verify OTP
                                    </button>
                                </div>
                                {timer > 0 ? (
                                    <p className="text-danger mb-0">Resend OTP in: {timer}s</p>
                                ) : (
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleResendOtp(index, row)}
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </>
                        )
                    )}
                </div>
            ), center: true
        }




    ];
    const [localLKRSID, setLocalLKRSID] = useState(LKRS_ID || "");
    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        }
    }, [LKRS_ID]);
    useEffect(() => {
        if (localLKRSID) {
            handleGetLKRSID(localLKRSID);
        }
    }, [localLKRSID]);
    //fetching Details from LKRSID
    const handleGetLKRSID = async (localLKRSID, index = null) => {
        const payload = {
            level: 1,
            LkrsId: localLKRSID,
        };
        try {
            start_loader();
            const response = await fetch_LKRSID(payload);

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

                // ✅ Mark all owners as OTP verified if OwnerDetails is present
                if (Array.isArray(khataDetailsJson.ownerDetails)) {
                    const verified = {};
                    khataDetailsJson.ownerDetails.forEach((_, idx) => {
                        verified[idx] = true;
                    });
                    setVerifiedNumbers(verified);
                }

                console.log("verifiedNumbers", verifiedNumbers);
            } else {
                Swal.fire({
                    text: "No survey details found.",
                    icon: "warning",
                    confirmButtonText: "OK",
                });
                setEPIDShowTable(false);
                setEPID_FetchedData({});
                setOwnerTableData([]);
                setAreaSqft(0);
                localStorage.removeItem('areaSqft');
            }
        } catch (error) {
            console.error("Failed to fetch LKRSID data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader();
        }
    };
    const handleSaveAndProceed = async (epidNumber) => {
        const totalRows = fetchedEPIDData?.[0]?.OwnerDetails?.length;

        if (totalRows > 0) {
            for (let i = 0; i < totalRows; i++) {
                if (!verifiedNumbers[i]) {
                    Swal.fire({
                        icon: 'error',
                        title: 'OTP Not Verified',
                        text: `Please verify OTP for record #${i + 1} before proceeding.`,
                    });
                    return;
                }
            }
        }

        const storedData = localStorage.getItem("epid_JSON");
        let parsedData = storedData ? JSON.parse(storedData) : "";

        const payload = {
            lkrS_ID: 0,
            lkrS_LANDTYPE: "khata",
            lkrS_EPID: epid_fetchedData?.PropertyID,
            lkrS_SITEAREA_SQFT: 0,
            lkrS_SITEAREA_SQMT: 0,
            lkrS_REMARKS: "",
            lkrS_ADDITIONALINFO: "",
            lkrS_CREATEDBY: createdBy,
            lkrS_CREATEDNAME: createdName,
            lkrS_CREATEDROLE: roleID,
            khatA_DETAILS: {
                khatA_ID: 0,
                khatA_LKRS_ID: 0,
                khatA_EPID: epid_fetchedData?.PropertyID,
                khatA_JSON: storedData,
                khatA_TYPE: "A-Khata",
                khatA_REMARKS: "",
                khatA_ADDITIONALINFO: "",
                khatA_CREATEDBY: createdBy,
                khatA_CREATEDNAME: createdName,
                khatA_CREATEDROLE: roleID
            },
            khatA_OWNER_DETAILS: fetchedEPIDData?.[0]?.OwnerDetails.map(owner => ({
                owN_ID: 0,
                owN_LKRS_ID: 0,
                owN_NAME_KN: owner.owN_NAME_KN || "string",
                owN_NAME_EN: epid_fetchedData?.OwnerDetails?.[0].ownerName || "string",
                owN_IDTYPE: epid_fetchedData?.OwnerDetails?.[0].idType || "string",
                owN_IDNUMBER: epid_fetchedData?.OwnerDetails?.[0].idNumber || "string",
                owN_RELATIONTYPE: owner.owN_RELATIONTYPE || "string",
                owN_RELATIONNAME: owner.owN_RELATIONNAME || "string",
                owN_MOBILENUMBER: epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber || "string",
                owN_REMARKS: "",
                owN_ADDITIONALINFO: "",
                owN_CREATEDBY: createdBy,
                owN_CREATEDNAME: createdName,
                owN_CREATEDROLE: roleID
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
                setDisplay_LKRSID(response.display_LKRSID);
                setLKRS_ID(response.lkrsid);
                Swal.fire({
                    title: response.responseMessage,
                    text: response.display_LKRSID,
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
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
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
                                <button className='btn btn-warning btn-block' onClick={showImplementationAlert}>View eKhata</button>
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

        </div>
    );
};
//BDA secction
const BDA = ({ approval_details, setApprovalDetails, order_details, setOrderDetails, LKRS_ID, isRTCSectionSaved, isEPIDSectionSaved }) => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        layoutApprovalNumber: "",
        approvalOrder: null,
        approvalMap: null,
        dateOfApproval: "",
        approvalAuthority: "",
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

    useEffect(() => {
        const storedCreatedBy = localStorage.getItem('createdBy');
        const storedCreatedName = localStorage.getItem('createdName');
        const storedRoleID = localStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);


    }, []);
    const [localLKRSID, setLocalLKRSID] = useState(() => {
        return localStorage.getItem("LKRSID") || "";
    });

    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        }
    }, [LKRS_ID]);

    useEffect(() => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const loadData = async () => {
            if (localLKRSID && (isRTCSectionSaved || isEPIDSectionSaved)) {
                await fetchApprovalList(localLKRSID);
                await delay(5000); // 1 second delay
                await fetchReleaseList(localLKRSID);
            }
        };

        loadData();
    }, [localLKRSID, isRTCSectionSaved, isEPIDSectionSaved]);


    const fetchApprovalList = async (localLKRSID) => {
        start_loader();
        try {
            const listPayload = {
                level: 1,
                aprLkrsId: localLKRSID,
                aprId: 0,
            };

            const listResponse = await listApprovalInfo(listPayload);
            console.log("listResponse", listResponse);

            const approvalFileResponse = await fileListAPI(3, localLKRSID, 1, 0);
            const approvalMapFileResponse = await fileListAPI(3, localLKRSID, 2, 0);
            console.log("approvalFileResponse", approvalFileResponse);
            console.log("approvalMapFileResponse", approvalMapFileResponse);

            if (Array.isArray(listResponse) && listResponse.length > 0) {
                const formattedList = listResponse.map((item, index) => ({
                    layoutApprovalNumber: item.apr_Approval_No,
                    dateOfApproval: item.apr_Approval_Date,
                    approvalOrder: approvalFileResponse[index]?.doctrN_DOCBASE64 || null,
                    approvalMap: approvalMapFileResponse[index]?.doctrN_DOCBASE64 || null,
                    approvalAuthority: item.apR_APPROVALDESIGNATION,
                    approvalID: item.apr_Id,
                    approvalOrderDocID: approvalFileResponse[index]?.doctrN_ID || null,
                    approvalOrderMdocID: approvalFileResponse[index]?.doctrN_MDOC_ID || null,
                    approvalMapDocID: approvalMapFileResponse[index]?.doctrN_ID || null,
                    approvalMapMdocID: approvalMapFileResponse[index]?.doctrN_MDOC_ID || null,
                }));

                console.log("Formatted Approval List", formattedList);
                setIsEditing(false);
                setisApprovalEditing(true); // Disable edit button
                setRecords(formattedList); // ✅ important
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
            console.table(listResponse);
            const listFileResponse = await fileListAPI(3, localLKRSID, 3, 0); //level, LKRSID, MdocID, docID

            if (Array.isArray(listResponse) && listResponse.length > 0) {
                const formattedList = listResponse.map((item, index) => ({
                    layoutReleaseNumber: item.sitE_RELS_ORDER_NO,
                    dateOfOrder: item.sitE_RELS_DATE,
                    orderReleaseFile: listFileResponse[index]?.doctrN_DOCBASE64 || null,
                    releaseAuthority: item.sitE_RELS_APPROVALDESIGNATION,
                    releaseType: item.sitE_RELS_SITE_RELSTYPE_ID,
                }));
                setOrder_Records(formattedList);
                setIsOrderEditing(true); // Disable edit button
                setIsOrder_EditingArea(false); // Disable editing mode

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
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" }); // Clear error on input
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
        if (!formData.approvalAuthority.trim()) {
            newErrors.approvalAuthority = "Approval authority designation is required.";
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
                        Swal.fire("Deleted!", response.responseMessage, "success");
                        setisApprovalEditing(false);
                        setIsEditing(true);
                        fetchApprovalList(localLKRSID);
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

        // ✅ Proceed to next step here if any one is true
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
                console.log("approval_uploadSuccess", approval_uploadSuccess);
                const approvalMap_uploadSuccess1 = await file_UploadAPI(
                    2, // master document ID 
                    formData.layoutApprovalNumber,
                    formData.approvalMap,
                    formData.dateOfApproval,
                    response.apR_ID,
                    "Approval Map"
                );
                console.log("approvalMap_uploadSuccess1", approvalMap_uploadSuccess1);

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

                            const formattedList = listResponse.map((item, index) => ({
                                layoutApprovalNumber: item.apr_Approval_No,
                                dateOfApproval: item.apr_Approval_Date,
                                approvalOrder: approvalFileResponse[index]?.doctrN_DOCBASE64 || null,
                                approvalMap: approvalMapFileResponse[index]?.doctrN_DOCBASE64 || null,
                                approvalAuthority: item.apR_APPROVALDESIGNATION,
                                approvalID: item.apr_Id,
                                // 🔽 Include these IDs for delete API
                                approvalOrderDocID: approvalFileResponse[index]?.doctrN_ID || null,
                                approvalOrderMdocID: approvalFileResponse[index]?.doctrN_MDOC_ID || null,
                                approvalMapDocID: approvalMapFileResponse[index]?.doctrN_ID || null,
                                approvalMapMdocID: approvalMapFileResponse[index]?.doctrN_MDOC_ID || null,
                            }));


                            setIsEditing(false);
                            setisApprovalEditing(true); // Disable edit button
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
                            layoutApprovalNumber: "",
                            approvalOrder: null,
                            approvalMap: null,
                            dateOfApproval: "",
                            approvalAuthority: "",
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
    const [isEditing, setIsEditing] = useState(true); // Controls edit mode
    const [savedRecords, setSavedRecords] = useState([]); // Stores saved records

    const handleSaveAndProceed = () => {
        if (records.length === 0) {
            Swal.fire("Error", "No records available to save!", "error");
            return;
        }

        // Update the selected record in the list
        const updatedRecords = records.map((record, index) => {
            if (index === editIndex) {
                return {
                    ...record,
                    layoutApprovalNumber: formData.layoutApprovalNumber,
                    approvalOrder: formData.approvalOrder,  // Updated file
                    approvalMap: formData.approvalMap,      // Updated file
                    dateOfApproval: formData.dateOfApproval,
                    approvalAuthority: formData.approvalAuthority,
                };
            }
            return record;
        });

        setRecords(updatedRecords); // Save the updated records
        setIsEditing(false); // Disable editing mode
        setApprovalDetails([...approval_details, records]);
        Swal.fire("Success!", "Data saved successfully!", "success");
    };
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
            selector: row => {
                if (row.releaseType === "1") return "100%";
                else if (row.releaseType === "2") return "60*40";
                else if (row.releaseType === "3") return "40*30*30";
                else return "-";
            }, center: true,
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
                        disabled={!isOrder_EditingArea}
                        onClick={() => handleOrderDelete(index)}
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

                        // Optional: log base64
                        // listFileResponse.forEach((item, index) => {
                        //     console.log(`File ${index + 1} Base64:`, item.doctrN_DOCBASE64);
                        // });

                        if (Array.isArray(listResponse)) {
                            const formattedList = listResponse.map((item, index) => ({
                                layoutReleaseNumber: item.sitE_RELS_ORDER_NO,
                                dateOfOrder: item.sitE_RELS_DATE,
                                orderReleaseFile: listFileResponse[index]?.doctrN_DOCBASE64 || null,
                                releaseAuthority: item.sitE_RELS_APPROVALDESIGNATION,
                                releaseType: item.sitE_RELS_SITE_RELSTYPE_ID,
                            }));
                            setOrder_Records(formattedList);
                            setIsOrderEditing(true); // Disable edit button
                            setIsOrder_EditingArea(false); // Disable editing mode

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

    return (
        <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
            {loading && <Loader />}
            <div className="card">
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
                                        {t('translation.BDA.Subdivision.approvalNo')} <span className="mandatory_color">*</span>
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
                                        {t("translation.BDA.Subdivision.scanUploadapproval")}{" "}
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
                            <div className="col-0 col-sm-0 col-md-2 col-lg-2 col-xl-2 mt-5"></div>
                            {/* Edit button */}
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-5">
                                <div className="form-group">
                                    <button className="btn btn-info btn-block" disabled={!isApprovalEditing} onClick={handleEditApproval}>
                                        Edit
                                    </button>
                                </div>
                            </div>
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




                    <hr className='mt-1' />
                    <h6 className='fw-normal fs-5' style={{ color: '#0077b6' }}>{t('translation.BDA.Subdivision1.heading')}</h6>
                    <hr className='mt-1' style={{ border: '1px dashed #0077b6' }} />

                    <div className="mt-5">
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
                            {/* Release Type */}
                            <div className='col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3'>
                                <div className="form-group mt-2">
                                    <label className='form-label'>
                                        Release Type <span className='mandatory_color'>*</span>
                                    </label>
                                </div>
                                {release_errors.releaseType && (
                                    <small className="text-danger">{release_errors.releaseType}</small>
                                )}
                            </div>
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                <div className="form-check">
                                    <label className="form-check-label fw-bold">
                                        <input
                                            className="form-check-input me-2 radioStyle"
                                            type="radio"
                                            name="releaseType"
                                            value="1"
                                            checked={release_formData.releaseType === "1"}
                                            onChange={(e) =>
                                                setRelease_FormData({ ...release_formData, releaseType: e.target.value })
                                            } disabled={!isOrder_EditingArea}
                                        />
                                        100</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                <div className="form-check">
                                    <label className="form-check-label fw-bold">
                                        <input
                                            className="form-check-input me-2 radioStyle"
                                            type="radio"
                                            name="releaseType"
                                            value="2"
                                            checked={release_formData.releaseType === "2"}
                                            onChange={(e) =>
                                                setRelease_FormData({ ...release_formData, releaseType: e.target.value })
                                            } disabled={!isOrder_EditingArea}
                                        />
                                        60 * 40</label>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                <div className="form-check">
                                    <label className="form-check-label fw-bold">
                                        <input
                                            className="form-check-input me-2 radioStyle"
                                            type="radio"
                                            name="releaseType"
                                            value="3"
                                            checked={release_formData.releaseType === "3"}
                                            onChange={(e) =>
                                                setRelease_FormData({ ...release_formData, releaseType: e.target.value })
                                            } disabled={!isOrder_EditingArea}
                                        />
                                        40 * 30 * 30</label>
                                </div>
                            </div>

                            <div className='col-0 col-sm-0 col-md-8 col-lg-8 col-xl-8'></div>
                            {/* edit button */}
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                <div className="form-group">
                                    <button className="btn btn-info btn-block" disabled={!isOrderEditing} onClick={handleEditRelease}>
                                        Edit
                                    </button>
                                </div>
                            </div>
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

                                            {/* Save Approval order Button */}
                                            <div className='row'>
                                                <div className='col-md-8'></div>


                                            </div>
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
//GPS and Individual Sites Components
const IndividualGPSBlock = ({ areaSqft, LKRS_ID, createdBy, createdName, roleID, isRTCSectionSaved, isEPIDSectionSaved }) => {
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [shape, setShape] = useState("regular"); // Track selected shape

    const [side1Length, setSide1Length] = useState("");
    const [side2Length, setSide2Length] = useState("");
    const [side3Length, setSide3Length] = useState("");
    const [side4Length, setSide4Length] = useState("");

    const [side1RoadFacing, setSide1RoadFacing] = useState("");
    const [side1Error, setSide1Error] = useState('');
    const [side1RoadError, setSide1RoadError] = useState('');


    const [side2RoadFacing, setSide2RoadFacing] = useState("");
    const [side2Error, setSide2Error] = useState('');
    const [side2RoadError, setSide2RoadError] = useState('');

    //east-west varaiable
    const [eastwestFeet, setEastwestFeet] = useState('');
    const [eastwestMeter, setEastwestMeter] = useState('');
    const [eastwestError, setEastwestError] = useState('');
    const [eastwestRoadFacing, setEastwestRoadFacing] = useState(null);
    const [eastwestRoadError, setEastwestRoadError] = useState('');

    //north-south varaiable
    const [northsouthFeet, setNorthsouthFeet] = useState('');
    const [northsouthMeter, setNorthsouthMeter] = useState('');
    const [northsouthError, setNorthsouthError] = useState('');
    const [northsouthRoadFacing, setNorthsouthRoadFacing] = useState(null);
    const [northsouthRoadError, setNorthsouthRoadError] = useState('');

    //regular area calculation varaiable
    const [regularAreaSqFt, setRegularAreaSqFt] = useState('');
    const [regularAreaSqM, setRegularAreaSqM] = useState('');

    const [totalArea, setTotalArea] = useState(""); // Total Area Input

    const [cornerSite, setCornerSite] = useState(true); // Corner Site Selection (Yes/No)
    const [cornerSiteError, setCornerSiteError] = useState("");

    const [areaFeet, setAreaFeet] = useState(""); // Area in Feet Input

    const [siteType, setSiteType] = useState(""); // Dropdown for Site Type
    const [siteTypeError, setSiteTypeError] = useState('');


    const [sides, setSides] = useState([]);

    const [regular_siteNumber, setRegular_SiteNumber] = useState('');
    const [regular_siteNumberError, setRegular_SiteNumberError] = useState('');


    const [chakbandiEast, setChakbandiEast] = useState('');
    const [chakbandiEastError, setChakbandiEastError] = useState('');

    const [chakbandiWest, setChakbandiWest] = useState('');
    const [chakbandiWestError, setChakbandiWestError] = useState('');

    const [chakbandiSouth, setChakbandiSouth] = useState('');
    const [chakbandiSouthError, setChakbandiSouthError] = useState('');

    const [chakbandiNorth, setChakbandiNorth] = useState('');
    const [chakbandiNorthError, setChakbandiNorthError] = useState('');

    const [siteData, setSiteData] = useState([]);
    const [irregularsiteData, setIrregularSiteData] = useState([]);
    const [numSidesData, setNumSidesData] = useState("");


    const [blockArea, setBlockArea] = useState([]);
    const [blockAreaError, setBlockAreaError] = useState([]);

    const siteNumberRef = useRef(null);
    const blockAreaRef = useRef(null);
    const side1RoadRef = useRef(null);
    const side2RoadRef = useRef(null);
    const eastwestFeetRef = useRef(null);
    const northsouthFeetRef = useRef(null);
    const cornerSiteRef = useRef(null);
    const siteTypeRef = useRef(null);
    const chakbandiEastRef = useRef(null);
    const chakbandiWestRef = useRef(null);
    const chakbandiSouthRef = useRef(null);
    const chakbandiNorthRef = useRef(null);
    const latitudeRef = useRef(null);
    const longitudeRef = useRef(null);
    const resultTypeRef = useRef(null);
    const layoutSiteCountRef = useRef(null);

    // const [createdBy, setCreatedBy] = useState(null);
    // const [createdName, setCreatedName] = useState('');
    // const [roleID, setRoleID] = useState('');
    const [totalSQFT, setTotalSQFT] = useState('');
    const [totalSQM, setTotalSQM] = useState('');

    useEffect(() => {
        // const storedCreatedBy = localStorage.getItem('createdBy');
        // const storedCreatedName = localStorage.getItem('createdName');
        // const storedRoleID = localStorage.getItem('RoleID');

        // setCreatedBy(storedCreatedBy);
        // setCreatedName(storedCreatedName);
        // setRoleID(storedRoleID);

        const areaSQFT = localStorage.getItem('areaSqft');
        if (areaSQFT) {
            setTotalSQFT(areaSQFT);
            setTotalSQM(sqftToSqm(areaSQFT));
        }


    }, [areaSqft]);

    const [localLKRSID, setLocalLKRSID] = useState("");

    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        } else {
            const id = localStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
        }
    }, [LKRS_ID]);


    useEffect(() => {

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        if (localLKRSID && (isRTCSectionSaved || isEPIDSectionSaved)) {
            fetchSiteDetails(localLKRSID);
            delay(15000); // 1 second delay
            fetchOwners(localLKRSID);
        } else {
            console.log("🔄 Waiting in GPS block");
        }
    }, [localLKRSID, isRTCSectionSaved, isEPIDSectionSaved]);


    const sqftToSqm = (sqft) => (sqft ? (parseFloat(sqft) * 0.092903).toFixed(2) : '');


    const handleNumSidesChange = (e) => {
        const value = e.target.value;

        // Allow only 1-9 (single digits)
        if (/^[3-9]?$/.test(value)) {
            setNumSides(value);

            if (value) {
                setSides(
                    Array.from({ length: parseInt(value) }, (_, index) => ({
                        id: index + 1,
                        lengthInFeet: "",
                        lengthInMeter: "",
                        roadFacing: null,
                    }))
                );
            } else {
                setSides([]);
            }
        }
    };
    const handleLengthInFeetChange = (index, value) => {
        const updatedSides = [...sides];
        updatedSides[index].lengthInFeet = value;

        if (/^(?:[1-9][0-9]*)(?:\.\d*)?$/.test(value)) {
            updatedSides[index].lengthInMeter = feetToMeter(value);
        } else if (value === '') {
            updatedSides[index].lengthInMeter = '';
        }

        setSides(updatedSides);
    };
    const handleLengthInMeterChange = (index, value) => {
        const updatedSides = [...sides];
        updatedSides[index].lengthInMeter = value;

        if (/^(?:[1-9][0-9]*)(?:\.\d*)?$/.test(value)) {
            updatedSides[index].lengthInFeet = meterToFeet(value);
        } else if (value === '') {
            updatedSides[index].lengthInFeet = '';
        }

        setSides(updatedSides);
    };
    const handleRoadFacingChange = (index, value) => {
        const updatedSides = [...sides];
        updatedSides[index].roadFacing = value;
        setSides(updatedSides);
    };
    const handleRegular_SiteNumberChange = (e) => {
        const value = e.target.value.toUpperCase(); // Convert to uppercase automatically
        const allowedPattern = /^[0-9A-Z\/\-]*$/;

        if (value === '') {
            setRegular_SiteNumber(value);
            setRegular_SiteNumberError('Site Number is required');
        } else if (value.startsWith('0')) {
            setRegular_SiteNumber(value);
            setRegular_SiteNumberError("Site Number should not start with 0");
        } else if (!allowedPattern.test(value)) {
            setRegular_SiteNumber(value);
            setRegular_SiteNumberError("Only capital letters, numbers, '/' and '-' are allowed");
        } else {
            setRegular_SiteNumber(value);
            setRegular_SiteNumberError('');
        }
    };
    const handleRegular_BlockAreaChange = (e) => {
        const value = e.target.value;
        const allowedPattern = /^[a-zA-Z0-9\s\-\.\/]*$/;// Only letters, numbers, spaces, and hyphens

        if (value === '') {
            setBlockArea(value);
            setBlockAreaError('Block/Area is required');
        }
        else if (!allowedPattern.test(value)) {
            setBlockArea(value);
            setBlockAreaError('Only letters, numbers, spaces, and hyphens are allowed');
        }
        else {
            setBlockArea(value);
            setBlockAreaError('');  // Clear error when valid input
        }
    };
    //east-west feet to meter calculation values 
    const handleEastwestFeetChange = (e) => {
        const value = e.target.value;
        if (/^(?!0)\d*(\.\d*)?$/.test(value) || value === "") {
            setEastwestFeet(value);

            if (value === "") {
                setEastwestError('East-West side length is required');
                setEastwestMeter('');
            } else {
                setEastwestError('');
                const feet = parseFloat(value);
                if (!isNaN(feet)) {
                    const meter = feet * 0.3048;
                    setEastwestMeter(meter.toFixed(2));
                }
            }
            // Recalculate Area
            calculateArea(value, northsouthFeet, null, null);
        }
    };
    // East-West meter change handler
    const handleEastwestMeterChange = (e) => {
        const value = e.target.value;
        if (/^(?!0)\d*(\.\d*)?$/.test(value) || value === "") {
            setEastwestMeter(value);

            if (value === "") {
                setEastwestError('East-West side length is required');
                setEastwestFeet('');
            } else {
                setEastwestError('');
                const meter = parseFloat(value);
                if (!isNaN(meter)) {
                    const feet = meter / 0.3048;
                    setEastwestFeet(feet.toFixed(2));
                }
            }

            // Recalculate Area
            calculateArea(null, null, value, northsouthMeter);
        }
    };
    //north-south feet or meter calculation function
    const feetToMeter = (feet) => (feet ? (parseFloat(feet) * 0.3048).toFixed(2) : '');
    const meterToFeet = (meter) => (meter ? (parseFloat(meter) / 0.3048).toFixed(2) : '');
    // North-South feet change handler
    const handleNorthsouthFeetChange = (e) => {
        const value = e.target.value;
        if (/^(?!0)\d*(\.\d{0,2})?$/.test(value) || value === '') {
            setNorthsouthFeet(value);
            setNorthsouthMeter(feetToMeter(value));
            setNorthsouthError(value ? '' : 'North-south length is required');
        }

        // Recalculate Area
        calculateArea(eastwestFeet, value, null, null);
    };
    // North-South meter change handler
    const handleNorthsouthMeterChange = (e) => {
        const value = e.target.value;
        if (/^(?!0)\d*(\.\d{0,2})?$/.test(value) || value === '') {
            setNorthsouthMeter(value);
            setNorthsouthFeet(meterToFeet(value));
            setNorthsouthError(value ? '' : 'North-south length is required');
        }

        // Recalculate Area
        calculateArea(null, null, eastwestMeter, value);
    };
    // Area Calculation Function (for regular-shaped site)
    const calculateArea = (lengthFt, widthFt, lengthM, widthM) => {
        if (lengthFt && widthFt) {
            const areaFeet = parseFloat(lengthFt) * parseFloat(widthFt);
            const areaMeter = areaFeet * 0.092903; // 1 sq.ft = 0.092903 sq.m
            setRegularAreaSqFt(areaFeet.toFixed(2));
            setRegularAreaSqM(areaMeter.toFixed(2));
        } else if (lengthM && widthM) {
            const areaMeter = parseFloat(lengthM) * parseFloat(widthM);
            const areaFeet = areaMeter * 10.7639; // 1 sq.m = 10.7639 sq.ft
            setRegularAreaSqM(areaMeter.toFixed(2));
            setRegularAreaSqFt(areaFeet.toFixed(2));
        } else {
            setRegularAreaSqFt('');
            setRegularAreaSqM('');
        }
    };
    const finalValidation = () => {
        let isValid = true;
        let firstErrorField = null;


        // Reset all error states
        setEastwestError('');
        setNorthsouthError('');
        setSide1RoadError('');
        setSide2RoadError('');
        setRegular_SiteNumberError('');
        setBlockAreaError('');
        setCornerSiteError('');
        setSiteTypeError('');
        setChakbandiEastError('');
        setChakbandiWestError('');
        setChakbandiSouthError('');
        setChakbandiNorthError('');
        setLatitudeError('');
        setLongitudeError('');

        // ✅ New: Validate Site Number
        if (!regular_siteNumber || regular_siteNumber.trim() === '') {
            setRegular_SiteNumberError('Site number is required');
            if (!firstErrorField) firstErrorField = siteNumberRef;
            isValid = false;
        }

        // ✅ New: Validate Block/Area
        if (!String(blockArea).trim()) {
            setBlockAreaError('Block/Area is required');
            if (!firstErrorField) firstErrorField = blockAreaRef;
            isValid = false;
        }

        // Validate road facing radios
        if (side1RoadFacing === '') {
            setSide1RoadError('Please select road facing option for Side 1');
            if (!firstErrorField) firstErrorField = side1RoadRef;
            isValid = false;
        }
        if (side2RoadFacing === '') {
            setSide2RoadError('Please select road facing option for Side 2');
            if (!firstErrorField) firstErrorField = side2RoadRef;
            isValid = false;
        }


        if ((!eastwestFeet || parseFloat(eastwestFeet) <= 0) && (!eastwestMeter || parseFloat(eastwestMeter) <= 0)) {
            setEastwestError('Please enter East-West side length in either Feet or Meter');
            if (!firstErrorField) firstErrorField = eastwestFeetRef;
            isValid = false;
        }

        if ((!northsouthFeet || parseFloat(northsouthFeet) <= 0) && (!northsouthMeter || parseFloat(northsouthMeter) <= 0)) {
            setNorthsouthError('Please enter North-South side length in either Feet or Meter');
            if (!firstErrorField) firstErrorField = northsouthFeetRef;
            isValid = false;
        }

        //corner Site validation
        if (cornerSite === '') {
            setCornerSiteError('Please select corner site option');
            if (!firstErrorField) firstErrorField = cornerSiteRef;
            isValid = false;
        }
        // ✅ Site Type Dropdown validation
        if (siteType === '') {
            setSiteTypeError('Please select a type of site');
            if (!firstErrorField) firstErrorField = siteTypeRef;
            isValid = false;
        }
        // Chakbandi validations
        const chakbandiRegex = /^[a-zA-Z0-9.,\/\\#\s]*$/;

        const validateChakbandi = (value, setter, ref, label) => {
            if (!value || value.trim() === '') {
                setter(`${label} side is required`);
                if (!firstErrorField) firstErrorField = ref;
                isValid = false;
            } else if (!chakbandiRegex.test(value)) {
                setter('Only letters, numbers, space and . , / \\ # are allowed');
                if (!firstErrorField) firstErrorField = ref;
                isValid = false;
            } else {
                setter('');
            }
        };

        validateChakbandi(chakbandiEast, setChakbandiEastError, chakbandiEastRef, 'East');
        validateChakbandi(chakbandiWest, setChakbandiWestError, chakbandiWestRef, 'West');
        validateChakbandi(chakbandiSouth, setChakbandiSouthError, chakbandiSouthRef, 'South');
        validateChakbandi(chakbandiNorth, setChakbandiNorthError, chakbandiNorthRef, 'North');


        if (!latitude || latitude.trim() === '') {
            setLatitudeError('Latitude is required');
            if (!firstErrorField) firstErrorField = latitudeRef;
            isValid = false;
        }
        if (!longitude || longitude.trim() === '') {
            setLongitudeError('Longitude is required');
            if (!firstErrorField) firstErrorField = longitudeRef;
            isValid = false;
        }
        if (firstErrorField?.current) {
            firstErrorField.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.current.focus?.();
        }

        return isValid;
    };
    // Function to clear the input fields
    const resetFormFields = () => {
        setRegular_SiteNumber('');
        setBlockArea('');
        setEastwestFeet('');
        setEastwestMeter('');
        setSide1RoadFacing('');
        setNorthsouthFeet('');
        setNorthsouthMeter('');
        setSide2RoadFacing('');
        setTotalArea('');
        setCornerSite('');
        setSiteType('');
        setChakbandiEast('');
        setChakbandiWest('');
        setChakbandiSouth('');
        setChakbandiNorth('');
        setLatitude('');
        setLongitude('');
        setResultType('');
        setRegularAreaSqFt('');
        setRegularAreaSqM('');
        setIsChecked(false);
    };
    // Function to fetch the previous data and populate the form fields
    const handleFetchPrevious = (e) => {
        if (e.target.checked) {
            const previousData = siteData[siteData.length - 1]; // Get the last added record

            if (previousData) {
                // Populate the input fields with the previous data
                setRegular_SiteNumber(previousData.siteNumber);
                setBlockArea(previousData.blockArea);
                setEastwestFeet(previousData.eastwestFeet);
                setEastwestMeter(previousData.eastwestMeter);
                setSide1RoadFacing(previousData.eastwestRoadFacing);
                setNorthsouthFeet(previousData.northsouthFeet);
                setNorthsouthMeter(previousData.northsouthMeter);
                setSide2RoadFacing(previousData.northsouthRoadFacing);
                setTotalArea(previousData.totalArea);
                setCornerSite(previousData.cornerSite);
                setSiteType(previousData.siteType);
                setChakbandiEast(previousData.chakbandiEast);
                setChakbandiWest(previousData.chakbandiWest);
                setChakbandiSouth(previousData.chakbandiSouth);
                setChakbandiNorth(previousData.chakbandiNorth);
                setLatitude(previousData.latitude);
                setLongitude(previousData.longitude);
                setResultType(previousData.resultType);

                // Update the Area fields with previous data if available
                setRegularAreaSqFt(previousData.regularAreaSqFt || ''); // Ensure default value if not present
                setRegularAreaSqM(previousData.regularAreaSqM || ''); // Ensure default value if not present
            }
        } else {
            // Clear the fields when checkbox is unchecked
            setRegular_SiteNumber('');
            setBlockArea('');
            setEastwestFeet('');
            setEastwestMeter('');
            setSide1RoadFacing('');
            setNorthsouthFeet('');
            setNorthsouthMeter('');
            setSide2RoadFacing('');
            setTotalArea('');
            setCornerSite('');
            setSiteType('');
            setChakbandiEast('');
            setChakbandiWest('');
            setChakbandiSouth('');
            setChakbandiNorth('');
            setLatitude('');
            setLongitude('');
            setResultType('');
            setRegularAreaSqFt('');
            setRegularAreaSqM('');
        }
    };
    //Irregular shape block variable
    const [irregular_siteNumber, setirregular_siteNumber] = useState('');
    const [irregular_siteNumberError, setirregular_siteNumberError] = useState('');
    const irregular_siteNoref = useRef(null);

    const [irregular_blockArea, setirregular_blockArea] = useState('');
    const [irregular_blockAreaError, setirregular_blockAreaError] = useState('');
    const irregular_blockArearef = useRef(null);

    const [irregularchakbandiEast, setIrregularChakbandiEast] = useState('');
    const [irregularchakbandiEastError, setIrregularChakbandiEastError] = useState('');
    const irregular_chakbandiEastref = useRef(null);

    const [irregularchakbandiWest, setIrregularChakbandiWest] = useState('');
    const [irregularchakbandiWestError, setIrregularChakbandiWestError] = useState('');
    const irregular_chakbandiWestref = useRef(null);

    const [irregularchakbandiSouth, setIrregularChakbandiSouth] = useState('');
    const [irregularchakbandiSouthError, setIrregularChakbandiSouthError] = useState('');
    const irregular_chakbandiSouthref = useRef(null);

    const [irregularchakbandiNorth, setIrregularChakbandiNorth] = useState('');
    const [irregularchakbandiNorthError, setIrregularChakbandiNorthError] = useState('');
    const irregular_chakbandiNorthref = useRef(null);

    const [irregularcornerSite, setIrregularCornerSite] = useState('yes');
    const [irregularcornerSiteError, setIrregularCornerSiteError] = useState('');
    const irregular_cornerSiteref = useRef(null);

    const [irregularsiteType, setIrregularsiteType] = useState('');
    const [irregularsiteTypeError, setIrregularsiteTypeError] = useState('');
    const irregular_siteTyperef = useRef(null);

    const [irregularAreaSqFt, setIrregularAreaSqFt] = useState('');
    const [irregularAreaSqM, setIrregularAreaSqM] = useState('');
    const [irregularAreaSqft_sqM_error, setIrregularAreaSqft_sqM_error] = useState('');
    const irregular_AreaSqFtref = useRef(null);

    const [numSides, setNumSides] = useState("");
    const [numSidesError, setNumSidesError] = useState('');
    const irregularnumsidesref = useRef(null);

    const [sideErrors, setSideErrors] = useState([]);
    const [isChecked, setIsChecked] = useState(false);
    const sideRefs = useRef([]);


    useEffect(() => {
        sideRefs.current = sides.map((_, i) => sideRefs.current[i] ?? React.createRef());
    }, [sides]);


    //Irregular Shape block
    const irregularFinalValidation = () => {
        let isValid = true;
        let firstErrorField = null;

        // Reset all error states
        setirregular_siteNumberError('');
        setBlockAreaError('');
        setIrregularAreaSqft_sqM_error('');
        setIrregularCornerSiteError('');
        setSiteTypeError('');
        setIrregularChakbandiEastError('');
        setIrregularChakbandiWestError('');
        setIrregularChakbandiSouthError('');
        setIrregularChakbandiNorthError('');
        setLatitudeError('');
        setLongitudeError('');
        setSideErrors([]);  // Add this line to reset side errors

        // ✅ New: Validate Site Number
        if (!irregular_siteNumber || irregular_siteNumber.trim() === '') {
            setirregular_siteNumberError('Site number is required');
            if (!firstErrorField) firstErrorField = irregular_siteNoref;
            isValid = false;
        }

        // ✅ New: Validate Block/Area
        if (!irregular_blockArea || irregular_blockArea.trim() === '') {
            setirregular_blockAreaError('Block/Area is required');
            if (!firstErrorField) firstErrorField = irregular_blockArearef;
            isValid = false;
        }

        // ✅ Validate Number of Sides
        if (!numSides || isNaN(numSides) || Number(numSides) < 3 || Number(numSides) > 9) {
            setNumSidesError('Please enter a valid number of sides (between 3 and 9)');
            if (!firstErrorField) firstErrorField = irregularnumsidesref;
            isValid = false;
        } else {
            setNumSidesError('');  // Clear the error if the validation passes
        }

        //side validation
        // sides.forEach((side, index) => {
        //     const sideError = { length: '', roadFacing: '' };

        //     if (!side.lengthInFeet && !side.lengthInMeter) {
        //         sideError.length = `Side ${side.id}: Enter length in feet or meter.`;
        //         sideError.roadFacing = ` Side ${side.id}: Select whether it's road facing.`;
        //         if (!firstErrorField) firstErrorField = sideRefs.current[index];
        //         isValid = false;
        //     }

        //     if (side.roadFacing !== true && side.roadFacing !== false) {
        //         sideError.roadFacing = `Side ${side.id}: Select whether it's road facing.`;
        //         sideError.roadFacing = `Side ${side.id}: Select whether it's road facing.`;
        //         if (!firstErrorField) firstErrorField = sideRefs.current[index];
        //         isValid = false;
        //     }

        //     sideErrors.push(sideError);
        // });


        const newSideErrors = [];

        sides.forEach((side, index) => {
            const sideError = { length: '', roadFacing: '' };

            // Validate length
            if (!side.lengthInFeet && !side.lengthInMeter) {
                sideError.length = `Side ${side.id}: Enter length in feet or meter.`;
                if (!firstErrorField) firstErrorField = sideRefs.current[index];
                isValid = false;
            }

            // Validate road facing
            if (side.roadFacing !== true && side.roadFacing !== false) {
                sideError.roadFacing = `Side ${side.id}: Select whether it's road facing.`;
                if (!firstErrorField) firstErrorField = sideRefs.current[index];
                isValid = false;
            }

            newSideErrors.push(sideError);
        });

        setSideErrors(newSideErrors); // ✅ Update state


        //area calculation
        if ((!irregularAreaSqFt || parseFloat(irregularAreaSqFt) <= 0) && (!irregularAreaSqM || parseFloat(irregularAreaSqM) <= 0)) {
            setIrregularAreaSqft_sqM_error('Please enter Area  in either Sq.ft or Sq.M');
            if (!firstErrorField) firstErrorField = irregular_AreaSqFtref;
            isValid = false;
        }

        // corner Site validation
        if (irregularcornerSite === '') {
            setIrregularCornerSiteError('Please select corner site option');
            if (!firstErrorField) firstErrorField = irregular_cornerSiteref;
            isValid = false;
        }

        // ✅ Site Type Dropdown validation
        if (irregularsiteType === '') {
            setIrregularsiteTypeError('Please select a type of site');
            if (!firstErrorField) firstErrorField = irregular_siteTyperef;
            isValid = false;
        }

        const chakbandiRegex = /^[a-zA-Z0-9.,\/\\#\s]*$/;

        // ✅ Validate Chakbandi Directions
        if (!irregularchakbandiEast || irregularchakbandiEast.trim() === '') {
            setIrregularChakbandiEastError("East side is required");
            if (!firstErrorField) firstErrorField = irregular_chakbandiEastref;
            isValid = false;
        } else if (!chakbandiRegex.test(irregularchakbandiEast)) {
            setIrregularChakbandiEastError("Only letters, numbers, space and . , / \\ # are allowed");
            if (!firstErrorField) firstErrorField = irregular_chakbandiEastref;
            isValid = false;
        }

        if (!irregularchakbandiWest || irregularchakbandiWest.trim() === '') {
            setIrregularChakbandiWestError("West side is required");
            if (!firstErrorField) firstErrorField = irregular_chakbandiWestref;
            isValid = false;
        } else if (!chakbandiRegex.test(irregularchakbandiWest)) {
            setIrregularChakbandiWestError("Only letters, numbers, space and . , / \\ # are allowed");
            if (!firstErrorField) firstErrorField = irregular_chakbandiWestref;
            isValid = false;
        }

        if (!irregularchakbandiSouth || irregularchakbandiSouth.trim() === '') {
            setIrregularChakbandiSouthError("South side is required");
            if (!firstErrorField) firstErrorField = irregular_chakbandiSouthref;
            isValid = false;
        } else if (!chakbandiRegex.test(irregularchakbandiSouth)) {
            setIrregularChakbandiSouthError("Only letters, numbers, space and . , / \\ # are allowed");
            if (!firstErrorField) firstErrorField = irregular_chakbandiSouthref;
            isValid = false;
        }

        if (!irregularchakbandiNorth || irregularchakbandiNorth.trim() === '') {
            setIrregularChakbandiNorthError("North side is required");
            if (!firstErrorField) firstErrorField = irregular_chakbandiNorthref;
            isValid = false;
        } else if (!chakbandiRegex.test(irregularchakbandiNorth)) {
            setIrregularChakbandiNorthError("Only letters, numbers, space and . , / \\ # are allowed");
            if (!firstErrorField) firstErrorField = irregular_chakbandiNorthref;
            isValid = false;
        }

        // Latitude Validation
        if (!latitude || latitude.trim() === '') {
            setLatitudeError('Latitude is required');
            if (!firstErrorField) firstErrorField = latitudeRef;
            isValid = false;
        }

        // Validate Longitude
        if (!longitude || longitude.trim() === '') {
            setLongitudeError('Longitude is required');
            if (!firstErrorField) firstErrorField = longitudeRef;
            isValid = false;
        }




        if (firstErrorField?.current) {
            firstErrorField.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.current.focus?.();
        }


        return isValid;
    };
    const handleirRegular_BlockAreaChange = (e) => {
        const value = e.target.value;
        const allowedPattern = /^[a-zA-Z0-9\s\-\.\/]*$/;

        if (value === '') {
            setirregular_blockArea(value);
            setirregular_blockAreaError('Block/Area is required');
        } else if (!allowedPattern.test(value)) {
            setirregular_blockArea(value);
            setirregular_blockAreaError('Only letters, numbers, spaces, and hyphens are allowed');
        }
        else {
            setirregular_blockArea(value);
            setirregular_blockAreaError('');
        }
    };
    const handleirRegular_SiteNumberChange = (e) => {
        const value = e.target.value.toUpperCase(); // Convert to uppercase automatically
        const allowedPattern = /^[0-9A-Z\/\-]*$/;

        if (value === '') {
            setirregular_siteNumber(value);
            setirregular_siteNumberError('Site Number is required');
        } else if (value.startsWith('0')) {
            setirregular_siteNumber(value);
            setirregular_siteNumberError("Site Number should not start with 0");
        } else if (!allowedPattern.test(value)) {
            setirregular_siteNumber(value);
            setirregular_siteNumberError("Only capital letters, numbers, '/' and '-' are allowed");
        } else {
            setirregular_siteNumber(value);
            setirregular_siteNumberError('');
        }
    };
    // Function to clear the input fields
    const resetIrregularFormFields = () => {
        setirregular_siteNumber('');
        setirregular_blockArea('');
        setNumSides(''); // Clears numSides
        setIrregularAreaSqFt('');
        setIrregularAreaSqM('');
        setIrregularCornerSite('');
        setIrregularsiteType('');
        setIrregularChakbandiEast('');
        setIrregularChakbandiWest('');
        setIrregularChakbandiSouth('');
        setIrregularChakbandiNorth('');
        setLatitude('');
        setLongitude('');
        setResultType('');
        setRegularAreaSqFt('');
        setRegularAreaSqM('');

        // Clear the sides array
        setSides([]); // Reset sides array
    };
    const handleSqFtChange = (e) => {
        const value = e.target.value;

        // Allow only numbers and optional decimal point
        const numericValue = value.replace(/[^0-9.]/g, '');

        setIrregularAreaSqFt(numericValue);

        if (!isNaN(numericValue) && numericValue !== '') {
            const sqm = (parseFloat(numericValue) * 0.092903).toFixed(2);
            setIrregularAreaSqM(sqm);
        } else {
            setIrregularAreaSqM('');
        }
    };
    const handleSqMChange = (e) => {
        const value = e.target.value;

        const numericValue = value.replace(/[^0-9.]/g, '');

        setIrregularAreaSqM(numericValue);

        if (!isNaN(numericValue) && numericValue !== '') {
            const sqft = (parseFloat(numericValue) * 10.7639).toFixed(2);
            setIrregularAreaSqFt(sqft);
        } else {
            setIrregularAreaSqFt('');
        }
    };
    const [layoutSiteCount, setLayoutSiteCount] = useState("");
    const [layoutSiteCountError, setLayoutSiteCountError] = useState("");

    const totalSitesCount = Number(layoutSiteCount);
    const totalAddedSites = siteData.length + irregularsiteData.length;

    const [allSites, setAllSites] = useState([]);


    const handleLayoutSiteCountChange = (e) => {
        const value = e.target.value;
        if (/^[0-9]*$/.test(value)) {
            setLayoutSiteCount(value);
            setLayoutSiteCountError(!value ? "Total number of sites is required" : "");
        } else {
            setLayoutSiteCountError("Only numeric values are allowed");
        }
    };

    const [siteIdCounter, setSiteIdCounter] = useState(1);
    const [isAddDisabled, setIsAddDisabled] = useState(false);



    const handle_AddRow = (shape) => {
        if (!layoutSiteCount || totalSitesCount <= 0) {
            setLayoutSiteCountError("Please enter a valid number of total sites");
            layoutSiteCountRef.current?.focus();
            return;
        }

        const totalAddedSites = allSites.length;

        if (totalAddedSites == totalSitesCount) {
            setIsAddDisabled(true);
        }

        if (totalAddedSites >= totalSitesCount) {
            setIsAddDisabled(true); // ✅ Disable further addition
            Swal.fire({
                title: "Limit Reached",
                text: `Only ${totalSitesCount} sites allowed. Please update the total number of sites if needed.`,
                icon: "warning",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: true
            }).then(() => {
                layoutSiteCountRef.current.focus();
            });

            return;
        }

        // ✅ Move ID generation *inside* the shape-specific validation block
        if (shape === "regular" && finalValidation()) {
            const uniqueId = `REG-${String(siteIdCounter).padStart(3, '0')}`;
            setSiteIdCounter(prev => prev + 1);

            const newRow = {
                id: uniqueId,
                regularShape: "Regular",
                siteNumber: regular_siteNumber,
                blockArea,
                eastwestFeet,
                eastwestMeter,
                eastwestRoadFacing: side1RoadFacing,
                northsouthFeet,
                northsouthMeter,
                northsouthRoadFacing: side2RoadFacing,
                totalArea,
                cornerSite,
                siteType,
                chakbandiEast,
                chakbandiWest,
                chakbandiSouth,
                chakbandiNorth,
                latitude,
                longitude,
                resultType,
                regularAreaSqFt,
                regularAreaSqM,
                currentDateTime: new Date().toISOString()
            };
            const payload = {
                sitE_ID: 0,
                sitE_LKRS_ID: "",
                sitE_SHAPETYPE: "",
                sitE_NO: "",
                sitE_AREA: "",
                sitE_TYPEID: "",
                sitE_AREAINSQFT: "",
                sitE_AREAINSQMT: "",
                sitE_LATITUDE: "",
                sitE_LONGITUDE: "",
                sitE_OWNER: "",
                sitE_CORNERPLOT: "",
                sitE_NO_OF_SIDES: "",
                sitE_EPID: "",
                sitE_SASNO: "",
                sitE_NORTH: "",
                sitE_SOUTH: "",
                sitE_EAST: "",
                sitE_WEST: "",
                sitE_REMARKS: "",
                sitE_ADDITIONALINFO: "",
                sitE_CREATEDBY: "",
                sitE_CREATEDNAME: "",
                sitE_CREATEDROLE: "",
                siteDimensions: [
                    {
                        sitediM_ID: 0,
                        sitediM_LKRS_ID: 0,
                        sitediM_SITE_ID: 0,
                        sitediM_SIDEINFT: 0,
                        sitediM_SIDEINMT: 0,
                        sitediM_ROADFACING: true,
                        sitediM_REMARKS: "",
                        sitediM_ADDITIONALINFO: "",
                        sitediM_CREATEDBY: 0,
                        sitediM_CREATEDNAME: "",
                        sitediM_CREATEDROLE: ""
                    }
                ]
            };

            setAllSites(prev => [...prev, newRow]);
            setSiteData(prev => [...prev, newRow]);
            resetFormFields();

            Swal.fire({
                title: "Success!",
                text: "Regular site record saved successfully.",
                icon: "success",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: true
            });
        }

        if (shape === "irregular" && irregularFinalValidation()) {
            const uniqueId = `REG-${String(siteIdCounter).padStart(3, '0')}`;
            setSiteIdCounter(prev => prev + 1); // ✅ only increment when validation passes

            const newRow = {
                id: uniqueId,
                regularShape: "Irregular",
                siteNumber: irregular_siteNumber,
                blockArea: irregular_blockArea,
                totalArea,
                cornerSite: irregularcornerSite,
                siteType: irregularsiteType,
                chakbandiEast: irregularchakbandiEast,
                chakbandiWest: irregularchakbandiWest,
                chakbandiSouth: irregularchakbandiSouth,
                chakbandiNorth: irregularchakbandiNorth,
                latitude,
                longitude,
                resultType,
                irregularAreaSqFt,
                irregularAreaSqM,
                numberOfSides: numSides,
                sides: sides.map(side => ({
                    lengthInFeet: side.lengthInFeet,
                    lengthInMeter: side.lengthInMeter,
                    roadFacing: side.roadFacing
                })),
                currentDateTime: new Date().toISOString()
            };
            const payload = {
                sitE_ID: 0,
                sitE_LKRS_ID: "",
                sitE_SHAPETYPE: "",
                sitE_NO: "",
                sitE_AREA: "",
                sitE_TYPEID: "",
                sitE_AREAINSQFT: "",
                sitE_AREAINSQMT: "",
                sitE_LATITUDE: "",
                sitE_LONGITUDE: "",
                sitE_OWNER: "",
                sitE_CORNERPLOT: "",
                sitE_NO_OF_SIDES: "",
                sitE_EPID: "",
                sitE_SASNO: "",
                sitE_NORTH: "",
                sitE_SOUTH: "",
                sitE_EAST: "",
                sitE_WEST: "",
                sitE_REMARKS: "",
                sitE_ADDITIONALINFO: "",
                sitE_CREATEDBY: "",
                sitE_CREATEDNAME: "",
                sitE_CREATEDROLE: "",
                siteDimensions: [
                    {
                        sitediM_ID: 0,
                        sitediM_LKRS_ID: 0,
                        sitediM_SITE_ID: 0,
                        sitediM_SIDEINFT: 0,
                        sitediM_SIDEINMT: 0,
                        sitediM_ROADFACING: true,
                        sitediM_REMARKS: "",
                        sitediM_ADDITIONALINFO: "",
                        sitediM_CREATEDBY: 0,
                        sitediM_CREATEDNAME: "",
                        sitediM_CREATEDROLE: ""
                    }
                ]
            };

            setAllSites(prev => [...prev, newRow]);
            setIrregularSiteData(prev => [...prev, newRow]);
            setNumSidesData(numSides);
            resetIrregularFormFields();

            Swal.fire({
                title: "Success!",
                text: "Irregular site record saved successfully.",
                icon: "success",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: true
            });
        }
    };
    const Save_Handler = () => {
        if (!layoutSiteCount) {
            setLayoutSiteCountError("Total number of sites is required");
            return;
        }

        if (totalSitesCount !== totalAddedSites) return;

        console.log("Saving data...");
        setIsAddDisabled(true);

    };

    const Edit_Handler = () => {
        setIsAddDisabled(false);
        console.log("Saving data...");

    };
    //map block
    const mapRef = useRef(null);
    const searchInputRef = useRef(null);
    const [latitude, setLatitude] = useState('N/A');
    const [latitudeerror, setLatitudeError] = useState('');
    const [longitude, setLongitude] = useState('N/A');
    const [longitudeerror, setLongitudeError] = useState('');
    const [resultType, setResultType] = useState('Please select a property on Google Maps: *');
    const [resultTypeError, setResultTypeError] = useState('');

    const markerRef = useRef(null);
    const mapInstance = useRef(null);
    const geocoder = useRef(null);
    const service = useRef(null);
    // const autocomplete = useRef(null);

    useEffect(() => {
        const initMap = () => {
            const center = { lat: 12.9716, lng: 77.5946 };

            const map = new window.google.maps.Map(mapRef.current, {
                center,
                zoom: 17,
                mapTypeId: 'hybrid',
            });

            mapInstance.current = map;

            const marker = new window.google.maps.Marker({
                map,
                draggable: true,
            });
            markerRef.current = marker;

            geocoder.current = new window.google.maps.Geocoder();
            service.current = new window.google.maps.places.PlacesService(map);



            map.addListener('click', (event) => {
                const location = event.latLng;
                moveMapTo(location, "");

                geocoder.current.geocode({ location }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        moveMapTo(location, "", results[0].formatted_address);
                    }
                });
            });

            marker.addListener('dragend', (event) => {
                const location = event.latLng;
                moveMapTo(location, "Dragged Result");

                geocoder.current.geocode({ location }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        moveMapTo(location, "Dragged Result", results[0].formatted_address);
                    }
                });
            });
        };

        if (window.google) {
            initMap();
        }
    }, []);

    const moveMapTo = (location, title, formatted_address = '') => {
        if (!location) return;
        mapInstance.current.setCenter(location);
        markerRef.current.setPosition(location);
        setLatitude(location.lat().toFixed(6));
        setLongitude(location.lng().toFixed(6));
        setResultType(`${title} ${formatted_address}`);
    };

    const handleSmartSearch = () => {
        const input = searchInputRef.current.value.trim();
        const latLngPattern = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
        const match = input.match(latLngPattern);

        if (match) {
            // Handle lat, lng
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[3]);

            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                alert("Invalid latitude or longitude values.");
                return;
            }

            const location = new window.google.maps.LatLng(lat, lng);
            moveMapTo(location, "Coordinates Search");

            geocoder.current.geocode({ location }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    moveMapTo(location, "", results[0].formatted_address);
                }
            });
        } else {
            // Handle text address/landmark
            const request = {
                query: input,
                fields: ['name', 'geometry'],
            };

            service.current.findPlaceFromQuery(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
                    moveMapTo(results[0].geometry.location, "Landmark Search", results[0].name);
                } else {
                    setResultType("No results found. Please try again.");
                    setLatitude("N/A");
                    setLongitude("N/A");
                }
            });
        }
    };

    const [isReadOnly, setIsReadOnly] = useState(false);  // To disable input
    const [showEditBtn, setShowEditBtn] = useState(false);

    //Edit button 
    const handle_Edit = () => {
        setIsReadOnly(false);        // Re-enable input and Save
        setShowEditBtn(false);       // Hide Edit button
    };

    //save and next proceed btn API
    const handle_Save = () => {
        const totalSitesCount = parseInt(layoutSiteCount, 10);

        // Validate layoutSiteCount
        if (!layoutSiteCount || isNaN(totalSitesCount) || totalSitesCount <= 0) {
            setLayoutSiteCountError("Please enter a valid number of total sites");
            layoutSiteCountRef.current?.focus();
            return;
        }

        const storedSiteCount = parseInt(localStorage.getItem("NUMBEROFSITES"), 10);
        const totalAddedSites = allSites.length;

        // Check if trying to reduce below original count
        if (totalSitesCount < storedSiteCount || totalAddedSites > totalSitesCount) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Site Count",
                text: `You cannot reduce the number of sites below the original count: ${storedSiteCount}`,
            });
            return; // ❗ Stop execution if invalid
        }

        // ✅ If all validations passed
        setIsReadOnly(true);
        setShowEditBtn(true);
    };


    //Add site button click API
    const addSites = async (shape) => {
        if (!layoutSiteCount || totalSitesCount <= 0) {
            setLayoutSiteCountError("Please enter a valid number of total sites");
            layoutSiteCountRef.current?.focus();
            return;
        }
        //First section save button condition
        if (!isRTCSectionSaved && !isEPIDSectionSaved) {
            Swal.fire("Please save the land details before proceeding with layout approval", "", "warning");
            return;
        }

        const totalAddedSites = allSites.length;

        if (totalAddedSites >= totalSitesCount) {
            setIsAddDisabled(true);
            Swal.fire({
                title: "Limit Reached",
                text: `Only ${totalSitesCount} sites allowed. Please update the total number of sites if needed.`,
                icon: "warning",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: true
            }).then(() => {
                layoutSiteCountRef.current?.focus();
            });
            return;
        }

        const isRegular = shape === "regular";
        const isIrregular = shape === "irregular";

        const isValid = isRegular ? finalValidation() : isIrregular ? irregularFinalValidation() : false;
        if (!isValid) return;

        setSiteIdCounter(prev => prev + 1);

        // Prepare siteDimensions
        const siteDimensions = isRegular ? [
            {
                sitediM_ID: 0,
                sitediM_LKRS_ID: localLKRSID,
                sitediM_SITE_ID: 0,
                sitediM_SIDEINFT: parseFloat(eastwestFeet) || 0,
                sitediM_SIDEINMT: parseFloat(eastwestMeter) || 0,
                sitediM_ROADFACING: side1RoadFacing,
                sitediM_REMARKS: "",
                sitediM_ADDITIONALINFO: "",
                sitediM_CREATEDBY: createdBy,
                sitediM_CREATEDNAME: createdName,
                sitediM_CREATEDROLE: roleID
            },
            {
                sitediM_ID: 0,
                sitediM_LKRS_ID: localLKRSID,
                sitediM_SITE_ID: 0,
                sitediM_SIDEINFT: parseFloat(northsouthFeet) || 0,
                sitediM_SIDEINMT: parseFloat(northsouthMeter) || 0,
                sitediM_ROADFACING: side2RoadFacing,
                sitediM_REMARKS: "",
                sitediM_ADDITIONALINFO: "",
                sitediM_CREATEDBY: createdBy,
                sitediM_CREATEDNAME: createdName,
                sitediM_CREATEDROLE: roleID
            }
        ] : sides.map(side => ({
            sitediM_ID: 0,
            sitediM_LKRS_ID: localLKRSID,
            sitediM_SITE_ID: 0,
            sitediM_SIDEINFT: parseFloat(side.lengthInFeet) || 0,
            sitediM_SIDEINMT: parseFloat(side.lengthInMeter) || 0,
            sitediM_ROADFACING: side.roadFacing,
            sitediM_REMARKS: "",
            sitediM_ADDITIONALINFO: "",
            sitediM_CREATEDBY: createdBy,
            sitediM_CREATEDNAME: createdName,
            sitediM_CREATEDROLE: roleID
        }));

        let no_of_sites = Number(localStorage.getItem("NUMBEROFSITES")) || 0;
        let updated_sites = "";
        let status_site = true;
        const NoofSites = parseInt(layoutSiteCount, 10);

        // ✅ Validate: layoutSiteCount should not be less than no_of_sites
        if (layoutSiteCount < no_of_sites) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Site Count",
                text: "You cannot reduce the number of sites below the original count.",
            });
            return; // Stop execution if validation fails
        }

        // ✅ Update logic
        if (NoofSites === no_of_sites) {
            updated_sites = NoofSites;
            status_site = false;
        } else if (NoofSites != no_of_sites) {
            updated_sites = NoofSites;
            status_site = true;
        }

        // Prepare payload
        const payload = {
            sitE_ID: 0,
            sitE_LKRS_ID: localLKRSID,
            sitE_SHAPETYPE: isRegular ? "Regular" : "Irregular",
            sitE_NO: isRegular ? regular_siteNumber : irregular_siteNumber,
            sitE_AREA: isRegular ? blockArea : irregular_blockArea,
            sitE_TYPEID: isRegular ? siteType : irregularsiteType,
            sitE_AREAINSQFT: isRegular ? regularAreaSqFt : irregularAreaSqFt,
            sitE_AREAINSQMT: isRegular ? regularAreaSqM : irregularAreaSqM,
            sitE_LATITUDE: latitude,
            sitE_LONGITUDE: longitude,
            sitE_OWNER: ownerNames,
            sitE_CORNERPLOT: false,
            sitE_NO_OF_SIDES: isRegular ? 2 : numSides,
            sitE_EPID: "",
            sitE_SASNO: "",
            sitE_NORTH: isRegular ? chakbandiNorth : irregularchakbandiNorth,
            sitE_SOUTH: isRegular ? chakbandiSouth : irregularchakbandiSouth,
            sitE_EAST: isRegular ? chakbandiEast : irregularchakbandiEast,
            sitE_WEST: isRegular ? chakbandiWest : irregularchakbandiWest,
            sitE_REMARKS: "",
            sitE_ADDITIONALINFO: "",
            sitE_CREATEDBY: createdBy,
            sitE_CREATEDNAME: createdName,
            sitE_CREATEDROLE: roleID,
            lkrS_NUMBEROFSITES: updated_sites,
            updatE_LKRS_NUMBEROFSITES: status_site,
            siteDimensions
        };

        try {
            start_loader();
            const response = await individualSiteAPI(payload);

            if (response.responseStatus === true) {
                await fetchSiteDetails(localLKRSID);

                Swal.fire({
                    title: response.responseMessage,
                    icon: "success",
                    confirmButtonText: "OK",
                });

                if (isRegular) {
                    resetFormFields();
                } else {
                    setNumSidesData(numSides);
                    resetIrregularFormFields();
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
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader();
        }
    };

    const [ownerList, setOwnerList] = useState([]);
    const [ownerNames, setOwnerNames] = useState('');
    //multiple owner list fetch
    const fetchOwners = async (LKRSID) => {
        try {
            const apiResponse = await ownerEKYC_Details("1", LKRSID);
            console.log("multiple Owner", apiResponse);

            const owners = (apiResponse || []).map(owner => ({
                name: owner.owN_NAME_EN,
                id: owner.owN_ID,
            }));

            setOwnerList(owners);

            const ownerNameList = owners.map(o => o.name).join(', ');
            setOwnerNames(ownerNameList); // 🟢 Set comma-separated owner names

        } catch (error) {
            setOwnerList([]);
            setOwnerNames(''); // fallback if API fails
        }
    };

    const fetchSiteDetails = async (LKRS_ID) => {
        const storedSiteCount = localStorage.getItem("NUMBEROFSITES");
        if (storedSiteCount) {
            setLayoutSiteCount(storedSiteCount);
            setIsReadOnly(true);          // Make input and Save button readonly/disabled
            setShowEditBtn(true);
        }
        try {
            const listPayload = {
                level: 1,
                LkrsId: LKRS_ID,
                SiteID: 0,
            };
            start_loader();
            const response = await individualSiteListAPI(listPayload);

            if (Array.isArray(response)) {
                setAllSites(response);
                console.log("sitedetails", response);

                if (response.length === 0) {
                    console.log("No site data found.");
                } else {
                    // ✅ Log lkrS_NUMBEROFSITES from the first item (or loop if needed)
                    const totalSitesFromAPI = response[0]?.lkrS_NUMBEROFSITES;
                    console.log("Total sites (lkrS_NUMBEROFSITES):", totalSitesFromAPI);
                    localStorage.setItem("NUMBEROFSITES", totalSitesFromAPI);
                    // You can also handle this value further
                    if (typeof totalSitesFromAPI === 'number' && totalSitesFromAPI > 0) {
                        // Do something if needed
                    }

                    // Show Swal only if you intend to show an error
                    Swal.fire({
                        text: response.responseMessage || "No data found.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            }

        } catch (error) {
            console.error("Fetch Site Details Error:", error);

            if (error.response) {
                console.error("API responded with error data:", error.response.data);
            } else if (error.request) {
                console.error("No response received from API. Request was:", error.request);
            }

            Swal.fire({
                text: "Something went wrong. Please try again later (site).",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
        finally {
            stop_loader();
        }
    };

    //same as previous checkbox
    const handleCheckboxAndPrefillSite = (e) => {
        const checked = e.target.checked;
        setIsChecked(checked);

        if (checked) {
            const regularSites = allSites.filter(site => site.sitE_SHAPETYPE === "Regular");
            const sortedByDate = regularSites.sort((a, b) => new Date(b.sitE_CREATEDDATE) - new Date(a.sitE_CREATEDDATE));
            const latestSite = sortedByDate[0];

            if (latestSite) {
                setRegular_SiteNumber(latestSite.sitE_NO);
                setBlockArea(latestSite.sitE_AREA);

                // Handle siteDimensions
                const siteDims = latestSite.siteDimensions || [];
                if (siteDims.length >= 2) {
                    const eastWest = siteDims[0];
                    const northSouth = siteDims[1];

                    // East-West
                    setEastwestFeet(eastWest.sitediM_SIDEINFT);
                    setEastwestMeter(eastWest.sitediM_SIDEINMT);
                    setSide1RoadFacing(eastWest.sitediM_ROADFACING);

                    // North-South
                    setNorthsouthFeet(northSouth.sitediM_SIDEINFT);
                    setNorthsouthMeter(northSouth.sitediM_SIDEINMT);
                    setSide2RoadFacing(northSouth.sitediM_ROADFACING);
                }

                setRegularAreaSqFt(latestSite.sitE_AREAINSQFT);
                setRegularAreaSqM(latestSite.sitE_AREAINSQMT);
                setCornerSite(latestSite.sitE_CORNERPLOT);
                setSiteType(latestSite.sitE_TYPEID);
                setChakbandiEast(latestSite.sitE_EAST);
                setChakbandiWest(latestSite.sitE_WEST);
                setChakbandiSouth(latestSite.sitE_SOUTH);
                setChakbandiNorth(latestSite.sitE_NORTH);
                setLatitude(latestSite.sitE_LATITUDE);
                setLongitude(latestSite.sitE_LONGITUDE);
            }
        } else {
            setRegular_SiteNumber("");
        }

        handleFetchPrevious(e);
    };



    return (
        <div> {loading && <Loader />}
            <div className="card">
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>Layout & Individual sites Details</h5>
                </div>
                <div className="card-body">
                    <fieldset disabled={isAddDisabled}>
                        <div className="row align-items-center mb-3">
                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                                <div className="form-group">
                                    <label htmlFor="totalArea" className="col-form-label fw-semibold">
                                        Total Area of the layout  <span className='mandatory_color'>*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="Enter the total area of the layout"
                                            value={totalSQFT}
                                            readOnly
                                        />
                                        <span className="input-group-text">Sq Ft</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                                <div className="form-group">
                                    <label htmlFor="totalArea" className="col-form-label fw-semibold mt-4">
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="Enter the total are of the layout"
                                            value={totalSQM}
                                            readOnly
                                        />
                                        <span className="input-group-text">Sq M</span>

                                    </div>
                                </div>
                            </div>
                            <div className='col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3'>
                                <div className="form-group mt-2">
                                    <label className='form-label'>
                                        Total number of sites <span className='mandatory_color'>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        ref={layoutSiteCountRef}
                                        className="form-control"
                                        placeholder="Enter Total number of sites"
                                        value={layoutSiteCount}
                                        maxLength={15}
                                        onChange={handleLayoutSiteCountChange}
                                        readOnly={isReadOnly}

                                    />
                                    {layoutSiteCountError && (
                                        <small className="text-danger">{layoutSiteCountError}</small>
                                    )}
                                </div>
                            </div>
                            <div className='col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10 mb-3'></div>
                            <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mb-3'>
                                <div className="form-group mt-2">
                                    {!isReadOnly && (
                                        <button className='btn btn-success btn-block' onClick={handle_Save}>
                                            Save and continue
                                        </button>
                                    )}
                                    {showEditBtn && (
                                        <button className='btn btn-info btn-block mt-2' onClick={handle_Edit}>
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>


                        <hr className='mt-1' style={{ border: '1px dashed #0077b6' }} />
                        <h4 className='fw-bold fs-7'>Site / Plot wise Details &nbsp;&nbsp;<label className='text-danger' style={{ fontSize: '14px' }}>[ Note: Please enter Correctly as eKhata will be issued as per this ]</label></h4>


                        <div className="row mt-4">
                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mb-3">
                                <div className="row ">
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                        <div className="form-check">
                                            <label className="form-check-label fw-bold"><input className="form-check-input me-2 radioStyle"
                                                type="radio"
                                                value="regular"
                                                checked={shape === "regular"}
                                                onChange={() => setShape("regular")}
                                            />
                                                Regular Shape</label>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                        <div className="form-check">
                                            <label className="form-check-label fw-bold"><input className="form-check-input me-2 radioStyle"
                                                type="radio"
                                                value="irregular"
                                                checked={shape === "irregular"}
                                                onChange={() => setShape("irregular")}
                                            />
                                                Irregular Shape</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {shape === "regular" && (
                            <div className="container mt-3">
                                {/* Conditionally render the Fetch Previous checkbox with custom styling */}
                                {allSites.length > 0 && (
                                    <div className="row">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    id="fetchPrevious"
                                                    className="form-check-input custom-checkbox"
                                                    checked={isChecked}
                                                    onChange={handleCheckboxAndPrefillSite}

                                                />
                                                <label className="form-check-label custom-label" htmlFor="fetchPrevious">
                                                    Same as Previous site details
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}



                                <div className="row align-items-center mb-3 mt-4">
                                    {/* Site Number */}
                                    <div className='col-md-6'>
                                        <div className="form-group mt-2">
                                            <label className='form-label'>
                                                Site Number <span className='mandatory_color'>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter site number"
                                                value={regular_siteNumber}
                                                maxLength={15}
                                                ref={siteNumberRef}
                                                onChange={handleRegular_SiteNumberChange}
                                            />
                                            {regular_siteNumberError && (
                                                <small className="text-danger">{regular_siteNumberError}</small>
                                            )}
                                        </div>
                                    </div>
                                    {/* Block/Area */}
                                    <div className='col-md-6'>
                                        <div className="form-group mt-2">
                                            <label className='form-label'>Block/Area <span className='mandatory_color'>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter block/area"
                                                value={blockArea}
                                                ref={blockAreaRef}
                                                onChange={handleRegular_BlockAreaChange}
                                            />
                                            {blockAreaError && (
                                                <small className="text-danger">{blockAreaError}</small>
                                            )}
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="container ">
                                        <h4 className="mb-4">Enter Side Details</h4>
                                        {/* East-west side length */}
                                        <div className='row mb-3'>

                                            <div className='col-12 col-sm-12 col-md-12 col-lg-2 col-xl-2 mb-3'>
                                                <label className="form-label fw-bold ">East-West side Length  <span className='mandatory_color'>*</span></label>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-5 col-lg-3 col-xl-3 mb-3">
                                                <div className="form-group">

                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Enter the east-west side length"
                                                            value={eastwestFeet}
                                                            ref={eastwestFeetRef}
                                                            maxLength={10}
                                                            onChange={handleEastwestFeetChange}
                                                        />
                                                        <span className="input-group-text">Feet</span>

                                                    </div>{eastwestError && <div className="text-danger">{eastwestError}</div>}
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-2 col-lg-1 col-xl-1 mb-3 text-center">
                                                <div className="form-group ">
                                                    <label className="form-label fw-bold">Or</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-5 col-lg-3 col-xl-3 mb-3">
                                                <div className="form-group">

                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Enter the east-west side length"
                                                            value={eastwestMeter}
                                                            maxLength={10}
                                                            ref={eastwestFeetRef}
                                                            onChange={handleEastwestMeterChange}
                                                        />
                                                        <span className="input-group-text">Meter</span>

                                                    </div>
                                                    {eastwestError && <div className="text-danger">{eastwestError}</div>}
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-6 col-lg-1 col-xl-1 mb-3">
                                                <div className="form-group ">
                                                    <label className="form-label fw-bold">Road Facing  <span className='mandatory_color'>*</span></label>
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-6 col-lg-2 col-xl-2 mb-3">
                                                <div className="form-group ">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="form-check">
                                                            <label className="form-check-label">
                                                                <input
                                                                    type="radio"
                                                                    className="form-check-input me-2 radioStyle"
                                                                    name="roadFacingEastWest"  // Updated name
                                                                    checked={side1RoadFacing === true}
                                                                    ref={side1RoadRef}
                                                                    onChange={() => {
                                                                        setSide1RoadFacing(true);
                                                                        setSide1RoadError('');
                                                                    }}
                                                                />
                                                                Yes</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <label className="form-check-label">
                                                                <input
                                                                    type="radio"
                                                                    className="form-check-input me-2 radioStyle"
                                                                    name="roadFacingEastWest"  // Updated name
                                                                    ref={side1RoadRef}
                                                                    checked={side1RoadFacing === false}
                                                                    onChange={() => {
                                                                        setSide1RoadFacing(false);
                                                                        setSide1RoadError('');
                                                                    }}
                                                                />
                                                                No</label>
                                                        </div>
                                                    </div>
                                                    {side1RoadError && <div className="text-danger">{side1RoadError}</div>}
                                                </div>
                                            </div>
                                        </div>
                                        {/* North-South side length */}
                                        <div className='row mb-3'>

                                            <div className='col-12 col-sm-12 col-md-12 col-lg-2 col-xl-2 mb-3'>
                                                <label className="form-label fw-bold ">North-South side Length  <span className='mandatory_color'>*</span></label>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-5 col-lg-3 col-xl-3 mb-3">
                                                <div className="form-group">

                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Enter the north-south side length"
                                                            value={northsouthFeet}
                                                            maxLength={10}
                                                            ref={northsouthFeetRef}
                                                            onChange={handleNorthsouthFeetChange}
                                                        />
                                                        <span className="input-group-text">feet</span>
                                                    </div>{northsouthError && <div className="text-danger">{northsouthError}</div>}
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-2 col-lg-1 col-xl-1 mb-3 text-center">
                                                <div className="form-group ">
                                                    <label className="form-label fw-bold">Or</label>

                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-12 col-md-5 col-lg-3 col-xl-3 mb-3">
                                                <div className="form-group">

                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            placeholder="Enter the north-south side length"
                                                            value={northsouthMeter}
                                                            ref={northsouthFeetRef}
                                                            maxLength={10}
                                                            onChange={handleNorthsouthMeterChange}
                                                        />
                                                        <span className="input-group-text">Meter</span>
                                                    </div>
                                                    {northsouthError && <div className="text-danger">{northsouthError}</div>}
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-6 col-lg-1 col-xl-1 mb-3">
                                                <div className="form-group ">
                                                    <label className="form-label fw-bold">Road Facing  <span className='mandatory_color'>*</span></label>
                                                </div>
                                            </div>
                                            <div className="col-6 col-sm-6 col-md-6 col-lg-2 col-xl-2 mb-3">
                                                <div className="form-group ">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="form-check">
                                                            <label className="form-check-label"><input
                                                                type="radio"
                                                                className="form-check-input me-2 radioStyle"
                                                                name="roadFacingNorthSouth"  // Updated name
                                                                checked={side2RoadFacing === true}
                                                                ref={side2RoadRef}
                                                                onChange={() => {
                                                                    setSide2RoadFacing(true);
                                                                    setSide2RoadError('');
                                                                }}
                                                            />
                                                                Yes</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <label className="form-check-label"><input
                                                                type="radio"
                                                                className="form-check-input me-2 radioStyle"
                                                                name="roadFacingNorthSouth"  // Updated name
                                                                checked={side2RoadFacing === false}
                                                                ref={side2RoadRef}
                                                                onChange={() => {
                                                                    setSide2RoadFacing(false);
                                                                    setSide2RoadError('');
                                                                }}
                                                            />
                                                                No</label>
                                                        </div>
                                                    </div>
                                                    {side2RoadError && <div className="text-danger">{side2RoadError}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row align-items-center mb-3">
                                        {/* Area */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                                            <label className="form-label">Area</label>
                                            <div className="input-group">
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Area"
                                                        value={regularAreaSqFt}
                                                        readOnly
                                                    />
                                                    <span className="input-group-text">sq.ft</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                                            <label className="form-label">&nbsp;</label>
                                            <div className="input-group">
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Area"
                                                        value={regularAreaSqM}
                                                        readOnly
                                                    />
                                                    <span className="input-group-text">sq.mtr</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Corner Site */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                                            <label className="form-label fw-bold">Corner Site <span className='mandatory_color'>*</span></label>
                                            <div className="d-flex align-items-center gap-3 text-center">
                                                <div className="row w-100">
                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                                        <div className="form-check">
                                                            <label className="form-check-label"><input
                                                                type="radio"
                                                                className="form-check-input me-2 radioStyle"
                                                                name="cornerSite"
                                                                value="yes"
                                                                checked={cornerSite === true}
                                                                ref={cornerSiteRef}
                                                                onChange={() => {
                                                                    setCornerSite(true);
                                                                    setCornerSiteError('');
                                                                }}
                                                            />

                                                                Yes</label>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                                        <div className="form-check">
                                                            <label className="form-check-label"><input
                                                                type="radio"
                                                                className="form-check-input me-2 radioStyle"
                                                                name="cornerSite"
                                                                value="no"
                                                                ref={cornerSiteRef}
                                                                checked={cornerSite === false}
                                                                onChange={() => {
                                                                    setCornerSite(false);
                                                                    setCornerSiteError('');
                                                                }}
                                                            />
                                                                No</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {cornerSiteError && <div className="text-danger">{cornerSiteError}</div>}
                                        </div>
                                        {/* Type of Site Dropdown */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3">
                                            <label className="form-label">Type of Site <span className='mandatory_color'>*</span></label>
                                            <div className="d-flex align-items-center gap-3">
                                                <select
                                                    className="form-select"
                                                    value={siteType}
                                                    ref={siteTypeRef}
                                                    onChange={(e) => {
                                                        setSiteType(e.target.value);
                                                        if (e.target.value !== '') {
                                                            setSiteTypeError('');
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select Site Type</option>
                                                    <option value="1">Civic Amenity</option>
                                                    <option value="2">Commercial</option>
                                                    <option value="3">Industrial</option>
                                                    <option value="4">Park</option>
                                                    <option value="5">Residential</option>
                                                    <option value="6">Sump</option>
                                                    <option value="7">Utility</option>
                                                </select>

                                            </div>
                                            {siteTypeError && (
                                                <small className="text-danger">{siteTypeError}</small>
                                            )}
                                        </div>
                                        {/* Chak Bandi details */}
                                        <h5 className='mt-5'>Chakbandi Details</h5>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mt-3">
                                            <label className="form-label">East <span className='mandatory_color'>*</span></label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control" placeholder='Enter the chakbandi east side details'
                                                    value={chakbandiEast}
                                                    ref={chakbandiEastRef}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                            setChakbandiEast(value);
                                                            setChakbandiEastError("");
                                                        } else {
                                                            setChakbandiEastError("Only letters, numbers, space and . , / \\ # are allowed");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {chakbandiEastError && (
                                                <small className="text-danger">{chakbandiEastError}</small>
                                            )}
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mt-3">
                                            <label className="form-label">West <span className='mandatory_color'>*</span></label>
                                            <div className="input-group">

                                                <input
                                                    type="text"
                                                    className="form-control" placeholder='Enter the chakbandi west side details'
                                                    value={chakbandiWest}
                                                    ref={chakbandiWestRef}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                            setChakbandiWest(value);
                                                            setChakbandiWestError("");
                                                        } else {
                                                            setChakbandiWestError("Only letters, numbers, space and . , / \\ # are allowed");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {chakbandiWestError && (
                                                <small className="text-danger">{chakbandiWestError}</small>
                                            )}
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mt-3">
                                            <label className="form-label">South <span className='mandatory_color'>*</span></label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control" placeholder='Enter the chakbandi south side details'
                                                    value={chakbandiSouth}
                                                    ref={chakbandiSouthRef}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                            setChakbandiSouth(value);
                                                            setChakbandiSouthError("");
                                                        } else {
                                                            setChakbandiSouthError("Only letters, numbers, space and . , / \\ # are allowed");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {chakbandiSouthError && (
                                                <small className="text-danger">{chakbandiSouthError}</small>
                                            )}
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-3 col-xl-3 mt-3">
                                            <label className="form-label">North <span className='mandatory_color'>*</span></label>
                                            <div className="input-group">

                                                <input
                                                    type="text"
                                                    className="form-control" placeholder='Enter the chakbandi north side details'
                                                    value={chakbandiNorth}
                                                    ref={chakbandiNorthRef}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                            setChakbandiNorth(value);
                                                            setChakbandiNorthError("");
                                                        } else {
                                                            setChakbandiNorthError("Only letters, numbers, space and . , / \\ # are allowed");
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {chakbandiNorthError && (
                                                <small className="text-danger">{chakbandiNorthError}</small>
                                            )}
                                        </div>
                                    </div>

                                </div>

                            </div>
                        )}
                        {shape === "irregular" && (
                            <div className="container mt-3">
                                <div className="row align-items-center mb-3">
                                    {/* Site Number */}
                                    <div className='col-md-6'>
                                        <div className="form-group mt-2">
                                            <label className='form-label'>
                                                Site / Plot No <span className='mandatory_color'>*</span>
                                            </label>
                                            <input
                                                type="text" ref={irregular_siteNoref}
                                                className="form-control"
                                                placeholder="Enter Site / Plot number"
                                                value={irregular_siteNumber}
                                                maxLength={15}
                                                onChange={handleirRegular_SiteNumberChange}
                                            />
                                            {irregular_siteNumberError && (
                                                <small className="text-danger">{irregular_siteNumberError}</small>
                                            )}
                                        </div>
                                    </div>
                                    {/* Block/Area */}
                                    <div className='col-md-6'>
                                        <div className="form-group mt-2">
                                            <label className='form-label'>Block/Area <span className='mandatory_color'>*</span></label>
                                            <input type="text"
                                                className="form-control"
                                                maxLength={100}
                                                placeholder="Enter block/area"
                                                value={irregular_blockArea}
                                                onChange={handleirRegular_BlockAreaChange}
                                                ref={irregular_blockArearef} />
                                        </div>{irregular_blockAreaError && <p style={{ color: 'red' }}>{irregular_blockAreaError}</p>}
                                    </div>
                                    {/* No of sides of the sites or plot */}
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                        <div className="form-group mt-2">
                                            <label className="form-label">No of sides of the site / plot <small style={{ color: 'gray' }}>(Can add a minimum of 3 sides and a maximum of 9 sides only.)</small><span className='mandatory_color'>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter no of sides"
                                                value={numSides}
                                                onChange={handleNumSidesChange}
                                                maxLength="1" ref={irregularnumsidesref}
                                            />{numSidesError && <small className="text-danger">{numSidesError}</small>}

                                        </div>

                                    </div>
                                    <div className=" mt-3">
                                        {sides.map((side, index) => (
                                            <div key={side.id} className='row'>

                                                {/* Label */}
                                                <div className='col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2'>
                                                    <label className="form-label fw-bold">Side {side.id} Length <span className='mandatory_color'>*</span></label>
                                                </div>
                                                {/* Feet input */}
                                                <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            ref={sideRefs.current[index]}
                                                            placeholder={`Enter the side ${side.id} Length`}
                                                            value={side.lengthInFeet}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^(?:[1-9][0-9]*)(?:\.\d*)?$/.test(value) || value === "") {
                                                                    handleLengthInFeetChange(index, value);
                                                                }
                                                            }}
                                                        />
                                                        <span className="input-group-text">feet</span>
                                                    </div>
                                                    {sideErrors[index] && sideErrors[index].length !== '' && (
                                                        <div className="text-danger mt-1">{sideErrors[index].length}</div>
                                                    )}
                                                </div>
                                                {/* "or" label */}
                                                <div className="col-12 col-sm-12 col-md-1 col-lg-1 col-xl-1  text-center">
                                                    <label className="form-label fw-bold">or</label>
                                                </div>

                                                {/* Meter input */}
                                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mb-3 ">
                                                    <div className="input-group">
                                                        <input
                                                            type="tel"
                                                            className="form-control" placeholder={`Enter the side ${side.id} Length`}
                                                            value={side.lengthInMeter}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^(?:[1-9][0-9]*)(?:\.\d*)?$/.test(value) || value === "") {
                                                                    handleLengthInMeterChange(index, value);
                                                                }
                                                            }}
                                                        />
                                                        <span className="input-group-text">meter</span>
                                                    </div>
                                                </div>

                                                {/* Road Facing */}
                                                <div className="col-6 col-sm-6 col-md-1 col-lg-1 col-xl-1 mb-3">
                                                    <label className="form-label fw-bold">Road Facing <span className='mandatory_color'>*</span></label>
                                                </div>
                                                <div className="col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2 mb-3">
                                                    <div className="d-flex gap-2">
                                                        <div className="form-check">
                                                            <label className="form-check-label"><input
                                                                type="radio"
                                                                className="form-check-input"
                                                                name={`roadFacing${side.id}`}
                                                                checked={side.roadFacing === true}
                                                                onChange={() => handleRoadFacingChange(index, true)}
                                                            />
                                                                Yes</label>
                                                        </div>
                                                        <div className="form-check">
                                                            <label className="form-check-label"><input
                                                                type="radio"
                                                                className="form-check-input"
                                                                name={`roadFacing${side.id}`}
                                                                checked={side.roadFacing === false}
                                                                onChange={() => handleRoadFacingChange(index, false)}
                                                            />
                                                                No</label>
                                                        </div>
                                                    </div>
                                                    {sideErrors[index] && sideErrors[index].roadFacing !== '' && (
                                                        <div className="text-danger mt-1">{sideErrors[index].roadFacing}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                    {/* Area of site / plot */}
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mb-3">
                                        <label className="form-label">Area <span className='mandatory_color'>*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="tel"
                                                className="form-control"
                                                placeholder="Area"
                                                value={irregularAreaSqFt} ref={irregular_AreaSqFtref}
                                                onChange={handleSqFtChange}
                                            />
                                            <span className="input-group-text">sq.ft</span>
                                        </div>
                                        {irregularAreaSqft_sqM_error && <small className='text-danger'>{irregularAreaSqft_sqM_error}</small>}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-1 col-lg-1 col-xl-1 mb-3 text-center">
                                        <div className="form-group "><br />
                                            <label className="form-label fw-bold">or</label>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mb-3">
                                        <label className="form-label">&nbsp;</label>
                                        <div className="input-group">
                                            <input
                                                type="tel"
                                                className="form-control"
                                                placeholder="Area"
                                                value={irregularAreaSqM}
                                                onChange={handleSqMChange} ref={irregular_AreaSqFtref}
                                            />
                                            <span className="input-group-text">sq.mtr</span>
                                        </div>
                                    </div>
                                    {/* Corner Site */}
                                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mb-3">
                                        <label className="form-label fw-bold">Corner Site <span className='mandatory_color'>*</span></label>
                                        <div className="d-flex align-items-center gap-3 text-center">
                                            <div className="row w-100">
                                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                                    <div className="form-check">
                                                        <label className="form-check-label"><input
                                                            type="radio"
                                                            className="form-check-input me-2 radioStyle"
                                                            name="cornerSite"
                                                            value="yes"
                                                            checked={irregularcornerSite === "yes"}
                                                            ref={irregular_cornerSiteref}
                                                            onChange={() => {
                                                                setIrregularCornerSite("yes");
                                                                setIrregularCornerSiteError('');
                                                            }}
                                                        />
                                                            Yes</label>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 ">
                                                    <div className="form-check">
                                                        <label className="form-check-label"><input
                                                            type="radio"
                                                            className="form-check-input me-2 radioStyle"
                                                            name="cornerSite"
                                                            value="no"
                                                            checked={irregularcornerSite === "no"}
                                                            ref={irregular_cornerSiteref}
                                                            onChange={() => {
                                                                setIrregularCornerSite("no");
                                                                setIrregularCornerSiteError('');
                                                            }}
                                                        />
                                                            No</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {irregularcornerSiteError && <div className="text-danger">{irregularcornerSiteError}</div>}
                                    </div>
                                    {/* Type of Site Dropdown */}
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
                                        <label className="form-label">Type of Site <span className='mandatory_color'>*</span></label>
                                        <div className="d-flex align-items-center gap-3">
                                            <select
                                                className="form-select"
                                                value={irregularsiteType}
                                                ref={irregular_siteTyperef}
                                                onChange={(e) => {
                                                    setIrregularsiteType(e.target.value);
                                                    if (e.target.value !== '') {
                                                        setIrregularsiteTypeError('');
                                                    }
                                                }}
                                            >
                                                <option value="">Select Site Type</option>
                                                <option value="1">Civic Amenity</option>
                                                <option value="2">Commercial</option>
                                                <option value="3">Industrial</option>
                                                <option value="4">Park</option>
                                                <option value="5">Residential</option>
                                                <option value="6">Sump</option>
                                                <option value="7">Utility</option>
                                            </select>

                                        </div>
                                        {irregularsiteTypeError && (
                                            <small className="text-danger">{irregularsiteTypeError}</small>
                                        )}
                                    </div>

                                    <h5 className='mt-5'>Chakbandi Details</h5>
                                    {/* Chak Bandi details */}
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                        <label className="form-label">East <span className='mandatory_color'>*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control" placeholder='Enter the chakbandi east side details'
                                                value={irregularchakbandiEast}
                                                ref={irregular_chakbandiEastref}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                        setIrregularChakbandiEast(value);
                                                        setIrregularChakbandiEastError("");
                                                    } else {
                                                        setIrregularChakbandiEastError("Only letters, numbers, space and . , / \\ # are allowed");
                                                    }
                                                }}
                                            />
                                        </div>
                                        {irregularchakbandiEastError && (
                                            <small className="text-danger">{irregularchakbandiEastError}</small>
                                        )}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                        <label className="form-label">West <span className='mandatory_color'>*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control" placeholder='Enter the chakbandi West side details'
                                                value={irregularchakbandiWest}
                                                ref={irregular_chakbandiWestref}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                        setIrregularChakbandiWest(value);
                                                        setIrregularChakbandiWestError("");
                                                    } else {
                                                        setIrregularChakbandiWestError("Only letters, numbers, space and . , / \\ # are allowed");
                                                    }
                                                }}
                                            />
                                        </div>
                                        {irregularchakbandiWestError && (
                                            <small className="text-danger">{irregularchakbandiWestError}</small>
                                        )}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                        <label className="form-label">North <span className='mandatory_color'>*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control" placeholder='Enter the chakbandi North side details'
                                                value={irregularchakbandiNorth}
                                                ref={irregular_chakbandiNorthref}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                        setIrregularChakbandiNorth(value);
                                                        setIrregularChakbandiNorthError("");
                                                    } else {
                                                        setIrregularChakbandiNorthError("Only letters, numbers, space and . , / \\ # are allowed");
                                                    }
                                                }}
                                            />
                                        </div>
                                        {irregularchakbandiNorthError && (
                                            <small className="text-danger">{irregularchakbandiNorthError}</small>
                                        )}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                        <label className="form-label">South <span className='mandatory_color'>*</span></label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control" placeholder='Enter the chakbandi south side details'
                                                value={irregularchakbandiSouth}
                                                ref={irregular_chakbandiSouthref}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z0-9.,\/\\#\s]*$/.test(value)) {
                                                        setIrregularChakbandiSouth(value);
                                                        setIrregularChakbandiSouthError("");
                                                    } else {
                                                        setIrregularChakbandiSouthError("Only letters, numbers, space and . , / \\ # are allowed");
                                                    }
                                                }}
                                            />
                                        </div>
                                        {irregularchakbandiSouthError && (
                                            <small className="text-danger">{irregularchakbandiSouthError}</small>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </fieldset>
                </div>
            </div>
            <div className="card">
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>Find Layout on Google Map & tap in middle of site to capture sites GPS</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                            <b>Search using nearest landmark near your layout - once you zoom there then locate your individual layout & tap on top middle of your layout</b>
                            <br /><span>Note : Search nearest landmark & then find layout & site near the landmark</span>
                            <br />
                        </div>
                        <div className="col-md-12 col-lg-12 col-sm-12 mb-4 position-relative mt-2">
                            <div className='row'>
                                <div className="col-md-10 col-lg-10 col-sm-12 col-xl-10 col-12">
                                    <input ref={searchInputRef} className="form-control autocomplete-container" type="text" placeholder="Search nearest landmark near your layout" />
                                </div>
                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                    <button onClick={handleSmartSearch} className="btn btn-primary">Search</button>
                                </div>
                            </div>


                        </div>
                        <div className="col-md-12 col-lg-12 col-sm-12 mb-3">
                            <div id="map" ref={mapRef} style={{ height: "500px" }}></div>
                        </div>
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                            <div className="row p-3  rounded shadow-sm">
                                {/* Result Type */}
                                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mb-2 text-center">
                                    <span id="resultType" className="fw-bold text-primary fs-5">{resultType}</span>
                                </div>
                                {resultTypeError && (
                                    <div className="text-danger text-center mt-1">{resultTypeError}</div>
                                )}

                                {/* Latitude */}
                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6   text-center mb-2">
                                    <label className='form-label'>latitude</label>  <input
                                        type="text"
                                        className="form-control text-center text-success"
                                        value={latitude}
                                        ref={latitudeRef}
                                        onChange={(e) => setLatitude(e.target.value)}
                                    />
                                    {latitudeerror && <div className="text-danger">{latitudeerror}</div>}

                                </div>
                                {/* Longitude */}
                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6   text-center">
                                    <label className='form-label'>Longitude</label> <input
                                        type="text"
                                        className="form-control text-center text-success"
                                        value={longitude}
                                        ref={longitudeRef}
                                        onChange={(e) => setLongitude(e.target.value)}
                                    />
                                    {longitudeerror && <div className="text-danger">{longitudeerror}</div>}

                                </div>
                                {/* Owner Name */}
                                <div className="col-md-12 col-lg-12 col-sm-12 text-center">
                                    <span className="fw-semibold text-dark">
                                        Owner Name :
                                        <label className="text-success">
                                            {
                                                ownerList.length > 0
                                                    ? ownerList.map(owner => owner.name).join(", ")
                                                    : "N/A"
                                            }
                                        </label>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10 mt-3"></div>

                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-3">
                            <button className="btn btn-primary btn-block mt-3"
                                //  onClick={() => handle_AddRow(shape)}
                                onClick={() => addSites(shape)}
                            >
                                Add Site
                            </button>
                        </div>
                    </div>
                    {allSites.length > 0 && (
                        <IndividualRegularTable
                            data={allSites}
                            setData={setAllSites}
                            totalSitesCount={totalSitesCount}
                            onSave={Save_Handler}
                            onEdit={Edit_Handler}
                            LKRS_ID={localLKRSID}
                            createdBy={createdBy}
                            createdName={createdName}
                            roleID={roleID}

                        />
                    )}

                </div>

            </div>


        </div>
    );
};
const IndividualRegularTable = ({ data, setData, totalSitesCount, onSave, onEdit, LKRS_ID, createdBy, createdName, roleID }) => {

    useEffect(() => {
        console.log("🔍 Data received in IndividualRegularTable:", data);
    }, [data]);

    const [localLKRSID, setLocalLKRSID] = useState("");

    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        } else {
            // fallback to localStorage if needed
            const id = localStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
        }
    }, [LKRS_ID]);

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const totalAddedSites = data.length;


    //delete site info API
    const handleDeleteSites = async (siteID) => {
        try {
            const listPayloadDelete = {
                level: 1,
                lkrS_ID: LKRS_ID,
                sitE_ID: siteID,
                sitE_REMARKS: "",
                sitE_ADDITIONALINFO: "",
                sitE_UPDATEDBY: createdBy,
                sitE_UPDATEDNAME: createdName,
                sitE_UPDATEDROLE: roleID,
            };

            start_loader();

            const deleteResponse = await deleteSiteInfo(listPayloadDelete);

            if (deleteResponse.responseStatus === true) {
                // Fetch updated site list
                const listPayloadFetch = {
                    level: 1,
                    LkrsId: LKRS_ID,
                    SiteID: 0,
                };

                const fetchResponse = await individualSiteListAPI(listPayloadFetch);

                if (Array.isArray(fetchResponse)) {
                    // ✅ Set updated data into state
                    setData(fetchResponse);

                    Swal.fire({
                        text: deleteResponse.responseMessage || "Site deleted successfully.",
                        icon: "success",
                        confirmButtonText: "OK",
                    });
                } else {
                    Swal.fire({
                        text: fetchResponse.responseMessage || "Failed to fetch updated site list.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } else {
                Swal.fire({
                    text: deleteResponse.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Failed to delete or fetch site data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
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

    const columns = React.useMemo(
        () => [
            {
                Header: "Action",
                id: "delete",
                Cell: ({ row }) => {
                    return (
                        <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteSites(row.original.sitE_ID)}
                        >
                            <i className="fa fa-trash"></i>
                        </button>
                    );
                },
            },
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
                    return `${row.sitE_TYPEID}`;
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
        <div className="card">
            {loading && <Loader />}
            <h4>Layout & Individual sites Details</h4>
            <div className="card-body">
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
                <br />
                <div className='row'>
                    <div className="col-0 col-sm-0 col-md-8 col-lg-8 col-xl-8"></div>
                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2">
                        <div className="form-check">
                            <button
                                className='btn btn-info btn-block'
                                disabled={totalSitesCount !== totalAddedSites}
                                onClick={onEdit}
                            >
                                Add More
                            </button>

                        </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2">
                        <div className="form-check">
                            <button
                                className='btn btn-success btn-block'
                                disabled={totalSitesCount !== totalAddedSites}
                                onClick={onSave}
                            >
                                Save and continue
                            </button>
                            {totalSitesCount !== totalAddedSites && (
                                <small className="text-danger">
                                    Please add all {totalSitesCount} sites before proceeding.
                                </small>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

const Preview_siteDetailsTable = ({ data, setData, totalSitesCount, onSave, onEdit, LKRS_ID, createdBy, createdName, roleID }) => {

    useEffect(() => {
        console.log("🔍 Data received in IndividualRegularTable:", data);
    }, [data]);

    const [localLKRSID, setLocalLKRSID] = useState("");

    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        } else {
            // fallback to localStorage if needed
            const id = localStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
        }
    }, [LKRS_ID]);

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
                    return `${row.sitE_TYPEID}`;
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

const ECDetailsBlock = ({ LKRS_ID, isRTCSectionSaved, isEPIDSectionSaved }) => {
    const [ecNumber, setECNumber] = useState("");
    const [ecNumberError, setEcNumberError] = useState('');
    const [hasJDA, setHasJDA] = useState("");
    const [isRegistered, setIsRegistered] = useState('');
    const [deedNumber, setDeedNumber] = useState("");
    const [deedError, setDeedError] = useState('');

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const [fetchJDA, setFetchJDA] = useState('false');

    const [jdaFile, setJdaFile] = useState(null);
    const [error, setError] = useState('');

    const [createdBy, setCreatedBy] = useState(null);
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');

    useEffect(() => {
        const storedCreatedBy = localStorage.getItem('createdBy');
        const storedCreatedName = localStorage.getItem('createdName');
        const storedRoleID = localStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);

    }, []);
    const [localLKRSID, setLocalLKRSID] = useState("");

    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        } else {
            // fallback to localStorage if needed
            const id = localStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
        }
    }, [LKRS_ID]);

    useEffect(() => {
        if (localLKRSID) {
            handleGetLKRSID(localLKRSID);
        }
    }, [localLKRSID]);

    const handleGetLKRSID = async (localLKRSID) => {
        const payload = {
            level: 1,
            LkrsId: localLKRSID,
        };
        try {
            start_loader();
            const response = await fetch_LKRSID(payload);

            if (response && response.lkrS_ECNUMBER) {
                console.log("lkrS_ECNUMBER", response.lkrS_ECNUMBER);
                setECNumber(response.lkrS_ECNUMBER); // ✅ set ecNumber from response
                setIsJDASectionDisabled(true);
                setShowViewECButton(true);
                stop_loader();
            } else {
                stop_loader();

            }
        } catch (error) {
            stop_loader();
            console.error("Failed to fetch LKRSID data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.Lkrsid",
                icon: "error",
                confirmButtonText: "OK",
            });
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


    const [checkECStatus, setCheckECStatus] = useState(false);
    const [checkDeedStatus, setCheckDeedStatus] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed.');
            setJdaFile(null);
            return;
        }

        // Validate file size (5MB = 5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB.');
            setJdaFile(null);
            return;
        }

        setError('');
        setJdaFile(file);
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
        console.log("Fetching details for EC Number:", ecNumber);


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
                text: "Something went wrong. Please try again later.",
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
            Swal.fire("Please save the land details before proceeding with layout approval", "", "warning");
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

            // ✅ Check if file is uploaded
            if (!file) {
                Swal.fire({
                    text: "File is required. Please upload the JDA document.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
                return;
            }
        }

        start_loader();

        try {
            const payload = {
                jdA_ID: 0,
                jdA_LKRS_ID: localLKRSID,
                jdA_ISREGISTERED: JDAReg,
                jdA_DEED_NO: isRegistered === true ? deedNumber : "",
                jdA_REMARKS: "",
                jdA_ADDITIONALINFO: "",
                jdA_CREATEDBY: createdBy,
                jdA_CREATEDNAME: createdName,
                jdA_CREATEDROLE: roleID,
                lkrS_EC: ecNumber,
                lkrS_IsJDAEXITS: hasJDA,
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

                        setIsJDASectionDisabled(true);

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
                        console.log("Inserted JDA ID:", response.jdA_ID);

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
                        setIsJDASectionDisabled(true);
                        stop_loader();
                        Swal.fire({
                            text: response.responseMessage || "JDA details saved successfully.",
                            icon: "success",
                            confirmButtonText: "OK",
                        });

                        // ✅ Optional: Reset form fields only on success
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
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
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
        console.log("Fetching details for Deed Number:", deedNumber);


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
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader();
        }
    };

    return (
        <div>
            {loading && <Loader />}

            <div className="card">
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>EC Details & JDA Registration</h5>

                </div>
                <div className="card-body">
                    <div className='row'>
                        <h6 className='note_color'>Note : EC should be atleast 1 day before registered deed of property until 31-10-2024 or later. If sale / registered deed date is before 01-04-2004 then EC should be from 01-04-2004 to 31-10-2024 after</h6>
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

                        </div>
                        {isRegistered === true && (
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
                                            onChange={handleDeedChange} maxLength={50} readOnly={isDEEDReadOnly || isJDASectionDisabled}
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
                        {isRegistered === false && (
                            <>
                                <div className='row'>
                                    <hr />
                                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" >
                                        <label className='form-label'>Scan & upload the JDA</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileChange} accept="application/pdf"
                                            disabled={isJDASectionDisabled}
                                        />
                                        <label className="note_color">[ Only PDF files are allowed, file size must be less than 5MB ]</label>
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 ">
                                        <div className="form-group mt-4">
                                            <h5>Note: Please do EKYC of JDA / JDA Representative</h5>
                                        </div>
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
            {(hasJDA === false || isRegistered) && <Owner_EKYCBlock LKRS_ID={LKRS_ID} />}

            {isRegistered && (
                <>
                    <JDA_EKYCBlock LKRS_ID={LKRS_ID} />

                </>
            )}
            {isRegistered === false && (
                <>
                    <Owner_EKYCBlock LKRS_ID={LKRS_ID} />
                    <JDA_EKYCBlock LKRS_ID={LKRS_ID} />
                </>
            )}
        </div>
    );
};
//Owner EKYC Block
const Owner_EKYCBlock = ({ LKRS_ID }) => {
    const [selectedOption, setSelectedOption] = useState('owner');
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [phone, setPhone] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(30);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isVerifyDisabled, setIsVerifyDisabled] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpInputsRef = useRef([]);

    const [createdBy, setCreatedBy] = useState(null);
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');
    const [LKRSID, setLKRSID] = useState('');
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
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
            fetchOwners(LKRS_ID);
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


    const [ownerNames, setOwnerNames] = useState('');

    //multiple owner list fetch
    const fetchOwners = async (LKRSID) => {
        try {
            const apiResponse = await ownerEKYC_Details("1", LKRSID);
            console.log("multiple Owner", apiResponse);

            const owners = (apiResponse || []).map(owner => ({
                name: owner.owN_NAME_EN,
                id: owner.owN_ID,
            }));

            setOwnerList(owners);

            const ownerNameList = owners.map(o => o.name).join(', ');
            setOwnerNames(ownerNameList); // 🟢 Set comma-separated owner names

        } catch (error) {
            setOwnerList([]);
            setOwnerNames(''); // fallback if API fails
        }
    };


    const handleRadioChange = (e) => {
        console.log("Selected:", e.target.value);
        setSelectedOption(e.target.value);
    };

    const [ekycUrl, setEkycUrl] = useState('');
    useEffect(() => {
        const handleMessage = (event) => {
            // Check origin
            if (event.origin !== "http://localhost:3001") return;
            // Check path
            if (window.location.pathname !== "/LayoutForm") return;
            if (event.data.ekycStatus) {
                Swal.fire('eKYC Result', `Status: ${event.data.ekycStatus}`, 'info');
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

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
            try {
                start_loader();

                let OwnerNumber = 1;
                let BOOK_APP_NO = 2;
                let PROPERTY_CODE = 1;

                const response = await ekyc_Details({ OwnerNumber, BOOK_APP_NO, PROPERTY_CODE });

                const resultUrl = await response;

                stop_loader();

                if (resultUrl) {
                    window.open(
                        resultUrl,
                        '_blank',
                        `toolbar=0,location=0,menubar=0,width=${window.screen.width},height=${window.screen.height},top=0,left=0`
                    );
                } else {
                    Swal.fire('Error', 'No redirect URL returned', 'error');
                }
            } catch (error) {
                stop_loader();
                Swal.fire('Error', 'eKYC API call failed', 'error');
                console.error('eKYC API call failed:', error);
            }
        }
    };

    const fetchEKYC_ResponseDetails = async () => {
        try {
            const payload = {
                transactionNumber: 83,
                OwnerType: 'NEWOWNER',
            }

            const response = await ekyc_Response(payload);

            setOwnerData(response);

            const ekycresponse = await insertEKYCDetails(response);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const handleAddOwner = (e) => {
        if (e.key === 'Enter' && newOwnerName.trim()) {
            const newOwner = { name: newOwnerName.trim(), phone: '' };
            const updatedList = [...ownerList, newOwner];
            setOwnerList(updatedList);
            setSelectedOwner(newOwner);
            setOwnerNameInput(newOwner.name);
            setNewOwnerName('');
            setShowInput(false);
            setIsDropdownOpen(false);
        }
    };
    const insertEKYCDetails = async (response) => {
        console.log(response);
        const payloadOwner = {
            owN_ID: 0,
            owN_LKRS_ID: LKRS_ID,
            owN_NAME_KN: "string",
            owN_NAME_EN: "String",
            owN_IDTYPE: "String",
            owN_IDNUMBER: "String",
            owN_RELATIONTYPE: "String",
            owN_RELATIONNAME: "String",
            owN_MOBILENUMBER: "9999999999",
            owN_AADHAARNUMBER: response.maskedAadhaar,
            owN_NAMEASINAADHAAR: response.ownerNameEng,
            owN_AADHAARVERISTATUS: "Success",
            owN_NAMEMATCHSCORE: 0,
            owN_COMPANYOWNPROPERTY: true,
            owN_COMPANYNAME: "String",
            owN_REPRESENTATIVENAME: "String",
            owN_REMARKS: "",
            owN_ADDITIONALINFO: "",
            owN_CREATEDBY: createdBy,
            owN_CREATEDNAME: createdName,
            owN_CREATEDROLE: roleID,
            owN_VAULTREFID: response.vaultRefNumber,
            owN_VAULT_REMARKS: "string",
            owN_ALREADYEXIST_INEAASTHI: true,
            owN_AADHAAR_RESPONSE: JSON.stringify(response),
            own_OwnOrRep: selectedOption
        }
        try {
            start_loader();
            const response = await ekyc_insertOwnerDetails(payloadOwner);

            if (response.responseStatus === true) {
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
            }
        } catch (error) {
            console.error("Failed to insert data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
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



    return (
        <div>
            <div className="card"> {loading && <Loader />}
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>Owner/Owner representative eKYC</h5>
                </div>
                <div className="card-body">
                    <div className='row'>
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                            <label className="form-label">Select Owner / Owner representative : </label>
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
                                <div className="alert alert-info">[Note: Click on eKYC Status button once the ekyc is done to check verification status]</div>

                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-2" >
                                    <label className="form-label">Select Owner <span className='mandatory_color'>*</span></label>
                                </div>
                                <div className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 mt-2">
                                    <button
                                        className="form-control text-start"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                                                                setIsDropdownOpen(false);
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
                                                    onClick={() => setShowInput(true)}
                                                >
                                                    ➕ Add More
                                                </button>
                                            </li>
                                        </ul>

                                    )}
                                </div>

                                <div className="col-0 col-sm-0 col-md-2 col-lg-2 col-xl-2 mt-2" ></div>

                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-4" >
                                    <label className="form-label">{selectedOption === 'owner' ? "Owner Name" : "Representative Name"}   <span className='mandatory_color'>*</span></label>
                                </div>
                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-4" >
                                    <input
                                        type="text"
                                        readOnly
                                        className="form-control"
                                        placeholder={selectedOption === 'owner' ? "Enter the Owner Name" : "Enter the Representative Name"}
                                        value={ownerNameInput}
                                    />
                                </div>
                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-4" >
                                    <button className='btn btn-info btn-block' onClick={handleDoEKYC}>Do eKYC</button>
                                </div>
                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-4" >
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
                            <hr />
                            <div className='row'>
                                {ownerData && (
                                    <div className='col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12'>
                                        <h5>Owner / Owner Representative EKYC Details</h5>
                                        {/* Error Message */}
                                        {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}

                                        {/* Table */}
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
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <img src={usericon} alt="Owner" width="50" height="50" />
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>{ownerData.ownerNameEng || 'N/A'}</td>
                                                    <td style={{ textAlign: 'center' }}>{ownerData.maskedAadhaar || 'N/A'}</td>
                                                    <td style={{ textAlign: 'center' }}>{ownerData.gender || 'N/A'}</td>
                                                    <td style={{ textAlign: 'center' }}>{ownerData.dateOfBirth || 'N/A'}</td>
                                                    <td style={{ textAlign: 'center' }}>{ownerData.addressEng || 'N/A'}</td>
                                                    <td style={{ textAlign: 'center' }}>{ownerData.aadhaarHash ? 'Verified' : 'Not Verified'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
};
const JDA_EKYCBlock = ({ LKRS_ID }) => {
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
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
            fetchOwners(LKRS_ID);
        }
    }, [LKRS_ID]);

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

    //multiple owner list fetch
    const fetchOwners = async (LKRSID) => {
        try {
            const apiResponse = await ownerEKYC_Details("1", LKRSID);
            console.log("multiple Owner", apiResponse);

            const owners = (apiResponse || []).map(owner => ({
                name: owner.owN_NAME_EN,
                id: owner.owN_ID,
            }));
            console.table(owners);
            setOwnerList(owners);

            const ownerNameList = owners.map(o => o.name).join(', ');
            setOwnerNames(ownerNameList); // 🟢 Set comma-separated owner names

        } catch (error) {
            setOwnerList([]);
            setOwnerNames(''); // fallback if API fails
        }
    };




    useEffect(() => {
        const handleMessage = (event) => {
            // Check origin
            if (event.origin !== "http://localhost:3001") return;
            // Check path
            if (window.location.pathname !== "/LayoutForm") return;
            if (event.data.ekycStatus) {
                Swal.fire('eKYC Result', `Status: ${event.data.ekycStatus}`, 'info');
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    //do EKYC API
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
            try {
                let OwnerNumber = 1;
                let BOOK_APP_NO = 2;
                let PROPERTY_CODE = 1;
                const response = await ekyc_Details({ OwnerNumber, BOOK_APP_NO, PROPERTY_CODE });

                const resultUrl = await response;

                if (resultUrl) {
                    window.open(
                        resultUrl,
                        '_blank',
                        `toolbar=0,location=0,menubar=0,width=${window.screen.width},height=${window.screen.height},top=0,left=0`
                    );
                } else {
                    Swal.fire('Error', 'No redirect URL returned', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'eKYC API call failed', 'error');
                console.error('eKYC API call failed:', error);
            }
        }
    };

    const fetchEKYC_ResponseDetails = async () => {
        try {
            const payload = {
                transactionNumber: 83,
                OwnerType: 'NEWOWNER',
            }

            const response = await ekyc_Response(payload);

            setOwnerData(response);

            const ekycresponse = await insertEKYCDetails(response);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const insertEKYCDetails = async (response) => {
        console.log(response);
        const payloadOwner = {
            owN_ID: 0,
            owN_LKRS_ID: LKRSID,
            owN_NAME_KN: "string",
            owN_NAME_EN: "String",
            owN_IDTYPE: "String",
            owN_IDNUMBER: "String",
            owN_RELATIONTYPE: "String",
            owN_RELATIONNAME: "String",
            owN_MOBILENUMBER: "9999999999",
            owN_AADHAARNUMBER: response.maskedAadhaar,
            owN_NAMEASINAADHAAR: response.ownerNameEng,
            owN_AADHAARVERISTATUS: "Success",
            owN_NAMEMATCHSCORE: 0,
            owN_COMPANYOWNPROPERTY: true,
            owN_COMPANYNAME: "String",
            owN_REPRESENTATIVENAME: "String",
            owN_REMARKS: "",
            owN_ADDITIONALINFO: "",
            owN_CREATEDBY: createdBy,
            owN_CREATEDNAME: createdName,
            owN_CREATEDROLE: roleID,
            owN_VAULTREFID: response.vaultRefNumber,
            owN_VAULT_REMARKS: "string",
            owN_ALREADYEXIST_INEAASTHI: true,
            owN_AADHAAR_RESPONSE: JSON.stringify(response),
        }
        try {
            start_loader();
            const response = await ekyc_insertOwnerDetails(payloadOwner);

            if (response.responseStatus === true) {
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
            }
        } catch (error) {
            console.error("Failed to insert data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
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
                                />

                            </div>
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2" >
                                <button className='btn btn-info btn-block' onClick={handleDoEKYC}>Do eKYC</button>
                            </div>
                            <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2" >
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
                            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3">
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    maxLength={10}
                                    className="form-control"
                                    placeholder="Enter the Phone Number"
                                    readOnly={isVerified}
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

                            <div className='col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3'>
                                {!isOtpSent && !isVerified && (
                                    <button className="btn btn-info" onClick={handleSendOtp}>
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

                    {ownerData && (

                        <div className='col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12'>
                            <hr />
                            <h5>JDA / JDA Representative EKYC Details</h5>
                            {/* Error Message */}
                            {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}

                            {/* Table */}

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
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ textAlign: 'center' }}> <img
                                            src={usericon}
                                            alt="Owner"
                                            width="50"
                                            height="50"
                                        />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{ownerData.ownerNameEng || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>{ownerData.maskedAadhaar || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>{ownerData.gender || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>{ownerData.dateOfBirth || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>{ownerData.addressEng || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>{ownerData.aadhaarHash ? 'Verified' : 'Not Verified'}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className='col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-3'>
                                <button className="btn btn-info" >
                                    Save
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
//Declaration Block
const DeclarationBlock = ({ LKRS_ID, createdBy, createdName, roleID }) => {
    const { t, i18n } = useTranslation();

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    const [selectedLandType, setSelectedLandType] = useState("");
    let individualShape = "Regular";
    const thStyle = {
        padding: "10px",
        textAlign: "center",
        fontWeight: "bold",
        border: "1px solid #ccc",
        fontFamily: "Georgia, serif",
    };

    const tdStyle = {
        padding: "10px",
        textAlign: "center",
        border: "1px solid #ccc",
        fontFamily: "Georgia, serif",
    };
    const buttonStyle = {
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px"
    };

    const handleDownloadPDF = async () => {
        const input = document.getElementById('modal-content');
        if (!input) {
            console.error('Element with ID "modal-content" not found.');
            return;
        }
        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
            });

            const imgData = canvas.toDataURL('image/png');

            // Fix: create image object first
            const img = new Image();
            img.src = imgData;

            img.onload = () => {
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = (img.height * imgWidth) / img.width;

                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(img, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(img, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                const now = new Date();
                const dateString = now.toLocaleDateString('en-GB').split('/').reverse().join('-');
                const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-');
                const fileName = `${dateString}_${timeString}_layout_khata_details.pdf`;

                pdf.save(fileName);
            };

            img.onerror = (e) => {
                console.error('Failed to load image:', e);
            };

        } catch (error) {
            console.error('Error generating or saving PDF:', error);
        }
    };

    const handleFileClick = (file) => {
        console.log(file);  // Check what the file contains
        if (file) {
            window.open(file, '_blank');
        } else {
            console.error("File is missing:", file);
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

    // =======================================================survey no details starts=========================================
    const [rtcAddedData, setRtcAddedData] = useState([]);
    const [areaSqft, setAreaSqft] = useState("0");

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [rtcData, setRtcData] = useState([]);
    const combinedData = [...rtcAddedData, ...rtcData];

    let totalAcre = 0;
    let totalGunta = 0;
    let totalFGunta = 0;
    let totalSqFt = 0;

    useEffect(() => {
        combinedData.forEach(row => {
            const acre = parseFloat(row.ext_acre || 0);
            const gunta = parseFloat(row.ext_gunta || 0);
            const fgunta = parseFloat(row.ext_fgunta || 0);

            totalAcre += acre;
            totalGunta += gunta;
            totalFGunta += fgunta;

            const sqft = (acre * 43560) + (gunta * 1089) + (fgunta * 68.0625);
            totalSqFt += sqft;
        });

        // Normalize fgunta -> gunta and acre
        totalGunta += Math.floor(totalFGunta / 16);
        totalFGunta = totalFGunta % 16;
        totalAcre += Math.floor(totalGunta / 40);
        totalGunta = totalGunta % 40;

        const totalSqFtRounded = totalSqFt.toFixed(2);
        setAreaSqft(totalSqFtRounded);
        localStorage.setItem('areaSqft', totalSqFtRounded);
        console.log("sqftRounded", totalSqFtRounded);
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
        setCurrentPage(1); // Reset to first page when page size changes
    };


    const [localLKRSID, setLocalLKRSID] = useState(LKRS_ID || "");
    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        }
    }, [LKRS_ID]);
    useEffect(() => {
        if (localLKRSID) {

        }
    }, [localLKRSID]);
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
            ext_fgunta: item.suR_EXTFgunta || 0, // Make sure to handle this if needed
        }));
    };


    // =======================================================Khata details starts=========================================
    const [epidshowTable, setEPIDShowTable] = useState(false);
    const [epid_fetchedData, setEPID_FetchedData] = useState(null);
    const [phoneNumbers, setPhoneNumbers] = useState({});
    const [ownerTableData, setOwnerTableData] = useState([]);

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

                setSelectedLandType(response.lkrS_LANDTYPE); // ✅ Store the land type


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
                setSelectedLandType(response.lkrS_LANDTYPE); // ✅ Store the land type
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
                    setAreaSqft(khataDetailsJson.siteDetails.siteArea);
                    localStorage.setItem('areaSqft', khataDetailsJson.siteDetails.siteArea);
                } else {
                    setAreaSqft(0);
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
            Swal.fire({
                text: "Something went wrong. Please try again later.Lkrsid",
                icon: "error",
                confirmButtonText: "OK",
            });
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
            selector: row => {
                if (row.releaseType === "1") return "100%";
                else if (row.releaseType === "2") return "60*40";
                else if (row.releaseType === "3") return "40*30*30";
                else return "-";
            }, center: true,
            sortable: true,
        },
        // {
        //     name: t('translation.BDA.table1.action'),
        //     center: true,
        //     cell: (row, index) => (
        //         <div>
        //             {/* <button
        //                 className="btn btn-warning btn-sm me-2"
        //                 onClick={() => handleOrderEdit(index)} disabled={!isOrder_Editing}
        //             >
        //                 <i className="fa fa-pencil"></i>
        //             </button> */}
        //             <button
        //                 className="btn btn-danger btn-sm"

        //             >
        //                 <i className="fa fa-trash"></i>
        //             </button>
        //         </div>
        //     ),
        //     ignoreRowClick: true,
        //     allowOverflow: true,
        //     button: true,
        // },

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
        // {
        //     name: t('translation.BDA.table.action'),
        //     cell: (row, index) => (
        //         <div>
        //             {/* <button
        //                 className="btn btn-warning btn-sm me-2"
        //                 onClick={() => handleEdit(index)} disabled={!isEditing}
        //             >
        //                 <i className="fa fa-pencil"></i>
        //             </button> */}
        //             <button
        //                 className="btn btn-danger btn-sm"
        //                 // onClick={() => handleDelete(index)} 
        //                 onClick={showImplementationAlert}
        //             >
        //                 <i className="fa fa-trash"></i>
        //             </button>
        //         </div>
        //     ),
        //     ignoreRowClick: true,
        //     allowOverflow: true,
        //     button: true,
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
                    releaseType: item.sitE_RELS_SITE_RELSTYPE_ID,
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
                setAllSites(response); // ✅ Update state with API data


            } else {
                Swal.fire({
                    text: response.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Failed to insert data:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.site",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader();
        }
    }

    // =============================================OwnerEKYC details starts=====================================

    const [ownerList, setOwnerList] = React.useState([]);
    const [ownerNames, setOwnerNames] = React.useState('');

    const fetch_ownerDetails = async (localLKRSID) => {
        try {
            start_loader(); // Start loader
            const apiResponse = await ownerEKYC_Details("1", localLKRSID);
            console.log("multiple Owner", apiResponse);

            // Set full owner list
            setOwnerList(apiResponse || []);

            // Create comma-separated owner names
            const ownerNameList = (apiResponse || [])
                .map(owner => owner.owN_NAME_EN)
                .filter(name => !!name)  // Filter out null/undefined names
                .join(', ');
            setOwnerNames(ownerNameList);

        } catch (error) {
            console.error("Failed to fetch owner details:", error);
            Swal.fire({
                text: "Something went wrong. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader(); // Stop loader
        }
    };
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
            name: 'ID Type',
            selector: row => row.owN_IDTYPE || 'N/A',
        },
        {
            name: 'ID Number',
            selector: row => row.owN_IDNUMBER || 'N/A',
        },
    ];



    const handlePreviewClick = async () => {
        if (!localLKRSID) return;
        await handleGetLKRSID(localLKRSID);
        await fetchApprovalList(localLKRSID);
        await fetchReleaseList(localLKRSID);
        await fetchSiteDetails(localLKRSID);
        await fetch_ownerDetails(localLKRSID);
        setIsModalOpen(true); // Show modal after fetching
    };


    return (
        <div className="card"> {loading && <Loader />}
            <div className="card-header layout_btn_color" >
                <h5 className="card-title" style={{ textAlign: 'center' }}>{t('translation.LayoutDeclartion.heading')}</h5>

            </div>
            <div className="card-body">
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="declarationCheckbox"
                    />
                    <label className="form-check-label" >
                        {t('translation.LayoutDeclartion.title1')}
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="declarationCheckbox"
                    />
                    <label className="form-check-label" >
                        {t('translation.LayoutDeclartion.title2')}
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="declarationCheckbox"
                    />
                    <label className="form-check-label" >
                        {t('translation.LayoutDeclartion.title3')}
                    </label>
                </div>
                <div className='row'>
                    <div className='col-md-3 mt-2'>
                        <button onClick={handlePreviewClick} className='btn btn-warning btn-block'>Preview</button>
                    </div>
                    <div className='col-md-3 mt-2'>
                        <button className='btn btn-primary btn-block'>{t('translation.buttons.save&submit')}</button>
                    </div>
                </div>



                <div id="modal-content">
                    <Modal isOpen={isModalOpen} onClose={closeModal}>
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
                                    )
                                    }
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
                                </>
                            )}
                            <hr />
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
                                </div>
                            )}
                            <hr />
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
                            <hr />
                            {allSites.length > 0 && (
                                <Preview_siteDetailsTable
                                    data={allSites}
                                    setData={setAllSites}
                                    totalSitesCount={totalSitesCount}
                                    LKRS_ID={localLKRSID}
                                    createdBy={createdBy}
                                    createdName={createdName}
                                    roleID={roleID}
                                />
                            )}
                            <hr />

                            {setOwnerList.length > 0 && (
                                <>
                                    <h4>EKYC Owner Details</h4>
                                    <DataTable
                                        columns={owner_columns}
                                        data={ownerList}
                                        progressPending={loading}
                                        pagination
                                        highlightOnHovers
                                        customStyles={customStyles}
                                    />
                                </>
                            )}
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
    );
};


const styles = {
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    modalContent: {
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1500px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    },
    modalHeader: {
        position: 'sticky',
        background: 'linear-gradient(45deg,  #0077b6,#023e8a)',
        color: '#fff',
        top: 0,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        backgroundColor: '#fff',
        padding: '15px 20px',
        borderBottom: '1px solid #ddd',
        zIndex: 1,
    },
    modalBody: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
    },
    closeButton: {
        position: 'absolute',
        top: '5px',
        right: '20px',
        fontSize: '30px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: '#fff',
    },
    '@media (max-width: 768px)': {
        modalContent: {
            width: '95%',  // Make the modal content width responsive for smaller screens
            padding: '20px',  // Adjust padding for smaller screens
        },
        closeButton: {
            top: '10px',  // Adjust close button position for mobile view
            right: '15px',  // Adjust the right position
            fontSize: '24px',  // Smaller font size for mobile
        },
    },
};
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
        console.error('modal-root not found');
        return null;
    }

    return ReactDOM.createPortal(
        <div style={styles.modal}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h4 style={{ margin: 0 }}>Submitted Preview Application</h4>
                    <button style={styles.closeButton} onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div style={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>,
        modalRoot
    );
};


export default BBMP_LayoutForm;



