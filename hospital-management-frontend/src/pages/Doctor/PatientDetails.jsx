import React, { useState, useEffect, useCallback } from 'react';
import { doctorAPI, vitalsAPI } from '../../api/endpoints';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EyeConsultationForm from '../../components/ConsultationForm/EyeConsultationForm';
import ENTConsultationForm from '../../components/ConsultationForm/ENTConsultationForm';
import SkinConsultationForm from '../../components/ConsultationForm/SkinConsultationForm';
import ReadOnlyConsultationView from '../../components/ConsultationForm/ReadOnlyConsultationView';

const PatientDetails = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewingConsultation, setViewingConsultation] = useState(null);

  const getConsultationForm = () => {
    switch(user?.department) {
      case 'eye': return EyeConsultationForm;
      case 'ent': return ENTConsultationForm;
      case 'skin': return SkinConsultationForm;
      default: return EyeConsultationForm;
    }
  };

  const ConsultationForm = getConsultationForm();

  const fetchPatientDetails = useCallback(async () => {
    try {
      const response = await doctorAPI.getPatientHistory(patientId);
      setPatient(response.data.patient);
      setConsultations(response.data.consultations);
      
      const vitalsResponse = await vitalsAPI.getPatientVitals(patientId);
      console.log('Vitals response:', vitalsResponse.data);
      setVitals(vitalsResponse.data);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatientDetails();
  }, [fetchPatientDetails]);

  if (!patient) return <div className="loading">Loading patient details...</div>;

  return (
    <div style={{
      background: '#1e1e2f',
      minHeight: '100vh',
      padding: '20px',
      color: '#ffffff'
    }}>
      <div style={{
        background: '#2a2d47',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        border: '1px solid #3a3d5a'
      }}>
        <h2 style={{color: '#ffa057', marginBottom: '16px'}}>{patient.name}</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
          <p><strong>Age:</strong> {patient.age}</p>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Phone:</strong> {patient.phone}</p>
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Address:</strong> {patient.address}</p>
        </div>
      </div>

      <div style={{
        background: '#2a2d47',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        border: '1px solid #3a3d5a'
      }}>
        <h3 style={{color: '#ffa057', marginBottom: '16px'}}>Vital Signs History</h3>
        <div style={{display: 'grid', gap: '12px'}}>
          {vitals.map(vital => (
            <div key={vital.id} style={{
              background: '#1e1e2f',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #3a3d5a'
            }}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px'}}>
                <p><strong>Date:</strong> {vital.created_at}</p>
                <p><strong>BP:</strong> {vital.blood_pressure} mmHg</p>
                <p><strong>Heart Rate:</strong> {vital.heart_rate} bpm</p>
                <p><strong>Temperature:</strong> {vital.temperature}°C</p>
                <p><strong>Weight:</strong> {vital.weight} kg</p>
                <p><strong>Height:</strong> {vital.height} cm</p>
                <p><strong>O2 Sat:</strong> {vital.oxygen_saturation}%</p>
                <p><strong>Recorded by:</strong> {vital.recorded_by}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: '#2a2d47',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #3a3d5a'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h3 style={{color: '#ffa057', margin: 0}}>Consultations</h3>
          <button 
            onClick={() => setShowForm(true)}
            style={{
              background: '#ffa057',
              color: '#1e1e2f',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            New Consultation
          </button>
        </div>

        {showForm && (
          <ConsultationForm 
            patientId={patientId} 
            onSave={() => {
              setShowForm(false);
              fetchPatientDetails();
            }}
          />
        )}

        <div className="consultations-list">
          {consultations.map(consultation => (
            <div key={consultation.id} className="consultation-card">
              <p><strong>Date:</strong> {consultation.created_at}</p>
              <p><strong>Symptoms:</strong> {consultation.symptoms}</p>
              <p><strong>Diagnosis:</strong> {consultation.diagnosis}</p>
              <p><strong>Prescription:</strong> {consultation.prescription}</p>
              <p><strong>Notes:</strong> {consultation.notes}</p>
              <p><strong>Amount:</strong> KSH {consultation.amount}</p>
            </div>
          ))}
        </div>
        
        {viewingConsultation && (
          <ReadOnlyConsultationView 
            consultation={viewingConsultation}
            onClose={() => setViewingConsultation(null)}
          />
        )}
      </div>
    </div>
  );
};

export default PatientDetails;