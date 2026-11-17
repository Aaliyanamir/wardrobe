const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: 'WARDROBE' },
    slug: { type: String, unique: true, lowercase: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    category: {
      type: String,
      required: true,
      enum: ['tops', 'hoodies', 'jackets', 'pants'],
    },
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
      },
    ],
    sizes: [{ type: String }],
    description: { type: String, required: true },
    material: { type: String, required: true },
    images: [{ type: String }],
    // 3D Assets
    modelUrl: { type: String },      // .glb / .gltf
    textureUrls: {
      albedo: String,
      normal: String,
      roughness: String,
      ao: String,
    },
    tags: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    stock: { type: Number, default: 100 },
    isNew: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
