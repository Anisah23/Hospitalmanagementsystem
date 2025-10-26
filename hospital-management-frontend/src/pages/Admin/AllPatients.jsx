import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/endpoints';

const AllPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    
    const handleDataChange = () => {
      fetchPatients();
    };
    
    window.addEventListener('dataChanged', handleDataChange);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPatients, 30000);
    
    return () => {
      window.removeEventListener('dataChanged', handleDataChange);
      clearInterval(interval);
    };
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
      const response = await adminAPI.getAllPatients();
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  const handleDeletePatient = async (patientId, patientName) => {
    if (!window.confirm(`Are you sure you want to delete ${patientName}? This will permanently delete all patient records, appointments, and billing information. This action cannot be undone.`)) {
      return;
    }
    
    setDeleting(patientId);
    try {
      await adminAPI.deletePatient(patientId);
      alert('Patient deleted successfully');
      fetchPatients();
      window.dispatchEvent(new Event('dataChanged'));
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="patients-page" style={{margin: '20px', padding: '24px'}}>
      <div className="page-header" style={{marginBottom: '24px'}}>
        <h2 style={{color: '#ffa057', margin: '0 0 8px 0'}}>All Patients</h2>
        <p style={{color: '#a0aec0', margin: '0'}}>View patient details and billing information</p>
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

      <div className="patients-table" style={{background: '#2a2d47', borderRadius: '12px', overflow: 'hidden'}}>
        <div className="table-header" style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1.5fr 1.5fr 1fr', gap: '16px', padding: '16px 20px', background: '#1e1e2f', borderBottom: '1px solid #3a3f5c'}}>
          <span style={{color: '#a0aec0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Name</span>
          <span style={{color: '#a0aec0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Age</span>
          <span style={{color: '#a0aec0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Gender</span>
          <span style={{color: '#a0aec0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Department</span>
          <span style={{color: '#a0aec0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Phone</span>
          <span style={{color: '#a0aec0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Registered</span>
          <span style={{color: '#a0aec0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Actions</span>
        </div>

        <div className="table-body">
          {filteredPatients.map(patient => (
            <div 
              key={patient.id} 
              className="table-row"
              onClick={() => handlePatientClick(patient.id)}
              style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1.5fr 1.5fr 1fr', gap: '16px', padding: '16px 20px', borderBottom: '1px solid #3a3f5c', cursor: 'pointer', transition: 'background 0.2s ease'}} onMouseOver={(e) => e.currentTarget.style.background = '#323659'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span className="patient-name" style={{color: '#ccd6f6', fontWeight: '500'}}>{patient.name}</span>
              <span style={{color: '#ccd6f6'}}>{patient.age}</span>
              <span style={{color: '#ccd6f6'}}>{patient.gender}</span>
              <span className="department" style={{color: '#ffa057'}}>{patient.department}</span>
              <span style={{color: '#64ffda'}}>{patient.phone}</span>
              <span style={{color: '#64ffda'}}>{new Date(patient.created_at).toLocaleDateString()}</span>
              <div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePatient(patient.id, patient.name);
                  }}
                  disabled={deleting === patient.id}
                  style={{
                    background: '#ff4757',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: deleting === patient.id ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {deleting === patient.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllPatients;