import React, { useEffect } from 'react';
import bbmpLogo from '../../assets/bbmp.png';
// ... import other CSS files if needed

const Endorsement = () => {
  useEffect(() => {
    // Cache buster script load
    const script = document.createElement('script');
    script.src = `TaxScripts/endorsement.js?cb=${Math.round(new Date().getTime() / 1000)}`;
    script.async = true;
    document.body.appendChild(script);

    // Disable back
    window.history.forward();
    window.onunload = function () { };

    // Disable copy/paste
    const preventActions = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", preventActions);
    document.addEventListener("copy", e => e.preventDefault());
    document.addEventListener("cut", e => e.preventDefault());
    document.addEventListener("paste", e => e.preventDefault());

    return () => {
      document.removeEventListener("keydown", preventActions);
    };
  }, []);

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
                <h1 style={{ margin: 0, fontSize: 24, textAlign: "center" }}>Bruhat Bengaluru Mahanagara Palike</h1><br/>
                <h4 style={{ margin: 0, fontSize: 20, textAlign: "center", fontWeight: "bold" }}>ENDORSEMENT</h4>
              </div>
            </div>

            {/* Dynamic Labels */}
            <div className="row">
              <div style={{ width: "50%", display: "inline-block", padding: 5 }}>SAS Application No: <strong><label id="sasno" /></strong></div>
              <div style={{ width: "50%", display: "inline-block", padding: 5 }}>Temporary ePID: <strong><label id="temporary_epid" /></strong></div>
              <div style={{ width: "50%", display: "inline-block", padding: 5 }}>Khata Request Ref No: <strong><label id="krs_id" /></strong></div>
              <div style={{ width: "50%", display: "inline-block", padding: 5 }}>App received date: <strong><label id="app_date" /></strong></div>
            </div>

            <hr style={{ border: "1px solid black", margin: "10px 0" }} />

            {/* Dynamic Status Sections */}
            <p>Dear Applicant,</p>
            <div className="status14">
              <p>Your property location for the scheduled property is reported to be on government/ BBMP/ Govt Agency land...</p>
              <p>...concerned ARO <b><label id="aro_name1" /></b>, Zone <b><label id="zone_name2" /></b>...</p>
            </div>
            <div className="statusNot14">
              <p>Your application for New Khata is received successfully...</p>
              <p>Visit <a href="https://BBMPeAasthi.Karnataka.gov.in">BBMPeAasthi Portal</a></p>
              <p>Pay Tax: <a href="https://BBMPtax.Karnataka.gov.in">BBMP Tax Portal</a></p>
            </div>

            {/* Disclaimers */}
            <div className="statusNot14">
              <p><b>This is to disclaim and clarify:</b></p>
              <p>1. This is merely an endorsement...</p>
              <p>2. Even payment of tax is not a guarantee...</p>
              {/* Other disclaimers */}
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
              <div className="col-sm-5">
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
