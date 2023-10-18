import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, Form, Col } from 'react-bootstrap';
import { apiUrl } from '../config';
import 'bootstrap/dist/css/bootstrap.min.css';

function RowDataModal({ showModal, handleClose, rowData, columnDefs, colTypes, idCol, table, fetchData }) {

    const formRef = useRef(null);
    const [dropdowns, setDropdowns] = useState({});

    const urlmap = {
        "clients": "create_client_form",
        "projects": "create_project_form",
        "stands": "create_stand_form"
    }

    useEffect(() => {
        if (urlmap[table] === undefined) {
            return
        }
        fetch(apiUrl + urlmap[table], {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => setDropdowns(data.dropdowns))
    }, [table]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formElements = formRef.current.elements;
        let entry = {};
        for (const key of Object.keys(colTypes)) {
            if (colTypes[key] === 'BOOLEAN') {
                entry[key] = formElements[key].checked ? 1 : 0;
            } else {
                entry[key] = formElements[key].value;
            }
        }

        fetch(apiUrl + 'update_row', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                table_name: table,
                selected_row: rowData,
                form: entry
            }),
        })
            .then(response => response.json())
            .then(() => {
                fetchData();
            })
            .catch(error => console.error(error));
    };

    const handleDeleteRow = (event) => {
        event.preventDefault()
        if (window.confirm('Are you sure you want to delete this entry?')) {
            fetch(apiUrl + 'delete_entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table_name: table,
                    selected_row: rowData,
                }),
            })
                .then(response => response.json())
                .then(() => {
                    fetchData()
                    handleClose()
                })
                .catch(error => console.error(error));
        }
    }

    const handleSaveAndClose = (event) => {
        event.preventDefault();
        handleSubmit(event);
        handleClose();
    };

    function buildFormRow(rowData, key) {
        let key_column = null;
        for (let i = 0; i < columnDefs.length; i++) {
            if (columnDefs[i].field === key) {
                key_column = columnDefs[i].headerName;
                break;
            }
        }
        let editable = true
        if (table === "james") {
            editable = false
        }
        if (!(key in colTypes) || (key.includes("_ID") && key !== idCol)) {
            editable = false;
        }
        if ((table === "stands") & (key === "STAND_ID")) {
            editable = true;
        }

        let type = colTypes[key];
        if (Object.hasOwnProperty.call(dropdowns, key)) {
            type = "DROPDOWN"
        }

        let control = <Form.Control type="text" name={key} defaultValue={rowData[key]} readOnly={!editable} />;
        if (type !== undefined) {
            if (type.includes('VARCHAR') || type.includes('INT') || type.includes('FLOAT') || type.includes('BIGINT')) {
                control = <Form.Control type="text" name={key} defaultValue={rowData[key]} readOnly={!editable} />;
            } else if (type === 'BOOLEAN') {
                control = <Form.Check
                    type="checkbox"
                    name={key}
                    defaultChecked={rowData[key] === 1}
                    readOnly={!editable}
                />;
            } else if (type === 'DATE') {
                control = <Form.Control type="date" name={key} defaultValue={rowData[key]} readOnly={!editable} />;
            } else if (type === 'DROPDOWN') {
                control = (
                    <Form.Control as="select" name={key} defaultValue={rowData[key]} disabled={!editable}>
                        {dropdowns[key].map((item, index) => {
                            let displayValue, actualValue;
            
                            // Check if item is an object
                            if (typeof item === 'object' && item !== null) {
                                actualValue = item[key];
                                displayValue = item[key]; // or any transformation of the JSON to string for display purposes
                            } else {
                                // Item is assumed to be a string
                                actualValue = item;
                                displayValue = item;
                            }
                            
                            return (
                                <option key={index} value={actualValue}>
                                    {displayValue}
                                </option>
                            );
                        })}
                    </Form.Control>
                );
            }
        }

        return (
            <Form.Group className="customFormGroup" as={Form.Row} key={key} controlId={key}>
                <Form.Label column sm={4}>{key_column}</Form.Label>
                <Col sm={8}>
                    {control}
                </Col>
            </Form.Group>
        )
    }

    return (
        <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Row Data</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form ref={formRef} onSubmit={handleSubmit}>
                    {Object.keys(rowData).map(key => (
                        buildFormRow(rowData, key)
                    ))}
                    {table !== "james" && (
                        <>
                            <Button variant="info" type="submit">Submit</Button>
                            <Button variant="success" onClick={handleSaveAndClose}>Save and Close</Button>
                            <Button variant="danger" onClick={handleDeleteRow}>Delete Entry</Button>
                        </>
                    )}
                    <Button variant="primary" onClick={handleClose}>Close</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default RowDataModal;
