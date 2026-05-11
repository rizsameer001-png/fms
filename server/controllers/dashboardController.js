const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Invoice = require('../models/Invoice');
const Building = require('../models/Building');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private (Super Admin)
exports.getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalBuildings = await Building.countDocuments({ isActive: true });
    const totalCustomers = await User.countDocuments({ role: 'customer', isActive: true });
    const totalTechnicians = await User.countDocuments({ role: 'technician', isActive: true });

    // Complaints
    const openComplaints = await Complaint.countDocuments({ status: { $in: ['open', 'assigned', 'in_progress'] } });
    const resolvedComplaints = await Complaint.countDocuments({ status: { $in: ['resolved', 'verified', 'closed'] } });
    const slaBreaches = await Complaint.countDocuments({
      status: { $nin: ['closed', 'verified'] },
      slaDeadline: { $lt: new Date() }
    });

    // Revenue
    const revenueStats = await Invoice.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);
    const totalRevenue = revenueStats[0]?.total || 0;

    // Attendance today
    const todayAttendance = await Attendance.countDocuments({ date: today });
    const presentToday = await Attendance.countDocuments({ date: today, status: { $in: ['present', 'late'] } });

    // Recent complaints
    const recentComplaints = await Complaint.find()
      .populate('reportedBy', 'name')
      .populate('building', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Online technicians
    const onlineTechnicians = await User.countDocuments({ role: 'technician', isOnline: true, isActive: true });

    res.json({
      success: true,
      data: {
        counts: { totalUsers, totalBuildings, totalCustomers, totalTechnicians },
        complaints: { open: openComplaints, resolved: resolvedComplaints, slaBreaches },
        revenue: { total: totalRevenue, period: '30 days' },
        attendance: { today: todayAttendance, present: presentToday },
        onlineTechnicians,
        recentComplaints
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get manager dashboard stats
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
exports.getManagerDashboard = async (req, res) => {
  try {
    const buildingIds = req.user.assignedBuildings;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Team stats
    const teamMembers = await User.countDocuments({
      assignedBuildings: { $in: buildingIds },
      isActive: true
    });

    // Complaints
    const openComplaints = await Complaint.countDocuments({
      building: { $in: buildingIds },
      status: { $in: ['open', 'assigned', 'in_progress'] }
    });

    const overdueComplaints = await Complaint.countDocuments({
      building: { $in: buildingIds },
      status: { $nin: ['closed', 'verified'] },
      slaDeadline: { $lt: new Date() }
    });

    // Tasks
    const pendingTasks = await Task.countDocuments({
      building: { $in: buildingIds },
      status: { $in: ['pending', 'in_progress'] }
    });

    // Attendance
    const todayAttendance = await Attendance.countDocuments({
      date: today,
      user: {
        $in: (await User.find({ assignedBuildings: { $in: buildingIds } }).select('_id')).map(u => u._id)
      }
    });

    // Team performance
    const teamPerformance = await Complaint.aggregate([
      { $match: { building: { $in: buildingIds }, status: 'closed' } },
      {
        $group: {
          _id: '$assignedTo',
          completed: { $sum: 1 },
          avgResolutionTime: {
            $avg: {
              $subtract: ['$resolution.resolvedAt', '$createdAt']
            }
          }
        }
      },
      { $sort: { completed: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        teamMembers,
        complaints: { open: openComplaints, overdue: overdueComplaints },
        pendingTasks,
        todayAttendance,
        teamPerformance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get supervisor dashboard stats
// @route   GET /api/dashboard/supervisor
// @access  Private (Supervisor)
exports.getSupervisorDashboard = async (req, res) => {
  try {
    const buildingIds = req.user.assignedBuildings;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Team attendance
    const technicians = await User.find({
      role: 'technician',
      assignedBuildings: { $in: buildingIds },
      isActive: true
    }).select('_id');

    const techIds = technicians.map(t => t._id);

    const attendanceToday = await Attendance.find({
      user: { $in: techIds },
      date: today
    }).populate('user', 'name email staffType');

    // Active tasks
    const activeTasks = await Task.find({
      assignedTo: { $in: techIds },
      status: { $in: ['pending', 'in_progress'] }
    }).populate('assignedTo', 'name email').populate('building', 'name code');

    // Complaints needing attention
    const urgentComplaints = await Complaint.find({
      building: { $in: buildingIds },
      status: { $in: ['open', 'assigned'] },
      priority: { $in: ['high', 'critical'] }
    }).populate('reportedBy', 'name').populate('building', 'name code');

    // Online technicians
    const onlineTechs = await User.find({
      _id: { $in: techIds },
      isOnline: true
    }).select('name email currentLocation staffType');

    res.json({
      success: true,
      data: {
        attendanceToday,
        activeTasks,
        urgentComplaints,
        onlineTechs,
        totalTechnicians: techIds.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get technician dashboard stats
// @route   GET /api/dashboard/technician
// @access  Private (Technician)
exports.getTechnicianDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's attendance
    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: today
    });

    // Assigned tasks
    const tasks = await Task.find({
      assignedTo: { $in: [req.user.id] },
      status: { $in: ['pending', 'in_progress'] }
    }).populate('building', 'name code');

    // Assigned complaints
    const complaints = await Complaint.find({
      assignedTo: req.user.id,
      status: { $in: ['assigned', 'in_progress'] }
    }).populate('building', 'name code');

    // Notifications
    const unreadNotifications = await require('../models/Notification').countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        attendance,
        tasks,
        complaints,
        unreadNotifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
