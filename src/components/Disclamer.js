import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, Box ,CircularProgress} from '@mui/material';
import Switch from '@mui/material/Switch';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../components/Axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const DisclaimerDialog = ({ open, onClose, onAgree }) => {
  const contentRef = useRef(null);
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfEndorsmentUrl, setEndorsmentPdfUrl] = useState('');
  const navigate = useNavigate();
  const handleAgree = () => {
    if (isAgreed) {
      setConfirmOpen(true);
    } else {
      alert("Please Agree that you Understand");
    }
  };

  const handleSwitchChange = () => {
    setIsAgreed(!isAgreed); 
  };

  const fetchAcknowedgeMentPdf = async () => {
    try {
      debugger
      //for saving Matrix Details
      const response1 = await axiosInstance.get(`Report/FinalSubmitValidation?propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&LoginId=crc`,)
      if(response1.data === "SUCCESS")
      {
      
        setLoading(true)
      const response = await axiosInstance.get(
        `Report/GetFinalBBMPReport?propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&LoginId=crc`,
        {
          responseType: 'blob', 
        }
      );

      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setPdfUrl(pdfUrl);
      setLoading(false) 
      toast.success(`${t("Please Download the Acknowlegement for Future Reference")}`)
    }else {
      toast.error(response1.data)
    }
    } catch (error) {
      console.error("Error fetching PDF: ", error);
      setLoading(false)
    }
  };
  const RedirectBack = () => {
    localStorage.removeItem("P_BOOKS_PROP_APPNO");
    localStorage.removeItem("SETPROPERTYCODE");
    localStorage.removeItem("SETPROPERYID");
    localStorage.removeItem("DraftZoneId");
    localStorage.removeItem("DraftWardId");
    localStorage.setItem("userProgress", 1);    
    navigate("/BBDDraftGenerated")
  } 
  const fetchEndorsmentPdf = async () => {
    try {
      //for saving Matrix Details
      setLoading(true)
      const response = await axiosInstance.get(
        `Report/GetEndorsementReport?propertycode=${JSON.parse(localStorage.getItem('SETPROPERTYCODE'))}&BOOKS_PROP_APPNO=${JSON.parse(localStorage.getItem('P_BOOKS_PROP_APPNO'))}&LoginId=crc`,
        {
          responseType: 'blob', 
        }
      );

      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
setPdfUrl("")
      setEndorsmentPdfUrl(pdfUrl); 
      setLoading(false)
      toast.success(`${t("Please Download the Endorsment Document For Future Reference")}`)
    } catch (error) {
      console.error("Error fetching PDF: ", error);
      setLoading(false)
    }
  };
// const onEsign = async () => {
//   debugger
//  navigate("/ESignPage")
//   // Redirecting to the URL received from the API

// }
const onDownloadEndorsment = async () => {
  debugger
  fetchEndorsmentPdf()
 

}

  const handleConfirmYes = () => {
   
    fetchAcknowedgeMentPdf();
    setIsAgreed(false);
    setConfirmOpen(false);
    onClose(); 
  };

  const handleConfirmNo = () => {
    setConfirmOpen(false);
    onClose(); 
  };
  function GradientCircularProgress() {
    return (
      <React.Fragment>
        <svg width={0} height={0}>
          <defs>
            <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e01cd5" />
              <stop offset="100%" stopColor="#1CB5E0" />
            </linearGradient>
          </defs>
        </svg>
        <CircularProgress sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
      </React.Fragment>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <GradientCircularProgress />
      </Box>
    );
  }
  return (
    <>
     
      <Dialog open={confirmOpen} onClose={handleConfirmNo} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h5">{t("disclamerMessage1")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmYes} color="primary">{t("Yes")}</Button>
          <Button onClick={handleConfirmNo} color="secondary">{t("No")}</Button>
        </DialogActions>
      </Dialog>

   
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogContent dividers style={{ maxHeight: '500px' }} ref={contentRef}>
          <Typography variant="h3" gutterBottom>
            {t("disclamer")}
          </Typography>
          <Typography variant="h5">
            <ol>
              <li>{t("disclamerMessage2")}</li>
              <li>{t("disclamerMessage3")}</li>
              <li>{t("disclamerMessage4")}</li>
              <li>{t("disclamerMessage5")}</li>
              <li>{t("disclamerMessage6")}</li>
              <li>{t("disclamerMessage7")}</li>
              <li>{t("disclamerMessage11")}</li>
              <li>{t("disclamerMessage12")}</li>
              <li>{t("disclamerMessage13")}</li>
              <li>{t("disclamerMessage14")}</li>
            
            </ol>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch checked={isAgreed} color="warning" onChange={handleSwitchChange} />
            <Typography variant="h5" sx={{ marginLeft: 1 }}>
              {t("disclamerMessage8")}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button onClick={handleConfirmNo} color="primary" style={{ float: 'left' }}>
              {t("disclamerMessage10")}
            </Button>
            <Button onClick={handleAgree} disabled={!isAgreed} color="primary" style={{ float: 'right' }}>
              {t("disclamerMessage9")}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* PDF Viewer */}
      {pdfUrl && (
        <Dialog open={Boolean(pdfUrl)} onClose={() => setPdfUrl('')} maxWidth="md" fullWidth>
          <DialogContent>
            <iframe src={pdfUrl} width="100%" height="600px" title="PDF Viewer"></iframe>
          </DialogContent>
        
          <DialogActions>
          {/* <Button onClick={() => onEsign()} color="primary">
              E-Sign
            </Button> */}
              <Button onClick={() => onDownloadEndorsment()} color="primary">
              Download Endorsement
            </Button> 
            <Button onClick={() => setPdfUrl('')} color="primary">
              Close PDF
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {pdfEndorsmentUrl && (
        <Dialog open={Boolean(pdfEndorsmentUrl)} onClose={() => setEndorsmentPdfUrl('')} maxWidth="md" fullWidth>
          <DialogContent>
            <iframe src={pdfEndorsmentUrl} width="100%" height="600px" title="PDF Viewer"></iframe>
          </DialogContent>
        
          <DialogActions>
          
            <Button onClick={() => RedirectBack()} color="primary">
              Finish
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default DisclaimerDialog;
