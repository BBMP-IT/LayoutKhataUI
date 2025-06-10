import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../Layout/DashboardLayout';
import { useTranslation } from "react-i18next";
import i18n from "../../localization/i18n";
import SAS_Sample from '../../assets/Sample_SAS_APPLICATIONNO.jpeg';
import SampleDeep_no from '../../assets/deedNo.jpg';


const BBMP_TaxDetails = () => {

    const [zoomLevel] = useState(0.9);
    useEffect(() => {
        document.body.style.zoom = zoomLevel; // Apply zoom
    }, [zoomLevel]);
    //accordion style variables
    const [isOpen_section1, setIsOpen_section1] = useState(true);
    const [isOpen_section2, setIsOpen_section2] = useState(true);
    const [isOpen_section3, setIsOpen_section3] = useState(true);
    const [isOpen_section4, setIsOpen_section4] = useState(true);
    const [isOpen_section5, setIsOpen_section5] = useState(true);
    const [isOpen_section6, setIsOpen_section6] = useState(true);
    const [isOpen_section7, setIsOpen_section7] = useState(true);
    const [isOpen_section8, setIsOpen_section8] = useState(true);
    const [isOpen_section9, setIsOpen_section9] = useState(true);

    //fields variables
    const [ePID, setEPID] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('');
    const [wardNo, setWardNo] = useState('');
    const [wardName, setWardName] = useState('');
    const [oldwardNo, setOldWardNo] = useState('');
    const [oldpropertyNo, setOldPropertyNo] = useState('');
    const [sasNo, setSASNo] = useState('');
    const [propertyAddress, setPropertyAddress] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [propertyCategory, setPropertyCategory] = useState('');
    const [streetName, setStreetName] = useState('');

    //fetching feilds variable
    const [fetchsasNo, setFetchsasNo] = useState('');

    //validations error variables
    const [errors, setErrors] = useState({});

    //table visibility
    const [isSasValid, setIsSasValid] = useState(false); // New state to control table visibility

    //Kaveri radio btn variables
    const [iskaverimainRadioSelected, setIsKaverimainRadioSelected] = useState(false);
    const [iskaveriRadioSelected, setIsKaveriRadioSelected] = useState(false);
    const [kaverisqMeters, setKaveriSqMeters] = useState("");
    const [kaverisqFeet, setKaveriSqFeet] = useState("");
    const [kaverideedno, setKaverideedno] = useState("");
    const [showKaveriDocumentData, setShowKaveriDocumentData] = useState(false);
    const [selectedDeedInfoOption, setSelectedDeedInfoOption] = useState(null);
    const [showScheduleTable, setShowScheduleTable] = useState(false);
    const [showDeedInfo, setShowDeedInfo] = useState(true);
    const [showSaveDeedInformationTable, setShowSaveDeedInformationTable] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [errorSavingDeedInfo, setErrorSavingDeedInfo] = useState("");
    const [kaveri_documentType, setKaveri_DocumentType] = useState("0");
    const [documentdate, setdocumentDate] = useState("");
    const [showDocumentDetails, setShowDocumentDetails] = useState(false);
    const [showRegistrationContent, setShowregistrationContent] = useState(false);



    const minDate = "1950-01-01"; // Minimum allowed date
    const maxDate = "2004-04-01"; // Maximum allowed date



    const handleKaveriMainRadioChange = (e) => {
        setIsKaverimainRadioSelected(e.target.value);
    };

    const handleKaveriRadioChange = () => {
        setIsKaveriRadioSelected(true);
    };

    const handleSqMetersChange = (e) => {
        const value = e.target.value;
        setKaveriSqMeters(value);
        if (value) {
            setKaveriSqFeet((value * 10.764).toFixed(2)); // Convert Sq.M to Sq.Ft
        } else {
            setKaveriSqFeet("");
        }
    };

    const handleSqFeetChange = (e) => {
        const value = e.target.value;
        setKaveriSqFeet(value);
        if (value) {
            setKaveriSqMeters((value / 10.764).toFixed(2)); // Convert Sq.Ft to Sq.M
        } else {
            setKaveriSqMeters("");
        }
    };

    //Map
    const mapRef = useRef(null);
    const searchInputRef = useRef(null);
    const [latitude, setLatitude] = useState("N/A");
    const [longitude, setLongitude] = useState("N/A");
    const [resultType, setResultType] = useState("Location Data :");
    const markerRef = useRef(null);
    let map, autocomplete, geocoder;

    useEffect(() => {
        const initMap = () => {
            const center = { lat: 13.0074, lng: 77.5688 };
            map = new window.google.maps.Map(mapRef.current, {
                center,
                zoom: 17,
                mapTypeId: "hybrid",
            });

            markerRef.current = new window.google.maps.Marker({
                map,
                draggable: true,
            });

            autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
                componentRestrictions: { country: "in" },
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place.geometry) return;

                map.setCenter(place.geometry.location);
                markerRef.current.setPosition(place.geometry.location);
                updateCoordinates(place.geometry.location, "Location Data :", place.formatted_address);
            });

            geocoder = new window.google.maps.Geocoder();

            map.addListener("click", (event) => {
                placeMarker(event.latLng);
                geocodeLocation(event.latLng);
            });

            markerRef.current.addListener("dragend", (event) => {
                geocodeLocation(event.latLng);
            });
        };

        const placeMarker = (location) => {
            markerRef.current.setPosition(location);
        };

        const geocodeLocation = (location) => {
            geocoder.geocode({ location }, (results, status) => {
                if (status === "OK" && results[0]) {
                    updateCoordinates(location, "Location Data :", results[0].formatted_address);
                }
            });
        };

        const updateCoordinates = (location, resultType, address = "") => {
            setResultType(`${resultType} ${address}`);
            setLatitude(location.lat());
            setLongitude(location.lng());
        };

        initMap();
    }, []);

    const { t, i18n } = useTranslation();


    //validation for EPID
    const handleEPIDChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove any non-numeric characters
        setEPID(value);
    };
    //validation for ward no
    const handlewardNoChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove any non-numeric characters
        setWardNo(value);
    }
    //validation for old ward no
    const handleoldwardNoChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove any non-numeric characters
        setOldWardNo(value);
    }
    //validation for Old property no
    const handleoldpropertyNoChange = (e) => {
        let value = e.target.value.toUpperCase(); // Convert to uppercase
        if (value.startsWith("TEL")) {
            value = "TEL" + value.slice(3).replace(/\D/g, ''); // Keep "TEL" and allow only numbers after it
        } else {
            value = value.replace(/\D/g, ''); // Remove non-numeric characters
        }
        setOldPropertyNo(value);
    };

    //validation for Old property no
    const handleSasNoChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters

        // Validate length (10 digits), should not be all zeros, and should not start with zero
        if (value.length > 10) {
            value = value.slice(0, 10); // Restrict to 10 digits
        }

        let errorMessage = '';

        if (/^0/.test(value)) {
            errorMessage = t('translation.validation.verifyData.sas_swz');
        } else if (/^0+$/.test(value)) {
            errorMessage = t('translation.validation.verifyData.sas_all_zeros'); // Add translation key for this message
        } else if (value.length !== 10) {
            errorMessage = t('translation.validation.verifyData.sas_ten_digits'); // Add translation key for this message
        }

        setErrors((prevErrors) => ({ ...prevErrors, sasNo: errorMessage }));
        setSASNo(value);
        setIsSasValid(false); // Reset validation when input changes
    };
    //verify Data btn function
    const handleVerifySAS = () => {
        let errorMessage = '';

        if (!sasNo) {
            errorMessage = t('translation.validation.verifyData.sas_required'); // Add a translation key for this
        } else if (sasNo.length !== 10) {
            errorMessage = t('translation.validation.verifyData.sas_ten_digits');
        } else if (/^0/.test(sasNo)) {
            errorMessage = t('translation.validation.verifyData.sas_swz');
        } else if (/^0+$/.test(sasNo)) {
            errorMessage = t('translation.validation.verifyData.sas_all_zeros');
        }

        if (errorMessage) {
            setErrors((prevErrors) => ({ ...prevErrors, sasNo: errorMessage }));
            setIsSasValid(false); // Hide table
        } else {
            setErrors((prevErrors) => ({ ...prevErrors, sasNo: '' }));
            setIsSasValid(true); // Show table
        }
    };
    //Edit button for data as per BBMP register
    const [isBBMPregister_Editing, setIsBBMPregister_Editing] = useState(false);
    const handleEditClick1 = () => {
        setIsBBMPregister_Editing(true);
    };

    const [showModal, setShowModal] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

    const handleShow = (event) => {
        event.preventDefault(); // Prevents navigation
        setShowModal(true);
    };
    const handleRegistrationModalShow = (event) => {
        event.preventDefault(); // Prevents navigation
        setShowRegistrationModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
    };

    const handleRegistrationModalClose = () => {
        setShowRegistrationModal(false);
    };

    const handleDeedInfoRadioChange = (event) => {
        setSelectedDeedInfoOption(event.target.value);
        setShowScheduleTable(true); // Only show the schedule table when the radio is selected
    };
    //saving Deed information
    const handleSaveDeedInfo = () => {
        if (!selectedSchedule) {
            setErrorSavingDeedInfo("Please select a schedule.");
            return;
        }
        if (!selectedUnit) {
            setErrorSavingDeedInfo("Please select a unit of area (Sq.Ft. or Sq.Mt.).");
            return;
        }
        setShowSaveDeedInformationTable(true); // Show the second table after validation
        setShowDeedInfo(false); // Hide the table and content below
    };
    const handleScheduleChange = (event) => {
        setSelectedSchedule(event.target.value);
        setErrorSavingDeedInfo(""); // Clear error when a selection is made
    };
    const handleUnitChange = (event) => {
        setSelectedUnit(event.target.value);
        setErrorSavingDeedInfo(""); // Clear error when a selection is made
    };


    //Kaveri Document Data table starts
    const KaveriDocumentData = () => {
        return (
            <div>
                {showDeedInfo && (
                    <>

                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                textAlign: 'center',
                                border: '1px solid black'
                            }}
                        >
                            <thead>
                                <tr style={{ border: '1px solid black' }}>
                                    <th colSpan="4" style={{ backgroundColor: '#ddd', padding: '10px', border: '1px solid black' }}>
                                        {t('translation.kaveriData.KaveriDocumentData.title')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ border: '1px solid black' }}>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.finalregistrationNo')}</td>
                                    <td style={{ border: '1px solid black' }}>RMN-1-00062-2020-21</td>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.natureDeed')}</td>
                                    <td style={{ border: '1px solid black' }}>Sale</td>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.applicationNo')}</td>
                                    <td style={{ border: '1px solid black' }}></td>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.registrationDate')}</td>
                                    <td style={{ border: '1px solid black' }}>2020-05-06T13:30:15</td>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <th colSpan="4" style={{ backgroundColor: '#ddd', padding: '10px', border: '1px solid black' }}>
                                        {t('translation.kaveriData.KaveriDocumentData.table.propertyDetails')}
                                    </th>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.propertyID')}</td>
                                    <td style={{ border: '1px solid black' }}>485456</td>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.documentID')}</td>
                                    <td style={{ border: '1px solid black' }}>235946</td>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.village')}</td>
                                    <td style={{ border: '1px solid black' }}>Vinayaka Nagara 1st Stage</td>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.sroName')}</td>
                                    <td style={{ border: '1px solid black' }}>Ramanagara</td>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <th colSpan="4" style={{ backgroundColor: '#ddd', padding: '10px', border: '1px solid black' }}>
                                        {t('translation.kaveriData.KaveriDocumentData.table.schedulerDetails')}
                                    </th>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.scheduleType')}</td>
                                    <td style={{ border: '1px solid black' }}>1A</td>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.propertyArea')}</td>
                                    <td style={{ border: '1px solid black' }}>111.48</td>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.scheduleDesc')}</td>
                                    <td colSpan="3" style={{ border: '1px solid black' }}>
                                        ಚಾಮುಂಡಿಪುರ ವಾಡ್ ನಂ 1 ನಂ. ನ: ಇ-ಆರ್ ಸಿ:1-2-514-83 ಭೂಮೇಶ್ವರಿಯ ಬಾತಾ ಸಂಖ್ಯೆ 747/649/304/577/11,
                                        ಸ್ಟೀಟ್ ನಂ. 11 ವಿನಾಯಕನಗರ 2ನೇ ಹಂತ, ವಾಡ್ ನಂ. 01, ರಾಮನಗರ ಟೌನ್. ಪ್ಲಾಟ್ ಪ್ರಮಾಣ 12.192024 ಮೀ
                                        ಉತ್ತರ ದಕ್ಷಿಣ 9.144018 ಅಡಿ, 111.4836 ಚದರ ಮೀಟರ್‌ಗಳು ಅಂದಾಗಿ 40 x 30 ಅಡಿಗಳ ಒಟ್ಟು 1200 ಚದರ
                                        ಅಡಿಗಳ ಖಾಲಿ ನಿವೇಶನ
                                    </td>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <th colSpan="4" style={{ backgroundColor: '#ddd', padding: '10px', border: '1px solid black' }}>
                                        {t('translation.kaveriData.KaveriDocumentData.table.documentOwnerData')}
                                    </th>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.partyName')}</td>
                                    <td style={{ border: '1px solid black' }}>ಕಂಪಣ್ಣ</td>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.idproofType')}</td>
                                    <td style={{ border: '1px solid black' }}>ಸಂಗಬಸವನದೊಡ್ಡಿ, ಕಸಬಾ ಹೋಬಳಿ, ರಾಮನಗರ ತಾ.</td>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.idproofNumber')}</td>
                                    <td style={{ border: '1px solid black' }}></td>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.partyAddress')}</td>
                                    <td style={{ border: '1px solid black' }}></td>
                                </tr>
                                <tr style={{ border: '1px solid black' }}>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.partyType')}</td>
                                    <td style={{ border: '1px solid black' }}>Executant/Giver</td>
                                    <td style={{ border: '1px solid black' }}>{t('translation.kaveriData.KaveriDocumentData.table.admissionDate')}</td>
                                    <td style={{ border: '1px solid black' }}></td>
                                </tr>
                            </tbody>
                        </table>
                        <br />
                        <h5>{t('translation.kaveriData.KaveriDocumentData.table.deedInformation')}</h5>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-600 text-center" style={{ backgroundColor: '#ddd' }}>
                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.selectProperty')}</th>
                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.propertyID')}	</th>
                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.documentID')}</th>
                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.village')}</th>
                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.sroName')}</th>
                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.propertyType')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-center">
                                        <td className="border border-gray-300 px-6 py-3">
                                            <input
                                                className="form-check-input radioStyle"
                                                type="radio"
                                                name="property"
                                                value="property"  // Ensure each radio button has a value
                                                checked={selectedDeedInfoOption === "property"}  // Controlled component
                                                onChange={handleDeedInfoRadioChange}
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">485456</td>
                                        <td className="border border-gray-300 px-6 py-3">235946</td>
                                        <td className="border border-gray-300 px-6 py-3">Vinayaka Nagara 1st Stage</td>
                                        <td className="border border-gray-300 px-6 py-3">Ramanagara</td>
                                        <td className="border border-gray-300 px-6 py-3">Non-Agriculture</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <br />
                        {showScheduleTable && (
                            <>
                                <h5>{t('translation.kaveriData.KaveriDocumentData.table.scheduleInformation')}</h5>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-600 text-center" style={{ backgroundColor: '#ddd' }}>
                                                <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.selectschedule')}</th>
                                                <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.scheduleType')}</th>
                                                <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.scheduleDesc')}</th>
                                                <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.totalarea')}</th>
                                                <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.unitOfArea')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="text-center">
                                                <td className="border border-gray-300 px-6 py-3">
                                                    <input
                                                        className="radioStyle"
                                                        type="radio"
                                                        name="schedule"
                                                        value="schedule"
                                                        checked={selectedSchedule === "schedule"}
                                                        onChange={handleScheduleChange}
                                                    /></td>
                                                <td className="border border-gray-300 px-6 py-3">485456</td>
                                                <td className="border border-gray-300 px-6 py-3">235946</td>
                                                <td className="border border-gray-300 px-6 py-3">Vinayaka Nagara 1st Stage</td>
                                                <td className="border border-gray-300 px-6 py-3">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input radioStyle"
                                                            type="radio"
                                                            name="unit"
                                                            value="sqft"
                                                            checked={selectedUnit === "sqft"}
                                                            onChange={handleUnitChange}
                                                        />
                                                        <label className="form-check-label">{t('translation.kaveriData.KaveriDocumentData.table.sqft')}</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input radioStyle"
                                                            type="radio"
                                                            name="unit"
                                                            value="sqmt"
                                                            checked={selectedUnit === "sqmt"}
                                                            onChange={handleUnitChange}
                                                        />
                                                        <label className="form-check-label">{t('translation.kaveriData.KaveriDocumentData.table.sqmt')}</label>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    {errorSavingDeedInfo && <p className="text-red-500  mt-2" style={{ color: 'red' }}>{errorSavingDeedInfo}</p>}
                                    <br />
                                    <div className="col-md-4 col-lg-4 mt-2">
                                        <div className="form-group">
                                            <button type="submit" onClick={handleSaveDeedInfo} className="btn btn_color btn-block ">{t('translation.buttons.saveDeedInfo')}</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}


                    </>
                )}
            </div>

        );
    };


    const handledeepNoChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
        setKaverideedno(value);
        // Validate length (10 digits), should not be all zeros, and should not start with zero
        if (value.length > 10) {
            value = value.slice(0, 10); // Restrict to 10 digits
        }

        let errorMessage = '';

        if (!value) {
            errorMessage = 'Register number is required';
        } else if (value.length !== 10) {
            errorMessage = 'Register number must be exactly 10 digits';
        } else if (/^0/.test(value)) {
            errorMessage = 'Register number cannot start with zero';
        } else if (/^0+$/.test(value)) {
            errorMessage = 'Register number cannot be all zeros';
        }

        setErrors((prevErrors) => ({ ...prevErrors, kaverideedno: errorMessage }));
    };

    //verify Data btn function
    const handleVerifyDeedNo = () => {
        let errorMessage = '';

        if (!kaverideedno) {
            errorMessage = 'Register number is required'; // Add a translation key for this
        } else if (kaverideedno.length !== 10) {
            errorMessage = 'Register number must be exactly 10 digits';
        } else if (/^0/.test(kaverideedno)) {
            errorMessage = 'Register number cannot start with zero';
        } else if (/^0+$/.test(kaverideedno)) {
            errorMessage = 'Register number cannot be all zeros';
        }

        if (errorMessage) {
            setErrors((prevErrors) => ({ ...prevErrors, kaverideedno: errorMessage }));
            setIsSasValid(false); // Hide table
        } else {
            setErrors((prevErrors) => ({ ...prevErrors, kaverideedno: '' }));
            setShowKaveriDocumentData(true);
        }
    };

    const handleKaveriDocumentTypeChange = (event) => {
        const selectedValue = event.target.value;
        setKaveri_DocumentType(selectedValue);

        // Show Document Details only if "Other" (26) is selected
        setShowDocumentDetails(selectedValue === "26");
    };

    const handleDocumentDateChange = (e) => {
        const selectedDate = e.target.value;
        setdocumentDate(selectedDate);
    };
    const handleSaveRegistrationInfo = () => {
        setShowregistrationContent(true); // show content after save is clicked
    };

    return (
        <DashboardLayout>
            <div>
                <div className="my-3 my-md-5">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                {/* Section 1 starts */}
                                <div className="accordion" id="formAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button
                                                className="accordion-button collapsed btn_color"
                                                type="button"
                                                onClick={() => setIsOpen_section1(!isOpen_section1)}
                                            >
                                                {t('translation.DataAvailableInBBMPBooks')}
                                            </button>
                                        </h2>
                                        <div
                                            id="collapseOne"
                                            className={`accordion-collapse collapse ${isOpen_section1 ? "show" : ""}`}
                                            aria-labelledby="headingOne"
                                            data-bs-parent="#formAccordion"
                                        >
                                            <div className="accordion-body">
                                                <div className="row">
                                                    {/* EPID starts */}
                                                    <div className="col-md-6 col-lg-4 col-12">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.propertyEID')}</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.propertyEID')}
                                                                    onChange={handleEPIDChange}
                                                                    value={ePID}
                                                                    maxLength={10}
                                                                    disabled={true} // Always disabled
                                                                />
                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* EPID ends */}

                                                    {/* District starts */}
                                                    <div className="col-md-6 col-lg-4 col-12">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.district')}</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.district')}
                                                                    value={district}
                                                                    disabled={true} // Always disabled
                                                                />
                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* District ends */}

                                                    {/* city starts */}
                                                    <div className="col-md-6 col-lg-4 col-12">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.city')}</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.city')}
                                                                    value={city}
                                                                    disabled={true} // Always disabled
                                                                />
                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* city ends */}

                                                    {/* ward no starts */}
                                                    <div className="col-md-6 col-lg-4 col-12">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.wardNumber')}</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="tel"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.wardNumber')}
                                                                    value={wardNo}
                                                                    onChange={handlewardNoChange}
                                                                    disabled={true} // Always disabled
                                                                />
                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* ward no end */}

                                                    {/* ward name starts */}
                                                    <div className="col-md-6 col-lg-4 col-12">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.wardName')}</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.wardName')}
                                                                    value={wardName}
                                                                    disabled={true} // Always disabled
                                                                />
                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* ward name ends */}

                                                    {/* Old ward no starts */}
                                                    <div className="col-md-6 col-lg-4 col-12">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.oldWardNo')}</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="tel"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.oldWardNo')}
                                                                    value={oldwardNo}
                                                                    onChange={handleoldwardNoChange}
                                                                    disabled={true} // Always disabled
                                                                />
                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Old ward no ends */}

                                                    {/* Old property no starts */}
                                                    <div className="col-md-6 col-lg-4 col-12">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.oldPropertyNo')}</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text" // Use "text" instead of "tel" to avoid conflicts
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.oldPropertyNo')}
                                                                    value={oldpropertyNo}
                                                                    maxLength={10}
                                                                    onChange={handleoldpropertyNoChange} // Corrected event handler
                                                                    disabled={!isBBMPregister_Editing} // Editable when isEditing is true
                                                                    style={{
                                                                        backgroundColor: isBBMPregister_Editing ? "#e6f7ff" : "",
                                                                        border: isBBMPregister_Editing ? "2px solid #0077b6" : "1px solid #ccc",
                                                                        transition: "all 0.3s ease-in-out"
                                                                    }}
                                                                />
                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Old property no ends */}

                                                    {/* SAS application no starts */}
                                                    <div className="col-md-6 col-lg-4 col-12">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.SASBaseApplicationNo')} </label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="tel"
                                                                    maxLength={10}
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.SASBaseApplicationNo')}
                                                                    value={fetchsasNo}
                                                                    disabled={true} // Always disabled
                                                                />
                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* SAS application no ends */}

                                                    {/* Property address starts */}
                                                    <div className="col-md-6 col-lg-4 col-12">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.PropertyAddress')}</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.PropertyAddress')}
                                                                    value={propertyAddress}
                                                                    disabled={true} // Always disabled
                                                                />
                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>

                                                        </div>
                                                    </div>
                                                    {/* Property address ends */}

                                                    {/* Property type starts */}
                                                    <div className="col-md-6 col-lg-4">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.PropertyType')}</label>
                                                            <select className="form-control" name="propertyAddress" value={propertyType}
                                                                disabled={true}>
                                                                <option value="1">{t('translation.data_as_per_bbmp_Register.propertyType.option1')}</option>
                                                                <option value="2">{t('translation.data_as_per_bbmp_Register.propertyType.option2')}</option>
                                                                <option value="3">{t('translation.data_as_per_bbmp_Register.propertyType.option3')}</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    {/* Property type ends */}

                                                    {/* Property category starts */}
                                                    <div className="col-md-6 col-lg-4">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.Property Category(A/B)')}</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.Property Category(A/B)')}
                                                                    value={propertyCategory}
                                                                    disabled={true} // Always disabled
                                                                />
                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>

                                                        </div>
                                                    </div>
                                                    {/* Property category ends */}

                                                    {/* street starts */}
                                                    <div className="col-md-6 col-lg-4">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.streetName')}</label>
                                                            <div className="input-group">


                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                    placeholder={t('translation.streetName')}
                                                                    value={streetName}
                                                                    onChange={(e) => setStreetName(e.target.value)}
                                                                    disabled={!isBBMPregister_Editing}
                                                                    style={{
                                                                        backgroundColor: isBBMPregister_Editing ? "#e6f7ff" : "",
                                                                        border: isBBMPregister_Editing ? "2px solid #0077b6" : "1px solid #ccc",
                                                                        transition: "all 0.3s ease-in-out"
                                                                    }}
                                                                />


                                                                <span
                                                                    className="input-group-text"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-placement="top"
                                                                    title="Enter the property ID as per records."
                                                                >
                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                </span>
                                                            </div>

                                                        </div>
                                                    </div>

                                                    {/* Table starts */}
                                                    <div className="col-md-12 col-lg-12 w-full" hidden >

                                                        <div className="overflow-x-auto w-full">
                                                            <table className="w-full min-w-full border-collapse border border-gray-300" width={890}>
                                                                <thead>
                                                                    <tr className="bg-gray-200 ">
                                                                        <th className="border border-gray-300 px-3 py-3"></th>
                                                                        <th className="border border-gray-300 px-3 py-3">Book Value</th>
                                                                        <th className="border border-gray-300 px-3 py-3">Selected New Value</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr className="">
                                                                        <th className="border border-gray-300 px-3 py-3">Zone Name</th>
                                                                        <td className="border border-gray-300 px-3 py-3">PID</td>
                                                                        <td className="border border-gray-300 px-3 py-3">PID</td>
                                                                    </tr>
                                                                    <tr className="bg-gray-200 ">
                                                                        <th className="border border-gray-300 px-3 py-3">Ward Name</th>
                                                                        <td className="border border-gray-300 px-3 py-3">PID</td>
                                                                        <td className="border border-gray-300 px-3 py-3">PID</td>
                                                                    </tr>
                                                                    <tr className="bg-gray-200 ">
                                                                        <th className="border border-gray-300 px-3 py-3">Street Name</th>
                                                                        <td className="border border-gray-300 px-3 py-3">PID</td>
                                                                        <td className="border border-gray-300 px-3 py-3">PID</td>
                                                                    </tr>
                                                                    <tr className="bg-gray-200 ">
                                                                        <th className="border border-gray-300 px-3 py-3">Property Old Number</th>
                                                                        <td className="border border-gray-300 px-3 py-3">PID</td>
                                                                        <td className="border border-gray-300 px-3 py-3">PID</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div><br />

                                                    </div>
                                                    {/* Table ends */}
                                                </div>
                                                <hr style={{ border: '1px dashed black' }} />

                                                <div className="row">
                                                    <div className="col-md-6 col-lg-3">
                                                        <div className="form-group">
                                                            <label className="form-label">{t('translation.PropertyType')} <span style={{ color: 'red' }}>*</span></label>
                                                            <select className="form-control" name="propertyAddress">
                                                                <option value="1">{t('translation.data_as_per_bbmp_Register.propertyType.option1')}</option>
                                                                <option value="2">{t('translation.data_as_per_bbmp_Register.propertyType.option2')}</option>
                                                                <option value="3">{t('translation.data_as_per_bbmp_Register.propertyType.option3')}</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6 col-lg-6">
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                {t('translation.data_as_per_bbmp_Register.input.sasapplicationno1')}
                                                                <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                className="form-control"
                                                                name="sasNo"
                                                                placeholder={t('translation.SASBaseApplicationNo')}
                                                                maxLength={10}
                                                                value={sasNo}
                                                                onChange={handleSasNoChange}  // Fixed: changed 'onchange' to 'onChange'
                                                            />
                                                            {errors.sasNo && <small className="text-danger">{errors.sasNo}</small>}  {/* Display error message */}
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6 col-lg-3 col-12">
                                                        <div className="form-group">
                                                            <a href="/" onClick={handleShow} style={{ color: "blue", cursor: "pointer" }}>{t("translation.View Sample")}</a>
                                                            <button type="submit" onClick={handleVerifySAS} className="btn btn_color btn-block ml-auto">{t('translation.VerifySASApplicationNumber')}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    {/* Custom Modal */}
                                                    {showModal && (
                                                        <div className="modal-overlay">
                                                            <div className="modal-content">
                                                                <span className="close-btn" onClick={handleClose}>&times;</span>
                                                                <h2>{t('translation.modal.sasapplicationno')}</h2>

                                                                <img src={SAS_Sample} alt="Sample" style={{ maxWidth: "100%", height: "auto" }} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Modal CSS */}
                                                    <style>{`
                                                        .modal-overlay {
                                                        position: fixed;
                                                        top: 0;
                                                        left: 0;
                                                        width: 100%;
                                                        height: 100%;
                                                        background: rgba(0, 0, 0, 0.5);
                                                        display: flex;
                                                        justify-content: center;
                                                        align-items: center;
                                                        z-index: 1000;
                                                        }
                                                        .modal-content {
                                                        background: white;
                                                        padding: 20px;
                                                        width: 80%; /* Increased width */
                                                        max-width: 900px; /* Large size modal */
                                                        border-radius: 8px;
                                                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                                                        text-align: center;
                                                        position: relative;
                                                        }
                                                        .close-btn {
                                                        position: absolute;
                                                        top: 10px;
                                                        right: 15px;
                                                        font-size: 24px;
                                                        cursor: pointer;
                                                        }
                                                    `}</style>
                                                </div>
                                                {/* Conditionally render the table */}

                                                <div className="row">
                                                    {isSasValid && (
                                                        <div className="col-md-12 col-lg-12 ">
                                                            {/* Table starts */}
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full border-collapse border border-gray-300">
                                                                    <thead>
                                                                        <tr className="bg-gray-200 text-center">
                                                                            <th className="border border-gray-300 px-6 py-3">{t('translation.table.sas.sas_applicationno')}</th>
                                                                            <th className="border border-gray-300 px-6 py-3">{t('translation.table.sas.epid')}</th>
                                                                            <th className="border border-gray-300 px-6 py-3">{t('translation.table.sas.khataNo')}</th>
                                                                            <th className="border border-gray-300 px-6 py-3">{t('translation.table.sas.name_khatedar')}</th>
                                                                            <th className="border border-gray-300 px-6 py-3">{t('translation.table.sas.address')}</th>
                                                                            <th className="border border-gray-300 px-6 py-3">{t('translation.table.sas.type')}</th>
                                                                            <th className="border border-gray-300 px-6 py-3">{t('translation.table.sas.sitearea')}</th>
                                                                            <th className="border border-gray-300 px-6 py-3">{t('translation.table.sas.builduparea')}</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr className="text-center">
                                                                            <td className="border border-gray-300 px-6 py-3">ApplicationNumber</td>
                                                                            <td className="border border-gray-300 px-6 py-3">PID</td>
                                                                            <td className="border border-gray-300 px-6 py-3">KHATHASURVEYNO</td>
                                                                            <td className="border border-gray-300 px-6 py-3">OwnerName</td>
                                                                            <td className="border border-gray-300 px-6 py-3">PropertyAddress</td>
                                                                            <td className="border border-gray-300 px-6 py-3">PropertyNature</td>
                                                                            <td className="border border-gray-300 px-6 py-3">SiteArea</td>
                                                                            <td className="border border-gray-300 px-6 py-3">BuiltUpArea</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            {/* Table ends */}
                                                        </div>
                                                    )}
                                                    <div className="col-md-3 col-lg-2 mt-5"></div>
                                                    <div className="col-md-3 col-lg-4 mt-5">
                                                        <div className="form-group">
                                                            <button type="submit" onClick={handleEditClick1} className="btn btn_color btn-block ml-auto">{t('translation.buttons.edit')}</button>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 col-lg-4 mt-5">
                                                        <div className="form-group">
                                                            <button type="submit" className="btn btn_color btn-block ml-auto">{t('translation.buttons.save&next')}</button>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Section 1 ends */}
                                {/* Section 2 starts */}
                                <br />
                                <div className="accordion" id="formAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button
                                                className="accordion-button collapsed btn_color"
                                                type="button"
                                                onClick={() => setIsOpen_section2(!isOpen_section2)}
                                            >
                                                {t('translation.KAVERISERVICESDATA')}
                                            </button>
                                        </h2>
                                        <div
                                            id="collapseOne"
                                            className={`accordion-collapse collapse ${isOpen_section2 ? "show" : ""}`}
                                            aria-labelledby="headingOne"
                                            data-bs-parent="#formAccordion"
                                        >
                                            <div className="accordion-body">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-12 col-lg-12">
                                                            <div className="form-check">
                                                                <input className="form-check-input radioStyle" type="radio" value="option1" checked={iskaverimainRadioSelected === "option1"}
                                                                    onChange={handleKaveriMainRadioChange} />
                                                                <label className="form-check-label">
                                                                    {t("translation.kaveriData.radio.option1")}
                                                                </label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input className="form-check-input radioStyle" type="radio" value="option2" checked={iskaverimainRadioSelected === "option2"}
                                                                    onChange={handleKaveriMainRadioChange} />
                                                                <label className="form-check-label">
                                                                    {t("translation.kaveriData.radio.option2")}
                                                                </label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input className="form-check-input radioStyle" type="radio" value="option3" checked={iskaverimainRadioSelected === "option3"}
                                                                    onChange={handleKaveriMainRadioChange} />
                                                                <label className="form-check-label">
                                                                    {t("translation.kaveriData.radio.option3")}
                                                                </label>
                                                            </div>
                                                        </div>
                                                        {/* Show additional content only when Option 1 is selected */}
                                                        {iskaverimainRadioSelected === "option1" && (
                                                            <>
                                                                <div className="col-md-12 col-lg-12">
                                                                    <br />
                                                                    <span>{t('translation.kaveriData.registrationNo')} <span style={{ color: 'red' }}>*</span>&nbsp;&nbsp;
                                                                        <a href="/" onClick={handleRegistrationModalShow} style={{ color: "blue", cursor: "pointer" }}>{t("translation.View Sample")}</a></span>
                                                                </div>
                                                                <div className="col-md-8 col-lg-8 mt-2">
                                                                    <div className="form-group">
                                                                        {/* <span className="form-label">{t('translation.kaveriData.registerNo')} </span> */}

                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            name="example-text-input"
                                                                            placeholder={t('translation.kaveriData.placeholder')}
                                                                            value={kaverideedno} maxLength={10}
                                                                            onChange={handledeepNoChange} />
                                                                        {errors.kaverideedno && <small className="text-danger">{errors.kaverideedno}</small>}
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4 col-lg-4 mt-2">
                                                                    <div className="form-group">

                                                                        <button type="submit" onClick={handleVerifyDeedNo} className="btn btn_color btn-block ">{t('translation.buttons.getKaveriData')}</button>
                                                                    </div>
                                                                </div>
                                                                <br />
                                                                {showKaveriDocumentData && <KaveriDocumentData />}
                                                                {/* Second Table - Only visible if validation passes */}
                                                                {showSaveDeedInformationTable && (
                                                                    <div><div className="col-md-12 col-lg-12 "> <br />
                                                                        {/* Table starts */}
                                                                        <div className="overflow-x-auto">
                                                                            <table className="w-full border-collapse border border-gray-300">
                                                                                <thead>
                                                                                    <tr className="bg-gray-200 text-center">
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.registerNo')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.natureDeed')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.articleType')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.registrationDateTime')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.areasqmt')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.areaftmt')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.table.measurement')}</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    <tr className="text-center">
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                        {/* Table ends */}
                                                                    </div>
                                                                        <div className="col-md-3 col-lg-4 mt-5">
                                                                            <div className="form-group">
                                                                                <button type="submit" className="btn btn_color btn-block ml-auto">{t('translation.buttons.save&next')}</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            </>
                                                        )}
                                                        <div>
                                                            {/* Custom Modal */}
                                                            {showRegistrationModal && (
                                                                <div className="modal-overlay">
                                                                    <div className="modal-content">
                                                                        <span className="close-btn" onClick={handleRegistrationModalClose}>&times;</span>
                                                                        <h2>{t('translation.modal.deedno')}</h2>

                                                                        <img src={SampleDeep_no} alt="Sample" style={{ maxWidth: "100%", height: "auto" }} />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Modal CSS */}
                                                            <style>{`
                                                        .modal-overlay {
                                                        position: fixed;
                                                        top: 0;
                                                        left: 0;
                                                        background: rgba(0, 0, 0, 0.5);
                                                        display: flex;
                                                        justify-content: center;
                                                        align-items: center;
                                                        z-index: 1000;
                                                        }
                                                        .modal-content {
                                                        background: white;
                                                        padding: 20px;
                                                        width: 50%; /* Increased width */
                                                        height:50%
                                                        max-width: 900px; /* Large size modal */
                                                        border-radius: 8px;
                                                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                                                        text-align: center;
                                                        position: relative;
                                                        }
                                                        .close-btn {
                                                        position: absolute;
                                                        top: 10px;
                                                        right: 15px;
                                                        font-size: 24px;
                                                        cursor: pointer;
                                                        }
                                                    `}</style>
                                                        </div>


                                                    </div>
                                                    <br />
                                                    {iskaverimainRadioSelected === "option2" && (
                                                        <>

                                                            {!showRegistrationContent && (
                                                                <div className="row">
                                                                    <h4>{t('translation.kaveriData.KaveriDocumentData.radiobtn2.title')}</h4>
                                                                    <div className="col-md-6 col-lg-4 col-12">
                                                                        <div className="form-group">
                                                                            <label className="form-label">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentType')} <span style={{ color: 'red' }}>*</span></label>
                                                                            <div className="input-group">
                                                                                <select
                                                                                    className="form-control select2"
                                                                                    name="kaveri_documentType"
                                                                                    id="kaveri_documentType"
                                                                                    onChange={handleKaveriDocumentTypeChange}
                                                                                    value={kaveri_documentType}
                                                                                    placeholder={t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentType')}
                                                                                >
                                                                                    <option value="0">--Select--</option>
                                                                                    <option value="26">ಇತರೆ/Other</option>
                                                                                    <option value="28">ಸ್ವಾಧೀನ ಪತ್ರ/Possession Certificate</option>
                                                                                    <option value="29">ಗುತ್ತಿಗೆ ಯಾ ಕ್ರಯ ಪತ್ರ/ಕ್ರಯ ಪತ್ರ from BDA/KHB/BMICAPA/KIADB/KSSIDC/Lease cum Sale Deed/Sale Deed from BDA/KHB/BMICAPA/KIADB/KSSIDC</option>
                                                                                    <option value="31">ಕ್ರಯ ಪತ್ರ/Sale Deed</option>
                                                                                    <option value="48">ಕ್ರಯ ಪ್ರಮಾಣ ಪತ್ರ/Certificate of Sale/Sale Certificate</option>
                                                                                    <option value="49">ವಸಾಹತು ಪತ್ರ/Settlement Deed</option>
                                                                                    <option value="50">ವಿನಿಮಯ ಪತ್ರ/Exchange of Property Deed</option>
                                                                                    <option value="51">ವಿಲ್‌ ಯಾ ಮರಣ ಶಾಸನ ಪತ್ರ/Will</option>
                                                                                    <option value="52">ನ್ಯಾಯಾಲಯದ ತೀರ್ಪು/ಆದೇಶ/Court Decree/Orders</option>
                                                                                    <option value="211">ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿ ರಶೀದಿ/Property Tax Receipt</option>
                                                                                    <option value="213">ದಾನ ಪತ್ರ/Gift Deed</option>
                                                                                    <option value="216">ವಿಭಾಗ ಪತ್ರ/Partition Deed</option>
                                                                                    <option value="217">ಹಕ್ಕು / ಬಿಡುಗಡೆ ಪತ್ರ/Right / Release Deed</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {showDocumentDetails && (
                                                                        <div className="col-md-6 col-lg-4 col-12">
                                                                            <div className="form-group">
                                                                                <label className="form-label">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentDetails')}</label>
                                                                                <div className="input-group">
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        name="example-text-input"
                                                                                        placeholder={t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentDetails')}
                                                                                    />
                                                                                    <span
                                                                                        className="input-group-text"
                                                                                        data-bs-toggle="tooltip"
                                                                                        data-bs-placement="top"
                                                                                        title="Enter the property ID as per records."
                                                                                    >
                                                                                        <i className="fas fa-info-circle text-secondary"></i>
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="col-md-6 col-lg-4 col-12">
                                                                        <div className="form-group">
                                                                            <label className="form-label">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentDateTime')}</label>
                                                                            <div className="input-group">
                                                                                <input
                                                                                    type="date"
                                                                                    className="form-control"
                                                                                    value={documentdate}
                                                                                    onChange={handleDocumentDateChange}
                                                                                    min={minDate}
                                                                                    max={maxDate}
                                                                                />
                                                                                <span
                                                                                    className="input-group-text"
                                                                                    data-bs-toggle="tooltip"
                                                                                    data-bs-placement="top"
                                                                                    title="Select a date between 01-01-1950 and 01-04-2004."
                                                                                >
                                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6 col-lg-4 col-12">
                                                                        <div className="form-group">
                                                                            <label className="form-label">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentRegistrationNo')}</label>
                                                                            <div className="input-group">
                                                                                <input
                                                                                    type="tel"
                                                                                    className="form-control"
                                                                                    placeholder={t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentRegistrationNo')}
                                                                                />
                                                                                <span
                                                                                    className="input-group-text"
                                                                                    data-bs-toggle="tooltip"
                                                                                    data-bs-placement="top"
                                                                                    title="Select a date between 01-01-1950 and 01-04-2004."
                                                                                >
                                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6 col-lg-4 col-12">
                                                                        <div className="form-group">
                                                                            <label className="form-label">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.uploadDocument')}</label>
                                                                            <div className="input-group">
                                                                                <input
                                                                                    type="file"
                                                                                    className="form-control"

                                                                                />
                                                                                <span
                                                                                    className="input-group-text"
                                                                                    data-bs-toggle="tooltip"
                                                                                    data-bs-placement="top"
                                                                                    title="Select a file. Only PDF files are allowed, with a maximum size of 5 MB."
                                                                                >
                                                                                    <i className="fas fa-info-circle text-secondary"></i>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6 col-lg-8 col-12"></div>
                                                                    <div className="col-md-4 col-lg-4 mt-2">
                                                                        <div className="form-group">
                                                                            <button type="submit" className="btn btn_color btn-block " onClick={handleSaveRegistrationInfo}>Save</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {showRegistrationContent && (
                                                                <div className='row'>
                                                                    <div className="col-md-12 col-lg-12 col-12 mt-2">
                                                                        <div className="overflow-x-auto">
                                                                            <table className="w-full border-collapse border border-gray-300">
                                                                                <thead>
                                                                                    <tr className="bg-gray-600 text-center" style={{ backgroundColor: '#ddd' }}>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.slno')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentType')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentDetails')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentRegistrationNo')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.documentDateTime')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.uploadDocument')}</th>
                                                                                        <th className="border border-gray-300 px-6 py-3">{t('translation.kaveriData.KaveriDocumentData.radiobtn2.action')}</th>

                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    <tr className="text-center">
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3">Vinayaka Nagara 1st Stage</td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                        <td className="border border-gray-300 px-6 py-3"></td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>

                                                                    <div className="col-md-4 col-lg-4 mt-2">
                                                                        <div className="form-group">
                                                                            <button type="submit" className="btn btn_color btn-block ">Save & Proceed Next</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    {iskaverimainRadioSelected === "option3" && (
                                                        <div className="col-md-4 col-lg-4 mt-2">
                                                            <div className="form-group">
                                                                <button type="submit" className="btn btn_color btn-block ">Save & Proceed Next</button>
                                                            </div>
                                                        </div>
                                                    )}


                                                    {(iskaverimainRadioSelected === "option1" ||
                                                        iskaverimainRadioSelected === "option2" ||
                                                        iskaverimainRadioSelected === "option3") && (

                                                            <div className='row'>
                                                                {/* I accept the area in Kaveri System Starts */}
                                                                <div className="col-md-4 col-lg-4">
                                                                    <div className="form-check">
                                                                        <input className="form-check-input radioStyle" type="radio" />
                                                                        <label>
                                                                            I accept the area in Kaveri System
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4 col-lg-4">
                                                                    <div className="form-check">

                                                                        <label>
                                                                            Area in Sq.Mtrs.
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4 col-lg-4">
                                                                    <div className="form-check">

                                                                        <label>
                                                                            Area in Sq.Fts.
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                {/* I accept the area in Kaveri System ends */}

                                                                {/*I accept the area in Property Tax System Starts */}
                                                                <div className="col-md-4 col-lg-4">
                                                                    <div className="form-check">
                                                                        <input className="form-check-input radioStyle" type="radio" />
                                                                        <label>
                                                                            I accept the area in Property Tax System
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4 col-lg-4">
                                                                    <div className="form-check">

                                                                        <label>
                                                                            Area in Sq.Mtrs.
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4 col-lg-4">
                                                                    <div className="form-check">

                                                                        <label>
                                                                            Area in Sq.Fts.
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                {/* I accept the area in Property Tax System ends */}

                                                                {/*I Object to the area in Kaveri & Property Tax Starts */}
                                                                <div className="col-md-4 col-lg-4">
                                                                    <div className="form-check">
                                                                        <input className="form-check-input radioStyle" type="radio" />
                                                                        <label>
                                                                            I Object to the area in Kaveri & Property Tax
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-8 col-lg-8 col-0"></div>
                                                                <div className="col-md-4 col-lg-4 col-12">
                                                                    <div className="form-group">
                                                                        <label className="form-label" style={{color:'red'}}>If you object to the area and enter of your own, then the case will be referred to ARO for approval.</label>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4 col-lg-4 col-12">
                                                                    <div className="form-group">
                                                                        <label className="form-label">Enter Area in Sq.Mtrs.</label>
                                                                        <div className="input-group">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="example-text-input"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4 col-lg-4 col-12">
                                                                    <div className="form-group">
                                                                        <label className="form-label">Enter Area in Sq.Fts.</label>
                                                                        <div className="input-group">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="example-text-input"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* I Object to the area in Kaveri & Property Tax ends */}
                                                                <div className="col-md-4 col-lg-4 mt-2">
                                                                        <div className="form-group">
                                                                            <button type="submit" className="btn btn_color btn-block ">Save & Proceed Next</button>
                                                                        </div>
                                                                    </div>
                                                            </div>
                                                        )}

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2 ends */}

                                {/* Section 3 starts */} <br />
                                <div className="accordion" id="formAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button
                                                className="accordion-button collapsed btn_color"
                                                type="button"
                                                onClick={() => setIsOpen_section3(!isOpen_section3)}
                                            >
                                                Khatadar Details
                                            </button>
                                        </h2>
                                        <div
                                            id="collapseOne"
                                            className={`accordion-collapse collapse ${isOpen_section3 ? "show" : ""}`}
                                            aria-labelledby="headingOne"
                                            data-bs-parent="#formAccordion"
                                        >
                                            <div className="accordion-body">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-12 col-lg-12">
                                                            <div className="form-group">
                                                                <span>Please do AADHAR eKYC of every owner in sale/registration deed or those who inherit the property. If any owner name is missing, add it and do eKYC. Case will goto ARO for approval</span>
                                                            </div>
                                                            <div className="form-group">
                                                                <h5>Khatadar as per register</h5>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-12 col-lg-12 ">
                                                            {/* Table starts */}
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full border-collapse border border-gray-300">
                                                                    <thead>
                                                                        <tr className="bg-gray-200 text-center">
                                                                            <th className="border border-gray-300 px-6 py-3">Sl No</th>
                                                                            <th className="border border-gray-300 px-6 py-3">Khatadar Name</th>
                                                                            <th className="border border-gray-300 px-6 py-3">Name Confirmation/Edit</th>
                                                                            <th className="border border-gray-300 px-6 py-3">Relation Name</th>
                                                                            <th className="border border-gray-300 px-6 py-3">Address</th>
                                                                            <th className="border border-gray-300 px-6 py-3">E-KYC Status</th>
                                                                            <th className="border border-gray-300 px-6 py-3">Khatadar Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr className="text-center">
                                                                            <td className="border border-gray-300 px-6 py-3"></td>
                                                                            <td className="border border-gray-300 px-6 py-3"></td>
                                                                            <td className="border border-gray-300 px-6 py-3"></td>
                                                                            <td className="border border-gray-300 px-6 py-3"></td>
                                                                            <td className="border border-gray-300 px-6 py-3"></td>
                                                                            <td className="border border-gray-300 px-6 py-3"></td>
                                                                            <td className="border border-gray-300 px-6 py-3"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            {/* Table ends */}
                                                        </div>
                                                        <div className="col-md-12 col-lg-12">
                                                            <div className="form-group">
                                                                <span>Note : Do you want to add new owner which is not in BBMP Books Data?</span>
                                                                <span> If new owners are added by using below options, the application will be considered as Mutation and final e-Katha will be given only after 7 days of objection period followed by Mutation approval and fee payment</span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 col-lg-6">
                                                            <div className="form-group">
                                                                <h5>Add New Owner(s)</h5>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-3 col-lg-3'>
                                                            <div className="form-group">
                                                                <div className="custom-controls-stacked">
                                                                    <label className="custom-control custom-radio custom-control-inline">
                                                                        <input type="radio" className="custom-control-input" name="example-inline-radios" value="option1" checked />
                                                                        <span className="custom-control-label">Yes</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-3 col-lg-3'>
                                                            <div className="form-group">
                                                                <div className="custom-controls-stacked">
                                                                    <label className="custom-control custom-radio custom-control-inline">
                                                                        <input type="radio" className="custom-control-input" name="example-inline-radios" value="option2" />
                                                                        <span className="custom-control-label">No</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Section 3 ends */}
                                <br />
                                {/* Section 4 starts */}
                                <div className="accordion" id="formAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button
                                                className="accordion-button collapsed btn_color"
                                                type="button"
                                                onClick={() => setIsOpen_section4(!isOpen_section4)}
                                            >
                                                Location of Property
                                            </button>
                                        </h2>
                                        <div
                                            id="collapseOne"
                                            className={`accordion-collapse collapse ${isOpen_section4 ? "show" : ""}`}
                                            aria-labelledby="headingOne"
                                            data-bs-parent="#formAccordion"
                                        >
                                            <div className="accordion-body">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <b>Search using nearest landmark near your property- once you zoom there then locate your individual property & tap on top middle of your property</b>
                                                            <br /><br />
                                                        </div>
                                                        <div className="col-md-12 col-lg-12 col-sm-12 mb-3">
                                                            <input ref={searchInputRef} className="form-control" type="text" placeholder="Search nearest landmark near your property" />

                                                        </div>
                                                        <div className="col-md-12 col-lg-12 col-sm-12 mb-3">
                                                            <div id="map" ref={mapRef} style={{ height: "500px" }}></div>
                                                        </div>
                                                        <div className="col-md-12 col-lg-12 col-sm-12">
                                                            <div className="row p-3  rounded shadow-sm">
                                                                {/* Result Type */}
                                                                <div className="col-12 mb-2 text-center">
                                                                    <span id="resultType" className="fw-bold text-primary fs-5">{resultType}</span>
                                                                </div>

                                                                {/* Latitude */}
                                                                <div className="col-md-6 col-lg-6 col-sm-12 text-center mb-2">
                                                                    <span className="fw-semibold text-dark">
                                                                        Latitude: <label className="text-success">{latitude}</label>
                                                                    </span>
                                                                </div>

                                                                {/* Longitude */}
                                                                <div className="col-md-6 col-lg-6 col-sm-12 text-center">
                                                                    <span className="fw-semibold text-dark">
                                                                        Longitude: <label className="text-success">{longitude}</label>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Section 4 ends */}
                                <br />
                                {/* Section 5 starts */}
                                <div className="accordion" id="formAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button
                                                className="accordion-button collapsed btn_color"
                                                type="button"
                                                onClick={() => setIsOpen_section5(!isOpen_section5)}
                                            >
                                                Postal Address of Property
                                            </button>
                                        </h2>
                                        <div
                                            id="collapseOne"
                                            className={`accordion-collapse collapse ${isOpen_section5 ? "show" : ""}`}
                                            aria-labelledby="headingOne"
                                            data-bs-parent="#formAccordion"
                                        >
                                            <div className="accordion-body">
                                                <div className="card-body">
                                                    <div className="row">
                                                        {/* Door/Plot no starts */}
                                                        <div className="col-md-4 col-lg-4">
                                                            <div className="form-group">
                                                                <label className="form-label">Door / Plot No. <span style={{ color: 'red' }}>*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* Door/Plot no ends */}
                                                        {/* building / land name starts */}
                                                        <div className="col-md-4 col-lg-4">
                                                            <div className="form-group">
                                                                <label className="form-label">Building / Land Name</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* building / land name ends */}
                                                        {/*  Street/Nearst Street starts */}
                                                        <div className="col-md-4 col-lg-4">
                                                            <div className="form-group">
                                                                <label className="form-label">Select Street/Nearst Street from List of Ward Streets <span style={{ color: 'red' }}>*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/*  Street/Nearst Street ends */}
                                                        {/*  Street/Nearst Street starts */}
                                                        <div className="col-md-4 col-lg-4">
                                                            <div className="form-group">
                                                                <label className="form-label">Street/Nearst Street <span style={{ color: 'red' }}>*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/*  Street/Nearst Street ends */}
                                                        {/*  nearest landmark starts */}
                                                        <div className="col-md-4 col-lg-4">
                                                            <div className="form-group">
                                                                <label className="form-label">Nearst Landmark <span style={{ color: 'red' }}>*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/*  nearest landmark ends */}
                                                        {/*  Area/Locality starts */}
                                                        <div className="col-md-4 col-lg-4">
                                                            <div className="form-group">
                                                                <label className="form-label">Area Locality <span style={{ color: 'red' }}>*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/*   Area/Locality ends */}
                                                        {/*  pincode starts */}
                                                        <div className="col-md-4 col-lg-4">
                                                            <div className="form-group">
                                                                <label className="form-label">Pincode <span style={{ color: 'red' }}>*</span></label>
                                                                <input
                                                                    type="tel"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/*   pincode ends */}
                                                        {/*  Latitude & Longitude starts */}
                                                        <div className="col-md-4 col-lg-4">
                                                            <div className="form-group">
                                                                <label className="form-label">Latitude & Longitude <span style={{ color: 'red' }}>*</span></label>
                                                                <input
                                                                    type="tel"
                                                                    className="form-control"
                                                                    name="example-text-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/*   Latitude & Longitude ends */}
                                                        {/*  Property Image starts */}
                                                        <div className="col-md-4 col-lg-4">
                                                            <div className="form-group">
                                                                <label className="form-label">Property Image <span style={{ color: 'red' }}>*</span><br />
                                                                    <span style={{ color: 'gray' }}> Note: (Click Property Photo from outside with its front elevation visible)</span>
                                                                    <input
                                                                        type="file"
                                                                        className="form-control"
                                                                        name="example-text-input"
                                                                    />
                                                                    <span style={{ color: 'gray' }}>Only JPG, JPEG allowed with a max size of 500KB</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        {/*   Latitude & Longitude ends */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Section 5 ends */}
                                <br />
                                {/* Section 6 starts */}
                                <div className="accordion" id="formAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button
                                                className="accordion-button collapsed btn_color"
                                                type="button"
                                                onClick={() => setIsOpen_section6(!isOpen_section6)}
                                            >
                                                Property Use Details
                                            </button>
                                        </h2>
                                        <div
                                            id="collapseOne"
                                            className={`accordion-collapse collapse ${isOpen_section6 ? "show" : ""}`}
                                            aria-labelledby="headingOne"
                                            data-bs-parent="#formAccordion"
                                        >
                                            <div className="accordion-body">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <h5>Schedule of the Property</h5>
                                                        <div className="col-md-3 col-lg-3">
                                                            <div className="form-group">
                                                                <span className="form-label">East : <span style={{ color: 'red' }}>*</span></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 col-lg-3">
                                                            <div className="form-group">
                                                                <span className="form-label">Wast : <span style={{ color: 'red' }}>*</span></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 col-lg-3">
                                                            <div className="form-group">
                                                                <span className="form-label">North : <span style={{ color: 'red' }}>*</span></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 col-lg-3">
                                                            <div className="form-group">
                                                                <span className="form-label">South : <span style={{ color: 'red' }}>*</span></span>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3 col-lg-3">
                                                            <div className="form-group">
                                                                <input type="text" className="form-control" name="example-text-input" />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 col-lg-3">
                                                            <div className="form-group">
                                                                <input type="text" className="form-control" name="example-text-input" />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 col-lg-3">
                                                            <div className="form-group">
                                                                <input type="text" className="form-control" name="example-text-input" />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 col-lg-3">
                                                            <div className="form-group">
                                                                <input type="text" className="form-control" name="example-text-input" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Section 6 ends */}
                                <br />
                                {/* Section 7 starts */}
                                <div className="accordion" id="formAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button
                                                className="accordion-button collapsed btn_color"
                                                type="button"
                                                onClick={() => setIsOpen_section7(!isOpen_section7)}
                                            >
                                                Names Mismatch reason Details
                                            </button>
                                        </h2>
                                        <div
                                            id="collapseOne"
                                            className={`accordion-collapse collapse ${isOpen_section7 ? "show" : ""}`}
                                            aria-labelledby="headingOne"
                                            data-bs-parent="#formAccordion"
                                        >
                                            <div className="accordion-body">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-6 col-lg-4">

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Section 7 ends */}
                                <br />
                                {/* Section 8 starts */}
                                <div className="accordion" id="formAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button
                                                className="accordion-button collapsed btn_color"
                                                type="button"
                                                onClick={() => setIsOpen_section8(!isOpen_section8)}
                                            >

                                            </button>
                                        </h2>
                                        <div
                                            id="collapseOne"
                                            className={`accordion-collapse collapse ${isOpen_section8 ? "show" : ""}`}
                                            aria-labelledby="headingOne"
                                            data-bs-parent="#formAccordion"
                                        >
                                            <div className="accordion-body">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-12 col-lg-12">
                                                            <div className="form-group">
                                                                <p>{t('translation.section8.title1')}</p>
                                                                <p>{t('translation.section8.title2')}</p>
                                                                <p>{t('translation.section8.title3')}</p>
                                                            </div>
                                                        </div>
                                                        <div className='col-md-3 col-lg-3'>
                                                        <div className="form-check">
                                                                <input className="form-check-input radioStyle" type="radio" value="option1" />
                                                                <label className="form-check-label">
                                                                {t('translation.section8.radio_yes')}
                                                                </label>
                                                            </div>
                                                            </div>
                                                            <div className='col-md-3 col-lg-3'>
                                                            <div className="form-check">
                                                                <input className="form-check-input radioStyle" type="radio" value="option2" />
                                                                <label className="form-check-label">
                                                                {t('translation.section8.radio_no')}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Section 8 ends */}
                                <br />
                                {/* Section 9 starts */}
                                <div className="accordion" id="formAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingOne">
                                            <button
                                                className="accordion-button collapsed btn_color"
                                                type="button"
                                                onClick={() => setIsOpen_section9(!isOpen_section9)}
                                            >
                                                Declaration
                                            </button>
                                        </h2>
                                        <div
                                            id="collapseOne"
                                            className={`accordion-collapse collapse ${isOpen_section9 ? "show" : ""}`}
                                            aria-labelledby="headingOne"
                                            data-bs-parent="#formAccordion"
                                        >
                                            <div className="accordion-body">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-12 col-lg-12">
                                                            <div className="form-group">
                                                                <div className="custom-controls-stacked">
                                                                    <label className="custom-control custom-checkbox">
                                                                        <input type="checkbox" className="custom-control-input" name="example-checkbox1" value="option1" />
                                                                        <span className="custom-control-label">{t('translation.declaration.first_checkbox')} </span><br />
                                                                        <p>{t('translation.declaration.first_title')}</p>
                                                                        <p>{t('translation.declaration.second_title')}</p>
                                                                        <p>{t('translation.declaration.third_title')}</p>
                                                                        <p>{t('translation.declaration.fourth_title')}</p>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div className="form-group">
                                                                <div className="custom-controls-stacked">
                                                                    <label className="custom-control custom-checkbox">
                                                                        <input type="checkbox" className="custom-control-input" name="example-checkbox1" value="option2" />
                                                                        <span className="custom-control-label">{t('translation.declaration.second_checkbox')}</span><br />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 col-lg-3">
                                                            <div className="form-group">
                                                                <button type="submit" className="btn btn_color btn-block ">Verify Your Data</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Section 9 ends */}
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default BBMP_TaxDetails;



