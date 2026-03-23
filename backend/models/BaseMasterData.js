const mongoose = require('mongoose');
const { withIdTransform } = require('../utils/mongooseTransforms');

const MasterDataSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true, unique: true },
    color: { type: String, default: '#5b5ef7' },
    status: { type: String, default: 'active' },
    order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

withIdTransform(MasterDataSchema);

module.exports = (name) => mongoose.model(name, MasterDataSchema);
