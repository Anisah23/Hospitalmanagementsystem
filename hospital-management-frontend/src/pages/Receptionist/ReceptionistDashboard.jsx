import React, { useState, useEffect } from 'react';
import { receptionistAPI } from '../../api/endpoints';

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingBills: 0,
    queueLength: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await receptionistAPI.getDashboard();
      setStats({
        todayAppointments: response.data.today_patients || 0,
        pendingBills: response.data.pending_bills || 0,
        queueLength: response.data.queue_length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="receptionist-dashboard">
      <h2>Receptionist Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today's Appointments</h3>
          <p>{stats.todayAppointments}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Bills</h3>
          <p>{stats.pendingBills}</p>
        </div>
        <div className="stat-card">
          <h3>Queue Length</h3>
          <p>{stats.queueLength}</p>
        </div>
      </div>
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <button onClick={() => window.location.href = '/receptionist/register-patient'}>Register New Patient</button>
        <button onClick={() => window.location.href = '/receptionist/appointments'}>Schedule Appointment</button>
        <button onClick={() => window.location.href = '/receptionist/billing'}>Process Billing</button>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;