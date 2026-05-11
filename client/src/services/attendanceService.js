import api from './api';

export const attendanceAPI = {
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (data) => api.post('/attendance/checkout', data),
  getAttendance: (params) => api.get('/attendance', { params }),
  getAttendanceStats: (params) => api.get('/attendance/stats', { params }),
};
