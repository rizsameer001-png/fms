const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },

  // Billing Period
  billingPeriod: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },

  // Line Items
  items: [{
    service: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    amount: { type: Number, required: true },
    gstRate: { type: Number, default: 18 },
    gstAmount: { type: Number }
  }],

  subTotal: { type: Number, required: true },
  totalGst: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  // Payment
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partial'],
    default: 'draft'
  },

  payments: [{
    amount: { type: Number, required: true },
    method: { type: String, enum: ['razorpay', 'upi', 'net_banking', 'card', 'cash', 'cheque'] },
    transactionId: { type: String },
    paidAt: { type: Date, default: Date.now },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String }
  }],

  paidAmount: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },

  // PDF
  pdfUrl: { type: String },

  notes: { type: String },
  terms: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
