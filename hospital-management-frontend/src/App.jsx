import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Auth/Login';
import ChangePassword from './pages/Auth/ChangePassword';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminPanel from './pages/Admin/AdminPanel';
import RegisterDoctor from './pages/Admin/RegisterDoctor';
import RegisterReceptionist from './pages/Admin/RegisterReceptionist';
import AllPatients from './pages/Admin/AllPatients';
import HospitalOverview from './pages/Admin/HospitalOverview';
import ReceptionistDashboard from './pages/Receptionist/Dashboard';
import RegisterPatient from './pages/Receptionist/RegisterPatient';
import Appointments from './pages/Receptionist/Appointments';
import Billing from './pages/Receptionist/Billing';
import Queue from './pages/Receptionist/Queue';
import ReceptionistPatients from './pages/Receptionist/Patients';
import DoctorDashboard from './pages/Doctor/Dashboard';
import MyPatients from './pages/Doctor/MyPatients';
import DoctorAppointments from './pages/Doctor/Appointments';
import DoctorQueue from './pages/Doctor/Queue';
import PatientDetails from './pages/PatientDetails';
import ExamRoom from './pages/Doctor/ExamRoom';
import SystemSettings from './pages/Admin/SystemSettings';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueueProvider>
          <Router>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="app-layout">
                      <Sidebar />
                      <div className="main-content">
                        <Navbar />
                        <div className="content">
                          <Routes>
                            {/* Admin Routes */}
                            <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                            <Route path="/admin/panel" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />
                            <Route path="/admin/register-doctor" element={<ProtectedRoute role="admin"><RegisterDoctor /></ProtectedRoute>} />
                            <Route path="/admin/register-receptionist" element={<ProtectedRoute role="admin"><RegisterReceptionist /></ProtectedRoute>} />
                            <Route path="/admin/overview" element={<ProtectedRoute role="admin"><HospitalOverview /></ProtectedRoute>} />
                            <Route path="/admin/patients" element={<ProtectedRoute role="admin"><AllPatients /></ProtectedRoute>} />
                            <Route path="/admin/all-patients" element={<ProtectedRoute role="admin"><AllPatients /></ProtectedRoute>} />
                            <Route path="/admin/settings" element={<ProtectedRoute role="admin"><SystemSettings /></ProtectedRoute>} />
                            
                            {/* Receptionist Routes */}
                            <Route path="/receptionist/dashboard" element={<ProtectedRoute role="receptionist"><ReceptionistDashboard /></ProtectedRoute>} />
                            <Route path="/receptionist/register-patient" element={<ProtectedRoute role="receptionist"><RegisterPatient /></ProtectedRoute>} />
                            <Route path="/receptionist/patients" element={<ProtectedRoute role="receptionist"><ReceptionistPatients /></ProtectedRoute>} />
                            <Route path="/receptionist/appointments" element={<ProtectedRoute role="receptionist"><Appointments /></ProtectedRoute>} />
                            <Route path="/receptionist/billing" element={<ProtectedRoute role="receptionist"><Billing /></ProtectedRoute>} />
                            <Route path="/receptionist/queue" element={<ProtectedRoute role="receptionist"><Queue /></ProtectedRoute>} />
                            <Route path="/receptionist/patient-details/:patientId" element={<ProtectedRoute role="receptionist"><PatientDetails /></ProtectedRoute>} />
                            
                            {/* Doctor Routes */}
                            <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
                            <Route path="/doctor/patients" element={<ProtectedRoute role="doctor"><MyPatients /></ProtectedRoute>} />
                            <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>} />
                            <Route path="/doctor/queue" element={<ProtectedRoute role="doctor"><DoctorQueue /></ProtectedRoute>} />
                            <Route path="/doctor/exam/:patientId" element={<ProtectedRoute role="doctor"><ExamRoom /></ProtectedRoute>} />
                            
                            {/* Shared Routes */}
                            <Route path="/patient/:patientId" element={<PatientDetails />} />
                            
                            {/* Common Routes */}
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </QueueProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;