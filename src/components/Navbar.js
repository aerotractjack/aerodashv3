import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import aerotract_navbar_logo from '../assets/aerotract_navbar_logo.png';
import { Navbar as BootstrapNavbar, NavDropdown, Nav } from 'react-bootstrap';
import { createTables, viewTables } from '../config.js'

const Navbar = () => {
    return (
        <BootstrapNavbar bg="dark" variant="dark" expand="lg" fixed="top">
            <Link to="/" className="navbar-brand">
                <img src={aerotract_navbar_logo} alt="Logo" style={{ width: '150px', marginRight: '10px' }} />
            </Link>
            <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
            <BootstrapNavbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <NavDropdown title="Create" id="basic-nav-dropdown">
                        {Object.keys(createTables).map((key) => (
                            <NavDropdown.Item as={NavLink} key={key} to={`/create/${createTables[key]}`}>
                                {key}
                            </NavDropdown.Item>
                        ))}
                    </NavDropdown>
                    <NavDropdown title="View" id="basic-nav-dropdown">
                        {Object.keys(viewTables).map((key) => (
                            <NavDropdown.Item as={NavLink} key={key} to={`/view/${viewTables[key]}`}>
                                {key}
                            </NavDropdown.Item>
                        ))}
                    </NavDropdown>
                </Nav>
            </BootstrapNavbar.Collapse>
        </BootstrapNavbar>
    );
};

export default Navbar;