import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import RowDataModal from './RowDataModal';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

function Grid({ gridData, columnDefs, columnVisibility, colTypes, idCol, table, fetchData, curPos, setCurPos }) {
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const [gridWidth, setGridWidth] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState({});

  // const resetView = () => {
  //   console.log("reset view")
  //   if (gridApi && curPos !== null) {
  //     console.log("ensuring visible", curPos)
  //     gridApi.ensureIndexVisible(curPos);
  //   }
  // }

  const resetView = (cp) => {
    console.log("reset view")
    if (gridApi) {
      console.log("ensuring visible", cp)
      gridApi.ensureIndexVisible(cp);
    }
  }

  // useEffect(() => {
  //   console.log("useeffect")
  //   resetView();
  // }, [gridApi, curPos]);

  useEffect(() => {
    if (columnApi) {
      Object.keys(columnVisibility).forEach((colKey) => {
        columnApi.setColumnVisible(colKey, columnVisibility[colKey]);
      });
    }
  }, [columnVisibility, columnApi]);

  const gridHeight = (gridData.length + 1) * 30 + 50;

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      resizable: true,
      filter: true,
    };
  }, []);

  const onGridReady = params => {
    console.log("ready")
    setGridApi(params.api);
    setColumnApi(params.columnApi);

    Object.keys(columnVisibility).forEach((colKey) => {
      params.columnApi.setColumnVisible(colKey, columnVisibility[colKey]);
    });
  };

  const onRowDoubleClicked = event => {
    setSelectedRowData(event.data);
    setShowModal(true);
    // const firstVisibleRow = gridApi.getFirstDisplayedRow();
    // setCurPos(firstVisibleRow);
    console.log("current pos: ", gridApi.getFirstDisplayedRow())
  };

  const handleClose = () => {
    setShowModal(false);
    console.log("current pos when closing: ", gridApi.getFirstDisplayedRow())
    const firstVisibleRow = gridApi.getFirstDisplayedRow();
    resetView(firstVisibleRow);
  };

  return (
    <div>
      <div
        className="ag-theme-alpine"
        style={{
          height: `${Math.min(gridHeight, 500)}px`,
          width: `${Math.min(window.innerWidth - 375, 2500)}px`
        }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={gridData}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onRowDoubleClicked={onRowDoubleClicked}
          domLayout='autoWidth'
        />
      </div>

      <RowDataModal
        showModal={showModal}
        handleClose={handleClose}
        rowData={selectedRowData}
        columnDefs={columnDefs}
        colTypes={colTypes}
        idCol={idCol}
        table={table}
        fetchData={fetchData}
      />
    </div>
  );

}

export default Grid;
