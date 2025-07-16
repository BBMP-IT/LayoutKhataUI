import React, { useState, useEffect, useRef, useContext } from 'react';
import DashboardLayout, { LoaderContext } from '../../Layout/DashboardLayout';
import Loader from "../../Layout/Loader";
import DataTable from 'react-data-table-component';
import '../../Styles/CSS/ReleaseSiteSelection.css';
import Swal from "sweetalert2";
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import config from '../../Config/config';



import {
    fetch_LKRSID, fetch_releasePercentageDetails, individualSiteListAPI, final_Release_Sites, listApprovalInfo, fileUploadAPI, listReleaseInfo, fileListAPI,
    insertReleaseInfo,
    deleteReleaseInfo, ownerEKYC_Details, ekyc_Details, ekyc_Response, ekyc_insertReleaseDetails
} from '../../API/authService';

export const useLoader = () => {
    const [loading, setLoading] = useState(false);

    const start_loader = () => setLoading(true);
    const stop_loader = () => setLoading(false);

    return { loading, start_loader, stop_loader };
};

const ReleaseDashboard = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    // const { loading, start_loader, stop_loader } = useLoader(); // Use loader context

    const { loading, start_loader, stop_loader } = useContext(LoaderContext);

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
    const CreatedBy = sessionStorage.getItem('PhoneNumber');
    const CreatedName = "username";
    const RoleID = "user";
    const [LKRSID, setLKRSID] = useState('');
    useEffect(() => {
        if (display_LKRS_ID && LKRS_ID) {
            handleSearchClick(display_LKRS_ID);
            setFinalApiList([]);//already released table
            setReleasedData([]);//intermediate table
            setReleaseData([]);//yet to be release table
        }
        fetchFinalReleasedSites(LKRS_ID);
        const storedCreatedBy = sessionStorage.getItem('PhoneNumber')
        const storedCreatedName = sessionStorage.getItem('createdName');
        const storedRoleID = sessionStorage.getItem('RoleID');

    }, [LKRS_ID, display_LKRS_ID]);
    useEffect(() => {
        if (originalTotalRecords === 0 && (releaseData.length > 0 || finalApiList.length > 0)) {
            const total = releaseData.length + finalApiList.length;
            setOriginalTotalRecords(total);
        }
    }, [releaseData, finalApiList, originalTotalRecords]);

    const [releasePercentage, setReleasePercentage] = useState(0);

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


    // moveToReleasedTable
    const moveToReleasedTable = () => {
        if (!orderReleaseStatus) {
            Swal.fire({
                icon: 'warning',
                title: 'Important!',
                text: 'Please save the Release Order details before proceeding.',
                confirmButtonText: 'Ok'
            });
            return;
        }

        if (selectedRows.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'No Records Selected',
                text: 'Please select record(s) to release.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        const selectedRowsData = releaseData.filter((_, index) => selectedRows.includes(index));
        const remainingData = releaseData.filter((_, index) => !selectedRows.includes(index));

        setReleasedData(prev => [...prev, ...selectedRowsData]);
        setReleaseData(remainingData);
        setSelectedRows([]);
        setSelectAllChecked(false);
    };



    // handleRowSelect
    const handleRowSelect = (index) => {
        if (!isEKYCVerified) {
            Swal.fire({
                icon: 'warning',
                title: 'eKYC Required',
                text: 'Please complete the eKYC before selecting a site.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        const isSelected = selectedRows.includes(index);

        if (isSelected) {
            setSelectedRows(prev => prev.filter(i => i !== index));
        } else {
            setSelectedRows(prev => [...prev, index]);
        }
    };


    const handleSelectAll = (e) => {
        if (!isEKYCVerified) {
            Swal.fire({
                icon: 'warning',
                title: 'eKYC Not Completed',
                text: 'Please complete the eKYC before selecting the site.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        const checked = e?.target?.checked ?? !selectAllChecked;
        const allIndexes = releaseData.map((_, index) => index);

        setSelectedRows(checked ? allIndexes : []);
        setSelectAllChecked(checked);
    };



    // Sync Select All checkbox with individual selections
    useEffect(() => {
        const allIndexes = releaseData.map((_, index) => index);
        const allSelected = allIndexes.every(index => selectedRows.includes(index));
        setSelectAllChecked(allSelected);
    }, [selectedRows, releaseData]);


    // handleDimensionChange
    const handleDimensionChange = (ReleaseType, originalTotalRecords, unreleasedSites, releasedSites, lengthRO, percentage) => {
        setSelectedValue(ReleaseType);
        setReleasePercentage(percentage);
        setSelectAllChecked(false);
        setSelectedRows([]);

        const allowedCount = Math.round((percentage / 100) * originalTotalRecords);
        // Handle 100% release custom conditions
        if (ReleaseType === 1) {

            if (lengthRO === 1) {
                if (releasedSites.length === 0 && unreleasedSites.length === originalTotalRecords) {
                    // 👉 All sites unreleased, allow release
                    setSelectionLimit(originalTotalRecords);
                }
                else if (releasedSites.length === originalTotalRecords && unreleasedSites.length === 0) {
                    // 👉 All sites already released
                    Swal.fire({
                        icon: 'info',
                        title: 'All sites are Released',
                        text: 'All records have already been released.',
                        confirmButtonColor: '#3085d6',
                    });
                    setSelectionLimit(0);
                }
            }
        }
        //60% * 40% release
        else if (ReleaseType === 2) {
            //60% release  
            if (lengthRO === 1) {
                if (releasedSites.length === 0 && unreleasedSites.length === originalTotalRecords) {
                    // Allow 60% release
                    setSelectionLimit(Math.round(0.6 * originalTotalRecords));
                    setDeletebtn_disabled(false); //enable delete btn
                } else if (releasedSites.length !== 0 && unreleasedSites.length !== 0) {
                    Swal.fire({
                        icon: 'info',
                        title: '60% Already Released',
                        text: '60% of records have already been released.',
                        confirmButtonColor: '#3085d6',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    });
                    setSelectionLimit(0);
                    setIsOrder_EditingArea(true); // allow to proceed if that’s your intention
                    setDeletebtn_disabled(true);//delete btn disabled
                }
                else {
                    setIsOrder_EditingArea(false); // block save in other cases

                }
            }
            //40% release
            else if (lengthRO === 2) {
                if (releasedSites.length !== 0 && unreleasedSites.length !== 0) {
                    // Allow 40% release

                    setSelectionLimit(Math.round(0.4 * originalTotalRecords));
                    setDeletebtn_disabled(false); //enable delete btn
                } else if (releasedSites.length === originalTotalRecords && unreleasedSites.length === 0) {
                    Swal.fire({
                        icon: 'success',
                        title: 'All Sites are Released',
                        text: 'All records have already been released.',
                        confirmButtonColor: '#3085d6',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    });
                    setSelectionLimit(0);
                    setDeletebtn_disabled(true);//delete btn disabled
                }
            }
        }
        //40% * 30% * 30%
        else if (ReleaseType == 3) {
            const fortyPercentCount = Math.round(0.4 * originalTotalRecords);
            const thirtyPercentCount = Math.round(0.3 * originalTotalRecords);

            if (lengthRO == 1) {
                if (releasedSites.length == 0 && unreleasedSites.length == originalTotalRecords) {
                    // Allow 40 Release
                    setSelectionLimit(fortyPercentCount);
                    setDeletebtn_disabled(false); //enable delete btn
                } else if (releasedSites.length != 0 && unreleasedSites.length != 0) {
                    // Already Released
                    Swal.fire({
                        icon: 'info',
                        title: '40% phase already started',
                        text: 'You have already started the 40% release phase.',
                        confirmButtonColor: '#3085d6',
                    });
                    setIsOrder_EditingArea(true);
                    setDeletebtn_disabled(true); //delete btn disabled
                    setSelectionLimit(0);
                }
            }
            else if (lengthRO == 2) {
                if (releasedSites.length != 0 && unreleasedSites.length != 0) {
                    const ReleasedPercentage = (releasedSites.length / originalTotalRecords) * 100;
                    const YetToBeReleasedPercentage = (unreleasedSites.length / originalTotalRecords) * 100;

                    if (ReleasedPercentage < YetToBeReleasedPercentage) {
                        // Allow 30 Release
                        setSelectionLimit(thirtyPercentCount);
                        setDeletebtn_disabled(false); //enable delete btn
                    } else {
                        // Already Released
                        Swal.fire({
                            icon: 'info',
                            title: '30% phase already completed',
                            text: 'You have already completed the 30% release phase.',
                            confirmButtonColor: '#3085d6',
                        });
                        setIsOrder_EditingArea(true);
                        setDeletebtn_disabled(true);//delete btn disabled
                        setSelectionLimit(0);
                    }
                } else if (releasedSites.length == originalTotalRecords && unreleasedSites.length == 0) {
                    // Already Released
                    Swal.fire({
                        icon: 'success',
                        title: 'All Sites Released',
                        text: 'All records have already been released.',
                        confirmButtonColor: '#3085d6',
                    });
                    setSelectionLimit(0);
                    setDeletebtn_disabled(true);//delete btn disabled
                }
            }
            else if (lengthRO == 3) {
                if (releasedSites.length != 0 && unreleasedSites.length != 0) {
                    const ReleasedPercentage = (releasedSites.length / originalTotalRecords) * 100;
                    const YetToBeReleasedPercentage = (unreleasedSites.length / originalTotalRecords) * 100;

                    if (ReleasedPercentage < YetToBeReleasedPercentage) {
                        // Allow 30 Release
                        setSelectionLimit(thirtyPercentCount);
                    } else {
                        // Already Released
                        Swal.fire({
                            icon: 'success',
                            title: 'All Sites are Released',
                            text: 'All records have already been released.',
                            confirmButtonColor: '#3085d6',
                        });
                        setSelectionLimit(0);
                    }
                } else if (releasedSites.length == originalTotalRecords && unreleasedSites.length == 0) {
                    // Already Released
                    Swal.fire({
                        icon: 'success',
                        title: 'All Sites Released',
                        text: 'All records have already been released.',
                        confirmButtonColor: '#3085d6',
                    });
                    setSelectionLimit(0);
                }
            }
        }
    };




    const handleCheckboxToggle = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
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
        {
            name: (
                <div>
                    <input
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={(e) => handleSelectAll(e, selectedValue)}
                        disabled={isSelectAllDisabled()}
                    />
                </div>
            ),
            selector: row => row.id,
            width: '50px',
            sortable: false,
            cell: (row, index) => {
                const isSelected = selectedRows.includes(index);
                return (
                    <div>
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRowSelect(index)}
                        />
                    </div>
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
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

        //   selector: row => row.id, // keep as is; used only by DataTable internally
        //   width: '50px',
        //   sortable: false,
        //   cell: (row, index) => {
        //     const isSelected = selectedRows.includes(index);

        //     const totalCount = releaseData.length + releasedData.length;
        //     const maxSelectable = Math.round(0.6 * originalTotalRecords); // 60%
        //     const alreadyReleased = releasedData.length;
        //     const remainingSlots = maxSelectable - alreadyReleased;
        //     const isInFirstPhase = alreadyReleased < maxSelectable;
        //     const limitReached = selectedValue === '2' &&
        //       isInFirstPhase &&
        //       !isSelected &&
        //       selectedRows.length >= remainingSlots;

        //     const handleCheckboxClick = (e) => {
        //       if (limitReached && !isSelected) {
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
        //           type="checkbox"
        //           checked={isSelected}
        //           onClick={handleCheckboxClick}
        //           onChange={() => {
        //             if (isSelected) {
        //               handleRowSelect(index);
        //             } else if (!limitReached || !isInFirstPhase) {
        //               handleRowSelect(index);
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



        // {
        //   name: 'Sl. No.',
        //   selector: (row, index) => index + 1,
        //   sortable: true,
        //   width: '90px', center: true
        // },

        // {
        //   name: "Block/Area",
        //   selector: row => row.sitE_AREA || '',
        //   width: '120px', center: true
        // },
        // {
        //   name: "No of sides",
        //   selector: row => row.sitE_NO_OF_SIDES || '',
        //   width: '120px', center: true
        // },


        // {
        //   name: "Total Area",
        //   selector: row => `${row.sitE_AREAINSQFT} [Sq.ft], ${row.sitE_AREAINSQMT} [Sq.mtr]`,
        //   center: true,
        //   width: '200px',
        // },
        // {
        //   name: "Corner Site",
        //   selector: row => row.sitE_CORNERPLOT ? "YES" : "NO",
        //   center: true,
        //   width: '120px',
        // },
        // {
        //   name: "Type of Site",
        //   selector: row => row.sitE_TYPE || '',
        //   center: true,
        //   width: '120px',
        // },
        // {
        //   name: (
        //     <span title="East | West | North | South">Chakbandi</span>
        //   ),
        //   selector: row => `${row.sitE_EAST} | ${row.sitE_WEST} | ${row.sitE_NORTH} | ${row.sitE_SOUTH}`,
        //   center: true,
        //   width: '200px',
        // },
        // {
        //   name: "Latitude, Longitude",
        //   selector: row => `${row.sitE_LATITUDE}, ${row.sitE_LONGITUDE}`,
        // },
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

    const [current30Step, setCurrent30Step] = useState(1);

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

    const handleSearchClick = async (localLKRSID) => {
        if (!localLKRSID) {
            alert('Please enter EPID or KRSID');
            return;
        }

        // Remove leading 'L' or 'l' if present
        let trimmedLKRSID = localLKRSID;
        if (/^L\d+$/i.test(localLKRSID)) {
            trimmedLKRSID = localLKRSID.substring(1);
        }
        setReleasedData([]);

        await handleGetLKRSID(trimmedLKRSID);
        await fetchReleaseList(trimmedLKRSID);

        await fetchFinalReleasedSites(trimmedLKRSID);
    };

    const [selectedLandType, setSelectedLandType] = useState("");
    const handleGetLKRSID = async (localLKRSID) => {
        const payload = {
            level: 1,
            LkrsId: localLKRSID,
        };
        try {
            start_loader();
            setRtcAddedData([]);          // Clear survey data table
            setOwnerTableData([]);        // Clear khata owner table
            setEPID_FetchedData(null);    // Clear EPID fetched data
            setEPIDShowTable(false);      // Hide khata table until data comes
            setLkrsTableData({});         // Clear LKRS table data
            setSelectedLandType('');
            const response = await fetch_LKRSID(localLKRSID);


            if (response && response.surveyNumberDetails && response.surveyNumberDetails.length > 0) {
                setLkrsTableData({
                    lkrS_DISPLAYID: response.lkrS_DISPLAYID || '',
                    lkrS_EPID: response.lkrS_EPID || '',
                    lkrS_SITEAREA_SQFT: response.lkrS_SITEAREA_SQFT || '',
                    lkrS_SITEAREA_SQMT: response.lkrS_SITEAREA_SQMT || '',
                    lkrS_ECNUMBER: response.lkrS_ECNUMBER || '',
                    lkrS_LANDTYPE: response.lkrS_LANDTYPE || ''
                });
                await Fetch_Approval_percentage(response.lkrS_ID);
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

                stop_loader();
            } else if (
                response &&
                response.khataDetails?.khatA_JSON &&
                response.khataOwnerDetails &&
                response.khataOwnerDetails.length > 0
            ) {
                setLkrsTableData({
                    lkrS_DISPLAYID: response.lkrS_DISPLAYID || '',
                    lkrS_EPID: response.lkrS_EPID || '',
                    lkrS_SITEAREA_SQFT: response.lkrS_SITEAREA_SQFT || '',
                    lkrS_SITEAREA_SQMT: response.lkrS_SITEAREA_SQMT || '',
                    lkrS_ECNUMBER: response.lkrS_ECNUMBER || '',
                    lkrS_LANDTYPE: response.lkrS_LANDTYPE || ''
                });

                await Fetch_Approval_percentage(response.lkrS_ID);
                setSelectedLandType(response.lkrS_LANDTYPE);
                await fetchApprovalListAndSetTable(localLKRSID);
                setEPIDShowTable(true);

                let approvedDetails = {};
                let khataDetailsJson = {};

                try {
                    khataDetailsJson = JSON.parse(response.khataDetails.khatA_JSON);
                    approvedDetails = khataDetailsJson?.response?.approvedPropertyDetails || {};
                } catch (err) {
                    console.warn("Failed to parse khatA_JSON", err);
                }

                setEPID_FetchedData({
                    PropertyID: response.lkrS_EPID || '',
                    PropertyCategory: approvedDetails.propertyCategory || '',
                    PropertyClassification: approvedDetails.propertyClassification || '',
                    WardNumber: approvedDetails.wardNumber || '',
                    WardName: approvedDetails.wardName || '',
                    StreetName: approvedDetails.streetName || '',
                    Streetcode: approvedDetails.streetcode || '',
                    SASApplicationNumber: approvedDetails.sasApplicationNumber || '',
                    IsMuation: approvedDetails.isMuation || '',
                    KaveriRegistrationNumber: approvedDetails.kaveriRegistrationNumber || [],
                    AssessmentNumber: approvedDetails.assessmentNumber || '',
                    courtStay: approvedDetails.courtStay || '',
                    enquiryDispute: approvedDetails.enquiryDispute || '',
                    CheckBandi: approvedDetails.checkBandi || {},
                    SiteDetails: approvedDetails.siteDetails || {},
                    OwnerDetails: approvedDetails.ownerDetails || [],
                    rawResponse: response,
                });

                if (approvedDetails.siteDetails?.siteArea) {
                    setAreaSqft(approvedDetails.siteDetails.siteArea);
                    sessionStorage.setItem('areaSqft', approvedDetails.siteDetails.siteArea);
                } else {
                    setAreaSqft(0);
                    sessionStorage.removeItem('areaSqft');
                }

                setOwnerTableData(approvedDetails.ownerDetails || []);
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
        if (display_LKRS_ID) {
            setLocalLKRSID(display_LKRS_ID);
        }
    }, [display_LKRS_ID]);

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
        { name: 'Property ID', width: '140px', selector: () => epid_fetchedData?.PropertyID || 'N/A', center: true },
        {
            name: 'Owner Name',
            center: true,
            selector: (row) => row.ownerName || 'N/A',
        },
        {
            name: 'ID Type',
            width: '120px',
            selector: (row) => row.idType || 'N/A',
            center: true,
        },
        {
            name: 'ID Number',
            width: '220px',
            selector: (row) => row.idNumber || 'N/A',
            center: true,
        },
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
    const [isOrderEditing, setIsOrderEditing] = useState(false);
    //Fetch release Details
    const Fetch_Approval_percentage = async (localLKRSID) => {
        try {
            let level = "1";
            let appId = "0";
            start_loader();
            const response = await listApprovalInfo({
                level,
                aprLkrsId: localLKRSID,
                aprId: appId,
            });

            if (response) {
                console.log(response);
                setReleaseDetails(response);

                // Extract and use `sitE_RELS_SITE_RELSTYPE_ID`
                // const releaseTypeId = response[0]?.apR_SITE_RELSTYPE_ID?.toString();

                // if (releaseTypeId) {
                //   handleDimensionChange(releaseTypeId);
                // }

                stop_loader();
            } else {
                stop_loader();
            }
        } catch (error) {
            stop_loader();
            console.error("Failed to fetch LKRSID data:", error);
        }
    };

    const fetchReleaseOrder = async (trimmedLKRSID, lengthRO) => {
        try {
            const listPayload = {
                level: 1,
                LkrsId: trimmedLKRSID,
                SiteID: 0,
            };
            start_loader();
            const response = await individualSiteListAPI(listPayload);

            if (Array.isArray(response)) {
                const unreleasedSites = response.filter(site => site.sitE_IS_SITE_RELEASED === false);
                const releasedSites = response.filter(site => site.sitE_IS_SITE_RELEASED === true);

                setReleaseData(unreleasedSites);
                setFinalApiList(releasedSites);
                setOriginalTotalRecords(unreleasedSites.length + releasedSites.length);

                // Just update the selection limit now
                setSelectionLimit(unreleasedSites.length);
            }
        } catch (error) {
            console.error("Fetch Site Details Error:", error);
        } finally {
            stop_loader();
        }
    };


    const [isReleaseOrderSaved, setIsReleaseOrderSaved] = useState(false);

    const releaseSites = async () => {
           if (!isEKYCVerified) {
            Swal.fire({
                icon: 'warning',
                title: 'eKYC Required',
                text: 'Please complete the eKYC before selecting a site.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }
        if (!isReleaseOrderSaved) {
            Swal.fire({
                icon: 'warning',
                title: 'Save Release Order First',
                text: 'Please save the release order details before selecting and releasing sites.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        if (releasedData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Sites Selected',
                text: 'Please select at least one site to release.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        let trimmedLKRSID = localLKRSID;
        if (/^L\d+$/i.test(localLKRSID)) {
            trimmedLKRSID = localLKRSID.substring(1);
        }

        const siteRelID = sessionStorage.getItem("sitE_RELS_Latest_SITE_RELS_ID");

        try {
            start_loader();

            const payload = {
                sitE_LKRS_ID: trimmedLKRSID,
                sitE_SITE_RELS_ID: siteRelID,
                site_Remarks: "",
                site_AdditionalInfo: "",
                site_UpdatedBy: CreatedBy,
                site_UpdatedName: "user",
                site_UpdatedRole: "user",
                releaseSiteList: releasedData.map(site => ({
                    sitE_ID: site.sitE_ID
                }))
            };

            const response = await final_Release_Sites(payload);
            console.log("Release response:", response);

            Swal.fire({
                title: "Sites released successfully!",
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/Info', {
                    state: {
                        LKRS_ID,
                        createdBy,
                        createdName,
                        roleID,
                        display_LKRS_ID
                    }
                });
            });

            setReleasedData([]);         // Clear released data
            setSelectedRows([]);         // Clear selection
            fetchReleaseOrder(trimmedLKRSID);  // Refresh table after release
            setIsOrder_EditingArea(false); 

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
        let trimmedLKRSID = localLKRSID;
        if (/^L\d+$/i.test(localLKRSID)) {
            trimmedLKRSID = localLKRSID.substring(1);
        }
        try {
            const listPayload = {
                level: 1,
                LkrsId: trimmedLKRSID,
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
        // {

        //   name: 'Sl. No.',
        //   selector: (row, index) => index + 1,
        //   sortable: true,
        //   width: '90px', center: true
        // },
        // {
        //   name: "Block/Area",
        //   selector: row => row.sitE_AREA || '',
        //   width: '120px', center: true
        // },
        // {
        //   name: "No of sides",
        //   selector: row => row.sitE_NO_OF_SIDES || '',
        //   width: '120px', center: true
        // },
        // {
        //   name: "Total Area",
        //   selector: row => `${row.sitE_AREAINSQFT} [Sq.ft], ${row.sitE_AREAINSQMT} [Sq.mtr]`,
        //   center: true,
        //   width: '200px',
        // },
        // {
        //   name: "Corner Site",
        //   selector: row => row.sitE_CORNERPLOT ? "YES" : "NO",
        //   center: true,
        //   width: '120px',
        // },
        // {
        //   name: "Type of Site",
        //   selector: row => row.sitE_TYPE || '',
        //   center: true,
        //   width: '120px',
        // },
        // {
        //   name: (
        //     <span title="East | West | North | South">Chakbandi</span>
        //   ),
        //   selector: row => `${row.sitE_EAST} | ${row.sitE_WEST} | ${row.sitE_NORTH} | ${row.sitE_SOUTH}`,
        //   center: true,
        //   width: '200px',
        // },
        // {
        //   name: "Latitude, Longitude",
        //   selector: row => `${row.sitE_LATITUDE}, ${row.sitE_LONGITUDE}`,
        // },
    ];
    const [lkrsTableData, setLkrsTableData] = useState({
        lkrS_DISPLAYID: '',
        lkrS_EPID: '',
        lkrS_SITEAREA_SQFT: '',
        lkrS_SITEAREA_SQMT: '',
        lkrS_ECNUMBER: '',
        lkrS_LANDTYPE: '',
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
    //Release order fields 
    const [release_formData, setRelease_FormData] = useState({
        layoutOrderNumber: "",
        release_Order: null,
        dateOfOrder: "",
        orderAuthority: "",
    });
    const [release_errors, setRelease_Errors] = useState({});
    const [order_records, setOrder_Records] = useState([]);
    const [edit_OrderIndex, setEdit_OrderIndex] = useState(null);
    const fileReleaseOrderInputRef = useRef(null);
    const [isOrder_EditingArea, setIsOrder_EditingArea] = useState(true);
    const [savedOrder_Records, setSavedOrder_Records] = useState([]);
    const [deletebtn_disabled, setDeletebtn_disabled] = useState();
    const handleOrderChange = (e) => {
        const { name, value } = e.target;
        setRelease_FormData({ ...release_formData, [name]: value });
        setRelease_Errors({ ...release_errors, [name]: "" }); // Clear error on input
    };

    const [releaseOrderURL, setReleaseOrderURL] = useState(null);
    const handleFilereleaseOrderChange = (e) => {
        if (!e || !e.target || !e.target.files) {
            console.error("Invalid event or no files found.");
            return;
        }

        const file = e.target.files[0];

        if (!file) {
            setRelease_FormData({ ...release_formData, release_Order: null });
            setReleaseOrderURL(null); // Clear preview
            setRelease_Errors({ ...release_errors, release_Order: "No file selected." });
            return;
        }

        if (file.type !== "application/pdf") {
            setRelease_Errors({ ...release_errors, release_Order: "Only PDF files are allowed." });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setRelease_Errors({ ...release_errors, release_Order: "File size must be less than 5MB." });
            return;
        }

        // Clear old preview URL
        if (releaseOrderURL) {
            URL.revokeObjectURL(releaseOrderURL);
        }

        setRelease_FormData({ ...release_formData, release_Order: file });
        setReleaseOrderURL(URL.createObjectURL(file)); // Set new preview
        setRelease_Errors({ ...release_errors, release_Order: "" });
    };
    const validateOrderForm = () => {
        let newErrors = {};

        if (!release_formData.layoutOrderNumber.trim()) {
            newErrors.layoutOrderNumber = "Layout Order of site release Number is required.";
        } else if (!/^[a-zA-Z0-9/-]+$/.test(release_formData.layoutOrderNumber.trim())) {
            newErrors.layoutOrderNumber = "Only alphabets, numbers, slashes (/) and dashes (-) are allowed.";
        }

        if (!release_formData.release_Order) {
            newErrors.release_Order = "Please upload a valid PDF (max 5MB).";
        }

        if (!release_formData.dateOfOrder) {
            newErrors.dateOfOrder = "Date of approval is required.";
        } else if (new Date(release_formData.dateOfOrder) > new Date()) {
            newErrors.dateOfOrder = "Future dates are not allowed.";
        }

        if (!release_formData.orderAuthority.trim()) {
            newErrors.orderAuthority = "Approval authority designation is required.";
        }

        const isDuplicate = order_records.some(
            (order) =>
                order.layoutReleaseNumber?.trim() === release_formData.layoutOrderNumber.trim()
        );
        if (isDuplicate) {
            newErrors.layoutOrderNumber = "This release order number already exists.";
        }

        const existingDates = order_records
            .map((r) => new Date(r.dateOfOrder))
            .filter((d) => !isNaN(d));
        if (existingDates.length > 0) {
            const latestDate = new Date(Math.max(...existingDates.map((d) => d.getTime())));
            const enteredDate = new Date(release_formData.dateOfOrder);
            if (enteredDate <= latestDate) {
                newErrors.dateOfOrder = `Date must be after the last release date (${latestDate.toLocaleDateString('en-GB')}).`;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setRelease_Errors(newErrors);
            Swal.fire("Validation Error", "Please fix the highlighted errors.", "warning");
            return false; 
        }

        return true; 
    };

    const handleOrderSave = async () => {
        if (!validateOrderForm()) return;

        let trimmedLKRSID = localLKRSID;
        if (/^L\d+$/i.test(localLKRSID)) {
            trimmedLKRSID = localLKRSID.substring(1);
        }

        const payload = {
            sitE_RELS_ID: 0,
            sitE_RELS_LKRS_ID: trimmedLKRSID,
            sitE_RELS_ORDER_NO: release_formData.layoutOrderNumber,
            sitE_RELS_DATE: release_formData.dateOfOrder,
            sitE_RELS_REMARKS: "",
            sitE_RELS_ADDITIONALINFO: "",
            sitE_RELS_CREATEDBY: CreatedBy,
            sitE_RELS_CREATEDNAME: CreatedName,
            sitE_RELS_CREATEDROLE: RoleID,
            sitE_RELS_APPROVALDESIGNATION: release_formData.orderAuthority,
        };

        try {
            start_loader();
            const response = await insertReleaseInfo(payload);

            if (response.responseStatus === true) {
                const uploadSuccess = await file_UploadAPI(
                    3,
                    release_formData.layoutOrderNumber,
                    release_formData.release_Order,
                    release_formData.dateOfOrder,
                    response.sitE_RELS_ID,
                    "Release Order",
                    trimmedLKRSID,
                );

                if (uploadSuccess) {
                    start_loader();
                    fetch_releasePercentage(trimmedLKRSID);
                    try {
                        const listPayload = {
                            level: 1,
                            lkrsId: trimmedLKRSID,
                            siteRelsId: 0,
                        };

                        const listResponse = await fetchReleaseList(trimmedLKRSID);
                        setDeletebtn_disabled(true);
                        console.table(listResponse);
                        stop_loader();
                    } catch (error) {
                        stop_loader();
                        console.error("Error fetching approval list:", error);
                    } finally {
                        stop_loader();
                    }

                    Swal.fire({
                        title: response.responseMessage,
                        icon: "success",
                        confirmButtonText: "OK",
                    });

                    // Reset form
                    if (fileReleaseOrderInputRef.current) {
                        fileReleaseOrderInputRef.current.value = "";
                    }
                    setRelease_FormData({
                        layoutOrderNumber: "",
                        release_Order: null,
                        dateOfOrder: "",
                        orderAuthority: "",
                    });
                    setRelease_Errors({});
                    setIsReleaseOrderSaved(true); // allow site selection now
                    setIsOrder_EditingArea(false);
                } else {
                    stop_loader();
                    Swal.fire({
                        title: "Upload Error",
                        text: "Document upload failed. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } else {
                stop_loader();
                setOrderReleaseStatus(false); //release order block status
                Swal.fire({
                    title: "Error",
                    text: "Something went wrong. Please try again later!",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            stop_loader();
            console.error("Error saving approval info:", error);
        } finally {
            stop_loader();
        }
    };
    const handleEditRelease = () => {
        setIsOrderEditing(false); // Disable edit button
        setIsOrder_EditingArea(true); // Enable editing mode for area
    };
    //file Upload API
    const file_UploadAPI = async (MstDocumentID, documentnumber, file, date, uniqueID, DocName, trimmedLKRSID) => {
        const formData = new FormData();

        try {
            start_loader();
            formData.append("DOCTRN_ID", 0);
            formData.append("DOCTRN_LKRS_ID", trimmedLKRSID);
            formData.append("DOCTRN_MDOC_ID", MstDocumentID);
            formData.append("DOCTRN_REMARKS", "");
            formData.append("DOCTRN_ADDITIONALINFO", "");
            formData.append("DOCTRN_CREATEDBY", CreatedBy);
            formData.append("DOCTRN_CREATEDNAME", CreatedName);
            formData.append("DOCTRN_CREATEDROLE", RoleID);
            formData.append("DocTrn_Document_No", documentnumber);
            formData.append("DocTrn_Document_Date", date);
            formData.append("DocTrn_UniqueIdentifier", uniqueID);
            formData.append("DOCTRN_DOCUMENTTYPE", DocName)
            formData.append("file", file);

            const listResponse = await fileUploadAPI(formData);

            stop_loader();

            // Assuming listResponse has a boolean flag
            return listResponse?.responseStatus === true;

        } catch (error) {
            stop_loader();
            console.error("Error Uploading file:", error);
            return false;
        } finally {
            stop_loader();
        }
    };
    const order_columns = [
        {
            name: t('translation.BDA.table1.slno'),
            cell: (row, index) => index + 1, // Adding 1 to start serial numbers from 1
            width: '80px', // Adjust width as needed
            center: true,
        },
        {
            name: t('translation.BDA.table1.siteOrderNo'),
            selector: row => row.layoutReleaseNumber,
            sortable: true, center: true,
        },
        {
            name: t('translation.BDA.table1.dateOforder'),
            center: true,
            selector: row => {
                const date = new Date(row.dateOfOrder);

                // Ensure the date is valid
                if (isNaN(date)) {
                    return '';  // Handle invalid date by returning an empty string or a placeholder
                }

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                const year = date.getFullYear();

                return `${day}-${month}-${year}`;
            },
            sortable: true,
        },
        {
            name: t('translation.BDA.table1.siteOrder'),
            center: true,
            cell: row => {
                if (row.orderReleaseFile) {
                    const blob = base64ToBlob(row.orderReleaseFile);

                    if (blob) {
                        const fileUrl = URL.createObjectURL(blob);
                        return (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="stableBlueLink"
                                onClick={() => {
                                    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
                                }}
                            >
                                View File
                            </a>
                        );
                    } else {
                        return 'Invalid file';
                    }
                } else {
                    return 'No file';
                }
            },
        },
        {
            name: t('translation.BDA.table1.approvalAuthority'),
            selector: row => row.releaseAuthority,
            sortable: true,
            center: true,
        },

        {
            name: t('translation.BDA.table1.action'),
            center: true,
            cell: (row, index) => (
                <div>
                    {/* <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleOrderEdit(index)} disabled={!isOrder_Editing}
                    >
                        <i className="fa fa-pencil"></i>
                    </button> */}
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                            handleDeleteRelease(
                                row.releaseID,
                                row.releaseOrderDocID
                            )
                        }
                        // disabled={deletebtn_disabled}
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];
    //Release order delete info button
    const handleDeleteRelease = async (releaseID, releaseOrderDocID) => {
        let trimmedLKRSID = localLKRSID;
        if (/^L\d+$/i.test(localLKRSID)) {
            trimmedLKRSID = localLKRSID.substring(1);
        }
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    start_loader();

                    const deletePayload = {
                        level: 1,
                        lkrS_ID: trimmedLKRSID,
                        sitE_RELS_ID: releaseID ?? 0,
                        sitE_RELS_REMARKS: "",
                        sitE_RELS_ADDITIONALINFO: "",
                        site_Rels_UpdatedBy: createdBy,
                        site_Rels_UpdatedName: createdName,
                        site_Rels_UpdatedRole: roleID,
                        sitE_RELS_DOCUMENT_ID: releaseOrderDocID || "0",
                    };

                    const response = await deleteReleaseInfo(deletePayload);

                    if (response.responseStatus === true) {
                        Swal.fire("Deleted!", response.responseMessage, "success");
                        setIsOrderEditing(false);
                        setIsOrder_EditingArea(true);
                        fetchReleaseList(trimmedLKRSID);
                    }
                    else {
                        Swal.fire("Error!", "Failed to delete. Please try again.", "error");
                    }
                } catch (error) {
                    console.error("Delete Error:", error);
                    Swal.fire("Error!", "Something went wrong.", "error");
                } finally {
                    stop_loader();
                }
            }
        });
    };

    const fetch_releasePercentage = async (trimmedLKRSID) => {
        start_loader();
        try {
            const listResponse = await fetch_releasePercentageDetails(trimmedLKRSID);
            const releaseTypeId = listResponse.sitE_RELS_SITE_RELSTYPE_ID;
            sessionStorage.setItem('sitE_RELS_Latest_SITE_RELS_ID', listResponse.sitE_RELS_Latest_SITE_RELS_ID);
            const releasePercentage = listResponse.releasePercentage;

            //   if (releaseTypeId) {
            //     handleDimensionChange(releaseTypeId, totalRecords, unreleasedSites, releasedSites, lengthRO, releasePercentage);
            //   }
        } catch (error) {
            console.error("Error fetching approval list:", error);
        } finally {
            stop_loader();
        }
    };

    const fetchReleaseList = async (trimmedLKRSID) => {
        start_loader();
        try {
            const listPayload = {
                level: 1,
                lkrsId: trimmedLKRSID,
                siteRelsId: 0,
            };

            const listResponse = await listReleaseInfo(listPayload);
            const listFileResponse = await fileListAPI(3, trimmedLKRSID, 3, 0); //level, LKRSID, MdocID, docID

            if (Array.isArray(listResponse) && listResponse.length > 0) {
                const formattedList = listResponse.map((item, index) => ({
                    layoutReleaseNumber: item.sitE_RELS_ORDER_NO,
                    dateOfOrder: item.sitE_RELS_DATE,
                    orderReleaseFile: listFileResponse[index]?.doctrN_DOCBASE64 || null,
                    releaseAuthority: item.sitE_RELS_APPROVALDESIGNATION,
                    releaseType: item.sitE_RELS_SITE_RELSTYPE,
                    releaseOrderDocID: listFileResponse[index]?.doctrN_ID || null,
                    releaseID: item.sitE_RELS_ID || null,
                }));

                const length_RO = listResponse.length;

                setOrder_Records(formattedList);
                setIsOrderEditing(true); // Disable edit button
                setIsOrder_EditingArea(false); // Disable editing mode
                setOrderReleaseStatus(true); //release order block status
                await fetchReleaseOrder(trimmedLKRSID, length_RO);
            } else {
                console.warn("Empty or invalid approval list");
                setOrder_Records([]); // clear any stale data
                setOrderReleaseStatus(false);
                setIsOrderEditing(false); // Disable edit button
                setIsOrder_EditingArea(true);
            }
            stop_loader();
        } catch (error) {
            stop_loader();
            console.error("Error fetching approval list:", error);
        } finally {
            stop_loader();
        }
    }
    const base64ToBlob = (dataUrl, mimeType = 'application/pdf') => {
        try {
            // If it's a full Data URL, split it
            const base64 = dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : dataUrl;

            const byteCharacters = atob(base64);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = Array.from(slice).map(char => char.charCodeAt(0));
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            return new Blob(byteArrays, { type: mimeType });
        } catch (error) {
            console.error("Invalid base64 input:", dataUrl);
            return null; // return null if decoding fails
        }
    };
    //EKYC block starts
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const buttonRef = useRef(null);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [loadingOwners, setLoadingOwners] = useState(false);
    const [ownerList, setOwnerList] = useState([]);
    const [ownerNameInput, setOwnerNameInput] = useState('');
    const [ownerNames, setOwnerNames] = useState('');
    const [dropdownWidth, setDropdownWidth] = useState('auto');
    const [ownerDataList, setOwnerDataList] = useState([]);
    const [ekyc_Status, setEKYC_Status] = useState(false);
    const [ownerData, setOwnerData] = useState(null);
    useEffect(() => {
        if (buttonRef.current) {
            setDropdownWidth(buttonRef.current.offsetWidth + "px");
        }

    }, [isDropdownOpen]); // update width when dropdown opens
    const fetchOwners = async () => {
        let trimmedLKRSID = localLKRSID;
        if (/^L\d+$/i.test(localLKRSID)) {
            trimmedLKRSID = localLKRSID.substring(1);
        }
        try {
            const apiResponse = await ownerEKYC_Details("1", trimmedLKRSID);
            const owners = (apiResponse || []).map(owner => ({
                name: owner.owN_NAME_EN,
                id: owner.owN_ID,
                phoneNo: owner.owN_MOBILENUMBER,
            }));

            setOwnerList(owners);

            const ownerNameList = owners.map(o => o.name).join(', ');
            setOwnerNames(ownerNameList); //  Set comma-separated owner names
            setOwnerDataList(apiResponse);
        } catch (error) {
            setOwnerList([]);
            setOwnerNames(''); // fallback if API fails
        }
    };
    const [isEKYCCompleted, setIsEKYCCompleted] = useState(false);
    const [ekyc_Data, setEkyc_Data] = useState(null);
    const [isEKYCVerified, setIsEKYCVerified] = useState(false);
    const [orderReleaseStatus, setOrderReleaseStatus] = useState(false);


    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== `${config.redirectBaseURL}`) return;

            const data = event.data;
            setEkyc_Data(data);

            if (window.location.pathname.toLowerCase() !== "/siterelease") return;

            if (data.ekycStatus === "Success") {
                //  Disable button (eKYC verified)
                Swal.fire({
                    title: 'eKYC Result',
                    text: `Status: ${data.ekycStatus}`,
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetchEKYC_ResponseDetails(selectedOwner.id, selectedOwner?.name, data.ekycTxnNo, data.ekycStatus);
                    }
                });
            } else if (data.ekycStatus === "Failure") {
                //  Ensure button stays enabled for retry
                Swal.fire('eKYC Result', `Status: ${data.ekycStatus}`, 'error');
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [selectedOwner?.name]);
    //DO EKYC
   const handleDoEKYC = async () => {
    if (!selectedOwner || !selectedOwner.name) {
      Swal.fire('Warning', 'Please select an owner before proceeding with e-KYC.', 'warning');
      return;
    }
         let trimmedLKRSID = localLKRSID;
    if (/^L\d+$/i.test(localLKRSID)) {
      trimmedLKRSID = localLKRSID.substring(1);
    }
    

    const swalResult = await Swal.fire({
      title: 'Redirecting for e-KYC Verification',
      text: 'You are being redirected to another tab for e-KYC verification. Once the e-KYC verification is complete, please return to this tab and click the verify e-KYC button.',
      icon: 'info',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });


    if (swalResult.isConfirmed) {
      start_loader();
      try {
        // Use selectedOwner.id and selectedOwner.name
        const OwnerNumber = selectedOwner.id;
        const BOOK_APP_NO = 2;
        const PROPERTY_CODE = 1;
        const redirectSource = "RLS";
        const EkycResponseUrl = `${config.redirectionTypeURL}`;
        const LKRS_ID = parseInt(trimmedLKRSID, 10);

        // Pass them to your API
        const response = await ekyc_Details({
          LKRS_ID,
          OwnerNumber,
          BOOK_APP_NO,
          PROPERTY_CODE,
          redirectSource, EkycResponseUrl
        });

        const resultUrl = response?.ekycRequestUrl;
        sessionStorage.setItem("tranNo", response?.tranNo);
        if (resultUrl) {
          window.open(
            resultUrl,
            '_blank',
            `toolbar=0,location=0,menubar=0,width=${window.screen.width},height=${window.screen.height},top=0,left=0`
          );
          stop_loader();
        } else {
          stop_loader();
          Swal.fire('Error', 'No redirect URL returned', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Something went wrong, Please try again later!', 'error');
        console.error('eKYC API call failed:', error);
        stop_loader();
      }
    }
  };
  const fetchEKYC_ResponseDetails = async (ownerNo, ownerName, txnno, ekycStatus) => {
    let trimmedLKRSID = localLKRSID;
    if (/^L\d+$/i.test(localLKRSID)) {
      trimmedLKRSID = localLKRSID.substring(1);
    }
    const transaction_No = sessionStorage.getItem("tranNo");
    if (transaction_No === txnno) {
      try {
        const payload = {
          transactionNumber: 83,
          OwnerType: 'NEWOWNER',
          ownName: ownerName,
        };
        const transactionNumber = 83;
        const OwnerType = "NEWOWNER";

        const redirectSource = "RLS";

        const response = await ekyc_Response(transactionNumber, OwnerType, ownerName,  ownerNo, trimmedLKRSID, redirectSource);

        if (response) {
          const score = response.nameMatchScore;
          const EkycNameMatch = `${config.rd_nameScore}`;
          // if (score >= EkycNameMatch) {
            if(response.vaultIdisPresent === true){

            setOwnerData(response);

            const payloadReleaseOwner = {
              relsekyC_ID: 0,
              relsekyC_LKRS_ID: parseInt(trimmedLKRSID),
              relsekyC_Own_ID: selectedOwner.id,
              relsekyC_NAME_KN: "",
              relsekyC_NAME_EN: selectedOwner.name,
              relsekyC_MOBILENUMBER: "",
              relsekyC_AADHAARNUMBER: response?.ekycResponse?.maskedAadhaar ?? null,
              relsekyC_NAMEASINAADHAAR: response?.ekycResponse?.ownerNameEng ?? null,
              relsekyC_AADHAARVERISTATUS: ekycStatus,
              relsekyC_NAMEMATCHSCORE: response?.nameMatchScore,
              relsekyC_REMARKS: "",
              relsekyC_ADDITIONALINFO: "",
              relsekyC_CREATEDBY: CreatedBy,
              relsekyC_CREATEDNAME: CreatedName,
              relsekyC_CREATEDROLE: RoleID,
              relsekyC_TransactionNo: txnno,
              relsEkyc_AADHAAR_RESPONSE: JSON.stringify(response) ?? null,
            };
            try {
              start_loader();
              const insert_response = await ekyc_insertReleaseDetails(payloadReleaseOwner);

              if (insert_response.responseStatus === true) {
                setEKYC_Status(true);
                setIsEKYCVerified(true);
                setIsEKYCCompleted(true);
                Swal.fire({
                  text: insert_response.responseMessage,
                  icon: "success",
                  confirmButtonText: "OK",
                  allowOutsideClick: false, // prevents closing on outside click
                });
                stop_loader();
              } else {
                setEKYC_Status(false);
                setIsEKYCVerified(false);
                setIsEKYCCompleted(false);
                Swal.fire({
                  text: insert_response.responseMessage,
                  icon: "error",
                  confirmButtonText: "OK",
                });
                stop_loader();
              }

            } catch (error) {
              console.error("Failed to insert data:", error);
            } finally {
              stop_loader();
            }
          } else {
            setIsEKYCVerified(false); // Optional, but ensures clarity
            Swal.fire({
              icon: 'error',
              title: 'Name Mismatch',
              text: 'The name in the Aadhaar and the selected owner’s name do not match. Please verify the details to proceed with eKYC.',
              confirmButtonColor: '#d33'
            });
          }


        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {

      }
    } else {

    }
  };
    const handleBackToDashboard = (e) => {
        e.preventDefault(); // Prevents the default anchor tag behavior
        navigate("/LayoutDashboard");
    };
    return (
        // <DashboardLayout>
        //   <div className={`layout-form-container ${loading ? 'no-interaction' : ''}`}>
        //     {loading && <Loader />}
        <div className="my-3 my-md-5">
            <div className="container mt-5">

                {/* Release Table */}
                <div className="card">
                    <div className="card-header layout_btn_color">
                        <h5 className="card-title" style={{ textAlign: 'center' }}>Release Dashboard</h5>
                    </div>
                    <div className="card-body">
                        <Link
                            onClick={handleBackToDashboard}
                            style={{ textDecoration: 'none', color: '#006879', display: 'flex', alignItems: 'center' }}
                        >
                            <i className='fa fa-arrow-left' style={{ marginRight: '8px' }}></i>
                            Back to Dashboard
                        </Link>
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
                        {/* property details table */}
                        {(lkrsTableData.lkrS_DISPLAYID && approvalTableData.approvalOrderNo) && (
                            <>
                                <h5>Property Details</h5>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <tbody>
                                        <tr>
                                            <th colSpan={2} style={thStyle}>Land type</th>
                                            <td colSpan={2} style={tdStyle}>
                                                {lkrsTableData.lkrS_LANDTYPE === 'surveyNo'
                                                    ? 'Converted Revenue Survey Number (No BBMP Khata)'
                                                    : lkrsTableData.lkrS_LANDTYPE === 'khata'
                                                        ? 'BBMP A-Khata'
                                                        : lkrsTableData.lkrS_LANDTYPE}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th style={thStyle}>KRS ID</th>
                                            <td style={tdStyle}>{lkrsTableData.lkrS_DISPLAYID}</td>
                                            <th style={thStyle}>Mother EPID</th>
                                            <td style={tdStyle}>{lkrsTableData.lkrS_EPID}</td>
                                        </tr>
                                        <tr>
                                            <th style={thStyle}>Total Number of Sites</th>
                                            <td style={tdStyle}> {approvalTableData.totalNoOfSites}</td>
                                            <th style={thStyle}>Total Extent</th>
                                            <td style={tdStyle}>{lkrsTableData.lkrS_SITEAREA_SQFT} [SQFT] , {lkrsTableData.lkrS_SITEAREA_SQMT} [SQM]</td>
                                        </tr>
                                        <tr>
                                            <th style={thStyle}>DC Conversion</th>
                                            <td style={tdStyle}>N/A</td>
                                            <th style={thStyle}>Approval Order Number</th>
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
                                                <h4 className=" m-0">Survey Number Details</h4>
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
                                                            <th>Survey Number / Surnoc / Hissa</th>
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
                                        {epid_fetchedData && (
                                            <>
                                                <style>{`
      /* Wrapper for horizontal scroll on small screens */
      .table-responsive-wrapper { /* Renamed to avoid conflict if parent also uses table-responsive */
      width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin-bottom: 20px;
        border: 2px solid lightgray; /* stronger outer border */
        padding: 20px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        font-family: Arial, sans-serif;
        min-width: 600px; /* ensures horizontal scroll on small screens */
      }
      th, td {
        border: 1.5px solid lightblue; /* distinct cell borders */
        padding: 8px;
        text-align: left;
      }
      th {
        font-weight: bold;
        color: #000;
        
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      tr:hover {
        background-color: #f1f1f1;
      }
      h3, h4 {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      .header-with-button {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px; /* Space between heading/button and table */
      }
    `}</style>
                                                <div className="table-responsive-wrapper">
                                                    <div className="header-with-button">
                                                        <h4>Property Details</h4>
                                                        {/* <button className='btn btn-warning' onClick={showImplementationAlert}>View eKhata</button> */}
                                                    </div>

                                                    {/* Property Details */}
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Property ID</th>
                                                                <th>Category</th>
                                                                <th>Classification</th>
                                                                <th>Ward Number</th>
                                                                <th>Ward Name</th>
                                                                <th>Street Name</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{epid_fetchedData.PropertyID}</td>
                                                                <td>{epid_fetchedData.PropertyCategory}</td>
                                                                <td>{epid_fetchedData.PropertyClassification}</td>
                                                                <td>{epid_fetchedData.WardNumber}</td>
                                                                <td>{epid_fetchedData.WardName?.trim()}</td>
                                                                <td>{epid_fetchedData.StreetName?.trim()}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Kaveri Registration Numbers */}
                                                    {epid_fetchedData.KaveriRegistrationNumber?.length > 0 && (
                                                        <>
                                                            <h4>Kaveri Registration Numbers</h4>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Registration Number</th>
                                                                        <th>EC Number</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {epid_fetchedData.KaveriRegistrationNumber.map((item, idx) => (
                                                                        <tr key={idx}>
                                                                            <td>{item.kaveriRegistrationNumber}</td>
                                                                            <td>{item.kaveriECNumber}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </>
                                                    )}

                                                    {/* More Property Info */}
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Street Code</th>
                                                                <th>SAS Application No</th>
                                                                <th>Is Mutation</th>
                                                                <th>Assessment No</th>
                                                                <th>Court Stay</th>
                                                                <th>Enquiry Dispute</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{epid_fetchedData.Streetcode}</td>
                                                                <td>{epid_fetchedData.SASApplicationNumber}</td>
                                                                <td>{epid_fetchedData.IsMuation}</td>
                                                                <td>{epid_fetchedData.AssessmentNumber}</td>
                                                                <td>{epid_fetchedData.courtStay}</td>
                                                                <td>{epid_fetchedData.enquiryDispute}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Check Bandi */}
                                                    <h4>Check Bandi</h4>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>North</th>
                                                                <th>South</th>
                                                                <th>East</th>
                                                                <th>West</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{epid_fetchedData.CheckBandi?.north}</td>
                                                                <td>{epid_fetchedData.CheckBandi?.south}</td>
                                                                <td>{epid_fetchedData.CheckBandi?.east}</td>
                                                                <td>{epid_fetchedData.CheckBandi?.west}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Site Details */}
                                                    <h4>Site Details</h4>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Site Area (sq ft)</th>
                                                                <th>East-West Dimension</th>
                                                                <th>North-South Dimension</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{epid_fetchedData.SiteDetails?.siteArea}</td>
                                                                <td>{epid_fetchedData.SiteDetails?.dimensions?.eastWest || '-'}</td>
                                                                <td>{epid_fetchedData.SiteDetails?.dimensions?.northSouth || '-'}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Owner Details */}
                                                    <h4>Owner Details</h4>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Owner Name</th>
                                                                <th>ID Type</th>
                                                                <th>ID Number</th>
                                                                <th>Address</th>
                                                                <th>Identifier Name</th>
                                                                <th>Gender</th>
                                                                <th>Mobile Number</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {epid_fetchedData.OwnerDetails?.map((owner, index) => (
                                                                <tr key={index}>
                                                                    <td>{owner.ownerName}</td>
                                                                    <td>{owner.idType}</td>
                                                                    <td>{owner.idNumber}</td>
                                                                    <td>{owner.ownerAddress}</td>
                                                                    <td>{owner.identifierName}</td>
                                                                    <td>{owner.gender}</td>
                                                                    <td>{owner.mobileNumber}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}

                                    </div>
                                )}
                            </>
                        )}
                        <hr />
                        {/* Approval details table  */}
                        {releaseDetails.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h5 style={{ marginBottom: '15px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                                    Layout Approval Order
                                </h5>
                                <table style={{
                                    borderCollapse: "collapse",
                                    width: "100%",
                                    fontFamily: "Arial, sans-serif",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#fff", color: "#000", textAlign: "left" }}>
                                            {/* <th style={thStyle}>ID</th> */}
                                            {/* <th style={thStyle}>KRS ID</th> */}
                                            <th style={thStyle}>Site Approval order Number</th>
                                            <th style={thStyle}>Date of Order</th>
                                            <th style={thStyle}>Approval Authority</th>
                                            <th style={thStyle}>Designation of Authority issued </th>
                                            <th style={thStyle}>Total Number of sites </th>
                                            <th style={thStyle} hidden>Release Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {releaseDetails.map((item, index) => (
                                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                                                {/* <td style={tdStyle}>{item.sitE_RELS_ID}</td> */}
                                                {/* <td style={tdStyle}>{item.apr_LKRS_Id}</td> */}
                                                <td style={tdStyle}>{item.apr_Approval_No}</td>
                                                <td style={tdStyle}>{new Date(item.apr_Approval_Date).toLocaleDateString()}</td>
                                                <td style={tdStyle}>{item.apR_APPROVALAUTHORITY_Text}</td>
                                                <td style={tdStyle}>{item.apR_APPROVALDESIGNATION}</td>
                                                <td style={tdStyle}>{item.lkrS_NUMBEROFSITES}</td>
                                                <td style={tdStyle} hidden>{item.sitE_RELS_SITE_RELSTYPE}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <hr />
                                <div className='row mt-2'>
                                    <h5 style={{ marginBottom: '15px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Owner EKYC</h5>

                                    <div className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 mt-2">
                                        <label className="form-label">Select Owner <span className='mandatory_color'>*</span></label>
                                        <button
                                            className="form-control text-start"
                                            onClick={() => {
                                                const shouldOpen = !isDropdownOpen;
                                                setIsDropdownOpen(shouldOpen);
                                                if (shouldOpen) {
                                                    fetchOwners();
                                                }
                                            }}
                                            ref={buttonRef}  // attach ref here
                                        >
                                            {selectedOwner ? selectedOwner.name : "Select an owner"}
                                        </button>

                                        {isDropdownOpen && (
                                            <ul
                                                className="dropdown-menu show"
                                                style={{
                                                    overflowY: "auto",
                                                    width: dropdownWidth,
                                                    maxHeight: "250px", marginLeft: "13px",
                                                }}
                                            >
                                                {loadingOwners ? (
                                                    <li className="px-3 py-2">Loading...</li>
                                                ) : (
                                                    ownerList.map((owner, index) => (
                                                        <li key={owner.id || index}>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    setSelectedOwner(owner);
                                                                    setOwnerNameInput(owner.name);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                            >
                                                                {owner.name}
                                                            </button>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 mt-5" >
                                        <label className="form-label"></label>
                                        <button className='btn btn-info btn-block' disabled={!selectedOwner || isEKYCVerified} onClick={handleDoEKYC}>Do eKYC</button>
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 mt-5">
                                        {isEKYCVerified && (
                                            <div className="mb-2 text-success font-weight-bold">
                                                eKYC Verified!
                                            </div>
                                        )}
                                        {!isEKYCVerified && (
                                            <div className="mb-2 text-danger font-weight-bold">
                                                eKYC Failed!
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-5" >
                                    <hr className='mt-1' />
                                    <h6 className='fw-normal fs-5' style={{ color: '#0077b6' }}>{t('translation.BDA.Subdivision1.heading')}</h6>
                                    <hr className='mt-1' style={{ border: '1px dashed #0077b6' }} />
                                    <div className="row">
                                        {/* release Order Number */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t('translation.BDA.Subdivision1.orderNo')} <span className="mandatory_color">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    placeholder={t('translation.BDA.Subdivision1.orderNoPlaceholder')}
                                                    name="layoutOrderNumber"  // <-- Corrected here
                                                    value={release_formData.layoutOrderNumber}
                                                    onChange={handleOrderChange}
                                                    // disabled={!isOrder_EditingArea}
                                                />
                                                {release_errors.layoutOrderNumber && (
                                                    <small className="text-danger">{release_errors.layoutOrderNumber}</small>
                                                )}

                                            </div>
                                        </div>
                                        {/* Date of order */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t('translation.BDA.Subdivision1.dateofOrder')} <span className="mandatory_color">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="dateOfOrder"
                                                    value={release_formData.dateOfOrder}
                                                    max={new Date().toISOString().split("T")[0]}
                                                    onChange={handleOrderChange}
                                                    // disabled={!isOrder_EditingArea} // Disable when not editing
                                                />
                                                {release_errors.dateOfOrder && (
                                                    <small className="text-danger">{release_errors.dateOfOrder}</small>
                                                )}
                                            </div>
                                        </div>
                                        {/* Scan & Upload Layout release order */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t('translation.BDA.Subdivision1.scanUploadOrder')}
                                                    <span className="mandatory_color">*</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    className="form-control"
                                                    onChange={handleFilereleaseOrderChange}
                                                    ref={fileReleaseOrderInputRef}
                                                    // disabled={!isOrder_EditingArea} // Disable when not editing
                                                />
                                                {release_formData.release_Order && releaseOrderURL && (
                                                    <div className="mt-2">
                                                        <div
                                                            style={{
                                                                width: "120px",
                                                                height: "120px",
                                                                border: "1px solid #ccc",
                                                                borderRadius: "8px",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            <iframe
                                                                src={releaseOrderURL}
                                                                title="Release Order"
                                                                width="100%"
                                                                height="100%"
                                                                style={{ cursor: "pointer", border: "none" }}
                                                                onClick={() =>
                                                                    window.open(releaseOrderURL, "_blank")
                                                                }
                                                            />
                                                        </div>
                                                        <p className="mt-1" style={{ fontSize: "0.875rem" }}>
                                                            Current File:{" "}
                                                            <a
                                                                href={releaseOrderURL}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    textDecoration: "underline",
                                                                    color: "#007bff",
                                                                    fontSize: "0.875rem",
                                                                }}
                                                            >
                                                                {release_formData.release_Order.name}
                                                            </a>
                                                        </p>
                                                    </div>
                                                )}
                                                <span className="note_color">
                                                    {t('translation.BDA.Subdivision1.noteFile')}
                                                </span>
                                                <br />
                                                {release_errors.release_Order && (
                                                    <small className="text-danger">{release_errors.release_Order}</small>
                                                )}
                                            </div>
                                        </div>
                                        {/* release Authority */}
                                        <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    {t('translation.BDA.Subdivision1.designation')}
                                                    <span className="mandatory_color">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder={t('translation.BDA.Subdivision1.placeholderDesignation')}
                                                    name="orderAuthority"
                                                    value={release_formData.orderAuthority}
                                                    onChange={handleOrderChange}
                                                    // disabled={!isOrder_EditingArea} // Disable when not editing
                                                />
                                                {release_errors.orderAuthority && (
                                                    <small className="text-danger">{release_errors.orderAuthority}</small>
                                                )}
                                            </div>
                                        </div>


                                        <div className='col-0 col-sm-0 col-md-10 col-lg-10 col-xl-10'></div>
                                        <div className="col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 ">
                                            <div className="form-group">
                                                <button className="btn btn-success btn-block" onClick={handleOrderSave} 
                                                // disabled={!isOrder_EditingArea}
                                                >
                                                    Save and continue
                                                </button>
                                            </div>
                                        </div>
                                        {/* Save Button */}
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <div className="form-group">
                                                {order_records.length > 0 && (
                                                    <div className="mt-4">
                                                        <h4>{t('translation.BDA.table1.heading')}</h4>
                                                        <DataTable
                                                            columns={order_columns}
                                                            data={order_records}
                                                            customStyles={customStyles}
                                                            pagination
                                                            highlightOnHover
                                                            striped
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Table to Display Records */}

                                    </div>
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
                                {selectedRows.length > 0 && (
                                    <p style={{
                                        backgroundColor: '#e8f4ff',
                                        border: '1px solid #b3d8ff',
                                        padding: '10px 15px',
                                        borderRadius: '6px',
                                        color: '#0056b3',
                                        fontWeight: '500',
                                        marginTop: '10px'
                                    }}>
                                        {selectedRows.length} record{selectedRows.length > 1 ? 's' : ''} selected
                                    </p>
                                )}
                                {releaseData.length > 0 ? (
                                    <>
                                        {/* Select All Checkbox */}
                                        <div className="d-flex justify-content-start mb-2">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectAllChecked}
                                                    onChange={(e) => handleSelectAll(e)}
                                                    disabled={isSelectAllDisabled()}
                                                />{' '}
                                                Select All
                                            </label>
                                        </div>

                                        {/* Cards Grid */}
                                        <div className="row">
                                            {releaseData.map((row, index) => {
                                                const isSelected = selectedRows.includes(index);
                                                const feetSides = row.siteDimensions?.map(dim => dim.sitediM_SIDEINFT).join(" x ") || '';
                                                const meterSides = row.siteDimensions?.map(dim => dim.sitediM_SIDEINMT).join(" x ") || '';
                                                const roadFacing = row.siteDimensions?.map(dim => dim.sitediM_ROADFACING ? "Yes" : "No").join(', ') || '';

                                                return (
                                                    <div className="col-md-4 col-lg-3 col-xl-2 mb-3" key={row.id}>
                                                        <div className={`card h-100 shadow p-2 blue-bordered-card position-relative ${isSelected ? 'border-primary' : ''}`}>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => handleRowSelect(index)}
                                                                />
                                                                <span className="badge bg-secondary">{row.sitE_SHAPETYPE}</span>
                                                            </div>

                                                            <div className="mt-2">
                                                                <div><strong>Site No:</strong> {row.sitE_NO}</div>
                                                                <div><strong>Dimension:</strong></div>
                                                                <div className="small text-muted">{feetSides} ft</div>
                                                                <div className="small text-muted">{meterSides} m</div>
                                                                <div className="small"><strong>Road Facing:</strong> {roadFacing}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="row">
                                            <div className="col-md-9"></div>
                                            <div className="col-md-3">
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
                                <div className='col-md-3'>
                                    <button
                                        className="btn btn-primary btn-block mt-3"
                                        onClick={releaseSites}
                                    >
                                        Save
                                    </button>
                                </div>

                                {/* {finalApiList.length !== 0 && (
                      <div className='col-md-3'>
                        <button
                          className="btn btn-primary btn-block mt-3"
                          onClick={handleFinal40PercentSave}
                        >
                          Final Save
                        </button>
                      </div>
                    )} */}


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
                            {/* <DataTable
                    columns={alreadyreleasedTableColumns}
                    data={finalApiList}
                    customStyles={customStyles}
                    pagination
                    striped
                    highlightOnHover
                    responsive
                  /> */}
                            {finalApiList.length > 0 ? (
                                <div className="row">
                                    {finalApiList.map((row, index) => {
                                        const feetSides = row.siteDimensions?.map(dim => dim.sitediM_SIDEINFT).join(" x ") || '';
                                        const meterSides = row.siteDimensions?.map(dim => dim.sitediM_SIDEINMT).join(" x ") || '';
                                        const roadFacing = row.siteDimensions?.map(dim => dim.sitediM_ROADFACING ? "Yes" : "No").join(', ') || '';

                                        return (
                                            <div className="col-md-4 col-lg-3 col-xl-2 mb-2" key={row.id || index}>
                                                <div className="card h-100 shadow p-3 green-bordered-card position-relative">
                                                    {/* Top-right badge */}
                                                    <div className="status-badge">Released</div>

                                                    <div className="mt-1">
                                                        <div><strong>Site No:</strong> {row.sitE_NO}</div>
                                                        <div><strong>Dimension:</strong></div>
                                                        <div className="small text-muted">{feetSides} ft</div>
                                                        <div className="small text-muted">{meterSides} m</div>
                                                        <div className="small"><strong>Road Facing:</strong> {roadFacing}</div>
                                                        <div className="small"><strong>Shape:</strong> {row.sitE_SHAPETYPE}</div>

                                                    </div>
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    fontWeight: '500',
                                    color: '#999'
                                }}>
                                    There are no released sites to display
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
        //   </div>
        // </DashboardLayout>
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



export default ReleaseDashboard;
