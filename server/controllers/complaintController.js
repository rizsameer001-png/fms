// const Complaint = require('../models/Complaint');
// const User = require('../models/User');
// const { generateTicketNumber } = require('../utils/helpers');

// // @desc    Get all complaints
// // @route   GET /api/complaints
// // @access  Private
// exports.getComplaints = async (req, res) => {
//   try {
//     const { status, priority, category, building, assignedTo, page = 1, limit = 20 } = req.query;

//     let query = {};

//     // Role-based filtering
//     if (req.user.role === 'customer') {
//       query.reportedBy = req.user.id;
//     } else if (req.user.role === 'technician') {
//       query.assignedTo = req.user.id;
//     } else if (req.user.role === 'supervisor') {
//       query.building = { $in: req.user.assignedBuildings };
//     } else if (req.user.role === 'manager') {
//       query.building = { $in: req.user.assignedBuildings };
//     }

//     // Query filters
//     if (status) query.status = status;
//     if (priority) query.priority = priority;
//     if (category) query.category = category;
//     if (building) query.building = building;
//     if (assignedTo) query.assignedTo = assignedTo;

//     const complaints = await Complaint.find(query)
//       .populate('reportedBy', 'name email phone')
//       .populate('assignedTo', 'name email phone staffType')
//       .populate('building', 'name code')
//       .populate('floor', 'name number')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const count = await Complaint.countDocuments(query);

//     res.json({
//       success: true,
//       data: complaints,
//       pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get single complaint
// // @route   GET /api/complaints/:id
// // @access  Private
// exports.getComplaint = async (req, res) => {
//   try {
//     const complaint = await Complaint.findById(req.params.id)
//       .populate('reportedBy', 'name email phone')
//       .populate('assignedTo', 'name email phone staffType')
//       .populate('assignedBy', 'name email')
//       .populate('building', 'name code address')
//       .populate('floor', 'name number')
//       .populate('escalatedTo', 'name email role')
//       .populate('resolution.resolvedBy', 'name email')
//       .populate('resolution.verifiedBy', 'name email')
//       .populate('timeline.updatedBy', 'name email');

//     if (!complaint) {
//       return res.status(404).json({ success: false, message: 'Complaint not found' });
//     }

//     res.json({ success: true, data: complaint });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Create complaint
// // @route   POST /api/complaints
// // @access  Private
// exports.createComplaint = async (req, res) => {
//   try {
//     const { building, floor, zone, room, category, priority, title, description, attachments } = req.body;

//     const ticketNumber = generateTicketNumber();

//     // Set SLA deadline based on priority
//     const slaHours = { low: 72, medium: 24, high: 8, critical: 2 }[priority || 'medium'];
//     const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

//     const complaint = await Complaint.create({
//       ticketNumber,
//       reportedBy: req.user.id,
//       reporterType: req.user.role,
//       building,
//       floor,
//       zone,
//       room,
//       category,
//       priority: priority || 'medium',
//       title,
//       description,
//       slaHours,
//       slaDeadline,
//       attachments: attachments || []
//     });

//     // TODO: Emit socket event for real-time notification
//     // TODO: Send notification to supervisors of this building

//     res.status(201).json({
//       success: true,
//       data: await Complaint.findById(complaint._id)
//         .populate('reportedBy', 'name email')
//         .populate('building', 'name code')
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Assign complaint
// // @route   PUT /api/complaints/:id/assign
// // @access  Private (Supervisor, Manager, Admin)
// exports.assignComplaint = async (req, res) => {
//   try {
//     const { technicianId } = req.body;

//     const complaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       {
//         assignedTo: technicianId,
//         assignedBy: req.user.id,
//         assignedAt: new Date(),
//         status: 'assigned',
//         _updatedBy: req.user.id
//       },
//       { new: true }
//     ).populate('assignedTo', 'name email phone staffType');

//     if (!complaint) {
//       return res.status(404).json({ success: false, message: 'Complaint not found' });
//     }

//     // TODO: Notify technician

//     res.json({ success: true, data: complaint });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Update complaint status
// // @route   PUT /api/complaints/:id/status
// // @access  Private
// exports.updateStatus = async (req, res) => {
//   try {
//     const { status, note } = req.body;

//     const updateData = { status, _updatedBy: req.user.id };

//     if (status === 'resolved') {
//       updateData['resolution.resolvedBy'] = req.user.id;
//       updateData['resolution.resolvedAt'] = new Date();
//       updateData['resolution.note'] = note;
//     }

