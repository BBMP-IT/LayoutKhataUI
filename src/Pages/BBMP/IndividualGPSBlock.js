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
    individualSiteAPI, individualSiteListAPI, fetchECDetails, fetchDeedDocDetails, fetchDeedDetails, fetchJDA_details, deleteSiteInfo, fetch_LKRSID,
    update_Final_SaveAPI, fetchZoneFromWardList, fetchStreetFromWardList,
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
function pointInPolygon(lat, lon, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];
        const intersect = ((yi > lat) !== (yj > lat)) &&
            (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function getNearestDistance(lat, lon, polygon) {
    const toRad = deg => deg * Math.PI / 180;
    const R = 6371e3; // meters
    let minDist = Infinity;

    for (const [lng, latP] of polygon) {
        const φ1 = toRad(lat), φ2 = toRad(latP);
        const Δφ = toRad(latP - lat);
        const Δλ = toRad(lng - lon);
        const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        minDist = Math.min(minDist, d);
    }

    return minDist;
}



const IndividualGPSBlock = ({ areaSqft, LKRS_ID, createdBy, createdName, roleID, totalNoofsites, ownerName, isRTCSectionSaved, isEPIDSectionSaved,
    setIsSitesSectionSaved, }) => {
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

    const [totalSQFT, setTotalSQFT] = useState('');
    const [totalSQM, setTotalSQM] = useState('');
    const [layoutSiteCount, setLayoutSiteCount] = useState(0);
    const [layoutSiteCountError, setLayoutSiteCountError] = useState("");

    // useEffect(() => {
    //     const areaSQFT = sessionStorage.getItem('areaSqft');
    //     if (areaSQFT) {
    //         const sqftRounded = Math.round(parseFloat(areaSQFT));
    //         setTotalSQFT(sqftRounded);                // integer only
    //         setTotalSQM(sqftToSqm(sqftRounded));      // 1 decimal only
    //     }
    // }, [areaSqft]);

    const [localLKRSID, setLocalLKRSID] = useState("");
    const [localOwnername, setLocalOwnerName] = useState("");
    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        } else {
            const id = sessionStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
        }
        if (ownerName) {
            setLocalOwnerName(ownerName)
        } else {
            const name = sessionStorage.getItem("ownerName");
            if (name) setLocalOwnerName(name);
        }
        if (totalNoofsites) {
            setLayoutSiteCount(totalNoofsites);
        } else {
            const noofsites = sessionStorage.getItem("totalNoOfSites");
            if (noofsites) setLayoutSiteCount(noofsites);
        }
    }, [LKRS_ID, ownerName, totalNoofsites]);

    const buttonRef = useRef(null);
    useEffect(() => {

        if (buttonRef.current) {
            buttonRef.current.click();
        }
    }, [localLKRSID, isRTCSectionSaved, isEPIDSectionSaved]);
    const [landDetails, setLandDetails] = useState("");
    const loadData = () => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        if (localLKRSID && (isRTCSectionSaved || isEPIDSectionSaved)) {
            delay(1000);
            fetchSiteDetails(localLKRSID);
            delay(1000);
            handleGetLKRSID(localLKRSID);
            delay(1000); // 1 second delay
            fetchOwners(localLKRSID);

        }
    }


    const handleGetLKRSID = async (localLKRSID) => {

        const payload = {
            level: 1,
            LkrsId: localLKRSID,
        };
        try {
            start_loader();
            const response = await fetch_LKRSID(localLKRSID);

            if (response && Object.keys(response).length > 0) {
                setLandDetails(response.lkrS_LANDTYPE);

                setTotalSQFT(Math.floor(response.lkrS_SITEAREA_SQFT));       // Only integer
                setTotalSQM(Number(response.lkrS_SITEAREA_SQMT).toFixed(1)); // One decimal place
                setLayoutSiteCount(response.lkrS_NUMBEROFSITES);
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

    const sqftToSqm = (sqft) => {
        return sqft ? (parseFloat(sqft) * 0.092903).toFixed(1) : '';
    };
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

        if (value !== '') {
            const meters = (parseFloat(value) * 0.3048).toFixed(1); // 1 decimal
            updatedSides[index].lengthInMeter = meters;
        } else {
            updatedSides[index].lengthInMeter = '';
        }

        setSides(updatedSides);
    };
    const handleLengthInMeterChange = (index, value) => {
        const updatedSides = [...sides];
        updatedSides[index].lengthInMeter = value;

        if (value !== '') {
            const feet = Math.round(parseFloat(value) / 0.3048).toString(); // integer
            updatedSides[index].lengthInFeet = feet;
        } else {
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
        // Allow only positive integers
        if (/^(?!0)\d*$/.test(value) || value === "") {
            setEastwestFeet(value);

            if (value === "") {
                setEastwestError('East-West side length is required');
                setEastwestMeter('');
            } else {
                setEastwestError('');
                const feet = parseInt(value);
                if (!isNaN(feet)) {
                    const meter = feet * 0.3048;
                    setEastwestMeter(meter.toFixed(1)); // meters can be 1 decimal
                }
            }
            calculateArea(value, northsouthFeet, null, null);
        }
    };
    // East-West meter change handler
    const handleEastwestMeterChange = (e) => {
        const value = e.target.value;
        // Allow number with max one decimal
        if (/^(?!0)\d*(\.\d{0,1})?$/.test(value) || value === "") {
            setEastwestMeter(value);

            if (value === "") {
                setEastwestError('East-West side length is required');
                setEastwestFeet('');
            } else {
                setEastwestError('');
                const meter = parseFloat(value);
                if (!isNaN(meter)) {
                    const feet = meter / 0.3048;
                    setEastwestFeet(Math.round(feet)); // feet should be integer
                }
            }
            calculateArea(null, null, value, northsouthMeter);
        }
    };
    //north-south feet or meter calculation function
    const feetToMeter = (feet) => (feet ? (parseFloat(feet) * 0.3048).toFixed(1) : '');
    const meterToFeet = (meter) => (meter ? Math.round(parseFloat(meter) / 0.3048) : '');
    // North-South feet change handler
    const handleNorthsouthFeetChange = (e) => {
        const value = e.target.value;

        // Allow only non-zero leading integers
        if (/^(?!0)\d*$/.test(value) || value === '') {
            setNorthsouthFeet(value);

            if (value === '') {
                setNorthsouthError('North-south length is required');
                setNorthsouthMeter('');
            } else {
                setNorthsouthError('');
                const feet = parseInt(value);
                if (!isNaN(feet)) {
                    const meter = feet * 0.3048;
                    setNorthsouthMeter(meter.toFixed(1)); // 1 decimal for meter
                }
            }

            // Recalculate Area
            calculateArea(eastwestFeet, value, null, null);
        }
    };
    const handleNorthsouthMeterChange = (e) => {
        const value = e.target.value;

        // Allow number with max one decimal place
        if (/^(?!0)\d*(\.\d{0,1})?$/.test(value) || value === '') {
            setNorthsouthMeter(value);

            if (value === '') {
                setNorthsouthError('North-south length is required');
                setNorthsouthFeet('');
            } else {
                setNorthsouthError('');
                const meter = parseFloat(value);
                if (!isNaN(meter)) {
                    const feet = meter / 0.3048;
                    setNorthsouthFeet(Math.round(feet)); // feet should be integer
                }
            }

            // Recalculate Area
            calculateArea(null, null, eastwestMeter, value);
        }
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

        //  New: Validate Site Number
        if (!regular_siteNumber || regular_siteNumber.trim() === '') {
            setRegular_SiteNumberError('Site number is required');
            if (!firstErrorField) firstErrorField = siteNumberRef;
            isValid = false;
        }

        //  New: Validate Block/Area
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
        //area validation
        const totalArea = parseFloat(totalSQFT);
        const enteredArea = parseFloat(regularAreaSqFt);

        if (enteredArea > totalArea) {
            Swal.fire({
                title: "Area Exceeds Limit",
                text: `Area cannot exceed Total Area (${totalArea} SqFt) of the layout`,
                icon: "error",
                confirmButtonText: "OK",
            })
            isValid = false;
        }


        //corner Site validation
        if (cornerSite === '') {
            setCornerSiteError('Please select corner site option');
            if (!firstErrorField) firstErrorField = cornerSiteRef;
            isValid = false;
        }
        //  Site Type Dropdown validation
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

        // Zone, Ward, and Street validation only if landDetails !== "khata"
        if (landDetails !== "khata") {
            // Zone Validation
            if (!selectedZone || isNaN(selectedZone)) {
                setZoneError('Please select a zone');
                if (!firstErrorField) firstErrorField = zoneRef;
                isValid = false;
            }

            // Ward Validation
            if (!selectedWard || isNaN(selectedWard)) {
                setWardError('Please select a ward');
                if (!firstErrorField) firstErrorField = wardRef;
                isValid = false;
            }

            // Street name Validation
            if (!selectedStreet || isNaN(selectedStreet)) {
                setStreetError('Please select a street');
                if (!firstErrorField) firstErrorField = streetRef;
                isValid = false;
            }
        }



        if (firstErrorField?.current) {
            firstErrorField.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.current.focus?.();
        }

        validateChakbandi(chakbandiEast, setChakbandiEastError, chakbandiEastRef, 'East');
        validateChakbandi(chakbandiWest, setChakbandiWestError, chakbandiWestRef, 'West');
        validateChakbandi(chakbandiSouth, setChakbandiSouthError, chakbandiSouthRef, 'South');
        validateChakbandi(chakbandiNorth, setChakbandiNorthError, chakbandiNorthRef, 'North');

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
        setSelectedZone('');
        setSelectedWard('');
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

    const [irregularcornerSite, setIrregularCornerSite] = useState(true);
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
    const [roadAreaSqFt, setRoadAreaSqFt] = useState('');
    const [roadAreaSqM, setRoadAreaSqM] = useState('');
    const [roadAreaSqft_sqM_error, setRoadAreaSqft_sqM_error] = useState('');
    const road_AreaSqFtref = useRef(null);



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

        //  New: Validate Site Number
        if (!irregular_siteNumber || irregular_siteNumber.trim() === '') {
            setirregular_siteNumberError('Site number is required');
            if (!firstErrorField) firstErrorField = irregular_siteNoref;
            isValid = false;
        }

        //  New: Validate Block/Area
        if (!irregular_blockArea || irregular_blockArea.trim() === '') {
            setirregular_blockAreaError('Block/Area is required');
            if (!firstErrorField) firstErrorField = irregular_blockArearef;
            isValid = false;
        }

        //  Validate Number of Sides
        if (!numSides || isNaN(numSides) || Number(numSides) < 3 || Number(numSides) > 9) {
            setNumSidesError('Please enter a valid number of sides (between 3 and 9)');
            if (!firstErrorField) firstErrorField = irregularnumsidesref;
            isValid = false;
        } else {
            setNumSidesError('');  // Clear the error if the validation passes
        }



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

        setSideErrors(newSideErrors); //  Update state




        //area calculation
        if ((!irregularAreaSqFt || parseFloat(irregularAreaSqFt) <= 0) && (!irregularAreaSqM || parseFloat(irregularAreaSqM) <= 0)) {
            setIrregularAreaSqft_sqM_error('Please enter Area  in either Sq.ft or Sq.M');
            if (!firstErrorField) firstErrorField = irregular_AreaSqFtref;
            isValid = false;
        }
        //area validation
        const totalArea = parseFloat(totalSQFT);
        const enteredArea = parseFloat(irregularAreaSqFt);

        if (isNaN(enteredArea) || enteredArea <= 0) {
            Swal.fire({
                title: "Invalid Area",
                text: `Area must be a positive number`,
                icon: "error",
                confirmButtonText: "OK",
            })
            isValid = false;
        } else if (enteredArea > totalArea) {
            Swal.fire({
                title: "Area Exceeds Limit",
                text: `Area cannot exceed Total Area of the layout`,
                icon: "error",
                confirmButtonText: "OK",
            })
            isValid = false;
        }

        // corner Site validation
        if (irregularcornerSite === '') {
            setIrregularCornerSiteError('Please select corner site option');
            if (!firstErrorField) firstErrorField = irregular_cornerSiteref;
            isValid = false;
        }

        //  Site Type Dropdown validation
        // if (irregularsiteType === '') {
        //     setIrregularsiteTypeError('Please select a type of site');
        //     if (!firstErrorField) firstErrorField = irregular_siteTyperef;
        //     isValid = false;
        // }
        if (siteType === '') {
            setSiteTypeError('Please select a type of site');
            if (!firstErrorField) firstErrorField = siteTypeRef;
            isValid = false;
        }

        const chakbandiRegex = /^[a-zA-Z0-9.,\/\\#\s]*$/;

        //  Validate Chakbandi Directions
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

        // Zone, Ward, and Street validation only if landDetails !== "khata"
        if (landDetails !== "khata") {
            // Zone Validation
            if (!selectedZone || isNaN(selectedZone)) {
                setZoneError('Please select a zone');
                if (!firstErrorField) firstErrorField = zoneRef;
                isValid = false;
            }

            // Ward Validation
            if (!selectedWard || isNaN(selectedWard)) {
                setWardError('Please select a ward');
                if (!firstErrorField) firstErrorField = wardRef;
                isValid = false;
            }

            // Street name Validation
            if (!selectedStreet || isNaN(selectedStreet)) {
                setStreetError('Please select a street');
                if (!firstErrorField) firstErrorField = streetRef;
                isValid = false;
            }
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

        // Allow only whole numbers
        const numericValue = value.replace(/[^0-9]/g, '');

        setIrregularAreaSqFt(numericValue);

        if (!isNaN(numericValue) && numericValue !== '') {
            const sqm = (parseFloat(numericValue) * 0.092903).toFixed(1); // round to 1 decimal
            setIrregularAreaSqM(sqm);
        } else {
            setIrregularAreaSqM('');
        }
    };
    const handleSqMChange = (e) => {
        const value = e.target.value;

        // Allow numbers with optional 1 decimal place
        const numericValue = value.replace(/[^0-9.]/g, '');

        // Allow max 1 digit after decimal
        if (/^\d*(\.\d?)?$/.test(numericValue)) {
            setIrregularAreaSqM(numericValue);

            if (!isNaN(numericValue) && numericValue !== '') {
                const sqft = Math.round(parseFloat(numericValue) * 10.7639).toString(); // round to integer
                setIrregularAreaSqFt(sqft);
            } else {
                setIrregularAreaSqFt('');
            }
        }
    };
    const handleRoadSqFtChange = (e) => {
        const value = e.target.value;

        // Allow only whole numbers
        const numericValue = value.replace(/[^0-9]/g, '');

        setRoadAreaSqFt(numericValue);

        if (!isNaN(numericValue) && numericValue !== '') {
            const sqm = (parseFloat(numericValue) * 0.092903).toFixed(1); // round to 1 decimal
            setRoadAreaSqM(sqm);
        } else {
            setRoadAreaSqM('');
        }
    };
    const handleRoadSqMChange = (e) => {
        const value = e.target.value;

        // Allow numbers with optional 1 decimal place
        const numericValue = value.replace(/[^0-9.]/g, '');

        // Allow max 1 digit after decimal
        if (/^\d*(\.\d?)?$/.test(numericValue)) {
            setRoadAreaSqM(numericValue);

            if (!isNaN(numericValue) && numericValue !== '') {
                const sqft = Math.round(parseFloat(numericValue) * 10.7639).toString(); // round to integer
                setRoadAreaSqFt(sqft);
            } else {
                setRoadAreaSqFt('');
            }
        }
    };


    const [wardID, setWardID] = useState("");
    //fetching Details from LKRSID



    const totalSitesCount = Number(layoutSiteCount);
    const totalAddedSites = siteData.length + irregularsiteData.length;

    const [allSites, setAllSites] = useState([]);


    const handleLayoutSiteCountChange = (e) => {
        const value = e.target.value;
        if (isReadOnly) {
            setLayoutSiteCount(value);
            setLayoutSiteCountError("");
            return;
        }

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
            // setIsAddDisabled(true);
        }

        if (totalAddedSites >= totalSitesCount) {
            Swal.fire({
                title: "Limit Reached",
                text: `Only ${totalSitesCount} sites allowed. Please update the total number of sites if needed.`,
                icon: "warning",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: true
            }).then(() => {
                layoutSiteCountRef.current.focus();
                if (shape === "regular") {
                    resetFormFields();
                } else {
                    resetIrregularFormFields();
                }
            });

            return;
        }

        //  Move ID generation *inside* the shape-specific validation block
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
            setSiteIdCounter(prev => prev + 1); //  only increment when validation passes

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
    const [isSitesSaved, setIsSitesSaved] = useState(false);
    const Save_Handler = () => {
        if (!layoutSiteCount) {
            setLayoutSiteCountError("Total number of sites is required");
            return;
        }
        const totalAddedSites = allSites.length;
        if (totalSitesCount !== totalAddedSites) return;

        if (totalSitesCount === totalAddedSites) {
            // setIsAddDisabled(true);
            setIsSitesSaved(true);  // ✅ Mark as saved
            setIsSitesSectionSaved(true);
            Swal.fire({
                title: "Success!",
                text: "All Site record saved successfully.",
                icon: "success",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: true
            });
        }
    };

    const Edit_Handler = () => {
        // setIsAddDisabled(false);
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
    const [zoneWardData, setZoneWardData] = useState([]);
    const [zoneOptions, setZoneOptions] = useState([]);
    const [wardOptions, setWardOptions] = useState([]);
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [streetOptions, setStreetOptions] = useState([]);
    const [selectedStreet, setSelectedStreet] = useState('');
    const [zoneError, setZoneError] = useState('');
    const [wardError, setWardError] = useState('');
    const [streetError, setStreetError] = useState('');
    const zoneRef = useRef(null);
    const wardRef = useRef(null);
    const streetRef = useRef(null);

    useEffect(() => {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);

        // Wait for the pac-container to be created
        setTimeout(() => {
            const pacContainer = document.querySelector('.pac-container');
            if (pacContainer && searchInputRef.current) {
                const inputRect = searchInputRef.current.getBoundingClientRect();
                pacContainer.style.width = inputRect.width + "px";
                pacContainer.style.left = inputRect.left + "px";
            }
        }, 300);


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

            // 🟡 Enable Autocomplete here
            const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
            autocomplete.bindTo("bounds", map);

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place.geometry) {
                    setResultType("No details available for input: '" + place.name + "'");
                    return;
                }

                moveMapTo(place.geometry.location, "Autocomplete Search", place.formatted_address || place.name);
            });

            // Map click event
            map.addListener('click', (event) => {
                const location = event.latLng;
                moveMapTo(location, "");

                geocoder.current.geocode({ location }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        moveMapTo(location, "", results[0].formatted_address);
                    }
                });
            });

            // Marker drag event
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
    const getWardAndZoneData = async (lat, lon) => {
        try {
            const response = await fetch('/assets/ward_boundaries.json');
            const data = await response.json();
            const features = data.features;

            let exactWard = null;
            const nearbyWards = [];

            for (const feature of features) {
                const geometry = feature.geometry;
                if (geometry.type === "MultiPolygon") {
                    for (const coordinates of geometry.coordinates) {
                        const polygon = coordinates[0];

                        if (pointInPolygon(lat, lon, polygon)) {
                            exactWard = {
                                wardName: feature.properties.WARD_NAME,
                                wardNo: feature.properties.WARD_NO,
                            };
                            break;
                        } else {
                            const distance = getNearestDistance(lat, lon, polygon);
                            if (distance <= 500) {
                                nearbyWards.push({
                                    wardName: feature.properties.WARD_NAME,
                                    wardNo: feature.properties.WARD_NO,
                                });
                            }
                        }
                    }
                }
                if (exactWard) break;
            }

            // ✅ Prepare wardId list for API
            const allWardIds = [
                ...(exactWard ? [exactWard.wardNo] : []),
                ...nearbyWards.map(w => w.wardNo),
            ];

            // ✅ Fetch zone-ward list from API
            const zoneWardData = await fetchZoneFromWardList(allWardIds, 600); // you already have this API
            setZoneWardData(zoneWardData); // save raw data

            // ✅ Deduplicate zone list
            const uniqueZonesMap = new Map();
            zoneWardData.forEach(z => {
                if (!uniqueZonesMap.has(z.zoneID)) {
                    uniqueZonesMap.set(z.zoneID, {
                        label: z.zoneName,
                        value: z.zoneID,
                    });
                }
            });
            const zoneList = Array.from(uniqueZonesMap.values());
            setZoneOptions(zoneList); // update zone dropdown options

            // ✅ Pre-select zone of exact ward
            const exactZone = exactWard
                ? zoneWardData.find(z => z.wardId === exactWard.wardNo)
                : null;

            if (exactZone) {
                setSelectedZone(exactZone.zoneID); // auto-select zone

                // ✅ Filter wards of selected zone
                const wardsInZone = zoneWardData
                    .filter(z => z.zoneID === exactZone.zoneID)
                    .map(z => ({
                        label: z.wardName,
                        value: z.wardId,
                    }));

                setWardOptions(wardsInZone); // update ward dropdown
                setSelectedWard(exactWard.wardNo); // auto-select exact ward
                loadStreetsForWard(exactWard.wardNo);
            } else {
                // fallback if no exact ward found
                setWardOptions([]);
                setSelectedWard('');
            }
        } catch (error) {
            console.error("Error in getWardAndZoneData:", error);
        }
    };
    const loadStreetsForWard = async (wardId) => {

        setStreetOptions([]);
        setSelectedStreet('');
        if (!wardId) return;

        try {
            start_loader();
            const res = await fetchStreetFromWardList(wardId); // ✅ res is array
            console.log("Raw API Response:", res);

            const streets = (res || []).map((s) => ({
                label: s.streetName,
                value: s.streetId,
            }));

            console.log("Mapped streets:", streets);
            setStreetOptions(streets);
            stop_loader();
        } catch (err) {
            console.error('Street fetch failed', err);
        } finally {
            stop_loader();
        }
    };


    const moveMapTo = (location, title, formatted_address = '') => {
        if (!location) return;
        mapInstance.current.setCenter(location);
        markerRef.current.setPosition(location);
        const lat = location.lat();
        const lon = location.lng();
        setLatitude(lat.toFixed(6));
        setLongitude(lon.toFixed(6));
        setResultType(
            formatted_address
                ? `Selected address : ${formatted_address}`
                : title
        );

        // 🔁 Fetch ward & zone
        getWardAndZoneData(lat, lon);
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
        const textboxSitesCount = parseInt(layoutSiteCount, 10);

        // Validate layoutSiteCount
        if (!layoutSiteCount || isNaN(textboxSitesCount) || textboxSitesCount <= 0) {
            setLayoutSiteCountError("Please enter a valid number of total sites");
            layoutSiteCountRef.current?.focus();
            return;
        }

        const storedSiteCount = parseInt(sessionStorage.getItem("NUMBEROFSITES"), 10);
        const totalAddedSites = allSites.length;

        // Check if trying to reduce below original count
        if (textboxSitesCount >= totalAddedSites) {
            //  If all validations passed
            setIsReadOnly(true);
            setShowEditBtn(true);
        } else {
            Swal.fire({
                icon: "warning",
                title: "Invalid Site Count",
                text: `No of sites should be more than ${totalAddedSites}, since ${totalAddedSites} sites are already inserted`,
            });
            return;
        }
    };

    const road_Validation = () => {
        let isValid = true;
        let firstErrorField = null;

        // Reset all error states
        setSiteTypeError('');
        setLatitudeError('');
        setLongitudeError('');


        //area calculation
        if ((!roadAreaSqFt || parseFloat(roadAreaSqFt) <= 0) && (!roadAreaSqM || parseFloat(roadAreaSqM) <= 0)) {
            setRoadAreaSqft_sqM_error('Please enter Area  in either Sq.ft or Sq.M');
            if (!firstErrorField) firstErrorField = road_AreaSqFtref;
            isValid = false;
        }
        //area validation
        const totalArea = parseFloat(totalSQFT);
        const enteredArea = parseFloat(roadAreaSqFt);

        if (isNaN(enteredArea) || enteredArea <= 0) {
            Swal.fire({
                title: "Invalid Area",
                text: `Area must be a positive number`,
                icon: "error",
                confirmButtonText: "OK",
            })
            isValid = false;
        } else if (enteredArea > totalArea) {
            Swal.fire({
                title: "Area Exceeds Limit",
                text: `Area cannot exceed Total Area (${totalArea} SqFt) of the layout`,
                icon: "error",
                confirmButtonText: "OK",
            })
            isValid = false;
        }


        if (siteType === '') {
            setSiteTypeError('Please select a type of site');
            if (!firstErrorField) firstErrorField = siteTypeRef;
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

        // Zone, Ward, and Street validation only if landDetails !== "khata"
        if (landDetails !== "khata") {
            // Zone Validation
            if (!selectedZone || isNaN(selectedZone)) {
                setZoneError('Please select a zone');
                if (!firstErrorField) firstErrorField = zoneRef;
                isValid = false;
            }

            // Ward Validation
            if (!selectedWard || isNaN(selectedWard)) {
                setWardError('Please select a ward');
                if (!firstErrorField) firstErrorField = wardRef;
                isValid = false;
            }

            // Street name Validation
            if (!selectedStreet || isNaN(selectedStreet)) {
                setStreetError('Please select a street');
                if (!firstErrorField) firstErrorField = streetRef;
                isValid = false;
            }
        }


        if (firstErrorField?.current) {
            firstErrorField.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.current.focus?.();
        }


        return isValid;
    };

    //Add site button click API
    const addSites = async (shape) => {
        const isRegular = shape === "regular";
        const isIrregular = shape === "irregular";

        if (!layoutSiteCount || totalSitesCount <= 0) {
            setLayoutSiteCountError("Please enter a valid number of total sites");
            layoutSiteCountRef.current?.focus();
            return;
        }

        if (!isRTCSectionSaved && !isEPIDSectionSaved) {
            Swal.fire("Please save the land details before proceeding with layout approval", "", "warning");
            return;
        }

        const totalAddedSites = allSites.length;
        const textboxSitesCount = parseInt(layoutSiteCount, 10);
        const storedSiteCount = parseInt(sessionStorage.getItem("NUMBEROFSITES"), 10);

        if (textboxSitesCount >= totalAddedSites) {
            setIsReadOnly(true);
            setShowEditBtn(true);
        } else {
            Swal.fire({
                icon: "warning",
                title: "Invalid Site Count",
                text: `No of sites should be more than ${totalAddedSites}, since ${totalAddedSites} sites are already inserted`,
            });
            return;
        }

        if (totalAddedSites >= totalSitesCount) {
            Swal.fire({
                title: "Limit Reached",
                text: `Only ${totalSitesCount} sites allowed. Please update the total number of sites if needed.`,
                icon: "warning",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: true
            }).then(() => {
                layoutSiteCountRef.current?.focus();
                if (isRegular) {
                    resetFormFields();
                } else {
                    resetIrregularFormFields();
                }
            });
            return;
        }

        const existingSiteNumbers = allSites.map(site => site.sitE_NO);
        const siteNumberToCheck = shape === "regular" ? regular_siteNumber : irregular_siteNumber;

        if (existingSiteNumbers.includes(siteNumberToCheck)) {
            Swal.fire({
                icon: "warning",
                title: "Duplicate Site Number",
                text: `Site number "${siteNumberToCheck}" already exists. Please enter a new site number.`,
            });
            return;
        }

        if (isChecked) {
            if (existingSiteNumbers.includes(siteNumberToCheck)) {
                Swal.fire({
                    icon: "warning",
                    title: "Duplicate Site Number",
                    text: `Site number "${siteNumberToCheck}" already exists. Please enter a new site number.`,
                });
                return;
            }
        }

        let isValid = "";
        if (siteType === '8') {
            isValid = road_Validation();
            if (!isValid) return;
        } else {
            isValid = isRegular ? finalValidation() : isIrregular ? irregularFinalValidation() : false;
            if (!isValid) return;
        }

        if (siteType === '8') {
            const existingRoadSite = allSites.find(site => site.sitE_TYPEID === 8);
            if (existingRoadSite) {
                Swal.fire({
                    icon: "warning",
                    title: "Duplicate Road Entry",
                    text: "Only one Road site can be added. You've already inserted one.",
                });
                return;
            }
        }

        // Area Validation Logic Starts Here
        const totalLayoutArea = parseFloat(totalSQFT);
        const existingAreaUsed = allSites.reduce((sum, site) => {
            const area = parseFloat(site.sitE_AREAINSQFT) || 0;
            return sum + area;
        }, 0);

        const newSiteArea = siteType === '8'
            ? parseFloat(roadAreaSqFt) || 0
            : (isRegular ? parseFloat(regularAreaSqFt) : parseFloat(irregularAreaSqFt)) || 0;

        const totalAreaAfterAdding = existingAreaUsed + newSiteArea;

        if (totalAreaAfterAdding > totalLayoutArea) {
            Swal.fire({
                icon: "warning",
                title: "Total Area Exceeded",
                text:
                    `Total Sites Area ( ${totalAreaAfterAdding} sqft  )  cannot exceed Total Area (${totalLayoutArea} SqFt) of the layout`,
            });
            return;
        }
        // Area Validation Logic Ends Here
        // Deed Required Check After 40%
        if (isDeedRequired && deedFetchSuccess === false) {
            if (!uploadedDeedFile) {
                Swal.fire({
                    icon: "warning",
                    title: "Relinquishment Deed Required",
                    text: "Please upload the Deed document before adding more sites.",
                });
                return;
            }
        }
        if (isDeedRequired) {
            if (!deedNumber || deedNumber.trim() === "") {
                Swal.fire({
                    icon: "warning",
                    title: "Relinquishment Deed Number Required",
                    text: "You have reached 40% of total sites. Please enter the deed number. Before saving the sites",
                });
                return;
            }

            if (deedFetchSuccess === false && !uploadedDeedFile) {
                Swal.fire({
                    icon: "warning",
                    title: "Deed Document Required",
                    text: "Deed fetch failed. Please upload the deed document before saving.",
                });
                return;
            }

            if (deedFetchSuccess !== true && deedFetchSuccess !== false) {
                Swal.fire({
                    icon: "warning",
                    title: "Deed Verification Needed",
                    text: "Please fetch and verify the deed before proceeding.",
                });
                return;
            }
        }



        setSiteIdCounter(prev => prev + 1);

        if (!latitude || latitude.trim() === '') {
            Swal.fire("Latitude is required", "", "warning");
            return;
        }
        if (!longitude || longitude.trim() === '') {
            Swal.fire("Longitude is required", "", "warning");
            return;
        }

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

        let zoneName = "";
        let wardName = "";
        let streetName = "";

        let no_of_sites = Number(sessionStorage.getItem("NUMBEROFSITES")) || 0;
        let updated_sites = "";
        let status_site = true;
        const NoofSites = parseInt(layoutSiteCount, 10);
        let payload = "";

        const response = await fetch_LKRSID(localLKRSID);

        if (response && Object.keys(response).length > 0) {
            // Case 1: Land type is "surveyNo"
            if (response.lkrS_LANDTYPE === "surveyNo") {
                zoneName = selectedZone;
                wardName = selectedWard;
                streetName = selectedStreet;

                // Case 2: Land type is "khata"
            } else if (response.lkrS_LANDTYPE === "khata") {


                try {
                    const khataJsonString = response.khataDetails?.khatA_JSON;
                    if (khataJsonString) {
                        const parsedKhata = JSON.parse(khataJsonString);
                        const wardNo = parsedKhata?.response?.approvedPropertyDetails?.wardNumber;
                        const streetNo = parsedKhata?.response?.approvedPropertyDetails?.streetcode;

                        if (wardNo) {
                            const requestWardId = [parseInt(wardNo, 10)];
                            const zoneWardResponse = await fetchZoneFromWardList(requestWardId, response.lkrS_ID);

                            if (
                                Array.isArray(zoneWardResponse) &&
                                zoneWardResponse.length > 0 &&
                                zoneWardResponse[0].wardName &&
                                zoneWardResponse[0].zoneName
                            ) {
                                // Set name values
                                wardName = zoneWardResponse[0].wardId;
                                zoneName = zoneWardResponse[0].zoneID;
                                streetName = streetNo;
                            }
                        }
                    }
                } catch (err) {
                    console.error("Failed to parse khata JSON or fetch zone/ward", err);
                }
            }
            if (siteType === '8') {
                payload = {
                    sitE_ID: 0,
                    sitE_LKRS_ID: localLKRSID,
                    sitE_SHAPETYPE: "",
                    sitE_NO: "",
                    sitE_AREA: "",
                    sitE_TYPEID: siteType,
                    sitE_AREAINSQFT: roadAreaSqFt,
                    sitE_AREAINSQMT: roadAreaSqM,
                    sitE_LATITUDE: latitude,
                    sitE_LONGITUDE: longitude,
                    sitE_OWNER: ownerNames,
                    sitE_CORNERPLOT: true,
                    sitE_NO_OF_SIDES: 0,
                    sitE_EPID: "",
                    sitE_SASNO: "",
                    sitE_NORTH: "",
                    sitE_SOUTH: "",
                    sitE_EAST: "",
                    sitE_WEST: "",
                    sitE_REMARKS: "",
                    sitE_ADDITIONALINFO: "",
                    sitE_CREATEDBY: createdBy,
                    sitE_CREATEDNAME: createdName,
                    sitE_CREATEDROLE: roleID,
                    sitE_ZONE: zoneName,
                    sitE_WARD: wardName,
                    sitE_STREET: streetName,
                    siteDimensions: null
                };
            } else {
                payload = {
                    sitE_ID: 0,
                    sitE_LKRS_ID: localLKRSID,
                    sitE_SHAPETYPE: isRegular ? "Regular" : "Irregular",
                    sitE_NO: isRegular ? regular_siteNumber : irregular_siteNumber,
                    sitE_AREA: isRegular ? blockArea : irregular_blockArea,
                    sitE_TYPEID: isRegular ? siteType : siteType,
                    sitE_AREAINSQFT: isRegular ? regularAreaSqFt : irregularAreaSqFt,
                    sitE_AREAINSQMT: isRegular ? regularAreaSqM : irregularAreaSqM,
                    sitE_LATITUDE: latitude,
                    sitE_LONGITUDE: longitude,
                    sitE_OWNER: ownerNames,
                    sitE_CORNERPLOT: isRegular ? cornerSite : irregularcornerSite,
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
                    sitE_ZONE: zoneName,
                    sitE_WARD: wardName,
                    sitE_STREET: streetName,
                    siteDimensions
                };
            }


            try {
                start_loader();
                const response = await individualSiteAPI(payload);

                if (response.responseStatus === true) {
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
                            setIsSitesSectionSaved(true);

                            const totalSitesFromAPI = response[0]?.lkrS_NUMBEROFSITES;
                            sessionStorage.setItem("NUMBEROFSITES", totalSitesFromAPI);
                        }

                    } catch (error) {
                        console.error("Fetch Site Details Error:", error);

                        if (error.response) {
                            console.error("API responded with error data:", error.response.data);
                        } else if (error.request) {
                            console.error("No response received from API. Request was:", error.request);
                        }
                    }
                    finally {
                        stop_loader();
                    }

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
            } finally {
                stop_loader();
            }

        } else {
            Swal.fire("Something went wrong, Please try again later!", "", "warning");
        }





        //Road

    };

    const [ownerList, setOwnerList] = useState([]);
    const [ownerNames, setOwnerNames] = useState('');
    //multiple owner list fetch
    const fetchOwners = async (LKRSID) => {
        try {
            const apiResponse = await ownerEKYC_Details("1", LKRSID);

            const owners = (apiResponse || []).map(owner => ({
                name: owner.owN_NAME_EN,
                id: owner.owN_ID,
            }));

            setOwnerList(owners);

            const ownerNameList = owners.map(o => o.name).join(', ');
            setOwnerNames(ownerNameList); //  Set comma-separated owner names

        } catch (error) {
            setOwnerList([]);
            setOwnerNames(''); // fallback if API fails
        }
    };

    const fetchSiteDetails = async (LKRS_ID) => {

        const storedSiteCount = sessionStorage.getItem("totalNoOfSite");
        if (storedSiteCount) {
            setLayoutSiteCount(storedSiteCount);
            setIsReadOnly(true);
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

            // --- MODIFICATION STARTS HERE ---
            if (Array.isArray(response) && response.length === 0) {
                // If the response is an empty array, stop here.
                return; // Exit the function
            }

            if (Array.isArray(response)) {
                setAllSites(response);
                setIsSitesSectionSaved(true);
                // setIsAddDisabled(true);

                const totalSitesFromAPI = response[0]?.lkrS_NUMBEROFSITES;
                sessionStorage.setItem("NUMBEROFSITES", totalSitesFromAPI);

                // Check if the response length matches the totalSitesFromAPI
                if (response.length === Number(totalSitesFromAPI)) {
                    setIsAddDisabled(true);
                }
            }
        } catch (error) {
            console.error("Fetch Site Details Error:", error);

            if (error.response) {
                console.error("API responded with error data:", error.response.data);
            } else if (error.request) {
                console.error("No response received from API. Request was:", error.request);
            }

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
                if (latestSite.sitE_CORNERPLOT === "yes") {
                    setCornerSite(true);
                } else {
                    setCornerSite(false);
                }

                setSiteType(latestSite.sitE_TYPEID);
                setChakbandiEast(latestSite.sitE_EAST);
                setChakbandiWest(latestSite.sitE_WEST);
                setChakbandiSouth(latestSite.sitE_SOUTH);
                setChakbandiNorth(latestSite.sitE_NORTH);
                // setLatitude(latestSite.sitE_LATITUDE);
                // setLongitude(latestSite.sitE_LONGITUDE);
            }
        } else {
            setRegular_SiteNumber("");
        }

        handleFetchPrevious(e);
    };

    const [deedNumber, setDeedNumber] = useState("");
    const [deedError, setDeedError] = useState('');
    const [showViewDeedButton, setShowViewDeedButton] = useState(false);
    const [isDeedSectionDisabled, setIsDeedSectionDisabled] = useState(false);
    const [deedFetchSuccess, setDeedFetchSuccess] = useState(null); // null | true | false
    const [uploadedDeedFile, setUploadedDeedFile] = useState(null);
    const [uploadError, setUploadError] = useState('');

    const deedRequiredThreshold = Math.ceil(totalSitesCount * 0.4);
    const isDeedRequired = allSites.length >= deedRequiredThreshold;

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
                setShowViewDeedButton(true);
                setIsDeedSectionDisabled(true); // ✅ Disable input + button
                setDeedFetchSuccess(true);
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
                setDeedFetchSuccess(false);
                setIsDeedSectionDisabled(true);
                setShowViewDeedButton(false);
            }
        } catch (error) {
            console.error("Failed to insert data:", error);

        } finally {
            stop_loader();
        }
    };
    //view Deed
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


    const handleDeedUpload = async () => {
        if (!uploadedDeedFile) {
            setUploadError("Please upload a deed document");
            return;
        }

        if (uploadedDeedFile.type !== "application/pdf") {
            setUploadError("Only PDF files are allowed");
            return;
        }


    };



    return (
        <div> {loading && <Loader />}
            <div className="card" >
                <button className='btn btn-block' onClick={loadData} ref={buttonRef} hidden>Click me</button>
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>Layout & Individual sites Details</h5>
                </div>
                <div className="card-body">
                    <fieldset disabled={isAddDisabled}>
                        <div className="row align-items-center mb-3">
                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                                <div className="form-group">
                                    <label htmlFor="totalArea" className="col-form-label fw-semibold">
                                        Total Area of the Layout  <span className='mandatory_color'>*</span>
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
                                        Total Number of Sites <span className='mandatory_color'>*</span>
                                    </label>
                                    <input
                                        type="text"

                                        className="form-control"
                                        placeholder="Enter Total number of sites"
                                        value={layoutSiteCount}
                                        maxLength={15}
                                        readOnly

                                    />

                                </div>
                            </div>


                            <div className='col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10 mb-3' hidden></div>
                            <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mb-3' hidden>
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
                        <h4 className='fw-bold fs-7'>Site / Plot wise Details </h4>
                        <div className="alert alert-info">Note: Please enter Correctly as eKhata will be issued as per this</div>


                        <div className="row mt-4">
                            <div className="col-0 col-sm-0 col-md-2 col-lg-2 col-xl-2"></div>

                            {/* Type of Site Dropdown */}
                            <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
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
                                        <option value="8">Road</option>
                                        <option value="6">Sump</option>
                                        <option value="7">Utility</option>
                                    </select>

                                </div>
                                {siteTypeError && (
                                    <small className="text-danger">{siteTypeError}</small>
                                )}
                            </div>

                            {/* Deed section starts */}
                            {isDeedRequired && (
                                <>
                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-3">
                                        <label className='form-label'>Enter Relinquishment Deed Number (For park, open space, road + Civic Amenity) <span className='mandatory_color'>*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Relinquishment Deed Number"
                                            value={deedNumber}
                                            onChange={(e) => setDeedNumber(e.target.value)}
                                            maxLength={50}
                                            disabled={!isDeedRequired}
                                        />
                                        {deedError && <div className="text-danger">{deedError}</div>}
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-3">
                                        <div className="form-group">
                                            <label> </label>
                                            <button
                                                className="btn btn-primary btn-block"
                                                onClick={handleDeed_FetchDetails}
                                                disabled={!isDeedRequired}
                                            >
                                                Fetch Deed
                                            </button>
                                        </div>
                                    </div>
                                    <div className="alert alert-warning mt-3">
                                        <i className="fa fa-exclamation-circle me-2"></i>
                                        You have reached 40% of your total site entries. Uploading the <strong>Relinquishment Deed</strong> is now <strong>mandatory</strong>.
                                    </div>
                                </>
                            )}

                            {/* Deed View Button */}
                            {isDeedRequired && deedFetchSuccess === true && (
                                <>
                                    <div className="text-success">
                                        <strong>Deed Check successful <i className="fa fa-check-circle"></i></strong>
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2">
                                        <div className="form-group">
                                            <button className="btn btn-warning btn-block" onClick={handleViewDeed}>
                                                View Deed
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Deed Upload Section - If fetch failed */}
                            {isDeedRequired && deedFetchSuccess === false && (
                                <div className="row mt-3">
                                    <strong className='text-danger'>Deed Check Failed <i className="fa fa-times-circle"></i></strong>

                                    <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                        <label className="form-label">Upload Relinquishment Deed Document <span className="mandatory_color">*</span></label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="form-control"
                                            onChange={(e) => setUploadedDeedFile(e.target.files[0])}
                                        />
                                        {uploadError && <div className="text-danger">{uploadError}</div>}
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-4">
                                        <button className="btn btn-success btn-block" onClick={handleDeedUpload}>
                                            Save Deed
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Deed section ends */}

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mb-3">
                                <br />
                                {siteType === '8' && (
                                    <div className='row'>
                                        <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 mb-5">
                                            <label className="form-label">Area <span className='mandatory_color'>*</span></label>
                                            <div className="input-group">
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    placeholder="Area"
                                                    value={roadAreaSqFt ? parseInt(roadAreaSqFt) : ''}
                                                    onChange={handleRoadSqFtChange}
                                                    ref={road_AreaSqFtref}
                                                />

                                                <span className="input-group-text">sq.ft</span>
                                            </div>
                                            {roadAreaSqft_sqM_error && <small className='text-danger'>{roadAreaSqft_sqM_error}</small>}
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mb-3 text-center">
                                            <div className="form-group "><br />
                                                <label className="form-label fw-bold">or</label>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 mb-5">
                                            <label className="form-label">&nbsp;</label>
                                            <div className="input-group">
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    placeholder="Area"
                                                    value={roadAreaSqM ? parseFloat(roadAreaSqM).toFixed(1) : ''}
                                                    onChange={handleRoadSqMChange}
                                                    ref={road_AreaSqFtref}
                                                />
                                                <span className="input-group-text">sq.mtr</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {siteType !== '8' && (
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
                                )}
                            </div>
                        </div>
                        {siteType !== '8' && (<>
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
                                                <label className="form-label">Area <span className='mandatory_color'>*</span></label>
                                                <div className="input-group">
                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Area"
                                                            value={regularAreaSqFt ? parseInt(regularAreaSqFt) : ''}
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
                                                            value={regularAreaSqM ? parseFloat(regularAreaSqM).toFixed(1) : ''}
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
                                                                    // Allow only whole numbers
                                                                    const numericValue = value.replace(/[^0-9]/g, '');
                                                                    handleLengthInFeetChange(index, numericValue);
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
                                                                    // Allow numbers with at most 1 digit after decimal
                                                                    const numericValue = value.replace(/[^0-9.]/g, '');
                                                                    if (/^\d*(\.\d?)?$/.test(numericValue)) {
                                                                        handleLengthInMeterChange(index, numericValue);
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
                                                    value={irregularAreaSqFt ? parseInt(irregularAreaSqFt) : ''}
                                                    onChange={handleSqFtChange}
                                                    ref={irregular_AreaSqFtref}
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
                                                    value={irregularAreaSqM ? parseFloat(irregularAreaSqM).toFixed(1) : ''}
                                                    onChange={handleSqMChange}
                                                    ref={irregular_AreaSqFtref}
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
                                                                checked={irregularcornerSite === true}
                                                                ref={irregular_cornerSiteref}
                                                                onChange={() => {
                                                                    setIrregularCornerSite(true);
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
                                                                checked={irregularcornerSite === false}
                                                                ref={irregular_cornerSiteref}
                                                                onChange={() => {
                                                                    setIrregularCornerSite(false);
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
                        </>
                        )}
                    </fieldset>
                </div>
            </div>
            <div className="card" >
                <div className="card-header layout_btn_color" >
                    <h5 className="card-title" style={{ textAlign: 'center' }}>Find Layout on Google Map & tap in middle of site to capture sites GPS</h5>
                </div>
                <div className="card-body">
                    <div className="row" >
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                            <b>Search using nearest landmark near your layout - once you zoom there then locate your individual layout & tap on top middle of your layout</b>
                            <br /><div className="alert alert-info">Note : Search nearest landmark & then find layout & site near the landmark</div>

                        </div>
                        <div className="col-md-12 col-lg-12 col-sm-12 mb-4 position-relative mt-2">
                            <div className='row'>
                                <div className="col-md-10 col-lg-10 col-sm-12 col-xl-10 col-12">
                                    <input ref={searchInputRef} className="form-control autocomplete-container" disabled={isAddDisabled} type="text" placeholder="Search nearest landmark near your layout" />
                                </div>
                                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                    <button onClick={handleSmartSearch} disabled={isAddDisabled} className="btn btn-primary">Search</button>
                                </div>
                            </div>


                        </div>
                        <div className="col-md-12 col-lg-12 col-sm-12 mb-3">
                            <div id="map" ref={mapRef} style={{ height: "500px" }} disabled={isAddDisabled}></div>
                        </div>
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                            <div className="row p-3  rounded shadow-sm">
                                {/* Result Type */}
                                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mb-2 text-center">
                                    <span id="resultType" className="fw-bold text-primary fs-5" disabled={isAddDisabled}>{resultType}</span>
                                </div>
                                {resultTypeError && (
                                    <div className="text-danger text-center mt-1">{resultTypeError}</div>
                                )}

                                {/* Latitude */}
                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6   text-center mb-2">
                                    <label className='form-label'>Latitude</label>  <input
                                        type="text"
                                        className="form-control text-center text-success"
                                        value={latitude}
                                        ref={latitudeRef} readOnly
                                        onChange={(e) => setLatitude(e.target.value)} disabled={isAddDisabled}
                                    />
                                    {latitudeerror && <div className="text-danger">{latitudeerror}</div>}

                                </div>
                                {/* Longitude */}
                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6   text-center">
                                    <label className='form-label'>Longitude</label> <input
                                        type="text"
                                        className="form-control text-center text-success"
                                        value={longitude}
                                        ref={longitudeRef} readOnly
                                        onChange={(e) => setLongitude(e.target.value)} disabled={isAddDisabled}
                                    />
                                    {longitudeerror && <div className="text-danger">{longitudeerror}</div>}

                                </div>
                                {landDetails !== "khata" && (
                                    <>
                                        {/* Zone name */}
                                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                                            <label className="form-label">Zone Name <span className='mandatory_color'>*</span></label>
                                            <select
                                                className="form-select"
                                                value={selectedZone}
                                                onChange={(e) => {
                                                    const zoneId = parseInt(e.target.value);
                                                    setSelectedZone(zoneId);
                                                    const wards = zoneWardData
                                                        .filter(z => z.zoneID === zoneId)
                                                        .map(z => ({ label: z.wardName, value: z.wardId }));
                                                    setWardOptions(wards);
                                                    setSelectedWard('');
                                                    setZoneError('');
                                                }}
                                                ref={zoneRef}
                                            >
                                                <option value="">Select Zone</option>
                                                {zoneOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            {zoneError && <div className="text-danger">{zoneError}</div>}

                                        </div>
                                        {/* ward name */}
                                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                                            <label className="form-label">Ward Name <span className='mandatory_color'>*</span></label>
                                            <select
                                                className="form-select"
                                                value={selectedWard}
                                                onChange={(e) => {
                                                    const wardId = parseInt(e.target.value, 10) || '';
                                                    setSelectedWard(wardId);
                                                    setWardError('');
                                                    loadStreetsForWard(wardId);          // 🔔 reuse
                                                }}
                                                ref={wardRef}
                                            >
                                                <option value="">Select Ward</option>
                                                {wardOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {wardError && <div className="text-danger">{wardError}</div>}

                                        </div>
                                        {/* Street name */}
                                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 mb-3">
                                            <label className="form-label">Street Name <span className='mandatory_color'>*</span></label>
                                            <select className="form-select" value={selectedStreet} ref={streetRef} onChange={(e) => setSelectedStreet(e.target.value)}>
                                                <option value="">Select Street</option>
                                                {streetOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {streetError && <div className="text-danger">{streetError}</div>}

                                        </div>
                                    </>
                                )}



                                {/* Owner Name */}
                                <div className="col-md-12 col-lg-12 col-sm-12 col-12  text-center">
                                    <span className="fw-semibold text-dark">
                                        Owner Name :
                                        <label className="text-success">
                                            {/* {
                                                ownerList.length > 0
                                                    ? ownerList.map(owner => owner.name).join(", ")
                                                    : "N/A"
                                            } */}
                                            {localOwnername || "N/A"}
                                        </label>
                                    </span>
                                </div>
                            </div>
                        </div>


                        <div className="col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10 mt-3"></div>

                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-3">
                            <button className="btn btn-primary btn-block mt-3" disabled={isAddDisabled}
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
                            setIsSitesSectionSaved={setIsSitesSectionSaved}
                            isSaveDisabled={isSitesSaved}  // ✅ Pass isSitesSaved as the disable flag
                            setIsAddDisabled={setIsAddDisabled}
                        />
                    )}

                </div>

            </div>


        </div>
    );
};

const IndividualRegularTable = ({ data, setData, totalSitesCount, onSave, onEdit, LKRS_ID, createdBy, createdName, roleID, setIsSitesSectionSaved, isSaveDisabled, setIsAddDisabled }) => {

    useEffect(() => {

    }, [data]);

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
                    //  Set updated data into state
                    setData(fetchResponse);
                    setIsSitesSectionSaved(false);
                    setIsAddDisabled(false); // <--- Set isAddDisabled to false here
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
                    return row.sitE_SHAPETYPE ? row.sitE_SHAPETYPE : "-";
                },
            },
            {
                Header: "Site Number",
                accessor: (row) => {
                    return row.sitE_NO ? row.sitE_NO : "-";
                },
            },
            {
                Header: "Block/Area",
                accessor: (row) => {
                    return row.sitE_AREA ? row.sitE_AREA : "-";
                },
            },
            {
                Header: "Number of sides",
                accessor: (row) => {
                    return row.sitE_NO_OF_SIDES ? row.sitE_NO_OF_SIDES : "-";
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
                    } else {
                        return "-";
                    }

                },
                Footer: (info) => {

                    return (
                        <strong>
                            Total Area:
                        </strong>
                    );
                },
            },
            // {
            //     Header: "Total Area",
            //     accessor: (row) => {
            //         if (row.sitE_AREAINSQFT && row.sitE_AREAINSQMT) {
            //             return `${row.sitE_AREAINSQFT} [Sq.ft] - ${row.sitE_AREAINSQMT} [Sq.mtr]`;
            //         } else {
            //             return "-";
            //         }
            //     },
            // },
            {
                Header: "Total Area",
                accessor: (row) => {
                    if (row.sitE_AREAINSQFT && row.sitE_AREAINSQMT) {
                        return `${row.sitE_AREAINSQFT} [Sq.ft] - ${row.sitE_AREAINSQMT} [Sq.mtr]`;
                    } else {
                        return "-";
                    }
                },
                Footer: (info) => {
                    const totalSqft = info.rows.reduce((sum, row) => {
                        const value = parseFloat(row.original.sitE_AREAINSQFT);
                        return isNaN(value) ? sum : sum + value;
                    }, 0);

                    const totalSqmt = info.rows.reduce((sum, row) => {
                        const value = parseFloat(row.original.sitE_AREAINSQMT);
                        return isNaN(value) ? sum : sum + value;
                    }, 0);

                    return (
                        <strong>
                            {totalSqft.toLocaleString()} [Sq.ft] - {totalSqmt.toLocaleString()} [Sq.mtr]
                        </strong>
                    );
                },
            },

            {
                Header: "Corner Site",
                accessor: (row) => {
                    return row.sitE_NO ? row.sitE_NO : "-";

                    return row.sitE_CORNERPLOT ? "YES" : "NO";
                },
            },
            {
                Header: "Type of Site",
                accessor: (row) => {
                    return row.sitE_TYPE ? row.sitE_TYPE : "-";
                    // return `${row.sitE_TYPE}`;
                },
            },
            {
                id: "chakbandi",
                Header: (
                    <>
                        Chakbandi<br />
                        [East | West | North | South]
                    </>
                ),
                accessor: (row) => {
                    const east = row.sitE_EAST || "-";
                    const west = row.sitE_WEST || "-";
                    const north = row.sitE_NORTH || "-";
                    const south = row.sitE_SOUTH || "-";
                    return `${east} | ${west} | ${north} | ${south}`;
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
        footerGroups,
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
        <div >
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
                    <tfoot>
                        {footerGroups.map((group, idx) => (
                            <tr {...group.getFooterGroupProps()} key={idx}>
                                {group.headers.map((column, i) => (
                                    <td
                                        {...column.getFooterProps()}
                                        key={i}
                                        style={{
                                            border: "1px solid #e5e7eb",
                                            padding: "12px 16px",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            backgroundColor: "#f3f4f6",
                                            color: "#374151",
                                        }}
                                    >
                                        {column.render("Footer")}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tfoot>

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
                <div className="col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10"></div>
                <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2" hidden>
                    <div className="form-check">
                        <button
                            className='btn btn-info btn-block'
                            disabled={totalSitesCount !== totalAddedSites || isSaveDisabled}
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
                            disabled={totalSitesCount !== totalAddedSites || isSaveDisabled}
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
    );

};
export default IndividualGPSBlock;

