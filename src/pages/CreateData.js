import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import Navbar from '../components/Navbar.js';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import Modal from 'react-modal';
import { colOrder, apiUrl } from '../config.js'
import PreviewData from '../components/PreviewData.js';

function CreateData() {
    const { table } = useParams();
    const [form, setForm] = useState({});
    const [idCol, setIDCol] = useState(null);
    const [textEntryMode, setTextEntryMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState([]);

    const navigate = useNavigate()

    const formRef = useRef(null);

    const urlmap = {
        "clients": "create_client_form",
        "projects": "create_project_form",
        "stands": "create_stand_form"
    }

    const option_url_map = {
        "CLIENT_ID": "get_client_names_ids",
        "PROJECT_ID": "get_project_names_ids",
        "STAND_PERSISTENT_ID": "get_stand_names_ids",
    }

    const fetchData = () => {
        fetch(apiUrl + urlmap[table], {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                data.coltypes = sortColTypes(data.coltypes)
                setForm(data);
            })
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
    }

    useEffect(() => {
        fetchData()
    }, [table]);

    const sortColTypes = (coltypes) => {

        if (coltypes === null || coltypes === undefined) {
            return {}
        }

        const sortedColtypes = Object.keys(coltypes)
            .sort((a, b) => {
                const aIndex = colOrder.findIndex((o) => a.startsWith(o));
                const bIndex = colOrder.findIndex((o) => b.startsWith(o));

                if (aIndex === -1 && bIndex === -1) {
                    return a.localeCompare(b);
                }

                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;

                return aIndex - bIndex;
            })
            .reduce((acc, key) => {
                acc[key] = coltypes[key];
                return acc;
            }, {});

        return sortedColtypes;
    };

    const handleDropdownChange = (key, event) => {
        let selectedValue = event.target.value;
        if (selectedValue.includes("{")) {
            selectedValue = parseIfJSON(selectedValue, key)
        }

        console.log(selectedValue)

        if (key === "CLIENT_ID" & table !== "projects") {
            fetch(apiUrl + option_url_map["PROJECT_ID"], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: selectedValue }),
            })
                .then(response => response.json())
                .then(data => {
                    setForm(prevState => ({
                        ...prevState,
                        dropdowns: {
                            ...prevState.dropdowns,
                            PROJECT_ID: data,
                        },
                    }));
                })
                .catch(error => console.error(error));
        } else if (key === "PROJECT_ID" & table !== "stands") {
            fetch(apiUrl + option_url_map["STAND_PERSISTENT_ID"], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: selectedValue }),
            })
                .then(response => response.json())
                .then(data => {
                    setForm(prevState => ({
                        ...prevState,
                        dropdowns: {
                            ...prevState.dropdowns,
                            STAND_PERSISTENT_ID: data,
                        },
                    }));
                })
                .catch(error => console.error(error));
        }
    };

    const parseIfJSON = (d, k) => {
        if (d.includes("{")) {
            return JSON.parse(d)[k]
        }
        return d
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const formElements = formRef.current.elements;
        let entry = null;
        if (textEntryMode) {
            entry = [];
            const placeholder = formElements.csvInput.placeholder;
            const csvInput = placeholder + '\n' + formElements.csvInput.value.trim()
            Papa.parse(csvInput, {
                complete: (result) => {
                    result.data.forEach((row, index) => {
                        for (const key of Object.keys(form.coltypes)) {
                            if (form.dropdowns.hasOwnProperty(key)) {
                                row[key] = parseIfJSON(formElements[key].value, key);
                            }
                            else if (form.force_select.hasOwnProperty(key)) {
                                if (formElements[key] === undefined || formElements[key] === null) {
                                    row[key] = null
                                } else {
                                    row[key] = formElements[key].value;
                                }
                            }
                        }
                        entry.push(row);
                    });
                },
                header: true,
            });
            submitEntryToAPI(entry)
        } else {
            entry = {};
            for (const key of Object.keys(form.coltypes)) {
                if (form.dropdowns.hasOwnProperty(key)) {
                    entry[key] = parseIfJSON(formElements[key].value, key);
                }
                else if (form.force_select.hasOwnProperty(key)) {
                    entry[key] = formElements[key].value;
                }
                else if (form.coltypes[key] === 'BOOLEAN') {
                    entry[key] = formElements[key].checked ? 1 : 0;
                } else {
                    entry[key] = formElements[key].value;
                }
            }
            submitEntryToAPI([entry])
        }
    };

    const handleFileUpload = (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        Papa.parse(file, {
            complete: (result) => {
                let entry = []
                result.data
                    .filter(row => Object.values(row).some(value => value))  // filter out empty rows
                    .forEach((row, index) => {
                        entry.push(row);
                    });
                submitEntryToAPI(entry)
                setIsModalOpen(false);
            },
            header: true,
        });
    };


    const submitEntryToAPI = (entry) => {
        console.log(entry, " submitted")
        setPreviewData(entry);
        setIsPreviewOpen(true);
    }

    const handleToggleMode = () => {
        setTextEntryMode(prev => !prev);
    };

    function isPlainObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    const renderFormControl = (key) => {
        const type = form.coltypes[key];
        const readOnly = form.force_select.hasOwnProperty(key);
        const defaultValue = form.force_select[key];
        if (form.dropdowns.hasOwnProperty(key)) {
            return (
                <Form.Control as="select" defaultValue={defaultValue} readOnly={readOnly} onChange={(event) => handleDropdownChange(key, event)}>
                    <option value="">Make a selection:</option>
                    {form.dropdowns[key].map((option, index) => {
                        const optionValue = isPlainObject(option) ? JSON.stringify(option) : option;
                        return (
                            <option key={index} value={optionValue}>
                                {optionValue}
                            </option>
                        );
                    })}
                </Form.Control>
            );
        } else if (type.includes('TEXT') || type.includes('VARCHAR') ||
            type.includes('INT') || type.includes('FLOAT') || type.includes('BIGINT')) {
            return <Form.Control type="text" name={key} defaultValue={defaultValue} readOnly={readOnly} />;
        } else if (type === 'BOOLEAN') {
            return <Form.Check type="checkbox" name={key} defaultChecked={defaultValue === 1} readOnly={readOnly} />;
        } else if (type === 'DATE') {
            return <Form.Control type="date" name={key} defaultValue={defaultValue} readOnly={readOnly} />;
        }
    }

    const renderCSVInput = () => {
        const placeholder = Object.keys(form.coltypes)
            .filter(key => !(form.dropdowns.hasOwnProperty(key)) && !(form.force_select.hasOwnProperty(key)) && !(key === idCol))
            .join(',');

        return (
            <>
                <Form.Label>
                    CSV Input
                    <pre style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}>
                        (Headers: {placeholder})
                    </pre>
                </Form.Label>
                <Form.Control as="textarea" rows={10} placeholder={placeholder} name="csvInput" />
            </>
        );
    }

    const renderForm = () => (
        <Form ref={formRef} onSubmit={handleSubmit}>
            {Object.keys(form.coltypes).map(key => (
                <Form.Group key={key} controlId={key}>
                    {textEntryMode && (!form.dropdowns.hasOwnProperty(key)
                        && !form.force_select.hasOwnProperty(key) || key === idCol)
                        ? null :
                        <>
                            <Form.Label>{key}</Form.Label>
                            {renderFormControl(key)}
                        </>
                    }
                </Form.Group>
            ))}
            {textEntryMode &&
                <Form.Group controlId="csvInput">
                    {renderCSVInput()}
                </Form.Group>
            }
            <Button className="button" variant="primary" type="submit">Preview Submission</Button>
            <Modal className="csv-modal"
                isOpen={isModalOpen}
                overlayClassName="csv-modal-overlay"
                onRequestClose={() => setIsModalOpen(false)}>
                <h2>Upload CSV File</h2>
                <p>Make sure your CSV file has the following headers:</p>
                <pre style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}>
                    {Object.keys(form.coltypes).filter(key => key !== idCol).join(',')}
                </pre>
                <input type="file" accept=".csv" onChange={handleFileUpload} />
                <Button className="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ marginTop: '10px' }}>Close</Button>
            </Modal>
        </Form>
    );

    return (
        <div class="modal-overlay" id="modal-overlay">
        <div className="container">
            <Navbar />
            <div className="form-container">
                {form.coltypes && (
                    <Card className="card">
                        {/* <Button onClick={handleToggleMode} className="text-entry-button">
                            {textEntryMode ? 'Switch to Form Mode' : 'Switch to Text Entry Mode'} 
                        </Button> */}
                        <Button variant="secondary" onClick={() => setIsModalOpen(true)} className="csv-entry-button">
                            Upload from CSV file
                        </Button>
                        <Card.Header className="view-label-card">
                            <h1>Create {table}</h1>
                        </Card.Header>
                        <Card.Body>
                            {renderForm()}
                        </Card.Body>
                    </Card>
                )}
                <PreviewData
                    isOpen={isPreviewOpen}
                    onRequestClose={() => setIsPreviewOpen(false)}
                    data={previewData}
                    table={table}
                    onSubmitSuccess={() => {
                        setIsPreviewOpen(false);
                        navigate(`/create/${table}`);
                        fetchData();
                    }}
                />
            </div>
        </div>
        </div>
    )

}

export default CreateData;
