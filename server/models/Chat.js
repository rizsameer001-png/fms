const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatGroup' },

  content: { type: String },
  attachments: [{
    url: { type: String },
    type: { type: String, enum: ['image', 'video', 'document', 'audio'] },
    name: { type: String }
  }],

  isRead: { type: Boolean, default: false },
  readBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: { type: Date } }],

  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const chatGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['one_to_one', 'group'], default: 'group' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Message: mongoose.model('Message', messageSchema),
  ChatGroup: mongoose.model('ChatGroup', chatGroupSchema)
};
