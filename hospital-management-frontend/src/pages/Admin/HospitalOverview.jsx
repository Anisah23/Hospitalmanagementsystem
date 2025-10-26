import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/endpoints';

const HospitalOverview = () => {
  const [overview, setOverview] = useState({
    departmentStats: [],
    totalStaff: 0,
    totalDoctors: 0,
    totalReceptionists: 0,
    totalPatients: 0,
    totalAppointments: 0
  });

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await adminAPI.getHospitalOverview();
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    }
  };

  return (
    <div className="hospital-overview">
      <h2>Hospital Overview</h2>
      
      <div className="departments-grid">
        <h3>Department Statistics</h3>
        <div className="stats-grid">
          {overview.departmentStats?.map((dept, index) => (
            <div key={index} className="stat-card">
              <h4>{dept.department?.toUpperCase()}</h4>
              <p>Patients: {dept.patientCount}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="stats-summary">
          <p>Total Staff: {overview.totalStaff}</p>
          <p>Total Doctors: {overview.totalDoctors}</p>
          <p>Total Patients: {overview.totalPatients}</p>
          <p>Total Appointments: {overview.totalAppointments}</p>
        </div>
      </div>
    </div>
  );
};

export default HospitalOverview;