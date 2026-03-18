const mongoose = require('mongoose');
const { withIdTransform } = require('../utils/mongooseTransforms');

const CustomerSchema = new mongoose.Schema(
  {
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    alternate_phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    postal_code: { type: String, trim: true },
    customer_type: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

withIdTransform(CustomerSchema);

module.exports = mongoose.model('Customer', CustomerSchema);

