// const express = require('express');
// const router = express.Router();
// const {
//   getUsers,
//   getUser,
//   createUser,
//   updateUser,
//   deleteUser,
//   getTechniciansByBuilding,
//   updateLocation,
//   getOnlineUsers
// } = require('../controllers/userController');
// const { protect, authorize } = require('../middleware/auth');

// router.get('/', protect, authorize('super_admin', 'manager', 'supervisor'), getUsers);
// router.get('/online', protect, authorize('super_admin', 'manager', 'supervisor'), getOnlineUsers);
// router.get('/technicians/:buildingId', protect, getTechniciansByBuilding);
// router.get('/:id', protect, getUser);
// router.post('/', protect, authorize('super_admin', 'manager'), createUser);
// router.put('/:id', protect, authorize('super_admin', 'manager'), updateUser);
// router.delete('/:id', protect, authorize('super_admin'), deleteUser);
// router.put('/location', protect, updateLocation);

// module.exports = router;

const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getTechniciansByBuilding,
  updateLocation,
  getOnlineUsers,

  // 🔔 NEW CONTROLLERS
  saveFcmToken,
  removeFcmToken

} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');


// ================= EXISTING ROUTES =================
router.get('/', protect, authorize('super_admin', 'manager', 'supervisor'), getUsers);
router.get('/online', protect, authorize('super_admin', 'manager', 'supervisor'), getOnlineUsers);
router.get('/technicians/:buildingId', protect, getTechniciansByBuilding);
router.get('/:id', protect, getUser);

router.post('/', protect, authorize('super_admin', 'manager'), createUser);
router.put('/:id', protect, authorize('super_admin', 'manager'), updateUser);
router.delete('/:id', protect, authorize('super_admin'), deleteUser);

router.put('/location', protect, updateLocation);


// ================= 🔔 FCM ROUTES =================

// ✅ Save FCM Token (after login)
router.post('/save-token', protect, saveFcmToken);

// ❌ Remove token (logout / invalid)
router.post('/remove-token', protect, removeFcmToken);


module.exports = router;