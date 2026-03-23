const mongoose = require('mongoose');
const { withIdTransform } = require('../utils/mongooseTransforms');

const ActivitySchema = new mongoose.Schema(
  {
    activity_type: { type: String, required: true, enum: ['call', 'meeting', 'email', 'task'], index: true },
    description: { type: String, trim: true },
    related_to: { type: mongoose.Schema.Types.ObjectId, required: false, index: true, refPath: 'related_type' },
    related_type: { type: String, required: false, enum: ['Lead', 'Customer', 'Deal'], index: true },
    activity_date: { type: Date, default: Date.now },
    due_date: { type: Date },
    reminder_sent: { type: Boolean, default: false },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'completed' }, // completed, planned
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

withIdTransform(ActivitySchema);

module.exports = mongoose.model('Activity', ActivitySchema);
