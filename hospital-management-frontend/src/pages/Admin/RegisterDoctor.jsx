import React, { useState } from 'react';
import { adminAPI } from '../../api/endpoints';

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await adminAPI.registerDoctor(formData);
      if (response.data.success) {
        setMessage('Doctor registered successfully!');
        setFormData({ name: '', email: '', password: '', department: '' });
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Register New Doctor</h1>
        <p>Add a new doctor to the system</p>
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
              placeholder="Enter doctor's full name"
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
            <label>Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              <option value="eye">Eye Department</option>
              <option value="ent">ENT Department</option>
              <option value="skin">Skin Department</option>
            </select>
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
            {loading ? 'Registering...' : 'Register Doctor'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDoctor;