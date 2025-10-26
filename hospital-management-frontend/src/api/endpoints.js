import api from './axiosConfig';

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  changePassword: (data) => api.post('/change-password', data)
};

// Admin endpoints
export const adminAPI = {
  getDashboard: (params) => api.get('/admin/dashboard-summary', { params }),
  registerDoctor: (data) => api.post('/admin/register-doctor', data),
  registerReceptionist: (data) => api.post('/admin/register-receptionist', data),
  getAllPatients: () => api.get('/admin/all-patients'),
  getPatientDetails: (patientId) => api.get(`/admin/patient-details/${patientId}`),
  getHospitalOverview: () => api.get('/admin/hospital-overview'),
  getAllAppointments: () => api.get('/admin/all-appointments'),
  getBillingOverview: () => api.get('/admin/billing-overview'),
  getAllStaff: () => api.get(`/admin/all-staff?t=${Date.now()}`),
  addStaff: (data) => api.post('/admin/add-staff', data),
  deleteUser: (userId) => api.delete(`/admin/delete-user/${userId}`),
  deletePatient: (patientId) => api.delete(`/admin/delete-patient/${patientId}`),
  updateUser: (userId, data) => api.put(`/admin/update-user/${userId}`, data),
  updatePatient: (patientId, data) => api.put(`/admin/update-patient/${patientId}`, data),
  deleteConsultation: (consultationId) => api.delete(`/admin/delete-consultation/${consultationId}`)
};

// Receptionist endpoints
export const receptionistAPI = {
  getDashboard: (params) => api.get('/receptionist/dashboard-summary', { params }),
  registerPatient: (data) => api.post('/receptionist/register-patient', data),
  createAppointment: (data) => api.post('/receptionist/create-appointment', data),
  getPatients: () => api.get('/receptionist/patients'),
  getBilling: () => api.get('/receptionist/billing'),
  markPaid: (billId, data) => api.post(`/receptionist/mark-paid/${billId}`, data),
  getDoctorsByDepartment: (department) => api.get(`/receptionist/doctors/${department}`),
  getAppointments: () => api.get('/receptionist/appointments'),
  getQueue: () => api.get('/receptionist/queue'),
  addToQueue: (data) => api.post('/receptionist/add-to-queue', data),
  removeFromQueue: (queueId) => api.delete(`/receptionist/remove-from-queue/${queueId}`),
  getPatientNames: () => api.get('/receptionist/patient-names'),
  getDoctorNames: () => api.get('/receptionist/doctor-names')
};

// Doctor endpoints
export const doctorAPI = {
  getDashboard: (params) => api.get('/doctor/dashboard', { params }),
  startConsultation: (queueId) => api.post(`/doctor/start-consultation/${queueId}`),
  saveConsultation: (data) => api.post('/doctor/save-consultation', data),
  getPatientHistory: (patientId) => api.get(`/doctor/patient-history/${patientId}`),
  getMyPatients: () => api.get('/doctor/my-patients'),
  getAppointments: () => api.get('/doctor/appointments'),
  getQueue: () => api.get('/doctor/queue'),
  changePassword: (data) => api.post('/doctor/change-password', data),
  updateConsultation: (consultationId, data) => api.put(`/doctor/update-consultation/${consultationId}`, data)
};

// Vitals endpoints
export const vitalsAPI = {
  recordVitals: (patientId, data) => api.post(`/vitals/record/${patientId}`, data),
  getPatientVitals: (patientId) => api.get(`/vitals/patient/${patientId}`),
  getLatestVitals: (patientId) => api.get(`/vitals/latest/${patientId}`)
};