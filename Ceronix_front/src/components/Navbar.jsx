import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#home" className="navbar-logo">
          DeCoders
        </a>
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="#home" className="nav-links">Home</a>
          </li>
          <li className="nav-item">
            <a href="#detector" className="nav-links">Detector</a>
          </li>
          <li className="nav-item">
            <a href="#team" className="nav-links">Team</a>
          </li>
        </ul>
       
      </div>
    </nav>
  );
};

export default Navbar;
