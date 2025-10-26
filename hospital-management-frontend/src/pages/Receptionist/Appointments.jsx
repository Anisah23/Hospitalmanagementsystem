import React, { useState, useEffect } from 'react';
import { receptionistAPI } from '../../api/endpoints';
import { showToast } from '../../components/Toast/Toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patientNames, setPatientNames] = useState([]);
  const [doctorNames, setDoctorNames] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    department: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchNames();
    
    const handleDataChange = () => {
      fetchAppointments();
    };
    
    window.addEventListener('dataChanged', handleDataChange);
    
    const interval = setInterval(fetchAppointments, 30000);
    
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

  const fetchAppointments = async () => {
    try {
      const response = await receptionistAPI.getAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await receptionistAPI.createAppointment(formData);
      if (response.data.success) {
        showToast('Appointment scheduled successfully!', 'success');
        setShowForm(false);
        setFormData({ patientName: '', doctorName: '', department: '', date: '', time: '' });
        fetchAppointments();
        window.dispatchEvent(new Event('dataChanged'));
      }
    } catch (error) {
      showToast('Failed to schedule appointment. Please try again.', 'error');
      console.error('Failed to schedule appointment:', error);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await receptionistAPI.cancelAppointment(appointmentId);
      showToast('Appointment cancelled successfully!', 'success');
      fetchAppointments();
      window.dispatchEvent(new Event('dataChanged'));
    } catch (error) {
      showToast('Failed to cancel appointment', 'error');
      console.error('Error cancelling appointment:', error);
    }
  };

  const addAppointmentToQueue = async (appointment) => {
    try {
      await receptionistAPI.addToQueue({
        patientName: appointment.patient_name,
        doctorName: appointment.doctor_name
      });
      showToast('Patient added to queue successfully!', 'success');
      window.dispatchEvent(new Event('dataChanged'));
    } catch (error) {
      showToast('Failed to add patient to queue', 'error');
      console.error('Error adding to queue:', error);
    }
  };

  return (
    <div className="appointments" style={{margin: '20px', padding: '24px'}}>
      <div className="appointments-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h2 style={{color: '#ffa057', margin: '0'}}>Appointments</h2>
        <button onClick={() => setShowForm(true)} style={{padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ffa057', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.background = '#ff8c42'} onMouseOut={(e) => e.target.style.background = '#ffa057'}>Schedule New</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="appointment-form" style={{background: '#2a2d47', padding: '20px', borderRadius: '12px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end'}}>
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
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
            style={{padding: '10px', borderRadius: '6px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
          />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            required
            style={{padding: '10px', borderRadius: '6px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
          />
          <div style={{display: 'flex', gap: '8px'}}>
            <button type="submit" style={{padding: '10px 16px', borderRadius: '6px', border: 'none', background: '#ffa057', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.background = '#ff8c42'} onMouseOut={(e) => e.target.style.background = '#ffa057'}>Schedule</button>
            <button type="button" onClick={() => setShowForm(false)} style={{padding: '10px 16px', borderRadius: '6px', border: '1px solid #3a3f5c', background: 'transparent', color: '#ccd6f6', fontSize: '14px', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.background = '#3a3f5c'} onMouseOut={(e) => e.target.style.background = 'transparent'}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{background: '#2a2d47', borderRadius: '12px', overflow: 'hidden'}}>
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '16px 20px', background: '#1e1e2f', borderBottom: '1px solid #3a3f5c'}}>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Patient</span>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Doctor</span>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Department</span>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Date</span>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Time</span>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Status</span>
          <span style={{color: '#ffa057', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}>Actions</span>
        </div>
        <div>
          {appointments.map(appointment => (
            <div key={appointment.id} style={{display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr', gap: '16px', padding: '16px 20px', borderBottom: '1px solid #3a3f5c', alignItems: 'center', transition: 'background 0.2s ease'}} onMouseOver={(e) => e.currentTarget.style.background = '#323659'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              <span style={{color: '#ccd6f6', fontWeight: '600'}}>{appointment.patient_name}</span>
              <span style={{color: '#ccd6f6'}}>{appointment.doctor_name}</span>
              <span style={{color: '#ffa057'}}>{appointment.department}</span>
              <span style={{color: '#64ffda'}}>{appointment.appointment_date}</span>
              <span style={{color: '#64ffda'}}>{appointment.appointment_time}</span>
              <span style={{color: appointment.status === 'scheduled' ? '#64ffda' : appointment.status === 'completed' ? '#4ade80' : '#ffa057'}}>{appointment.status}</span>
              <div style={{display: 'flex', gap: '4px'}}>
                {appointment.status === 'scheduled' && (
                  <button 
                    onClick={() => addAppointmentToQueue(appointment)}
                    style={{padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#64ffda', color: '#1e1e2f', fontSize: '12px', fontWeight: '600', cursor: 'pointer'}}
                  >
                    Add to Queue
                  </button>
                )}
                <button 
                  onClick={() => cancelAppointment(appointment.id)}
                  style={{padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#ff4757', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer'}}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Appointments;