const mongoose = require('mongoose');
const { withIdTransform } = require('../utils/mongooseTransforms');

const LeadSchema = new mongoose.Schema(
  {
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    source: { type: String, trim: true },
    status: { type: String, trim: true, default: 'new', index: true },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

withIdTransform(LeadSchema);

module.exports = mongoose.model('Lead', LeadSchema);

