import React, { useState } from 'react';
import { vitalsAPI } from '../../api/endpoints';

// ...existing code...
const VitalSignsForm = ({ patientId, onSave }) => {
  const [vitals, setVitals] = useState({
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygen_saturation: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!vitals.blood_pressure) {
      setError('Blood pressure is required.');
      return false;
    }
    if (vitals.oxygen_saturation !== '' && (Number(vitals.oxygen_saturation) < 0 || Number(vitals.oxygen_saturation) > 100)) {
      setError('Oxygen saturation must be between 0 and 100.');
      return false;
    }
    if (vitals.temperature !== '' && (Number(vitals.temperature) < 30 || Number(vitals.temperature) > 45)) {
      setError('Temperature looks out of range.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    const payload = {
      blood_pressure: vitals.blood_pressure, // keep as string (e.g., "120/80")
      heart_rate: vitals.heart_rate === '' ? null : Number(vitals.heart_rate),
      temperature: vitals.temperature === '' ? null : Number(vitals.temperature),
      weight: vitals.weight === '' ? null : Number(vitals.weight),
      height: vitals.height === '' ? null : Number(vitals.height),
      oxygen_saturation: vitals.oxygen_saturation === '' ? null : Number(vitals.oxygen_saturation)
    };

    try {
      await vitalsAPI.recordVitals(patientId, payload);
      onSave && onSave();
      setVitals({
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        weight: '',
        height: '',
        oxygen_saturation: ''
      });
    } catch (err) {
      console.error('Failed to record vital signs', err);
      setError(err.response?.data?.message || 'Failed to record vital signs. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="vitals-form" aria-labelledby="vitals-heading">
      <h3 id="vitals-heading">Record Vital Signs</h3>

      {error && <div role="alert" style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      <div className="vitals-grid">
        <div className="form-group">
          <label htmlFor="blood_pressure">Blood Pressure (mmHg):</label>
          <input
            id="blood_pressure"
            type="text"
            placeholder="e.g. 120/80"
            value={vitals.blood_pressure}
            onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="heart_rate">Heart Rate (bpm):</label>
          <input
            id="heart_rate"
            type="number"
            placeholder="72"
            min="20"
            max="250"
            value={vitals.heart_rate}
            onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="temperature">Temperature (°C):</label>
          <input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="36.5"
            min="30"
            max="45"
            value={vitals.temperature}
            onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight (kg):</label>
          <input
            id="weight"
            type="number"
            step="0.1"
            placeholder="70.0"
            min="0"
            value={vitals.weight}
            onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="height">Height (cm):</label>
          <input
            id="height"
            type="number"
            placeholder="170"
            min="0"
            value={vitals.height}
            onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="oxygen_saturation">Oxygen Saturation (%):</label>
          <input
            id="oxygen_saturation"
            type="number"
            placeholder="98"
            min="0"
            max="100"
            value={vitals.oxygen_saturation}
            onChange={(e) => setVitals({ ...vitals, oxygen_saturation: e.target.value })}
          />
        </div>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Recording...' : 'Record Vitals'}
      </button>
    </form>
  );
};

export default VitalSignsForm;
// ...existing code...