
// //Release Dashboard
// import React, { useState, useEffect, useRef } from 'react';
// import DashboardLayout from '../../Layout/DashboardLayout';
// import Loader from "../../Layout/Loader";
// import DataTable from 'react-data-table-component';
// import '../../Styles/CSS/ReleaseSiteSelection.css';
// import Swal from "sweetalert2";
// import { useLocation, Link, useNavigate } from 'react-router-dom';
// import { useTranslation } from "react-i18next";
// import config from '../../Config/config';
// import {
//     fetch_LKRSID, fetch_releasePercentageDetails, individualSiteListAPI, final_Release_Sites, listApprovalInfo, fileUploadAPI, listReleaseInfo, fileListAPI, insertReleaseInfo,
//     deleteReleaseInfo, ownerEKYC_Details, ekyc_Details, ekyc_Response
// } from '../../API/authService';



// export const useLoader = () => {
//     const [loading, setLoading] = useState(false);

//     const start_loader = () => setLoading(true);
//     const stop_loader = () => setLoading(false);

//     return { loading, start_loader, stop_loader };
// };

// const ReleaseDashboard = () => {
//     const navigate = useNavigate();
//     const { t, i18n } = useTranslation();
//     const { loading, start_loader, stop_loader } = useLoader();
//     const [lkrsTableData, setLkrsTableData] = useState({
//         lkrS_DISPLAYID: '',
//         lkrS_EPID: '',
//         lkrS_SITEAREA_SQFT: '',
//         lkrS_SITEAREA_SQMT: '',
//         lkrS_ECNUMBER: '',
//     });
//     const [approvalTableData, setApprovalTableData] = useState({
//         approvalOrderNo: '',
//         releaseType: '',
//         totalNoOfSites: '',
//     });

//     //Redirecting back to dashboard method
//     const handleBackToDashboard = (e) => {
//         e.preventDefault(); // Prevents the default anchor tag behavior
//         navigate("/LayoutDashboard");
//     };
//     //LKRSID or EPID input field method
//     const handleInputChange = (e) => {
//         let value = e.target.value;

//         if (value.startsWith('l')) {
//             value = 'L' + value.slice(1);
//         }
//         if (/^(L\d{0,9}|\d{0,10})$/.test(value)) {
//             setLocalLKRSID(value);
//         }
//     };
//     //Fetch LKRSID or EPID button
//     const handleSearchClick = (localLKRSID) => {
//         if (!localLKRSID) {
//             alert('Please enter EPID or KRSID');
//             return;
//         }

//         // Remove leading 'L' or 'l' if present
//         let trimmedLKRSID = localLKRSID;
//         if (/^L\d+$/i.test(localLKRSID)) {
//             trimmedLKRSID = localLKRSID.substring(1);
//         }
//         handleGetLKRSID(trimmedLKRSID);
//         fetchReleaseList(trimmedLKRSID);
//         fetch_releasePercentage(trimmedLKRSID);
//         fetchFinalReleasedSites(trimmedLKRSID);
//     };

//     //fetch LKRSID method 
//     const handleGetLKRSID = async (localLKRSID) => {
//         const payload = {
//             level: 1,
//             LkrsId: localLKRSID,
//         };
//         try {
//             start_loader();
//             setRtcAddedData([]);          // Clear survey data table
//             setOwnerTableData([]);        // Clear khata owner table
//             setEPID_FetchedData(null);    // Clear EPID fetched data
//             setEPIDShowTable(false);      // Hide khata table until data comes
//             setLkrsTableData({});         // Clear LKRS table data
//             setSelectedLandType('');
//             const response = await fetch_LKRSID(localLKRSID);


//             if (response && response.surveyNumberDetails && response.surveyNumberDetails.length > 0) {
//                 setLkrsTableData({
//                     lkrS_DISPLAYID: response.lkrS_DISPLAYID || '',
//                     lkrS_EPID: response.lkrS_EPID || '',
//                     lkrS_SITEAREA_SQFT: response.lkrS_SITEAREA_SQFT || '',
//                     lkrS_SITEAREA_SQMT: response.lkrS_SITEAREA_SQMT || '',
//                     lkrS_ECNUMBER: response.lkrS_ECNUMBER || ''
//                 });
//                 await Fetch_Approval_percentage(response.lkrS_ID);
//                 setSelectedLandType(response.lkrS_LANDTYPE); //  Store the land type

