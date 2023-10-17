import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import CreateData from '../pages/CreateData';
import ViewData from '../pages/ViewData';
import '../styles/App.css';

export const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create/:table" element={<CreateData key={Math.random()} />} />
                <Route path="view/:table" element={<ViewData />} />
            </Routes>
        </Router>
    );
};
