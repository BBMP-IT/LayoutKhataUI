import React, { useEffect, useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from "react-data-table-component";
import DashboardLayout, { LoaderContext } from '../../Layout/DashboardLayout';
import Loader from "../../Layout/Loader";
import '../../Styles/CSS/LDashboard.css';
import Swal from "sweetalert2";
import { getAccessToken, fetch_DashboardDetails, fetch_DashboarddataDetails } from '../../API/authService';



export const useLoader = () => {
  const [loading, setLoading] = useState(false);

  const start_loader = () => setLoading(true);
  const stop_loader = () => setLoading(false);

  return { loading, start_loader, stop_loader };
};


const BBMP_Layout_Dashboard = () => {
  const navigate = useNavigate();
  // const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

  const { loading, start_loader, stop_loader } = useContext(LoaderContext);

  const [records, setRecords] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  //pending application redirection
  const handleEditClick = (lkrS_ID, lkrS_DISPLAYLKRSID) => {
    sessionStorage.removeItem('LKRSID');
    sessionStorage.removeItem('display_LKRSID');
    sessionStorage.setItem('LKRSID', lkrS_ID);
    sessionStorage.setItem('display_LKRSID', lkrS_DISPLAYLKRSID);
    navigate("/LayoutForm", {
      state: {
        LKRSID: lkrS_ID,
        DISPLAYLKRSID: lkrS_DISPLAYLKRSID,
      },
    });
  };
  //release dashboard redirection
  const handleReleaseClick = (lkrS_ID, lkrS_DISPLAYLKRSID) => {
    sessionStorage.removeItem('LKRSID');
    sessionStorage.removeItem('display_LKRSID');
    sessionStorage.setItem('LKRSID', lkrS_ID);
    sessionStorage.setItem('display_LKRSID', lkrS_DISPLAYLKRSID);
    // navigate("/Release", {
      navigate("/SiteRelease",{
      state: {
        LKRS_ID: lkrS_ID,
        display_LKRS_ID: lkrS_DISPLAYLKRSID,
      },
    });
  };
  //submitted information redirection
  const handleSubmittedInfoClick = (lkrS_ID, lkrS_DISPLAYLKRSID) => {
    sessionStorage.removeItem('LKRSID');
    sessionStorage.removeItem('display_LKRSID');
    sessionStorage.setItem('LKRSID', lkrS_ID);
    sessionStorage.setItem('display_LKRSID', lkrS_DISPLAYLKRSID);
    navigate("/Info", {
      state: {
        LKRS_ID: lkrS_ID,
        display_LKRS_ID: lkrS_DISPLAYLKRSID,
      },
    });
  };
  //Endorsement information redirection
  const handleEndorsementClick = (lkrS_ID, lkrS_DISPLAYLKRSID) => {
    sessionStorage.removeItem('LKRSID');
    sessionStorage.removeItem('display_LKRSID');
    sessionStorage.setItem('LKRSID', lkrS_ID);
    sessionStorage.setItem('display_LKRSID', lkrS_DISPLAYLKRSID);
    navigate("/Endorsement", {
      state: {
        LKRS_ID: lkrS_ID,
        display_LKRS_ID: lkrS_DISPLAYLKRSID,
      },
    });
  };


  //Endorsement information redirection
  const handleAcknowledgementClick = (lkrS_ID, lkrS_DISPLAYLKRSID) => {
    sessionStorage.removeItem('LKRSID');
    sessionStorage.removeItem('display_LKRSID');
    sessionStorage.setItem('LKRSID', lkrS_ID);
    sessionStorage.setItem('display_LKRSID', lkrS_DISPLAYLKRSID);
    navigate("/Acknowledgement", {
      state: {
        LKRS_ID: lkrS_ID,
        display_LKRS_ID: lkrS_DISPLAYLKRSID,
      },
    });
  };

  const columns = [

    {
      name: "Action",
      selector: (row) => {
        if (row.lkrS_APPSTATUS === 1) {
          return (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleEditClick(row.lkrS_ID, row.lkrS_DISPLAYID)}
              title="Edit"
            >
              <i className="fa fa-pencil"></i>
            </button>
          );
        } else if (row.lkrS_APPSTATUS === 10) {
          return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '6px', alignItems: 'center' }}>
              <button
                className="btn btn-info btn-sm"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="View Submitted Info"
                onClick={() => handleSubmittedInfoClick(row.lkrS_ID, row.lkrS_DISPLAYID)}
              >
                <i className="fa fa-file-alt"></i>
              </button>
              <button
                className="btn btn-success btn-sm"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="View Endorsement"
                onClick={() => handleEndorsementClick(row.lkrS_ID, row.lkrS_DISPLAYID)}
              >
                <i className="fa fa-check-circle"></i> {/* Icon for endorsement */}
              </button>

            </div>
          );
        } else if (row.lkrS_APPSTATUS === 9) {
          return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '6px', alignItems: 'center' }}>
             <button
                className="btn btn-success btn-sm"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="View Endorsement"
                onClick={() => handleEndorsementClick(row.lkrS_ID, row.lkrS_DISPLAYID)}
              >
                <i className="fa fa-check-circle"></i> {/* Icon for endorsement */}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleReleaseClick(row.lkrS_ID, row.lkrS_DISPLAYID)}
              >
                Site Release
              </button>
            </div>
          );
        }
        return null;
      },
      center: true,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "200px"
    },
    {
      name: "S.No",
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "70px",
      center: true,
    },
    {
      name: "LKRS ID",
      selector: (row) => row.lkrS_DISPLAYID,
      width: "100px",
      center: true,
    },
    {
      name: "Land Type",
      selector: (row) => row.lkrS_LANDTYPE,
      center: true,
    },
    {
      name: "No. of Sites",
      selector: (row) => row.lkrS_NUMBEROFSITES,
      center: true,
    },
    {
      name: "EPID",
      selector: (row) => row.lkrS_EPID || "-",
      center: true,
    },
    {
      name: "Created Date",
      selector: (row) => {
        const date = new Date(row.lkrS_CREATEDDATE);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
      center: true,
    },
    {
      name: "Detailed Status",
      selector: (row) => row.lkrS_APPDETAILEDSTATUS,
      width: "250px",
      center: true,
      cell: (row) => {
        let backgroundColor = 'transparent';
        let textColor = 'inherit';

        // Conditions
        const isGreen =
          (row.lkrS_APPSTATUS === 10) ||
          (row.lkrS_APPSTATUS === 8);

        const isRed =
          row.lkrS_APPSTATUS === 11;
        //application created
        const isOrange =
          row.lkrS_APPSTATUS === 1;
        const isgrey =
          row.lkrS_APPSTATUS === 9;




        // Set background and text color
        if (isGreen) {
          backgroundColor = 'green';
          textColor = 'white';
        } else if (isRed) {
          backgroundColor = 'red';
          textColor = 'white';
        } else if (isOrange) {
          backgroundColor = 'orange';
          textColor = 'black';
        } else if (isgrey) {
          backgroundColor = 'gray';
          textColor = 'white';
        }

        return (
          <div
            style={{
              backgroundColor,
              color: textColor,
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            {row.lkrS_APPDETAILEDSTATUS}
          </div>
        );
      },
    },



  ];
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#f0f0f0',
        color: '#333',
        fontWeight: 'bold',
      },
    },
    cells: {
      style: {
        maxWidth: '200px', // adjust as needed
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        justifyContent: 'center',
      },
    },
  };

  const [dashboardData, setDashboardData] = useState({
    allCount: 0,
    incompletedCount: 0,
    submittedCount: 0,
    completedCount: 0,
  });

  const [createdBy, setCreatedBy] = useState(sessionStorage.getItem('PhoneNumber'));
  const [createdName, setCreatedName] = useState('');
  const [roleID, setRoleID] = useState('');

  useEffect(() => {
    const storedCreatedBy = sessionStorage.getItem('PhoneNumber');
    const storedCreatedName = sessionStorage.getItem('createdName');
    const storedRoleID = sessionStorage.getItem('RoleID');

    setCreatedBy(storedCreatedBy);
    setCreatedName(storedCreatedName);
    setRoleID(storedRoleID);

    const initDashboard = async () => {
      try {
        start_loader();
        let token = sessionStorage.getItem('access_token');
        // const tokenGenerated = await generate_Token();

        if (!token) {
          console.error("Token generation failed. Dashboard data not fetched.");
          return;
        }

        const data = await fetch_DashboardDetails(createdBy);
        setDashboardData(data);
        await dashboard_Data(1);
        setSelectedLevel(1);
      } catch (err) {
        console.error("Failed to initialize dashboard:", err);
      } finally {
        stop_loader();
      }
    };

    initDashboard();
  }, []);


  const dashboard_Data = async (level) => {
    try {
      start_loader();
      const response = await fetch_DashboarddataDetails(level, createdBy);
      if (response) {
        setRecords(response || []);
      } else {
        Swal.fire("Error!", "Failed to fetch data. Please try again.", "error");
      }
    } catch (error) {
      console.error("fetching data Error:", error);
    } finally {
      stop_loader();
    }
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    dashboard_Data(level);
  };

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


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const generate_Token = async () => {
    try {
      const response = await getAccessToken();
      if (response?.access_token) {
        sessionStorage.clear();
        sessionStorage.setItem('access_token', response.access_token);
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
    // const success = await generate_Token();
    // if (success) {
    sessionStorage.removeItem('LKRSID');
    sessionStorage.removeItem('display_LKRSID');
    sessionStorage.removeItem('totalNoOfSites');
    sessionStorage.removeItem('ownerName');
    navigate('/LayoutForm');

  };


  return (
    // <DashboardLayout>
    //   <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
    //     {loading && <Loader />}
    <div className="container pt-4 pb-4">

      {/* Dashboard Cards */}
      <div className="row">
        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
          <div className="bg-white shadow-md rounded-lg p-4 border border-transparent hover:border-blue-500 transition-all duration-300" style={{ borderRadius: '0.8rem' }}>
            <center>
              <h3 className="mb-2 text-black">Create New Request</h3>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-primary rounded hover:bg-blue-600" onClick={handleClick}
              >
                <i className="fa fa-plus"></i>
              </button>
            </center>
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
          <div className="bg-white shadow-md rounded-lg p-4 border border-transparent hover:border-blue-500 transition-all duration-300" style={{ borderRadius: '0.8rem' }}>
            <center>
              <h3 className="mb-2 text-black">Completed ({dashboardData.completedCount}) </h3>
              <i className="fa fa-check-circle mt-4 px-4 py-2 bg-blue-600 text-success rounded hover:bg-blue-600" style={{ fontSize: '30px' }}></i>
            </center>
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
          <div className="bg-white shadow-md rounded-lg p-4 border border-transparent hover:border-blue-500 transition-all duration-300" style={{ borderRadius: '0.8rem' }}>
            <center>
              <h3 className="mb-2 text-black">Submitted ({dashboardData.submittedCount}) </h3>
              <i className="fa fa-clock mt-4 px-4 py-2 bg-blue-600 text-warning rounded hover:bg-blue-600" style={{ fontSize: '30px' }}></i>
            </center>
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3">
          <div className="bg-white shadow-md rounded-lg p-4 border border-transparent hover:border-blue-500 transition-all duration-300" style={{ borderRadius: '0.8rem' }}>
            <center>
              <h3 className="mb-2 text-black">Incomplete ({dashboardData.incompletedCount})</h3>
              <i className="fa fa-recycle mt-4 px-4 py-2 bg-blue-600 text-danger rounded hover:bg-blue-600" style={{ fontSize: '30px' }}></i>
            </center>
          </div>
        </div>
      </div>
      <br />
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0 " style={{ color: '#fff' }}>Dashboard</h5>
        </div>
        <div className="card-body" style={{ overflowX: 'auto' }}>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <DataTable
              title={
                <div className="text-center">
                  <div className="row">
                    <div className="col-3">
                      <div className="form-check">
                        <label className="form-check-label fs-6">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="levelOptions"
                            value="1"
                            checked={selectedLevel === 1}
                            onChange={() => handleLevelChange(1)}
                          />
                          All ({dashboardData.allCount})
                        </label>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="form-check">
                        <label className="form-check-label fs-6">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="levelOptions"
                            value="4"
                            checked={selectedLevel === 4}
                            onChange={() => handleLevelChange(4)}
                          />
                          Completed ({dashboardData.completedCount})
                        </label>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="form-check">
                        <label className="form-check-label fs-6">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="levelOptions"
                            value="3"
                            checked={selectedLevel === 3}
                            onChange={() => handleLevelChange(3)}
                          />
                          Submitted ({dashboardData.submittedCount})
                        </label>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="form-check">
                        <label className="form-check-label fs-6">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="levelOptions"
                            value="2"
                            checked={selectedLevel === 2}
                            onChange={() => handleLevelChange(2)}
                          />
                          Incomplete ({dashboardData.incompletedCount})
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              }
              columns={columns}
              data={records}
              responsive
              pagination
              customStyles={customStyles}
              paginationServer={false}
              paginationDefaultPage={currentPage}
              paginationPerPage={rowsPerPage}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(newPerPage, page) => {
                setRowsPerPage(newPerPage);
                setCurrentPage(page);
              }}
              highlightOnHover
              striped
            />
          </div>
        </div>
      </div>







    </div>
    //   </div>
    // </DashboardLayout>
  );
};


export default BBMP_Layout_Dashboard;




