import React, { useState, useEffect } from 'react';
import Toast from '../../components/Toast/Toast';
import { useToast } from '../../hooks/useToast';
import './SystemSettings.css';

const SystemSettings = () => {
  const { toasts, success, error } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchPatients();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/all-staff', {
        credentials: 'include'
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/all-patients', {
        credentials: 'include'
      });
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };



  const handleDelete = async () => {
    try {
      const endpoint = deleteTarget.type === 'user' ? 'delete-user' : 'delete-patient';
      const response = await fetch(`http://localhost:5000/api/admin/${endpoint}/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        error('Server error occurred');
        return;
      }
      
      if (response.ok && result.success) {
        // Add a small delay to ensure backend operation completes
        setTimeout(() => {
          if (deleteTarget.type === 'user') {
            fetchUsers();
          } else {
            fetchPatients();
          }
        }, 500);

        setShowDeleteModal(false);
        setDeleteTarget(null);
        success(`${deleteTarget.type === 'user' ? 'User' : 'Patient'} deleted successfully`);
      } else {
        error(result.error || 'Failed to delete record');
      }
    } catch (err) {
      console.error('Error deleting:', err);
      error('Error deleting record');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New passwords do not match');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        error(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      error('Error changing password');
    }
  };

  const openEditModal = (user) => {
    const schedule = user.schedule || '';
    let startTime = '09:00';
    let endTime = '17:00';

    if (schedule.includes(' - ')) {
      const [start, end] = schedule.split(' - ');
      if (start && end) {
        startTime = convertTo24Hour(start.trim());
        endTime = convertTo24Hour(end.trim());
      }
    }

    setEditUser({...user, newPassword: '', confirmPassword: '', startTime, endTime});
    setShowEditModal(true);
  };
  
  const convertTo24Hour = (time12h) => {
    if (!time12h || typeof time12h !== 'string') return '09:00';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };
  
  const convertTo12Hour = (time24h) => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const openEditPatientModal = (patient) => {
    setEditPatient({...patient});
    setShowEditPatientModal(true);
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        name: editPatient.name,
        age: editPatient.age,
        gender: editPatient.gender,
        phone: editPatient.phone,
        department: editPatient.department
      };
      
      await fetch(`http://localhost:5000/api/admin/update-patient/${editPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      
      fetchPatients();
      setShowEditPatientModal(false);
      setEditPatient(null);
      success('Patient updated successfully');
    } catch (error) {
      console.error('Error updating patient:', error);
      error('Error updating patient');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    
    if (editUser.newPassword && editUser.newPassword !== editUser.confirmPassword) {
      error('Passwords do not match');
      return;
    }
    
    try {
      const schedule = `${convertTo12Hour(editUser.startTime)} - ${convertTo12Hour(editUser.endTime)}`;
      
      const updateData = {
        name: editUser.name,
        email: editUser.email,
        department: editUser.department,
        schedule: schedule
      };
      
      if (editUser.newPassword) {
        updateData.password = editUser.newPassword;
      }
      
      await fetch(`http://localhost:5000/api/admin/update-user/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      
      fetchUsers();
      setShowEditModal(false);
      setEditUser(null);
      success('User updated successfully');
      
      // Force refresh AdminPanel after a short delay
      setTimeout(() => {
        window.dispatchEvent(new Event('staffUpdated'));
      }, 500);
    } catch (error) {
      console.error('Error updating user:', error);
      error('Error updating user');
    }
  };

  const confirmDelete = (item, type) => {
    setDeleteTarget({ ...item, type });
    setShowDeleteModal(true);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="system-settings">
      <div className="settings-header">
        <h1>⚙️ System Settings</h1>
        <p>Manage users, patients, and system configurations</p>
      </div>

      <div className="settings-tabs">
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button 
          className={activeTab === 'patients' ? 'active' : ''} 
          onClick={() => setActiveTab('patients')}
        >
          🏥 Patient Management
        </button>
        <button 
          className={activeTab === 'password' ? 'active' : ''} 
          onClick={() => setActiveTab('password')}
        >
          🔐 Change Password
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {activeTab === 'users' && (
        <div className="management-section">
          <h3>User Management</h3>
          <div className="items-grid">
            {filteredUsers.map(user => (
              <div key={user.id} className="item-card user-card">
                <div className="item-header">
                  <h4>{user.name}</h4>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </div>
                <div className="item-details">
                  <p>📧 {user.email}</p>
                  <p>🏢 {user.department}</p>
                </div>
                <div className="item-actions">
                  <button className="edit-btn" onClick={() => openEditModal(user)}>✏️ Edit</button>
                  <button 
                    className="delete-btn"
                    onClick={() => confirmDelete(user, 'user')}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="management-section">
          <h3>Patient Management</h3>
          <div className="items-grid">
            {filteredPatients.map(patient => (
              <div key={patient.id} className="item-card patient-card">
                <div className="item-header">
                  <h4>{patient.name}</h4>
                  <span className="age-badge">{patient.age}y</span>
                </div>
                <div className="item-details">
                  <p>📞 {patient.phone}</p>
                  <p>👤 {patient.gender}</p>
                  <p>🏥 {patient.department}</p>
                </div>
                <div className="item-actions">
                  <button className="edit-btn" onClick={() => openEditPatientModal(patient)}>✏️ Edit</button>
                  <button 
                    className="delete-btn"
                    onClick={() => confirmDelete(patient, 'patient')}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}





      {activeTab === 'password' && (
        <div className="management-section">
          <h3>Change Password</h3>
          <div className="password-section">
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="config-item">
                <label>🔒 Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="config-item">
                <label>🆕 New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className="config-item">
                <label>✅ Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="save-btn">
                🔐 Change Password
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <h3>⚠️ Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editUser && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h3>✏️ Edit User - {editUser.name}</h3>
            </div>
            <form onSubmit={handleEditUser} className="edit-form">
              <div className="config-item">
                <label>Name</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="config-item">
                <label>Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="config-item">
                <label>Department</label>
                <select
                  value={editUser.department || ''}
                  onChange={(e) => setEditUser({...editUser, department: e.target.value})}
                >
                  <option value="eye">Eye</option>
                  <option value="ent">ENT</option>
                  <option value="skin">Skin</option>
                  <option value="reception">Reception</option>
                </select>
              </div>
              <div className="config-item">
                <label>Start Time</label>
                <input
                  type="time"
                  value={editUser.startTime || '09:00'}
                  onChange={(e) => setEditUser({...editUser, startTime: e.target.value})}
                  autoComplete="off"
                />
              </div>
              <div className="config-item">
                <label>End Time</label>
                <input
                  type="time"
                  value={editUser.endTime || '17:00'}
                  onChange={(e) => setEditUser({...editUser, endTime: e.target.value})}
                  autoComplete="off"
                />
              </div>
              <div className="config-item">
                <label>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editUser.newPassword || ''}
                  onChange={(e) => setEditUser({...editUser, newPassword: e.target.value})}
                  placeholder="Enter new password or leave blank"
                />
              </div>
              {editUser.newPassword && (
                <div className="config-item">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={editUser.confirmPassword || ''}
                    onChange={(e) => setEditUser({...editUser, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditPatientModal && editPatient && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h3>✏️ Edit Patient - {editPatient.name}</h3>
            </div>
            <form onSubmit={handleEditPatient} className="edit-form">
              <div className="config-item">
                <label>Name</label>
                <input
                  type="text"
                  value={editPatient.name}
                  onChange={(e) => setEditPatient({...editPatient, name: e.target.value})}
                  required
                />
              </div>
              <div className="config-item">
                <label>Age</label>
                <input
                  type="number"
                  value={editPatient.age}
                  onChange={(e) => setEditPatient({...editPatient, age: e.target.value})}
                  required
                />
              </div>
              <div className="config-item">
                <label>Gender</label>
                <select
                  value={editPatient.gender}
                  onChange={(e) => setEditPatient({...editPatient, gender: e.target.value})}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="config-item">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editPatient.phone}
                  onChange={(e) => setEditPatient({...editPatient, phone: e.target.value})}
                  required
                />
              </div>
              <div className="config-item">
                <label>Department</label>
                <select
                  value={editPatient.department}
                  onChange={(e) => setEditPatient({...editPatient, department: e.target.value})}
                  required
                >
                  <option value="eye">Eye</option>
                  <option value="ent">ENT</option>
                  <option value="skin">Skin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditPatientModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Update Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      

      
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => {}}
        />
      ))}
    </div>
  );
};

export default SystemSettings;