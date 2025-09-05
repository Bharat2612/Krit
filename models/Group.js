const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
});

module.exports = mongoose.model('Group', groupSchema);
