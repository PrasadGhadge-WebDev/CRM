const Lead = require('../models/Lead');
const LeadNote = require('../models/LeadNote');
const { asyncHandler } = require('../middleware/asyncHandler');
const { moveDocumentToTrash } = require('../utils/trash');

function buildSearchQuery(q) {
  if (!q) return null;
  const safe = String(q).trim();
  if (!safe) return null;
  return { $regex: safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
}

exports.listLeads = asyncHandler(async (req, res) => {
  const {
    companyId,
    status,
    source,
    assignedTo,
    q,
    page = 1,
    limit = 20,
    sortField = 'created_at',
    sortOrder = 'desc'
  } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const sort = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

  const search = buildSearchQuery(q);
  const filter = {};
  if (companyId) filter.company_id = companyId;
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (assignedTo) filter.assigned_to = assignedTo;
  if (search) filter.$or = [{ name: search }, { email: search }, { phone: search }, { source: search }];

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Lead.countDocuments(filter),
  ]);

  res.ok({ items, page: pageNum, limit: limitNum, total });
});

exports.createLead = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const created = await Lead.create(payload);
  res.created(created);
});

exports.getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    return res.fail('Lead not found', 404);
  }
  res.ok(lead);
});

exports.updateLead = asyncHandler(async (req, res) => {
  const updated = await Lead.findByIdAndUpdate(req.params.id, req.body || {}, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    return res.fail('Lead not found', 404);
  }
  res.ok(updated);
});

exports.deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    return res.fail('Lead not found', 404);
  }
  const leadNotes = await LeadNote.find({ lead_id: lead.id });
  const leadPayload = lead.toObject();
  delete leadPayload.id;
  leadPayload._leadNotes = leadNotes.map((note) => {
    const serialized = note.toObject();
    delete serialized.id;
    return serialized;
  });

  await moveDocumentToTrash({
    entityType: 'lead',
    document: lead,
    data: leadPayload,
    deletedBy: req.user?.id,
  });
  await LeadNote.deleteMany({ lead_id: lead.id });
  res.ok(null, 'Lead moved to trash');
});

exports.listLeadNotes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const leadId = req.params.id;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const [items, total] = await Promise.all([
    LeadNote.find({ lead_id: leadId })
      .sort({ created_at: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    LeadNote.countDocuments({ lead_id: leadId }),
  ]);

  res.ok({ items, total, page: pageNum, limit: limitNum });
});

exports.addLeadNote = asyncHandler(async (req, res) => {
  const leadId = req.params.id;
  const lead = await Lead.findById(leadId);
  if (!lead) {
    return res.fail('Lead not found', 404);
  }

  const payload = req.body || {};
  const created = await LeadNote.create({
    lead_id: leadId,
    user_id: payload.user_id,
    note: payload.note,
  });
  res.created(created);
});

exports.deleteLeadNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;
  const deleted = await LeadNote.findOneAndDelete({ _id: noteId, lead_id: id });
  if (!deleted) {
    return res.fail('Lead note not found', 404);
  }
  res.ok(null, 'Lead note deleted');
});
