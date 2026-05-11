const Approval = require('../models/Approval');
const User = require('../models/User');

// @desc    Get all approval requests
// @route   GET /api/approvals
// @access  Private
exports.getApprovals = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'technician' || req.user.role === 'supervisor') {
      query.requestedBy = req.user.id;
    } else if (req.user.role === 'manager') {
      // Approvals where manager is in approvers list
      query['approvers.user'] = req.user.id;
    }

    if (type) query.type = type;
    if (status) query.overallStatus = status;

    const approvals = await Approval.find(query)
      .populate('requestedBy', 'name email role staffType')
      .populate('approvers.user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Approval.countDocuments(query);

    res.json({
      success: true,
      data: approvals,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single approval
// @route   GET /api/approvals/:id
// @access  Private
exports.getApproval = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id)
      .populate('requestedBy', 'name email role staffType')
      .populate('approvers.user', 'name email role');

    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create approval request
// @route   POST /api/approvals
// @access  Private
exports.createApproval = async (req, res) => {
  try {
    const { type, title, description, leaveDetails, overtimeDetails, expenseDetails } = req.body;

    // Determine approvers based on hierarchy
    const requester = await User.findById(req.user.id).populate('reportsTo');
    let approvers = [];
    let level = 1;

    // Build approver chain: Supervisor -> Manager -> Admin
    if (requester.reportsTo) {
      approvers.push({ user: requester.reportsTo._id, level: level++ });

      const manager = await User.findById(requester.reportsTo._id).populate('reportsTo');
      if (manager && manager.reportsTo) {
        approvers.push({ user: manager.reportsTo._id, level: level++ });
      }
    }

    const approval = await Approval.create({
      type,
      requestedBy: req.user.id,
      title,
      description,
      leaveDetails,
      overtimeDetails,
      expenseDetails,
      approvers
    });

    // TODO: Notify first approver

    res.status(201).json({
      success: true,
      data: await Approval.findById(approval._id)
        .populate('requestedBy', 'name email')
        .populate('approvers.user', 'name email')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject request
// @route   PUT /api/approvals/:id/action
// @access  Private
exports.approveReject = async (req, res) => {
  try {
    const { action, comment } = req.body; // action: 'approved' or 'rejected'

    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    // Find current user's approver entry
    const approverIndex = approval.approvers.findIndex(
      a => a.user.toString() === req.user.id && a.status === 'pending'
    );

    if (approverIndex === -1) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this request' });
    }

    // Update approver status
    approval.approvers[approverIndex].status = action;
    approval.approvers[approverIndex].comment = comment;
    approval.approvers[approverIndex].actionAt = new Date();

    // Check if rejected
    if (action === 'rejected') {
      approval.overallStatus = 'rejected';
    } else {
      // Check if all approvers have approved
      const allApproved = approval.approvers.every(a => a.status === 'approved');
      if (allApproved) {
        approval.overallStatus = 'approved';
      } else {
        approval.currentLevel++;
        // TODO: Notify next approver
      }
    }

    await approval.save();

    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
