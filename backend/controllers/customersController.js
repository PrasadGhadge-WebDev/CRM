const Customer = require('../models/Customer');
const { asyncHandler } = require('../middleware/asyncHandler');
const { parseCsv, rowsToObjects, toCsv } = require('../utils/csv');
const { moveDocumentToTrash } = require('../utils/trash');

function buildSearchQuery(q) {
  if (!q) return null;
  const safe = String(q).trim();
  if (!safe) return null;
  return { $regex: safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
}

exports.listCustomers = asyncHandler(async (req, res) => {
  const {
    companyId,
    customer_type,
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
  if (customer_type) filter.customer_type = customer_type;
  if (search) filter.$or = [{ name: search }, { email: search }, { phone: search }];

  const [items, total] = await Promise.all([
    Customer.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Customer.countDocuments(filter),
  ]);

  res.ok({ items, page: pageNum, limit: limitNum, total });
});

exports.createCustomer = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const created = await Customer.create(payload);
  res.created(created);
});

exports.getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.fail('Customer not found', 404);
  }
  res.ok(customer);
});

exports.updateCustomer = asyncHandler(async (req, res) => {
  const updated = await Customer.findByIdAndUpdate(req.params.id, req.body || {}, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    return res.fail('Customer not found', 404);
  }
  res.ok(updated);
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.fail('Customer not found', 404);
  }
  await moveDocumentToTrash({ entityType: 'customer', document: customer, deletedBy: req.user?.id });
  res.ok(null, 'Customer moved to trash');
});

const CSV_HEADERS = [
  'company_id',
  'name',
  'email',
  'phone',
  'alternate_phone',
  'address',
  'city',
  'state',
  'country',
  'postal_code',
  'customer_type',
  'notes',
];

exports.exportCustomersCsv = asyncHandler(async (req, res) => {
  const { companyId, q } = req.query;
  const limitParam = Number(req.query.limit);
  const maxLimit = 10000;
  const limitNum = Math.min(maxLimit, Math.max(1, Number.isFinite(limitParam) ? limitParam : maxLimit));

  const search = buildSearchQuery(q);
  const filter = {};
  if (companyId) filter.company_id = companyId;
  if (search) filter.$or = [{ name: search }, { email: search }, { phone: search }];

  const template = String(req.query.template || '').toLowerCase();
  const wantsTemplate = template === '1' || template === 'true' || template === 'yes';

  const items = wantsTemplate
    ? []
    : await Customer.find(filter)
        .sort({ created_at: -1 })
        .limit(limitNum);

  const rows = [CSV_HEADERS];
  for (const c of items) {
    rows.push(CSV_HEADERS.map((h) => (c[h] === undefined ? '' : c[h])));
  }

  const filename = wantsTemplate ? 'customers-template.csv' : 'customers.csv';
  const csv = '\ufeff' + toCsv(rows);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

function cleanImportValue(v) {
  const s = String(v === undefined || v === null ? '' : v).trim();
  return s === '' ? undefined : s;
}

exports.importCustomersCsv = asyncHandler(async (req, res) => {
  const { csv, companyId } = req.body || {};
  if (!csv || typeof csv !== 'string') {
    res.status(400);
    throw new Error('Missing csv string in request body');
  }

  const rows = parseCsv(csv);
  if (!rows.length) {
    res.status(400);
    throw new Error('CSV is empty');
  }

  const objects = rowsToObjects(rows, { header: true });
  if (!objects.length) {
    res.status(400);
    throw new Error('CSV has no data rows');
  }

  const created = [];
  const errors = [];
  let skipped = 0;

  for (let idx = 0; idx < objects.length; idx++) {
    const rowNum = idx + 2; // header is row 1
    const r = objects[idx] || {};

    const payload = {};
    for (const key of CSV_HEADERS) {
      if (key in r) payload[key] = cleanImportValue(r[key]);
    }

    if (!payload.company_id && companyId) payload.company_id = cleanImportValue(companyId);

    if (!payload.name) {
      skipped++;
      continue;
    }

    try {
      const doc = await Customer.create(payload);
      created.push(doc);
    } catch (e) {
      errors.push({ row: rowNum, message: e.message || String(e) });
    }
  }

  res.created({
    created: created.length,
    skipped,
    errors,
  }, `Imported ${created.length} customers`);
});
