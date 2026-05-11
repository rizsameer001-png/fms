const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  webhook
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;
