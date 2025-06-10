import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../Layout/DashboardLayout';
import Loader from "../../Layout/Loader";
import DataTable from 'react-data-table-component';
import '../../Styles/CSS/ReleaseSiteSelection.css';
import Swal from "sweetalert2";

const ReleaseSelection = () => {
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');

  // Sample data for the DataTable
  const sampleData = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    dimension: `Dimension ${index + 1}`,
    status: index % 2 === 0 ? 'Released' : 'Pending',
    date: new Date().toLocaleDateString(),
  }));

  const [releaseData, setReleaseData] = useState(sampleData); // Data for the "Release Table"
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
    if (originalTotalRecords === 0 && (releaseData.length > 0 || finalApiList.length > 0)) {
      const total = releaseData.length + finalApiList.length;
      setOriginalTotalRecords(total);
    }
  }, [releaseData, finalApiList, originalTotalRecords]);


  const totalRecords = releaseData.length + releasedData.length;
  const sixtyPercentCount = Math.round(0.6 * originalTotalRecords);
  const fortyPercentCount = originalTotalRecords - sixtyPercentCount;

  const handleRowSelect = (row) => {

    const isSelected = selectedRows.includes(row.id);
    if (isSelected) {
      setSelectedRows((prev) => prev.filter((id) => id !== row.id));
    } else if (selectedValue !== '60*40' || selectedRows.length < selectionLimit) {
      setSelectedRows((prev) => [...prev, row.id]);
    } else if (selectedValue !== '60*40' && selectedValue !== '40*30*30' || selectedRows.length < selectionLimit) {
      setSelectedRows((prev) => [...prev, row.id]);
    }
  };
  const handleSelectAll = (e) => {
    const checked = e.target.checked;

    if (selectedValue === '100') {
      if (checked) {
        const allIds = releaseData.map(row => row.id);
        setSelectedRows(allIds);
      } else {
        setSelectedRows([]);
      }
    }
    if (selectedValue === '60*40') {
      const totalCount = releaseData.length + releasedData.length;
      const sixtyPercentCount = Math.round(0.6 * originalTotalRecords);
      const alreadyReleased = releasedData.length;

      if (checked) {
        let rowsToSelect;

        if (alreadyReleased < sixtyPercentCount) {
          // Still in 60% phase – limit selection to remaining slots
          const remainingSlots = sixtyPercentCount - alreadyReleased;
          rowsToSelect = releaseData.slice(0, remainingSlots).map(row => row.id);
        } else {
          // In 40% phase – limit selection to remaining slots
          const remainingSlots = totalCount - alreadyReleased;
          rowsToSelect = releaseData.slice(0, remainingSlots).map(row => row.id);
        }

        setSelectedRows(rowsToSelect);
      } else {
        // Deselect only those in current releaseData
        const updatedSelection = selectedRows.filter(
          id => !releaseData.map(row => row.id).includes(id)
        );
        setSelectedRows(updatedSelection);
      }
    }
    if (selectedValue === '40*30*30') {
      const fortyPercent = Math.round(0.4 * originalTotalRecords);
      const thirtyPercent = Math.round(0.3 * originalTotalRecords);
      const alreadyReleased = finalApiList.length;
      const totalCount = releaseData.length + finalApiList.length;

      if (checked) {
        let rowsToSelect = [];

        if (alreadyReleased < fortyPercent) {
          const remaining = fortyPercent - alreadyReleased;
          rowsToSelect = releaseData.slice(0, remaining).map(row => row.id);
        } else if (alreadyReleased === fortyPercent) {
          const remaining = thirtyPercent;
          rowsToSelect = releaseData.slice(0, remaining).map(row => row.id);
        } else if (alreadyReleased === (fortyPercent + thirtyPercent)) {
          const remaining = originalTotalRecords - alreadyReleased;
          rowsToSelect = releaseData.slice(0, remaining).map(row => row.id);
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
        const updatedSelection = selectedRows.filter(
          id => !releaseData.map(row => row.id).includes(id)
        );
        setSelectedRows(updatedSelection);
      }
    }


    setSelectAllChecked(checked);
  };


  const handleDimensionChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
    setSelectAllChecked(false);
    setSelectedRows([]);

    const total = releaseData.length + releasedData.length;
    const sixtyPercentCount = Math.round(0.6 * originalTotalRecords);
    const fortyPercentCount = originalTotalRecords - sixtyPercentCount;

    if (value === '60*40') {
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
    } else if (value === '40*30*30') {
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

  // const moveToReleasedTable = () => {
  //   const sixtyPercentCount = Math.round(0.6 * originalTotalRecords);
  //   const fortyPercentCount = originalTotalRecords - sixtyPercentCount;
  //   const releasedCount = releasedData.length; // how many already released
  //   const allowedCount = sixtyPercentCount - releasedCount;
  //   let shouldProceed = true;
  //   const totalReleased = releasedData.length;
  //   const selectedCount = selectedRows.length;


  //   if (selectedValue === '100') {
  //     if (releasedData.length > 0) {
  //       Swal.fire({
  //         icon: 'info',
  //         title: 'Cannot perform 100% release',
  //         text: 'Some records have already been released. 100% release must be done in one go.',
  //         confirmButtonColor: '#3085d6',
  //       });
  //       shouldProceed = false;
  //     } else if (selectedRows.length !== originalTotalRecords) {
  //       Swal.fire({
  //         icon: 'warning',
  //         title: 'Invalid Selection',
  //         text: `You must select all ${originalTotalRecords} records to complete 100% release.`,
  //         confirmButtonColor: '#3085d6',
  //       });
  //       shouldProceed = false;
  //     }
  //   }

  //   if (selectedValue === '60*40') {
  //     if (finalApiList.length === 0) {
  //       // First phase - 60%
  //       if (releasedCount === sixtyPercentCount) {
  //         Swal.fire({
  //           icon: 'info',
  //           html: `
  //     <p><strong>60% of records have already been successfully released.</strong></p>
  //     <p>No additional records can be added for this release phase.</p>
  //   `,
  //           confirmButtonColor: '#3085d6',
  //         });
  //         shouldProceed = false;
  //       } else if (selectedRows.length !== allowedCount) {
  //         Swal.fire({
  //           icon: 'warning',
  //           title: 'Invalid Selection',
  //           text: `You must select exactly ${allowedCount} record(s) to complete the 60% release.`,
  //           confirmButtonColor: '#3085d6',
  //         });
  //         shouldProceed = false;
  //       } else {
  //         shouldProceed = true;
  //       }
  //     } else if (totalReleased >= sixtyPercentCount && totalReleased < originalTotalRecords) {
  //       // PHASE 2: 40%
  //       const remainingToRelease = originalTotalRecords - totalReleased;

  //       if (selectedCount !== remainingToRelease) {
  //         Swal.fire({
  //           icon: 'warning',
  //           title: 'Invalid Selection',
  //           text: `You must select exactly ${remainingToRelease} record(s) to complete the 40% release.`,
  //           confirmButtonColor: '#3085d6',
  //         });
  //         shouldProceed = false;
  //       }

  //     } else if (totalReleased === originalTotalRecords) {
  //       // 100% DONE
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'All Records Released',
  //         text: '100% of records have been released. Moving to final submission.',
  //         confirmButtonColor: '#3085d6',
  //       });
  //       shouldProceed = true;
  //     } else if (finalApiList.length === originalTotalRecords) {
  //       // After 100% (60 + 40)
  //       Swal.fire({
  //         icon: 'info',
  //         title: 'Release Complete',
  //         text: 'All records are already released.',
  //         confirmButtonColor: '#3085d6',
  //       });
  //       shouldProceed = false;
  //     }
  //   }
  //   else if (selectedValue === '40*30*30') {
  //     const fortyPercent = Math.round(0.4 * originalTotalRecords);
  //     const thirtyPercent = Math.round(0.3 * originalTotalRecords);
  //     const totalReleased = releasedData.length;

  //     if (finalApiList.length === 0) {
  //       // Phase 1: 40%
  //       if (totalReleased === fortyPercent) {
  //         Swal.fire({
  //           icon: 'info',
  //           title: 'First phase completed',
  //           text: '40% of records already released. Proceed with next phase.',
  //           confirmButtonColor: '#3085d6',
  //         });
  //         shouldProceed = false;
  //       } else if (selectedRows.length !== fortyPercent - totalReleased) {
  //         Swal.fire({
  //           icon: 'warning',
  //           title: 'Invalid Selection',
  //           text: `You must select exactly ${fortyPercent - totalReleased} record(s) for the first phase.`,
  //           confirmButtonColor: '#3085d6',
  //         });
  //         shouldProceed = false;
  //       }
  //     } else if (totalReleased >= fortyPercent && totalReleased < fortyPercent + thirtyPercent) {
  //       // Phase 2: 30%
  //       const required = (fortyPercent + thirtyPercent) - totalReleased;

  //       if (selectedRows.length !== required) {
  //         Swal.fire({
  //           icon: 'warning',
  //           title: 'Invalid Selection',
  //           text: `You must select exactly ${required} record(s) for the second phase.`,
  //           confirmButtonColor: '#3085d6',
  //         });
  //         shouldProceed = false;
  //       }
  //     } else if (totalReleased >= fortyPercent + thirtyPercent && totalReleased < originalTotalRecords) {
  //       // Phase 3: Final 30%
  //       const remaining = originalTotalRecords - totalReleased;

  //       if (selectedRows.length !== remaining) {
  //         Swal.fire({
  //           icon: 'warning',
  //           title: 'Invalid Selection',
  //           text: `You must select exactly ${remaining} record(s) for the final phase.`,
  //           confirmButtonColor: '#3085d6',
  //         });
  //         shouldProceed = false;
  //       }
  //     } else if (totalReleased === originalTotalRecords) {
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'All Records Released',
  //         text: '100% of records have been released under 40*30*30 mode.',
  //         confirmButtonColor: '#3085d6',
  //       });
  //       shouldProceed = false;
  //     }
  //   }



  //   // Only proceed to move data if all conditions pass
  //   if (shouldProceed) {
  //     performRelease(sixtyPercentCount, fortyPercentCount);
  //   }
  // };
const moveToReleasedTable = () => {
  const sixtyPercentCount = Math.round(0.6 * originalTotalRecords);
  const fortyPercentCount = Math.round(0.4 * originalTotalRecords);
  const thirtyPercentCount = Math.round(0.3 * originalTotalRecords);
  const releasedCount = releasedData.length;
  const selectedCount = selectedRows.length;

  if (selectedValue === '100') {
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

  if (selectedValue === '60*40') {
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

  if (selectedValue === '40*30*30') {
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
  const selectedRowsData = releaseData.filter(row => selectedRows.includes(row.id));
  const remainingData = releaseData.filter(row => !selectedRows.includes(row.id));
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
    if (selectedValue === '60*40' && releasedData.length === 0) {
      setSelectionLimit(fortyPercentCount);
    }

    if (selectedValue === '100') {
      setIs60PercentDone(true); // or any full-release flag
    }
  };
  const handleRemoveFromReleasedTable = (rowId) => {
    setReleasedData((prevReleased) => {
      const rowToMoveBack = prevReleased.find((row) => row.id === rowId);
      if (!rowToMoveBack) return prevReleased;

      // Keep releasePhase, do NOT delete it
      const rowToMoveBackCopy = { ...rowToMoveBack };

      setReleaseData((prevRelease) => {
        const updated = [...prevRelease, rowToMoveBackCopy];
        // Sort by id in ascending order (change 'id' to your preferred key if needed)
        return updated.sort((a, b) => a.id - b.id);
      });

      if (selectedValue === '60*40') {
        setSelectionLimit((prevLimit) => prevLimit + 1);
      }

      setSelectedRows((prevSelected) => prevSelected.filter((id) => id !== rowId));

      return prevReleased.filter((row) => row.id !== rowId);
    });
  };
  const isSelectAllDisabled = () => {
    if (selectedValue === '100') {
      return releaseData.length === 0;
    }

    if (selectedValue === '60*40') {
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
    {
      name: ['100', '60*40', '40*30*30'].includes(selectedValue) ? (
        <div>
          <input
            type="checkbox"
            checked={selectAllChecked}
            onChange={handleSelectAll}
            disabled={isSelectAllDisabled()}
          />
        </div>
      ) : '',

      selector: row => row.id,
      width: '50px',
      sortable: false,
      cell: row => {
        const isSelected = selectedRows.includes(row.id);

        const totalCount = releaseData.length + releasedData.length;
        const maxSelectable = Math.round(0.6 * originalTotalRecords); // 60%
        const alreadyReleased = releasedData.length;
        const remainingSlots = maxSelectable - alreadyReleased;

        // In first phase (before reaching 60%)
        const isInFirstPhase = alreadyReleased < maxSelectable;

        // Whether selecting more is blocked (limit reached)
        const limitReached = selectedValue === '60*40' &&
          isInFirstPhase &&
          !isSelected &&
          selectedRows.length >= remainingSlots;

        const checkboxId = `checkbox-${row.id}`;

        const handleCheckboxClick = (e) => {
          if (limitReached && !isSelected) {  // block only new checks when limit reached
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
              id={checkboxId}
              type="checkbox"
              checked={isSelected}
              // **Always enabled**
              disabled={false}
              onClick={handleCheckboxClick}
              onChange={() => {
                if (isSelected) {
                  // Always allow unchecking
                  handleRowSelect(row);
                } else {
                  // Allow checking only if limit not reached or not in first phase
                  if (!limitReached || !isInFirstPhase) {
                    handleRowSelect(row);
                  }
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
    {
      name: 'Sl. No.',
      selector: row => row.id,
      sortable: true,
    },
    {
      name: 'Dimension',
      selector: row => row.dimension,
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
    }
  ];
const releasedTableColumns = [
  // Conditionally add the "Actions" column only if selectedValue !== '100%'
  ...(String(selectedValue).trim() !== '100' ? [
    {
      name: 'Actions',
      selector: row => row.id,
      cell: row => (
        <button
          className="btn btn-danger"
          disabled={is60PercentDone && String(row.releasePhase).trim() === '60'}
          onClick={() => handleRemoveFromReleasedTable(row.id)}
        >
          <i className='fa fa-trash'></i>
        </button>
      ),
    }
  ] : []),

  {
    name: 'Sl. No.',
    selector: row => row.id,
    sortable: true,
  },
  {
    name: 'Dimension',
    selector: row => row.dimension,
    sortable: true,
  },
  {
    name: 'Status',
    selector: row => row.status,
    sortable: true,
  },
  {
    name: 'Date',
    selector: row => row.date,
    sortable: true,
  },
];

  //final save method
  // const handleInitial60PercentSave = () => {
  //   const totalRecords = releaseData.length + releasedData.length;

  //   const expectedCount = Math.round(0.6 * totalRecords);
  //   if (releasedData.length < expectedCount) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Minimum Selection Required',
  //       text: `You must move at least ${expectedCount} sites to the Already Released Table for 60 * 40.`,
  //       confirmButtonColor: '#3085d6',
  //     });
  //     return;
  //   }

  //   setFinalApiList(prev => {
  //     const updated = [...prev, ...releasedData];
  //     console.log("finalApiList after update:", updated);
  //     return updated;
  //   });

  //   setReleasedData([]);

  //   Swal.fire({
  //     icon: 'success',
  //     title: '60% Sites Released Successfully',
  //     text: 'You have successfully released 60% of the sites.',
  //     showCancelButton: true,
  //     confirmButtonText: 'Continue with Next Release',
  //     cancelButtonText: 'Back to Dashboard',
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       setIs60PercentDone(true);
  //       setShowNextReleaseForm(true);

  //       const total = totalRecords;
  //       const sixtyPercentCount = Math.round(0.6 * total);
  //       const remainingToSelect = total - sixtyPercentCount;

  //       setSelectedRows([]);

  //       const remainingRows = releaseData.slice(0, remainingToSelect).map(row => row.id);
  //       setSelectedRows(remainingRows);
  //     } else if (result.dismiss === Swal.DismissReason.cancel) {
  //       window.location.href = '/dashboard';
  //     }
  //   });
  // };
  // const handleFinal40PercentSave = () => {
  //   const expectedCount = Math.round(0.4 * originalTotalRecords);
  //   if (releasedData.length !== expectedCount) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Invalid Selection',
  //       text: `You must move exactly ${expectedCount} sites to the Already Released Table for the remaining 40%. You selected ${releasedData.length}.`,
  //       confirmButtonColor: '#d33',
  //     });
  //     return;
  //   }

  //   setFinalApiList(prev => {
  //     const updated = [...prev, ...releasedData];
  //     console.log("finalApiList after update (40%):", updated);
  //     return updated;
  //   });

  //   setReleasedData([]);

  //   Swal.fire({
  //     icon: 'success',
  //     title: '40% Sites Released Successfully',
  //     text: 'You have successfully released the remaining 40% of the sites.',
  //     confirmButtonColor: '#3085d6',
  //   });
  // };
const [is40PercentDone, setIs40PercentDone] = useState(false);
  const handleInitial60PercentSave = () => {
  const totalRecords = releaseData.length + releasedData.length;
  const expectedCount60 = Math.round(0.6 * totalRecords);
  const expectedCount40 = Math.round(0.4 * originalTotalRecords);
  const expectedCount30 = Math.round(0.3 * originalTotalRecords);

  if (selectedValue === '60*40') {
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

  else  if (selectedValue === '40*30*30') {
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

  else if (selectedValue === '100') {
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
// const handleFinal40PercentSave = () => {
//   const expectedCount60_40 = Math.round(0.4 * originalTotalRecords);
//   const expectedCount30 = Math.round(0.3 * originalTotalRecords);

//   if (selectedValue === '60*40') {
//     if (releasedData.length !== expectedCount60_40) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Selection',
//         text: `You must move exactly ${expectedCount60_40} sites for the remaining 40%. You selected ${releasedData.length}.`,
//         confirmButtonColor: '#d33',
//       });
//       return;
//     }
//   }

//   if (selectedValue === '40*30*30') {
//     const releasedSoFar = finalApiList.length;
//     const nextExpected = releasedSoFar === expectedCount30 + expectedCount30
//       ? originalTotalRecords - releasedSoFar
//       : expectedCount30;

//     if (releasedData.length !== nextExpected) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Selection',
//         text: `You must select exactly ${nextExpected} sites for this phase.`,
//         confirmButtonColor: '#d33',
//       });
//       return;
//     }
//   }

//   setFinalApiList(prev => {
//     const updated = [...prev, ...releasedData];
//     console.log("finalApiList after update (Final Save):", updated);
//     return updated;
//   });

//   setReleasedData([]);

//   Swal.fire({
//     icon: 'success',
//     title: 'Sites Released Successfully',
//     text: 'You have successfully completed the release for this phase.',
//     confirmButtonColor: '#3085d6',
//   });
// };


const [current30Step, setCurrent30Step] = useState(1);

const handleFinal40PercentSave = () => {
  const expectedCount40 = Math.round(0.4 * originalTotalRecords);
  const expectedCount30 = Math.round(0.3 * originalTotalRecords);

  if (selectedValue === '60*40') {
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

  if (selectedValue === '40*30*30') {
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
        title: 'First 30% Released',
        text: 'You have successfully released the first 30% of the sites.',
        showCancelButton: true,
        confirmButtonText: 'Continue with Final 30%',
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
                  <div className='col-12 col-md-6'>
                    <div className="form-group mt-2">
                      <label className='form-label'>Enter the EPID or KRSID</label>
                      <input type="text" className="form-control" placeholder="Enter the EPID or KRSID" maxLength={15} />
                    </div>
                  </div>
                  <div className='col-12 col-md-2'>
                    <div className="form-group mt-6">
                      <button className='btn btn-primary btn-block'>Search</button>
                    </div>
                  </div>
                  <div className="form-group mt-2">
                    <label className="form-label">Select Dimension</label>
                    <select className="form-control" value={selectedValue} onChange={handleDimensionChange}>
                      <option value="">-- Select Dimension --</option>
                      <option value="100">100%</option>
                      <option value="60*40">60 * 40</option>
                      <option value="40*30*30">40 * 30 * 30</option>
                    </select>
                  </div>
                </div>
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
            {releaseData.length > 0 && (
              <div className="card">
                <div className="card-header layout_btn_color">
                  <h5 className="card-title" style={{ textAlign: 'center' }}>Yet to be release sites</h5>
                </div>
                <div className="card-body">
                  <div className='row'>
                    <div className='col-md-12 my-3'>
                      {((selectedValue === '60*40' && releasedData.length === 0) || selectedValue === '40*30*30' || selectedValue === '100') &&(
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

                      <DataTable
                        columns={releaseTableColumns}
                        data={releaseData}
                        pagination
                        highlightOnHover
                        striped
                      />
                      <div className='row'>
                        <div className='col-md-9'></div>
                        <div className='col-md-3'>
                          <button className="btn btn-primary btn-block mt-3" onClick={moveToReleasedTable}>
                            Move to Already Released Table
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Already Released Table */}
            {releasedData.length > 0 && (
              <div className="card">
                <div className="card-header layout_btn_color">
                  <h5 className="card-title" style={{ textAlign: 'center' }}>Selected record list</h5>
                </div>
                <div className="card-body">
                  <div className='row'>
                    <div className='col-md-12 my-3'>
                      <DataTable
                        columns={releasedTableColumns}
                        data={releasedData}
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
                          onClick={handleInitial60PercentSave}
                        >
                          Save & proceed
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
            <div className="card mt-4">
              <div className="card-header layout_btn_color">
                <h5 className="card-title" style={{ textAlign: 'center' }}>Already released sites </h5>
              </div>
              <div className="card-body">
                <DataTable
                  columns={[
                    { name: 'ID', selector: row => row.id, sortable: true },
                    { name: 'Dimension  ', selector: row => row.dimension, sortable: true },
                    { name: 'Status', selector: row => row.status, sortable: true },
                    { name: 'Date  ', selector: row => row.date, sortable: true },
                    // Add more columns if needed
                  ]}
                  data={finalApiList}
                  pagination
                  striped
                  highlightOnHover
                  responsive
                />

              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReleaseSelection;
