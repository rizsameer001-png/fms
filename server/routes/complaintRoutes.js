// const express = require('express');
// const router = express.Router();
// const {
//   getComplaints,
//   getComplaint,
//   createComplaint,
//   assignComplaint,
//   updateStatus,
//   escalateComplaint,
//   addFeedback,
//   getComplaintStats
// } = require('../controllers/complaintController');
// const { protect, authorize } = require('../middleware/auth');

// router.get('/', protect, getComplaints);
// router.get('/stats/overview', protect, authorize('super_admin', 'manager'), getComplaintStats);
// router.get('/:id', protect, getComplaint);
// router.post('/', protect, createComplaint);
// router.put('/:id/assign', protect, authorize('super_admin', 'manager', 'supervisor'), assignComplaint);
// router.put('/:id/status', protect, updateStatus);
// router.put('/:id/escalate', protect, authorize('super_admin', 'manager', 'supervisor'), escalateComplaint);
// router.put('/:id/feedback', protect, authorize('customer'), addFeedback);

// module.exports = router;

const express = require('express');
const router = express.Router();

const complaintController = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, complaintController.getComplaints);

router.get(
  '/stats/overview',
  protect,
  authorize('super_admin', 'manager'),
  complaintController.getComplaintStats
);

router.get('/:id', protect, complaintController.getComplaint);

router.post('/', protect, complaintController.createComplaint);

router.put(
  '/:id/assign',
  protect,
  authorize('super_admin', 'manager', 'supervisor'),
  complaintController.assignComplaint
);

router.put('/:id/status', protect, complaintController.updateStatus);

router.put(
  '/:id/escalate',
  protect,
  authorize('super_admin', 'manager', 'supervisor'),
  complaintController.escalateComplaint
);

router.put(
  '/:id/feedback',
  protect,
  authorize('customer'),
  complaintController.addFeedback
);

module.exports = router;