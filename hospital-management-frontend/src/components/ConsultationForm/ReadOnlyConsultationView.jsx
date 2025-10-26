import React, { useState, useEffect, useCallback } from 'react';
import { vitalsAPI } from '../../api/endpoints';

const ReadOnlyConsultationView = ({ consultation, onClose, currentUser }) => {
  const [vitals, setVitals] = useState(null);

  const fetchVitals = useCallback(async () => {
    try {
      if (consultation.patient_id) {
        const response = await vitalsAPI.getLatestVitals(consultation.patient_id);
        setVitals(response.data.vitals);
      }
    } catch (error) {
      console.error('Error fetching vitals:', error);
    }
  }, [consultation.patient_id]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  const getExamData = () => {
    try {
      if (consultation.tests) {
        const parsed = JSON.parse(consultation.tests);
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing exam data:', error);
    }
    return null;
  };

  const examData = getExamData();
  const examType = examData?.od_visual_acuity ? 'eye' : examData?.right_external_ear ? 'ent' : examData?.affected_area ? 'skin' : 'unknown';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--theme-modal-backdrop, rgba(0, 0, 0, 0.8))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #2a2d47',
          background: '#2a2d47',
          borderRadius: '12px 12px 0 0'
        }}>
          <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>
            {examType === 'eye' ? '👁 Eye' : examType === 'ent' ? '👂 ENT' : examType === 'skin' ? '🩺 Skin' : '🏥 General'} Examination - {new Date(consultation.created_at + 'Z').toLocaleDateString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}
          </h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Delete button removed from history view */}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#ffa057',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Vital Signs Section */}
          {vitals && (
            <div style={{
              background: '#2a2d47',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              border: '1px solid #3a3d5a'
            }}>
              <h4 style={{ color: '#ffa057', margin: '0 0 12px 0' }}>Vital Signs</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Blood Pressure</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{vitals.blood_pressure} mmHg</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Heart Rate</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{vitals.heart_rate} bpm</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Temperature</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{vitals.temperature}°C</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Weight</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{vitals.weight} kg</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Height</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{vitals.height} cm</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Oxygen Saturation</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{vitals.oxygen_saturation}%</div></div>
              </div>
            </div>
          )}

          {/* --- EYE EXAM SECTION --- */}
          {examType === 'eye' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Right Eye */}
                <div style={{ background: '#2a2d47', borderRadius: '8px', padding: '16px', border: '1px solid #3a3d5a' }}>
                  <h4 style={{ color: '#ffa057', margin: '0 0 12px 0' }}>Right Eye (OD)</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Visual Acuity</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.od_visual_acuity || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Cornea</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.od_cornea || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Lens</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.od_lens || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Retina</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.od_retina || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Intraocular Pressure</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.od_pressure || 'Not recorded'}</div></div>
                  </div>
                </div>

                {/* Left Eye */}
                <div style={{ background: '#2a2d47', borderRadius: '8px', padding: '16px', border: '1px solid #3a3d5a' }}>
                  <h4 style={{ color: '#ffa057', margin: '0 0 12px 0' }}>Left Eye (OS)</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Visual Acuity</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.os_visual_acuity || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Cornea</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.os_cornea || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Lens</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.os_lens || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Retina</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.os_retina || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Intraocular Pressure</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.os_pressure || 'Not recorded'}</div></div>
                  </div>
                </div>
              </div>

              {/* --- REFACTION TEST RESULTS --- */}
              {examData?.refraction && (
                <div style={{ background: '#2a2d47', borderRadius: '8px', padding: '16px', border: '1px solid #3a3d5a', marginBottom: '20px' }}>
                  <h4 style={{ color: '#ffa057', marginBottom: '12px' }}>Refraction Test Results</h4>

                  {/* Eyes */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Right Eye */}
                    <div>
                      <h5 style={{ color: '#ffa057' }}>Right Eye (OD)</h5>
                      {Object.entries(examData.refraction.right || {}).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: '4px' }}>
                          <label style={{ color: '#b8bcc8', fontSize: '12px', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</label>
                          <div style={{ color: '#fff', fontWeight: '600' }}>{value || 'Not recorded'}</div>
                        </div>
                      ))}
                    </div>

                    {/* Left Eye */}
                    <div>
                      <h5 style={{ color: '#ffa057' }}>Left Eye (OS)</h5>
                      {Object.entries(examData.refraction.left || {}).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: '4px' }}>
                          <label style={{ color: '#b8bcc8', fontSize: '12px', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</label>
                          <div style={{ color: '#fff', fontWeight: '600' }}>{value || 'Not recorded'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div style={{ marginTop: '12px' }}>
                    <div><strong style={{ color: '#b8bcc8' }}>Duochrome Result:</strong> <span style={{ color: '#fff' }}>{examData.refraction.duochrome || 'Not recorded'}</span></div>
                    <div><strong style={{ color: '#b8bcc8' }}>Binocular Balance:</strong> <span style={{ color: '#fff' }}>{examData.refraction.binocularBalance || 'Not recorded'}</span></div>
                    <div><strong style={{ color: '#b8bcc8' }}>Near Addition:</strong> <span style={{ color: '#fff' }}>{examData.refraction.nearAddition || 'Not recorded'}</span></div>
                    <div><strong style={{ color: '#b8bcc8' }}>Cycloplegic Agent:</strong> <span style={{ color: '#fff' }}>{examData.refraction.cycloplegicAgent || 'Not recorded'}</span></div>
                    <div><strong style={{ color: '#b8bcc8' }}>Cycloplegic Time:</strong> <span style={{ color: '#fff' }}>{examData.refraction.cycloplegicTime || 'Not recorded'}</span></div>
                    <div><strong style={{ color: '#b8bcc8' }}>Interpupillary Distance:</strong> <span style={{ color: '#fff' }}>{examData.refraction.interpupillaryDistance || 'Not recorded'}</span></div>
                    <div><strong style={{ color: '#b8bcc8' }}>Prescription Type:</strong> <span style={{ color: '#fff' }}>{examData.refraction.prescriptionType || 'Not recorded'}</span></div>
                    <div><strong style={{ color: '#b8bcc8' }}>Remarks:</strong> <span style={{ color: '#fff' }}>{examData.refraction.remarks || 'Not recorded'}</span></div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* --- ENT EXAM SECTION --- */}
          {examType === 'ent' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Right Ear */}
                <div style={{ background: '#2a2d47', borderRadius: '8px', padding: '16px', border: '1px solid #3a3d5a' }}>
                  <h4 style={{ color: '#ffa057', margin: '0 0 12px 0' }}>Right Ear</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>External Ear</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.right_external_ear || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Middle Ear</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.right_middle_ear || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Inner Ear</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.right_inner_ear || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Tympanic Membrane</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.right_tympanic_membrane || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Hearing Test</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.right_hearing_test || 'Not recorded'}</div></div>
                  </div>
                </div>

                {/* Left Ear */}
                <div style={{ background: '#2a2d47', borderRadius: '8px', padding: '16px', border: '1px solid #3a3d5a' }}>
                  <h4 style={{ color: '#ffa057', margin: '0 0 12px 0' }}>Left Ear</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>External Ear</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.left_external_ear || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Middle Ear</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.left_middle_ear || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Inner Ear</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.left_inner_ear || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Tympanic Membrane</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.left_tympanic_membrane || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Hearing Test</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.left_hearing_test || 'Not recorded'}</div></div>
                  </div>
                </div>
              </div>

              {/* Nose and Throat */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Nose */}
                <div style={{ background: '#2a2d47', borderRadius: '8px', padding: '16px', border: '1px solid #3a3d5a' }}>
                  <h4 style={{ color: '#ffa057', margin: '0 0 12px 0' }}>Nose</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Rhinoscopy</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.nose_rhinoscopy || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Nasal Endoscopy</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.nose_nasal_endoscopy || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Septum</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.nose_septum || 'Not recorded'}</div></div>
                  </div>
                </div>

                {/* Throat */}
                <div style={{ background: '#2a2d47', borderRadius: '8px', padding: '16px', border: '1px solid #3a3d5a' }}>
                  <h4 style={{ color: '#ffa057', margin: '0 0 12px 0' }}>Throat</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Pharynx</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.throat_pharynx || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Laryngoscopy</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.throat_laryngoscopy || 'Not recorded'}</div></div>
                    <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Tonsils</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.throat_tonsils || 'Not recorded'}</div></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* --- SKIN EXAM SECTION --- */}
          {examType === 'skin' && (
            <div style={{ background: '#2a2d47', borderRadius: '8px', padding: '16px', border: '1px solid #3a3d5a', marginBottom: '20px' }}>
              <h4 style={{ color: '#ffa057', margin: '0 0 12px 0' }}>Skin Examination</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Affected Area</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.affected_area || 'Not recorded'}</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Skin Condition</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.skin_condition || 'Not recorded'}</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Color Changes</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.color_changes || 'Not recorded'}</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Texture</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.texture || 'Not recorded'}</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Size/Dimensions</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.size_dimensions || 'Not recorded'}</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Pain Level</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.pain_level || 'Not recorded'}</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Itching</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.itching || 'Not recorded'}</div></div>
                <div><label style={{ color: '#b8bcc8', fontSize: '12px' }}>Duration</label><div style={{ color: '#ffffff', fontWeight: '600' }}>{examData?.duration || 'Not recorded'}</div></div>
              </div>
            </div>
          )}

          {/* --- REMAINING SECTIONS UNCHANGED --- */}
          {/* Clinical Findings and Billing remain untouched below */}
          <div style={{
            background: '#2a2d47',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #3a3d5a'
          }}>
            <h4 style={{ color: '#ffa057', margin: '0 0 12px 0' }}>Clinical Findings</h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ color: '#b8bcc8', fontSize: '12px' }}>Symptoms (Chief Complaint)</label>
                <div style={{ color: '#ffffff', fontWeight: '600', padding: '8px', background: '#1e1e2f', borderRadius: '4px' }}>
                  {consultation.symptoms || 'No symptoms recorded'}
                </div>
              </div>
              <div>
                <label style={{ color: '#b8bcc8', fontSize: '12px' }}>Diagnosis</label>
                <div style={{ color: '#ffffff', fontWeight: '600', padding: '8px', background: '#1e1e2f', borderRadius: '4px' }}>
                  {consultation.diagnosis}
                </div>
              </div>
              <div>
                <label style={{ color: '#b8bcc8', fontSize: '12px' }}>Prescription</label>
                <div style={{ color: '#ffffff', fontWeight: '600', padding: '8px', background: '#1e1e2f', borderRadius: '4px' }}>
                  {consultation.prescription || 'No prescription given'}
                </div>
              </div>
              <div>
                <label style={{ color: '#b8bcc8', fontSize: '12px' }}>Clinical Notes</label>
                <div style={{ color: '#ffffff', fontWeight: '600', padding: '8px', background: '#1e1e2f', borderRadius: '4px' }}>
                  {consultation.notes || 'No additional notes'}
                </div>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div style={{
            background: '#2a2d47',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #3a3d5a'
          }}>
            <h4 style={{ color: '#ffa057', margin: '0 0 12px 0' }}>Billing Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ color: '#b8bcc8', fontSize: '12px' }}>Consultation Fee</label>
                <div style={{ color: '#ffffff', fontWeight: '600' }}>KSH {consultation.amount}</div>
              </div>
              <div>
                <label style={{ color: '#b8bcc8', fontSize: '12px' }}>Date & Time</label>
                <div style={{ color: '#ffffff', fontWeight: '600' }}>{new Date(consultation.created_at + 'Z').toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyConsultationView;
