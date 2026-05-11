const Razorpay = require('razorpay');
const Invoice = require('../models/Invoice');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice already paid' });
    }

    const options = {
      amount: Math.round(invoice.balanceDue * 100),
      currency: 'INR',
      receipt: invoice.invoiceNumber,
      notes: {
        invoiceId: invoice._id.toString(),
        customerId: invoice.customer.toString(),
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        invoiceId: invoice._id,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment and update invoice
// @route   POST /api/payments/verify
// @access  Public
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    const invoiceId = order.notes?.invoiceId;

    if (!invoiceId) {
      return res.status(400).json({ success: false, message: 'Invoice ID not found in order' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const paymentAmount = order.amount / 100;

    invoice.payments.push({
      amount: paymentAmount,
      method: 'razorpay',
      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    invoice.paidAmount += paymentAmount;
    invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;
    invoice.status = invoice.balanceDue <= 0 ? 'paid' : 'partial';

    await invoice.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    let query = {};
    if (req.user.role === 'customer') {
      const invoices = await Invoice.find({ customer: req.user.id }).select('_id');
      query._id = { $in: invoices.map(i => i._id) };
    }

    const invoices = await Invoice.find(query)
      .populate('customer', 'name email')
      .populate('building', 'name')
      .select('invoiceNumber payments status totalAmount paidAmount')
      .sort({ 'payments.paidAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const payments = [];
    invoices.forEach(inv => {
      inv.payments.forEach(pay => {
        payments.push({
          _id: pay._id,
          invoiceNumber: inv.invoiceNumber,
          customer: inv.customer,
          amount: pay.amount,
          method: pay.method,
          transactionId: pay.transactionId,
          status: inv.status,
          paidAt: pay.paidAt,
        });
      });
    });

    res.json({
      success: true,
      data: payments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: payments.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Razorpay webhook handler
// @route   POST /api/payments/webhook
// @access  Public
exports.webhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body;

    if (event.event === 'payment.captured') {
      const { order_id, id: payment_id } = event.payload.payment.entity;

      const order = await razorpay.orders.fetch(order_id);
      const invoiceId = order.notes?.invoiceId;

      if (invoiceId) {
        const invoice = await Invoice.findById(invoiceId);
        if (invoice && invoice.status !== 'paid') {
          invoice.payments.push({
            amount: event.payload.payment.entity.amount / 100,
            method: 'razorpay',
            transactionId: payment_id,
            razorpayOrderId: order_id,
            razorpayPaymentId: payment_id,
          });

          invoice.paidAmount += event.payload.payment.entity.amount / 100;
          invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;
          invoice.status = invoice.balanceDue <= 0 ? 'paid' : 'partial';
          await invoice.save();
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
