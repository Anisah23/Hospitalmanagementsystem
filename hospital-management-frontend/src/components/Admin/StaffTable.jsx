import React, { useState } from 'react';
import './StaffTable.css';

const StaffTable = ({ staffData, loading, totalCount, filteredCount, onStaffDeleted }) => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleRowClick = (staff) => {
    setSelectedStaff(staff);
    setShowModal(true);
  };

  const getDepartmentBadgeClass = (department) => {
    switch (department.toLowerCase()) {
      case 'eye': return 'purple';
      case 'ent': return 'blue';
      case 'skin': return 'green';
      case 'reception': return 'orange';
      default: return 'gray';
    }
  };


  if (loading) {
    return (
      <div className="staff-table-container">
        <div className="table-header">
          <h3>Doctors & Staff</h3>
          <p>Loading...</p>
        </div>
        <div className="loading-spinner">Loading staff data...</div>
      </div>
    );
  }

  return (
    <div className="staff-table-container">
      <div className="table-header">
        <h3>Doctors & Staff</h3>
        <p>Showing {filteredCount} of {totalCount} users</p>
      </div>
      
      <table className="staff-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Availability</th>
            {/* <th>Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {staffData.map((staff) => (
            <tr key={staff.id} className="staff-row">
              <td onClick={() => handleRowClick(staff)}>
                <div className="staff-name">{staff.name}</div>
              </td>
              <td onClick={() => handleRowClick(staff)}>{staff.email}</td>
              <td onClick={() => handleRowClick(staff)}>
                <span className={`department-badge ${getDepartmentBadgeClass(staff.department)}`}>
                  {staff.department}
                </span>
              </td>
              <td onClick={() => handleRowClick(staff)} className="role-cell">{staff.role}</td>
              <td onClick={() => handleRowClick(staff)}>
                {staff.schedule || 'Not set'}
              </td>
              <td>
                {/* Actions removed - use System Settings for detailed management */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {staffData.length === 0 && (
        <div className="empty-state">
          <p>No staff members found matching your criteria.</p>
        </div>
      )}

      {showModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Staff Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="staff-detail">
                <label>Name:</label>
                <span>{selectedStaff.name}</span>
              </div>
              <div className="staff-detail">
                <label>Email:</label>
                <span>{selectedStaff.email}</span>
              </div>
              <div className="staff-detail">
                <label>Department:</label>
                <span className={`department-badge ${getDepartmentBadgeClass(selectedStaff.department)}`}>
                  {selectedStaff.department}
                </span>
              </div>
              <div className="staff-detail">
                <label>Role:</label>
                <span>{selectedStaff.role}</span>
              </div>
              <div className="staff-detail">
                <label>Availability:</label>
                <span>{selectedStaff.schedule || 'Not set'}</span>
              </div>
              <div className="staff-detail">
                <label>Schedule/Availability:</label>
                <span>{selectedStaff.schedule || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTable;