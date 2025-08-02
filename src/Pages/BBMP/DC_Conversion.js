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
import { useTable, usePagination } from "react-table";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { toast, Toaster } from 'react-hot-toast';

import apiService from '../../API/apiService';
import { dc_insertDetails, dcConversionListAPI, fileListAPI, fileUploadAPI, deleteDCconversionInfo, bhommiDCConversionFetchAPI, fetch_LKRSID } from '../../API/authService';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};


const DCConversion = ({ LKRS_ID, isRTCSectionSaved, isEPIDSectionSaved, setIsDCSectionSaved }) => {
    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
    const [dcNumber, setDcNumber] = useState("");
    const [dcDate, setDCdate] = useState('');
    const [uploadDCFile, setUploadDCFile] = useState(null);
    const [uploadedDCFileURL, setUploadedDCFileURL] = useState(null);
    const [errors, setErrors] = useState({
        dcNumber: '',
        dcDate: '',
        uploadDCFile: ''
    });
    const [createdBy, setCreatedBy] = useState(sessionStorage.getItem('PhoneNumber'));
    const [createdName, setCreatedName] = useState('');
    const [roleID, setRoleID] = useState('');
    useEffect(() => {
        const storedCreatedBy = sessionStorage.getItem('createdBy');
        const storedCreatedName = sessionStorage.getItem('createdName');
        const storedRoleID = sessionStorage.getItem('RoleID');

        setCreatedBy(storedCreatedBy);
        setCreatedName(storedCreatedName);
        setRoleID(storedRoleID);

    }, []);
    const [localLKRSID, setLocalLKRSID] = useState("");
    const buttonRef = useRef(null);

    useEffect(() => {

        if (buttonRef.current) {
            buttonRef.current.click();
        }
    }, [LKRS_ID]);





    const fetch_details = async () => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
            delay(1000);
            fetch_DCConversion(LKRS_ID);
            handleGetLKRSID(LKRS_ID);
        } else {
            // fallback to sessionStorage if needed
            const id = sessionStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
            delay(1000);
            fetch_DCConversion(id);
            handleGetLKRSID(id);
        }
    }



    const handleGetLKRSID = async (localLKRSID) => {
        const payload = {
            level: 1,
            LkrsId: localLKRSID,
        };
        try {
            const response = await fetch_LKRSID(localLKRSID);

            if (response && response.surveyNumberDetails && response.surveyNumberDetails.length > 0) {
                // const parsedSurveyDetails = mapSurveyDetails(response.surveyNumberDetails);

                // ✅ Combine suR_SURVEYNO/suR_SURNOC/suR_HISSA
                const surveySet = new Set();
                response.surveyNumberDetails.forEach(detail => {
                    const combined = `${detail.suR_SURVEYNO}/${detail.suR_SURNOC}/${detail.suR_HISSA}`;
                    surveySet.add(combined);
                });

                // ✅ Convert to array and log
                const uniqueSurveyNumbers = Array.from(surveySet);
                console.log("Unique Survey Numbers:", uniqueSurveyNumbers);

                // ✅ Set RTC data without duplicate owners
                // setRtcAddedData(prev => {
                //     const existingKeys = new Set(
                //         prev.map(item => `${item.surveyNumber}_${item.ownerName}`)
                //     );

                //     const filteredNewData = parsedSurveyDetails.filter(item => {
                //         const key = `${item.surveyNumber}_${item.ownerName}`;
                //         return !existingKeys.has(key);
                //     });

                //     return [...prev, ...filteredNewData];
                // });
            }

        } catch (error) {
            stop_loader();
            console.error("Failed to fetch LKRSID data:", error);
        }
    };




    const [records, setRecords] = useState([]);
    const [isDCSectionDisabled, setIsDCSectionDisabled] = useState(false);
    const fileDCInputRef = useRef(null);
    const fileDCFileRef = useRef(null);
    const handleDCNumberChange = (e) => {
        setDcNumber(e.target.value);
        setErrors(prev => ({ ...prev, dcNumber: '' }));
    };
    const handleDCOrderDateChange = (e) => {
        const selectedDate = e.target.value;
        const today = new Date().toISOString().split("T")[0];

        setDCdate(selectedDate);

        if (selectedDate > today) {
            setErrors(prev => ({ ...prev, dcOrderDate: "Future date is not allowed" }));
        } else {
            setErrors(prev => ({ ...prev, dcOrderDate: "" }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            if (file.size > 5000 * 1024) {  // 300KB size limit
                setErrors(prev => ({ ...prev, file: 'File size should be less than 5MB.' }));
                setUploadDCFile(null);
                setUploadedDCFileURL(null);
                return;
            }

            setUploadDCFile(file);
            setUploadedDCFileURL(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, file: '' }));
        }
    };
    //Bhoomi DC conversion Fetch details
    const bhommiDCConversion = async (affidavitID) => {

        if (!isRTCSectionSaved && !isEPIDSectionSaved) {
            Swal.fire("Please save the land details before proceeding with layout approval", "", "warning");
            return;
        }

        const newErrors = {};

        const trimmedDCNumber = dcNumber.trim();
        const dcNumberPattern = /^[A-Za-z1-9][A-Za-z0-9/-]*$/;

        //  DC Number Validation
        if (!trimmedDCNumber) {
            newErrors.dcNumber = "DC Conversion Order Number is required.";
        } else if (!dcNumberPattern.test(trimmedDCNumber)) {
            newErrors.dcNumber = "Only alphanumeric characters, '/', and '-' allowed. No spaces or leading zeros.";
        } else if (
            records.some(
                (item) =>
                    item.layoutDCNumber?.toLowerCase() === trimmedDCNumber.toLowerCase()
            )
        ) {
            Swal.fire({
                title: "Duplicate Entry",
                text: "Duplicate DC Conversion Order Number is not allowed.",
                icon: "warning",
                confirmButtonText: "OK",
            });
            return;
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        //  All validations passed — Now call your API
        const formatDateForAPI = (dateStr) => {
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month}-${day}T00:00:00`;
        };


        try {
            start_loader();
            const response = await bhommiDCConversionFetchAPI(affidavitID, localLKRSID);

            if (response.responsE_CODE === "200" && response.isvalidSurveyNo === true) {
                console.log(response);
                const requestDetails = response.requesT_DETAILS[0];
                const DCJSON = JSON.stringify(response);

                try {
                    const payload = {
                        dC_id: 0,
                        dC_LKRS_Id: localLKRSID,
                        dC_Conversion_No: String(requestDetails.reQ_AID),
                        dC_Conversion_Date: formatDateForAPI(requestDetails.reQ_CDTE),
                        dC_Remarks: "",
                        dC_AdditionalInfo: "",
                        dC_CreatedBy: createdBy,
                        dC_CreatedName: createdName,
                        dC_CreatedRole: roleID,
                        dC_JSON: DCJSON,
                        dC_SurveyNo: requestDetails.surveyno,

                    };

                    // Example: calling your API function
                    const responseDC = await dc_insertDetails(payload);

                    if (responseDC.responseStatus === true) {

                        start_loader();
                        try {
                            const listPayload = {
                                lkrsId: localLKRSID,
                                Dc_Id: responseDC.dC_id,
                            };

                            const listResponse = await dcConversionListAPI(localLKRSID, responseDC.dC_id);
                            console.table(listResponse);



                            if (Array.isArray(listResponse)) {
                                const formattedList = listResponse.map((item, index) => ({
                                    layoutDCNumber: item.dC_Conversion_No,
                                    dateOfOrder: item.dC_Conversion_Date,
                                    surveyno: item.dC_SurveyNo,
                                    dc_id: item.dC_id,

                                }));
                                setRecords(formattedList);
                                setIsDCSectionSaved(true);
                            }
                            stop_loader();
                        } catch (error) {
                            stop_loader();
                            console.error("Error fetching DC conversion list:", error);
                        } finally {
                            stop_loader();
                        }


                    } else {
                        Swal.fire({
                            title: "Something Went wrong, Please try again later!",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    }
                    stop_loader();
                } catch (error) {
                    console.error("API Error:", error);
                    alert("Failed to save DC details. Please try again.");

                } finally { stop_loader(); }

            } else if (response.responsE_CODE === "200" && response.isvalidSurveyNo === false) {
                Swal.fire({
                    title: response.responsE_MESSAGE,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
            else {
                Swal.fire({
                    title: response.responsE_MESSAGE,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }

        } catch (error) {
            console.error("API Error:", error);
            Swal.fire({
                title: "Something went wrong, Please try again later!",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            stop_loader();

        }
    };

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
                    surveyno: item.dC_SurveyNo,
                    DCFile: listFileResponse[index]?.doctrN_DOCBASE64 || null,
                    dc_id: item.dC_id,
                    DCconversionDocID: listFileResponse[index]?.doctrN_ID || null,

                }));
                setRecords(formattedList);
                setIsDCSectionSaved(true);
            }else{
                setIsDCSectionSaved(false);
            }
            stop_loader();
        } catch (error) {
            stop_loader();
            console.error("Error fetching DC conversion list:", error);
        } finally {
            stop_loader();
        }
    }
    //DC conversion insert
    const handleDCSave = async (dcNumber, dcDate, dcFile) => {


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
    const customStyles = {
        headCells: {
            style: {
                backgroundColor: '#f0f0f0', // Light grey background
                color: '#333',              // Dark grey text
                fontWeight: 'bold',         // Bold text
            },
        },
    };

    const columns = [
        {
            name: 'S.no',
            cell: (row, index) => index + 1,
            width: '80px',
            center: true,
        },
        {
            name: "Survey Number",
            selector: row => row.surveyno,
            sortable: true,
            center: true,
        },
        {
            name: "DC Conversion Number",
            selector: row => row.layoutDCNumber,
            sortable: true,
            center: true,
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
        {
            name: "Action",
            cell: (row, index) => (
                <div>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                            handleDeleteDC(
                                row.dc_id,
                                row.DCconversionDocID
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
    //DC conversion Delete API
    const handleDeleteDC = async (dcID, DCconversionDocID) => {
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
                        dC_id: dcID,
                        dC_Remarks: "",
                        dC_AdditionalInfo: "",
                        dC_UpdatedBy: createdBy,
                        dC_UpdatedName: createdName,
                        dC_UpdatedRole: roleID,
                        dC_DOCUMENT_ID: 0
                    };

                    const response = await deleteDCconversionInfo(deletePayload);

                    if (response.responseStatus === true) {
                        await fetch_DCConversion(localLKRSID);
                        setIsDCSectionSaved(false);
                        Swal.fire(response.responseMessage, "", "success");
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
    }

    return (
        // <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
        //     {loading && <Loader />}
        <div className="card">
            <button className='btn btn-block' onClick={fetch_details} ref={buttonRef} hidden>Click me</button>
            {/* <button className='btn btn-block' onClick={loadData} ref={buttonRef} hidden></button> */}
            <div className="card-header layout_btn_color" >
                <h5 className="card-title" style={{ textAlign: 'center' }}>DC Conversion</h5>
            </div>
            <div className="card-body">

                <div className='row'>
                    {/* Layout DC Conversion order No */}
                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                        <div className="form-group">
                            <label className="form-label">
                                Enter DC Conversion Order Number <span className="mandatory_color">*</span>
                            </label>
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="Enter DC Conversion Order Number"
                                name="layoutApprovalNumber"
                                value={dcNumber} ref={fileDCInputRef}
                                onChange={handleDCNumberChange}
                                max={new Date().toISOString().split("T")[0]} // Prevent future date
                                disabled={isDCSectionDisabled}
                            />
                            {errors.dcNumber && (
                                <span className="text-danger" style={{ fontSize: '0.875rem' }}>{errors.dcNumber}</span>
                            )}
                        </div>
                    </div>
                    <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ' >
                        <div className="form-group">
                            <label className="form-label">&nbsp;
                            </label>
                            <button className="btn btn-primary btn-block" disabled={isDCSectionDisabled} onClick={() => bhommiDCConversion(dcNumber)}>Fetch</button>
                        </div>
                    </div>
                    {/* DC conversion Date */}
                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" hidden>
                        <div className="form-group">
                            <label className="form-label">
                                Enter DC Conversion Date <span className="mandatory_color">*</span>
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                name="dcOrderDate"
                                value={dcDate}
                                onChange={handleDCOrderDateChange}
                                max={new Date().toISOString().split("T")[0]} // Prevent future date
                                disabled={isDCSectionDisabled}
                            />
                            {errors.dcDate && (
                                <span className="text-danger" style={{ fontSize: '0.875rem' }}>{errors.dcDate}</span>
                            )}
                        </div>
                    </div>
                    {/* Scan & Upload Layout DC Conversion order */}
                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4" hidden>
                        <div className="form-group">
                            <label className="form-label">Upload Conversion order  <span className="mandatory_color">*</span></label>
                            <input
                                type="file"
                                accept=".pdf"
                                className="form-control"
                                onChange={handleFileChange}
                                disabled={isDCSectionDisabled}
                                ref={fileDCFileRef}
                            />
                            {errors.file && (
                                <span className="text-danger" style={{ fontSize: '0.875rem' }}>{errors.file}</span>
                            )}

                            {uploadDCFile && uploadedDCFileURL && (
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
                                            src={uploadedDCFileURL}
                                            width="100%"
                                            height="100%"
                                            title="Conversion Order"
                                            onClick={() => window.open(uploadedDCFileURL, "_blank")}
                                            style={{ cursor: "pointer", border: "none" }}
                                        />
                                    </div>
                                    <p className="mt-1" style={{ fontSize: "0.875rem" }}>
                                        Current File:{" "}
                                        <a
                                            href={uploadedDCFileURL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                textDecoration: "underline",
                                                color: "#007bff",
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            {uploadDCFile.name}
                                        </a>
                                    </p>
                                </div>
                            )}

                            <span className="note_color">
                                [ Only PDF files are allowed, file size must be less than 5MB ]
                            </span>
                        </div>
                    </div>
                    <div className='col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10'></div>
                    {/* Save and continue button */}
                    <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2' hidden>
                        <div className="form-group">
                            <button className="btn btn-success btn-block" onClick={() => bhommiDCConversion(dcNumber)}>
                                Save and continue
                            </button>
                        </div>
                    </div>
                </div>
                {records.length > 0 && (
                    <div className="mt-4">
                        <h4>DC Conversion Details</h4>
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
        // </div>
    );
}

export default DCConversion;
