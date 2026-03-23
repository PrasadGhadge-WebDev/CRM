const mongoose = require('mongoose');
const { withIdTransform } = require('../utils/mongooseTransforms');

const SupportTicketSchema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, default: 'open', index: true }, // open, in-progress, resolved, closed
    priority: { type: String, default: 'medium', index: true }, // low, medium, high, urgent
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    category: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

withIdTransform(SupportTicketSchema);

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
