import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import bbmplogo from "./assets/bbmp.png";
import niclogo from "./assets/NIC_Logo1-01.png";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Header = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState(null);

  const handleClick = (event, menu) => {
    setAnchorEl(event.currentTarget);
    setSelectedMenu(menu);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedMenu(null);
    setSubMenuAnchorEl(null);
  };

  const menuItems = {
    0: [ // First dropdown items
      { label: 'ನಮೂನೆ ಎ/ಬಿ  ಪರಿಶೀಲನೆ', url: 'https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2Verify.aspx' },
      { label: 'ನಮೂನೆ ಎ/ಬಿ  ವೀಕ್ಷಣೆ', url: 'https://bbmpeaasthi.karnataka.gov.in/office/frmForm3_2View.aspx?formid=menu' },
      { label: 'ಆನ್ ಲೈನ್ ನಮೂನೆ ಎ/ಬಿ ಡೌನ್ಲೋಡ್', url: 'https://bbmpeaasthi.karnataka.gov.in/office/frmKhathaDownload.aspx' },
      { label: 'ಸ್ವತ್ತುಗಳನ್ನು ಹುಡುಕು', url: 'https://bbmpeaasthi.karnataka.gov.in/office/frmSearchProperties.aspx' },
      { label: 'ಆಸ್ತಿಯನ್ನು ನೋಂದಾಯಿಸಬಹುದೇ ಎಂದು ಪರಿಶೀಲಿಸಿ', url: 'https://bbmpeaasthi.karnataka.gov.in/office/frmSearchKaveriProperties.aspx' },
      { label: 'ಆಸ್ತಿಯನ್ನು ಮಾಲೀಕರ ಹೆಸರಿನಿಂದ ಹುಡುಕು', url: 'https://bbmpeaasthi.karnataka.gov.in/office/frmPropertySearchByName.aspx' },
      { label: 'ಕಾವೇರಿ ತಂತ್ರಾಂಶದಲ್ಲಿ ನೋಂಣಿಯಾಗಿರುವ ಸ್ವತ್ತುಗಳನ್ನು ಹುಡುಕು', url: 'https://bbmpeaasthi.karnataka.gov.in/office/frmSearchKaveriProp.aspx' },
      { label: 'ನಮೂನೆ-ಎ/ ನಮೂನೆ-ಬಿ ಶುಲ್ಕ ಪಾವತಿಗೆ ಚಲ್ಲನ್‌ ರಚಿಸು', url: 'https://bbmpeaasthi.karnataka.gov.in/office/BBMP_ChalanGen.aspx' },
      { label: 'ಆನ್ ಲೈನ್ ಮೂಲಕ ಆಡಳಿತಾತ್ಮಕ  ಶುಲ್ಕ (ಶೇ. 2 ಶುಲ್ಕ) ಪಾವತಿಸು', url: 'https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmOnlinePayUrl.aspx' },
      { label: 'eSwathu Draft Report', url: 'https://bbmpeaasthi.karnataka.gov.in/office/frmSearchEswathuDraftForm.aspx' },
    ],
    1: [ // Second dropdown items
      { label: 'ಡ್ಯಾಶ್ ಬೋರ್ಡ್', url: 'https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmDashBoardNew.aspx' },
      { label: 'ಅನುಮೋದನೆಗೊಂಡ ಸ್ವತ್ತುಗಳು', url: 'https://bbmpeaasthi.karnataka.gov.in/office/FrmPropertyClassification.aspx' },
      { label: 'ವಲಯವಾರು ಬಾಕಿ ಇರುವ ಸ್ವತ್ತುಗಳು', url: 'https://bbmpeaasthi.karnataka.gov.in/office/frmPropertyClassReport.aspx' },
      { label: 'ವಾರ್ಡ್ ವಾರು ಬಾಕಿ ಸ್ವತ್ತುಗಳ ವರದಿ', url: 'https://bbmpeaasthi.karnataka.gov.in/office/frmDistrictwiseProperties.aspx' },
      { label: 'ವಾರ್ಡ್ ವಾರು ಖಾತಾ ಸೇವೆಗಳ ವರದಿ', url: 'https://bbmpeaasthi.karnataka.gov.in/office/PublicReports/frmMutationDistrictwise.aspx' },
    ],
   
    2: [
      { label: 'ವಾರ್ಡ್ ಪಟ್ಟಿ',
        subMenu: [
          { label: 'ಪೂರ್ವ', url: 'https://bbmpeaasthi.karnataka.gov.in/frmBangalore1CentersbyZone.aspx?zone=East' },
        
        ]
        
       },
      {
        label: 'ಬೆಂಗಳೂರು-ಒಂದು ಕೇಂದ್ರಗಳು',
        subMenu: [
          { label: 'ಪೂರ್ವ', url: 'https://bbmpeaasthi.karnataka.gov.in/frmBangalore1CentersbyZone.aspx?zone=East' },
        
        ]
      },
      { label: 'ಪ್ರಕ್ರಿಯೆಯ ಹರಿವು', url: 'https://bbmpeaasthi.karnataka.gov.in/frmProcessFlowDisplay.aspx' }
    ]
  };

  const handleRedirect = (url) => {
    window.open(url, '_blank');
  };
  const handleRefresh = (url) => {
    window.location.href = url;
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#015454' }}>
      <Toolbar>
        <Box
          component="img"
          src={bbmplogo}
          alt="Logo"
          sx={{ width: '10rem', height: '10rem', marginRight: 2 }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
          <Typography variant="h6" fontFamily="cursive" sx={{ fontWeight: 'bold', fontSize: '2rem', textShadow: '2px 2px 4px rgba(0, 0, 0, 1)' }}>
            ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ
          </Typography>
          <Typography variant="h6" fontFamily="cursive" sx={{ fontWeight: 'bold', color: 'yellow', fontSize: '2rem', textShadow: '2px 2px 4px rgba(0, 0, 0, 1)' }}>
            ಇ-ಆಸ್ತಿ
          </Typography>
        </Box>
        <Box
          component="img"
          src={niclogo}
          alt="Logo"
          sx={{ width: '15rem', height: '5rem', marginRight: 2, backgroundColor: "#FFFFFF" }}
        />
      </Toolbar>
      
      <Toolbar sx={{ bgcolor: '#7DAAAE' }}>
  <Button color="inherit" sx={{ flexGrow: 0.1 ,fontSize:'1rem' }} onClick={() => handleRefresh('https://bbmpeaasthi.karnataka.gov.in')}>
    ಮುಖಪುಟ
  </Button>

  {[ 'ನಾಗರಿಕ ಸೇವೆಗಳು', 'ವರದಿಗಳು', 'ತಿಳಿಯಬೇಕಾದ ವಿಷಯಗಳು' ].map((item, index) => (
    <Box key={index} sx={{ flexGrow: index === 4 ? 1 : 0.1 }}>
      <Button
        aria-controls={selectedMenu === index ? 'simple-menu' : undefined}
        aria-haspopup="true"
        onClick={(e) => handleClick(e, index)}
        sx={{ color: 'white', fontFamily: 'cursive', fontSize: '1rem', display: 'flex', alignItems: 'center' }}
      >
        {item}
        <ArrowDropDownIcon sx={{ marginLeft: 0.5 }} />
      </Button>

      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={selectedMenu === index}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {menuItems[index]?.map((menuItem, idx) => (
          <div key={idx}>
            <MenuItem
              onClick={(e) => menuItem.subMenu ? setSubMenuAnchorEl(e.currentTarget) : handleRedirect(menuItem.url)}
            >
              {menuItem.label}
              {menuItem.subMenu && <ArrowDropDownIcon sx={{ marginLeft: 0.5 }} />}
            </MenuItem>

            {/* Render Sub-Menu if `subMenu` exists */}
            {menuItem.subMenu && (
              <Menu
                anchorEl={subMenuAnchorEl}
                open={Boolean(subMenuAnchorEl)}
                onClose={() => setSubMenuAnchorEl(null)}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                {menuItem.subMenu.map((subMenuItem, subIdx) => (
                  <MenuItem key={subIdx} onClick={() => handleRedirect(subMenuItem.url)}>
                    {subMenuItem.label}
                  </MenuItem>
                ))}
              </Menu>
            )}
          </div>
        ))}
      </Menu>
    </Box>
  ))}

  <Button color="inherit" sx={{ flexGrow: 0.1 ,fontSize:'1rem'}} onClick={() => handleRedirect('https://bbmptax.karnataka.gov.in/')}>
    ಆಸ್ತಿ ತೆರಿಗೆ
  </Button>

  {/* Add a Box with flexGrow for spacing */}
  <Box sx={{ flexGrow: 0.5 }} />

  <Button color="inherit" sx={{ flexGrow: 0.1 }} onClick={() => handleRefresh('https://bbmpeaasthi.karnataka.gov.in/office/frmLoginNew.aspx')}>
    Department Login
  </Button>

  <Box>
    <Button color="inherit" sx={{ flexGrow: 0.5 }} onClick={() => handleLanguageChange('en')}>
      English
    </Button>
    <Button color="inherit" sx={{ flexGrow: 0.5 }} onClick={() => handleLanguageChange('kn')}>
      ಕನ್ನಡ
    </Button>
    {/* {location.pathname !== '/' && (
      <Button color="inherit" onClick={handleLogout}>
        Logout
      </Button>
    )} */}
  </Box>
</Toolbar>

    </AppBar>
  );
};

export default Header;
