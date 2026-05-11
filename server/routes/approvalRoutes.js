const express = require('express');
const router = express.Router();
const {
  getApprovals,
  getApproval,
  createApproval,
  approveReject
} = require('../controllers/approvalController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getApprovals);
router.get('/:id', protect, getApproval);
router.post('/', protect, createApproval);
router.put('/:id/action', protect, approveReject);

module.exports = router;