//     if (status === 'verified') {
//       updateData['resolution.verifiedBy'] = req.user.id;
//       updateData['resolution.verifiedAt'] = new Date();
//     }

//     const complaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );

//     if (!complaint) {
//       return res.status(404).json({ success: false, message: 'Complaint not found' });
//     }

//     res.json({ success: true, data: complaint });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Escalate complaint
// // @route   PUT /api/complaints/:id/escalate
// // @access  Private (Supervisor, Manager)
// exports.escalateComplaint = async (req, res) => {
//   try {
//     const { escalatedTo, reason } = req.body;

//     const complaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       {
//         status: 'escalated',
//         escalatedTo,
//         escalationReason: reason,
//         escalatedAt: new Date(),
//         _updatedBy: req.user.id
//       },
//       { new: true }
//     );

//     if (!complaint) {
//       return res.status(404).json({ success: false, message: 'Complaint not found' });
//     }

//     res.json({ success: true, data: complaint });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Add customer feedback
// // @route   PUT /api/complaints/:id/feedback
// // @access  Private (Customer)
// exports.addFeedback = async (req, res) => {
//   try {
//     const { rating, feedback } = req.body;

//     const complaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       { customerRating: rating, customerFeedback: feedback },
//       { new: true }
//     );

//     if (!complaint) {
//       return res.status(404).json({ success: false, message: 'Complaint not found' });
//     }

//     res.json({ success: true, data: complaint });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get complaint statistics
// // @route   GET /api/complaints/stats/overview
// // @access  Private (Admin, Manager)
// exports.getComplaintStats = async (req, res) => {
//   try {
//     let matchQuery = {};
//     if (req.user.role === 'manager') {
//       matchQuery.building = { $in: req.user.assignedBuildings };
//     }

