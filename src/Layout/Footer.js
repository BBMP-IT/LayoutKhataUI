import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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


const Footer = () => {
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

  const toggleDropdownOne = () => {
    setIsDropdownOneOpen(!isDropdownOneOpen);
    setIsDropdownTwoOpen(false); // close the other one
  };

  const toggleDropdownTwo = () => {
    setIsDropdownTwoOpen(!isDropdownTwoOpen);
    setIsDropdownOneOpen(false); // close the other one
  };



  return (
    <div className="App">
      <Toaster toastOptions={{ duration: 4000, style: { fontSize: '14px', padding: '16px 24px', minWidth: '300px', textAlign: 'center', }, }} position="bottom-right" />
      <div className="page">
        <div className="page-main">

         

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


export default Footer;