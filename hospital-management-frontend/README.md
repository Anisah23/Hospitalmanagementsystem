# Hospital Management System - Frontend

A React-based frontend for the Hospital Management System supporting Eye, ENT, and Skin clinics.

## Features

- Role-based authentication (Admin, Receptionist, Doctor)
- Patient registration and management
- Appointment scheduling
- Queue management with priority system
- Billing and payment processing
- Consultation records
- Responsive design

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

## Build

```bash
npm run build
```

## Project Structure

- `src/api/` - API configuration and endpoints
- `src/components/` - Reusable components
- `src/pages/` - Page components organized by role
- `src/context/` - React context providers
- `src/App.jsx` - Main application component
- `src/index.js` - Application entry point

## User Roles

### Admin
- Register doctors and receptionists
- View all patients
- System overview

### Receptionist
- Register patients
- Schedule appointments
- Manage billing
- Queue management

### Doctor
- View assigned patients
- Create consultations
- Manage appointments
- Queue operations# hospital-management-frontend
