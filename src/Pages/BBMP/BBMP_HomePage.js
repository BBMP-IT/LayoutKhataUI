import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HomePageLayout from '../../Layout/HomePageLayout';
import Loader from '../../Layout/Loader';
import config from '../../Config/config';
import { useTranslation } from "react-i18next";


// const BBMP_Home = () => {
//     const [loading, setLoading] = useState(false);

//     const cardData = [
//         { iconClass: "fas fa-sign-in-alt", title: "Login", link: "https://testlayoutkhata.bbmpgov.in/Login" },
//         { iconClass: "fas fa-file-alt", title: "Get e-Khatha", link: "#" },
//         { iconClass: "fas fa-wallet", title: "Property Tax", link: "https://bbmptax.karnataka.gov.in/" },
//         { iconClass: "fas fa-columns", title: "Layout Khata Dashboard", link: "https://testlayoutkhata.bbmpgov.in/" },
//         { iconClass: "fas fa-object-group", title: "Amalgamation", link: "#" },
//         { iconClass: "fas fa-map", title: "Draft e-Khata( if you know your Ward)", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/" },
//         { iconClass: "fas fa-map-marked-alt", title: "Draft eKhatha (if you don't know your Ward)", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/GoogleMapsWardCoordinates" },
//         { iconClass: "fas fa-search-location", title: "Do not find my Property Draft eKhata", link: "#" },
//         { iconClass: "fas fa-list-ul", title: "Ward List - East", link: "https://bbmpeaasthi.karnataka.gov.in/frmBangalore1CentersbyZone.aspx?zone=East" },
//         { iconClass: "fas fa-file-alt", title: "Final eKhatha status based on ePID", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/Final_eKhatha_Status_based_on_ePID" },
//         { iconClass: "fas fa-comment-dots", title: "File Objections On Final eKhata", link: "#" },
//         { iconClass: "fas fa-file-signature", title: "New eKhatha status based on ePID", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/NewEkhataStatus" },
//         // { iconClass: "fas fa-info-circle", title: "Submitted Property Status", link: "https://bbmpeaasthi.karnataka.gov.in/forms/CitzApplicationStatus.aspx" },
//         // { iconClass: "fas fa-tasks", title: "Pending Applications", link: "https://bbmpeaasthi.karnataka.gov.in/forms/CitzPendingApplicationBBMP.aspx" },
//         { iconClass: "fas fa-hourglass-half", title: "Pending Mutations", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/PendingMutationReport" },
//         { iconClass: "fas fa-check-circle", title: "Sample FORM A / B Verification", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2Verify.aspx" },
//         { iconClass: "fas fa-eye", title: "Sample FORM A / B View", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2View.aspx?formid=menu" },
//         { iconClass: "fas fa-download", title: "Online Format A / B (Online Khata) Download", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmKhathaDownload.aspx" },
//         { iconClass: "fas fa-book", title: "Scanned Property Tax Registers of BBMP", link: "#" },
//         // { iconClass: "fas fa-search", title: "Search for assets", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchProperties.aspx" },
//         { iconClass: "fas fa-check-square", title: "Verify Whether the Property can be Registered", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchKaveriProperties.aspx" },
//         { iconClass: "fas fa-home", title: "Search the Property by Name", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmPropertySearchByName.aspx" },
//         { iconClass: "fas fa-map", title: "Search for Properties Found in Kaveri", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchKaveriProp.aspx" },
//         // { iconClass: "fas fa-inr", title: "Pay Administrative Fee (2% fee) Online", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmOnlinePayUrl.aspx" },
//         // { iconClass: "fas fa-thumbs-up", title: "Approved Properties", link: "https://bbmpeaasthi.karnataka.gov.in/office/FrmPropertyClassification.aspx" },
//         { iconClass: "fas fa-map-marked-alt", title: "District Wise Approved Properties", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmPropertyClassReport.aspx" },
//         { iconClass: "fas fa-chart-bar", title: "Reports Dashboard", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmDashBoardNew.aspx" },
//         { iconClass: "fas fa-file-contract", title: "eSwathu Draft Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchEswathuDraftForm.aspx" },
//         // { iconClass: "fas fa-clipboard-list", title: "Pendency Reports", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/PendanceReport" },
//         // { iconClass: "fas fa-clock", title: "District Wise Pendency Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmDistrictwiseProperties.aspx" },
//         { iconClass: "fas fa-random", title: "District Wise Mutation Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmMutationDistrictwise.aspx" },
//         { iconClass: "fas fa-drafting-compass", title: "Enter Layout Plan Submitted", link: "#" },
//         { iconClass: "fas fa-map-pin", title: "Site Wise NewKhata as per Release", link: "#" },
//         { iconClass: "fas fa-building", title: "Bangalore-One Centers - East", link: "https://bbmpeaasthi.karnataka.gov.in/frmBangalore1CentersbyZone.aspx?zone=East" },
//         { iconClass: "fas fa-project-diagram", title: "E-Aasthi Process Flow", link: "https://bbmpeaasthi.karnataka.gov.in/frmProcessFlowDisplay.aspx" },





