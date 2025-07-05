// EKYC_Preview.js
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../Config/config';
import { useSSR } from 'react-i18next';


const EKYCResultHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

   const [countdown, setCountdown] = useState(5);
  
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
          `${config.redirectBaseURL}/LayoutForm`
      );
    }
     const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          window.close();
        }
        return prev - 1;
      });
    }, 1000);



    setTimeout(() => {
      window.close();
    }, 9000);
  }, [location]);

  // Handler for the "Go Back" button
  const handleGoBack = () => {
    // navigate('/LayoutForm');
     window.close();
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>eKYC Result Received</h2>
      <p>
        Thank you! Your eKYC result is being processed. This tab will close automatically in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}.
      </p>
      <button onClick={handleGoBack} className="btn btn-primary">
        Go Back to Layout Form
      </button>
    </div>
  );
};

export default EKYCResultHandler;
