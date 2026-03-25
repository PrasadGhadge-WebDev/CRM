const User = require('../models/User');
const logger = require('./logger');

function getDefaultAdminConfig() {
  return {
    username: String(process.env.DEFAULT_ADMIN_USERNAME || 'admin').trim(),
    name: String(process.env.DEFAULT_ADMIN_NAME || 'System Admin').trim(),
    email: String(process.env.DEFAULT_ADMIN_EMAIL || 'admin@crm.com').trim().toLowerCase(),
    phone: String(process.env.DEFAULT_ADMIN_PHONE || '9876543210').trim(),
    password: String(process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123').trim(),
    role: 'Admin',
    status: 'active',
  };
}

function getDefaultAdminEmail() {
  return getDefaultAdminConfig().email;
}

async function ensureDefaultAdmin() {
  const adminConfig = getDefaultAdminConfig();

  const existingAdmin = await User.findOne({
    $or: [{ role: 'Admin' }, { email: adminConfig.email }],
  }).select('_id email');

  if (existingAdmin) {
    logger.info(`Default admin bootstrap skipped; admin already exists (${existingAdmin.email})`);
    return existingAdmin;
  }

  const createdAdmin = await User.create(adminConfig);
  logger.warn(
    `Default admin created automatically with email "${adminConfig.email}". Change the password after first login.`,
  );

  return createdAdmin;
}

module.exports = {
  ensureDefaultAdmin,
  getDefaultAdminEmail,
};
