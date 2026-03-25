const TrashEntry = require('../models/TrashEntry');
const { asyncHandler } = require('../middleware/asyncHandler');
const { restoreTrashEntry } = require('../utils/trash');

function buildSearchQuery(q) {
  if (!q) return null;
  const safe = String(q).trim();
  if (!safe) return null;
  return { $regex: safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
}

exports.listTrash = asyncHandler(async (req, res) => {
  const { q, entityType, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const search = buildSearchQuery(q);

  const filter = {};
  if (entityType) filter.entity_type = String(entityType).trim();
  if (search) filter.title = search;

  const [items, total] = await Promise.all([
    TrashEntry.find(filter)
      .populate('deleted_by', 'name email role')
      .sort({ deleted_at: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    TrashEntry.countDocuments(filter),
  ]);

  res.ok({ items, total, page: pageNum, limit: limitNum });
});

exports.restoreTrashItem = asyncHandler(async (req, res) => {
  const entry = await TrashEntry.findById(req.params.id);
  if (!entry) {
    return res.fail('Trash item not found', 404);
  }

  const restored = await restoreTrashEntry(entry);
  res.ok(restored, 'Item restored successfully');
});

exports.deleteTrashItem = asyncHandler(async (req, res) => {
  const entry = await TrashEntry.findById(req.params.id);
  if (!entry) {
    return res.fail('Trash item not found', 404);
  }

  await entry.deleteOne();
  res.ok(null, 'Item permanently deleted');
});
