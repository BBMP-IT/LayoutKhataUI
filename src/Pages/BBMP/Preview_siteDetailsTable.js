import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../Layout/DashboardLayout';
import { useTranslation } from "react-i18next";
import i18n from "../../localization/i18n";
import SAS_Sample from '../../assets/Sample_SAS_APPLICATIONNO.jpeg';
import SampleDeep_no from '../../assets/deedNo.jpg';
import Swal from "sweetalert2";
import Loader from "../../Layout/Loader";
import DataTable from "react-data-table-component";
import axios from 'axios';
import { useTable, usePagination } from "react-table";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { toast, Toaster } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import apiService from '../../API/apiService';
import {
    handleFetchDistricts, handleFetchTalukOptions, handleFetchHobliOptions, handleFetchVillageOptions,
    handleFetchHissaOptions, fetchRTCDetailsAPI, handleFetchEPIDDetails, getAccessToken, sendOtpAPI, verifyOtpAPI, submitEPIDDetails, submitsurveyNoDetails,
    insertApprovalInfo, listApprovalInfo, deleteApprovalInfo, insertReleaseInfo, deleteReleaseInfo, listReleaseInfo, fileUploadAPI, fileListAPI, insertJDA_details, ownerEKYC_Details,
    ekyc_Details, ekyc_Response, ekyc_insertOwnerDetails, jdaEKYC_Details,
    individualSiteAPI, individualSiteListAPI, fetchECDetails, fetchDeedDocDetails, fetchDeedDetails, fetchJDA_details, deleteSiteInfo, fetch_LKRSID, update_Final_SaveAPI
} from '../../API/authService';

