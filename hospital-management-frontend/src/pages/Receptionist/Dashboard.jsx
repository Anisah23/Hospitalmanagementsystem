import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patientsRegistered: 0,
    totalAppointments: 0,
    pendingQueue: 0
  });

  const [todayQueue, setTodayQueue] = useState([]);
  const [billingSummary, setBillingSummary] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    const handleDataChange = () => {
      fetchDashboardData();
    };
    
    window.addEventListener('dataChanged', handleDataChange);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => {
      window.removeEventListener('dataChanged', handleDataChange);
      clearInterval(interval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/receptionist/dashboard-summary', {
        credentials: 'include'
      });
      const data = await response.json();
      setStats(data.stats);
      
      // Fetch today's queue
      const queueResponse = await fetch('http://localhost:5000/api/receptionist/queue', {
        credentials: 'include'
      });
      const queueData = await queueResponse.json();
      setTodayQueue(queueData.slice(0, 5).map(q => ({
        department: q.department || 'N/A',
        patient: q.patient_name,
        status: q.status
      })));
      
      setBillingSummary(data.billingSummary || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="receptionist-dashboard">
      <div className="dashboard-header">
        <div className="header-icon">👤</div>
        <div className="header-content">
          <h1>Receptionist</h1>
          <p>Welcome back, {user?.name}! Here's what's happening</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.patientsRegistered}</div>
            <div className="stat-label">Patients Registered</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalAppointments}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingQueue}</div>
            <div className="stat-label">Pending Queue</div>
          </div>
        </div>
      </div>

      <div className="queue-section">
        <div className="queue-card">
          <h3>Today's Queue</h3>
          <div className="queue-header">
            <span>Department</span>
            <span>Patient</span>
            <span>Status</span>
          </div>
          {todayQueue.length === 0 ? (
            <div className="no-data">
              <p>No patients in queue</p>
            </div>
          ) : (
            todayQueue.map((item, index) => (
              <div key={index} className="queue-row">
                <span className="queue-department">{item.department}</span>
                <span className="queue-patient">{item.patient}</span>
                <div className="queue-status">
                  <div className="status-bar orange"></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="billing-section">
        <div className="billing-card">
          <h3>Billing Summary</h3>
          <div className="billing-header">
            <span>Patient Name</span>
            <span>Department</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {billingSummary.length === 0 ? (
            <div className="no-data">
              <p>No billing records yet</p>
            </div>
          ) : (
            billingSummary.map((bill, index) => (
              <div key={index} className="billing-row">
                <span className="patient-name">{bill.patient}</span>
                <span className="department-name">{bill.department}</span>
                <span className="amount">KSH {bill.amount.toLocaleString()}</span>
                <span className={`status-badge ${bill.status === 'paid' ? 'paid' : 'pending'}`}>{bill.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;