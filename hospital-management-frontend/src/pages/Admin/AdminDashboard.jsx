import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/endpoints';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_patients: 0,
    total_appointments: 0,
    total_doctors: 0,
    pending_bills: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>System Overview and Management</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.total_patients}</h3>
            <p>Total Patients</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.total_appointments}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👨⚕️</div>
          <div className="stat-content">
            <h3>{stats.total_doctors}</h3>
            <p>Total Doctors</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats.pending_bills}</h3>
            <p>Pending Bills</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <div className="action-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => window.location.href = '/admin/register-doctor'}>Register New Doctor</button>
            <button className="action-btn" onClick={() => window.location.href = '/admin/register-receptionist'}>Register Receptionist</button>
            <button className="action-btn" onClick={() => window.location.href = '/admin/patients'}>View All Patients</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;