import usericon from '../../assets/usericon.png';
import { Cookie, Stop } from '@mui/icons-material';
import { responsiveProperty } from '@mui/material/styles/cssUtils';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};
	const Preview_siteDetailsTable = ({ data, setData, totalSitesCount, onSave, onEdit, LKRS_ID, createdBy, createdName, roleID }) => {

    useEffect(() => {
    }, [data]);

    const [localLKRSID, setLocalLKRSID] = useState("");

    useEffect(() => {
        if (LKRS_ID) {
            setLocalLKRSID(LKRS_ID);
        } else {
            // fallback to sessionStorage if needed
            const id = sessionStorage.getItem("LKRSID");
            if (id) setLocalLKRSID(id);
        }
    }, [LKRS_ID]);

    const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const totalAddedSites = data.length;



  const columns = React.useMemo(
          () => [

              {
                  Header: "S.No",
                  id: "serialNo",
                  accessor: (row, index) => index + 1,
              },
              {
                  Header: "Shape",
                  accessor: (row) => {
                      return row.sitE_SHAPETYPE ? row.sitE_SHAPETYPE : "-";
                  },
              },
              {
                  Header: "Site Number",
                  accessor: (row) => {
                      return row.sitE_NO ? row.sitE_NO : "-";
                  },
              },
              {
                  Header: "Block/Area",
                  accessor: (row) => {
                      return row.sitE_AREA ? row.sitE_AREA : "-";
                  },
              },
              {
                  Header: "Number of sides",
                  accessor: (row) => {
                      return row.sitE_NO_OF_SIDES ? row.sitE_NO_OF_SIDES : "-";
                  },
              },
              {
                  Header: "Dimension",
                  accessor: (row) => {
  
                      if (row.sitE_SHAPETYPE === "Regular") {
                          // Extract arrays for each property
                          const feetSides = row.siteDimensions.map(dim => dim.sitediM_SIDEINFT);
                          const meterSides = row.siteDimensions.map(dim => dim.sitediM_SIDEINMT);
                          const roadFacingStatuses = row.siteDimensions.map(dim => dim.sitediM_ROADFACING ? "yes" : "no");
  
                          return (
                              <>
                                  {feetSides.join(" x ")} (ft)<br />
                                  {meterSides.join(" x ")} (mtr)<br />
                                  <b>Road Facing:</b> {roadFacingStatuses.join(", ")}
                              </>
                          );
                      } else if (row.sitE_SHAPETYPE === "Irregular" && Array.isArray(row.siteDimensions)) {
                          const feetString = row.siteDimensions.map(side => side.sitediM_SIDEINFT).join(' x ');
                          const meterString = row.siteDimensions.map(side => side.sitediM_SIDEINMT).join(' x ');
                          const roadFacingString = row.siteDimensions.map(side => side.sitediM_ROADFACING ? "Yes" : "No").join(', ');
  
                          return (
                              <div>
                                  <div>{feetString} (ft)</div>
                                  <div>{meterString} (m)</div>
                                  <div><b>Road Facing:</b> {roadFacingString}</div>
                              </div>
                          );
                      } else {
                          return "-";
                      }
  
                  },
                  Footer: (info) => {
  
                      return (
                          <strong>
                              Total Area:
                          </strong>
                      );
                  },
              },
              // {
              //     Header: "Total Area",
              //     accessor: (row) => {
              //         if (row.sitE_AREAINSQFT && row.sitE_AREAINSQMT) {
              //             return `${row.sitE_AREAINSQFT} [Sq.ft] - ${row.sitE_AREAINSQMT} [Sq.mtr]`;
              //         } else {
              //             return "-";
              //         }
              //     },
              // },
              {
                  Header: "Total Area",
                  accessor: (row) => {
                      if (row.sitE_AREAINSQFT && row.sitE_AREAINSQMT) {
                          return `${row.sitE_AREAINSQFT} [Sq.ft] - ${row.sitE_AREAINSQMT} [Sq.mtr]`;
                      } else {
                          return "-";
                      }
                  },
                  Footer: (info) => {
                      const totalSqft = info.rows.reduce((sum, row) => {
                          const value = parseFloat(row.original.sitE_AREAINSQFT);
                          return isNaN(value) ? sum : sum + value;
                      }, 0);
  
                      const totalSqmt = info.rows.reduce((sum, row) => {
                          const value = parseFloat(row.original.sitE_AREAINSQMT);
                          return isNaN(value) ? sum : sum + value;
                      }, 0);
  
                      return (
                          <strong>
                              {totalSqft.toLocaleString()} [Sq.ft] - {totalSqmt.toLocaleString()} [Sq.mtr]
                          </strong>
                      );
                  },
              },
  
              {
                  Header: "Corner Site",
                  accessor: (row) => {
                      return row.sitE_NO ? row.sitE_NO : "-";
  
                      return row.sitE_CORNERPLOT ? "YES" : "NO";
                  },
              },
              {
                  Header: "Type of Site",
                  accessor: (row) => {
                      return row.sitE_TYPE ? row.sitE_TYPE : "-";
                      // return `${row.sitE_TYPE}`;
                  },
              },
              {
                  id: "chakbandi",
                  Header: (
                      <>
                          Chakbandi<br />
                          [East | West | North | South]
                      </>
                  ),
                  accessor: (row) => {
                      const east = row.sitE_EAST || "-";
                      const west = row.sitE_WEST || "-";
                      const north = row.sitE_NORTH || "-";
                      const south = row.sitE_SOUTH || "-";
                      return `${east} | ${west} | ${north} | ${south}`;
                  },
              },
              {
                  Header: "Latitude, Longitude",
                  accessor: (row) => {
                      return `${row.sitE_LATITUDE}, ${row.sitE_LONGITUDE}`;
                  },
              },
          ],
          []
      );
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 5 },
        },
        usePagination
    );
    const paginationBtnStyle = {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        backgroundColor: "#f3f4f6",
        color: "#1f2937",
        cursor: "pointer",
        transition: "background-color 0.2s",
        fontWeight: "500",
        margin: "0 2px",
    };
    const disabledBtnStyle = {
        ...paginationBtnStyle,
        backgroundColor: "#e5e7eb",
        cursor: "not-allowed",
        opacity: 0.6,
    };

    return (
        <div>
            {loading && <Loader />}
            <h4>Layout & Individual Sites Details</h4>
            <div style={{ overflowX: "auto", padding: "1rem" }}>
                <table
                    {...getTableProps()}
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        minWidth: "1500px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                    }}
                >
                    <thead>
                        {headerGroups.map((headerGroup, idx) => (
                            <tr {...headerGroup.getHeaderGroupProps()} key={idx} style={{ backgroundColor: "#f9fafb" }}>
                                {headerGroup.headers.map((column, i) => (
                                    <th
                                        {...column.getHeaderProps()}
                                        key={i}
                                        colSpan={column.columns ? column.columns.length : 1}
                                        style={{
                                            border: "1px solid #e5e7eb",
                                            padding: "12px 16px",
                                            fontWeight: "600",
                                            textAlign: "center",
                                            backgroundColor: "#f3f4f6",
                                            color: "#374151",
                                        }}
                                    >
                                        {column.render("Header")}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {page.map((row, rowIndex) => {
                            prepareRow(row);
                            return (
                                <tr
                                    {...row.getRowProps()}
                                    key={rowIndex}
                                    style={{
                                        backgroundColor: rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
                                        transition: "background 0.3s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb")}
                                >
                                    {row.cells.map((cell, cellIndex) => (
                                        <td
                                            {...cell.getCellProps()}
                                            key={cellIndex}
                                            style={{
                                                border: "1px solid #e5e7eb",
                                                padding: "10px",
                                                textAlign: "center",
                                                color: "#374151",
                                            }}
                                        >
                                            {cell.render("Cell")}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div
                    style={{
                        marginTop: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                    }}
                >
                    <div>
                        Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>{" "}&nbsp;
                        (<strong>Total: {totalAddedSites} records</strong>)
                    </div>

                    <div style={{ display: "flex", gap: "5px" }}>
                        <button disabled={!canPreviousPage} onClick={() => gotoPage(0)} style={paginationBtnStyle}>{`<<`}</button>
                        <button disabled={!canPreviousPage} onClick={() => previousPage()} style={paginationBtnStyle}>{`<`}</button>
                        <button disabled={!canNextPage} onClick={() => nextPage()} style={paginationBtnStyle}>{`>`}</button>
                        <button disabled={!canNextPage} onClick={() => gotoPage(pageCount - 1)} style={paginationBtnStyle}>{`>>`}</button>
                    </div>

                    <div>
                        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}>
                            {[5, 10, 20, 50].map(size => (
                                <option key={size} value={size}>
                                    Show {size}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

};

			
			
			export default Preview_siteDetailsTable;