const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/asyncHandler');

exports.listNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const filter = { user_id: req.user.id };

  const [items, total] = await Promise.all([
    Notification.find(filter)
      .sort({ created_at: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Notification.countDocuments(filter),
  ]);

  res.ok({ items, total, page: pageNum, limit: limitNum });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user.id },
    { is_read: true },
    { new: true }
  );
  if (!notification) {
    return res.fail('Notification not found', 404);
  }
  res.ok(notification);
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user_id: req.user.id, is_read: false },
    { is_read: true }
  );
  res.ok(null, 'All marked as read');
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user_id: req.user.id,
  });
  if (!notification) {
    return res.fail('Notification not found', 404);
  }
  res.ok(null, 'Notification deleted');
});
