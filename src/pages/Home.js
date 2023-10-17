import { React, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.js';
// import { Card } from 'react-bootstrap';
import { createTables, viewTables } from '../config.js'

function Home() {

    useEffect(() => {
        document.body.classList.add('no-padding');

        return () => {
            document.body.classList.remove('no-padding');
        };
    }, []);

    return (
        <>
        <Navbar createTables={createTables} viewTables={viewTables}/>

        <div className="home-container"> 
            <div className="home-table-container">
                <div className="create-column">
                    {Object.keys(createTables).map((key) => (
                        <Link
                            key={key}
                            to={`/create/${createTables[key]}`}
                            className="button"
                        >
                            {key}
                        </Link>
                    ))}
                </div>
                <div className="view-column">
                    {Object.keys(viewTables).map((key) => (
                        <Link
                            key={key}
                            to={`/view/${viewTables[key]}`}
                            className="button"
                        >
                            {key}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
        </>
    );
}

export default Home;
