import React, { useRef } from 'react';
import { Dialog, DialogContent,  Typography, } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BESCOM from "../assets/Sample_BESCOM_ACCOUNTID.jpeg"
import DeedImage from "../assets/Sample_Deed_Number.jpeg"
import ECImage from "../assets/Sample_EC_Number.jpeg"
import SASImage from "../assets/Sample_SAS_APPLICATIONNO.jpeg"
const ViewSample = ({ open, onClose,TypofImage }) => {
  const contentRef = useRef(null);
  const { t } = useTranslation();
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent dividers style={{ maxHeight: '500px' }} ref={contentRef}>
          <Typography variant="h5" gutterBottom>
            {t("Sample Image")}
          </Typography>
          {TypofImage === "BESCOM" &&
          <img
              src={BESCOM}
              alt='no images found'
              style={{
                maxWidth: '90%',  // Responsive width
                height: 'auto',    // Maintains aspect ratio
              }}
            />
}
{TypofImage === "SAS" &&
          <img
              src={SASImage}
              alt='no images found'
              style={{
                maxWidth: '90%',  // Responsive width
                height: 'auto',    // Maintains aspect ratio
              }}
            />
}
{TypofImage === "DEED" &&
          <img
              src={DeedImage}
              alt='no images found'
              style={{
                maxWidth: '90%',  // Responsive width
                height: 'auto',    // Maintains aspect ratio
              }}
            />
}
{TypofImage === "EC" &&
          <img
              src={ECImage}
              alt='no images found'
              style={{
                maxWidth: '90%',  // Responsive width
                height: 'auto',    // Maintains aspect ratio
              }}
            />
}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewSample;
