const mongoose = require('mongoose');

const savedLookSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    items: [
      {
        category: { type: String, enum: ['tops', 'hoodies', 'jackets', 'pants'] },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        color: String,
        size: String,
      },
    ],
    lightingPreset: { type: String, enum: ['daylight', 'warm', 'evening'], default: 'daylight' },
    thumbnail: { type: String },   // base64 or URL of saved canvas screenshot
    isPublic: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedLook', savedLookSchema);
