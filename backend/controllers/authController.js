const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/asyncHandler');
const { ensureDefaultAdmin, getDefaultAdminEmail } = require('../utils/defaultAdmin');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
const ALLOWED_ROLES = ['Admin', 'Manager', 'Accountant', 'Employee'];
const REGISTERABLE_ROLES = ['Manager', 'Accountant', 'Employee'];
const ROLE_ALIASES = {
  admin: 'Admin',
  manager: 'Manager',
  accountant: 'Accountant',
  employee: 'Employee',
};

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeRole(value) {
  const normalized = normalizeText(value).toLowerCase();
  return ROLE_ALIASES[normalized] || '';
}

function validateRegisterPayload(body) {
  const errors = [];
  const username = normalizeText(body.username);
  const name = normalizeText(body.name || body.fullName || body.username);
  const email = normalizeEmail(body.email);
  const phone = normalizeText(body.phone);
  const password = String(body.password ?? '');
  const role = normalizeRole(body.role);

  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (!name) {
    errors.push('Full name is required');
  } else if (name.length < 3) {
    errors.push('Full name must be at least 3 characters');
  }

  if (!email) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Enter a valid email address');
  }

  if (!phone) {
    errors.push('Phone is required');
  } else if (!PHONE_REGEX.test(phone)) {
    errors.push('Enter a valid 10-digit mobile number');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.push('Password must be at least 6 characters and include letters and numbers');
  }

  if (!role) {
    errors.push('Role is required');
  } else if (!ALLOWED_ROLES.includes(role)) {
    errors.push('Select a valid role');
  } else if (!REGISTERABLE_ROLES.includes(role)) {
    errors.push('You cannot register for this role');
  }

  return {
    errors,
    values: { username, name, email, phone, password, role },
  };
}

function validateLoginPayload(body) {
  const errors = [];
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? '');

  if (!email) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Enter a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return {
    errors,
    values: { email, password },
  };
}

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
  const { errors, values } = validateRegisterPayload(req.body);

  if (errors.length > 0) {
    return res.fail(errors[0], 400, { errors });
  }

  const existingUser = await User.findOne({ email: values.email });
  if (existingUser) {
    return res.fail('Email already registered', 400);
  }

  const user = await User.create({
    username: values.username,
    name: values.name,
    email: values.email,
    phone: values.phone,
    role: values.role,
    status: 'pending',
    password: values.password,
  });

  res.created(
    {
      user: serializeUser(user),
      requiresApproval: true,
    },
    'Registration submitted. Please wait for admin approval before logging in.',
  );
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { errors, values } = validateLoginPayload(req.body);

  if (errors.length > 0) {
    return res.fail(errors[0], 400, { errors });
  }

  let user = await User.findOne({ email: values.email }).select('+password');

  if (!user && values.email === getDefaultAdminEmail()) {
    await ensureDefaultAdmin();
    user = await User.findOne({ email: values.email }).select('+password');
  }

  if (!user || !user.password) {
    return res.fail('Invalid credentials', 401);
  }

  let isMatch = false;
  try {
    isMatch = await user.matchPassword(values.password);
  } catch (err) {
    return res.fail('Invalid credentials', 401);
  }

  if (!isMatch) {
    return res.fail('Invalid credentials', 401);
  }

  if (user.status === 'pending') {
    return res.fail('Your account is pending admin approval.', 403);
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
