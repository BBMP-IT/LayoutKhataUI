import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../Layout/DashboardLayout';
import Loader from "../../Layout/Loader";
import '../../Styles/CSS/LDashboard.css';
import { getAccessToken } from '../../API/authService';



export const useLoader = () => {
  const [loading, setLoading] = useState(false);

  const start_loader = () => setLoading(true);
  const stop_loader = () => setLoading(false);

  return { loading, start_loader, stop_loader };
};


const BBMP_Layout_Dashboard = () => {
const navigate = useNavigate();

  const columns = [
    { id: "ACT1234", label: "Action", key: "action" },
    { id: "ZON4567", label: "Zone Name", key: "zoneName" },
    { id: "WAR8901", label: "Ward Name", key: "wardName" },
    { id: "AID5678", label: "App ID", key: "appId" },
    { id: "SPT9123", label: "SAS Property Tax Application No", key: "taxNo" },
    { id: "", label: "EPID", key: "epid" },
    { id: "APP2345", label: "Application Date", key: "appDate" },
    { id: "STA6789", label: "Status", key: "status" },
  ];

  const data = [
    {
      action: "Edit",
      zoneName: "Zone 1",
      wardName: "Ward A",
      appId: "123456",
      taxNo: "SAS12345",
      epid: "EP001",
      appDate: "2024-04-01",
      status: "Pending",
    },
    {
      action: "View",
      zoneName: "Zone 2",
      wardName: "Ward B",
      appId: "654321",
      taxNo: "SAS54321",
      epid: "EP002",
      appDate: "2024-03-15",
      status: "Approved",
    },
    // ➕ Add more dummy entries as needed
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  //   const generate_Token = async () => {
  //   try {
      
  //     const response = await getAccessToken();
  //     if (response?.access_token) {
  //       localStorage.setItem('access_token', response.access_token);
  //       localStorage.setItem('isTokenRequired', true);
  //       return true;  // Indicate success
  //     } else {
  //       console.error("No access token received");
  //       return false;
  //     }
  //   } catch (err) {
  //     console.error("Error generating token", err);
  //     return false;
  //   }
  // };
  const generate_Token = async () => {
  try {
    const response = await getAccessToken();
    if (response?.access_token) {
      localStorage.clear();
      localStorage.setItem('access_token', response.access_token);
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

  const handleClick = async () => {
    const success = await generate_Token();
    if (success) {

      navigate('/LayoutForm');
    } else {
      // Optionally show an error alert here
      alert("Token generation failed. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="container pt-4 pb-4">

        {/* Dashboard Cards */}
        <div className="row">
          <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
            <div className="bg-white shadow-md rounded-lg p-4 border border-transparent hover:border-blue-500 transition-all duration-300" style={{ borderRadius: '0.8rem' }}>
              <center>
                <h3 className="mb-2 text-black">Create New</h3>
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-primary rounded hover:bg-blue-600"   onClick={handleClick}
                >
                  <i className="fa fa-plus"></i>
                </button>
              </center>
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
            <div className="bg-white shadow-md rounded-lg p-4 border border-transparent hover:border-blue-500 transition-all duration-300" style={{ borderRadius: '0.8rem' }}>
              <center>
                <h3 className="mb-2 text-black">Sent to ARO </h3>
                <i className="fa fa-recycle mt-4 px-4 py-2 bg-blue-600 text-primary rounded hover:bg-blue-600" style={{fontSize:'30px'}}></i>
              </center>
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
            <div className="bg-white shadow-md rounded-lg p-4 border border-transparent hover:border-blue-500 transition-all duration-300" style={{ borderRadius: '0.8rem' }}>
              <center>
                <h3 className="mb-2 text-black">Submitted </h3>
                <i className="fa fa-check-circle mt-4 px-4 py-2 bg-blue-600 text-success rounded hover:bg-blue-600" style={{fontSize:'30px'}}></i>
              </center>
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
            <div className="bg-white shadow-md rounded-lg p-4 border border-transparent hover:border-blue-500 transition-all duration-300" style={{ borderRadius: '0.8rem' }}>
              <center>
                <h3 className="mb-2 text-black">Incomplete</h3>
                  <i className="fa fa-clock mt-4 px-4 py-2 bg-blue-600 text-warning rounded hover:bg-blue-600" style={{fontSize:'30px'}}></i>
              </center>
            </div>
          </div>

        </div>

        {/* Data Table */}

      </div>
    </DashboardLayout>
  );
};


export default BBMP_Layout_Dashboard;