//                 await fetchApprovalListAndSetTable(localLKRSID);

//                 const parsedSurveyDetails = mapSurveyDetails(response.surveyNumberDetails);

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

//                 stop_loader();
//             } else if (response && response.khataDetails && response.khataOwnerDetails && response.khataOwnerDetails.length > 0) {
//                 setLkrsTableData({
//                     lkrS_DISPLAYID: response.lkrS_DISPLAYID || '',
//                     lkrS_EPID: response.lkrS_EPID || '',
//                     lkrS_SITEAREA_SQFT: response.lkrS_SITEAREA_SQFT || '',
//                     lkrS_SITEAREA_SQMT: response.lkrS_SITEAREA_SQMT || '',
//                     lkrS_ECNUMBER: response.lkrS_ECNUMBER || ''
//                 });
//                 await Fetch_Approval_percentage(response.lkrS_ID);
//                 setSelectedLandType(response.lkrS_LANDTYPE); //  Store the land type
//                 await fetchApprovalListAndSetTable(localLKRSID);
//                 setEPIDShowTable(true);
//                 let khataDetailsJson = {};
//                 if (response.khataDetails?.khatA_JSON) {
//                     try {
//                         khataDetailsJson = JSON.parse(response.khataDetails.khatA_JSON);
//                     } catch (err) {
//                         console.warn("Failed to parse khatA_JSON", err);
//                     }
//                 }

//                 setEPID_FetchedData({
//                     PropertyID: response.lkrS_EPID || '',
//                     PropertyCategory: khataDetailsJson.propertyCategory || '',
//                     PropertyClassification: khataDetailsJson.propertyClassification || '',
//                     WardNumber: khataDetailsJson.wardNumber || '',
//                     WardName: khataDetailsJson.wardName || '',
//                     StreetName: khataDetailsJson.streetName || '',
//                     Streetcode: khataDetailsJson.streetcode || '',
//                     SASApplicationNumber: khataDetailsJson.sasApplicationNumber || '',
//                     IsMuation: khataDetailsJson.isMuation || '',
//                     KaveriRegistrationNumber: khataDetailsJson.kaveriRegistrationNumber || [],
//                     AssessmentNumber: khataDetailsJson.assessmentNumber || '',
//                     courtStay: khataDetailsJson.courtStay || '',
//                     enquiryDispute: khataDetailsJson.enquiryDispute || '',
//                     CheckBandi: khataDetailsJson.checkBandi || {},
//                     SiteDetails: khataDetailsJson.siteDetails || {},
//                     OwnerDetails: khataDetailsJson.ownerDetails || [],
//                     // Optionally add raw API response too if needed
//                     rawResponse: response,
//                 });

//                 // Optionally update area sqft if siteDetails present
//                 if (khataDetailsJson.siteDetails?.siteArea) {
//                     setAreaSqft(khataDetailsJson.siteDetails.siteArea);
//                     sessionStorage.setItem('areaSqft', khataDetailsJson.siteDetails.siteArea);
//                 } else {
//                     setAreaSqft(0);
//                     sessionStorage.removeItem('areaSqft');
//                 }

//                 setOwnerTableData(khataDetailsJson.ownerDetails || []);

//                 stop_loader();
//             } else {
//                 stop_loader();
//                 Swal.fire({
//                     text: "No survey details found.",
//                     icon: "warning",
//                     confirmButtonText: "OK",
//                 });
//             }
//         } catch (error) {
//             stop_loader();
//             console.error("Failed to fetch LKRSID data:", error);
//         }
//     };

//     return (

