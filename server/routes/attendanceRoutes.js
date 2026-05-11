const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/checkin', protect, authorize('technician', 'supervisor'), checkIn);
router.post('/checkout', protect, authorize('technician', 'supervisor'), checkOut);
router.get('/', protect, getAttendance);
router.get('/stats', protect, authorize('super_admin', 'manager', 'supervisor'), getAttendanceStats);

module.exports = router;
