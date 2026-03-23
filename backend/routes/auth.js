const express = require('express');
const {
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
  updateSettings,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/password', protect, updatePassword);
router.put('/settings', protect, updateSettings);
router.get('/logout', protect, logout);

module.exports = router;
