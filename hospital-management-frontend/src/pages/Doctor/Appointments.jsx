import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../../api/endpoints';
import './MyPatients.css';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const filtered = appointments.filter(appointment =>
      appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm]);

  const fetchAppointments = async () => {
    try {
      const response = await doctorAPI.getAppointments();
      setAppointments(response.data);
      setFilteredAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  const startExam = (patientId) => {
    navigate(`/doctor/exam/${patientId}`);
  };

  return (
    <div className="my-patients">
      <h2>My Appointments</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search appointments by patient name or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="patients-grid">
        {filteredAppointments.map(appointment => (
          <div key={appointment.id} className="patient-card" onClick={() => handlePatientClick(appointment.patient_id)} style={{cursor: 'pointer'}}>
            <h3>{appointment.patient_name}</h3>
            <p>Date: {new Date(appointment.appointment_date).toLocaleDateString()}</p>
            <p>Time: {appointment.appointment_time}</p>
            <p>Status: {appointment.status}</p>
            <div className="patient-actions">
              <button onClick={(e) => { e.stopPropagation(); handlePatientClick(appointment.patient_id); }}>View Details</button>
              <button onClick={(e) => { e.stopPropagation(); startExam(appointment.patient_id); }}>Start Exam</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;