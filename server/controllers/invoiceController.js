const Invoice = require('../models/Invoice');
const User = require('../models/User');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const { status, customer, page = 1, limit = 20 } = req.query;

    let query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    }

    if (status) query.status = status;
    if (customer) query.customer = customer;

    const invoices = await Invoice.find(query)
      .populate('customer', 'name email companyName')
      .populate('building', 'name code')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data: invoices,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone companyName billingAddress')
      .populate('building', 'name code address');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Private (Admin)
exports.createInvoice = async (req, res) => {
  try {
    const { customer, building, billingPeriod, items, dueDate, notes, terms } = req.body;

    // Calculate totals
    let subTotal = 0;
    let totalGst = 0;

    const processedItems = items.map(item => {
      const amount = item.quantity * item.unitPrice;
      const gstAmount = (amount * (item.gstRate || 18)) / 100;
      subTotal += amount;
      totalGst += gstAmount;
      return { ...item, amount, gstAmount };
    });

    const totalAmount = subTotal + totalGst;
    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      customer,
      building,
      billingPeriod,
      items: processedItems,
      subTotal,
      totalGst,
      totalAmount,
      balanceDue: totalAmount,
      dueDate,
      notes,
      terms,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: await Invoice.findById(invoice._id).populate('customer', 'name email')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Private (Admin)
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record payment
// @route   POST /api/invoices/:id/payment
// @access  Private
exports.recordPayment = async (req, res) => {
  try {
    const { amount, method, transactionId, razorpayOrderId, razorpayPaymentId } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.payments.push({
      amount,
      method,
      transactionId,
      razorpayOrderId,
      razorpayPaymentId
    });

    invoice.paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;

    if (invoice.balanceDue <= 0) {
      invoice.status = 'paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
