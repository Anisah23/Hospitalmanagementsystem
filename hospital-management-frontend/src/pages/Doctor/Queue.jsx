import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../../api/endpoints';
import './MyPatients.css';

const DoctorQueue = () => {
  const [queue, setQueue] = useState([]);
  const [filteredQueue, setFilteredQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    const filtered = queue.filter(item =>
      item.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQueue(filtered);
  }, [queue, searchTerm]);

  const fetchQueue = async () => {
    try {
      const response = await doctorAPI.getQueue();
      setQueue(response.data);
      setFilteredQueue(response.data);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  const startExam = async (queueId, patientId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/start-consultation/${queueId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        navigate(`/doctor/exam/${patientId}`);
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  return (
    <div className="my-patients">
      <h2>Patient Queue</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search queue by patient name or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="patients-grid">
        {filteredQueue.map((item, index) => (
          <div key={item.id} className="patient-card" onClick={() => handlePatientClick(item.patient_id)} style={{cursor: 'pointer'}}>
            <h3>#{index + 1} - {item.patient_name}</h3>
            <p>Status: {item.status}</p>
            <p>Queue Position: {index + 1}</p>
            <div className="patient-actions">
              <button onClick={(e) => { e.stopPropagation(); handlePatientClick(item.patient_id); }}>View Details</button>
              <button onClick={(e) => { e.stopPropagation(); startExam(item.id, item.patient_id); }}>Start Exam</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorQueue;