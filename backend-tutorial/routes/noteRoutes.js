const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');
// gọi middleware upload vào
const upload = require('../middleware/uploadMiddleware')

// Các router cần bảo vệ thì nhét authMiddleware vào giữa
router.get('/my-notes', authMiddleware, noteController.getMyNotes);

// thêm upload.single('image') vào giữa
// nghĩa là: Ruote này chấp nhận 1 file có tên field là 'image'
router.post('/notes', authMiddleware, upload.single('image'), noteController.createNote);

router.delete('/notes/:id', authMiddleware, noteController.deleteNote);
router.put('/notes/:id', authMiddleware, noteController.updateNote);

module.exports = router;