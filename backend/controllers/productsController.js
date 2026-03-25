const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/asyncHandler');
const { moveDocumentToTrash } = require('../utils/trash');

function buildSearchQuery(q) {
  if (!q) return null;
  const safe = String(q).trim();
  if (!safe) return null;
  return { $regex: safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
}

exports.listProducts = asyncHandler(async (req, res) => {
  const { category, status, q, page = 1, limit = 20, sortField = 'name', sortOrder = 'asc' } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const sort = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

  const search = buildSearchQuery(q);
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) filter.$or = [{ name: search }, { description: search }, { sku: search }];

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.ok({ items, page: pageNum, limit: limitNum, total });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.created(product);
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.fail('Product not found', 404);
  res.ok(product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.fail('Product not found', 404);
  res.ok(product);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.fail('Product not found', 404);
  await moveDocumentToTrash({ entityType: 'product', document: product, deletedBy: req.user?.id });
  res.ok(null, 'Product moved to trash');
});
