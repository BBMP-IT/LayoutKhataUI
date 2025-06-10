import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../Layout/DashboardLayout';
import Loader from "../../Layout/Loader";
import '../../Styles/CSS/LDashboard.css';

export const useLoader = () => {
  const [loading, setLoading] = useState(false);

  const start_loader = () => setLoading(true);
  const stop_loader = () => setLoading(false);

  return { loading, start_loader, stop_loader };
};


const BBMP_Layout_Dashboard = () => {


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

  return (
    <DashboardLayout>
    <div className="container pt-4 pb-4">
      {/* Dashboard Cards */}
      <div className="row">
        {["New Request", "Send to ARO", "Submitted", "Incomplete"].map((title, idx) => (
          <div className="col-md-4 col-xl-3" key={idx}>
            <div className="card bg-c-blue order-card">
              <div className="card-block">
                <h3 className="m-b-20">{title}</h3>
                <h2 className="text-right">
                  <i className={`fa ${["fa-cart-plus", "fa-rocket", "fa-refresh", "fa-credit-card"][idx]} f-left`}></i>
                  <span>486</span>
                </h2>
              </div>
            </div>
          </div>
        ))}
      <div className='col-md-3'>
       <div className="gradient-border">
  <div className="card custom-card">
    <div className="card-block">
      <h3 className="m-b-20 text-blue">Send to ARO  </h3>
      <h2 className="text-right">
        <i className="fa fa-cart-plus f-left"></i>
        <span className='text-blue'>486</span>
      </h2>
    </div>
  </div>
</div>

</div>
      </div>

      {/* Data Table */}
     
    </div>
    </DashboardLayout>
  );
};


export default BBMP_Layout_Dashboard;




