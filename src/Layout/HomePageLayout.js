import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import './HomePageLayout.css';
import cmlogo from '../assets/chief_minister_of_karrnataka_icon.png';
import dcmlogo from '../assets/DeputyCM.jpeg';
import gokLogo from '../assets/gok.png';
import bbmplogo from '../assets/bbmp.png';
import digital_logo from '../assets/digital_india.png';
import { useTranslation } from "react-i18next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { toast, Toaster } from 'react-hot-toast';
import Swal from "sweetalert2";
import config from '../Config/config';

const HomePageLayout = ({ children }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'kn';
  const [language, setLanguage] = useState('kn');
  const navbarRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    sessionStorage.setItem("selectedLanguage", newLang);

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

        navigate("/Login", { replace: true });
      }
      // If cancelled, do nothing
    });
  };


  

  return (
    <div className="App">
      <Toaster toastOptions={{ duration: 4000, style: { fontSize: '14px', padding: '16px 24px', minWidth: '300px', textAlign: 'center', }, }} position="bottom-right" />
      <div className="page">
        <div className="page-main">

          <div className="header py-1">
            <div className="container-fluid">
              {/* Mobile View */}
              <div className="d-block d-md-none mobile-header text-white px-3 mb-2">
                <h5 className="mb-3  text-center">{ t('translation.navbar.header.BBMPFullform') }</h5>
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <img src={cmlogo} alt="CM" width={60} height={60} className="rounded-circle bg-white p-1" />
                    <div className="fw-bold mt-2">{t('translation.navbar.header.CMName')}</div>
                    <small className="badge bg-secondary mt-1">{ t('translation.navbar.header.CMTitle') }</small>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="rounded-circle bg-white d-flex align-items-center justify-content-center mx-auto" style={{ width: 60, height: 60, overflow: 'hidden' }}>
                      <img src={dcmlogo} alt="DCM" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="fw-bold mt-2">{ t('translation.navbar.header.DCMName') }</div>
                    <small className="badge bg-secondary mt-1">{ t('translation.navbar.header.DCMTitle') }</small>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="rounded-circle bg-white d-flex align-items-center justify-content-center mx-auto" style={{ width: 60, height: 60, overflow: 'hidden' }}>
                      <img src={gokLogo} alt="GOK" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="fw-bold mt-2">{ t('translation.navbar.header.GOK') }</div>
                  </div>
                  <div className="col-6 mb-3">
                    <img src={bbmplogo} alt="BBMP" width={60} height={60} className="rounded-circle bg-white p-1" />
                    <div className="fw-bold mt-2">{ t('translation.navbar.header.bbmp') }</div>
                  </div>

                </div>
              </div>

              {/* Desktop View */}
              <div className="row text-center align-items-center d-none d-md-flex">
                <div className="col-md-2 mb-3">
                  <img src={cmlogo} alt="CM" width={80} height={80} className="rounded-circle bg-white p-1" />
                  <div className="fw-bold text-white mt-2">{t('translation.navbar.header.CMName')}</div>
                  <div className="badge bg-secondary mt-1">{t('translation.navbar.header.CMTitle')}</div>
                </div>
                <div className="col-md-2 mb-3">
                  <div className="rounded-circle bg-white d-flex align-items-center justify-content-center mx-auto" style={{ width: 85, height: 85, overflow: 'hidden' }}>
                    <img src={gokLogo} alt="GOK" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="fw-bold text-white mt-2">{ t('translation.navbar.header.GOK') }</div>
                </div>
                <div className="col-md-4 mb-3">
                  <h2 className="text-white">{ t('translation.navbar.header.BBMPFullform') }</h2>
                </div>
                <div className="col-md-2 mb-3">
                  <img src={bbmplogo} alt="BBMP" width={80} height={80} className="rounded-circle bg-white p-1" />
                  <div className="fw-bold text-white mt-2">{ t('translation.navbar.header.bbmp') }</div>
                </div>
                <div className="col-md-2 mb-3">
                  <div className="rounded-circle bg-white d-flex align-items-center justify-content-center mx-auto" style={{ width: 85, height: 85, overflow: 'hidden' }}>
                    <img src={dcmlogo} alt="DCM" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="fw-bold text-white mt-2">{ t('translation.navbar.header.DCMName') }</div>
                  <div className="badge bg-secondary mt-1">{ t('translation.navbar.header.DCMTitle') }</div>
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
                <div className="ms-auto d-flex align-items-center">
                 

                  {/* <button
                    className="btn btn-sm"
                    style={{ backgroundColor: "#fff", color: "#023e8a" }}
                    onClick={handleLogout}
                  >
                    <i className="fa fa-sign-out"></i>
                  </button> */}
                  &nbsp;

                

                  <div className="d-flex">
                    <button
                      onClick={() => handleLanguageChange({ target: { value: 'kn' } })}
                      className={`px-4 py-2 rounded ${setLanguage === 'kn' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                    >
                      ಕನ್ನಡ
                    </button>&nbsp;
                    <button
                      onClick={() => handleLanguageChange({ target: { value: 'en' } })}
                      className={`px-4 py-2 rounded ${setLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                    >
                      English
                    </button>
                  </div>&nbsp;&nbsp;
                   <button
                    className="btn"
                    style={{ backgroundColor: "#fff", color: "#023e8a" }}
                    onClick={() => window.location.href = config.citizenServicesURL.login}
                  >
                    <i className="fas fa-sign-in-alt"></i> Login
                  </button>
                  &nbsp;
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

  );
}
const FloatingButton = ({ onClick }) => {
  return (
    <button className="floating-button" onClick={onClick}>
      <i className="fa fa-home"></i>
    </button>
  );
};


export default HomePageLayout;