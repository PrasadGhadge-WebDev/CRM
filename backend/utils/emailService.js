const nodemailer = require('nodemailer');
const Company = require('../models/Company');

exports.sendEmail = async ({ to, subject, text, html }) => {
  // Fetch organization SMTP settings
  const company = await Company.findOne(); // Assumes single-company setup for now
  const smtp = company?.settings?.smtp;

  if (!smtp || !smtp.host || !smtp.user || !smtp.password) {
    console.warn('SMTP settings missing. Email not sent.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: parseInt(smtp.port) || 587,
    secure: smtp.port === '465',
    auth: {
      user: smtp.user,
      pass: smtp.password,
    },
  });

  const mailOptions = {
    from: `"${company.name}" <${smtp.user}>`,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};
