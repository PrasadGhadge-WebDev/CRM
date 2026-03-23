const mongoose = require('mongoose');
const { withIdTransform } = require('../utils/mongooseTransforms');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, trim: true },
    sku: { type: String, trim: true, unique: true, sparse: true },
    stock_quantity: { type: Number, default: 0 },
    status: { type: String, default: 'active', index: true }, // active, inactive
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

withIdTransform(ProductSchema);

module.exports = mongoose.model('Product', ProductSchema);
