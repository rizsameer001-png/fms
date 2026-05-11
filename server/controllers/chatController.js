const { Message, ChatGroup } = require('../models/Chat');
const User = require('../models/User');

// @desc    Get user's chat groups
// @route   GET /api/chat/groups
// @access  Private
exports.getChatGroups = async (req, res) => {
  try {
    const groups = await ChatGroup.find({
      members: req.user.id,
      isActive: true
    })
      .populate('members', 'name email avatar isOnline')
      .populate('admins', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a group
// @route   GET /api/chat/groups/:groupId/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ group: req.params.groupId })
      .populate('sender', 'name email avatar')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { group: req.params.groupId, sender: { $ne: req.user.id }, isRead: false },
      { isRead: true, $push: { readBy: { user: req.user.id, at: new Date() } } }
    );

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: { page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send message
// @route   POST /api/chat/groups/:groupId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { content, attachments, replyTo } = req.body;

    const message = await Message.create({
      sender: req.user.id,
      group: req.params.groupId,
      content,
      attachments: attachments || [],
      replyTo
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar');

    // TODO: Emit socket event for real-time delivery

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create chat group
// @route   POST /api/chat/groups
// @access  Private
exports.createGroup = async (req, res) => {
  try {
    const { name, members, type } = req.body;

    const group = await ChatGroup.create({
      name,
      type: type || 'group',
      members: [...members, req.user.id],
      admins: [req.user.id]
    });

    res.status(201).json({
      success: true,
      data: await ChatGroup.findById(group._id).populate('members', 'name email avatar')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get or create one-to-one chat
// @route   POST /api/chat/direct
// @access  Private
exports.getOrCreateDirectChat = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if one-to-one chat already exists
    let group = await ChatGroup.findOne({
      type: 'one_to_one',
      members: { $all: [req.user.id, userId], $size: 2 }
    }).populate('members', 'name email avatar isOnline');

    if (!group) {
      const otherUser = await User.findById(userId).select('name');
      group = await ChatGroup.create({
        name: `Chat with ${otherUser.name}`,
        type: 'one_to_one',
        members: [req.user.id, userId],
        admins: [req.user.id, userId]
      });
      group = await ChatGroup.findById(group._id).populate('members', 'name email avatar isOnline');
    }

    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
