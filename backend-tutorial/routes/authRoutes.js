const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Định nghĩa đường dẫn
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;