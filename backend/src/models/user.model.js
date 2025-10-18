import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    mallId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    recoveryEmail: {
      type: String,
      unique: true,
      sparse: true, // This tells the DB to allow multiple empty emails
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'super-admin'],
      default: 'admin',
    },
    // --- Profile Fields ---
    mallName: { type: String, default: '' },
    brandName: { type: String, default: '' },
    location: { type: String, default: '' },
    imageUrl: { type: String, default: '/uploads/default-avatar.png' },
    mobileNumber: { type: String, default: '' },
    
    // --- Password Reset Fields ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
  );
  

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
// FIX #1 is here: This ensures the method is correctly attached to the user documents.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;