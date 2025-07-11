// src/Routes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import PropertyList from './Pages/BBDDraft';
import ObjectorsPage from './Pages/ObjectorsPage';
import PendanceReport from './Pages/PendanceReport'
import TaxDetails from './Pages/TaxDetails';
import AreaDimension from './Pages/AreaDimension';
import GoogleMapsWardCoordinates from './Pages/GetWardByCoordintes';
import UploadECPage from './Pages/UploadECPage';
import Get_EAASTHI_Status from "./Pages/Get_EAASTHI_Status";
import GetDailyReport from "./Pages/GetDailyReport";
import DailyReportDetails from "./Pages/DailyReportDetails";
import SiteDetails from './Pages/SiteDetails';
import BuildingDetails from './Pages/BuildingDetails';
import MultiStoreyBuildingDetails from './Pages/MultiStoreyBuildingDetails';
import OwnerDetails from './Pages/OwnerDetails';
import LocationDetails from './Pages/LocationDetails';
import ClassificationDocumentUploadPage from './Pages/ClassificationDocumentUploadPage';
import EKYCResponse from './Pages/EKYCResponse';
import EKYCSearchResponse from './Pages/EKYCSearchResponse';
import ESignPage from './Pages/E-SignPage';
import ErrorPage from './Pages/ErrorPage';
import Header from './Header';
import Footer from './Footer';
import Breadcrumbs from './components/Breadcrumbs';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthProvider';
import ScrollToTop from './components/ScrollTop';
import KaveriData from './Pages/KaveriData';
import BBDDraftGenerated from './Pages/BBDDraftGenerated';
import PendanceReportDetails from './Pages/PendanceReportDetails';
import ECDailyReport from './Pages/ECDailyReport';
import SearchProperty from './Pages/SearchProperty';
import MutationDailyReport from './Pages/MutationDailyReport';
import PublicNoticesReport from './Pages/PublicNoticesReport';
import MasterReportPage from './Pages/MasterReportPage';
import PendingMutationReport from './Pages/PendingMutationReport';
import MutationObjection from './Pages/MutationObjection';
import EKYCMutationObjectionResponse from './Pages/EKYCMutationObjectionResponse';
import DraftDownloadedReport from './Pages/DraftDownloadedReport';
import Final_eKhatha_Status_based_on_ePID from './Pages/Final_eKhatha_Status_based_on_ePID';
import Amalgamation from './Pages/Amalgamation';
import EKYCAmalgamationResponse from "./Pages/EKYCAmalgamationResponse";
import GetNewKhataReport from './Pages/NewKhataReport';


import Error_Page from './Pages/BBMP/ErrorPage';

import BBMPLogin from './Pages/BBMP/BBMPLogin';
import BBMP_TaxDetails from './Pages/BBMP/taxDetails';
import BBMP_Homepage from './Pages/BBMP/homePage';
import BBMP_LayoutForm from './Pages/BBMP/BBMP_Layout';
import BBMP_Layout_Dashboard from './Pages/BBMP/BBMP_Layout_Dashboard';
import EKYCResultHandler from './Pages/BBMP/EKYC_Preview';
import ReleaseSelection from './Pages/BBMP/ReleaseSiteSelection';
import BBMP_SubmittedInfo from './Pages/BBMP/Submitted_ApplicationInfo';
import LayoutForm from './Pages/BBMP/LayoutKhata';
import ProtectedRoute from './ProtectedRoute';
import ReleaseEKYCResultHandler from './Pages/BBMP/Release_EKYC_Preview';

import Endorsement from './Pages/BBMP/Endorsement';
import Acknowledgement from './Pages/BBMP/Acknowledgement';
import BBMP_Home from './Pages/BBMP/BBMP_HomePage';
import BBMP_HP from './Pages/BBMP/BBMP_HP';
import DashboardLayout from './Layout/DashboardLayout';
import ReleaseDashboard from './Pages/BBMP/ReleaseDashboard';


