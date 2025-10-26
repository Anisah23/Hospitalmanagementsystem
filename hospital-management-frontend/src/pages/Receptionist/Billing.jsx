import React, { useState, useEffect, useCallback } from 'react';
import { receptionistAPI } from '../../api/endpoints';
import { showToast } from '../../components/Toast/Toast';

const Billing = () => {
  const [billings, setBillings] = useState([]);
  const [allBillings, setAllBillings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const fetchBillings = async () => {
    try {
      const response = await receptionistAPI.getBilling();
      setAllBillings(response.data);
    } catch (error) {
      console.error('Error fetching billings:', error);
    }
  };

  const filterBillings = useCallback(() => {
    let filtered = allBillings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bill => bill.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setBillings(filtered);
  }, [allBillings, searchTerm, statusFilter]);

  useEffect(() => {
    fetchBillings();
  }, []);

  useEffect(() => {
    filterBillings();
  }, [filterBillings]);

  const handlePayment = async (billingId, paymentMethod = 'cash') => {
    try {
      const response = await receptionistAPI.markPaid(billingId, { payment_method: paymentMethod });
      if (response.data.success) {
        showToast('Payment processed successfully!', 'success');
        fetchBillings();
      }
    } catch (error) {
      showToast('Payment processing failed. Please try again.', 'error');
      console.error('Payment processing failed:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // const getStatusColor = (status) => {
  //   return status === 'paid' ? '#4ade80' : '#ffa057';
  // };

  return (
    <div style={{padding: '24px', background: '#1e1e2f', minHeight: '100vh'}}>
      <div style={{marginBottom: '24px'}}>
        <h2 style={{color: '#ffa057', margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700'}}>💳 Billing Management</h2>
        <p style={{color: '#b8bcc8', margin: '0', fontSize: '16px'}}>Manage patient payments and billing records</p>
      </div>

      <div style={{display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap'}}>
        <input
          type="text"
          placeholder="Search by patient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #2a2d47',
            background: '#2a2d47',
            color: '#ffffff',
            fontSize: '14px',
            flex: '1',
            minWidth: '250px'
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #2a2d47',
            background: '#2a2d47',
            color: '#ffffff',
            fontSize: '14px',
            minWidth: '150px'
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div style={{display: 'grid', gap: '16px'}}>
        {billings.length === 0 ? (
          <div style={{
            background: '#2a2d47',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #3a3d5a'
          }}>
            <p style={{color: '#b8bcc8', margin: '0', fontSize: '16px'}}>No billing records found</p>
          </div>
        ) : (
          billings.map(billing => (
            <div key={billing.id} style={{
              background: '#2a2d47',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #3a3d5a',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                background: billing.status === 'paid' ? '#4ade80' : '#ffa057',
                color: 'white',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                {billing.status === 'paid' ? '✓' : '$'}
              </div>
              
              <div style={{flex: '1'}}>
                <h4 style={{color: '#ffffff', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600'}}>
                  {billing.patient_name}
                </h4>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px'}}>
                  <p style={{color: '#b8bcc8', margin: '4px 0', fontSize: '14px'}}>
                    Amount: <span style={{color: '#ffffff', fontWeight: '600'}}>KSH {billing.amount}</span>
                  </p>
                  <p style={{color: '#b8bcc8', margin: '4px 0', fontSize: '14px'}}>
                    Status: <span style={{
                      background: billing.status === 'paid' ? '#4ade80' : '#ffa057',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>{billing.status}</span>
                  </p>
                  <p style={{color: '#b8bcc8', margin: '4px 0', fontSize: '14px'}}>
                    Date: <span style={{color: '#ffffff'}}>{formatDate(billing.created_at)}</span>
                  </p>
                  {billing.payment_method && billing.status === 'paid' && (
                    <p style={{color: '#b8bcc8', margin: '4px 0', fontSize: '14px'}}>
                      Method: <span style={{color: '#ffa057', textTransform: 'capitalize'}}>{billing.payment_method}</span>
                    </p>
                  )}
                </div>
              </div>
              
              {billing.status === 'pending' && (
                <button 
                  onClick={() => setSelectedBill(billing)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#4ade80',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#22c55e'}
                  onMouseOut={(e) => e.target.style.background = '#4ade80'}
                >
                  Mark as Paid
                </button>
              )}
            </div>
          ))
        )}
      </div>
      
      {selectedBill && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e1e2f',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            border: '1px solid #2a2d47'
          }}>
            <h3 style={{color: '#ffffff', margin: '0 0 16px 0'}}>Mark Payment for {selectedBill.patient_name}</h3>
            <p style={{color: '#b8bcc8', margin: '0 0 16px 0'}}>Amount: KSH {selectedBill.amount}</p>
            
            <div style={{marginBottom: '16px'}}>
              <label style={{color: '#b8bcc8', display: 'block', marginBottom: '8px'}}>Payment Method:</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #2a2d47',
                  background: '#2a2d47',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              >
                <option value="cash">Cash</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
              </select>
            </div>
            
            <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => setSelectedBill(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #3a3d5a',
                  background: 'transparent',
                  color: '#b8bcc8',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handlePayment(selectedBill.id, paymentMethod);
                  setSelectedBill(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#4ade80',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;