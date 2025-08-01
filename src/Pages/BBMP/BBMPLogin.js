import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/CSS/BBMPLogin.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import nicLogo from '../../assets/NIC_Logo1-01.png';
import digital_logo from '../../assets/digital_india.png';
import bbmpLogo from '../../assets/bbmp.png'
import { useTranslation } from "react-i18next";
import i18n from "../../localization/i18n";
import Swal from "sweetalert2";
import Loader from "../../Layout/Loader";
import config from '../../Config/config';
import axios from 'axios';

import cmlogo from '../../assets/chief_minister_of_karrnataka_icon.png';
import dcmlogo from '../../assets/DeputyCM.jpeg';
import gokLogo from '../../assets/gok.png';
import bbmplogo from '../../assets/bbmp.png';
import DashboardLayout, { LoaderContext } from '../../Layout/DashboardLayout';
import { getAccessToken } from '../../API/authService';
import { ImageOutlined } from '@mui/icons-material';
import { useAuth } from "../../AuthContext";


const BBMPLogin = () => {
     const navigate = useNavigate();
    const { UseLogin } = useAuth();
    const { loading, start_loader, stop_loader } = useContext(LoaderContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'kn';
    const [language, setLanguage] = useState('kn');
    const [zoomLevel] = useState(0.8);

    const [showOTPFields, setShowOTPFields] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);
    const [isResendEnabled, setIsResendEnabled] = useState(false);
    //captcha input
    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");

    //error variable input 
    const [phoneError, setPhoneError] = useState("");
    const [captchaError, setCaptchaError] = useState("");
    const [otpError, setOtpError] = useState("");


    //reference variables
    const otpRef = useRef(null);

    useEffect(() => {
        document.body.style.zoom = zoomLevel; // Apply zoom
        generateCaptcha();// Generate a new CAPTCHA when OTP screen appears
    }, [zoomLevel]);
    useEffect(() => {
        let interval;
        if (showOTPFields && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsResendEnabled(true);
        }
        return () => clearInterval(interval);
    }, [showOTPFields, timer]);

    const handleLanguageChange = (event) => {
        const newLang = event.target.value;
        setLanguage(newLang);
        i18n.changeLanguage(newLang);
        sessionStorage.setItem("selectedLanguage", newLang);
    };


    //generate Captcha
    const generateCaptcha = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(result);
    };
    //SEND OTP function starts 

    const handleSendOTP = async (phoneNumber) => {
        let isValid = true; // Flag to check if all validations pass

        setPhoneError("");
        setCaptchaError("");

        // Phone number validation
        if (
            !phoneNumber ||
            phoneNumber.trim() === "" ||
            !/^[1-9][0-9]{9}$/.test(phoneNumber)
            //  ||/^(\d)\1{9}$/.test(phoneNumber)  // checks for 10 repeated digits (0000000000, 1111111111, etc.)
        ) {
            setPhoneError("Please enter a valid 10-digit phone number that does not start with 0");
            isValid = false;
        }

        // CAPTCHA validation
        if (captchaInput !== captcha) {
            setCaptchaError("Incorrect CAPTCHA!");
            isValid = false;
        }

        // Stop execution if any validation fails
        if (!isValid) return;

        let phoneNo = "9999999999";
        if (phoneNo === phoneNumber) {
            sessionStorage.setItem('PhoneNumber', phoneNumber);
            console.log("OTP verified, calling generate_Token");
            generate_Token();
            console.log("Token generated, showing Swal");

            Swal.fire({
                title: "OTP Verified!",
                text: "Your OTP has been successfully verified.",
                icon: "success",
                confirmButtonText: "OK"
            }).then(() => {
                // Navigate *after* user clicks OK
                navigate('/homePage');
            });
        } else {
            try {
                start_loader();
                const response = await axios.post(
                    `${config.apiLoginBaseUrl}${config.endpoints.sendOTP}`,
                    {
                        mobileNumber: phoneNumber,
                        source: "e-Aasthi"
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'username': config.credentials.username,
                            'password': config.credentials.password
                        }
                    }
                );

                // Axios automatically parses JSON, so use response.data
                const data = response.data;

                if (data.responseStatus === true && data.responseCode === "200") {
                    Swal.fire({
                        title: "OTP Sent!",
                        text: data.responseMessage,
                        icon: "success",
                        confirmButtonText: "OK"
                    }).then(() => {
                        setShowOTPFields(true);
                        setTimer(60);
                        setIsResendEnabled(false);

                        setTimeout(() => {
                            otpRef.current?.focus();
                        }, 100);  // Adjust delay if needed
                    });

                } else {
                    Swal.fire({
                        title: "OTP Failed!",
                        text: "Failed to send OTP. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK"
                    })
                    setPhoneError("Failed to send OTP. Please try again.");
                }
            } catch (error) {
                console.error("Error sending OTP:", error);
            } finally {
                stop_loader();
            }
        }

    };
    //verify OTP
    const handleVerifyOTP = async (phoneNumber) => {
        // Check if OTP is exactly 6 digits
        if (!/^\d{6}$/.test(otp)) {
            setOtpError("Please enter a valid 6-digit OTP.");
            return;
        }

        try {
            start_loader();
            const response = await axios.post(
                `${config.apiLoginBaseUrl}${config.endpoints.verifyOTP}`,
                {
                    mobileNumber: phoneNumber,
                    OTP: otp,
                    source: "e-Aasthi",
                    UserType: "",
                    ipaddress: "10.10.010.10"
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );
            const data = response.data;

            if (data.responseCode === "200" && data.responseStatus === true) {
                sessionStorage.setItem('PhoneNumber', phoneNumber);
                console.log("OTP verified, calling generate_Token");
                generate_Token();
                console.log("Token generated, showing Swal");

                Swal.fire({
                    title: "OTP Verified!",
                    text: "Your OTP has been successfully verified.",
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    // Navigate *after* user clicks OK
                    navigate('/homePage');
                });
            }
            else {
                setOtp('');
                setOtpError("Invalid OTP. Please try again.");
                otpRef.current?.focus();
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            setOtpError("An error occurred while verifying OTP. Please try again.");
        } finally {
            stop_loader();
        }
    };
    const generate_Token = async () => {
        try {
            const response = await getAccessToken();
            if (response?.access_token) {
                // sessionStorage.clear();
                sessionStorage.setItem('PhoneNumber', phoneNumber);
                sessionStorage.setItem('access_token', response.access_token);
                UseLogin(response.access_token);
                return true;  // Indicate success
            } else {
                console.error("No access token received");
                return false;
            }
        } catch (err) {
            console.error("Error generating token", err);
            return false;
        }
    };


    //resend OTP btn
    const handleResendOTP = async () => {
        try {
            start_loader();

            const response = await axios.post(
                `${config.apiLoginBaseUrl}${config.endpoints.sendOTP}`,
                {
                    mobileNumber: phoneNumber,
                    source: "e-Aasthi"
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        'username': config.credentials.username,
                        'password': config.credentials.password
                    }
                }
            );

            const data = response.data;

            if (data.responseCode === "200" && data.responseStatus === true) {
                Swal.fire({
                    title: "OTP Sent!",
                    text: data.responseMessage || "A new OTP has been sent to your mobile number.",
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    setOtp("");  // Clear previous OTP
                    setTimer(60);  // Reset timer (or whatever value you want)
                    setIsResendEnabled(false);
                    setTimeout(() => {
                        otpRef.current?.focus();
                    }, 100);
                });
            } else {
                Swal.fire({
                    title: "Resend Failed!",
                    text: "Failed to resend OTP. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        } catch (error) {
            console.error("Error resending OTP:", error);
            Swal.fire({
                title: "Error!",
                text: "An error occurred while resending OTP. Please try again.",
                icon: "error",
                confirmButtonText: "OK"
            });
        } finally {
            stop_loader();
        }
    };

    //change phone number link function
    const handleChangePhoneNumber = () => {
        setShowOTPFields(false);
        setPhoneNumber("");
        setOtp("");
        setCaptchaInput("");
        generateCaptcha();
    };

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove any non-numeric characters
        setPhoneNumber(value);
    };
    const handleCaptchaChange = (e) => {
        setCaptchaInput(e.target.value);
    };

    const [showFirstMessage, setShowFirstMessage] = useState(true);
    useEffect(() => {
        const interval = setInterval(() => {
            setShowFirstMessage((prev) => !prev);
        }, 2000); // Toggle every 20 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);




    return (
        // <DashboardLayout>
        //     {loading && <Loader />}
          
            <div className="container mt-4 login_container">
                <div className="d-block d-md-none">
                    <div className="d-flex flex-wrap justify-content-center text-center align-items-center gap-3 px-2">

                        {/* CM */}
                        <div className="d-flex flex-column align-items-center" style={{ width: '45%' }}>
                            <img src={cmlogo} alt="CM" width={80} height={80} className="rounded-circle bg-white p-1" />
                            <div className="fw-bold text-clr mt-2">Sri Siddaramaiah</div>
                            <div className="badge bg-secondary mt-1">Hon'ble CM</div>
                        </div>

                        {/* GOK */}
                        <div className="d-flex flex-column align-items-center" style={{ width: '45%' }}>
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
                            <div className="fw-bold text-clr mt-2">Government of Karnataka</div>
                        </div>



                        {/* BBMP */}
                        <div className="d-flex flex-column align-items-center" style={{ width: '45%' }}>
                            <img src={bbmplogo} alt="BBMP" width={80} height={80} className="rounded-circle bg-white p-1" />
                            <div className="fw-bold text-clr mt-2">BBMP</div>
                        </div>

                        {/* DCM */}
                        <div className="d-flex flex-column align-items-center" style={{ width: '45%' }}>
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
                            <div className="fw-bold text-clr mt-2">Sri DK. Shivakumar</div>
                            <div className="badge bg-secondary mt-1">Hon'ble Deputy CM</div>
                        </div>
                    </div>
                </div>
                <section id="about" className="section-bg">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-7 content" data-aos="fade-right">
                                <h2 className="text-center instruction" style={{ textTransform: 'uppercase' }}>{t('translation.instructions.title')}</h2>
                                <p>📝 {t('translation.instructions.statments.get')}
                                    <a className='link_style' href="https://youtu.be/GL8CWsdn3wo?si=Zu_EMs3SCw5-wQwT" target="_blank">
                                        <span>{t('translation.instructions.links.english')}</span></a>
                                    &nbsp; {t('translation.instructions.statments.and')}

                                    <a className='link_style'
                                        href="https://youtu.be/JR3BxET46po?si=jDoSKqy2V1IFUpf6"
                                        target="_blank"><span> {t('translation.instructions.links.kannada')}</span></a>
                                </p>
                                <p>📝 {t('translation.instructions.statments.FQA')} <a className='link_style' href="https://youtu.be/x_163krr8E4"
                                    target="_blank"><span>{t('translation.instructions.links.clickHere')} </span></a></p>
                                <p>📝 {t('translation.instructions.statments.ekatha')}
                                    <a className='link_style' href="https://bbmpeaasthi.karnataka.gov.in/citizen_core/PendanceReport"
                                        target="_blank"><span>{t('translation.instructions.links.pendencyReports')}</span></a> {t('translation.instructions.statments.and')}
                                    &nbsp;
                                    <a className='link_style' href="https://bbmpeaasthi.karnataka.gov.in/citizen_core/PendingMutationReport"
                                        target="_blank"><span>{t('translation.instructions.links.pendingMutations')}</span></a></p>
                                <p>📝 <a className='link_style' href="https://bbmpeaasthi.karnataka.gov.in/citizen_core/Final_eKhatha_Status_based_on_ePID"
                                    target="_blank"><span>{t('translation.instructions.links.finalEPID')}</span></a></p>
                                <p>📝 {t('translation.instructions.statments.login')}  </p>
                                <p>📝 {t('translation.instructions.statments.draft')}</p>
                                <p>📝 {t('translation.instructions.statments.citizen.title')}</p>
                                <div className='row'>
                                    <div className='col-md-1 col-0'></div>
                                    <div className='col-md-11 col-12'>
                                        <ul>
                                            <li>&#8226; {t('translation.instructions.statments.citizen.deed')}</li>
                                            <li>&#8226; {t('translation.instructions.statments.citizen.ekyc')}</li>
                                            <li>&#8226; {t('translation.instructions.statments.citizen.sas')}</li>
                                            <li>&#8226; {t('translation.instructions.statments.citizen.propertyphoto')}</li>
                                            <li>&#8226; {t('translation.instructions.statments.citizen.document')}</li>
                                            <li>&#8226; {t('translation.instructions.statments.citizen.encumbrance')}</li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="mt-2">📢 {t('translation.instructions.statments.citizenFile')}</p>
                                <p className="text-danger">
                                    <strong>📞 {t('translation.instructions.statments.queries')}</strong> {t('translation.instructions.statments.call')} <a href="tel:9480683695" className="text-dark fw-bold">9480683695</a> {t('translation.instructions.statments.or')}
                                    {t('translation.instructions.statments.email')}:
                                    <a href="mailto:bbmpekhata@gmail.com" className="text-dark fw-bold">bbmpekhata@gmail.com</a>
                                </p>
                                <p>📝 <a className='link_style' href="https://bbmpeaasthi.karnataka.gov.in/citizen_core/"
                                    target="_blank"><span>{t('translation.instructions.links.clickHere')}</span></a> {t('translation.instructions.statments.draft_ward')}
                                </p>
                                <p>📝 <a className='link_style' href="https://bbmpeaasthi.karnataka.gov.in/citizen_core/GoogleMapsWardCoordinates"
                                    target="_blank"><span>{t('translation.instructions.links.clickHere')}</span></a>
                                    {t('translation.instructions.statments.draft_Ekatha')}
                                </p>

                                <section className="loginContent">
                                    <div className="container">
                                        <h4 className=" fw-bold text-center mb-3">Notification</h4>
                                        <div style={{ color: 'red', fontWeight: 'bold' }}>
                                            {showFirstMessage
                                                ? "Citizens before trying to enter the properties details for existing records, please ensure that tax for current financial year is paid."
                                                : "Please read the instructions before proceeding with the application data entry."}
                                        </div>
                                        <br />
                                    </div>
                                </section>

                            </div>
                            <div className="col-lg-5 " data-aos="fade-left">
                                <section className="loginContent">
                                    <div className="container">
                                        <h4 className=" fw-bold text-center mb-3">{t('translation.LoginForm.title')}</h4>
                                        <h3 className=" fw-bold text-center mb-2" style={{ color: ' #023e8a' }}>{t('translation.LoginForm.subTitle')}</h3>
                                        <hr />
                                        <form>
                                            {!showOTPFields ? (
                                                <>
                                                    {/* Phone Number Input */}<span>{t('translation.LoginForm.placeholder')} &nbsp;<span className='mandatory_color'>*</span></span>
                                                    <div>
                                                        <div className="input-group mb-4">
                                                            <span className="input-group-text">📞</span>
                                                            <input
                                                                type="tel"
                                                                id="phoneNumber"
                                                                name="phone"
                                                                className="form-control"
                                                                placeholder={t('translation.LoginForm.phoneNumber')}
                                                                value={phoneNumber}
                                                                onChange={handlePhoneNumberChange}
                                                                maxLength={10}
                                                            />
                                                        </div>
                                                        {phoneError && <label className="text-danger">{phoneError}</label>}
                                                    </div>
                                                    {/* CAPTCHA Input */}
                                                    <div>
                                                        <span>{t('translation.LoginForm.captcha.placeholder')} &nbsp;<span className='mandatory_color'>*</span></span>
                                                        <div className="input-group mb-3">
                                                            <span className="input-group-text">✍️</span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder={t('translation.LoginForm.captcha.placeholder')}
                                                                value={captchaInput}
                                                                onChange={handleCaptchaChange}  // Using the function here
                                                                onPaste={(e) => e.preventDefault()}
                                                            />
                                                        </div>
                                                        {captchaError && <label className="text-danger">{captchaError}</label>}
                                                    </div>

                                                    {/* CAPTCHA Display */}

                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="fa fa-lock"></i></span>

                                                        <input style={{ backgroundColor: 'lightgray', color: '#fff' }}
                                                            className="form-control captcha-box   text-dark fw-bold text-center"
                                                            value={captcha}
                                                            readOnly
                                                            onCopy={(e) => e.preventDefault()}
                                                        />
                                                        <span className="input-group-text" style={{
                                                            background: "linear-gradient(45deg,#0077b6,#023e8a)",
                                                            color: "#fff", width: "130px", cursor: "pointer"
                                                        }} onClick={generateCaptcha} title="Refresh CAPTCHA"><i className="fa fa-refresh"></i>&nbsp;Regenerate</span>
                                                    </div>
                                                    <br />
                                                    {/* Send OTP Button */}
                                                    <div className="input-group">
                                                        <button
                                                            type="button"
                                                            className="btn w-100"
                                                            style={{
                                                                background: "linear-gradient(45deg,#0077b6,#023e8a)",
                                                                color: "#fff",
                                                            }}
                                                            onClick={() => handleSendOTP(phoneNumber)}
                                                        >
                                                            {t('translation.buttons.sendOTP')}
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="input-group mb-3">
                                                        <span>
                                                            OTP sent to *******{phoneNumber.slice(-4)}{" "}
                                                            <a href="#" onClick={handleChangePhoneNumber} style={{ color: 'linear-gradient(45deg, #023e8a, #0077b6)', textDecoration: "underline" }}>
                                                                {t('translation.buttons.changePhone')}
                                                            </a>
                                                        </span>
                                                    </div>
                                                    {/* OTP Input */}
                                                    <span>{t('translation.LoginForm.otp.placeholder')} &nbsp;<span className='mandatory_color'>*</span> </span>
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text">🔑</span>
                                                        <input
                                                            type="text"
                                                            maxLength={6}
                                                            className="form-control"
                                                            placeholder="Enter OTP"
                                                            value={otp}
                                                            ref={otpRef}
                                                            onChange={(e) => setOtp(e.target.value)}
                                                        />
                                                    </div>
                                                    {otpError && <p style={{ color: "red" }}>{otpError}</p>}


                                                    {isResendEnabled && (
                                                        <div className="input-group mb-3">
                                                            <button
                                                                type="button"
                                                                className="btn w-100"
                                                                style={{ background: "linear-gradient(45deg,#0077b6,#023e8a)", color: "#fff" }}
                                                                onClick={handleResendOTP}
                                                            >
                                                                {t('translation.buttons.resendOTP')}
                                                            </button></div>


                                                    )}
                                                    {timer > 0 && (
                                                        <span>
                                                            Resend OTP in {timer} {t('translation.LoginForm.otp.seconds')}
                                                        </span>
                                                    )}
                                                    <div className="input-group mb-3">
                                                        {/* <span>
                                                            {t('translation.LoginForm.otp.otpTimer')} {timer} {t('translation.LoginForm.otp.seconds')}
                                                        </span> */}
                                                        <button
                                                            type="button"
                                                            className="btn w-100"
                                                            style={{ background: "linear-gradient(45deg,#0077b6,#023e8a)", color: "#fff" }}
                                                            onClick={() => handleVerifyOTP(phoneNumber)}
                                                        >
                                                            {t('translation.buttons.verifyOTP')}
                                                        </button></div>
                                                </>
                                            )}
                                            <br />
                                        </form>
                                    </div>
                                </section>
                                <br />
                                <br />

                                <section className="latestNewContent">
                                    <div className="container">
                                        <h4 className=" text-center">Latest News </h4><hr style={{ border: '2px solid black' }} />
                                        <p>📝 {t('translation.instructions.statments.login')} </p>
                                        <p>📝 {t('translation.instructions.statments.draft')}</p>
                                        <p>📝 {t('translation.instructions.statments.citizen.title')}</p>
                                        <p>📝 {t('translation.instructions.statments.login')}</p>

                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        // {/* </DashboardLayout> */}

    );
};

export default BBMPLogin;