const AppRoutes = () => {

  return (
    <AuthProvider>
      <Router basename="/">
        {/* <Router basename="/objection_form_test/">  */}
        <ScrollToTop />
        {/* <Header /> */}
        <div className="App">
          {/* <Breadcrumbs /> */}
          <Routes>
      
            <Route path="/Login" element={<DashboardLayout><BBMPLogin /></DashboardLayout>} />
            <Route path="/" element={<BBMP_Home/>}/>
            {/* <Route path='/home' element={<BBMP_HP/>}/> */}

            {/* Protected Routes */}
            <Route path="/homePage" element={<ProtectedRoute element={<DashboardLayout><BBMP_Homepage /></DashboardLayout>} />} />
            <Route path="/LayoutForm" element={<ProtectedRoute element={ <DashboardLayout><BBMP_LayoutForm /></DashboardLayout>} />} />
            <Route path="/LayoutDashboard" element={<ProtectedRoute element={<DashboardLayout><BBMP_Layout_Dashboard /></DashboardLayout>} />} />
            <Route path="/Release" element={<ProtectedRoute element={<DashboardLayout><ReleaseSelection /></DashboardLayout>} />} />
            <Route path="/SiteRelease" element={<ProtectedRoute element={<DashboardLayout><ReleaseDashboard /></DashboardLayout>} />} />

            <Route path="/EKYCResponse" element={<ProtectedRoute element={<EKYCResultHandler />} />} />
            <Route path="/ReleaseEKYCResponse" element={<ProtectedRoute element={<ReleaseEKYCResultHandler />} />} />
            <Route path="/Info" element={<ProtectedRoute element={<DashboardLayout><BBMP_SubmittedInfo /></DashboardLayout>} />} />
            <Route path='/ReleaseDashboard' element={<ProtectedRoute element={<DashboardLayout><ReleaseDashboard/></DashboardLayout>}/>}/>
            <Route path='/Endorsement' element={<ProtectedRoute element={<Endorsement/>}/>}/>
            <Route path='/Acknowledgement' element={<ProtectedRoute element={<Acknowledgement />}/>} />

            <Route path="/tax_Details" element={<BBMP_TaxDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/PropertyList" element={<PropertyList />} />
            {/* <Route
              path="/BBDDraftGenerated"
              element={<PrivateRoute element={<BBDDraftGenerated />} requiredStep={1} />}
            />  */}
            <Route
              path="/GoogleMapsWardCoordinates"
              element={<GoogleMapsWardCoordinates />}
            />
            <Route
              path="/Get_EAASTHI_Status"
              element={<Get_EAASTHI_Status />}
            />
            <Route
              path="/GetDailyReport"
              element={<GetDailyReport />}
            />
            <Route
              path="/DailyReportDetails"
              element={<DailyReportDetails />}
            />
            <Route
              path="/PendanceReport"
              element={<PendanceReport />}
            />
            <Route
              path="/PendanceReportDetails"
              element={<PendanceReportDetails />}
            />
            <Route
              path="/ObjectorsPage"
              element={<ObjectorsPage />} />
            <Route
              path="/EKYCResponse"
              element={<EKYCResponse />} />
            <Route
              path="/EKYCSearchResponse"
              element={<EKYCSearchResponse />} />
            <Route
              path="/UploadECPage"
              element={<UploadECPage />} />
            <Route
              path='/ECDailyReport'
              element={<ECDailyReport />} />
            <Route
              path='/SearchProperty'
              element={<SearchProperty />} />
            <Route
              path='/MutationDailyReport'
              element={<MutationDailyReport />} />
            <Route
              path='/PublicNoticesReport'
              element={<PublicNoticesReport />} />
            <Route
              path='/MasterReportPage'
              element={<MasterReportPage />} />
            <Route
              path='/PendingMutationReport'
              element={<PendingMutationReport />} />
            <Route
              path='/MutationObjection'
              element={<MutationObjection />} />
            <Route
              path='/EKYCMutationObjectionResponse'
              element={<EKYCMutationObjectionResponse />} />
            <Route
              path='/DraftDownloadedReport'
              element={<DraftDownloadedReport />} />
            <Route
              path='/Final_eKhatha_Status_based_on_ePID'
              element={<Final_eKhatha_Status_based_on_ePID />} />
            <Route
              path='/Amalgamation'
              element={<Amalgamation />} />
            <Route
              path='/EKYCAmalgamationResponse'
              element={<EKYCAmalgamationResponse />} />
            <Route
              path='/GetNewKhataReport'
              element={<GetNewKhataReport />} />
            <Route
              path="/TaxDetails"
              element={<PrivateRoute element={<TaxDetails />} requiredStep={3} />}
            />
            <Route
              path="/EKYCResponse"
              element={<EKYCResponse />} />

            {/* <Route
              path="/BBDDraft"
              element={<PrivateRoute element={<BBDDraft />} requiredStep={1} />}
            />   */}
            <Route
              path="/ObjectorsPage"
              element={<PrivateRoute element={<ObjectorsPage />} requiredStep={3} />}
            />
            <Route
              path="/TaxDetails"
              element={<PrivateRoute element={<TaxDetails />} requiredStep={3} />}
            />
            <Route
              path="/KaveriData"
              element={<PrivateRoute element={<KaveriData />} requiredStep={4} />}
            />
            <Route
              path="/OwnerDetails"
              element={<PrivateRoute element={<OwnerDetails />} requiredStep={5} />}
            />
            <Route
              path="/LocationDetails"
              element={<PrivateRoute element={<LocationDetails />} requiredStep={6} />}
            />
            <Route
              path="/AreaDimension"
              element={<PrivateRoute element={<AreaDimension />} requiredStep={7} />}
            />
            <Route
              path="/SiteDetails"
              element={<PrivateRoute element={<SiteDetails />} requiredStep={8} />}
            />
            <Route
              path="/BuildingDetails"
              element={<PrivateRoute element={<BuildingDetails />} requiredStep={8} />}
            />
            <Route
              path="/MultiStoreyBuildingDetails"
              element={<PrivateRoute element={<MultiStoreyBuildingDetails />} requiredStep={8} />}
            />
            <Route
              path="/ClassificationDocumentUploadPage"
              element={<PrivateRoute element={<ClassificationDocumentUploadPage />} requiredStep={9} />}
            />

            <Route
              path="/ESignPage"
              element={<PrivateRoute element={<ESignPage />} />}
            />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </div>
        {/* <Footer /> */}
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;
