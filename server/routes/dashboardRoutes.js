const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getManagerDashboard,
  getSupervisorDashboard,
  getTechnicianDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('super_admin'), getAdminDashboard);
router.get('/manager', protect, authorize('manager'), getManagerDashboard);
router.get('/supervisor', protect, authorize('supervisor'), getSupervisorDashboard);
router.get('/technician', protect, authorize('technician'), getTechnicianDashboard);

module.exports = router;
