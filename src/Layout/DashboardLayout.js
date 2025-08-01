import React, { useEffect, useState, useRef, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import './DashboardLayout.css';
import cmlogo from '../assets/chief_minister_of_karrnataka_icon.png';
import dcmlogo from '../assets/DeputyCM.jpeg';
import gokLogo from '../assets/gok.png';
import bbmplogo from '../assets/bbmp.png';
import digital_logo from '../assets/digital_india.png';
import { useTranslation } from "react-i18next";
import i18n from "../localization/i18n";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import BBMP_LayoutForm from '../Pages/BBMP/BBMP_Layout';
import { toast, Toaster } from 'react-hot-toast';
import { LocalLaundryService } from '@mui/icons-material';
import Swal from "sweetalert2";
import { useAuth } from "../AuthContext";
import Loader from './Loader';
import { ModalContext } from './ModalContext';

export const LoaderContext = createContext();



const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'kn';
  const [language, setLanguage] = useState('kn');
  const { UseLogout } = useAuth();

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    sessionStorage.setItem("selectedLanguage", newLang);

  };


  const [loading, setLoading] = useState(false);

  const start_loader = () => setLoading(true);
  const stop_loader = () => setLoading(false);



  const [zoomLevel] = useState(0.9);
  useEffect(() => {
    document.body.style.zoom = zoomLevel; // Apply zoom

  }, [zoomLevel]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  document.addEventListener("DOMContentLoaded", function () {

    document.addEventListener("click", function () {
      document.querySelectorAll(".dropdown-menu.show").forEach((submenu) => {
        submenu.classList.remove("show");
      });
    });
  });

  useEffect(() => {
    const storedLang = sessionStorage.getItem('selectedLanguage') || 'kn'; // Default to 'kn' if nothing in storage
    setLanguage(storedLang);
    i18n.changeLanguage(storedLang);
    const dropdownSubmenus = document.querySelectorAll(".dropdown-submenu > a");
    dropdownSubmenus.forEach((submenu) => {
      submenu.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        let nextMenu = submenu.nextElementSibling;
        if (nextMenu) {
          nextMenu.classList.toggle("show");
        }
      });
    });

    return () => {
      dropdownSubmenus.forEach((submenu) => {
        submenu.removeEventListener("click", () => { });
      });
    };
  }, []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // Function to toggle the dropdown
  const toggleDropdown = (e) => {
    e.preventDefault(); // Prevents page jump
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    // Attach event listener when menu is open
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [menuOpen]);

  const handleClick = () => {
    navigate('/homePage');
  };
  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out from your session.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        UseLogout();
        navigate("/Login", { replace: true });
      }
      // If cancelled, do nothing
    });
  };

  const [isDropdownOneOpen, setIsDropdownOneOpen] = useState(false);
  const [isDropdownTwoOpen, setIsDropdownTwoOpen] = useState(false);

  const [isDropdownThreeOpen, setIsDropdownThreeOpen] = useState(false);
const [isDropdownFourOpen, setIsDropdownFourOpen] = useState(false);
const [isDropdownFiveOpen, setIsDropdownFiveOpen] = useState(false);
  

  const toggleDropdownOne = () => {
    setIsDropdownOneOpen(!isDropdownOneOpen);
    setIsDropdownTwoOpen(false); // close the other one
    setIsDropdownThreeOpen(false);
    setIsDropdownFourOpen(false);
    setIsDropdownFiveOpen(false);
  };

  const toggleDropdownTwo = () => {
    setIsDropdownTwoOpen(!isDropdownTwoOpen);
    setIsDropdownOneOpen(false); // close the other one
    setIsDropdownThreeOpen(false);
    setIsDropdownFourOpen(false);
    setIsDropdownFiveOpen(false);
  };
  const toggleDropdownThree = () => {
    setIsDropdownThreeOpen(!isDropdownThreeOpen);
    setIsDropdownOneOpen(false); // close the other one
    setIsDropdownTwoOpen(false);
    setIsDropdownFourOpen(false);
    setIsDropdownFiveOpen(false);
  };

  const toggleDropdownFour = () => {
    setIsDropdownFourOpen(!isDropdownFourOpen);
    setIsDropdownOneOpen(false); // close the other one
    setIsDropdownTwoOpen(false);
    setIsDropdownThreeOpen(false);
    setIsDropdownFiveOpen(false);
  };

    const toggleDropdownFive = () => {
    setIsDropdownFiveOpen(!isDropdownFiveOpen);
    setIsDropdownOneOpen(false); // close the other one
    setIsDropdownTwoOpen(false);
    setIsDropdownThreeOpen(false);
    setIsDropdownFourOpen(false);
  };


  const handleLayoutFormClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    sessionStorage.removeItem('LKRSID');
    sessionStorage.removeItem('display_LKRSID');
    sessionStorage.removeItem('totalNoOfSites');
    sessionStorage.removeItem('ownerName');
    window.open(`${window.location.origin}/LayoutForm`);
  };

  const handleReleaseClick = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('LKRSID');
    sessionStorage.removeItem('display_LKRSID');
    sessionStorage.removeItem('totalNoOfSites');
    sessionStorage.removeItem('ownerName');
    window.open(`${window.location.origin}/SiteRelease`);
  };


  //modal context defined
  const [modalVisible, setModalVisible] = useState(false);
  const [modalBody, setModalBody] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);
  const setModalContent = (content) => setModalBody(content);
  const setModalTitleSafe = (title) => setModalTitle(title);


