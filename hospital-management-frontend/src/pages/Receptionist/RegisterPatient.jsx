import React, { useState } from 'react';
import { receptionistAPI } from '../../api/endpoints';
import { showToast } from '../../components/Toast/Toast';

const RegisterPatient = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    department: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await receptionistAPI.registerPatient(formData);
      if (response.data.success) {
        showToast('Patient registered successfully!', 'success');
        setFormData({ name: '', phone: '', age: '', gender: '', address: '', department: '' });
      }
    } catch (error) {
      showToast('Registration failed. Please try again.', 'error');
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="register-patient" style={{margin: '20px', padding: '24px', background: '#2a2d47', borderRadius: '12px', maxWidth: '600px'}}>
      <h2 style={{color: '#ffa057', marginBottom: '24px', textAlign: 'center'}}>Register New Patient</h2>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
        />
        <input
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={(e) => setFormData({...formData, age: e.target.value})}
          required
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
        />
        <select
          value={formData.gender}
          onChange={(e) => setFormData({...formData, gender: e.target.value})}
          required
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <textarea
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px', minHeight: '80px', resize: 'vertical'}}
        />
        <select
          value={formData.department}
          onChange={(e) => setFormData({...formData, department: e.target.value})}
          required
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #3a3f5c', background: '#1e1e2f', color: '#ccd6f6', fontSize: '14px'}}
        >
          <option value="">Select Department</option>
          <option value="eye">Eye</option>
          <option value="ent">ENT</option>
          <option value="skin">Skin</option>
        </select>
        <button type="submit" style={{padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#ffa057', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', transition: 'background 0.3s ease'}} onMouseOver={(e) => e.target.style.background = '#ff8c42'} onMouseOut={(e) => e.target.style.background = '#ffa057'}>Register Patient</button>
      </form>

    </div>
  );
};

export default RegisterPatient;