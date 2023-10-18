import { React, useMemo, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../config';

function validateEntry(entry) {
    const checks = [
        { key: 'CLIENT_ID', digits: 5 },
        { key: 'PROJECT_ID', digits: 6 },
        { key: 'STAND_ID', digits: 3 },
        { key: 'STAND_PERSISTENT_ID', digits: 7 },
    ];

    for (const check of checks) {
        const value = entry[check.key];
        if (value !== undefined && value !== null) {
            const valueString = String(value);
            if (valueString.length !== check.digits || !/^\d+$/.test(valueString)) {
                return false;
            }
        }
    }

    return true;
}

function PreviewData({ isOpen, onRequestClose, data, table, onSubmitSuccess }) {
    const [validatedData, setValidatedData] = useState([]);
    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            resizable: true,
            filter: true,
        };
    }, []);

    useEffect(() => {
        const validated = data.filter(validateEntry);
        setValidatedData(validated);
    }, [data]);

    const navigate = useNavigate();

    const handleSave = async () => {
        try {
            const response = await fetch(apiUrl + 'create_entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table_name: table,
                    entry: validatedData,
                }),
            });
    
            const responseData = await response.json();
            console.log(responseData);
            onSubmitSuccess();
        } catch (error) {
            alert('Error submitting data: ' + error.message);
        }
    };

    const handleSaveAndView = async () => {
        await handleSave();
        navigate(`/view/${table}`);
    };
    

    if (data.length === 0) {
        return null;
    }

    const entryKeys = Object.keys(data[0]);
    const columnDefs = [
        {
            headerName: "Validated",
            field: "validated",
            width: 120,
            cellRenderer: params => params.value ? '✓' : '✗',
            cellStyle: params => params.value ? { backgroundColor: 'green', color: 'white' } : { backgroundColor: 'red', color: 'white' },
        },
        ...entryKeys.map(key => ({ headerName: key, field: 'entry.' + key })),
    ];
    const rowData = data.map(entry => ({ entry, validated: validateEntry(entry) }));

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <h2>Data Preview</h2>
            <div className="ag-theme-alpine" style={{ height: '400px', width: '1000px' }}>
                <AgGridReact
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                />
            </div>
            <button onClick={handleSave} style={{ marginTop: '10px' }}>Save and Create More</button>
            <button onClick={handleSaveAndView} style={{ marginTop: '10px' }}>Save and View</button>
            <button onClick={onRequestClose} style={{ marginTop: '10px' }}>Close</button>
        </Modal>
    );
}

export default PreviewData;
