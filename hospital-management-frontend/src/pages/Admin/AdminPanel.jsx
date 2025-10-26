import React, { useState, useEffect } from 'react';
import StaffTable from '../../components/Admin/StaffTable';
import AddStaffModal from '../../components/Admin/AddStaffModal';
import { useToast } from '../../hooks/useToast';
import './AdminPanel.css';

const AdminPanel = () => {
  const { success } = useToast();
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    role: 'all'
  });

  useEffect(() => {
    fetchStaffData();
    
    const handleStaffUpdate = () => {
      fetchStaffData();
    };
    
    window.addEventListener('staffUpdated', handleStaffUpdate);
    window.addEventListener('dataChanged', handleStaffUpdate);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStaffData, 30000);
    
    return () => {
      window.removeEventListener('staffUpdated', handleStaffUpdate);
      window.removeEventListener('dataChanged', handleStaffUpdate);
      clearInterval(interval);
    };
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/all-staff?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-cache'
      });
      const data = await response.json();
      console.log('Staff data received:', data);

      setStaffData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      setStaffData([]);
      setLoading(false);
    }
  };

  const handleAddStaff = async (newStaff) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/add-staff', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newStaff)
      });
      
      if (response.ok) {
        await fetchStaffData();
        setShowAddModal(false);
        success('Staff member added successfully! They can now login with their credentials.');
        window.dispatchEvent(new Event('staffUpdated'));
        window.dispatchEvent(new Event('dataChanged'));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add staff member');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Backend server not running. Please start the server first.');
    }
  };



  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          staff.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDepartment = filters.department === 'all' || staff.department?.toLowerCase() === filters.department;
    const matchesRole = filters.role === 'all' || staff.role.toLowerCase() === filters.role;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  const statsCards = [
    { title: 'Total Staff', value: staffData.length, color: 'default' },
    { title: 'Doctors', value: staffData.filter(s => s.role === 'doctor').length, color: 'blue' },
    { title: 'Receptionists', value: staffData.filter(s => s.role === 'receptionist').length, color: 'purple' }
  ];

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage doctors and receptionists</p>
      </div>

      <div className="staff-tab">
          <div className="stats-cards">
            {statsCards.map((card, index) => (
              <div key={index} className={`stats-card ${card.color}`}>
                <div className="stats-value">{card.value}</div>
                <div className="stats-title">{card.title}</div>
                <div className={`stats-indicator ${card.color}`}></div>
              </div>
            ))}
          </div>

          <div className="filter-bar">
            <div className="search-input">
              <input
                type="text"
                placeholder="Search doctors or receptionists..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <select value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)}>
              <option value="all">All Departments</option>
              <option value="eye">Eye</option>
              <option value="ent">ENT</option>
              <option value="skin">Skin</option>
            </select>
            
            <select value={filters.role} onChange={(e) => handleFilterChange('role', e.target.value)}>
              <option value="all">All Roles</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
            </select>
            
            
            <button className="add-staff-btn" onClick={() => setShowAddModal(true)}>+ Add Staff</button>
          </div>

          <StaffTable 
            staffData={filteredStaff} 
            loading={loading}
            totalCount={staffData.length}
            filteredCount={filteredStaff.length}
            onStaffDeleted={fetchStaffData}
          />
      </div>

      {showAddModal && (
        <AddStaffModal 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStaff}
        />
      )}


    </div>
  );
};

export default AdminPanel;