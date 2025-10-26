import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import DateFilter from '../../components/DateFilter/DateFilter';
import './Dashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myPatientsToday: 0,
    upcomingAppointments: 0,
    walkinQueue: 0,
    consultationsCompleted: 0
  });

  const [nextPatient, setNextPatient] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);
  const [consultationData, setConsultationData] = useState([
    { day: 'Mon', consultations: 0 },
    { day: 'Tue', consultations: 0 },
    { day: 'Wed', consultations: 0 },
    { day: 'Thu', consultations: 0 },
    { day: 'Fri', consultations: 0 },
    { day: 'Sat', consultations: 0 },
    { day: 'Sun', consultations: 0 }
  ]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    range: 'today'
  });

  const fetchDashboardData = useCallback(async (startDate = dateRange.startDate, endDate = dateRange.endDate) => {
    try {
      const url = `http://localhost:5000/api/doctor/dashboard?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Dashboard API error:', response.status);
        return;
      }

      const data = await response.json();

      setStats({
        myPatientsToday: data.totalPatients || 0,
        upcomingAppointments: data.todayAppointments || 0,
        walkinQueue: data.queueLength || 0,
        consultationsCompleted: data.completedConsultations || 0
      });

      if (data.consultationData && data.consultationData.length > 0) {
        setConsultationData(data.consultationData);
      }

      // Fetch queue for next patient
      const queueResponse = await fetch('http://localhost:5000/api/doctor/queue', {
        credentials: 'include'
      });
      const queueData = await queueResponse.json();

      if (queueData.length > 0) {
        setNextPatient({
          name: queueData[0].patient_name,
          condition: 'Waiting in queue'
        });
      } else {
        setNextPatient(null);
      }

      // Fetch patients data
      const patientsResponse = await fetch('http://localhost:5000/api/doctor/my-patients', {
        credentials: 'include'
      });
      const patientsData = await patientsResponse.json();

      setRecentPatients(patientsData.slice(0, 2).map(p => ({
        name: p.name,
        lastVisit: p.last_visit ? new Date(p.last_visit).toLocaleDateString() : 'No visits',
        status: 'Active'
      })));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set some default values for testing
      setStats({
        myPatientsToday: 0,
        upcomingAppointments: 0,
        walkinQueue: 0,
        consultationsCompleted: 0
      });
    }
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (newDateRange) => {
    setDateRange(newDateRange);
    fetchDashboardData(newDateRange.startDate, newDateRange.endDate);
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <div className="header-icon">👤</div>
        <div className="header-content">
          <h1>Doctor Dashboard</h1>
          <p>{`Good morning, Dr. ${user?.name || 'Doctor'}. Here's your overview.`}</p>
        </div>
      </div>

      <DateFilter onDateChange={handleDateChange} selectedRange={dateRange.range} />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.myPatientsToday}</div>
            <div className="stat-label">My patients (today)</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.upcomingAppointments}</div>
            <div className="stat-label">Upcoming appointments</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.walkinQueue}</div>
            <div className="stat-label">Walk in queue</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.consultationsCompleted}</div>
            <div className="stat-label">Consultations complete</div>
          </div>
        </div>
      </div>

      <div className="next-patient-section">
        <div className="next-patient-card">
          <h3>Next Appointment / Queue</h3>
          {nextPatient ? (
            <div>
              <div className="patient-name">{nextPatient.name}</div>
              <div className="patient-condition">{nextPatient.condition}</div>
            </div>
          ) : (
            <div className="no-data">
              <p>No upcoming appointments</p>
            </div>
          )}
        </div>
      </div>

      <div className="recent-patients-section">
        <div className="recent-patients-card">
          <h3>Recent Patients</h3>
          <div className="patients-header">
            <span>Patient</span>
            <span>Last visit</span>
            <span>Status</span>
          </div>
          {recentPatients.length === 0 ? (
            <div className="no-data">
              <p>No recent patients</p>
            </div>
          ) : (
            recentPatients.map((patient, index) => (
              <div key={index} className="patient-row">
                <span className="patient-name">{patient.name}</span>
                <span className="last-visit">{patient.lastVisit}</span>
                <span className="visit-status">{patient.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="consultation-chart-section">
        <div className="chart-card">
          <h3>Consultation Summary</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={consultationData}>
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
                dataKey="consultations" 
                stroke="#64ffda" 
                strokeWidth={2} 
                dot={{ fill: '#64ffda', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#64ffda' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;