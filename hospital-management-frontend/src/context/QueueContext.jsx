import React, { createContext, useState, useContext } from 'react';

const QueueContext = createContext();

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};

export const QueueProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);

  const addToQueue = (patient) => {
    setQueue(prev => [...prev, patient]);
  };

  const removeFromQueue = (patientId) => {
    setQueue(prev => prev.filter(p => p.id !== patientId));
  };

  const updateQueueStatus = (patientId, status) => {
    setQueue(prev => prev.map(p => 
      p.id === patientId ? { ...p, status } : p
    ));
  };

  const value = {
    queue,
    loading,
    addToQueue,
    removeFromQueue,
    updateQueueStatus,
    setQueue,
    setLoading
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
};

export default QueueContext;