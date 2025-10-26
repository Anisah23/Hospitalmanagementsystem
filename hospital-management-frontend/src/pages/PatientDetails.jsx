import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReadOnlyConsultationView from '../components/ConsultationForm/ReadOnlyConsultationView';
import './PatientDetails.css';

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [viewingConsultation, setViewingConsultation] = useState(null);

  const fetchPatientDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/${user.role}/patient-details/${patientId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  }, [user.role, patientId]);

  const fetchPatientHistory = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/patient-history/${patientId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setHistory(data.consultations || []);
    } catch (error) {
      console.error('Error fetching patient history:', error);
      setHistory([]);
    }
  }, [patientId]);

  const fetchLatestVitals = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/vitals/latest/${patientId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setVitals(data.vitals);
      }
    } catch (error) {
      console.error('Error fetching vitals:', error);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatientDetails();
    if (user.role === 'doctor' || user.role === 'admin') {
      fetchPatientHistory();
      fetchLatestVitals();
    }
  }, [user.role, fetchPatientDetails, fetchPatientHistory, fetchLatestVitals]);

  // Refresh vitals every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user.role === 'doctor' || user.role === 'admin') {
        fetchLatestVitals();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user.role, fetchLatestVitals]);

  const startExam = () => {
    navigate(`/doctor/exam/${patientId}`);
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="patient-details">
      <div className="patient-header">
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>{patient.name}</h2>
        {user.role === 'doctor' && (
          <button onClick={startExam} className="start-exam-btn">Start Examination</button>
        )}
      </div>

      <div className="tabs">
        <button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>
          Details
        </button>
        {(user.role === 'doctor' || user.role === 'admin') && (
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
            History/Findings
          </button>
        )}
        {(user.role === 'receptionist' || user.role === 'admin') && (
          <button className={activeTab === 'billing' ? 'active' : ''} onClick={() => setActiveTab('billing')}>
            Billing
          </button>
        )}
      </div>

      {activeTab === 'details' && (
        <div className="patient-info">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '20px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'var(--accent-orange)', margin: '0 0 15px 0', fontSize: '18px' }}>Patient Information</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Age:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{patient.age} years</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Gender:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{patient.gender}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{patient.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Department:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{patient.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Address:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600', textAlign: 'right' }}>{patient.address}</span>
                </div>
              </div>
            </div>

            {vitals && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '20px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ color: 'var(--accent-orange)', margin: '0 0 15px 0', fontSize: '18px' }}>Latest Vitals</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Blood Pressure:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vitals.blood_pressure} mmHg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Heart Rate:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vitals.heart_rate} bpm</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Temperature:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vitals.temperature}°C</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Weight:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vitals.weight} kg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Height:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vitals.height} cm</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Oxygen Saturation:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vitals.oxygen_saturation}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Recorded by:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vitals.recorded_by}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600', textAlign: 'right' }}>{new Date(vitals.created_at + 'Z').toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="patient-history">
          <h3>Medical History</h3>
          {Array.isArray(history) && history.length > 0 ? history.map((record, index) => (
            <div 
              key={index} 
              className="history-record clickable"
              onClick={() => setViewingConsultation(record)}
              style={{cursor: 'pointer'}}
            >
              <p><strong>Date:</strong> {new Date(record.created_at + 'Z').toLocaleDateString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}</p>
              <p><strong>Doctor:</strong> {record.doctor_name}</p>
              <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
              <p><strong>Prescription:</strong> {record.prescription}</p>
              <p style={{color: '#ffa057', fontSize: '12px', marginTop: '8px'}}>📋 Click to view detailed exam</p>
            </div>
          )) : <p>No medical history available</p>}
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="patient-billing">
          <h3>Billing Information</h3>
          {patient.bills?.map((bill, index) => (
            <div key={index} className="bill-record">
              <p><strong>Amount:</strong> ${bill.amount}</p>
              <p><strong>Status:</strong> {bill.status}</p>
              <p><strong>Date:</strong> {new Date(bill.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
      {viewingConsultation && (
        <ReadOnlyConsultationView 
          consultation={viewingConsultation}
          onClose={() => setViewingConsultation(null)}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default PatientDetails;