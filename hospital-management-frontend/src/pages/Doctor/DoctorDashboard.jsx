import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../../api/endpoints';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    queueLength: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await doctorAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="doctor-dashboard">
      <h2>Doctor Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today's Appointments</h3>
          <p>{stats.todayAppointments}</p>
        </div>
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p>{stats.totalPatients}</p>
        </div>
        <div className="stat-card">
          <h3>Queue Length</h3>
          <p>{stats.queueLength}</p>
        </div>
      </div>
      
      {stats.notifications && stats.notifications.length > 0 && (
        <div className="notifications">
          <h3>Important Notifications</h3>
          <div className="notification-list">
            {stats.notifications.map((notification, index) => (
              <div key={index} className="notification-item">
                <p>{notification}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <button onClick={() => window.location.href = '/doctor/queue'}>View Queue</button>
        <button onClick={() => window.location.href = '/doctor/appointments'}>My Appointments</button>
        <button onClick={() => window.location.href = '/doctor/patients'}>Patient Records</button>
      </div>
    </div>
  );
};

export default DoctorDashboard;