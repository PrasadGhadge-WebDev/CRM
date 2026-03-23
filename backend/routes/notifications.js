const express = require('express');
const router = express.Router();
const {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', listNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
