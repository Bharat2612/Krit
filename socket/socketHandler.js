const jwt = require('jsonwebtoken');
const Group = require('../models/Group');

module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join', async (token) => {
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(user.id);

        // Join all user groups
        const groups = await Group.find({ members: user.id });
        groups.forEach(g => socket.join(`group_${g._id}`));
      } catch {
        socket.disconnect();
      }
    });
  });
};
