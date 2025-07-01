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
import { dc_insertDetails, dcConversionListAPI, fileListAPI, fileUploadAPI, deleteDCconversionInfo } from '../../API/authService';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};


const DCConversion = ({ LKRS_ID, isRTCSectionSaved, isEPIDSectionSaved, }) => {
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
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
            delay(1000);
            fetch_DCConversion(LKRS_ID);
        } else {
            // fallback to localStorage if needed
            const id = localStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
            delay(1000);
            fetch_DCConversion(id);
        }
    }, [LKRS_ID]);
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
                setRecords(formattedList);
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
         if (!isRTCSectionSaved && !isEPIDSectionSaved) {
                    Swal.fire("Please save the land details before proceeding with layout approval", "", "warning");
                    return;
                }

        const newErrors = {};

        // Validation for DC Number
        if (!dcNumber.trim()) {
            newErrors.dcNumber = "DC Conversion Order Number is required.";
        }

        // Validation for DC Date
        if (!dcDate) {
            newErrors.dcDate = "DC Conversion Order Date is required.";
        } else if (new Date(dcDate) > new Date()) {
            newErrors.dcDate = "Date cannot be in the future.";
        }

        // Validation for File Upload
        if (!uploadDCFile) {
            newErrors.file = "Please upload the conversion order PDF.";
        } else if (uploadDCFile.type !== "application/pdf") {
            newErrors.file = "Only PDF files are allowed.";
        } else if (uploadDCFile.size > 5 * 1024 * 1024) {
            newErrors.file = "File size must be less than 5MB.";
        }

        // Set error state
        setErrors(newErrors);

        // If any errors, do not proceed
        if (Object.keys(newErrors).length > 0) {
            return; // Stop execution
        }

        // ✅ All validations passed — Now call your API
        try {
            const payload = {
                dC_id: 0,
                dC_LKRS_Id: localLKRSID,
                dC_Conversion_No: dcNumber,
                dC_Conversion_Date: dcDate,
                dC_Remarks: "",
                dC_AdditionalInfo: "",
                dC_CreatedBy: createdBy,
                dC_CreatedName: createdName,
                dC_CreatedRole: roleID

            };

            // Example: calling your API function
            const response = await dc_insertDetails(payload);

            if (response.responseStatus === true) {

                const dcconversionfile_upload = await file_UploadAPI(
                    5, // master document ID 
                    dcNumber,
                    dcFile,
                    dcDate,
                    response.dC_id,
                    "DC conversion"
                );

                if (dcconversionfile_upload) {
                    start_loader();
                    try {
                        const listPayload = {
                            lkrsId: localLKRSID,
                            Dc_Id: response.dC_id,
                        };

                        const listResponse = await dcConversionListAPI(localLKRSID, response.dC_id);
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
                            setRecords(formattedList);
                        }
                        stop_loader();
                    } catch (error) {
                        stop_loader();
                        console.error("Error fetching DC conversion list:", error);
                    } finally {
                        stop_loader();
                    }

                    Swal.fire({
                        title: response.responseMessage,
                        icon: "success",
                        confirmButtonText: "OK",
                    });

                    // Reset form
                    if (fileDCInputRef.current) {
                        fileDCInputRef.current.value = ""; // clear file input field
                    }
                    if (fileDCFileRef.current) fileDCFileRef.current.value = "";
                    setDcNumber("");                   // clear order number
                    setDCdate("");                     // clear date
                    setUploadDCFile(null);            // clear file
                    setUploadedDCFileURL(null);       // clear preview
                    setErrors(prev => ({
                        ...prev,
                        dcNumber: '',
                        dcDate: '',
                        dcFile: ''
                    }));
                }
            } else {
                Swal.fire({
                    title: response.responseMessage,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }

        } catch (error) {
            console.error("API Error:", error);
            alert("Failed to save DC details. Please try again.");
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
            width: '150px',
        },
        {
            name: `Uploaded DC Conversion File`,
            cell: row => {
                if (row.DCFile) {
                    const blob = base64ToBlob(row.DCFile);

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
                        dC_DOCUMENT_ID: DCconversionDocID
                    };

                    const response = await deleteDCconversionInfo(deletePayload);

                    if (response.responseStatus === true) {
                        await fetch_DCConversion(localLKRSID);
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
        <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
            {loading && <Loader />}
            <div className="card">
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
                        <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ' hidden>
                            <div className="form-group">
                                <label className="form-label">&nbsp;
                                </label>
                                <button className="btn btn-primary btn-block" disabled={isDCSectionDisabled}>Fetch</button>
                            </div>
                        </div>
                        {/* DC conversion Date */}
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
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
                        <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
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
                        <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2'>
                            <div className="form-group">
                                <button className="btn btn-success btn-block" onClick={() => handleDCSave(dcNumber, dcDate, uploadDCFile)}>
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
        </div>
    );
}

export default DCConversion;
