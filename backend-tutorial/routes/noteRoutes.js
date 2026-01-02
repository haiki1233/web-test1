const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

// Các router cần bảo vệ thì nhét authMiddleware vào giữa
router.get('/my-notes', authMiddleware, noteController.getMyNotes);
router.post('/notes', authMiddleware, noteController.createNote);
router.delete('/notes/:id', authMiddleware, noteController.deleteNote);
router.put('/notes/:id', authMiddleware, noteController.updateNote);

module.exports = router;