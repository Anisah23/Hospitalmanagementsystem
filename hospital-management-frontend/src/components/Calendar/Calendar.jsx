import React, { useState, useEffect } from 'react';
import './Calendar.css';

const Calendar = ({ onDateSelect, selectedDate, events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = events.filter(event => 
        new Date(event.date).toDateString() === date.toDateString()
      );

      days.push({
        date: date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
        events: dayEvents
      });
    }
    setCalendarDays(days);
  };

  const handleDateClick = (date) => {
    onDateSelect(date);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={() => navigateMonth(-1)}>‹</button>
        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button onClick={() => navigateMonth(1)}>›</button>
      </div>
      
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} 
                       ${day.isToday ? 'today' : ''} 
                       ${day.isSelected ? 'selected' : ''}`}
            onClick={() => handleDateClick(day.date)}
          >
            <span className="day-number">{day.date.getDate()}</span>
            {day.events.length > 0 && (
              <div className="event-indicators">
                {day.events.slice(0, 3).map((event, i) => (
                  <div key={i} className={`event-dot ${event.type}`}></div>
                ))}
                {day.events.length > 3 && <span className="more-events">+{day.events.length - 3}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;