const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { withIdTransform } = require('../utils/mongooseTransforms');

const userSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true,
    },
    role_id: {
      type: String,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [10, 'Phone number cannot exceed 10 digits'],
      match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit mobile number'],
    },
    role: {
      type: String,
      default: 'Admin',
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    profile_photo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: 'active',
      trim: true,
      index: true,
    },
    last_login: {
      type: Date,
    },
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      weeklyDigest: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);


// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

withIdTransform(userSchema);

module.exports = mongoose.model('User', userSchema);