//         // { iconClass: "fas fa-info-circle", title: "Submitted Property Status", link: "https://bbmpeaasthi.karnataka.gov.in/forms/CitzApplicationStatus.aspx" },





//     ];

//     function Card({ iconClass, title, link }) {
//         return (
//             <div className="col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2 mb-4 d-flex align-items-stretch">
//                 <a
//                     href={link}
//                     className="card-custom holographic-card w-100 text-decoration-none"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                 >
//                     <div className="text-center mb-2">
//                         <i className={`${iconClass} gradient-icon`}></i>
//                     </div>
//                     <div className="card-title-custom text-center">{title}</div>
//                 </a>
//             </div>
//         );
//     }




//     return (
//         <HomePageLayout>
//             {loading && <Loader />}
//             {/* Add Marquee Here */}
//             <marquee behavior="scroll" direction="left" scrollamount="5" className="text-primary fw-bold">
//                 🔔 This is an important announcement scrolling across the page! 🔔
//             </marquee>
//             <div className="container mt-4">
//                 <div className="row justify-content-center">
//                     {cardData.map((card, index) => (
//                         <Card key={index} iconClass={card.iconClass} title={card.title} link={card.link} />
//                     ))}

//                 </div>
//             </div>
//         </HomePageLayout>
//     );
// };

// export default BBMP_Home;




