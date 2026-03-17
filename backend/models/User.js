const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true },
    password:   { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['farmer', 'processor', 'distributor', 'retailer', 'consumer', 'admin'],
      required: true
    },
    // Role-specific profile fields
    profile: {
      farmName:    String,
      farmLocation:String,
      farmSize:    String,   // acres
      licenseNo:   String,
      address:     String,
      phone:       String,
      verified:    { type: Boolean, default: false }
    },
    walletAddress: { type: String, default: '' }, // Ethereum wallet (optional)
    isActive:      { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
