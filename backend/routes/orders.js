const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { customer_id, deal_id } = req.query;
  const filter = {};
  if (customer_id) filter.customer_id = customer_id;
  if (deal_id) filter.deal_id = deal_id;
  const orders = await Order.find(filter).populate('customer_id', 'name email').sort({ created_at: -1 });
  res.ok(orders);
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
