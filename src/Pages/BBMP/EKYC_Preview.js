// EKYCResultHandler.js
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../Config/config';


const EKYCResultHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract query params (e.g., ?status=success&token=xyz)
   const params = new URLSearchParams(location.search);
  const txnno = params.get('txnno');
  const txndatetime = params.get('txndatetime');
  const status = params.get('status');
  const vaultrefno = params.get('vaultrefno');
console.log({ txnno, txndatetime, status, vaultrefno });
    // Communicate result to opener tab (main app)
    if (window.opener) {
      // window.opener.postMessage({ ekycStatus: status, ekycToken: token }, "http://localhost:3001/LayoutForm");
      window.opener.postMessage(
        {
          ekycTxnNo: txnno,
          ekycTxnDateTime: txndatetime,
          ekycStatus: status,
          ekycVaultRefNo: vaultrefno
        },
          `${config.redirectBaseURL}/layoutForm`
      );
    }

    setTimeout(() => {
      window.close();
    }, 1000);
  }, [location]);

  // Handler for the "Go Back" button
  const handleGoBack = () => {
    navigate('/LayoutForm');
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>eKYC Result Received</h2>
      <p>Thank you! Your eKYC result is being processed. You may close this tab or go back to the Layout Form page.</p>
      <button onClick={handleGoBack} className="btn btn-primary">
        Go Back to Layout Form
      </button>
    </div>
  );
};

export default EKYCResultHandler;
