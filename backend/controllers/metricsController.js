const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const { asyncHandler } = require('../middleware/asyncHandler');

exports.getMetrics = asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (companyId && !mongoose.isValidObjectId(companyId)) {
    res.status(400);
    throw new Error('Invalid companyId');
  }
  const companyFilter = companyId ? { company_id: new mongoose.Types.ObjectId(companyId) } : {};

  const [customersTotal, leadsTotal, leadsByStatus, recentLeads, recentCustomers] = await Promise.all([
    Customer.countDocuments(companyFilter),
    Lead.countDocuments(companyFilter),
    Lead.aggregate([
      { $match: companyFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, status: { $ifNull: ['$_id', ''] }, count: 1 } },
    ]),
    Lead.find(companyFilter).sort({ created_at: -1 }).limit(5).select('name status source created_at'),
    Customer.find(companyFilter).sort({ created_at: -1 }).limit(5).select('name email phone created_at'),
  ]);

  res.json({
    customers: { total: customersTotal, recent: recentCustomers },
    leads: { total: leadsTotal, byStatus: leadsByStatus, recent: recentLeads },
  });
});
