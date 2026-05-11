const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoiceStatus,
  recordPayment
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoice);
router.post('/', protect, authorize('super_admin'), createInvoice);
router.put('/:id/status', protect, authorize('super_admin'), updateInvoiceStatus);
router.post('/:id/payment', protect, recordPayment);

module.exports = router;
