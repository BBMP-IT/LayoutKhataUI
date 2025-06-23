import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../Layout/DashboardLayout';
import Loader from "../../Layout/Loader";
import DataTable from 'react-data-table-component';
import '../../Styles/CSS/ReleaseSiteSelection.css';
import Swal from "sweetalert2";
import { useLocation } from 'react-router-dom';

import {
  fetch_LKRSID, fetch_releasePercentageDetails, individualSiteListAPI, final_Release_Sites, listApprovalInfo
} from '../../API/authService';

export const useLoader = () => {
  const [loading, setLoading] = useState(false);

  const start_loader = () => setLoading(true);
  const stop_loader = () => setLoading(false);

  return { loading, start_loader, stop_loader };
};

const ReleaseSelection = () => {
  const { loading, start_loader, stop_loader } = useLoader(); // Use loader context
  const [selectedValue, setSelectedValue] = useState('');
  const location = useLocation();
  const { LKRS_ID, createdBy, createdName, roleID, display_LKRS_ID } = location.state || {};

  const [releaseData, setReleaseData] = useState([]); // Data for the "Release Table"
  const [releasedData, setReleasedData] = useState([]); // Data for the "Already Released Table"
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [finalApiList, setFinalApiList] = useState([]);
  const [selectionLimit, setSelectionLimit] = useState(0);

  const [is60PercentDone, setIs60PercentDone] = useState(false);
  const [showNextReleaseForm, setShowNextReleaseForm] = useState(false);
  const MAX_FILE_SIZE_MB = 5;
  const [errors, setErrors] = useState({});
  const [savedData, setSavedData] = useState([]);

  // Inputs for new form fields
  const [siteReleaseOrderNumber, setSiteReleaseOrderNumber] = useState('');
  const [dateOfOrder, setDateOfOrder] = useState('');
  const [orderFile, setOrderFile] = useState(null);
  const fileInputRef = useRef(null);

  const [originalTotalRecords, setOriginalTotalRecords] = useState(0);

  useEffect(() => {
    if (display_LKRS_ID && LKRS_ID) {
      handleSearchClick(display_LKRS_ID);  // call the method if LKRS_ID exists
    }
  }, [LKRS_ID, display_LKRS_ID]);
  useEffect(() => {
    if (originalTotalRecords === 0 && (releaseData.length > 0 || finalApiList.length > 0)) {
      const total = releaseData.length + finalApiList.length;
      setOriginalTotalRecords(total);
    }
  }, [releaseData, finalApiList, originalTotalRecords]);


  const totalRecords = releaseData.length + releasedData.length;
  const sixtyPercentCount = Math.round(0.6 * originalTotalRecords);
  const fortyPercentCount = originalTotalRecords - sixtyPercentCount;

  const getMaxLimitForPhase3 = () => {
    const fortyPercent = Math.round(0.4 * originalTotalRecords);
    const thirtyPercent = Math.round(0.3 * originalTotalRecords);
    const alreadyReleased = finalApiList.length;

    if (alreadyReleased < fortyPercent) return fortyPercent - alreadyReleased;
    if (alreadyReleased === fortyPercent) return thirtyPercent;
    if (alreadyReleased === (fortyPercent + thirtyPercent)) return originalTotalRecords - alreadyReleased;

    return 0; // invalid state
  };

  const handleRowSelect = (index) => {
    const isSelected = selectedRows.includes(index);

    if (isSelected) {
      setSelectedRows(prev => prev.filter(i => i !== index));
    } else {
      const maxLimit = selectedValue === '2'
        ? Math.round(0.6 * originalTotalRecords) - releasedData.length
        : selectedValue === '3'
          ? getMaxLimitForPhase3()
          : undefined;

      if (maxLimit === undefined || selectedRows.length < maxLimit) {
        setSelectedRows(prev => [...prev, index]);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Selection Limit Reached',
          text: `You can only select up to ${maxLimit} site(s).`,
          confirmButtonColor: '#3085d6',
        });
      }
    }
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;

    if (selectedValue === '1') {
      if (checked) {
        const allIndexes = releaseData.map((_, index) => index);
        setSelectedRows(allIndexes);
      } else {
        setSelectedRows([]);
      }
    }

    if (selectedValue === '2') {
      const totalCount = releaseData.length + releasedData.length;
      const sixtyPercentCount = Math.round(0.6 * originalTotalRecords);
      const alreadyReleased = releasedData.length;

      if (checked) {
        let rowsToSelect = [];

        if (alreadyReleased < sixtyPercentCount) {
          const remainingSlots = sixtyPercentCount - alreadyReleased;
          rowsToSelect = releaseData
            .map((_, index) => index)
            .slice(0, remainingSlots);
        } else {
          const remainingSlots = totalCount - alreadyReleased;
          rowsToSelect = releaseData
            .map((_, index) => index)
            .slice(0, remainingSlots);
        }

        setSelectedRows(rowsToSelect);
      } else {
        setSelectedRows([]);
      }
    }

    if (selectedValue === '3') {
      const fortyPercent = Math.round(0.4 * originalTotalRecords);
      const thirtyPercent = Math.round(0.3 * originalTotalRecords);
      const alreadyReleased = finalApiList.length;

      if (checked) {
        let rowsToSelect = [];

        if (alreadyReleased < fortyPercent) {
          const remaining = fortyPercent - alreadyReleased;
          rowsToSelect = releaseData
            .map((_, index) => index)
            .slice(0, remaining);
        } else if (alreadyReleased === fortyPercent) {
          const remaining = thirtyPercent;
          rowsToSelect = releaseData
            .map((_, index) => index)
            .slice(0, remaining);
        } else if (alreadyReleased === (fortyPercent + thirtyPercent)) {
          const remaining = originalTotalRecords - alreadyReleased;
          rowsToSelect = releaseData
            .map((_, index) => index)
            .slice(0, remaining);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Invalid State',
            text: 'You can only proceed to the next 30% phase after completing the previous one.',
            confirmButtonColor: '#3085d6',
          });
          rowsToSelect = [];
        }

        if (rowsToSelect.length > 0) {
          setSelectedRows(rowsToSelect);
        }
      } else {
        setSelectedRows([]);
      }
    }

    setSelectAllChecked(checked);
  };
  const handleDimensionChange = (value) => {
    setSelectedValue(value);
    setSelectAllChecked(false);
    setSelectedRows([]);

    const total = releaseData.length + releasedData.length;
    const sixtyPercentCount = Math.round(0.6 * originalTotalRecords);
    const fortyPercentCount = originalTotalRecords - sixtyPercentCount;

    if (value === '2') {
      if (releasedData.length === 0) {
        // First phase - allow 60% selection
        setSelectionLimit(sixtyPercentCount);
      } else if (releasedData.length === sixtyPercentCount) {
        // Second phase - allow 40% selection
        setSelectionLimit(fortyPercentCount);
      } else if (releasedData.length === total) {
        // All released - no more selection
        Swal.fire({
          icon: 'info',
          title: '100% Already Released',
          text: 'All records have been released. No further action is allowed.',
          confirmButtonColor: '#3085d6',
        });
        setSelectionLimit(0);
      } else {
        // Invalid state (e.g., partial release) — disable
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Release State',
          text: 'You can only release 40% after 60% has been completed.',
          confirmButtonColor: '#3085d6',
        });
        setSelectionLimit(0);
      }
    } else if (value === '3') {
      const fortyPercent = Math.round(0.4 * originalTotalRecords);
      const thirtyPercent = Math.round(0.3 * originalTotalRecords);
      const total = releaseData.length + releasedData.length;

      if (releasedData.length === 0) {
        // Phase 1: 40%
        setSelectionLimit(fortyPercent);
      } else if (releasedData.length === fortyPercent) {
        // Phase 2: 30%
        setSelectionLimit(thirtyPercent);
      } else if (releasedData.length === fortyPercent + thirtyPercent) {
        // Phase 3: final 30%
        setSelectionLimit(originalTotalRecords - releasedData.length);
      } else if (releasedData.length === originalTotalRecords) {
        Swal.fire({
          icon: 'info',
          title: '100% Already Released',
          text: 'All records have been released.',
          confirmButtonColor: '#3085d6',
        });
        setSelectionLimit(0);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Release State',
          text: 'You can only release 30% after completing the previous phase.',
          confirmButtonColor: '#3085d6',
        });
        setSelectionLimit(0);
      }
    }


  };
  const handleCheckboxToggle = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };
  const moveToReleasedTable = () => {
    const sixtyPercentCount = Math.round(0.6 * originalTotalRecords);
    const fortyPercentCount = Math.round(0.4 * originalTotalRecords);
    const thirtyPercentCount = Math.round(0.3 * originalTotalRecords);
    const releasedCount = releasedData.length;
    const selectedCount = selectedRows.length;

    if (selectedValue === '1') {
      if (releasedCount > 0) {
        Swal.fire({
          icon: 'info',
          title: 'Cannot perform 100% release',
          text: 'Some records have already been released. 100% release must be done in one go.',
          confirmButtonColor: '#3085d6',
        });
        return;
      } else if (selectedCount !== originalTotalRecords) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Selection',
          text: `You must select all ${originalTotalRecords} records to complete 100% release.`,
          confirmButtonColor: '#3085d6',
        });
        return;
      }
    }

    if (selectedValue === '2') {
      if (selectedCount === 0) {
        Swal.fire({
          icon: 'error',
          title: 'No Records Selected',
          text: 'Please select a record to release.',
          confirmButtonColor: '#3085d6',
        });
        return;
      }

      if (releasedCount < sixtyPercentCount) {
        // Phase 1: Must select up to 60%
        if (selectedCount > (sixtyPercentCount - releasedCount)) {
          Swal.fire({
            icon: 'warning',
            title: 'Limit Exceeded',
            text: `You can only select up to ${sixtyPercentCount - releasedCount} items in this phase.`,
            confirmButtonColor: '#3085d6',
          });
          return;
        }
      } else if (releasedCount >= sixtyPercentCount && releasedCount < originalTotalRecords) {
        // Phase 2: Remaining 40%
        const allowed = originalTotalRecords - releasedCount;
        if (selectedCount > allowed) {
          Swal.fire({
            icon: 'warning',
            title: 'Limit Exceeded',
            text: `You can only release ${allowed} more items.`,
            confirmButtonColor: '#3085d6',
          });
          return;
        }
      } else {
        Swal.fire({
          icon: 'info',
          title: 'All Released',
          text: '100% records already released.',
          confirmButtonColor: '#3085d6',
        });
        return;
      }
    }

    if (selectedValue === '3') {
      if (selectedCount === 0) {
        Swal.fire({
          icon: 'error',
          title: 'No Records Selected',
          text: 'Please select a record to release.',
          confirmButtonColor: '#3085d6',
        });
        return;
      }
      if (releasedCount < fortyPercentCount) {
        // Phase 1: 40%
        if (selectedCount > (fortyPercentCount - releasedCount)) {
          Swal.fire({
            icon: 'warning',
            title: 'Limit Exceeded',
            text: `Only ${fortyPercentCount - releasedCount} records can be released in this phase.`,
            confirmButtonColor: '#3085d6',
          });
          return;
        }
      } else if (releasedCount === fortyPercentCount) {
        // Phase 2: 30%
        if (selectedCount > thirtyPercentCount) {
          Swal.fire({
            icon: 'warning',
            title: 'Limit Exceeded',
            text: `Only ${thirtyPercentCount} records can be released in this phase.`,
            confirmButtonColor: '#3085d6',
          });
          return;
        }
      } else if (releasedCount === (fortyPercentCount + thirtyPercentCount)) {
        // Phase 3: Final 30%
        const remaining = originalTotalRecords - releasedCount;
        if (selectedCount > remaining) {
          Swal.fire({
            icon: 'warning',
            title: 'Limit Exceeded',
            text: `Only ${remaining} records can be released in this final phase.`,
            confirmButtonColor: '#3085d6',
          });
          return;
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Phase',
          text: 'You can only proceed to the next 30% phase after completing the previous one.',
          confirmButtonColor: '#3085d6',
        });
        return;
      }
    }

    // Move selected records to releasedData
    const selectedRowsData = releaseData.filter((_, index) => selectedRows.includes(index));
    const remainingData = releaseData.filter((_, index) => !selectedRows.includes(index));

    setReleasedData(prev => [...prev, ...selectedRowsData]);
    setReleaseData(remainingData);
    setSelectedRows([]);
    setSelectAllChecked(false);
  };
  const performRelease = (sixtyPercentCount, fortyPercentCount) => {
    const movingData = releaseData.filter(item => selectedRows.includes(item.id));

    setReleasedData(prev => [...prev, ...movingData]);
    setReleaseData(prev => prev.filter(item => !selectedRows.includes(item.id)));
    setSelectedRows([]);

    // Prepare for second phase if it's first time in 60*40
    if (selectedValue === '2' && releasedData.length === 0) {
      setSelectionLimit(fortyPercentCount);
    }

    if (selectedValue === '1') {
      setIs60PercentDone(true); // or any full-release flag
    }
  };
  const handleRemoveFromReleasedTable = (indexToRemove) => {
    setReleasedData((prevReleased) => {
      const rowToMoveBack = prevReleased[indexToRemove];
      if (!rowToMoveBack) return prevReleased;

      const rowToMoveBackCopy = { ...rowToMoveBack };

      setReleaseData((prevRelease) => {
        const updated = [...prevRelease, rowToMoveBackCopy];
        return updated.sort((a, b) => a.id - b.id); // keep sort if necessary
      });

      if (selectedValue === '2') {
        setSelectionLimit((prevLimit) => prevLimit + 1);
      }

      setSelectedRows((prevSelected) =>
        prevSelected.filter((id) => id !== rowToMoveBackCopy.id)
      );

      // Remove by index
      const updatedReleased = [...prevReleased];
      updatedReleased.splice(indexToRemove, 1);
      return updatedReleased;
    });
  };
  const isSelectAllDisabled = () => {
    if (selectedValue === '1') {
      return releaseData.length === 0;
    }

    if (selectedValue === '2') {
      const totalCount = releaseData.length + releasedData.length;
      const sixtyPercentCount = Math.round(0.6 * totalCount);

      // If we're still in 60% phase (i.e., less than 60% is released)
      if (releasedData.length < sixtyPercentCount) {
        const remainingSlots = sixtyPercentCount - releasedData.length;
        const remainingSelectable = releaseData.filter(row => !selectedRows.includes(row.id)).length;
        return remainingSlots === 0 || remainingSelectable === 0;
      }

      // 60% is done, we are now in 40% phase — do NOT disable select all
      return false;
    }

    return false;
  };
  // Columns for the DataTable
  const releaseTableColumns = [
    // {
    //   name: ['1', '2', '3'].includes(selectedValue) ? (
    //     <div>
    //       <input
    //         type="checkbox"
    //         checked={selectAllChecked}
    //         onChange={handleSelectAll}
    //         disabled={isSelectAllDisabled()}
    //       />
    //     </div>
    //   ) : '',

    //   selector: row => row.id,
    //   width: '50px',
    //   sortable: false,
    //   cell: row => {
    //     const isSelected = selectedRows.includes(row.id);

    //     const totalCount = releaseData.length + releasedData.length;
    //     const maxSelectable = Math.round(0.6 * originalTotalRecords); // 60%
    //     const alreadyReleased = releasedData.length;
    //     const remainingSlots = maxSelectable - alreadyReleased;

    //     // In first phase (before reaching 60%)
    //     const isInFirstPhase = alreadyReleased < maxSelectable;

    //     // Whether selecting more is blocked (limit reached)
    //     const limitReached = selectedValue === '2' &&
    //       isInFirstPhase &&
    //       !isSelected &&
    //       selectedRows.length >= remainingSlots;

    //     const checkboxId = `checkbox-${row.id}`;

    //     const handleCheckboxClick = (e) => {
    //       if (limitReached && !isSelected) {  // block only new checks when limit reached
    //         e.preventDefault();
    //         Swal.fire({
    //           icon: 'warning',
    //           title: 'Selection Limit Reached',
    //           text: `Only ${remainingSlots} more site(s) can be selected for 60% release.`,
    //           confirmButtonColor: '#3085d6',
    //         });
    //       }
    //     };
    //     return (
    //       <div>
    //         <input
    //           id={checkboxId}
    //           type="checkbox"
    //           checked={isSelected}
    //           // **Always enabled**
    //           disabled={false}
    //           onClick={handleCheckboxClick}
    //           onChange={() => {
    //             if (isSelected) {
    //               // Always allow unchecking
    //               handleRowSelect(row);
    //             } else {
    //               // Allow checking only if limit not reached or not in first phase
    //               if (!limitReached || !isInFirstPhase) {
    //                 handleRowSelect(row);
    //               }
    //             }
    //           }}
    //           style={{ cursor: limitReached && !isSelected ? 'not-allowed' : 'pointer' }}
    //         />
    //       </div>
    //     );
    //   },
    //   ignoreRowClick: true,
    //   allowOverflow: true,
    //   button: true,
    // },
    {
      name: ['1', '2', '3'].includes(selectedValue) ? (
        <div>
          <input
            type="checkbox"
            checked={selectAllChecked}
            onChange={handleSelectAll}
            disabled={isSelectAllDisabled()}
          />
        </div>
      ) : '',

      selector: row => row.id, // keep as is; used only by DataTable internally
      width: '50px',
      sortable: false,
      cell: (row, index) => {
        const isSelected = selectedRows.includes(index);

        const totalCount = releaseData.length + releasedData.length;
        const maxSelectable = Math.round(0.6 * originalTotalRecords); // 60%
        const alreadyReleased = releasedData.length;
        const remainingSlots = maxSelectable - alreadyReleased;
        const isInFirstPhase = alreadyReleased < maxSelectable;
        const limitReached = selectedValue === '2' &&
          isInFirstPhase &&
          !isSelected &&
          selectedRows.length >= remainingSlots;

        const handleCheckboxClick = (e) => {
          if (limitReached && !isSelected) {
            e.preventDefault();
            Swal.fire({
              icon: 'warning',
              title: 'Selection Limit Reached',
              text: `Only ${remainingSlots} more site(s) can be selected for 60% release.`,
              confirmButtonColor: '#3085d6',
            });
          }
        };

        return (
          <div>
            <input
              type="checkbox"
              checked={isSelected}
              onClick={handleCheckboxClick}
              onChange={() => {
                if (isSelected) {
                  handleRowSelect(index);
                } else if (!limitReached || !isInFirstPhase) {
                  handleRowSelect(index);
                }
              }}
              style={{ cursor: limitReached && !isSelected ? 'not-allowed' : 'pointer' }}
            />
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },

    // {
    //   name: "Site ID",
    //   selector: row => row.sitE_ID || '',
    // },
    {
      name: 'Sl. No.',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '90px', center: true
    },
    {
      name: "Shape",
      selector: row => row.sitE_SHAPETYPE || '',
      width: '100px', center: true
    },
    {
      name: "Site Number",
      selector: row => row.sitE_NO || '',
      width: '120px', center: true
    },
    {
      name: "Block/Area",
      selector: row => row.sitE_AREA || '',
      width: '120px', center: true
    },
    {
      name: "No of sides",
      selector: row => row.sitE_NO_OF_SIDES || '',
      width: '120px', center: true
    },
    {
      name: "Dimension",
      cell: (row) => {
        if (row.sitE_SHAPETYPE === "Regular") {
          const feetSides = row.siteDimensions?.map(dim => dim.sitediM_SIDEINFT) || [];
          const meterSides = row.siteDimensions?.map(dim => dim.sitediM_SIDEINMT) || [];
          const roadFacingStatuses = row.siteDimensions?.map(dim => dim.sitediM_ROADFACING ? "yes" : "no") || [];

          return (
            <div className="dimension-cell">
              <div className="nowrap">{feetSides.join(" x ")} (ft)</div>
              <div className="nowrap">{meterSides.join(" x ")} (mtr)</div>
              <div className="nowrap"><b>Road Facing:</b> {roadFacingStatuses.join(", ")}</div>
            </div>
          );
        } else if (row.sitE_SHAPETYPE === "Irregular" && Array.isArray(row.siteDimensions)) {
          const feetString = row.siteDimensions.map(side => side.sitediM_SIDEINFT).join(' x ');
          const meterString = row.siteDimensions.map(side => side.sitediM_SIDEINMT).join(' x ');
          const roadFacingString = row.siteDimensions.map(side => side.sitediM_ROADFACING ? "Yes" : "No").join(', ');

          return (
            <div className="dimension-cell">
              <div className="nowrap">{feetString} (ft)</div>
              <div className="nowrap">{meterString} (m)</div>
              <div className="nowrap"><b>Road Facing:</b> {roadFacingString}</div>
            </div>
          );
        }
        return '';
      },
      center: true,
      width: '200px', // Add fixed width for better control
    },

    {
      name: "Total Area",
      selector: row => `${row.sitE_AREAINSQFT} [Sq.ft], ${row.sitE_AREAINSQMT} [Sq.mtr]`,
      center: true,
      width: '200px',
    },
    {
      name: "Corner Site",
      selector: row => row.sitE_CORNERPLOT ? "YES" : "NO",
      center: true,
      width: '120px',
    },
    {
      name: "Type of Site",
      selector: row => row.sitE_TYPE || '',
      center: true,
      width: '120px',
    },
    {
      name: (
        <span title="East | West | North | South">Chakbandi</span>
      ),
      selector: row => `${row.sitE_EAST} | ${row.sitE_WEST} | ${row.sitE_NORTH} | ${row.sitE_SOUTH}`,
      center: true,
      width: '200px',
    },
    {
      name: "Latitude, Longitude",
      selector: row => `${row.sitE_LATITUDE}, ${row.sitE_LONGITUDE}`,
    },
  ];
  const releasedTableColumns = [
    // Conditionally add the "Actions" column only if selectedValue !== '100%'
    ...(String(selectedValue).trim() !== '1' ? [
      {
        name: 'Actions',
        selector: row => row.id,
        cell: (row, index) => (
          <button
            className="btn btn-danger"
            disabled={is60PercentDone && String(row.releasePhase).trim() === '60'}
            onClick={() => handleRemoveFromReleasedTable(index)}
          >
            <i className='fa fa-trash'></i>
          </button>
        ),
      }
    ] : []),

    //     {
    //   name: "Site ID",
    //   selector: row => row.sitE_ID || '',
    // },
    {
      name: 'Sl. No.',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '90px', center: true
    },
    {
      name: "Shape",
      selector: row => row.sitE_SHAPETYPE || '',
      width: '100px', center: true
    },
    {
      name: "Site Number",
      selector: row => row.sitE_NO || '',
      width: '120px', center: true
    },
    {
      name: "Block/Area",
      selector: row => row.sitE_AREA || '',
      width: '120px', center: true
    },
    {
      name: "No of sides",
      selector: row => row.sitE_NO_OF_SIDES || '',
      width: '120px', center: true
    },
    {
      name: "Dimension",
      cell: (row) => {
        if (row.sitE_SHAPETYPE === "Regular") {
          const feetSides = row.siteDimensions?.map(dim => dim.sitediM_SIDEINFT) || [];
          const meterSides = row.siteDimensions?.map(dim => dim.sitediM_SIDEINMT) || [];
          const roadFacingStatuses = row.siteDimensions?.map(dim => dim.sitediM_ROADFACING ? "yes" : "no") || [];

          return (
            <div className="dimension-cell">
              <div className="nowrap">{feetSides.join(" x ")} (ft)</div>
              <div className="nowrap">{meterSides.join(" x ")} (mtr)</div>
              <div className="nowrap"><b>Road Facing:</b> {roadFacingStatuses.join(", ")}</div>
            </div>
          );
        } else if (row.sitE_SHAPETYPE === "Irregular" && Array.isArray(row.siteDimensions)) {
          const feetString = row.siteDimensions.map(side => side.sitediM_SIDEINFT).join(' x ');
          const meterString = row.siteDimensions.map(side => side.sitediM_SIDEINMT).join(' x ');
          const roadFacingString = row.siteDimensions.map(side => side.sitediM_ROADFACING ? "Yes" : "No").join(', ');

          return (
            <div className="dimension-cell">
              <div className="nowrap">{feetString} (ft)</div>
              <div className="nowrap">{meterString} (m)</div>
              <div className="nowrap"><b>Road Facing:</b> {roadFacingString}</div>
            </div>
          );
        }
        return '';
      },
      center: true,
      width: '200px', // Add fixed width for better control
    },

    {
      name: "Total Area",
      selector: row => `${row.sitE_AREAINSQFT} [Sq.ft], ${row.sitE_AREAINSQMT} [Sq.mtr]`,
      center: true,
      width: '200px',
    },
    {
      name: "Corner Site",
      selector: row => row.sitE_CORNERPLOT ? "YES" : "NO",
      center: true,
      width: '120px',
    },
    {
      name: "Type of Site",
      selector: row => row.sitE_TYPE || '',
      center: true,
      width: '120px',
    },
    {
      name: (
        <span title="East | West | North | South">Chakbandi</span>
      ),
      selector: row => `${row.sitE_EAST} | ${row.sitE_WEST} | ${row.sitE_NORTH} | ${row.sitE_SOUTH}`,
      center: true,
      width: '200px',
    },
    {
      name: "Latitude, Longitude",
      selector: row => `${row.sitE_LATITUDE}, ${row.sitE_LONGITUDE}`,
    },
  ];
  const [is40PercentDone, setIs40PercentDone] = useState(false);
  const handleInitial60PercentSave = () => {
    const totalRecords = releaseData.length + releasedData.length;
    const expectedCount60 = Math.round(0.6 * totalRecords);
    const expectedCount40 = Math.round(0.4 * originalTotalRecords);
    const expectedCount30 = Math.round(0.3 * originalTotalRecords);

    if (selectedValue === '2') {
      if (releasedData.length < expectedCount60) {
        Swal.fire({
          icon: 'warning',
          title: 'Minimum Selection Required',
          text: `You must move at least ${expectedCount60} sites to the Already Released Table for 60 * 40.`,
          confirmButtonColor: '#3085d6',
        });
        return;
      }

      setFinalApiList(prev => {
        const updated = [...prev, ...releasedData];
        console.log("finalApiList after update:", updated);
        return updated;
      });

      setReleasedData([]);

      Swal.fire({
        icon: 'success',
        title: '60% Sites Released Successfully',
        text: 'You have successfully released 60% of the sites.',
        showCancelButton: true,
        confirmButtonText: 'Continue with Next Release',
        cancelButtonText: 'Back to Dashboard',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then((result) => {
        if (result.isConfirmed) {
          setIs60PercentDone(true);
          setShowNextReleaseForm(true);

          const remainingToSelect = totalRecords - expectedCount60;
          const remainingRows = releaseData.slice(0, remainingToSelect).map(row => row.id);

          setSelectedRows([]);
          setSelectedRows(remainingRows);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          window.location.href = '/dashboard';
        }
      });
    }

    else if (selectedValue === '3') {
      if (releasedData.length < expectedCount40) {
        Swal.fire({
          icon: 'warning',
          title: 'Minimum 40% Required',
          text: `You must release at least ${expectedCount40} sites for the 40% phase.`,
          confirmButtonColor: '#3085d6',
        });
        return;
      }

      setFinalApiList(prev => [...prev, ...releasedData]);
      setReleasedData([]);

      Swal.fire({
        icon: 'success',
        title: '40% Sites Released Successfully',
        text: 'You have successfully released 40% of the sites.',
        showCancelButton: true,
        confirmButtonText: 'Continue with Next 30% Release',
        cancelButtonText: 'Back to Dashboard',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then((result) => {
        if (result.isConfirmed) {
          setIs40PercentDone(true); // ✅ This is the correct flag
          setShowNextReleaseForm(true); // Continue to 30% release

          const next30Count = Math.floor(originalTotalRecords * 0.3);
          const next30Rows = releaseData
            .filter(row => !finalApiList.some(finalRow => finalRow.id === row.id)) // exclude already released
            .slice(0, next30Count)
            .map(row => row.id);

          setSelectedRows([]);
          setSelectedRows(next30Rows);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          window.location.href = '/dashboard';
        }
      });
    }

    else if (selectedValue === '1') {
      if (releasedData.length < originalTotalRecords) {
        Swal.fire({
          icon: 'warning',
          title: 'Incomplete Selection',
          text: `You must release all ${originalTotalRecords} sites.`,
          confirmButtonColor: '#3085d6',
        });
        return;
      }

      setFinalApiList(prev => [...prev, ...releasedData]);
      setReleasedData([]);

      Swal.fire({
        icon: 'success',
        title: 'All Sites Released Successfully',
        text: 'You have completed all release phases successfully.',
        confirmButtonColor: '#3085d6',
      });
    }
  };
  const [current30Step, setCurrent30Step] = useState(1);
  const handleFinal40PercentSave = () => {
    const expectedCount40 = Math.round(0.4 * originalTotalRecords);
    const expectedCount30 = Math.round(0.3 * originalTotalRecords);

    if (selectedValue === '2') {
      if (releasedData.length !== expectedCount40) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Selection',
          text: `You must move exactly ${expectedCount40} sites for the remaining 40%. You selected ${releasedData.length}.`,
          confirmButtonColor: '#d33',
        });
        return;
      }

      setFinalApiList(prev => {
        const updated = [...prev, ...releasedData];
        console.log("finalApiList after update (Final Save - 60*40):", updated);
        return updated;
      });

      setReleasedData([]);
      setShowNextReleaseForm(false);
      Swal.fire({
        icon: 'success',
        title: 'All Sites Released Successfully',
        text: 'You have completed all release phases successfully.',
        confirmButtonColor: '#3085d6',
      });

      return; // Exit early
    }

    if (selectedValue === '3') {
      const releasedSoFar = finalApiList.length;
      const nextExpected = expectedCount30;

      if (releasedData.length !== nextExpected) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Selection',
          text: `You must select exactly ${nextExpected} sites for this phase.`,
          confirmButtonColor: '#d33',
        });
        return;
      }

      setFinalApiList(prev => {
        const updated = [...prev, ...releasedData];
        console.log("finalApiList after update (Final Save - 40*30*30):", updated);
        return updated;
      });

      setReleasedData([]);

      if (current30Step === 1) {
        Swal.fire({
          icon: 'success',
          title: ' 30% Released',
          text: 'You have successfully released the 30% of the sites.',
          showCancelButton: true,
          confirmButtonText: 'Another release',
          cancelButtonText: 'Back to Dashboard',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
        }).then((result) => {
          if (result.isConfirmed) {
            setCurrent30Step(2); // Move to second 30%
            setShowNextReleaseForm(true);
            const alreadyReleasedIds = finalApiList.map(item => item.id);
            const next30Rows = releaseData
              .filter(row => !alreadyReleasedIds.includes(row.id))
              .slice(0, expectedCount30)
              .map(row => row.id);

            setSelectedRows([]);
            setSelectedRows(next30Rows);
          } else {
            window.location.href = '/dashboard';
          }
        });
      } else {
        setShowNextReleaseForm(false);
        Swal.fire({
          icon: 'success',
          title: 'All Sites Released',
          text: 'You have completed all release phases successfully.',
          confirmButtonColor: '#3085d6',
        });
      }
    }
  };
  const handleSiteReleaseOrderNumberChange = (e) => {
    const value = e.target.value;

    if (value === '') {
      setErrors(prev => ({ ...prev, siteReleaseOrderNumber: 'Site Release Order Number is required' }));
    } else if (/[^a-zA-Z0-9]/.test(value)) {
      setErrors(prev => ({ ...prev, siteReleaseOrderNumber: 'Only alphanumeric characters allowed (no spaces or special characters)' }));
    } else if (/^0/.test(value)) {
      setErrors(prev => ({ ...prev, siteReleaseOrderNumber: 'Should not start with 0' }));
    } else if (/^0+$/.test(value)) {
      setErrors(prev => ({ ...prev, siteReleaseOrderNumber: 'Cannot be all zeros' }));
    } else {
      setErrors(prev => ({ ...prev, siteReleaseOrderNumber: '' }));
    }

    setSiteReleaseOrderNumber(value);
  };
  // OnChange + validation for dateOfOrder
  const handleDateOfOrderChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setErrors(prev => ({ ...prev, dateOfOrder: 'Date of Order is required' }));
    } else if (new Date(value) > new Date()) {
      setErrors(prev => ({ ...prev, dateOfOrder: 'Future dates are not allowed' }));
    } else {
      setErrors(prev => ({ ...prev, dateOfOrder: '' }));
    }
    setDateOfOrder(value);
  };
  // OnChange + validation for orderFile
  const handleOrderFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setErrors(prev => ({ ...prev, orderFile: 'PDF file is required' }));
      setOrderFile(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, orderFile: 'Only PDF files are allowed' }));
      setOrderFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, orderFile: 'File must be less than 5MB' }));
      setOrderFile(null);
      return;
    }

    setErrors(prev => ({ ...prev, orderFile: '' }));
    setOrderFile(file);
  };
  const validateForm = () => {
    const newErrors = {};

    if (!siteReleaseOrderNumber) {
      newErrors.siteReleaseOrderNumber = 'Site Release Order Number is required';
    } else if (/[^a-zA-Z0-9]/.test(siteReleaseOrderNumber)) {
      newErrors.siteReleaseOrderNumber = 'Only alphanumeric characters allowed (no spaces or special characters)';
    } else if (/^0/.test(siteReleaseOrderNumber)) {
      newErrors.siteReleaseOrderNumber = 'Should not start with 0';
    } else if (/^0+$/.test(siteReleaseOrderNumber)) {
      newErrors.siteReleaseOrderNumber = 'Cannot be all zeros';
    }

    if (!dateOfOrder) {
      newErrors.dateOfOrder = 'Date of Order is required';
    } else if (new Date(dateOfOrder) > new Date()) {
      newErrors.dateOfOrder = 'Future dates are not allowed';
    }

    if (!orderFile) {
      newErrors.orderFile = 'PDF file is required';
    } else if (orderFile.type !== 'application/pdf') {
      newErrors.orderFile = 'Only PDF files are allowed';
    } else if (orderFile.size > 5 * 1024 * 1024) {
      newErrors.orderFile = 'File must be less than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = () => {
    if (!validateForm()) return;

    // Create new record object
    const newRecord = {
      id: Date.now(), // unique id for keys
      siteReleaseOrderNumber,
      dateOfOrder,
      orderFile,
      orderFileURL: URL.createObjectURL(orderFile) // create preview URL
    };

    // Add to savedRecords
    setSavedData(prev => [...prev, newRecord]);

    // Reset form
    setSiteReleaseOrderNumber('');
    setDateOfOrder('');
    setOrderFile(null);
    // Reset the actual file input DOM element
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    setErrors({});
  };
  //fetch EPID OR LKRSID 
  const [localLKRSID, setLocalLKRSID] = useState('');
  const handleInputChange = (e) => {
    let value = e.target.value;

    if (value.startsWith('l')) {
      value = 'L' + value.slice(1);
    }
    if (/^(L\d{0,9}|\d{0,10})$/.test(value)) {
      setLocalLKRSID(value);
    }
  };

  const handleSearchClick = (localLKRSID) => {
    if (!localLKRSID) {
      alert('Please enter EPID or KRSID');
      return;
    }

    // Remove leading 'L' or 'l' if present
    let trimmedLKRSID = localLKRSID;
    if (/^L\d+$/i.test(localLKRSID)) {
      trimmedLKRSID = localLKRSID.substring(1);
    }

    handleGetLKRSID(trimmedLKRSID);
  };

  const [selectedLandType, setSelectedLandType] = useState("");
  const handleGetLKRSID = async (localLKRSID) => {
    const payload = {
      level: 1,
      LkrsId: localLKRSID,
    };
    try {
      start_loader();
      const response = await fetch_LKRSID(payload);


      if (response && response.surveyNumberDetails && response.surveyNumberDetails.length > 0) {
        setLkrsTableData({
          lkrS_DISPLAYID: response.lkrS_DISPLAYID || '',
          lkrS_EPID: response.lkrS_EPID || '',
          lkrS_SITEAREA_SQFT: response.lkrS_SITEAREA_SQFT || '',
          lkrS_SITEAREA_SQMT: response.lkrS_SITEAREA_SQMT || '',
          lkrS_ECNUMBER: response.lkrS_ECNUMBER || ''
        });
        setSelectedLandType(response.lkrS_LANDTYPE); //  Store the land type

        await fetchApprovalListAndSetTable(localLKRSID);

        const parsedSurveyDetails = mapSurveyDetails(response.surveyNumberDetails);

        setRtcAddedData(prev => {
          const existingKeys = new Set(
            prev.map(item => `${item.surveyNumber}_${item.ownerName}`)
          );

          const filteredNewData = parsedSurveyDetails.filter(item => {
            const key = `${item.surveyNumber}_${item.ownerName}`;
            return !existingKeys.has(key);
          });

          return [...prev, ...filteredNewData];
        });
        Fetch_release_percentage(response.lkrS_ID);
        stop_loader();
      } else if (response && response.khataDetails && response.khataOwnerDetails && response.khataOwnerDetails.length > 0) {
        setLkrsTableData({
          lkrS_DISPLAYID: response.lkrS_DISPLAYID || '',
          lkrS_EPID: response.lkrS_EPID || '',
          lkrS_SITEAREA_SQFT: response.lkrS_SITEAREA_SQFT || '',
          lkrS_SITEAREA_SQMT: response.lkrS_SITEAREA_SQMT || '',
          lkrS_ECNUMBER: response.lkrS_ECNUMBER || ''
        });

        setSelectedLandType(response.lkrS_LANDTYPE); //  Store the land type
        await fetchApprovalListAndSetTable(localLKRSID);
        setEPIDShowTable(true);
        let khataDetailsJson = {};
        if (response.khataDetails?.khatA_JSON) {
          try {
            khataDetailsJson = JSON.parse(response.khataDetails.khatA_JSON);
          } catch (err) {
            console.warn("Failed to parse khatA_JSON", err);
          }
        }

        setEPID_FetchedData({
          PropertyID: response.lkrS_EPID || '',
          PropertyCategory: khataDetailsJson.propertyCategory || '',
          PropertyClassification: khataDetailsJson.propertyClassification || '',
          WardNumber: khataDetailsJson.wardNumber || '',
          WardName: khataDetailsJson.wardName || '',
          StreetName: khataDetailsJson.streetName || '',
          Streetcode: khataDetailsJson.streetcode || '',
          SASApplicationNumber: khataDetailsJson.sasApplicationNumber || '',
          IsMuation: khataDetailsJson.isMuation || '',
          KaveriRegistrationNumber: khataDetailsJson.kaveriRegistrationNumber || [],
          AssessmentNumber: khataDetailsJson.assessmentNumber || '',
          courtStay: khataDetailsJson.courtStay || '',
          enquiryDispute: khataDetailsJson.enquiryDispute || '',
          CheckBandi: khataDetailsJson.checkBandi || {},
          SiteDetails: khataDetailsJson.siteDetails || {},
          OwnerDetails: khataDetailsJson.ownerDetails || [],
          // Optionally add raw API response too if needed
          rawResponse: response,
        });

        // Optionally update area sqft if siteDetails present
        if (khataDetailsJson.siteDetails?.siteArea) {
          setAreaSqft(khataDetailsJson.siteDetails.siteArea);
          sessionStorage.setItem('areaSqft', khataDetailsJson.siteDetails.siteArea);
        } else {
          setAreaSqft(0);
          sessionStorage.removeItem('areaSqft');
        }

        setOwnerTableData(khataDetailsJson.ownerDetails || []);
        Fetch_release_percentage(response.lkrS_ID);
        stop_loader();
      } else {
        stop_loader();
        Swal.fire({
          text: "No survey details found.",
          icon: "warning",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      stop_loader();
      console.error("Failed to fetch LKRSID data:", error);
    }
  };
  // =======================================================survey no details starts=========================================
  const [rtcAddedData, setRtcAddedData] = useState([]);
  const [areaSqft, setAreaSqft] = useState("0");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rtcData, setRtcData] = useState([]);
  const combinedData = [...rtcAddedData, ...rtcData];


  // Define state variables for your totals - keep them as numbers
  const [totalAcre, setTotalAcre] = useState(0);
  const [totalGunta, setTotalGunta] = useState(0);
  const [totalFGunta, setTotalFGunta] = useState(0);
  const [totalSqFt, setTotalSqFt] = useState(0); // Changed to number (0)
  const [totalSqM, setTotalSqM] = useState(0); // Changed to number (0)


  useEffect(() => {
    let calculatedTotalAcre = 0;
    let calculatedTotalGunta = 0;
    let calculatedTotalFGunta = 0;
    let calculatedTotalSqFt = 0;
    let calculatedTotalSqM = 0;

    combinedData.forEach((row) => {
      const acre = parseFloat(row.ext_acre || 0);
      const gunta = parseFloat(row.ext_gunta || 0);
      const fgunta = parseFloat(row.ext_fgunta || 0);

      calculatedTotalAcre += acre;
      calculatedTotalGunta += gunta;
      calculatedTotalFGunta += fgunta;

      const sqft = (acre * 43560) + (gunta * 1089) + (fgunta * 68.0625);
      calculatedTotalSqFt += sqft;
      calculatedTotalSqM += sqft * 0.092903;
    });

    // Normalize fgunta -> gunta -> acre
    calculatedTotalGunta += Math.floor(calculatedTotalFGunta / 16);
    calculatedTotalFGunta = calculatedTotalFGunta % 16;
    calculatedTotalAcre += Math.floor(calculatedTotalGunta / 40);
    calculatedTotalGunta = calculatedTotalGunta % 40;

    // Update state variables with the calculated totals
    setTotalAcre(calculatedTotalAcre);
    setTotalGunta(calculatedTotalGunta);
    setTotalFGunta(calculatedTotalFGunta);
    // Store them as numbers in state
    setTotalSqFt(calculatedTotalSqFt);
    setTotalSqM(calculatedTotalSqM);

    // Store the rounded value in sessionStorage if that's what's intended
    sessionStorage.setItem('areaSqft', calculatedTotalSqFt.toFixed(2));

  }, [combinedData]);

  const totalPages = Math.ceil(combinedData.length / rowsPerPage);
  const paginatedData = combinedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (LKRS_ID) {
      setLocalLKRSID(LKRS_ID);
    }
  }, [LKRS_ID]);

  const mapSurveyDetails = (surveyDetails) => {
    return surveyDetails.map((item) => ({
      district: item.suR_DISTRICT_Name || "—",
      taluk: item.suR_TALUK_Name || "—",
      hobli: item.suR_HOBLI_Name || "—",
      village: item.suR_VILLAGE_Name || "—",
      owner: item.suR_OWNERNAME || "—",
      survey_no: item.suR_SURVEYNO,
      surnoc: item.suR_SURNOC,
      hissa_no: item.suR_HISSA,
      ext_acre: item.suR_EXTACRE || 0,
      ext_gunta: item.suR_EXTGUNTA || 0,
      ext_fgunta: item.suR_EXTFgunta || 0,
    }));
  };

  // =======================================================Khata details starts=========================================
  const [epidshowTable, setEPIDShowTable] = useState(false);
  const [epid_fetchedData, setEPID_FetchedData] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState({});
  const [ownerTableData, setOwnerTableData] = useState([]);


  const customStyles = {
    headCells: {
      style: {
        fontWeight: 'bold',
        fontSize: '14px',
        backgroundColor: '#f1f5f9',
        color: '#1e293b',
        padding: '12px',
        borderBottom: '1px solid #e2e8f0',
      },
    },
    cells: {
      style: {
        padding: '10px 12px',
        fontSize: '13px',
        color: '#374151',
      },
    },
    rows: {
      style: {
        minHeight: '48px',
        borderBottom: '1px solid #f3f4f6',
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #e5e7eb',
        padding: '10px',
      },
    },
    stripedStyle: {
      default: {
        backgroundColor: '#f9fafb',
      },
    },
  };

  const columns = [
    { name: 'S.No', selector: (row, index) => index + 1, width: '70px', center: true },
    { name: 'Property ID', width: '140px', selector: () => epid_fetchedData?.PropertyID, center: true },
    {
      name: 'Owner Name',
      center: true,
      // Access ownerName directly from the 'row' object
      selector: (row) => row.ownerName || 'N/A'
    },

    { name: 'ID Type', width: '120px', selector: () => epid_fetchedData?.OwnerDetails?.[0].idType || 'N/A', center: true },
    { name: 'ID Number', width: '220px', selector: () => epid_fetchedData?.OwnerDetails?.[0].idNumber || 'N/A', center: true },
    // {
    //   name: 'Validate OTP',
    //   width: '250px',
    //   cell: (row, index) => (
    //     <div className='mb-3'><br />
    //       <input
    //         type="tel"
    //         className="form-control mb-1"
    //         placeholder="Mobile Number"
    //         readOnly
    //         value={
    //           phoneNumbers[index] ??
    //           row.MobileNumber ??
    //           epid_fetchedData?.OwnerDetails?.[0]?.mobileNumber ??
    //           ""
    //         }
    //         maxLength={10}
    //       />

    //       <div className="text-success font-weight-bold mt-2">
    //         OTP Verified <i className="fa fa-check-circle"></i>
    //       </div>

    //     </div>
    //   ), center: true
    // }
  ];
  const [release_Data, setRelease_Data] = useState(null); // Entire response
  const [releaseDetails, setReleaseDetails] = useState([]);
  //Fetch release Details
  const Fetch_release_percentage = async (localLKRSID) => {
    try {
      start_loader();
      const response = await fetch_releasePercentageDetails(localLKRSID);

      if (response) {
        console.log(response);

        setRelease_Data(response); // store full response if needed
        setReleaseDetails(response.siteReleaseDetailList || []); // set only list

        // Extract and use `sitE_RELS_SITE_RELSTYPE_ID`
        const releaseTypeId = response.sitE_RELS_SITE_RELSTYPE_ID?.toString();

        if (releaseTypeId) {
          handleDimensionChange(releaseTypeId);
        }
        fetchReleaseOrder(localLKRSID);
        stop_loader();
      } else {
        stop_loader();
      }
    } catch (error) {
      stop_loader();
      console.error("Failed to fetch LKRSID data:", error);
    }
  };
  const fetchReleaseOrder = async (localLKRSID) => {
    try {
      const listPayload = {
        level: 1,
        LkrsId: localLKRSID,
        SiteID: 0,
      };
      start_loader();
      const response = await individualSiteListAPI(listPayload);

      if (Array.isArray(response)) {
        // Filter only unreleased sites
        const unreleasedSites = response.filter(site => site.sitE_IS_SITE_RELEASED === false);
        setReleaseData(unreleasedSites); // Only set unreleased records
        const releasedSites = response.filter(site => site.sitE_IS_SITE_RELEASED === true);
        setFinalApiList(releasedSites);
      }
    } catch (error) {
      console.error("Fetch Site Details Error:", error);
      if (error.response) {
        console.error("API responded with error data:", error.response.data);
      } else if (error.request) {
        console.error("No response received from API. Request was:", error.request);
      }
    } finally {
      stop_loader();
    }
  };

  const releaseSites = async () => {
    try {
      const payload = {
        sitE_LKRS_ID: LKRS_ID,
        sitE_SITE_RELS_ID: 0,
        site_Remarks: "",
        site_AdditionalInfo: "",
        site_UpdatedBy: 0,
        site_UpdatedName: "user",
        site_UpdatedRole: "user",
        releaseSiteList: releasedData.map(site => ({
          sitE_ID: site.sitE_ID
        }))
      };

      start_loader();
      const response = await final_Release_Sites(payload);
      console.log("Release response:", response);

      Swal.fire({
        title: "Site released successfully!",
        icon: 'success',
        confirmButtonText: 'OK'
      });
      setReleasedData([]);             // Clear the unreleased table data
      setSelectedRows([]);


      fetchReleaseOrder(localLKRSID);  // To refresh `releaseData`
      fetchFinalReleasedSites(localLKRSID);  // Separate function for `sitE_IS_SITE_RELEASED === true`

    } catch (error) {
      console.error("Release API Error:", error);
      if (error.response) {
        console.error("API responded with error data:", error.response.data);
      } else if (error.request) {
        console.error("No response received from API. Request was:", error.request);
      }
    } finally {
      stop_loader();
    }
  };
  const fetchFinalReleasedSites = async (localLKRSID) => {
    try {
      const listPayload = {
        level: 1,
        LkrsId: localLKRSID,
        SiteID: 0,
      };
      const response = await individualSiteListAPI(listPayload);

      if (Array.isArray(response)) {
        const releasedSites = response.filter(site => site.sitE_IS_SITE_RELEASED === true);
        setFinalApiList(releasedSites); // ✅ Move to final table
      }
    } catch (error) {
      console.error("Final Released Sites Fetch Error:", error);
    }
  };
  const alreadyreleasedTableColumns = [
    {
      name: 'Sl. No.',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '90px', center: true
    },
    {
      name: "Shape",
      selector: row => row.sitE_SHAPETYPE || '',
      width: '100px', center: true
    },
    {
      name: "Site Number",
      selector: row => row.sitE_NO || '',
      width: '120px', center: true
    },
    {
      name: "Block/Area",
      selector: row => row.sitE_AREA || '',
      width: '120px', center: true
    },
    {
      name: "No of sides",
      selector: row => row.sitE_NO_OF_SIDES || '',
      width: '120px', center: true
    },
    {
      name: "Dimension",
      cell: (row) => {
        if (row.sitE_SHAPETYPE === "Regular") {
          const feetSides = row.siteDimensions?.map(dim => dim.sitediM_SIDEINFT) || [];
          const meterSides = row.siteDimensions?.map(dim => dim.sitediM_SIDEINMT) || [];
          const roadFacingStatuses = row.siteDimensions?.map(dim => dim.sitediM_ROADFACING ? "yes" : "no") || [];

          return (
            <div className="dimension-cell">
              <div className="nowrap">{feetSides.join(" x ")} (ft)</div>
              <div className="nowrap">{meterSides.join(" x ")} (mtr)</div>
              <div className="nowrap"><b>Road Facing:</b> {roadFacingStatuses.join(", ")}</div>
            </div>
          );
        } else if (row.sitE_SHAPETYPE === "Irregular" && Array.isArray(row.siteDimensions)) {
          const feetString = row.siteDimensions.map(side => side.sitediM_SIDEINFT).join(' x ');
          const meterString = row.siteDimensions.map(side => side.sitediM_SIDEINMT).join(' x ');
          const roadFacingString = row.siteDimensions.map(side => side.sitediM_ROADFACING ? "Yes" : "No").join(', ');

          return (
            <div className="dimension-cell">
              <div className="nowrap">{feetString} (ft)</div>
              <div className="nowrap">{meterString} (m)</div>
              <div className="nowrap"><b>Road Facing:</b> {roadFacingString}</div>
            </div>
          );
        }
        return '';
      },
      center: true,
      width: '200px', // Add fixed width for better control
    },

    {
      name: "Total Area",
      selector: row => `${row.sitE_AREAINSQFT} [Sq.ft], ${row.sitE_AREAINSQMT} [Sq.mtr]`,
      center: true,
      width: '200px',
    },
    {
      name: "Corner Site",
      selector: row => row.sitE_CORNERPLOT ? "YES" : "NO",
      center: true,
      width: '120px',
    },
    {
      name: "Type of Site",
      selector: row => row.sitE_TYPE || '',
      center: true,
      width: '120px',
    },
    {
      name: (
        <span title="East | West | North | South">Chakbandi</span>
      ),
      selector: row => `${row.sitE_EAST} | ${row.sitE_WEST} | ${row.sitE_NORTH} | ${row.sitE_SOUTH}`,
      center: true,
      width: '200px',
    },
    {
      name: "Latitude, Longitude",
      selector: row => `${row.sitE_LATITUDE}, ${row.sitE_LONGITUDE}`,
    },
  ];
  const [lkrsTableData, setLkrsTableData] = useState({
    lkrS_DISPLAYID: '',
    lkrS_EPID: '',
    lkrS_SITEAREA_SQFT: '',
    lkrS_SITEAREA_SQMT: '',
    lkrS_ECNUMBER: '',
  });
  const [approvalTableData, setApprovalTableData] = useState({
    approvalOrderNo: '',
    releaseType: '',
    totalNoOfSites: '',
  });
  const fetchApprovalListAndSetTable = async (localLKRSID) => {
    try {
      const listPayload = {
        level: 1,
        aprLkrsId: localLKRSID,
        aprId: 0,
      };

      const listResponse = await listApprovalInfo(listPayload);

      if (Array.isArray(listResponse) && listResponse.length > 0) {
        const firstItem = listResponse[0];  // Assuming you want the first record

        setApprovalTableData({
          approvalOrderNo: firstItem.apr_Approval_No || '',
          releaseType: firstItem.sitE_RELS_SITE_RELSTYPE || '',
          totalNoOfSites: firstItem.lkrS_NUMBEROFSITES || '',
        });
      } else {
        setApprovalTableData({
          approvalOrderNo: '',
          releaseType: '',
          totalNoOfSites: '',
        });
      }
    } catch (err) {
      console.error("Error in fetchApprovalListAndSetTable:", err);
    }
  };



  return (
    <DashboardLayout>
      <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
        {loading && <Loader />}
        <div className="my-3 my-md-5">
          <div className="container mt-5">

            {/* Release Table */}
            <div className="card">
              <div className="card-header layout_btn_color">
                <h5 className="card-title" style={{ textAlign: 'center' }}>Release dashboard</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className='col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-2'>
                    <div className="form-group">
                      <label className='form-label'>Enter the EPID or KRSID to fetch details <span className='mandatory_color'>*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter the EPID or KRSID"
                        maxLength={10}
                        value={localLKRSID}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className='col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2  mt-2'>
                    <div className="form-group">
                      <label className='form-label'>&nbsp;</label>
                      <button className='btn btn-primary btn-block' onClick={() => handleSearchClick(localLKRSID)}>
                        Search
                      </button>
                    </div>
                  </div>
                  <div className="form-group mt-2" hidden>
                    <label className="form-label">Select Dimension</label>
                    <select className="form-control" value={selectedValue} onChange={handleDimensionChange}>
                      <option value="">-- Select Dimension --</option>
                      <option value="100">100%</option>
                      <option value="60*40">60 * 40</option>
                      <option value="40*30*30">40 * 30 * 30</option>
                    </select>
                  </div>

                </div>
                {(lkrsTableData.lkrS_DISPLAYID && approvalTableData.approvalOrderNo) && (
                  <>
                    <h5>Property Details</h5>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <tbody>
                        <tr>
                          <th style={thStyle}>LKRS ID</th>
                          <td style={tdStyle}>{lkrsTableData.lkrS_DISPLAYID}</td>
                          <th style={thStyle}>Mother EPID</th>
                          <td style={tdStyle}>{lkrsTableData.lkrS_EPID}</td>
                        </tr>
                        <tr>
                          <th style={thStyle}>Total No of Sites</th>
                          <td style={tdStyle}> {approvalTableData.totalNoOfSites}</td>
                          <th style={thStyle}>Total Extent</th>
                          <td style={tdStyle}>{lkrsTableData.lkrS_SITEAREA_SQFT} [SQFT] , {lkrsTableData.lkrS_SITEAREA_SQMT} [SQM]</td>
                        </tr>
                        <tr>
                          <th style={thStyle}>DC Conversion</th>
                          <td style={tdStyle}>N/A</td>
                          <th style={thStyle}>Approval Order No</th>
                          <td style={tdStyle}>{approvalTableData.approvalOrderNo || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th style={thStyle}>Release Type</th>
                          <td style={tdStyle}>{approvalTableData.releaseType || 'N/A'}</td>
                          <th style={thStyle}>EC Number</th>
                          <td style={tdStyle}>{lkrsTableData.lkrS_ECNUMBER || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                <hr />
                {selectedLandType === "surveyNo" && (
                  <>
                    {combinedData.length > 0 && (
                      <div className="col-12">
                        <div className="">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className=" m-0">Survey No Details</h4>
                            <div className="d-flex align-items-center">
                              <label className="me-2 mb-0">Rows per page:</label>
                              <select
                                className="form-select form-select-sm w-auto"
                                value={rowsPerPage}
                                onChange={handlePageSizeChange}
                              >
                                {[5, 10, 15, 20, 25, 30].map((size) => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="table-responsive custom-scroll-table">
                            <table className="table table-striped table-hover table-bordered rounded-table">
                              <thead className="table-primary sticky-header">
                                <tr>
                                  <th hidden>Action</th>
                                  <th>S.No</th>
                                  <th>District</th>
                                  <th>Taluk</th>
                                  <th>Hobli</th>
                                  <th>Village</th>
                                  <th>Owner Name</th>
                                  <th>SNo / Surnoc / Hissa</th>
                                  <th>Extent (Acre.Gunta.Fgunta)</th>
                                  <th>SqFt</th>
                                  <th>SqM</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedData.map((row, index) => (
                                  <tr key={index}>
                                    <td hidden>
                                    </td>
                                    <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                                    <td>{row.district}</td>
                                    <td>{row.taluk}</td>
                                    <td>{row.hobli}</td>
                                    <td>{row.village}</td>
                                    <td>{row.owner}</td>
                                    <td>{`${row.survey_no}/${row.surnoc}/${row.hissa_no}`}</td>
                                    <td>{`${row.ext_acre}.${row.ext_gunta}.${row.ext_fgunta}`}</td>
                                    <td>
                                      {(
                                        (parseFloat(row.ext_acre) * 43560) +
                                        (parseFloat(row.ext_gunta) * 1089) +
                                        (parseFloat(row.ext_fgunta) * 68.0625)
                                      ).toFixed(2)}
                                    </td>
                                    <td>
                                      {(
                                        (
                                          (parseFloat(row.ext_acre) * 43560) +
                                          (parseFloat(row.ext_gunta) * 1089) +
                                          (parseFloat(row.ext_fgunta) * 68.0625)
                                        ) * 0.092903
                                      ).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot >
                                <tr>
                                  <th colSpan={5}></th>
                                  <th colSpan={2} className="text-end fw-bold">Total Area:</th>
                                  <th className="text-left fw-bold" >{`${totalAcre}.${totalGunta}.${totalFGunta}`}</th>
                                  <th className='fw-bold'>{totalSqFt.toFixed(2)}</th>
                                  <th className='fw-bold'>{totalSqFt.toFixed(2)}</th>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          {/* Pagination Summary and Controls */}
                          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                            <div>
                              Showing {Math.min((currentPage - 1) * rowsPerPage + 1, combinedData.length)}–{Math.min(currentPage * rowsPerPage, combinedData.length)} of {combinedData.length} records
                            </div>

                            <div>
                              <button
                                className="btn btn-outline-secondary btn-sm mx-1"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </button>
                              {[...Array(totalPages).keys()].map((num) => (
                                <button
                                  key={num}
                                  className={`btn btn-sm mx-1 ${currentPage === num + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                                  onClick={() => goToPage(num + 1)}
                                >
                                  {num + 1}
                                </button>
                              ))}
                              <button
                                className="btn btn-outline-secondary btn-sm mx-1"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    )
                    }
                  </>
                )}
                {/* EPID preview block */}
                {(selectedLandType === "khata") && (
                  <>
                    {epidshowTable && epid_fetchedData && (
                      <div>
                        <h5>Property Owner details as per BBMP eKhata</h5>
                        <h6>Note: Plot-wise New Khata will be issued in owner's name. Hence, if owner has changed then first get Mutation done in eKhata.</h6>
                        {/* <h6>If there has been a change in ownership, the Mutation process in eKhata must be completed first, as the New Khata will be issued in the owner's name.</h6> */}
                        <DataTable
                          columns={columns}
                          data={epid_fetchedData?.OwnerDetails || []}
                          pagination
                          noHeader
                          dense={false}
                          customStyles={customStyles}
                        />

                      </div>
                    )}
                  </>
                )}
                <hr />
                
                {releaseDetails.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h2 style={{ marginBottom: '15px', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                      Layout Release Order
                    </h2>
                    <table style={{
                      borderCollapse: "collapse",
                      width: "100%",
                      fontFamily: "Arial, sans-serif",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: "#fff", color: "#000", textAlign: "left" }}>
                          {/* <th style={thStyle}>ID</th> */}
                          <th style={thStyle}>KRS ID</th>
                          <th style={thStyle}>Site Release order Number</th>
                          <th style={thStyle}>Date of Order</th>
                          <th style={thStyle}>Designation of Authority issued </th>
                          <th style={thStyle}>Release Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {releaseDetails.map((item, index) => (
                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                            {/* <td style={tdStyle}>{item.sitE_RELS_ID}</td> */}
                            <td style={tdStyle}>{item.sitE_RELS_LKRS_ID}</td>
                            <td style={tdStyle}>{item.sitE_RELS_ORDER_NO}</td>
                            <td style={tdStyle}>{new Date(item.sitE_RELS_DATE).toLocaleDateString()}</td>
                            <td style={tdStyle}>{item.sitE_RELS_APPROVALDESIGNATION}</td>
                            <td style={tdStyle}>{item.sitE_RELS_SITE_RELSTYPE}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {showNextReleaseForm && (
                  <div className="card mt-4">
                    <div className="card-header layout_btn_color">
                      <h5 className="card-title text-center">Next Release Details (40%)</h5>
                    </div>
                    <div className="card-body">
                      <div className='row'>
                        <div className='col-md-4'>
                          <div className="form-group mb-3">
                            <label>Site Release Order Number <span className='mandatory_color'>*</span></label>
                            <input
                              type="text"
                              className={`form-control ${errors.siteReleaseOrderNumber ? 'is-invalid' : ''}`}
                              value={siteReleaseOrderNumber}
                              onChange={handleSiteReleaseOrderNumberChange}
                            />
                            {errors.siteReleaseOrderNumber && (
                              <div className="invalid-feedback">{errors.siteReleaseOrderNumber}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <label>Date Of Order</label>
                          <input
                            type="date"
                            className={`form-control ${errors.dateOfOrder ? 'is-invalid' : ''}`}
                            value={dateOfOrder}
                            onChange={handleDateOfOrderChange}
                            max={new Date().toISOString().split('T')[0]} // Restrict future dates
                          />
                          {errors.dateOfOrder && <div className="invalid-feedback">{errors.dateOfOrder}</div>}
                        </div>

                        <div className="col-md-4">
                          <label>Scan & Upload Order of Site Release</label>
                          <input
                            type="file"
                            accept="application/pdf"
                            className={`form-control ${errors.orderFile ? 'is-invalid' : ''}`}
                            onChange={handleOrderFileChange} ref={fileInputRef}
                          />
                          {errors.orderFile && <div className="invalid-feedback">{errors.orderFile}</div>}
                        </div>


                        <div className='col-md-4'></div>
                        <div className='col-md-4'>
                          <button className="btn btn-success btn-block" onClick={handleSave}>
                            Save Next Release
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table Display */}
                {savedData.length > 0 && (
                  <div className="card mt-4">
                    <div className="card-header">
                      <h5>Saved Release Records</h5>
                    </div>
                    <div className="card-body table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Site Release Order Number</th>
                            <th>Date Of Order</th>
                            <th>Uploaded File</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedData.map(record => (
                            <tr key={record.id}>
                              <td>{record.siteReleaseOrderNumber}</td>
                              <td>{record.dateOfOrder}</td>
                              <td>
                                <a
                                  href={record.orderFileURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View PDF
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>
             <div className="card">
  <div className="card-header layout_btn_color">
    <h5 className="card-title" style={{ textAlign: 'center' }}>Sites to be released</h5>
  </div>
  <div className="card-body">
    <div className='row'>
      <div className='col-md-12 my-3'>
        {((selectedValue === '2' && releasedData.length === 0) || selectedValue === '3' || selectedValue === '1') && (
          <p style={{
            backgroundColor: '#e8f4ff',
            border: '1px solid #b3d8ff',
            padding: '10px 15px',
            borderRadius: '6px',
            color: '#0056b3',
            fontWeight: '500',
            marginTop: '10px'
          }}>
            {selectedRows.length} record selected
          </p>
        )}

        {releaseData.length > 0 ? (
          <>
            <DataTable
              columns={releaseTableColumns}
              data={releaseData}
              customStyles={customStyles}
              pagination
              highlightOnHover
              striped
            />
            <div className='row'>
              <div className='col-md-9'></div>
              <div className='col-md-3'>
                <button className="btn btn-primary btn-block mt-3" onClick={moveToReleasedTable}>
                  Add
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            fontWeight: '500',
            color: '#999'
          }}>
            There are no sites to display
          </div>
        )}
      </div>
    </div>
  </div>
</div>

           

            {/* Already Released Table */}
            {releasedData.length > 0 && (
              <div className="card">
                <div className="card-header layout_btn_color">
                  <h5 className="card-title" style={{ textAlign: 'center' }}>Selected sites</h5>
                </div>
                <div className="card-body">
                  <div className='row'>
                    <div className='col-md-12 my-3'>
                      <DataTable
                        columns={releasedTableColumns}
                        data={releasedData}
                        customStyles={customStyles}
                        pagination
                        highlightOnHover
                        striped
                      />

                    </div>
                    <div className='col-md-9'></div>
                    {finalApiList.length === 0 && (
                      <div className='col-md-3'>
                        <button
                          className="btn btn-primary btn-block mt-3"
                          // onClick={handleInitial60PercentSave}
                          onClick={releaseSites}
                        >
                          Save
                        </button>
                      </div>
                    )}

                    {finalApiList.length !== 0 && (
                      <div className='col-md-3'>
                        <button
                          className="btn btn-primary btn-block mt-3"
                          onClick={handleFinal40PercentSave}
                        >
                          Final Save
                        </button>
                      </div>
                    )}


                  </div>
                </div>
              </div>
            )}


            {/* Final API list Table */}
            {finalApiList.length > 0 && (
              <div className="card mt-4">
                <div className="card-header layout_btn_color">
                  <h5 className="card-title" style={{ textAlign: 'center' }}>Released sites </h5>
                </div>
                <div className="card-body">
                  <DataTable
                    columns={alreadyreleasedTableColumns}
                    data={finalApiList}
                    customStyles={customStyles}
                    pagination
                    striped
                    highlightOnHover
                    responsive
                  />

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const thStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  fontWeight: "600",
  fontSize: "14px"
};

const tdStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  fontSize: "14px",
  color: "#333"
};

export default ReleaseSelection;