const BBMP_Home = () => {
  const { t, i18n } = useTranslation()

    return (
        <HomePageLayout>
            <marquee behavior="scroll" direction="left" scrollamount="5" className="text-primary fw-bold">
                🔔 This is an important announcement scrolling across the page! 🔔
            </marquee>
            <div className="container py-5">
                {/* Citizen Services */}
                <div className="service-section mb-5">
                    <div className="section-header mb-4">
                        <h2 className="section-title">
                            <span className="section-icon bg-primary">
                                <i className="fas fa-user-circle"></i>
                            </span>
                            { t('translation.citizenServices.title') }
                        </h2>
                    </div>
                    <div className="row g-3">

                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                            <a
                                href={config.citizenServicesURL.getEkhata}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            > <div className="service-tile" data-service="get-ekhatha">
                                    <div className="tile-icon bg-gradient-success">
                                        <i className="fas fa-file-alt"></i>
                                    </div>
                                    <h6 className="tile-title">Get e-Khatha</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                            <a
                                href={config.citizenServicesURL.layoutDashboard}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            ><div className="service-tile" data-service="khata-dashboard">
                                    <div className="tile-icon bg-gradient-info">
                                        <i className="fas fa-tachometer-alt"></i>
                                    </div>
                                    <h6 className="tile-title">Layout Khata Dashboard</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                            <a
                                href={config.citizenServicesURL.amalgamation}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="amalgamation">
                                    <div className="tile-icon bg-gradient-warning">
                                        <i className="fas fa-layer-group"></i>
                                    </div>
                                    <h6 className="tile-title">Amalgamation</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                            <a
                                href={config.citizenServicesURL.downloadEkhata}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            ><div className="service-tile" data-service="download-ekhata">
                                    <div className="tile-icon bg-gradient-danger">
                                        <i className="fas fa-download"></i>
                                    </div>
                                    <h6 className="tile-title">Download eKhata</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                            <a
                                href={config.citizenServicesURL.onlineFormatAB}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            ><div className="service-tile" data-service="online-format">
                                    <div className="tile-icon bg-gradient-purple">
                                        <i className="fas fa-file-invoice"></i>
                                    </div>
                                    <h6 className="tile-title">Online Format A / B</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                            <a
                                href={config.citizenServicesURL.fileobjection}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            ><div className="service-tile" data-service="file-objections">
                                    <div className="tile-icon bg-gradient-orange">
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <h6 className="tile-title">File Objections On Final eKhata</h6>
                                </div>
                            </a>
                        </div>
                        {/* New Khata */}
                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                            <a
                                href={config.citizenServicesURL.newKhata}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="new-khata">
                                    <div className="tile-icon bg-gradient-teal">
                                        <i className="fas fa-file-signature"></i> {/* Updated icon */}
                                    </div>
                                    <h6 className="tile-title">New Khata</h6>
                                </div>
                            </a>
                        </div>

                        {/* Single Site Approval */}
                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                            <a
                                href={config.citizenServicesURL.singleSiteApproval}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="single-site-approval">
                                    <div className="tile-icon bg-gradient-teal">
                                        <i className="fas fa-check-circle"></i> {/* Updated icon */}
                                    </div>
                                    <h6 className="tile-title">Single Site Approval</h6>
                                </div>
                            </a>
                        </div>

                        {/* Do not find my Property Draft eKhata */}
                        <div className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3">
                            <a
                                href={config.citizenServicesURL.donotfindMyProperty}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="draft-ekhata">
                                    <div className="tile-icon bg-gradient-teal">
                                        <i className="fas fa-search-location"></i> {/* Updated icon */}
                                    </div>
                                    <h6 className="tile-title">Do not find my Property Draft eKhata</h6>
                                </div>
                            </a>
                        </div>

                    </div>

                </div>
                {/* Application status */}
                <div className="service-section mb-5">
                    <div className="section-header mb-4">
                        <h2 className="section-title">
                            <span className="section-icon bg-success">
                                <i className="fas fa-tasks"></i>
                            </span>
                            Application Status
                        </h2>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.applicationStatus.finalekhataStatusEPID}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="final-ekhatha-status">
                                    <div className="tile-icon bg-gradient-primary">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <h6 className="tile-title">Final eKhatha status based on ePID</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.applicationStatus.neweKhathastatusbasedonePID}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="new-ekhatha-status">
                                    <div className="tile-icon bg-gradient-success">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <h6 className="tile-title">New eKhatha status based on ePID</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.applicationStatus.pendingMutation}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="pending-mutations">
                                    <div className="tile-icon bg-gradient-warning">
                                        <i className="fas fa-hourglass-half"></i>
                                    </div>
                                    <h6 className="tile-title">Pending Mutations</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.applicationStatus.searchByPropertyName}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="search-property">
                                    <div className="tile-icon bg-gradient-info">
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <h6 className="tile-title">Search the Property by Name</h6>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
                {/* Verification */}
                <div className="service-section mb-5">
                    <div className="section-header mb-4">
                        <h2 className="section-title">
                            <span className="section-icon bg-info">
                                <i className="fas fa-shield-alt"></i>
                            </span>
                            Verification
                        </h2>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.verification.formABVerification}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="form-verification">
                                    <div className="tile-icon bg-gradient-primary">
                                        <i className="fas fa-clipboard-check"></i> {/* VALID ICON */}
                                    </div>
                                    <h6 className="tile-title">FORM A / B Verification</h6>
                                </div>
                            </a>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.verification.formABView}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="form-view">
                                    <div className="tile-icon bg-gradient-success">
                                        <i className="fas fa-eye"></i>
                                    </div>
                                    <h6 className="tile-title">FORM A / B View</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.verification.ScannedProperty}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="scanned-registers">
                                    <div className="tile-icon bg-gradient-warning">
                                        <i className="fas fa-book"></i> {/* Changed to valid Font Awesome icon */}
                                    </div>
                                    <h6 className="tile-title">Scanned Property Tax Registers of BBMP</h6>
                                </div>
                            </a>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.verification.propertyRegistered}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="verify-registration">
                                    <div className="tile-icon bg-gradient-danger">
                                        <i className="fas fa-file-contract"></i> {/* Updated icon */}
                                    </div>
                                    <h6 className="tile-title">Verify Whether the Property can be Registered</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.verification.propertyRegisteredUnderKaveri}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="properties-register">
                                    <div className="tile-icon bg-gradient-danger">
                                        <i className="fas fa-database"></i> {/* Updated icon */}
                                    </div>
                                    <h6 className="tile-title">Properties Register under Kaveri System</h6>
                                </div>
                            </a>
                        </div>

                    </div>
                </div>
                {/* Reports */}
                <div className="service-section mb-5">
                    <div className="section-header mb-4">
                        <h2 className="section-title">
                            <span className="section-icon bg-warning">
                                <i className="fas fa-chart-bar"></i>
                            </span>
                            Reports
                        </h2>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.reports.reportsDashboard}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="reports-dashboard">
                                    <div className="tile-icon bg-gradient-primary">
                                        <i className="fas fa-dashboard"></i>
                                    </div>
                                    <h6 className="tile-title">Reports Dashboard</h6>
                                </div>
                            </a>
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.reports.eSwathuDraftReport}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <div className="service-tile" data-service="eswathu-report">
                                    <div className="tile-icon bg-gradient-success">
                                        <i className="fas fa-chart-bar"></i> {/* Valid icon */}
                                    </div>
                                    <h6 className="tile-title">eSwathu Draft Report</h6>
                                </div>
                            </a>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a
                                href={config.reports.districtWise}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            ><div className="service-tile" data-service="district-report">
                                    <div className="tile-icon bg-gradient-info">
                                        <i className="fas fa-map-marked-alt"></i>
                                    </div>
                                    <h6 className="tile-title">District Wise Mutation Report</h6>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
                {/* Usefull Links */}
                <div className="service-section mb-5">
                    <div className="section-header mb-4">
                        <h2 className="section-title">
                            <span className="section-icon bg-danger">
                                <i className="fas fa-link"></i> {/* You can also change this */}
                            </span>
                            Useful Links
                        </h2>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a href={config.externalLinks.kaveri} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                <div className="service-tile" data-service="kaveri">
                                    <div className="tile-icon bg-gradient-primary">
                                        <i className="fas fa-map-marked-alt"></i> {/* Changed from fa-external-link-alt */}
                                    </div>
                                    <h6 className="tile-title">Kaveri</h6>
                                </div>
                            </a>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a href={config.externalLinks.bhoomi} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                <div className="service-tile" data-service="bhoomi">
                                    <div className="tile-icon bg-gradient-primary">
                                        <i className="fas fa-globe"></i> {/* Changed */}
                                    </div>
                                    <h6 className="tile-title">Bhoomi</h6>
                                </div>
                            </a>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a href={config.externalLinks.easthi} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                <div className="service-tile" data-service="e-aasthi">
                                    <div className="tile-icon bg-gradient-success">
                                        <i className="fas fa-city"></i> {/* Changed */}
                                    </div>
                                    <h6 className="tile-title">E-Aasthi</h6>
                                </div>
                            </a>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a href={config.externalLinks.propertyTax} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                <div className="service-tile" data-service="property-tax">
                                    <div className="tile-icon bg-gradient-warning">
                                        <i className="fas fa-file-invoice-dollar"></i> {/* Changed */}
                                    </div>
                                    <h6 className="tile-title">Property Tax</h6>
                                </div>
                            </a>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a href={config.externalLinks.bangloreOne} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                <div className="service-tile" data-service="bangalore-one">
                                    <div className="tile-icon bg-gradient-info">
                                        <i className="fas fa-store"></i> {/* Changed */}
                                    </div>
                                    <h6 className="tile-title">Bangalore-One Center</h6>
                                </div>
                            </a>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6">
                            <a href={config.externalLinks.processFlow} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                                <div className="service-tile" data-service="process-flow">
                                    <div className="tile-icon bg-gradient-info">
                                        <i className="fas fa-project-diagram"></i> {/* Changed */}
                                    </div>
                                    <h6 className="tile-title">Process Flow</h6>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </HomePageLayout>
    );
};

export default BBMP_Home;