useEffect(() => {
  const navbar = document.querySelector('.navbar');
  const header = document.querySelector('.header');
  const main = document.querySelector('main');

  const handleScroll = () => {
    if (window.scrollY > 10) {
      navbar.style.top = '0px';
      main.style.marginTop = '170px';
    } else {
      navbar.style.top = '155px';
      main.style.marginTop = '220px';
    }
  };
  window.addEventListener('scroll', handleScroll);

  return () => window.removeEventListener('scroll', handleScroll);
}, []);


useEffect(() => {
  const handleClickOutside = (event) => {
    if (navbarRef.current && !navbarRef.current.contains(event.target)) {
      // Click is outside the navbar
      setIsDropdownOneOpen(false);
      setIsDropdownTwoOpen(false);
      setIsDropdownThreeOpen(false);
      setIsDropdownFourOpen(false);
      setIsDropdownFiveOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);


  return (
    <LoaderContext.Provider value={{ loading, start_loader, stop_loader }}>
      <ModalContext.Provider value={{ showModal, hideModal, setModalContent, setModalTitle: setModalTitleSafe }}>
        {loading && <Loader />}
        {modalVisible &&
          ReactDOM.createPortal(
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <div className="modal-dialog modal-xl" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{modalTitle}</h5>
                    <button type="button" className="btn-close" onClick={hideModal}></button>
                  </div>
                  <div className="modal-body">{modalBody}</div>
                </div>
              </div>
            </div>,
            document.body
          )}

        <div className="App">
          <Toaster toastOptions={{ duration: 4000, style: { fontSize: '14px', padding: '16px 24px', minWidth: '300px', textAlign: 'center', }, }} position="bottom-right" />
          <div className="page">
            <div className="page-main">

              <div className="header py-1">
                <div className="container-fluid">
                  <div className="row text-center align-items-center">
                    {/* CM */}
                    <div className="col-md-2 col-6 mb-3">
                      <div className="d-flex flex-column align-items-center">
                        <img src={cmlogo} alt="CM" width={80} height={80} className="rounded-circle bg-white p-1" />
                        <div className="fw-bold text-white mt-2">{t('translation.navbar.header.CMName')}</div>
                        <div className="badge bg-secondary mt-1">{ t('translation.navbar.header.CMTitle') }</div>
                      </div>
                    </div>

                    {/* GOK */}
                    <div className="col-md-2 col-6 mb-3">
                      <div className="d-flex flex-column align-items-center">
                        <div style={{
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          width: '85px',
                          height: '85px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <img src={gokLogo} alt="GOK" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="fw-bold text-white mt-2">{ t('translation.navbar.header.GOK') }</div>
                      </div>
                    </div>

                    {/* Heading */}
                    <div className="col-md-4 col-12 mb-3">
                      <h2 className="text-white">{t('translation.eaasthi.bbmpHeading')}</h2>
                    </div>

                    {/* BBMP */}
                    <div className="col-md-2 col-6 mb-3">
                      <div className="d-flex flex-column align-items-center">
                        <img src={bbmplogo} alt="BBMP" width={80} height={80} className="rounded-circle bg-white p-1" />
                        <div className="fw-bold text-white mt-2">{ t('translation.navbar.header.bbmp') }</div>
                      </div>
                    </div>

                    {/* DCM */}
                    <div className="col-md-2 col-6 mb-3">
                      <div className="d-flex flex-column align-items-center">
                        <div style={{
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          width: '85px',
                          height: '85px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <img src={dcmlogo} alt="DCM" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="fw-bold text-white mt-2">{ t('translation.navbar.header.DCMName') }</div>
                        <div className="badge bg-secondary mt-1">{ t('translation.navbar.header.DCMTitle') }</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <nav className=" navbar navbar-expand-lg navbar-light bg-light " ref={navbarRef}>
                <div className="container-fluid">
                  {/* Navbar Toggle Button for Mobile */}
                  <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <span className="navbar-toggler-icon"></span>&nbsp;&nbsp;BBMP
                    <img src={bbmplogo} width={40} height={40} style={{ marginLeft: '60px' }} />
                  </button>

                  <div
                    className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
                    id="navbarMenu"
                  >
                    <ul className="navbar-nav mr-auto">

                      <li className="nav-item dropdown">
                        <a
                          href="#"
                          className={`nav-link dropdown-toggle ${isDropdownThreeOpen ? "show" : ""}`}
                          role="button"
                          onClick={toggleDropdownThree}
                          aria-expanded={isDropdownThreeOpen}
                        >
                          <i className="fa fa-box"></i>&nbsp; e-Khata Services
                        </a>
                        <ul className={`dropdown-menu ${isDropdownThreeOpen ? "show" : ""}`}>
                          <li className="dropdown-submenu">
                            <a className="dropdown-item dropdown-toggle" href="#">
                              Entry Form
                            </a>
                            <ul className="dropdown-menu">
                              <li>
                                <a className="dropdown-item" href="#">
                                  Get e-Khatha
                                </a>
                              </li>
                            </ul>
                          </li>
                          <li className="dropdown-submenu">
                            <a className="dropdown-item dropdown-toggle" href="#">
                              Pending Applications
                            </a>
                            <ul className="dropdown-menu">
                              <li>
                                <a className="dropdown-item" href="#">
                                  ಸಲ್ಲಿಸಿದ ಆಸ್ತಿ ಸ್ಥಿತಿ
                                </a>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              File Objections On Final eKhata
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Amalgamation
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Do not find my Property Draft eKhata
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Reports
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              Scanned Property Tax Registers of BBMP
                            </a>
                          </li>
                        </ul>
                      </li>
                      

                      <li className="nav-item dropdown">
                        <a
                          href="#"
                          className={`nav-link dropdown-toggle ${isDropdownFourOpen ? "show" : ""}`}
                          role="button"
                          onClick={toggleDropdownFour}
                          aria-expanded={isDropdownFourOpen}
                        >
                          <i className="fa fa-box"></i>&nbsp; {t('translation.citizenServices.title')}
                        </a>
                        <ul className={`dropdown-menu ${isDropdownFourOpen ? "show" : ""}`}>
                          <li >
                            <a className="dropdown-item dropdown-toggle" href="#">
                               {t('translation.citizenServices.subdropdown.dropdown1')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              {t('translation.citizenServices.subdropdown.dropdown2')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              {t('translation.citizenServices.subdropdown.dropdown3')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              {t('translation.citizenServices.subdropdown.dropdown4')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                             {t('translation.citizenServices.subdropdown.dropdown5')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                            {t('translation.citizenServices.subdropdown.dropdown6')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                            {t('translation.citizenServices.subdropdown.dropdown7')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                            {t('translation.citizenServices.subdropdown.dropdown8')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                            {t('translation.citizenServices.subdropdown.dropdown9')}
                            </a>
                          </li>
                        </ul>
                      </li>

                          <li className="nav-item dropdown">
                        <a
                          href="#"
                          className={`nav-link dropdown-toggle ${isDropdownFiveOpen ? "show" : ""}`}
                          role="button"
                          onClick={toggleDropdownFive}
                          aria-expanded={isDropdownFiveOpen}
                        >
                          <i className="fa fa-box"></i>&nbsp; {t('translation.reports.title')}
                        </a>
                        <ul className={`dropdown-menu ${isDropdownFiveOpen ? "show" : ""}`}>
                          <li >
                            <a className="dropdown-item dropdown-toggle" href="#">
                               {t('translation.reports.subdropdown.dropdown1')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              {t('translation.reports.subdropdown.dropdown2')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              {t('translation.reports.subdropdown.dropdown3')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              {t('translation.reports.subdropdown.dropdown4')}
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                            {t('translation.reports.subdropdown.dropdown5')}
                            </a>
                          </li>
                        </ul>
                      </li>
                    
                    
                      <li className="nav-item dropdown">
                        <a href="#" className="nav-link" >
                          <i className="fa fa-file"></i>&nbsp; {t('translation.propertyTax.title')}
                        </a>
                      </li>





                      <li className="nav-item dropdown">
                        <a
                          href="#"
                          className={`nav-link dropdown-toggle ${isDropdownOneOpen ? "show" : ""}`}
                          role="button"
                          onClick={toggleDropdownOne}
                          aria-expanded={isDropdownOneOpen}
                        >
                          <i className="fa fa-box"></i>&nbsp; {t("translation.thingstoknow.title")}
                        </a>
                        <ul className={`dropdown-menu ${isDropdownOneOpen ? "show" : ""}`}>
                          <li className="dropdown-submenu">
                            <a className="dropdown-item dropdown-toggle" href="#">
                              {t("translation.thingstoknow.subdropdown.dropdown1")}
                            </a>
                            <ul className="dropdown-menu">
                              <li>
                                <a className="dropdown-item" href="#">
                                  {t("translation.thingstoknow.subdropdown.east")}
                                </a>
                              </li>
                            </ul>
                          </li>
                          <li className="dropdown-submenu">
                            <a className="dropdown-item dropdown-toggle" href="#">
                              {t("translation.thingstoknow.subdropdown.dropdown2")}
                            </a>
                            <ul className="dropdown-menu">
                              <li>
                                <a className="dropdown-item" href="#">
                                  {t("translation.thingstoknow.subdropdown.east")}
                                </a>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <a className="dropdown-item" href="#">
                              {t("translation.thingstoknow.subdropdown.dropdown3")}
                            </a>
                          </li>
                        </ul>
                      </li>
                      <li className="nav-item dropdown">
                        <a
                          href="#"
                          className={`nav-link dropdown-toggle ${isDropdownTwoOpen ? "show" : ""}`}
                          role="button"
                          onClick={toggleDropdownTwo}
                          aria-expanded={isDropdownTwoOpen}
                        >
                          <i className="fa fa-box"></i>&nbsp; Layout Khata
                        </a>
                        <ul className={`dropdown-menu ${isDropdownTwoOpen ? "show" : ""}`}>
                          <li>
                            <a className="dropdown-item" href="/LayoutDashboard">
                              Dashboard
                            </a>
                          </li>
                          <li>
                            <button className="dropdown-item" onClick={handleLayoutFormClick}>
                              Enter Layout Plan Submitted
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item" onClick={handleReleaseClick}>
                              Site wise NewKhata as per Release
                            </button>
                          </li>
                        </ul>
                      </li>
                    </ul>
                    {/* logout */}
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-sm button_size"
                        style={{ backgroundColor: "#fff", color: "#023e8a" }}
                        onClick={handleLogout}
                      >
                        <i className="fa fa-sign-out button_size"> logout</i>
                      </button>

                    </div> &nbsp;
                    {/* Right Side Buttons */}
                    <div className="d-flex align-items-center">
                      {/* <button
                        className="btn btn-sm"
                        style={{ backgroundColor: "#fff", color: "#023e8a" }}
                      >
                        {t('translation.buttons.deptLogin')}
                      </button>
                      &nbsp; */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLanguageChange({ target: { value: 'kn' } })}
                          className={`px-4 py-2 rounded ${setLanguage === 'kn' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
                            }`}
                        >
                          ಕನ್ನಡ
                        </button>
                        <button
                          onClick={() => handleLanguageChange({ target: { value: 'en' } })}
                          className={`px-4 py-2 rounded ${setLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
                            }`}
                        >
                          English
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </nav>





              <main>{children}</main>

              {/* <FloatingButton onClick={handleClick} /> */}
              <section id="contact">
                <div className="container">
                  <div className="row" data-aos="fade-up">
                    <div className="col-lg-4 col-md-4 col-sm-12 col-12">
                      <div className="contact-about">
                        <h6 className='line_style'>Layout Khata</h6>
                        <div className="footer-title-line"></div>
                        <div className="social-links">
                          {/* <img src={bbmplogo} alt="" width="130" height="90" /><br /><br /> */}
                          {/* <img src={digital_logo} alt="" width="250" height="90" /><br /><br /> */}
                          <a href="#" className="twitter"><i className="fab fa-twitter"></i></a>
                          <a href="#" className="facebook"><i className="fab fa-facebook"></i></a>
                          <a href="#" className="instagram"><i className="fab fa-instagram"></i></a>
                          <a href="#" className="google-plus"><i className="fab fa-google-plus"></i></a>
                          <a href="#" className="linkedin"><i className="fab fa-linkedin"></i></a>
                        </div>

                      </div>
                    </div>

                    <div className="col-lg-4 col-md-4 col-sm-12 col-12">
                      <div className="info">
                        <h6 className='line_style'>BBMP</h6>
                        <div className="footer-title-line"></div>
                        <div>
                          <i className="fas fa-map-marker-alt"></i>
                          <p>{t('translation.footer.headOffice.address')}</p>
                        </div>
                        <div className="icon_size">
                          <i className="fa fa-envelope"></i>
                          <p>{t('translation.footer.headOffice.email')}</p>
                        </div>
                        {/* <div>
                      <i className="fa fa-phone"></i>
                      <p>{t('translation.footer.headOffice.phone')}</p>
                    </div>
                    <div>
                      <i className="fa fa-phone"></i>
                      <p>{t('translation.footer.headOffice.phone1')}</p>
                    </div> */}
                      </div>
                    </div>

                    <div className="col-lg-4 col-md-4 col-sm-12 col-12">
                      <h6 className='line_style'>{t('translation.footer.bussinessHours.heading')}</h6>
                      <div className="footer-title-line"></div>
                      <div className="row">
                        <div className="col-md-6">
                          {t('translation.footer.bussinessHours.days')}
                        </div>
                        <div className="col-md-6">
                          {t('translation.footer.bussinessHours.hours')}
                        </div>
                        <div className="col-md-12">
                          {t('translation.footer.bussinessHours.timings')}
                        </div>
                        <div className="col-md-12">
                          {t('translation.footer.bussinessHours.closing')}
                        </div>
                        <br />

                      </div>
                    </div>
                  </div><br /><br />
                </div>
              </section>

              <footer id="footer">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12 text-lg-left text-center">
                      <div className="copyright">
                        <p><span style={{ backgroundColor: "#023e8a", color: '#fff' }}>{t('translation.footer.designedby')}</span> &copy; {t('translation.footer.copyrights')} <strong>{t('translation.footer.heading')}</strong>. {t('translation.footer.reserved')}</p>

                      </div>
                    </div>

                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </ModalContext.Provider>
    </LoaderContext.Provider>

  );
}
const FloatingButton = ({ onClick }) => {
  return (
    <button className="floating-button" onClick={onClick}>
      <i className="fa fa-home"></i>
    </button>
  );
};


const MyFormComponent = () => {
  return (
    <div>
      {/* Dropdown */}
      <div className="mb-3">
        <label className="form-label">Select Option</label>
        <select className="form-select">
          <option value="">-- Select --</option>
          <option value="one">Option One</option>
          <option value="two">Option Two</option>
        </select>
      </div>

      {/* Radio Buttons */}
      <div className="mb-3">
        <label className="form-label d-block">Choose One</label>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" name="choice" id="yes" value="yes" />
          <label className="form-check-label" htmlFor="yes">Yes</label>
        </div>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" name="choice" id="no" value="no" />
          <label className="form-check-label" htmlFor="no">No</label>
        </div>
      </div>

      {/* Textbox */}
      <div className="mb-3">
        <label className="form-label">Enter Text</label>
        <input type="text" className="form-control" placeholder="Type something..." />
      </div>
    </div>
  );
};


export default DashboardLayout;