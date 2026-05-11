// const Notification = require('../models/Notification');

// // @desc    Get notifications
// // @route   GET /api/notifications
// // @access  Private
// exports.getNotifications = async (req, res) => {
//   try {
//     const { isRead, type, page = 1, limit = 20 } = req.query;

//     let query = { recipient: req.user.id };
//     if (isRead !== undefined) query.isRead = isRead === 'true';
//     if (type) query.type = type;

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const unreadCount = await Notification.countDocuments({
//       recipient: req.user.id,
//       isRead: false
//     });

//     res.json({
//       success: true,
//       data: notifications,
//       unreadCount,
//       pagination: { page: parseInt(page), limit: parseInt(limit) }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Mark notification as read
// // @route   PUT /api/notifications/:id/read
// // @access  Private
// exports.markAsRead = async (req, res) => {
//   try {
//     const notification = await Notification.findOneAndUpdate(
//       { _id: req.params.id, recipient: req.user.id },
//       { isRead: true, readAt: new Date() },
//       { new: true }
//     );

//     if (!notification) {
//       return res.status(404).json({ success: false, message: 'Notification not found' });
//     }

//     res.json({ success: true, data: notification });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Mark all as read
// // @route   PUT /api/notifications/read-all
// // @access  Private
// exports.markAllAsRead = async (req, res) => {
//   try {
//     await Notification.updateMany(
//       { recipient: req.user.id, isRead: false },
//       { isRead: true, readAt: new Date() }
//     );

//     res.json({ success: true, message: 'All notifications marked as read' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Delete notification
// // @route   DELETE /api/notifications/:id
// // @access  Private
// exports.deleteNotification = async (req, res) => {
//   try {
//     await Notification.findOneAndDelete({
//       _id: req.params.id,
//       recipient: req.user.id
//     });

//     res.json({ success: true, message: 'Notification deleted' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const Notification = require('../models/Notification');
const User = require('../models/User');
const admin = require('../config/firebase');


// =====================================================
// 🔔 HELPER FUNCTION (DB + FCM TOGETHER)
// =====================================================
const sendNotification = async ({ userId, title, message, type = 'general' }) => {
  try {
    // 1️⃣ Save in DB
    const notification = await Notification.create({
      recipient: userId,
      title,
      message,
      type
    });

    // 2️⃣ Get user FCM tokens
    const user = await User.findById(userId);

    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      return notification; // no push, only DB
    }

    const tokens = user.fcmTokens.map(t => t.token);

    // 3️⃣ Send FCM push
    const response = await admin.messaging().sendEachForMulticast({
      notification: {
        title,
        body: message
      },
      tokens
    });

    // 4️⃣ Remove invalid tokens
    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
      }
    });

    if (failedTokens.length > 0) {
      user.fcmTokens = user.fcmTokens.filter(
        t => !failedTokens.includes(t.token)
      );
      await user.save();
    }

    return notification;

  } catch (error) {
    console.error("Notification Error:", error);
  }
};


// =====================================================
// 📥 GET NOTIFICATIONS (UNCHANGED)
// =====================================================
exports.getNotifications = async (req, res) => {
  try {
    const { isRead, type, page = 1, limit = 20 } = req.query;

    let query = { recipient: req.user.id };
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page: parseInt(page), limit: parseInt(limit) }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// =====================================================
// ✅ MARK AS READ (UNCHANGED)
// =====================================================
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// =====================================================
// ✅ MARK ALL AS READ (UNCHANGED)
// =====================================================
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'All notifications marked as read' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// =====================================================
// ❌ DELETE NOTIFICATION (UNCHANGED)
// =====================================================
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    res.json({ success: true, message: 'Notification deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// =====================================================
// 🔔 NEW: SEND TO SINGLE USER
// =====================================================
exports.sendNotificationToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, message, type } = req.body;

    const notification = await sendNotification({
      userId,
      title,
      message,
      type
    });

    res.json({ success: true, data: notification });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// =====================================================
// 📢 NEW: SEND TO ROLE (e.g. all technicians)
// =====================================================
exports.sendNotificationToRole = async (req, res) => {
  try {
    const { role, title, message, type } = req.body;

    const users = await User.find({ role });

    for (const user of users) {
      await sendNotification({
        userId: user._id,
        title,
        message,
        type
      });
    }

    res.json({ success: true, message: "Notifications sent" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};