//         <DashboardLayout>
//             <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
//                 {loading && <Loader />}
//                 <div className="my-3 my-md-5">
//                     <div className="container mt-5">
//                         <div className="card">
//                             <div className="card-header layout_btn_color">
//                                 <h5 className="card-title" style={{ textAlign: 'center' }}>Release Dashboard</h5>
//                             </div>
//                             <div className="card-body">
//                                 <Link
//                                     onClick={handleBackToDashboard}
//                                     style={{ textDecoration: 'none', color: '#006879', display: 'flex', alignItems: 'center' }}
//                                 >
//                                     <i className='fa fa-arrow-left' style={{ marginRight: '8px' }}></i>
//                                     Back to Dashboard
//                                 </Link>
//                                 <div className="row">
//                                     <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-2'>
//                                         <div className="form-group">
//                                             <label className='form-label'>Enter the EPID or KRSID to fetch details <span className='mandatory_color'>*</span></label>
//                                             <input
//                                                 type="text"
//                                                 className="form-control"
//                                                 placeholder="Enter the EPID or KRSID"
//                                                 maxLength={10}
//                                                 value={localLKRSID}
//                                                 onChange={handleInputChange}
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2  mt-2'>
//                                         <div className="form-group">
//                                             <label className='form-label'>&nbsp;</label>
//                                             <button className='btn btn-primary btn-block' onClick={() => handleSearchClick(localLKRSID)}>
//                                                 Search
//                                             </button>
//                                         </div>
//                                     </div>
//                                     <div className="form-group mt-2" hidden>
//                                         <label className="form-label">Select Dimension</label>
//                                         <select className="form-control" value={selectedValue} onChange={handleDimensionChange}>
//                                             <option value="">-- Select Dimension --</option>
//                                             <option value="100">100%</option>
//                                             <option value="60*40">60 * 40</option>
//                                             <option value="40*30*30">40 * 30 * 30</option>
//                                         </select>
//                                     </div>

//                                 </div>
//                                 {/* property details table */}
//                                 {(lkrsTableData.lkrS_DISPLAYID && approvalTableData.approvalOrderNo) && (
//                                     <>
//                                         <h5>Property Details</h5>
//                                         <table style={{ borderCollapse: 'collapse', width: '100%' }}>
//                                             <tbody>
//                                                 <tr>
//                                                     <th style={thStyle}>KRS ID</th>
//                                                     <td style={tdStyle}>{lkrsTableData.lkrS_DISPLAYID}</td>
//                                                     <th style={thStyle}>Mother EPID</th>
//                                                     <td style={tdStyle}>{lkrsTableData.lkrS_EPID}</td>
//                                                 </tr>
//                                                 <tr>
//                                                     <th style={thStyle}>Total Number of Sites</th>
//                                                     <td style={tdStyle}> {approvalTableData.totalNoOfSites}</td>
//                                                     <th style={thStyle}>Total Extent</th>
//                                                     <td style={tdStyle}>{lkrsTableData.lkrS_SITEAREA_SQFT} [SQFT] , {lkrsTableData.lkrS_SITEAREA_SQMT} [SQM]</td>
//                                                 </tr>
//                                                 <tr>
//                                                     <th style={thStyle}>DC Conversion</th>
//                                                     <td style={tdStyle}>N/A</td>
//                                                     <th style={thStyle}>Approval Order Number</th>
//                                                     <td style={tdStyle}>{approvalTableData.approvalOrderNo || 'N/A'}</td>
//                                                 </tr>
//                                                 <tr>
//                                                     <th style={thStyle}>Release Type</th>
//                                                     <td style={tdStyle}>{approvalTableData.releaseType || 'N/A'}</td>
//                                                     <th style={thStyle}>EC Number</th>
//                                                     <td style={tdStyle}>{lkrsTableData.lkrS_ECNUMBER || 'N/A'}</td>
//                                                 </tr>
//                                             </tbody>
//                                         </table>
//                                     </>
//                                 )}
//                             </div>
//                         </div>

//                     </div>
//                 </div>
//             </div>
//         </DashboardLayout>

//     );

// }

// const thStyle = {
//     padding: "10px",
//     border: "1px solid #ccc",
//     fontWeight: "600",
//     fontSize: "14px"
// };

// const tdStyle = {
//     padding: "10px",
//     border: "1px solid #ccc",
//     fontSize: "14px",
//     color: "#333"
// };

// export default ReleaseDashboard;