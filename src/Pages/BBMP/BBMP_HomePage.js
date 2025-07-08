import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HomePageLayout from '../../Layout/HomePageLayout';
import Loader from '../../Layout/Loader';

const BBMP_Home = () => {
    const [loading, setLoading] = useState(false);

    const cardData = [
        { iconClass: "fas fa-sign-in-alt", title: "Login", link: "https://testlayoutkhata.bbmpgov.in/" },
        { iconClass: "fas fa-clipboard-list", title: "Pendency Reports", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/PendanceReport" },
        { iconClass: "fas fa-hourglass-half", title: "Pending Mutations", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/PendingMutationReport" },
        { iconClass: "fas fa-file-alt", title: "Final eKhatha status based on ePID", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/Final_eKhatha_Status_based_on_ePID" },
        { iconClass: "fas fa-file-signature", title: "New eKhatha status based on ePID", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/NewEkhataStatus" },
        { iconClass: "fas fa-map", title: "for draft eKhata if you know your ward", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/" },
        { iconClass: "fas fa-map-marked-alt", title: "to know your ward & see draft eKhatha", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/GoogleMapsWardCoordinates" },
        
        { iconClass: "fas fa-file-alt", title: "Get e-Khatha", link: "#" },
        { iconClass: "fas fa-tasks", title: "Pending Applications", link: "https://bbmpeaasthi.karnataka.gov.in/forms/CitzPendingApplicationBBMP.aspx" },
        { iconClass: "fas fa-info-circle", title: "ಸಲ್ಲಿಸಿದ ಆಸ್ತಿ ಸ್ಥಿತಿ", link: "https://bbmpeaasthi.karnataka.gov.in/forms/CitzApplicationStatus.aspx" },
        { iconClass: "fas fa-comment-dots", title: "File Objections On Final eKhata", link: "#" },
        { iconClass: "fas fa-object-group", title: "Amalgamation", link: "#" },
        { iconClass: "fas fa-search-location", title: "Do not find my Property Draft eKhata", link: "#" },
        { iconClass: "fas fa-book", title: "Scanned Property Tax Registers of BBMP", link: "#" },
        { iconClass: "fas fa-check-circle", title: "Sample A / B Verification", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2Verify.aspx" },
        { iconClass: "fas fa-eye", title: "Sample A / B view", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2View.aspx?formid=menu" },
        { iconClass: "fas fa-download", title: "Online Format A / B Download", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmKhathaDownload.aspx" },
        { iconClass: "fas fa-search", title: "Search for assets", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchProperties.aspx" },
        { iconClass: "fas fa-map-marker-alt", title: "Verify whether the property can be registered", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchKaveriProperties.aspx" },
        { iconClass: "fas fa-user-search", title: "Search the property by name", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmPropertySearchByName.aspx" },
        { iconClass: "fas fa-map", title: "Search for properties found in Kaveri", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchKaveriProp.aspx" },
        { iconClass: "fas fa-rupee-sign", title: "Pay Administrative Fee (2% fee) Online", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmOnlinePayUrl.aspx" },
        { iconClass: "fas fa-file-contract", title: "eSwathu Draft Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchEswathuDraftForm.aspx" },
        { iconClass: "fas fa-chart-bar", title: "Reports Dashboard", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmDashBoardNew.aspx" },
        { iconClass: "fas fa-thumbs-up", title: "Approved Properties", link: "https://bbmpeaasthi.karnataka.gov.in/office/FrmPropertyClassification.aspx" },
        { iconClass: "fas fa-map-marked-alt", title: "District Wise Approved Properties", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmPropertyClassReport.aspx" },
        { iconClass: "fas fa-clock", title: "District Wise Pendency Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmDistrictwiseProperties.aspx" },
        { iconClass: "fas fa-random", title: "District Wise Mutation Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmMutationDistrictwise.aspx" },
        { iconClass: "fas fa-wallet", title: "Property Tax", link: "https://bbmptax.karnataka.gov.in/" },
        { iconClass: "fas fa-list-ul", title: "Ward List - East", link: "https://bbmpeaasthi.karnataka.gov.in/frmBangalore1CentersbyZone.aspx?zone=East" },
        { iconClass: "fas fa-building", title: "Bangalore-One Centers - East", link: "https://bbmpeaasthi.karnataka.gov.in/frmBangalore1CentersbyZone.aspx?zone=East" },
        { iconClass: "fas fa-project-diagram", title: "Process Flow", link: "https://bbmpeaasthi.karnataka.gov.in/frmProcessFlowDisplay.aspx" },
        { iconClass: "fas fa-columns", title: "Layout khata Dashboard", link: "#" },
        { iconClass: "fas fa-drafting-compass", title: "Enter Layout plan submitted", link: "#" },
        { iconClass: "fas fa-map-pin", title: "Site wise NewKhata as per release", link: "#" }
    ];


    function Card({ iconClass, title, link }) {
        return (
            <div className="col-6 col-sm-6 col-md-2 col-lg-2 col-xl-2 mb-4 d-flex align-items-stretch">
                <a href={link} className="card-custom w-100 text-decoration-none" target="_blank" rel="noopener noreferrer">
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
