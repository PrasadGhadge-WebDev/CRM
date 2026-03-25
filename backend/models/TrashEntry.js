const mongoose = require('mongoose');
const { withIdTransform } = require('../utils/mongooseTransforms');

const trashEntrySchema = new mongoose.Schema(
  {
    entity_type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    entity_id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    deleted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deleted_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

trashEntrySchema.index({ entity_type: 1, entity_id: 1 }, { unique: true });

withIdTransform(trashEntrySchema);

module.exports = mongoose.model('TrashEntry', trashEntrySchema);
