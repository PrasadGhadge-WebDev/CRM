const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');

router.use(protect);

function buildSearchQuery(q) {
  if (!q) return null;
  const safe = String(q).trim();
  if (!safe) return null;
  return { $regex: safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
}

router.get('/', asyncHandler(async (req, res) => {
  const {
    customer_id,
    deal_id,
    status,
    q,
    page = 1,
    limit = 20,
    sortField = 'created_at',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
  const search = buildSearchQuery(q);
  const filter = {};
  if (customer_id) filter.customer_id = customer_id;
  if (deal_id) filter.deal_id = deal_id;
  if (status) filter.status = status;
  if (search) filter.notes = search;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate('customer_id', 'name email')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.ok({ items, total, page: pageNum, limit: limitNum });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer_id').populate('deal_id');
  if (!order) return res.fail('Order not found', 404);
  res.ok(order);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!order) return res.fail('Order not found', 404);
  res.ok(order);
}));

module.exports = router;
