const Lead = require('../models/Lead');
const LeadNote = require('../models/LeadNote');
const { asyncHandler } = require('../middleware/asyncHandler');

function buildSearchQuery(q) {
  if (!q) return null;
  const safe = String(q).trim();
  if (!safe) return null;
  return { $regex: safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
}

exports.listLeads = asyncHandler(async (req, res) => {
  const { companyId, status, assignedTo, q, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const search = buildSearchQuery(q);
  const filter = {};
  if (companyId) filter.company_id = companyId;
  if (status) filter.status = status;
  if (assignedTo) filter.assigned_to = assignedTo;
  if (search) filter.$or = [{ name: search }, { email: search }, { phone: search }, { source: search }];

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .sort({ created_at: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Lead.countDocuments(filter),
  ]);

  res.json({ items, page: pageNum, limit: limitNum, total });
});

exports.createLead = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const created = await Lead.create(payload);
  res.status(201).json(created);
});

exports.getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }
  res.json(lead);
});

exports.updateLead = asyncHandler(async (req, res) => {
  const updated = await Lead.findByIdAndUpdate(req.params.id, req.body || {}, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    res.status(404);
    throw new Error('Lead not found');
  }
  res.json(updated);
});

exports.deleteLead = asyncHandler(async (req, res) => {
  const deleted = await Lead.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error('Lead not found');
  }
  await LeadNote.deleteMany({ lead_id: deleted.id });
  res.json({ ok: true });
});

exports.listLeadNotes = asyncHandler(async (req, res) => {
  const leadId = req.params.id;
  const notes = await LeadNote.find({ lead_id: leadId }).sort({ created_at: -1 });
  res.json({ items: notes });
});

exports.addLeadNote = asyncHandler(async (req, res) => {
  const leadId = req.params.id;
  const lead = await Lead.findById(leadId);
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }

  const payload = req.body || {};
  const created = await LeadNote.create({
    lead_id: leadId,
    user_id: payload.user_id,
    note: payload.note,
  });
  res.status(201).json(created);
});

exports.deleteLeadNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;
  const deleted = await LeadNote.findOneAndDelete({ _id: noteId, lead_id: id });
  if (!deleted) {
    res.status(404);
    throw new Error('Lead note not found');
  }
  res.json({ ok: true });
});

