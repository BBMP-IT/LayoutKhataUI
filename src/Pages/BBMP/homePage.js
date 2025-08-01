import React, { useEffect, useState, useRef, useContext } from 'react';
import DashboardLayout, { LoaderContext }  from '../../Layout/DashboardLayout';
import Loader from '../../Layout/Loader';
import '../../Styles/CSS/Homepage.css';
const BBMP_Homepage = () => {
//  const [loading, setLoading] = useState(false);
//    const start_loader = () => {
//     setLoading(true);  
//   };

//   const stop_loader = () => {
//     setLoading(false); 
//   };

 const { loading, start_loader, stop_loader } = useContext(LoaderContext);

    return (
      
            <div className="container mt-4" >
                <div className="card shadow-sm">
                    <div className="card-header btn_color text-white">
                        <h5 className="mb-0">IMPORTANT INSTRUCTIONS</h5>
                    </div>
                    <div className="card-body">
                           {/* Main Content */}
              <div className="card-body p-4">
                {/* Introduction Cards */}
                <div className="instruction-card info-card">
                  <div className="d-flex align-items-start">
                    <span className="emoji-icon">📝</span>
                    <p className="mb-0 text-dark">
                      This is the citizen module to submit mandatory information and documents to get the final e-Khatha. 
                      A draft e-Khatha has been issued as per the existing BBMP property tax register.
                    </p>
                  </div>
                </div>

                <div className="instruction-card warning-card">
                  <div className="d-flex align-items-start">
                    <span className="emoji-icon">📝</span>
                    <p className="mb-0 text-dark">
                      A citizen can also file objections to any draft e-Khatha and the information shown therein. 
                      All objections to issuing the final e-Khatha will be suitably decided by BBMP.
                    </p>
                  </div>
                </div>

                <div className="instruction-card success-card">
                  <div className="d-flex align-items-start">
                    <span className="emoji-icon">📝</span>
                    <p className="mb-0 text-dark">
                      A citizen, in order to get the final e-Khatha, should be ready with the following information and details.
                    </p>
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="requirements-section">
                  <h5 className="section-title">Required Documents & Information</h5>
                  <br/>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="requirement-item">
                        <div className="d-flex align-items-center">
                          <div className="requirement-icon">📄</div>
                          <span className="text-dark">Ownership proof (registered deed, EC, etc.)</span>
                        </div>
                      </div>
                      
                      <div className="requirement-item">
                        <div className="d-flex align-items-center">
                          <div className="requirement-icon">👤</div>
                          <span className="text-dark">eKYC based on Aadhaar</span>
                        </div>
                      </div>
                      
                      <div className="requirement-item">
                        <div className="d-flex align-items-center">
                          <div className="requirement-icon">✅</div>
                          <span className="text-dark">Documents to prove e-Khatha</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="requirement-item">
                        <div className="d-flex align-items-center">
                          <div className="requirement-icon">💳</div>
                          <span className="text-dark">Property tax updated payment and SAS application number</span>
                        </div>
                      </div>
                      
                      <div className="requirement-item">
                        <div className="d-flex align-items-center">
                          <div className="requirement-icon">📸</div>
                          <span className="text-dark">Owner photo</span>
                        </div>
                      </div>
                      
                      <div className="requirement-item">
                        <div className="d-flex align-items-center">
                          <div className="requirement-icon">🏠</div>
                          <span className="text-dark">Property photo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                <div className="action-section">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <span className="emoji-icon">📝</span>
                    <p className="mb-0 text-dark fw-semibold">For updating e-Khatha details, please click here</p>
                  </div>
                  <button className="btn update-btn">
                    Update e-Khatha Details
                  </button>
                </div>

                {/* Contact Information */}
                <div className="contact-section">
                  <h5 className="text-white mb-4 fw-bold text-center">Need Help? Contact Us</h5>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="contact-item">
                        <div className="d-flex align-items-center">
                          <div className="contact-icon">📞</div>
                          <div>
                            <small className="text-light opacity-75">Call us</small>
                            <div className="fw-bold">9480683695</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="contact-item">
                        <div className="d-flex align-items-center">
                          <div className="contact-icon">✉️</div>
                          <div>
                            <small className="text-light opacity-75">Email us</small>
                            <div className="fw-bold">bbmpekhata@gmail.com</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                    </div>
                </div>
            </div>
            
            
            
    //         <div className="gradient-bg">
    //   <div className="container">
    //     <div className="row justify-content-center">
    //       <div className="col-lg-10 col-xl-8">
    //         <div className="card main-card">
    //           {/* Header */}
    //           <div className="header-gradient">
    //             <div className="header-content">
    //               <div className="d-flex align-items-center">
    //                 <div className="me-3">
    //                   <div style={{
    //                     width: '50px',
    //                     height: '50px',
    //                     background: 'rgba(255, 255, 255, 0.2)',
    //                     borderRadius: '12px',
    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',
    //                     fontSize: '1.5rem'
    //                   }}>
    //                     ⚠️
    //                   </div>
    //                 </div>
    //                 <h4 className="text-white mb-0 fw-bold">IMPORTANT INSTRUCTIONS</h4>
    //               </div>
    //             </div>
    //           </div>

           
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
       
    );
}

export default BBMP_Homepage;



