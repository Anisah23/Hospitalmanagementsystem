import React, { useState, useEffect } from 'react';
import { receptionistAPI } from '../../api/endpoints';
import { useNavigate } from 'react-router-dom';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      const response = await receptionistAPI.getPatients();
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handlePatientClick = (patientId) => {
    navigate(`/receptionist/patient-details/${patientId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="patients-page">
      <div className="page-header">
        <h2>All Patients</h2>
        <p>View patient details and billing information</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, phone, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="patients-table">
        <div className="table-header">
          <span>Name</span>
          <span>Age</span>
          <span>Department</span>
          <span>Phone</span>
          <span>Last Session</span>
          <span>Registered</span>
        </div>

        <div className="table-body">
          {filteredPatients.map(patient => (
            <div 
              key={patient.id} 
              className="table-row"
              onClick={() => handlePatientClick(patient.id)}
            >
              <span className="patient-name">{patient.name}</span>
              <span>{patient.age}</span>
              <span className="department">{patient.department}</span>
              <span>{patient.phone}</span>
              <span className="last-session">{formatDate(patient.last_session)}</span>
              <span>{formatDate(patient.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Patients;