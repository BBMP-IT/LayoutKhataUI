import React, { useEffect, useState } from 'react';
import bbmpLogo from '../../assets/bbmp.png';
import Swal from "sweetalert2";
import { individualSiteListAPI } from '../../API/authService';
import { useLocation } from 'react-router-dom';

const Endorsement = () => {


  const location = useLocation();

  const { LKRS_ID, createdBy, createdName, roleID, display_LKRS_ID } = location.state || {};
  const [localLKRSID, setLocalLKRSID] = useState(LKRS_ID || "");
 
  useEffect(() => {


    if (LKRS_ID) {
      setLocalLKRSID(LKRS_ID);

      fetchSiteDetails(LKRS_ID);
    } else {
      const id = sessionStorage.getItem("LKRSID");
      if (id) setLocalLKRSID(id);
      fetchSiteDetails(id);
    }

  }, [LKRS_ID]);




  const printData = () => window.print();

  const backToDashboard = () => {
    window.location.href = "/LayoutDashboard"; // update as needed
  };

  const FnviewApplication = () => {
    const krsid = document.getElementById('krs_id')?.textContent;
    const form = document.createElement('form');
    form.action = "SubmittedApplication.aspx";
    form.method = "post";
    const input = document.createElement('input');
    input.type = "hidden";
    input.name = "b2dc5b9ee0a44e22ba9876cfad71cb95";
    input.value = krsid;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };
  const [allSites, setAllSites] = useState([]);
  const fetchSiteDetails = async (LKRS_ID) => {
    try {
      const listPayload = {
        level: 1,
        LkrsId: LKRS_ID,
        SiteID: 0,
      };
      // start_loader();
      const response = await individualSiteListAPI(listPayload);
      console.log("API Response:", response);
      if (response && Array.isArray(response) && response.length > 0) {
        const releasedSites = response.filter(site => site.sitE_IS_SITE_RELEASED === true);
        console.log("Filtered Released Sites:", releasedSites);
        setAllSites(releasedSites);
      } else {
        Swal.fire({
          text: response.responseMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Failed to insert data:", error);
    } finally {
      // stop_loader();
    }
  };


  return (
    <div className="endorsement-page" style={{ margin: 0, padding: 0 }}>
      {/* Loader */}
      <div className="modal-progress" id="loaderimg" style={{ display: 'none' }}>
        <div className="center">
          <img src="assets/img/loader.gif" alt="loading" />
        </div>
      </div>

      {/* Main Print Container */}
      <div id="PrintDIv">
        <div className="endorsement-container" style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <div style={{ border: "2px solid black", padding: 20, background: "#fff", width: "90%", maxWidth: 800, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", borderBottom: "2px solid black", paddingBottom: 10, marginBottom: 20 }}>
              <img src={bbmpLogo} alt="BBMP Logo" style={{ height: 80, marginRight: 20 }} />
              <div>
                <h1 style={{ margin: 0, fontSize: 24, textAlign: "center" }}>Bruhat Bengaluru Mahanagara Palike</h1><br />
                <h4 style={{ margin: 0, fontSize: 20, textAlign: "center", fontWeight: "bold" }}>Endorsement</h4>
              </div>
            </div>

            {/* Dynamic Labels */}
            <div className="row">
              <div style={{ width: "50%", display: "inline-block", padding: 5 }}>SAS Application No: <strong><label id="sasno" /></strong></div>
              <div style={{ width: "50%", display: "inline-block", padding: 5 }}>Temporary ePID: <strong><label id="temporary_epid" /></strong></div>
              <div style={{ width: "50%", display: "inline-block", padding: 5 }}>Khata Request Ref No: <strong><span>{display_LKRS_ID}</span></strong></div>
              <div style={{ width: "50%", display: "inline-block", padding: 5 }}>App received date: <strong><label id="app_date" /></strong></div>
            </div>

            <hr style={{ border: "1px solid black", margin: "10px 0" }} />

            {/* Dynamic Status Sections */}
            <p style={{ fontSize: 18 }}>Dear Applicant,</p>
            <div className="status14">
              <p style={{ fontSize: 18 }}>Your application for New Khata for the property in the schedule below is received successfully and Non-Transactable Provisional New Khata with temporary ePID has been generated, which you can download after upto-date payment of property tax.</p>
            </div>
            <div className="statusNot14">
              <p style={{ fontSize: 18 }}>
                Non-Transactable Provisional New Khata at{' '} <a href="https://BBMPeAasthi.Karnataka.gov.in" target="_blank" rel="noopener noreferrer">https://BBMPeAasthi.Karnataka.gov.in </a>{' '} (Using your temporary ePID) </p>
              <p style={{ fontSize: 18 }}>Pay upto-date Property Tax at <a href="https://BBMPtax.Karnataka.gov.in">https://BBMPtax.Karnataka.gov.in </a>(Using your SAS Application No. given at top)</p>
              <p style={{ fontSize: 18 }}>Your case has been referred to ARO <p>Your case has been referred to ARO <b>VASANTHANAGAR</b>, Zone <b>East</b>, ARO Address <b>BBMP OFFICES, Ground Floor, NEXT TO KSFC BUILDING, THIMMAIAH ROAD, VASANTHNAGAR, BANGALORE</b></p></p>
            </div>
            <div className='row'>
              <p style={{ fontSize: 18 }}><strong>For the following reasons/purposes:</strong> <br /></p>
              <p style={{ fontSize: 18 }}>1. BBMP will visit your property for verification.</p>
              <p style={{ fontSize: 18 }}>2. Owner Name as per the Aadhaar is not matching with the name in registered deed.</p>
              <p style={{ fontSize: 18 }}>3. Basis of A-khata Claim document is uploaded which required ARO approval.</p>
              <p style={{ fontSize: 18 }}>4. The Consumer name as per Bescom is not matching with the name in registered deed which requires ARO approval.</p>

              <p style={{ fontSize: 18 }}>
                <b>Note:</b> Please wait for verification which may take upto 60 days and do not visit anyone in ARO & BBMP office. There upon decision on <u>Final Transactable New Khata</u> will be given.
              </p>
            </div>

            {/* Disclaimers */}
            <div className="statusNot14">
              <p style={{ fontSize: 18 }}><b>This is the disclaim, clarify and bind you with the following -</b></p>
              <p style={{ fontSize: 18 }}>1. This is merely an endorsement for receiving your New Khata application.</p>
              <p style={{ fontSize: 18 }}>2. Even payment of Property Tax has been accepted as per your claims & information submitted. If any information is found false or wrong or you are found ineligible for BBMP Khata, your application shall be rejected without any liability or acceptance of any of your claims by BBMP. The property tax paid shall stand forfeited to the BBMP without any liability.</p>
              <p style={{ fontSize: 18 }}>3. In case your Property is found on Government or BBMP or any Govt Agency land at any time, your SAS Application Number and Khata (whether provisional or final) will be summarily cancelled.</p>
              <p style={{ fontSize: 18 }}>4. Any attempt to get duplicate New Khata for existing khata property will make you liable for criminal case apart from cancellation of  SAS Application Number and  Khata (if issued).</p>
              <p style={{ fontSize: 18 }}>5. Any misrepresentation or falsehood or wrongful submission makes you liable for a criminal case apart from cancellation of SAS Application Number and Khata (if issued).</p>

            </div>

            {/* Property Schedule */}
            <div>
              <span><b>Property Schedule:</b></span><br />
              <span>Zone: <label id="zone_name" /></span><br />
              <span>Ward: <label id="ward_name" /></span><br />
              <span>Category: <label id="cop" /></span><br />
              <span>Type: <label id="top" /></span><br />
              <span>ePID: <label id="epid" /></span><br />
              <span>Owner: <label id="own_name1" /></span>
            </div>

            {/* Owner Address */}
            <div className="row">
              <div style={{ width: "80%", padding: 5 }}>
                <p><strong>To:</strong></p>
                <p>Name: <label id="own_name" /><br />Address: <label id="own_add" /></p>
              </div>
              <div style={{ width: "20%", padding: 5, textAlign: "center" }}>
                <div id="qrcodeview" style={{ marginTop: 20 }}></div>
                <strong>BBMP</strong>
              </div>
            </div>
            <div className="row">
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }} border="1">
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '8px', border: '1px solid #000' }}>S.No</th>
                    <th style={{ padding: '8px', border: '1px solid #000' }}>EPID</th>
                    <th style={{ padding: '8px', border: '1px solid #000' }}>Site Number</th>
                    {/* <th style={{ padding: '8px', border: '1px solid #000' }}>Number of sides</th> */}
                    <th style={{ padding: '8px', border: '1px solid #000' }}>Dimension</th>
                    <th style={{ padding: '8px', border: '1px solid #000' }}>Total Area</th>
                    <th style={{ padding: '8px', border: '1px solid #000' }}>Order Number</th>
                    <th style={{ padding: '8px', border: '1px solid #000' }}>Order Date</th>
                    {/* <th style={{ padding: '8px', border: '1px solid #000' }}>Is Released</th> */}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const seenSiteNumbers = new Set();

                    return allSites.map((site, index) => {
                      if (seenSiteNumbers.has(site.sitE_NO)) {
                        return null; // skip duplicates
                      }
                      seenSiteNumbers.add(site.sitE_NO);

                      const totalFt = site.siteDimensions.reduce((sum, dim) => sum + dim.sitediM_SIDEINFT, 0);
                      const totalMt = site.siteDimensions.reduce((sum, dim) => sum + dim.sitediM_SIDEINMT, 0);

                      return (
                        <tr key={site.sitE_ID}>
                          <td style={{ padding: '8px', border: '1px solid #000' }}>{index + 1}</td>
                          <td style={{ padding: '8px', border: '1px solid #000' }}>{site.sitE_EPID}</td>
                          <td style={{ padding: '8px', border: '1px solid #000' }}>{site.sitE_NO}</td>
                          <td style={{ padding: '8px', border: '1px solid #000' }}>
                            {`${totalFt} [Sq.ft], ${totalMt.toFixed(2)} [Sq.mtr]`}
                          </td>
                          <td style={{ padding: '8px', border: '1px solid #000' }}>{site.sitE_AREAINSQFT} sqft</td>
                          <td style={{ padding: '8px', border: '1px solid #000' }}>-</td> {/* Placeholder for Order Number */}
                          <td style={{ padding: '8px', border: '1px solid #000' }}>-</td> {/* Placeholder for Order Date */}
                        </tr>
                      );
                    });
                  })()}
                </tbody>

              </table>
            </div>



            {/* Footer */}
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <p><strong>This is digitally generated and doesn't require a signature.</strong></p>
            </div>

            {/* Buttons */}
            <div className="row" style={{ paddingTop: 40 }}>
              <div className="col-sm-2">
                <input type="button" className="form-control btn btn-info rounded-pill" value="Print" onClick={printData} />
              </div>
              <div className="col-sm-5">
                <input type="button" className="form-control btn btn-info rounded-pill" value="Back To Dashboard" onClick={backToDashboard} />
              </div>
              <div className="col-sm-5" hidden>
                <input type="button" className="form-control btn btn-info rounded-pill" value="View Submitted Application" onClick={FnviewApplication} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Endorsement;
