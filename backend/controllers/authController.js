const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/asyncHandler');

function serializeUser(user) {
  return {
    id: String(user._id),
    username: user.username || user.name,
    name: user.name || user.username,
    email: user.email,
    role: user.role || 'Admin',
    role_id: user.role_id || '',
    company_id: user.company_id || '',
    phone: user.phone || '',
    profile_photo: user.profile_photo || '',
    status: user.status || 'active',
    last_login: user.last_login || null,
    settings: {
      emailNotifications: user.settings?.emailNotifications ?? true,
      weeklyDigest: user.settings?.weeklyDigest ?? false,
    },
  };
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.create({
    username,
    name: username,
    email,
    password,
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.fail('Please provide an email and password', 400);
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+password');

  if (!user || !user.password) {
    return res.fail('Invalid credentials', 401);
  }

  let isMatch = false;
  try {
    isMatch = await user.matchPassword(password);
  } catch (err) {
    return res.fail('Invalid credentials', 401);
  }

  if (!isMatch) {
    return res.fail('Invalid credentials', 401);
  }

  if (user.status === 'inactive') {
    return res.fail('Your account is inactive. Please contact an administrator.', 403);
  }

  user.last_login = new Date();
  await user.save();

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options);

  return res.ok({
    token,
    user: serializeUser(user),
  }, statusCode === 201 ? 'Registration successful' : 'Login successful', statusCode);
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  res.ok({ user: serializeUser(req.user) });
});

// @desc    Update current logged in user
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = asyncHandler(async (req, res) => {
  const { username, name, email } = req.body;

  const nextName = name?.trim() || username?.trim();
  if (!nextName || !email?.trim()) {
    return res.fail('Name and email are required', 400);
  }

  const emailInUse = await User.findOne({
    email: email.trim().toLowerCase(),
    _id: { $ne: req.user._id },
  });

  if (emailInUse) {
    return res.fail('Email already in use', 400);
  }

  req.user.name = nextName;
  req.user.username = username?.trim() || nextName;
  req.user.email = email.trim().toLowerCase();
  await req.user.save();

  res.ok({ user: serializeUser(req.user) }, 'Profile updated successfully');
});

// @desc    Update current user password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.fail('Current and new password are required', 400);
  }

  if (String(newPassword).length < 6) {
    return res.fail('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.fail('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  res.ok(null, 'Password updated successfully');
});

// @desc    Update current user settings
// @route   PUT /api/auth/settings
// @access  Private
exports.updateSettings = asyncHandler(async (req, res) => {
  const nextSettings = {
    emailNotifications: Boolean(req.body.emailNotifications),
    weeklyDigest: Boolean(req.body.weeklyDigest),
  };

  req.user.settings = {
    emailNotifications: nextSettings.emailNotifications,
    weeklyDigest: nextSettings.weeklyDigest,
  };

  await req.user.save();

  res.ok({ user: serializeUser(req.user) }, 'Settings updated successfully');
});
// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.ok({}, 'Logged out successfully');
});
