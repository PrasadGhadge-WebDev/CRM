const mongoose = require('mongoose');
const { withIdTransform } = require('../utils/mongooseTransforms');

const DealSchema = new mongoose.Schema(
  {
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true },
    name: { type: String, required: true, trim: true },
    value: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, default: 'open', index: true }, // open, won, lost, closed
    expected_close_date: { type: Date },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    description: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

withIdTransform(DealSchema);

module.exports = mongoose.model('Deal', DealSchema);
