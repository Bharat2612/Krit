const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;

    const message = await new Message({
      sender: req.user.id,
      receiver: receiverId,
      content,
      type,
      status: 'sent',
      isRead: false,
    }).save();

    // Emit via socket.io
    const io = req.app.get('io');
    io.to(receiverId).emit('receive-message', message);

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;       // other user
    const myId = req.user.id;            // logged-in user

    // 1️⃣ Mark all unread messages (from userId → me) as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: myId,
        isRead: false,
      },
      { $set: { isRead: true, status: "seen" } }
    );

    // 2️⃣ Fetch conversation
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    }).sort("timestamp");

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};



exports.markAsDelivered = async (req, res) => {
  const { messageId } = req.body;
  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { status: 'delivered' },
      { new: true }
    );

    const io = req.app.get('io');
    io.to(message.sender.toString()).emit('message-status', {
      messageId,
      status: 'delivered',
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Failed to mark as delivered' });
  }
};

exports.markAsSeen = async (req, res) => {
  const { messageId } = req.body;
  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { status: 'seen' },
      { new: true }
    );

    const io = req.app.get('io');
    io.to(message.sender.toString()).emit('message-status', {
      messageId,
      status: 'seen',
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Failed to mark as seen' });
  }
};


exports.getRecentChat = async (req, res) => {
  try {
    const userId = req.user.id; // logged-in user
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const chats = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userObjectId }, { receiver: userObjectId }]
        }
      },
      {
        $sort: { timestamp: -1 } // sort messages by latest first
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userObjectId] }, // if I am sender → group by receiver
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },   // keep latest message in group
          updatedAt: { $first: "$timestamp" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userObjectId] }, // I am receiver
                    { $eq: ["$isRead", false] }           // not read yet
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",         // join with users collection
          localField: "_id",     // other user’s id
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { $sort: { updatedAt: -1 } } // sort final chats by last message time
    ]);

    const formatted = chats.map((c) => ({
      user: {
        id: c.user._id,
        name: c.user.name,
        avatar: c.user.avatar,
      },
      lastMessage: {
        body: c.lastMessage.content,
        type: c.lastMessage.type,
        status: c.lastMessage.status,
      },
      updatedAt: c.updatedAt,
      unreadCount: c.unreadCount,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("getRecentChat error:", err);
    res.status(500).json({ message: "Failed to get recent chats" });
  }
};



