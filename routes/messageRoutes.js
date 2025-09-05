const express = require('express');
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { sendMessage, getMessages, getRecentChat } = require('../controllers/messageController');
const { markAsDelivered, markAsSeen } = require('../controllers/messageController');


const router = express.Router();

router.use(auth);

router.post('/', sendMessage);
router.get('/:userId', getMessages);

// Optional: message with file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  req.body.content = filePath;
  req.body.type = 'file';
  return await sendMessage(req, res);
});

router.post('/mark-delivered', markAsDelivered);
router.post('/mark-seen', markAsSeen);

router.get('/get/recent-chat', getRecentChat);


module.exports = router;
