import React, { useState } from 'react';
import { adminAPI } from '../../api/endpoints';

const EditStaffForm = ({ staff, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: staff.name || '',
    email: staff.email || '',
    department: staff.department || '',
    role: staff.role || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminAPI.updateUser(staff.id, formData);
      alert('Staff member updated successfully!');
      onSave();
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Failed to update staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--input-background)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
            required
          />
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--input-background)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
            required
          />
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>
            Department
          </label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--input-background)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
            required
          >
            <option value="">Select Department</option>
            <option value="eye">Eye</option>
            <option value="ent">ENT</option>
            <option value="skin">Skin</option>
            <option value="reception">Reception</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--input-background)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
            required
          >
            <option value="">Select Role</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
            <option value="admin">Admin</option>
          </select>
        </div>


        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: '1',
              padding: '12px 16px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--accent-orange)',
              color: 'var(--bg-primary)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Updating...' : 'Update Staff'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: '1',
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStaffForm;