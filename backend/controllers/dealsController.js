const Deal = require('../models/Deal');
const { asyncHandler } = require('../middleware/asyncHandler');

function buildSearchQuery(q) {
  if (!q) return null;
  const safe = String(q).trim();
  if (!safe) return null;
  return { $regex: safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
}

exports.listDeals = asyncHandler(async (req, res) => {
  const { company_id, customer_id, status, q, page = 1, limit = 20, sortField = 'created_at', sortOrder = 'desc' } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const sort = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

  const search = buildSearchQuery(q);
  const filter = {};
  if (company_id) filter.company_id = company_id;
  if (customer_id) filter.customer_id = customer_id;
  if (status) filter.status = status;
  if (search) filter.name = search;

  const [items, total] = await Promise.all([
    Deal.find(filter)
      .populate('customer_id', 'name email')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Deal.countDocuments(filter),
  ]);

  res.ok({ items, page: pageNum, limit: limitNum, total });
});

exports.createDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.create(req.body);
  res.created(deal);
});

exports.getDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id).populate('customer_id').populate('assigned_to', 'name email');
  if (!deal) {
    return res.fail('Deal not found', 404);
  }
  res.ok(deal);
});

exports.updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!deal) {
    return res.fail('Deal not found', 404);
  }
  res.ok(deal);
});

exports.deleteDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    return res.fail('Deal not found', 404);
  }
  await deal.deleteOne();
  res.ok(null, 'Deal deleted');
});
