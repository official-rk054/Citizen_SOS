import axios, { InternalAxiosRequestConfig } from 'axios';
import { storageService } from './storage';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await storageService.getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore token retrieval errors, request will proceed without auth header
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: async (userData: any) => api.post('/auth/register', userData),
  login: async (email: string, password: string) => api.post('/auth/login', { email, password }),
  getCurrentUser: async () => api.get('/auth/me'),
};

// Users API calls
export const usersAPI = {
  getUserProfile: async (userId: string) => api.get(`/users/${userId}`),
  updateProfile: async (userId: string, data: any) => api.put(`/users/${userId}`, data),
  updateLocation: async (userId: string, latitude: number, longitude: number) =>
    api.post(`/users/update-location/${userId}`, { latitude, longitude }),
  getNearbyProfessionals: async (
    userType: string,
    latitude: number,
    longitude: number,
    radius: number = 10
  ) => api.get(`/users/nearby/professionals/${userType}`, { params: { latitude, longitude, radius } }),
  getNearbyAmbulances: async (
    latitude: number,
    longitude: number,
    radius: number = 10
  ) => api.get('/users/nearby/ambulances', { params: { latitude, longitude, radius } }),
  getNearbyVolunteers: async (
    latitude: number,
    longitude: number,
    radius: number = 10
  ) => api.get('/users/nearby/volunteers', { params: { latitude, longitude, radius } }),
  // Profile & Documents
  uploadDocument: async (userId: string, documentData: FormData) =>
    api.post(`/users/${userId}/documents`, documentData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDocuments: async (userId: string) => api.get(`/users/${userId}/documents`),
  deleteDocument: async (userId: string, documentId: string) =>
    api.delete(`/users/${userId}/documents/${documentId}`),
  // Payment Methods
  addPaymentMethod: async (userId: string, paymentData: any) =>
    api.post(`/users/${userId}/payment-methods`, paymentData),
  getPaymentMethods: async (userId: string) => api.get(`/users/${userId}/payment-methods`),
  updatePaymentMethod: async (userId: string, methodId: string, data: any) =>
    api.put(`/users/${userId}/payment-methods/${methodId}`, data),
  deletePaymentMethod: async (userId: string, methodId: string) =>
    api.delete(`/users/${userId}/payment-methods/${methodId}`),
  setDefaultPayment: async (userId: string, methodId: string) =>
    api.post(`/users/${userId}/payment-methods/${methodId}/set-default`),
  // Transactions & Order History
  getTransactionHistory: async (userId: string, filter?: string) =>
    api.get(`/users/${userId}/transactions`, { params: { filter } }),
  getOrderHistory: async (userId: string, filter?: string) =>
    api.get(`/users/${userId}/orders`, { params: { filter } }),
};

// Appointments API calls
export const appointmentsAPI = {
  bookAppointment: async (appointmentData: any) => api.post('/appointments/book', appointmentData),
  getUserAppointments: async (userId: string) => api.get(`/appointments/user/${userId}`),
  getUpcomingAppointments: async (userId: string) => api.get(`/appointments/upcoming/${userId}`),
  updateAppointmentStatus: async (appointmentId: string, status: string) =>
    api.put(`/appointments/${appointmentId}`, { status }),
  cancelAppointment: async (appointmentId: string) =>
    api.post(`/appointments/${appointmentId}/cancel`, {}),
  rescheduleAppointment: async (appointmentId: string, appointmentDate: string, timeSlot: string) =>
    api.post(`/appointments/${appointmentId}/reschedule`, { appointmentDate, timeSlot }),
};

// Booking API calls (Ambulance & Services)
export const bookingAPI = {
  bookService: async (bookingData: any) => api.post('/booking/book', bookingData),
  getUserBookings: async (userId: string) => api.get(`/booking/user/${userId}`),
  updateBookingStatus: async (bookingId: string, status: string, paymentStatus?: string) =>
    api.put(`/booking/${bookingId}`, { status, paymentStatus }),
  getNearbyAmbulances: async (latitude: number, longitude: number, radius: number = 10) =>
    api.get('/booking/nearby-ambulances', { params: { latitude, longitude, radius } }),
  cancelBooking: async (bookingId: string) =>
    api.post(`/booking/${bookingId}/cancel`, {}),
};

// Emergency API calls
export const emergencyAPI = {
  triggerEmergency: async (emergencyData: any) => api.post('/emergency/trigger', emergencyData),
  getNearbyEmergencies: async (latitude: number, longitude: number, radius: number = 5) =>
    api.get('/emergency/nearby', { params: { latitude, longitude, radius } }),
  getEmergencyDetails: async (emergencyId: string) => api.get(`/emergency/${emergencyId}`),
  updateEmergencyStatus: async (emergencyId: string, status: string) =>
    api.put(`/emergency/${emergencyId}`, { status }),
};

// Location API calls
export const locationAPI = {
  updateLocation: async (latitude: number, longitude: number, address: string, accuracy: number, emergencyId?: string) =>
    api.post('/location/update', { latitude, longitude, address, accuracy, emergencyId }),
  getLocationHistory: async (userId: string) => api.get(`/location/history/${userId}`),
  getCurrentLocation: async (userId: string) => api.get(`/location/current/${userId}`),
};

export default api;
