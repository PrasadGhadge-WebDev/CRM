const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
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
    status,
    priority,
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
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [{ subject: search }, { description: search }, { category: search }];
  }

  const [items, total] = await Promise.all([
    SupportTicket.find(filter)
      .populate('customer_id', 'name email')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    SupportTicket.countDocuments(filter),
  ]);

  res.ok({ items, total, page: pageNum, limit: limitNum });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id).populate('customer_id').populate('assigned_to', 'name email');
  if (!ticket) return res.fail('Ticket not found', 404);
  res.ok(ticket);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ticket) return res.fail('Ticket not found', 404);
  res.ok(ticket);
}));

module.exports = router;
