const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        size: String,
        color: String,
        quantity: { type: Number, default: 1 },
        image: String,
      },
    ],
    shippingAddress: {
      firstName: String,
      lastName: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: { type: String, default: 'US' },
      phone: String,
    },
    paymentInfo: {
      method: { type: String, enum: ['card', 'paypal', 'apple_pay'], default: 'card' },
      transactionId: String,
      status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    },
    shippingMethod: {
      name: String,
      price: { type: Number, default: 0 },
      eta: String,
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    promoCode: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    trackingNumber: { type: String },
    notes: { type: String },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
