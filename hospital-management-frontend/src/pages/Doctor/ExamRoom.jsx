import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast/Toast';
import { useToast } from '../../hooks/useToast';
import RefractionForm from '../../components/RefractionForm/RefractionForm';
import './ExamRoom.css';

const ExamRoom = () => {
  const { toasts, success, error } = useToast();
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [showRefractionForm, setShowRefractionForm] = useState(false);
  const [examData, setExamData] = useState({});

  const [vitals, setVitals] = useState({
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygen_saturation: ''
  });

  const [consultation, setConsultation] = useState({
    symptoms: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    amount: 50,
    payment_method: 'cash'
  });

  useEffect(() => {
    fetchPatientDetails();
    fetchDoctorInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/patient-details/${patientId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setPatient(data);
    } catch (err) {
      console.error('Error fetching patient details:', err);
    }
  };

  const fetchDoctorInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctor/doctor-info', {
        credentials: 'include'
      });
      const data = await response.json();
      setDoctor(data);
    } catch (err) {
      console.error('Error fetching doctor info:', err);
    }
  };

  const recordVitals = async () => {
    try {
      await fetch(`http://localhost:5000/api/vitals/record/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(vitals)
      });
      success('Vitals recorded successfully');
      setVitals({
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        weight: '',
        height: '',
        oxygen_saturation: ''
      });
    } catch (err) {
      console.error('Error recording vitals:', err);
      error('Error recording vitals');
    }
  };

  const saveConsultation = async () => {
    if (!consultation.diagnosis.trim()) {
      error('Please enter a diagnosis');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/doctor/save-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...consultation,
          patient_id: parseInt(patientId, 10),
          exam_data: JSON.stringify(examData),
          amount: parseFloat(consultation.amount) || 50,
          symptoms: consultation.symptoms || 'Not specified'
        })
      });

      const result = await response.json();
      if (result.success) {
        success('Consultation saved and sent to billing successfully');
        setTimeout(() => navigate('/doctor/dashboard'), 1500);
      } else {
        error(result.message || 'Error saving consultation');
      }
    } catch (err) {
      console.error('Error saving consultation:', err);
      error('Error saving consultation');
    }
  };

  const renderDepartmentSpecificForm = () => {
    if (!doctor) return null;

    switch (doctor.department) {
      case 'eye':
        return renderEyeForm();
      case 'ent':
        return renderENTForm();
      case 'skin':
        return renderSkinForm();
      default:
        return null;
    }
  };

  const renderEyeForm = () => (
    <div className="eye-exam-form">
      <div className="eye-section">
        <h4>👁 Right Eye (OD)</h4>
        <input placeholder="Visual Acuity" value={examData.od_visual_acuity || ''} onChange={(e) => setExamData({ ...examData, od_visual_acuity: e.target.value })} />
        <input placeholder="Cornea" value={examData.od_cornea || ''} onChange={(e) => setExamData({ ...examData, od_cornea: e.target.value })} />
        <input placeholder="Lens" value={examData.od_lens || ''} onChange={(e) => setExamData({ ...examData, od_lens: e.target.value })} />
        <input placeholder="Retina" value={examData.od_retina || ''} onChange={(e) => setExamData({ ...examData, od_retina: e.target.value })} />
        <input placeholder="Intraocular Pressure" value={examData.od_pressure || ''} onChange={(e) => setExamData({ ...examData, od_pressure: e.target.value })} />
      </div>

      <div className="eye-section">
        <h4>👁 Left Eye (OS)</h4>
        <input placeholder="Visual Acuity" value={examData.os_visual_acuity || ''} onChange={(e) => setExamData({ ...examData, os_visual_acuity: e.target.value })} />
        <input placeholder="Cornea" value={examData.os_cornea || ''} onChange={(e) => setExamData({ ...examData, os_cornea: e.target.value })} />
        <input placeholder="Lens" value={examData.os_lens || ''} onChange={(e) => setExamData({ ...examData, os_lens: e.target.value })} />
        <input placeholder="Retina" value={examData.os_retina || ''} onChange={(e) => setExamData({ ...examData, os_retina: e.target.value })} />
        <input placeholder="Intraocular Pressure" value={examData.os_pressure || ''} onChange={(e) => setExamData({ ...examData, os_pressure: e.target.value })} />
      </div>

      <div className="refraction-test">
        <button
          type="button"
          className={`refraction-btn ${examData.refraction ? 'completed' : ''}`}
          onClick={() => setShowRefractionForm(true)}
        >
          {examData.refraction ? '✅ Refraction Test Completed' : '➕ Add Refraction Test'}
        </button>
      </div>

      {showRefractionForm && (
        <RefractionForm
          onClose={() => setShowRefractionForm(false)}
          onSave={(refractionData) => {
            setExamData({ ...examData, refraction: refractionData });
            setShowRefractionForm(false);
          }}
          existingData={examData.refraction}
        />
      )}
    </div>
  );

  const renderENTForm = () => (
    <div className="ent-exam-form">
      <div className="eye-sections">
        <div className="eye-section">
          <h4>Right Ear</h4>
          <input type="text" placeholder="External Ear" value={examData.right_external_ear || ''} onChange={(e) => setExamData({ ...examData, right_external_ear: e.target.value })} />
          <input type="text" placeholder="Middle Ear" value={examData.right_middle_ear || ''} onChange={(e) => setExamData({ ...examData, right_middle_ear: e.target.value })} />
          <input type="text" placeholder="Inner Ear" value={examData.right_inner_ear || ''} onChange={(e) => setExamData({ ...examData, right_inner_ear: e.target.value })} />
          <input type="text" placeholder="Tympanic Membrane" value={examData.right_tympanic_membrane || ''} onChange={(e) => setExamData({ ...examData, right_tympanic_membrane: e.target.value })} />
          <input type="text" placeholder="Hearing Test" value={examData.right_hearing_test || ''} onChange={(e) => setExamData({ ...examData, right_hearing_test: e.target.value })} />
        </div>
        <div className="eye-section">
          <h4>Left Ear</h4>
          <input type="text" placeholder="External Ear" value={examData.left_external_ear || ''} onChange={(e) => setExamData({ ...examData, left_external_ear: e.target.value })} />
          <input type="text" placeholder="Middle Ear" value={examData.left_middle_ear || ''} onChange={(e) => setExamData({ ...examData, left_middle_ear: e.target.value })} />
          <input type="text" placeholder="Inner Ear" value={examData.left_inner_ear || ''} onChange={(e) => setExamData({ ...examData, left_inner_ear: e.target.value })} />
          <input type="text" placeholder="Tympanic Membrane" value={examData.left_tympanic_membrane || ''} onChange={(e) => setExamData({ ...examData, left_tympanic_membrane: e.target.value })} />
          <input type="text" placeholder="Hearing Test" value={examData.left_hearing_test || ''} onChange={(e) => setExamData({ ...examData, left_hearing_test: e.target.value })} />
        </div>
      </div>

      <div className="eye-sections">
        <div className="eye-section">
          <h4>Nose Examination</h4>
          <input type="text" placeholder="Rhinoscopy" value={examData.nose_rhinoscopy || ''} onChange={(e) => setExamData({ ...examData, nose_rhinoscopy: e.target.value })} />
          <input type="text" placeholder="Nasal Endoscopy" value={examData.nose_nasal_endoscopy || ''} onChange={(e) => setExamData({ ...examData, nose_nasal_endoscopy: e.target.value })} />
          <input type="text" placeholder="Septum" value={examData.nose_septum || ''} onChange={(e) => setExamData({ ...examData, nose_septum: e.target.value })} />
        </div>

        <div className="eye-section">
          <h4>Throat Examination</h4>
          <input type="text" placeholder="Pharynx" value={examData.throat_pharynx || ''} onChange={(e) => setExamData({ ...examData, throat_pharynx: e.target.value })} />
          <input type="text" placeholder="Laryngoscopy" value={examData.throat_laryngoscopy || ''} onChange={(e) => setExamData({ ...examData, throat_laryngoscopy: e.target.value })} />
          <input type="text" placeholder="Tonsils" value={examData.throat_tonsils || ''} onChange={(e) => setExamData({ ...examData, throat_tonsils: e.target.value })} />
        </div>
      </div>
    </div>
  );

  const renderSkinForm = () => (
    <div className="skin-exam-form">
      <div className="eye-sections">
        <div className="eye-section">
          <h4>Skin Examination</h4>
          <input type="text" placeholder="Affected Area" value={examData.affected_area || ''} onChange={(e) => setExamData({ ...examData, affected_area: e.target.value })} />
          <input type="text" placeholder="Skin Condition" value={examData.skin_condition || ''} onChange={(e) => setExamData({ ...examData, skin_condition: e.target.value })} />
          <input type="text" placeholder="Color Changes" value={examData.color_changes || ''} onChange={(e) => setExamData({ ...examData, color_changes: e.target.value })} />
          <input type="text" placeholder="Texture" value={examData.texture || ''} onChange={(e) => setExamData({ ...examData, texture: e.target.value })} />
          <input type="text" placeholder="Size/Dimensions" value={examData.size_dimensions || ''} onChange={(e) => setExamData({ ...examData, size_dimensions: e.target.value })} />
          <input type="text" placeholder="Pain Level" value={examData.pain_level || ''} onChange={(e) => setExamData({ ...examData, pain_level: e.target.value })} />
          <input type="text" placeholder="Itching" value={examData.itching || ''} onChange={(e) => setExamData({ ...examData, itching: e.target.value })} />
          <input type="text" placeholder="Duration" value={examData.duration || ''} onChange={(e) => setExamData({ ...examData, duration: e.target.value })} />
        </div>
      </div>
    </div>
  );

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="exam-room">
      <div className="exam-header">
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>Examination - {patient.name}</h2>
      </div>

      <div className="exam-sections">
        <div className="vitals-section">
          <h3>Record Vitals</h3>
          <div className="vitals-form">
            {Object.keys(vitals).map((key) => {
              const isBloodPressure = key === 'blood_pressure';
              const inputType = isBloodPressure ? 'text' : 'number';
              const placeholder = key
                .split('_')
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(' ');
              const commonProps = {
                placeholder,
                value: vitals[key],
                onChange: (e) => setVitals({ ...vitals, [key]: e.target.value })
              };
              if (inputType === 'number') {
                // provide sensible numeric attributes
                const numericProps = {
                  type: 'number',
                  step: key === 'temperature' ? '0.1' : '1',
                  min: key === 'oxygen_saturation' ? 0 : 0
                };
                return <input key={key} {...commonProps} {...numericProps} />;
              }
              return <input key={key} {...commonProps} type="text" />;
            })}
            <button type="button" onClick={recordVitals}>Record Vitals</button>
          </div>
        </div>

        <div className="consultation-section">
          <h3>Consultation</h3>
          {renderDepartmentSpecificForm()}
          <div className="general-section">
            <h4>General</h4>
            <textarea placeholder="Symptoms (Chief Complaint)" value={consultation.symptoms} onChange={(e) => setConsultation({ ...consultation, symptoms: e.target.value })} />
            <textarea placeholder="Diagnosis" value={consultation.diagnosis} onChange={(e) => setConsultation({ ...consultation, diagnosis: e.target.value })} />
            <textarea placeholder="Prescription (medicines + dosage)" value={consultation.prescription} onChange={(e) => setConsultation({ ...consultation, prescription: e.target.value })} />
            <textarea placeholder="Notes / Recommendations" value={consultation.notes} onChange={(e) => setConsultation({ ...consultation, notes: e.target.value })} />

            <div className="billing-section">
              <h4> Billing</h4>
              <input type="number" placeholder="Consultation Fee" value={consultation.amount || ''} onChange={(e) => setConsultation({ ...consultation, amount: e.target.value })} />
              <select value={consultation.payment_method || 'cash'} onChange={(e) => setConsultation({ ...consultation, payment_method: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
              </select>
            </div>

            <button type="button" onClick={saveConsultation}>Save Consultation &amp; Send to Billing</button>
          </div>
        </div>
      </div>

      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} duration={t.duration} onClose={() => {}} />
      ))}
    </div>
  );
};

export default ExamRoom;
