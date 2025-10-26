import React, { useState } from 'react';
import { adminAPI } from '../../api/endpoints';
import { showToast } from '../../components/Toast/Toast';

const RegisterReceptionist = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await adminAPI.registerReceptionist(formData);
      if (response.data.success) {
        showToast('Receptionist registered successfully!', 'success');
        setFormData({ name: '', email: '', password: '', phone: '' });
      } else {
        showToast(response.data.message, 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Register New Receptionist</h1>
        <p>Add a new receptionist to the system</p>
      </div>
      
      <div className="form-container">
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter receptionist's full name"
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter email address"
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="form-group">
            <label>Temporary Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter temporary password"
            />
          </div>
          
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Registering...' : 'Register Receptionist'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterReceptionist;