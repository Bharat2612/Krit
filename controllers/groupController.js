const Group = require('../models/Group');
const Message = require('../models/Message');

exports.createGroup = async (req, res) => {
  const { name, members } = req.body;
  try {
    const group = await new Group({
      name,
      members: [...members, req.user.id],
      admins: [req.user.id]
    }).save();
    res.json(group);
  } catch {
    res.status(500).json({ message: 'Group creation failed' });
  }
};

exports.addMember = async (req, res) => {
  const { groupId, userId } = req.body;
  const group = await Group.findById(groupId);
  if (!group.admins.includes(req.user.id)) return res.status(403).json({ message: 'Not admin' });

  group.members.push(userId);
  await group.save();
  res.json({ message: 'Member added' });
};

exports.removeMember = async (req, res) => {
  const { groupId, userId } = req.body;
  const group = await Group.findById(groupId);
  if (!group.admins.includes(req.user.id)) return res.status(403).json({ message: 'Not admin' });

  group.members = group.members.filter(id => id != userId);
  await group.save();
  res.json({ message: 'Member removed' });
};

exports.getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  const messages = await Message.find({ group: groupId }).sort('timestamp');
  res.json(messages);
};

exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content, type = 'text' } = req.body;

    const message = await new Message({
      sender: req.user.id,
      group: groupId,
      content,
      type,
    }).save();

    // Notify group members via socket
    const io = req.app.get('io');
    io.to(`group_${groupId}`).emit('group-message', message);

    res.json(message);
  } catch {
    res.status(500).json({ message: 'Send group message failed' });
  }
};
