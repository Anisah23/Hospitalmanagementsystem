import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DateFilter from '../../components/DateFilter/DateFilter';
import './Dashboard.css';
import '../Doctor/Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    receptionists: 0,
    totalPatients: 0,
    todayRevenue: 0
  });

  const [patientFlowData, setPatientFlowData] = useState([
    { day: 'Mon', patients: 0 },
    { day: 'Tue', patients: 0 },
    { day: 'Wed', patients: 0 },
    { day: 'Thu', patients: 0 },
    { day: 'Fri', patients: 0 },
    { day: 'Sat', patients: 0 },
    { day: 'Sun', patients: 0 }
  ]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    range: 'today'
  });

  const [recentAppointments, setRecentAppointments] = useState([]);

  const fetchDashboardData = useCallback(async (startDate = dateRange.startDate, endDate = dateRange.endDate) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/dashboard-summary?startDate=${startDate}&endDate=${endDate}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setStats(data.stats);
      if (data.patientFlow && data.patientFlow.length > 0) {
        setPatientFlowData(data.patientFlow);
      }
      setRecentAppointments(data.recentAppointments || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (newDateRange) => {
    setDateRange(newDateRange);
    fetchDashboardData(newDateRange.startDate, newDateRange.endDate);
  };

  useEffect(() => {
    fetchDashboardData();

    const handleDataChange = () => {
      fetchDashboardData();
    };

    window.addEventListener('dataChanged', handleDataChange);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchDashboardData(), 30000);

    return () => {
      window.removeEventListener('dataChanged', handleDataChange);
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, Admin! Here's the latest</p>
      </div>

      <DateFilter onDateChange={handleDateChange} selectedRange={dateRange.range} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDoctors}</div>
            <div className="stat-label">Total Doctors</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.receptionists}</div>
            <div className="stat-label">Receptionists</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalPatients}</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.todayRevenue?.toLocaleString() || 0}</div>
            <div className="stat-label">Revenue (today)</div>
          </div>
        </div>
      </div>

      <div className="consultation-chart-section">
        <div className="chart-card">
          <h3>Patient Flow</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={patientFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d47" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8892b0', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8892b0', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e1e2f', 
                  border: '1px solid #2a2d47', 
                  borderRadius: '8px',
                  color: '#ccd6f6'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="patients" 
                stroke="#64ffda" 
                strokeWidth={2} 
                dot={{ fill: '#64ffda', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#64ffda' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="billing-section">
        <div className="billing-card">
          <h3>Recent Appointments</h3>
          <div className="billing-header">
            <span>Patient</span>
            <span>Doctor</span>
            <span>Date</span>
            <span>Status</span>
          </div>
          {recentAppointments.length === 0 ? (
            <div className="no-data">
              <p>No appointments yet</p>
            </div>
          ) : (
            recentAppointments.map((apt, index) => (
              <div key={apt.id || index} className="billing-row">
                <span className="patient-name">{apt.patient_name}</span>
                <span className="doctor-name">{apt.doctor_name}</span>
                <span className="appointment-date">{new Date(apt.date).toLocaleDateString()}</span>
                <span className={`status-badge ${apt.status === 'completed' ? 'completed' : apt.status === 'cancelled' ? 'cancelled' : 'pending'}`}>
                  {apt.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;