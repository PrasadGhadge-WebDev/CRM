const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const { asyncHandler } = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { customer_id, status } = req.query;
  const filter = {};
  if (customer_id) filter.customer_id = customer_id;
  if (status) filter.status = status;
  const tickets = await SupportTicket.find(filter).populate('customer_id', 'name email').sort({ created_at: -1 });
  res.ok(tickets);
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
