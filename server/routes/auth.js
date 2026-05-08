const express = require('express');
const { signup, login, refreshToken, getMe, updateMe, uploadAvatar, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.post('/me/avatar', authMiddleware, uploadAvatar);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
