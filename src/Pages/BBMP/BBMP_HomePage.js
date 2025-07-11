import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HomePageLayout from '../../Layout/HomePageLayout';
import Loader from '../../Layout/Loader';

const BBMP_Home = () => {
    const [loading, setLoading] = useState(false);

    const cardData = [
        { iconClass: "fas fa-sign-in-alt", title: "Login", link: "https://testlayoutkhata.bbmpgov.in/Login" },
        { iconClass: "fas fa-file-alt", title: "Get e-Khatha", link: "#" },
        { iconClass: "fas fa-wallet", title: "Property Tax", link: "https://bbmptax.karnataka.gov.in/" },
        { iconClass: "fas fa-columns", title: "Layout Khata Dashboard", link: "https://testlayoutkhata.bbmpgov.in/" },
        { iconClass: "fas fa-object-group", title: "Amalgamation", link: "#" },
        { iconClass: "fas fa-map", title: "Draft e-Khata( if you know your Ward)", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/" },
        { iconClass: "fas fa-map-marked-alt", title: "Draft eKhatha (if you don't know your Ward)", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/GoogleMapsWardCoordinates" },
        { iconClass: "fas fa-search-location", title: "Do not find my Property Draft eKhata", link: "#" },
        { iconClass: "fas fa-list-ul", title: "Ward List - East", link: "https://bbmpeaasthi.karnataka.gov.in/frmBangalore1CentersbyZone.aspx?zone=East" },
        { iconClass: "fas fa-file-alt", title: "Final eKhatha status based on ePID", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/Final_eKhatha_Status_based_on_ePID" },
        { iconClass: "fas fa-comment-dots", title: "File Objections On Final eKhata", link: "#" },
        { iconClass: "fas fa-file-signature", title: "New eKhatha status based on ePID", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/NewEkhataStatus" },
        // { iconClass: "fas fa-info-circle", title: "Submitted Property Status", link: "https://bbmpeaasthi.karnataka.gov.in/forms/CitzApplicationStatus.aspx" },
        // { iconClass: "fas fa-tasks", title: "Pending Applications", link: "https://bbmpeaasthi.karnataka.gov.in/forms/CitzPendingApplicationBBMP.aspx" },
        { iconClass: "fas fa-hourglass-half", title: "Pending Mutations", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/PendingMutationReport" },
        { iconClass: "fas fa-check-circle", title: "Sample FORM A / B Verification", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2Verify.aspx" },
        { iconClass: "fas fa-eye", title: "Sample FORM A / B View", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2View.aspx?formid=menu" },
        { iconClass: "fas fa-download", title: "Online Format A / B (Online Khata) Download", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmKhathaDownload.aspx" },
        { iconClass: "fas fa-book", title: "Scanned Property Tax Registers of BBMP", link: "#" },
        // { iconClass: "fas fa-search", title: "Search for assets", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchProperties.aspx" },
        { iconClass: "fas fa-check-square", title: "Verify Whether the Property can be Registered", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchKaveriProperties.aspx" },
        { iconClass: "fas fa-home", title: "Search the Property by Name", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmPropertySearchByName.aspx" },
        { iconClass: "fas fa-map", title: "Search for Properties Found in Kaveri", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchKaveriProp.aspx" },
        // { iconClass: "fas fa-inr", title: "Pay Administrative Fee (2% fee) Online", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmOnlinePayUrl.aspx" },
        // { iconClass: "fas fa-thumbs-up", title: "Approved Properties", link: "https://bbmpeaasthi.karnataka.gov.in/office/FrmPropertyClassification.aspx" },
        { iconClass: "fas fa-map-marked-alt", title: "District Wise Approved Properties", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmPropertyClassReport.aspx" },
        { iconClass: "fas fa-chart-bar", title: "Reports Dashboard", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmDashBoardNew.aspx" },
        { iconClass: "fas fa-file-contract", title: "eSwathu Draft Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchEswathuDraftForm.aspx" },
        // { iconClass: "fas fa-clipboard-list", title: "Pendency Reports", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/PendanceReport" },
        // { iconClass: "fas fa-clock", title: "District Wise Pendency Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmDistrictwiseProperties.aspx" },
        { iconClass: "fas fa-random", title: "District Wise Mutation Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmMutationDistrictwise.aspx" },
        { iconClass: "fas fa-drafting-compass", title: "Enter Layout Plan Submitted", link: "#" },
        { iconClass: "fas fa-map-pin", title: "Site Wise NewKhata as per Release", link: "#" },
        { iconClass: "fas fa-building", title: "Bangalore-One Centers - East", link: "https://bbmpeaasthi.karnataka.gov.in/frmBangalore1CentersbyZone.aspx?zone=East" },
        { iconClass: "fas fa-project-diagram", title: "E-Aasthi Process Flow", link: "https://bbmpeaasthi.karnataka.gov.in/frmProcessFlowDisplay.aspx" },




        
        // { iconClass: "fas fa-info-circle", title: "Submitted Property Status", link: "https://bbmpeaasthi.karnataka.gov.in/forms/CitzApplicationStatus.aspx" },





    ];

    function Card({ iconClass, title, link }) {
        return (
            <div className="col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2 mb-4 d-flex align-items-stretch">
                <a
                    href={link}
                    className="card-custom holographic-card w-100 text-decoration-none"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className="text-center mb-2">
                        <i className={`${iconClass} gradient-icon`}></i>
                    </div>
                    <div className="card-title-custom text-center">{title}</div>
                </a>
            </div>
        );
    }




    return (
        <HomePageLayout>
            {loading && <Loader />}
            <div className="container mt-4">
                <div className="row justify-content-center">
                    {cardData.map((card, index) => (
                        <Card key={index} iconClass={card.iconClass} title={card.title} link={card.link} />
                    ))}

                </div>
            </div>
        </HomePageLayout>
    );
};

export default BBMP_Home;
