const mongoose = require('mongoose');
const { withIdTransform } = require('../utils/mongooseTransforms');

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    deal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', index: true },
    items: [OrderItemSchema],
    total_amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, default: 'pending', index: true }, // pending, paid, shipped, cancelled, refunded
    order_date: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

withIdTransform(OrderSchema);

module.exports = mongoose.model('Order', OrderSchema);
