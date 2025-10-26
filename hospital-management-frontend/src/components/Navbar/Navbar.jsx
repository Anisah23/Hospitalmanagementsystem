import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Hospital Management</h2>
      </div>
      <div className="navbar-user">
        <span>Welcome, {user?.name}</span>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;