// models/UserModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    phone: String,
    avatar: String,
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,

    // ── ROLE & COMPANY ───────────────────────────────────────────────────────
    role: {
      type: String,
      enum: [
        'user',         // normal end‑customer
        'super-admin',  // full platform admin
        'company-admin',// manages one company
        'company-user'  // sub‑user under a company
      ],
      default: 'user',
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: function () {
        // only require company for company-admin or company-user
        return ['company-admin', 'company-user'].includes(this.role);
      }
    },

    active: {
      type: Boolean,
      default: true,
    },

    // ── FOR BOOKING / GAMIFICATION ──────────────────────────────────────────
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Trip',
      },
    ],
    totalTrips: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after issuing JWT
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changed = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changed;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);