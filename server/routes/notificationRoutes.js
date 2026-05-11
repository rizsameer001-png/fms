// const express = require('express');
// const router = express.Router();
// const {
//   getNotifications,
//   markAsRead,
//   markAllAsRead,
//   deleteNotification
// } = require('../controllers/notificationController');
// const { protect } = require('../middleware/auth');

// router.get('/', protect, getNotifications);
// router.put('/read-all', protect, markAllAsRead);
// router.put('/:id/read', protect, markAsRead);
// router.delete('/:id', protect, deleteNotification);

// module.exports = router;


const express = require('express');
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,

  // 🔔 NEW
  sendNotificationToUser,
  sendNotificationToRole

} = require('../controllers/notificationController');

const { protect } = require('../middleware/auth');


// ================= EXISTING =================
router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);


// ================= 🔔 NEW FCM ROUTES =================

// Send to single user
router.post('/send/:userId', protect, sendNotificationToUser);

// Send to role (e.g. all technicians)
router.post('/send-role', protect, sendNotificationToRole);


module.exports = router;