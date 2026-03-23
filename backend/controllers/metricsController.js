const mongoose = require('mongoose');
const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/asyncHandler');

exports.getMetrics = asyncHandler(async (req, res) => {
  const { companyId } = req.query;
  if (companyId && !mongoose.isValidObjectId(companyId)) {
    res.status(400);
    throw new Error('Invalid companyId');
  }
  const companyFilter = companyId ? { company_id: new mongoose.Types.ObjectId(companyId) } : {};

  const monthsToInclude = 6;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const trendStartDate = new Date();
  trendStartDate.setDate(1);
  trendStartDate.setHours(0, 0, 0, 0);
  trendStartDate.setMonth(trendStartDate.getMonth() - (monthsToInclude - 1));

  const monthBuckets = Array.from({ length: monthsToInclude }).map((_, idx) => {
    const date = new Date(trendStartDate);
    date.setMonth(trendStartDate.getMonth() + idx);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return { key, year: date.getFullYear(), month: date.getMonth() + 1, label: `${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}` };
  });

  const fillTrend = (raw = []) => {
    const lookup = new Map(
      raw.map((item) => {
        const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        return [key, item.count];
      }),
    );

    return monthBuckets.map((bucket) => ({
      label: bucket.label,
      value: lookup.get(bucket.key) || 0,
    }));
  };

  const [
    companiesTotal,
    usersTotal,
    customersTotal,
    leadsTotal,
    leadsByStatus,
    leadsBySource,
    leadTrendRaw,
    customerTrendRaw,
    recentLeads,
    recentCustomers,
  ] = await Promise.all([
    Company.countDocuments(companyId ? { _id: new mongoose.Types.ObjectId(companyId) } : {}),
    User.countDocuments(companyFilter),
    Customer.countDocuments(companyFilter),
    Lead.countDocuments(companyFilter),
    Lead.aggregate([
      { $match: companyFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, status: { $ifNull: ['$_id', ''] }, count: 1 } },
    ]),
    Lead.aggregate([
      { $match: companyFilter },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, source: { $ifNull: ['$_id', ''] }, count: 1 } },
    ]),
    Lead.aggregate([
      { $match: { ...companyFilter, created_at: { $gte: trendStartDate } } },
      {
        $group: {
          _id: { year: { $year: '$created_at' }, month: { $month: '$created_at' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Customer.aggregate([
      { $match: { ...companyFilter, created_at: { $gte: trendStartDate } } },
      {
        $group: {
          _id: { year: { $year: '$created_at' }, month: { $month: '$created_at' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Lead.find(companyFilter).sort({ created_at: -1 }).limit(5).select('name status source created_at'),
    Customer.find(companyFilter).sort({ created_at: -1 }).limit(5).select('name email phone created_at'),
  ]);

  res.json({
    companies: { total: companiesTotal },
    users: { total: usersTotal },
    customers: { total: customersTotal, recent: recentCustomers, trend: fillTrend(customerTrendRaw) },
    leads: {
      total: leadsTotal,
      byStatus: leadsByStatus,
      bySource: leadsBySource,
      trend: fillTrend(leadTrendRaw),
      recent: recentLeads,
    },
  });
});
