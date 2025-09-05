require('dotenv').config();
const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const auth = require('../middlewares/authMiddleware');
const User = require('../models/User');
const { getAllUsers, getSearchUser } = require('../controllers/userController');
const router = express.Router();
router.use(auth);
// Upload avatar and update profile
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const filePath = `http://${process.env.SERVER_IP}:${process.env.PORT}/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: filePath }, { new: true });
    res.json({ message: 'Avatar updated', avatar: user.avatar });
  } catch {
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

router.get('/get/all-users', auth, getAllUsers);

router.get('/', auth, getSearchUser);

module.exports = router;
