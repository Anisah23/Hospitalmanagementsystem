import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../../api/endpoints';
import './MyPatients.css';

const MyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    
    const handleDataChange = () => {
      fetchPatients();
    };
    
    window.addEventListener('dataChanged', handleDataChange);
    
    const interval = setInterval(fetchPatients, 30000);
    
    return () => {
      window.removeEventListener('dataChanged', handleDataChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      const response = await doctorAPI.getMyPatients();
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  // const startExam = (patientId) => {
  //   navigate(`/doctor/exam/${patientId}`);
  // };

  return (
    <div className="patients-page" style={{margin: '20px', padding: '24px'}}>
      <div className="page-header" style={{marginBottom: '24px'}}>
        <h2 style={{color: '#64ffda', margin: '0 0 8px 0'}}>My Patients</h2>
        <p style={{color: '#a0aec0', margin: '0'}}>View patient details and medical history</p>
      </div>

      <div className="search-bar" style={{marginBottom: '24px'}}>
        <input
          type="text"
          placeholder="Search by name, phone, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{width: '100%', maxWidth: '400px', padding: '12px', borderRadius: '8px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
        />
      </div>

      <div style={{background: '#2a2d47', borderRadius: '12px', overflow: 'hidden', border: '1px solid #3a3f5c'}}>
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1.5fr', gap: '16px', padding: '16px 20px', background: '#1e1e2f', borderBottom: '1px solid #3a3f5c'}}>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Name</span>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Age</span>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Gender</span>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Phone</span>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Last Visit</span>
        </div>

        <div>
          {filteredPatients.map(patient => (
            <div 
              key={patient.id}
              onClick={() => handlePatientClick(patient.id)}
              style={{
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1.5fr', 
                gap: '16px', 
                padding: '20px', 
                borderBottom: '1px solid #3a3f5c', 
                cursor: 'pointer', 
                transition: 'all 0.2s ease',
                minHeight: '60px',
                alignItems: 'center'
              }} 
              onMouseEnter={(e) => e.currentTarget.style.background = '#323659'} 
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{color: '#ffffff', fontWeight: '600', fontSize: '16px'}}>{patient.name}</span>
              <span style={{color: '#ffffff', fontSize: '14px'}}>{patient.age}</span>
              <span style={{color: '#ffffff', fontSize: '14px'}}>{patient.gender}</span>
              <span style={{color: '#64ffda', fontSize: '14px'}}>{patient.phone}</span>
              <span style={{color: '#ffa057', fontSize: '14px'}}>{patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'No visits'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPatients;