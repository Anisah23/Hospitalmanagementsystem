import React, { useState, useEffect } from 'react';
import { receptionistAPI } from '../../api/endpoints';
import { showToast } from '../../components/Toast/Toast';

const Queue = () => {
  const [queue, setQueue] = useState([]);
  const [patientNames, setPatientNames] = useState([]);
  const [doctorNames, setDoctorNames] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    department: ''
  });

  useEffect(() => {
    fetchQueue();
    fetchNames();
    
    const handleDataChange = () => {
      fetchQueue();
    };
    
    window.addEventListener('dataChanged', handleDataChange);
    
    // Auto-refresh every 10 seconds for queue
    const interval = setInterval(fetchQueue, 10000);
    
    return () => {
      window.removeEventListener('dataChanged', handleDataChange);
      clearInterval(interval);
    };
  }, []);

  const fetchNames = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        receptionistAPI.getPatientNames(),
        receptionistAPI.getDoctorNames()
      ]);
      setPatientNames(patientsRes.data);
      setDoctorNames(doctorsRes.data);
    } catch (error) {
      console.error('Error fetching names:', error);
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await receptionistAPI.getQueue();
      setQueue(response.data);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await receptionistAPI.addToQueue(formData);
      if (response.data.success) {
        showToast('Patient added to queue successfully!', 'success');
        setShowForm(false);
        setFormData({ patientName: '', doctorName: '', department: '' });
        fetchQueue();
        window.dispatchEvent(new Event('dataChanged'));
      }
    } catch (error) {
      showToast('Failed to add patient to queue. Please try again.', 'error');
      console.error('Failed to add to queue:', error);
    }
  };

  const removeFromQueue = async (queueId) => {
    try {
      await receptionistAPI.removeFromQueue(queueId);
      showToast('Patient removed from queue successfully!', 'success');
      fetchQueue();
      window.dispatchEvent(new Event('dataChanged'));
    } catch (error) {
      showToast('Failed to remove patient from queue', 'error');
      console.error('Error removing from queue:', error);
    }
  };

  return (
    <div className="queue" style={{margin: '20px', padding: '24px'}}>
      <div className="queue-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h2 style={{color: '#64ffda', margin: '0'}}>Patient Queue</h2>
        <button onClick={() => setShowForm(true)} style={{padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ffa057', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.background = '#ff8c42'} onMouseOut={(e) => e.target.style.background = '#ffa057'}>Add to Queue</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="queue-form" style={{background: '#2a2d47', padding: '20px', borderRadius: '12px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end'}}>
          <select
            value={formData.patientName}
            onChange={(e) => setFormData({...formData, patientName: e.target.value})}
            required
            style={{padding: '10px', borderRadius: '6px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
          >
            <option value="">Select Patient</option>
            {patientNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={formData.doctorName}
            onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
            required
            style={{padding: '10px', borderRadius: '6px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
          >
            <option value="">Select Doctor</option>
            {doctorNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            required
            style={{padding: '10px', borderRadius: '6px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
          >
            <option value="">Select Department</option>
            <option value="eye">Eye</option>
            <option value="ent">ENT</option>
            <option value="skin">Skin</option>
          </select>

          <div style={{display: 'flex', gap: '8px'}}>
            <button type="submit" style={{padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#64ffda', color: '#1e1e2f', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.background = '#4fd1c7'} onMouseOut={(e) => e.target.style.background = '#64ffda'}>Add to Queue</button>
            <button type="button" onClick={() => setShowForm(false)} style={{padding: '10px 16px', borderRadius: '6px', border: '1px solid #3a3f5c', background: 'transparent', color: '#ccd6f6', fontSize: '14px', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.background = '#3a3f5c'} onMouseOut={(e) => e.target.style.background = 'transparent'}>Cancel</button>
          </div>
        </form>
      )}

      <div className="queue-list" style={{display: 'grid', gap: '16px'}}>
        {queue.map((item, index) => (
          <div key={item.id} className="queue-item" style={{background: '#2a2d47', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #3a3f5c', transition: 'all 0.3s ease'}} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <span className="queue-number" style={{background: '#64ffda', color: '#1e1e2f', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700'}}>{index + 1}</span>
            <div className="queue-details" style={{flex: '1'}}>
              <h4 style={{color: '#ccd6f6', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600'}}>{item.patient_name}</h4>
              <p style={{color: '#a0aec0', margin: '4px 0', fontSize: '14px'}}>Assigned Doctor: <span style={{color: '#ccd6f6'}}>{item.doctor_name}</span></p>
              <p style={{color: '#a0aec0', margin: '4px 0', fontSize: '14px'}}>Department: <span style={{color: '#ffa057'}}>{item.department}</span></p>
              <p style={{color: '#a0aec0', margin: '4px 0', fontSize: '14px'}}>Status: <span style={{color: item.status === 'waiting' ? '#64ffda' : '#ffa057'}}>{item.status}</span></p>
            </div>
            <button 
              onClick={() => removeFromQueue(item.id)}
              style={{padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#ff4757', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}
              onMouseOver={(e) => e.target.style.background = '#ff3742'}
              onMouseOut={(e) => e.target.style.background = '#ff4757'}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Queue;