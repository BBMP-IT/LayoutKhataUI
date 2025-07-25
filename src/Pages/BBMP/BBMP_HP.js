import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HomePageLayout from '../../Layout/HomePageLayout';
import Loader from '../../Layout/Loader';

const BBMP_HP = () => {
    const [loading, setLoading] = useState(false);


    const entry_cardData = [
        //  Application status
        { iconClass: "fas fa-clipboard-list", title: "Pendency Reports", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/PendanceReport" },
        { iconClass: "fas fa-file-signature", title: "New eKhatha status based on ePID", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/NewEkhataStatus" },
        { iconClass: "fas fa-hourglass-half", title: "Pending Mutations", link: "https://bbmpeaasthi.karnataka.gov.in/citizen_core/PendingMutationReport" },
        { iconClass: "fas fa-home", title: "Search the Property by Name", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmPropertySearchByName.aspx" },
    ]
    function Entry_Card({ iconClass, title, link }) {
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

    const citizen_cardData = [
        // Citizen Sevices
        { iconClass: "fas fa-sign-in-alt", title: "Login", link: "https://testlayoutkhata.bbmpgov.in/Login" },
        { iconClass: "fas fa-file-alt", title: "Get e-Khatha", link: "#" },
        { iconClass: "fas fa-columns", title: "Layout khata Dashboard", link: "https://testlayoutkhata.bbmpgov.in/" },
        { iconClass: "fas fa-object-group", title: "Amalgamation", link: "#" },
        { iconClass: "fas fa-object-group", title: "Download eKhata", link: "#" },
        { iconClass: "fas fa-download", title: "Online Format A / B Download", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmKhathaDownload.aspx" },
        
         { iconClass: "fas fa-object-group", title: "New Khata", link: "#" },
        { iconClass: "fas fa-download", title: "Single Site Approval", link: "#" },
        { iconClass: "fas fa-comment-dots", title: "File Objections On Final eKhata", link: "#" },
        { iconClass: "fas fa-search-location", title: "Do not find my Property Draft eKhata", link: "#" },
    ]
    function Citizen_Card({ iconClass, title, link }) {
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



    const reports_cardData = [
        // Reports
        { iconClass: "fas fa-chart-bar", title: "Reports Dashboard", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmDashBoardNew.aspx" },
        { iconClass: "fas fa-file-contract", title: "eSwathu Draft Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchEswathuDraftForm.aspx" },
        { iconClass: "fas fa-random", title: "District Wise Mutation Report", link: "https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmMutationDistrictwise.aspx" },
    ]
    function Reports_Card({ iconClass, title, link }) {
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

    const know_cardData = [
        // Verification
        { iconClass: "fas fa-check-circle", title: "FORM A / B Verification", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2Verify.aspx" },
        { iconClass: "fas fa-eye", title: "FORM A / B View", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2View.aspx?formid=menu" },
        { iconClass: "fas fa-book", title: "Scanned Property Tax Registers of BBMP", link: "#" },
        { iconClass: "fas fa-check-square", title: "Verify Whether the Property can be Registered", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchKaveriProperties.aspx" },
        { iconClass: "fas fa-map", title: "Properties Register under Kaveri System", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmSearchKaveriProp.aspx" },
    ]
    function Things_Card({ iconClass, title, link }) {
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

    const usefullinks_cardData = [
        // Verification
        { iconClass: "fas fa-check-circle", title: "Kaveri", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2Verify.aspx" },
        { iconClass: "fas fa-eye", title: "E-Aasthi", link: "https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2View.aspx?formid=menu" },
        { iconClass: "fas fa-book", title: "Property Tax", link: "#" },
        { iconClass: "fas fa-building", title: "Bangalore-One Centers - East", link: "https://bbmpeaasthi.karnataka.gov.in/frmBangalore1CentersbyZone.aspx?zone=East" },
        { iconClass: "fas fa-project-diagram", title: "E-Aasthi Process Flow", link: "https://bbmpeaasthi.karnataka.gov.in/frmProcessFlowDisplay.aspx" },
    ]
    function Usefullinks_Card({ iconClass, title, link }) {
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
            {/* Add Marquee Here */}
            <marquee behavior="scroll" direction="left" scrollamount="5" className="text-primary fw-bold">
                🔔 This is an important announcement scrolling across the page! 🔔
            </marquee>
            <div className="container mt-4">
                {/* Citizen services */}
                <div className="row justify-content-left">
                    <h3 className="animated-underline">Citizen Services</h3>
                    {citizen_cardData.map((card, index) => (
                        <Citizen_Card key={index} iconClass={card.iconClass} title={card.title} link={card.link} />
                    ))}
                </div>
                {/* Application status */}
                <div className="row justify-content-left">
                    <h3 className="animated-underline">Application Status</h3>
                    {entry_cardData.map((card, index) => (
                        <Entry_Card key={index} iconClass={card.iconClass} title={card.title} link={card.link} />
                    ))}
                </div>
                {/* Verification */}
                <div className="row justify-content-left">
                    <h3 className="animated-underline">Verification</h3>
                    {know_cardData.map((card, index) => (
                        <Things_Card key={index} iconClass={card.iconClass} title={card.title} link={card.link} />
                    ))}
                </div>

                {/* reports */}
                <div className="row justify-content-left">
                    <h3 className="animated-underline">Reports</h3>
                    {reports_cardData.map((card, index) => (
                        <Reports_Card key={index} iconClass={card.iconClass} title={card.title} link={card.link} />
                    ))}
                </div>

                {/* Useful Links */}
                <div className="row justify-content-left">
                    <h3 className="animated-underline">Useful Links</h3>
                    {usefullinks_cardData.map((card, index) => (
                        <Usefullinks_Card key={index} iconClass={card.iconClass} title={card.title} link={card.link} />
                    ))}
                </div>

            </div>
        </HomePageLayout>
    );
};

export default BBMP_HP
