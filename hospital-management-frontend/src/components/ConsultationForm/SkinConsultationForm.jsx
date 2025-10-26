import React, { useState } from 'react';
import { doctorAPI } from '../../api/endpoints';
import VitalSignsForm from '../VitalSigns/VitalSignsForm';

const SkinConsultationForm = ({ patientId, onSave }) => {
  const [formData, setFormData] = useState({
    affected_area: '',
    skin_condition: '',
    color_changes: '',
    texture: '',
    size_dimensions: '',
    pain_level: '',
    itching: '',
    duration: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    amount: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const consultationData = {
        patient_id: patientId,
        symptoms: `Affected Area: ${formData.affected_area}, Condition: ${formData.skin_condition}`,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        notes: formData.notes,
        tests: JSON.stringify({
          affected_area: formData.affected_area,
          skin_condition: formData.skin_condition,
          color_changes: formData.color_changes,
          texture: formData.texture,
          size_dimensions: formData.size_dimensions,
          pain_level: formData.pain_level,
          itching: formData.itching,
          duration: formData.duration
        }),
        amount: formData.amount
      };
      
      await doctorAPI.saveConsultation(consultationData);
      onSave && onSave();
    } catch (error) {
      console.error('Failed to save consultation');
    }
  };

  return (
    <div className="consultation-form">
      <h3>🩺 Skin Examination</h3>
      
      <VitalSignsForm patientId={patientId} onSave={() => {}} />
      
      <form onSubmit={handleSubmit}>
        <div className="eye-sections">
          <div className="eye-section">
            <h4>Skin Examination</h4>
            <input type="text" placeholder="Affected Area" value={formData.affected_area} onChange={(e) => setFormData({...formData, affected_area: e.target.value})} />
            <input type="text" placeholder="Skin Condition" value={formData.skin_condition} onChange={(e) => setFormData({...formData, skin_condition: e.target.value})} />
            <input type="text" placeholder="Color Changes" value={formData.color_changes} onChange={(e) => setFormData({...formData, color_changes: e.target.value})} />
            <input type="text" placeholder="Texture" value={formData.texture} onChange={(e) => setFormData({...formData, texture: e.target.value})} />
            <input type="text" placeholder="Size/Dimensions" value={formData.size_dimensions} onChange={(e) => setFormData({...formData, size_dimensions: e.target.value})} />
            <input type="text" placeholder="Pain Level" value={formData.pain_level} onChange={(e) => setFormData({...formData, pain_level: e.target.value})} />
            <input type="text" placeholder="Itching" value={formData.itching} onChange={(e) => setFormData({...formData, itching: e.target.value})} />
            <input type="text" placeholder="Duration" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
          </div>
        </div>
        
        <textarea placeholder="Diagnosis" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} required />
        <textarea placeholder="Prescription" value={formData.prescription} onChange={(e) => setFormData({...formData, prescription: e.target.value})} />
        <textarea placeholder="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
        <input type="number" placeholder="Amount (KSH)" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
        <button type="submit">Save Consultation</button>
      </form>
    </div>
  );
};

export default SkinConsultationForm;