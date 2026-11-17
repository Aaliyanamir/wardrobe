const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses: [
      {
        label: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsUpdates: { type: Boolean, default: false },
      hd3DPreview: { type: Boolean, default: true },
      saveTryOnSessions: { type: Boolean, default: true },
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
