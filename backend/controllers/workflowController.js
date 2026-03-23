const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const SupportTicket = require('../models/SupportTicket');
const { asyncHandler } = require('../middleware/asyncHandler');

// Lead to Deal conversion
exports.convertToDeal = asyncHandler(async (req, res) => {
  const { leadId, dealData } = req.body;
  console.log('convertToDeal body:', req.body);
  
  const lead = await Lead.findById(leadId);
  console.log('found lead:', lead);
  if (!lead) return res.fail('Lead not found', 404);

  // Create Deal
  const deal = await Deal.create({
    ...dealData,
    company_id: lead.company_id,
    assigned_to: lead.assigned_to,
  });

  // Update Lead status
  lead.status = 'converted';
  await lead.save();

  res.created({ deal, lead }, 'Lead successfully converted to Deal');
});

// Deal/Lead to Customer conversion
exports.convertToCustomer = asyncHandler(async (req, res) => {
  const { sourceId, sourceType, customerData } = req.body; // sourceType: 'lead' or 'deal'
  
  let company_id;
  if (sourceType === 'lead') {
    const lead = await Lead.findById(sourceId);
    if (!lead) return res.fail('Lead not found', 404);
    company_id = lead.company_id;
    lead.status = 'converted';
    await lead.save();
  } else if (sourceType === 'deal') {
    const deal = await Deal.findById(sourceId);
    if (!deal) return res.fail('Deal not found', 404);
    company_id = deal.company_id;
    deal.status = 'won';
    await deal.save();
  }

  // Create Customer
  const customer = await Customer.create({
    ...customerData,
    company_id,
  });

  res.created(customer, 'Successfully converted to Customer');
});

// Create Order from Deal/Customer
exports.createOrder = asyncHandler(async (req, res) => {
  const { customerId, dealId, orderItems, totalAmount, notes } = req.body;

  const order = await Order.create({
    customer_id: customerId,
    deal_id: dealId,
    items: orderItems,
    total_amount: totalAmount,
    notes,
    status: 'pending',
    order_date: new Date(),
  });

  // If dealId exists, update deal status to closed/won if not already
  if (dealId) {
    await Deal.findByIdAndUpdate(dealId, { status: 'won' });
  }

  res.created(order, 'Order created successfully');
});

// Create Support Ticket
exports.createSupportTicket = asyncHandler(async (req, res) => {
  const { customerId, subject, description, priority, category } = req.body;

  const ticket = await SupportTicket.create({
    customer_id: customerId,
    subject,
    description,
    priority: priority || 'medium',
    status: 'open',
    category,
  });

  res.created(ticket, 'Support ticket created successfully');
});

exports.assignLead = asyncHandler(async (req, res) => {
  const { leadId, userId } = req.body;
  const lead = await Lead.findByIdAndUpdate(leadId, { assigned_to: userId, status: 'assigned' }, { new: true });
  if (!lead) return res.fail('Lead not found', 404);
  res.ok(lead, 'Lead assigned successfully');
});

exports.updateLeadStatus = asyncHandler(async (req, res) => {
  const { leadId, status } = req.body;
  const lead = await Lead.findByIdAndUpdate(leadId, { status }, { new: true });
  if (!lead) return res.fail('Lead not found', 404);
  res.ok(lead, 'Lead status updated');
});
