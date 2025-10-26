import React, { useState } from 'react';
import { authAPI } from '../../api/endpoints';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return;
    }
    try {
      await authAPI.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      // Password changed successfully
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to change password');
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      background: 'var(--bg-primary)',
      minHeight: '100vh',
      color: 'var(--text-primary)'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '30px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)'
      }}>
        <h2 style={{
          color: 'var(--accent-orange)',
          margin: '0 0 25px 0',
          textAlign: 'center',
          fontSize: '24px'
        }}>🔐 Change Password</h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: '600'
            }}>Current Password</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-background)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                outline: 'none'
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: '600'
            }}>New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-background)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                outline: 'none'
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: '600'
            }}>Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-background)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                outline: 'none'
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '14px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent-orange)',
              color: 'var(--bg-primary)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '10px',
              transition: 'all 0.3s ease',
              boxShadow: 'var(--button-shadow)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#0056b3';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'var(--accent-orange)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'var(--button-shadow)';
            }}
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;