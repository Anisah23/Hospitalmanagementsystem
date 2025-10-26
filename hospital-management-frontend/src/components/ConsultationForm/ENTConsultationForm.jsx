import React, { useState } from 'react';
import { doctorAPI } from '../../api/endpoints';
import VitalSignsForm from '../VitalSigns/VitalSignsForm';

const ENTConsultationForm = ({ patientId, onSave }) => {
  const [formData, setFormData] = useState({
    right_external_ear: '',
    right_middle_ear: '',
    right_inner_ear: '',
    right_tympanic_membrane: '',
    right_hearing_test: '',
    left_external_ear: '',
    left_middle_ear: '',
    left_inner_ear: '',
    left_tympanic_membrane: '',
    left_hearing_test: '',
    nose_rhinoscopy: '',
    nose_nasal_endoscopy: '',
    nose_septum: '',
    throat_pharynx: '',
    throat_laryngoscopy: '',
    throat_tonsils: '',
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
        symptoms: `Right Ear: ${formData.right_external_ear}, Left Ear: ${formData.left_external_ear}, Nose: ${formData.nose_rhinoscopy}, Throat: ${formData.throat_pharynx}`,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        notes: formData.notes,
        tests: JSON.stringify({
          right_external_ear: formData.right_external_ear,
          right_middle_ear: formData.right_middle_ear,
          right_inner_ear: formData.right_inner_ear,
          right_tympanic_membrane: formData.right_tympanic_membrane,
          right_hearing_test: formData.right_hearing_test,
          left_external_ear: formData.left_external_ear,
          left_middle_ear: formData.left_middle_ear,
          left_inner_ear: formData.left_inner_ear,
          left_tympanic_membrane: formData.left_tympanic_membrane,
          left_hearing_test: formData.left_hearing_test,
          nose_rhinoscopy: formData.nose_rhinoscopy,
          nose_nasal_endoscopy: formData.nose_nasal_endoscopy,
          nose_septum: formData.nose_septum,
          throat_pharynx: formData.throat_pharynx,
          throat_laryngoscopy: formData.throat_laryngoscopy,
          throat_tonsils: formData.throat_tonsils
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
      <h3>👂 ENT Examination</h3>
      
      <VitalSignsForm patientId={patientId} onSave={() => {}} />
      
      <form onSubmit={handleSubmit}>
        <div className="eye-sections">
          <div className="eye-section">
            <h4>Right Ear</h4>
            <input type="text" placeholder="External Ear" value={formData.right_external_ear} onChange={(e) => setFormData({...formData, right_external_ear: e.target.value})} />
            <input type="text" placeholder="Middle Ear" value={formData.right_middle_ear} onChange={(e) => setFormData({...formData, right_middle_ear: e.target.value})} />
            <input type="text" placeholder="Inner Ear" value={formData.right_inner_ear} onChange={(e) => setFormData({...formData, right_inner_ear: e.target.value})} />
            <input type="text" placeholder="Tympanic Membrane" value={formData.right_tympanic_membrane} onChange={(e) => setFormData({...formData, right_tympanic_membrane: e.target.value})} />
            <input type="text" placeholder="Hearing Test" value={formData.right_hearing_test} onChange={(e) => setFormData({...formData, right_hearing_test: e.target.value})} />
          </div>
          <div className="eye-section">
            <h4>Left Ear</h4>
            <input type="text" placeholder="External Ear" value={formData.left_external_ear} onChange={(e) => setFormData({...formData, left_external_ear: e.target.value})} />
            <input type="text" placeholder="Middle Ear" value={formData.left_middle_ear} onChange={(e) => setFormData({...formData, left_middle_ear: e.target.value})} />
            <input type="text" placeholder="Inner Ear" value={formData.left_inner_ear} onChange={(e) => setFormData({...formData, left_inner_ear: e.target.value})} />
            <input type="text" placeholder="Tympanic Membrane" value={formData.left_tympanic_membrane} onChange={(e) => setFormData({...formData, left_tympanic_membrane: e.target.value})} />
            <input type="text" placeholder="Hearing Test" value={formData.left_hearing_test} onChange={(e) => setFormData({...formData, left_hearing_test: e.target.value})} />
          </div>
        </div>

        <div className="eye-sections">
          <div className="eye-section">
            <h4>Nose Examination</h4>
            <input type="text" placeholder="Rhinoscopy" value={formData.nose_rhinoscopy} onChange={(e) => setFormData({...formData, nose_rhinoscopy: e.target.value})} />
            <input type="text" placeholder="Nasal Endoscopy" value={formData.nose_nasal_endoscopy} onChange={(e) => setFormData({...formData, nose_nasal_endoscopy: e.target.value})} />
            <input type="text" placeholder="Septum" value={formData.nose_septum} onChange={(e) => setFormData({...formData, nose_septum: e.target.value})} />
          </div>

          <div className="eye-section">
            <h4>Throat Examination</h4>
            <input type="text" placeholder="Pharynx" value={formData.throat_pharynx} onChange={(e) => setFormData({...formData, throat_pharynx: e.target.value})} />
            <input type="text" placeholder="Laryngoscopy" value={formData.throat_laryngoscopy} onChange={(e) => setFormData({...formData, throat_laryngoscopy: e.target.value})} />
            <input type="text" placeholder="Tonsils" value={formData.throat_tonsils} onChange={(e) => setFormData({...formData, throat_tonsils: e.target.value})} />
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

export default ENTConsultationForm;