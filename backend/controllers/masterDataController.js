const LeadStatus = require('../models/LeadStatus');
const LeadSource = require('../models/LeadSource');
const CustomerType = require('../models/CustomerType');
const IndustryType = require('../models/IndustryType');
const { asyncHandler } = require('../middleware/asyncHandler');

const models = {
  'lead-status': LeadStatus,
  'lead-source': LeadSource,
  'customer-type': CustomerType,
  'industry-type': IndustryType,
};

const getModel = (type) => {
  const model = models[type];
  if (!model) throw new Error(`Invalid master data type: ${type}`);
  return model;
};

exports.listMasterData = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));

  const Model = getModel(type);

  const [items, total] = await Promise.all([
    Model.find()
      .sort({ order: 1, label: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Model.countDocuments(),
  ]);

  res.ok({ items, total, page: pageNum, limit: limitNum });
});

exports.createMasterData = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const Model = getModel(type);
  const created = await Model.create(req.body);
  res.created(created);
});

exports.updateMasterData = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const Model = getModel(type);
  const updated = await Model.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    return res.fail('Item not found', 404);
  }
  res.ok(updated);
});

exports.deleteMasterData = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const Model = getModel(type);
  const deleted = await Model.findByIdAndDelete(id);
  if (!deleted) {
    return res.fail('Item not found', 404);
  }
  res.ok(null, 'Item deleted');
});