//     const stats = await Complaint.aggregate([
//       { $match: matchQuery },
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const priorityStats = await Complaint.aggregate([
//       { $match: matchQuery },
//       {
//         $group: {
//           _id: '$priority',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const categoryStats = await Complaint.aggregate([
//       { $match: matchQuery },
//       {
//         $group: {
//           _id: '$category',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // SLA breach count
//     const slaBreaches = await Complaint.countDocuments({
//       ...matchQuery,
//       status: { $nin: ['closed', 'verified'] },
//       slaDeadline: { $lt: new Date() }
//     });

//     res.json({
//       success: true,
//       data: {
//         statusStats: stats,
//         priorityStats,
//         categoryStats,
//         slaBreaches
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { generateTicketNumber } = require('../utils/helpers');

// ✅🔥 FIX: add mongoose for ObjectId validation
const mongoose = require('mongoose');


// @desc    Get all complaints
exports.getComplaints = async (req, res) => {
  try {
    const { status, priority, category, building, assignedTo, page = 1, limit = 20 } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'customer') {
      query.reportedBy = req.user.id;
    } else if (req.user.role === 'technician') {
      query.assignedTo = req.user.id;
    } else if (req.user.role === 'supervisor' || req.user.role === 'manager') {
      query.building = { $in: req.user.assignedBuildings };
    }

    // Query filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    // ✅🔥 FIX: validate building before using it
    if (building && mongoose.Types.ObjectId.isValid(building)) {
      query.building = building;
    }

    // ✅🔥 FIX: validate assignedTo
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = assignedTo;
    }

    const complaints = await Complaint.find(query)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email phone staffType')
      .populate('building', 'name code')
      .populate('floor', 'name number')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Complaint.countDocuments(query);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get single complaint
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email phone staffType')
      .populate('assignedBy', 'name email')
      .populate('building', 'name code address')
      .populate('floor', 'name number')
      .populate('escalatedTo', 'name email role')
      .populate('resolution.resolvedBy', 'name email')
      .populate('resolution.verifiedBy', 'name email')
      .populate('timeline.updatedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, data: complaint });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Create complaint
exports.createComplaint = async (req, res) => {
  try {
    let {
      building,
      floor,
      zone,
      room,
      category,
      priority,
      title,
      description,
      attachments
    } = req.body;

    // ✅🔥🔥🔥 CRITICAL FIX: CLEAN EMPTY STRINGS
    //let { building, floor, zone, room, category, priority, title, description, attachments } = req.body;
    // if (building === "") building = null;
    if (!building || !mongoose.Types.ObjectId.isValid(building)) {
        return res.status(400).json({
          success: false,
          message: "Building is required and must be valid"
        });
      }
    // if (floor === "") floor = null;
      if (floor && !mongoose.Types.ObjectId.isValid(floor)) {
        return res.status(400).json({
          success: false,
          message: "Invalid floor ID"
        });
      }

    // ✅🔥 VALIDATE ObjectId
    if (building && !mongoose.Types.ObjectId.isValid(building)) {
      return res.status(400).json({
        success: false,
        message: "Invalid building ID"
      });
    }

    if (floor && !mongoose.Types.ObjectId.isValid(floor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid floor ID"
      });
    }

    const ticketNumber = generateTicketNumber();

    const slaHours = {
      low: 72,
      medium: 24,
      high: 8,
      critical: 2
    }[priority || 'medium'];

    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const complaint = await Complaint.create({
      ticketNumber,
      reportedBy: req.user.id,
      reporterType: req.user.role,
      building,   // ✅ now safe
      floor,      // ✅ now safe
      zone,
      room,
      category,
      priority: priority || 'medium',
      title,
      description,
      slaHours,
      slaDeadline,
      attachments: attachments || []
    });

    res.status(201).json({
      success: true,
      data: await Complaint.findById(complaint._id)
        .populate('reportedBy', 'name email')
        .populate('building', 'name code')
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Assign complaint
exports.assignComplaint = async (req, res) => {
  try {
    const { technicianId } = req.body;

    // ✅🔥 validate technicianId
    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid technician ID"
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: technicianId,
        assignedBy: req.user.id,
        assignedAt: new Date(),
        status: 'assigned',
        _updatedBy: req.user.id
      },
      { new: true }
    ).populate('assignedTo', 'name email phone staffType');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, data: complaint });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Update complaint status
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const updateData = { status, _updatedBy: req.user.id };

    if (status === 'resolved') {
      updateData['resolution.resolvedBy'] = req.user.id;
      updateData['resolution.resolvedAt'] = new Date();
      updateData['resolution.note'] = note;
    }

    if (status === 'verified') {
      updateData['resolution.verifiedBy'] = req.user.id;
      updateData['resolution.verifiedAt'] = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, data: complaint });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// // @desc    Escalate complaint
// exports.escalateComplaint = async (req, res) => {
//   try {
//     const { escalatedTo, reason } = req.body;

//     // ✅🔥 validate escalatedTo
//     if (!mongoose.Types.ObjectId.isValid(escalatedTo)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid escalated user ID"
//       });
//     }

//     const complaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       {
//         status: 'escalated',
//         escalatedTo,
//         escalationReason: reason,
//         escalatedAt: new Date(),
//         _updatedBy: req.user.id
//       },
//       { new: true }
//     );

//     if (!complaint) {
//       return res.status(404).json({ success: false, message: 'Complaint not found' });
//     }

//     res.json({ success: true, data: complaint });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// // @desc    Add customer feedback
// exports.addFeedback = async (req, res) => {
//   try {
//     const { rating, feedback } = req.body;

//     const complaint = await Complaint.findByIdAndUpdate(
//       req.params.id,
//       { customerRating: rating, customerFeedback: feedback },
//       { new: true }
//     );

//     if (!complaint) {
//       return res.status(404).json({ success: false, message: 'Complaint not found' });
//     }

//     res.json({ success: true, data: complaint });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// @desc    Get complaint stats
exports.getComplaintStats = async (req, res) => {
  try {
    let matchQuery = {};

    // Role-based filtering
    if (req.user.role === 'manager') {
      matchQuery.building = { $in: req.user.assignedBuildings };
    } else if (req.user.role === 'supervisor') {
      matchQuery.building = { $in: req.user.assignedBuildings };
    } else if (req.user.role === 'technician') {
      matchQuery.assignedTo = req.user.id;
    }

    const stats = await Complaint.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      open: 0,
      assigned: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      escalated: 0
    };

    stats.forEach(item => {
      formattedStats[item._id] = item.count;
    });

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.escalateComplaint = async (req, res) => {
  try {
    const { escalatedTo, reason } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: 'escalated',
        escalatedTo,
        escalationReason: reason,
        escalatedAt: new Date(),
        _updatedBy: req.user.id
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Add customer feedback
exports.addFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        customerRating: rating,
        customerFeedback: feedback
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};