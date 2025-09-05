const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // for group messages
  content: String,
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
  isRead : { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });  // adds createdAt, updatedAt

module.exports = mongoose.model('Message', messageSchema);
