import React, { useState } from 'react';
import './DateFilter.css';

const DateFilter = ({ onDateChange, selectedRange = 'today' }) => {
  const [activeRange, setActiveRange] = useState(selectedRange);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const ranges = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'custom', label: 'Custom Range' }
  ];

  const handleRangeClick = (range) => {
    setActiveRange(range);
    
    const today = new Date();
    let startDate, endDate;

    switch (range) {
      case 'today':
        startDate = endDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    onDateChange({ startDate, endDate, range });
  };

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      onDateChange({ startDate: customStart, endDate: customEnd, range: 'custom' });
    }
  };

  return (
    <div className="date-filter">
      <div className="filter-buttons">
        {ranges.map(range => (
          <button
            key={range.key}
            className={`filter-btn ${activeRange === range.key ? 'active' : ''}`}
            onClick={() => handleRangeClick(range.key)}
          >
            {range.label}
          </button>
        ))}
      </div>
      
      {activeRange === 'custom' && (
        <div className="custom-range">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            placeholder="End Date"
          />
          <button onClick={handleCustomRange} className="apply-btn">Apply</button>
        </div>
      )}
    </div>
  );
};

export default DateFilter;