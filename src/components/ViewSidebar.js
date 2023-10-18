import React, { useState, useRef, useEffect } from 'react';

function ViewSidebar({ groupCols, onGroupBy, columnDefs, columnVisibility, toggleColumnVisibility }) {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const sidebar = sidebarRef.current;
        let maxWidth = 0;
        if (sidebar === null) {
            return
        }
        Array.from(sidebar.children).forEach(child => {
            const width = child.offsetWidth;
            if (width > maxWidth) {
                maxWidth = width;
            }
        });
        sidebar.style.width = `${maxWidth}px`;
    }, [groupCols, columnDefs, columnVisibility]);

    const handleGroupBy = (key) => {
        setSelectedGroup(key);
        onGroupBy(key);
    };

    return (
        <div className='view-sidebar-div'>
            <h3>Group By Menu</h3>
            <div>
                <button
                    key="reset"
                    onClick={() => { handleGroupBy("reset"); setSelectedGroup(null); }}
                    className='view-sidebar-button'
                >
                    Reset View
                </button>
            </div>
            {groupCols.map(key => (
                <div key={key}>
                    <button
                        onClick={() => handleGroupBy(key)}
                        className={selectedGroup === key ? "active-view-sidebar-button" : "view-sidebar-button"}
                    >
                        {key}
                    </button>
                </div>
            ))}

            <h3>Toggle Columns</h3>
            {columnDefs.map(cd => {
                let name = cd.headerName;
                let colKey = cd.field;
                return (
                    <div key={colKey}>
                        <button
                            onClick={() => toggleColumnVisibility(colKey)}
                            className={`view-sidebar-button ${columnVisibility[colKey] ? 'active' : ''}`}
                            style={{ background: columnVisibility[colKey] ? '' : 'red' }}
                        >
                            {columnVisibility[colKey] ? 'Hide' : 'Show'} {name}
                        </button>
                    </div>
                )
            })}

        </div>
    );
}

export default ViewSidebar;
