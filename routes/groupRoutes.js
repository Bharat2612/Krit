const express = require('express');
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  createGroup,
  addMember,
  removeMember,
  sendGroupMessage,
  getGroupMessages
} = require('../controllers/groupController');

const router = express.Router();

router.use(auth);

router.post('/create', createGroup);
router.post('/add-member', addMember);
router.post('/remove-member', removeMember);
router.get('/:groupId/messages', getGroupMessages);
router.post('/:groupId/send', sendGroupMessage);

// Optional: group avatar upload
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ avatar: filePath });
});

module.exports = router;
