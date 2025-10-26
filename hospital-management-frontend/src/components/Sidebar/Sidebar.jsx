import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
          { path: '/admin/panel', label: 'Admin Panel', icon: '🧑‍⚕️' },
          { path: '/admin/register-doctor', label: 'Register Doctor', icon: '👨‍⚕️' },
          { path: '/admin/register-receptionist', label: 'Register Receptionist', icon: '👩‍💼' },
          { path: '/admin/patients', label: 'All Patients', icon: '👥' },
          { path: '/admin/settings', label: 'System Settings', icon: '⚙️' }
        ];
      case 'receptionist':
        return [
          { path: '/receptionist/dashboard', label: 'Dashboard', icon: '🏠' },
          { path: '/receptionist/register-patient', label: 'Register Patient', icon: '👤' },
          { path: '/receptionist/patients', label: 'All Patients', icon: '👥' },
          { path: '/receptionist/appointments', label: 'Appointments', icon: '📅' },
          { path: '/receptionist/queue', label: 'Queue', icon: '⏳' },
          { path: '/receptionist/billing', label: 'Billing', icon: '💳' }
        ];
      case 'doctor':
        return [
          { path: '/doctor/dashboard', label: 'Dashboard', icon: '🏠' },
          { path: '/doctor/patients', label: 'My Patients', icon: '👥' },
          { path: '/doctor/appointments', label: 'Appointments', icon: '📅' },
          { path: '/doctor/queue', label: 'Queue', icon: '⏳' },
          { path: '/change-password', label: 'Profile', icon: '👤' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Hospital MS</h3>
        <p>{user?.name}</p>
        <span className="role-badge">{user?.role}</span>
      </div>
      
      <nav className="sidebar-nav">
        {getMenuItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;