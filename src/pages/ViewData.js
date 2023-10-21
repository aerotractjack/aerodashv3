import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useParams } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import Grid from '../components/Grid';
import ViewSidebar from '../components/ViewSidebar';
import { colOrder, apiUrl, viewTables } from '../config';

function ViewData() {
    const { table } = useParams();
    const [rowData, setRowData] = useState({});
    const [origData, setOrigData] = useState([]);
    const [colTypes, setColTypes] = useState({});
    const [idCol, setIDCol] = useState(null);
    const [groupLabel, setGroupLabel] = useState(null);
    const [groupKey, setGroupKey] = useState(null);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [colFriendlyNames, setColFriendlyNames] = useState({});
    const [curPos, setCurPos] = useState(null);

    const gridApiRef = useRef(null);

    const getViewName = () => {
        return Object.keys(viewTables).find(key => viewTables[key] === table);
    }

    const sortCols = (array) => {
        return array.map(obj => {
            const sortedKeys = Object.keys(obj)
                .sort((a, b) => {
                    const aIndex = colOrder.findIndex((o) => a.startsWith(o));
                    const bIndex = colOrder.findIndex((o) => b.startsWith(o));
                    if (aIndex === -1 && bIndex === -1) {
                        return a.localeCompare(b);
                    }
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                });
            const sortedObj = sortedKeys.reduce((acc, key) => {
                acc[key] = obj[key];
                return acc;
            }, {});
            return sortedObj;
        });
    };

    const getCellRenderer = (t) => {
        const renderers = {
            num: function (params) {
                return <span style={{ fontFamily: 'Courier New, Courier, monospace' }}>{Number(params.value).toFixed(2)}</span>;
            },
            bool: function (params) {
                return <span style={{ backgroundColor: params.value ? 'green' : 'red' }}>{params.value ? 'True' : 'False'}</span>;
            },
            ID: function (params) {
                return <span style={{ fontFamily: 'Courier New, Courier, monospace', textDecoration: 'underline' }}>{params.value}</span>;
            },
            name: function (params) {
                return <span>{params.value}</span>;
            },
            abbr: function (params) {
                return <span style={{ fontFamily: 'Courier New, Courier, monospace', fontStyle: 'italic' }}>{params.value}</span>;
            },
            date: function (params) {
                if (params.value === null || params.value === undefined || params.value === "") {
                    return
                }
                let date = new Date(params.value);
                return date.toISOString().substr(0, 10);
            },
            proj_status_enum: function (params) {
                const colors = {
                    active: 'green',
                    waiting: 'black',
                    billing: 'blue',
                    closed: 'purple',
                    urgent: 'red',
                };
                const color = colors[params.value.toLowerCase()] || 'black';
                return <span style={{ color: color, border: `1px solid ${color}`, padding: '2px' }}>{params.value}</span>;
            },
        };

        return renderers[t];
    }

    const fetchData = () => {
        fetch(apiUrl + 'friendly_column_names', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                setColFriendlyNames(data)
            })
            .catch(error => console.error(error));
        fetch(apiUrl + 'dashboard_table_view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ table: table }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    data = sortCols(data)
                    setRowData({ "All Data": data })
                    setGroupLabel("")
                    setOrigData(data)
                }
            })
            .catch(error => console.error(error));
        fetch(apiUrl + 'get_id_col', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ table_name: table }),
        })
            .then(response => response.json())
            .then(data => {
                setIDCol(data)
            })
            .catch(error => console.error(error));
        fetch(apiUrl + 'column_types', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ table_name: table }),
        })
            .then(response => response.json())
            .then(data => {
                setColTypes(data)
            })
            .catch(error => console.error(error));
    }

    useEffect(() => {
        fetchData()
    }, [table]);

    useEffect(() => {
        if (origData.length > 0) {
            const initialColumnVisibility = Object.keys(origData[0]).reduce((acc, key) => ({
                ...acc,
                [key]: true,
            }), {});
            setColumnVisibility(initialColumnVisibility);
        }
        if (groupKey && groupKey !== "" && origData.length > 0) {
            console.log("grouping by ", groupKey, " after fetching")
            onGroupBy(groupKey);
        }
    }, [origData, groupKey]);

    const columnDefs = useMemo(() => origData.length > 0 ? Object.keys(origData[0]).map(key => ({
        headerName: colFriendlyNames[key][0],
        field: key,
        cellRenderer: getCellRenderer(colFriendlyNames[key][1])
    })) : [], [origData]);


    if (origData.length === 0) {
        return (<></>);
    }

    const toggleColumnVisibility = (colKey) => {
        setColumnVisibility((prev) => ({
            ...prev,
            [colKey]: !prev[colKey],
        }));
    };

    const onGroupBy = (key) => {
        console.log("grouping by ", key)
        if (key === "reset") {
            setRowData({ "All Data": origData })
            setGroupLabel("")
            setGroupKey("")
        } else {
            const result = {};
            let key_column = null;
            for (let i = 0; i < columnDefs.length; i++) {
                if (columnDefs[i].headerName === key) {
                    key_column = columnDefs[i].field;
                    setGroupKey(key)
                    break;
                }
            }
            origData.forEach(item => {
                const value = item[key_column];
                if (!result[value]) {
                    result[value] = [];
                }
                result[value].push(item);
                setGroupLabel("by " + key)
            });
            setRowData(result);
        }
    }

    function buildTitle() {
        return (
            <>
                <Card className='view-label-card'>
                    <Card.Header>
                        <h1>{getViewName()} {groupLabel}</h1>
                    </Card.Header>
                </Card>
            </>
        )
    }

    const onGridReady = params => {
        gridApiRef.current = params.api;
        params.api.sizeColumnsToFit();
    };


    function buildGrid(key) {
        const data = rowData[key];
        return (
            <Card className='grid-card' key={key}>
                <Card.Body>
                    <Card.Title>{key}</Card.Title>
                    <Grid
                        key={key}
                        gridData={data}
                        columnDefs={columnDefs}
                        columnVisibility={columnVisibility}
                        colTypes={colTypes}
                        idCol={idCol}
                        table={table}
                        fetchData={fetchData}
                        setCurPos={setCurPos}
                        domLayout='autoHeight'
                        onGridReady={onGridReady}
                    />
                </Card.Body>
            </Card>
        );
    }

    return (
        <div>
            <Navbar />
            <div style={{ display: 'flex' }}>
                <ViewSidebar
                    groupCols={columnDefs.map(cd => cd.headerName)}
                    onGroupBy={onGroupBy}
                    columnDefs={columnDefs}
                    columnVisibility={columnVisibility}
                    toggleColumnVisibility={toggleColumnVisibility}
                />
                <div style={{ marginLeft: '275px', padding: '20px' }}>
                    {buildTitle()}
                    {Object.keys(rowData).map(key => buildGrid(key))}
                </div>
            </div>
        </div>
    );
}

export default ViewData;
