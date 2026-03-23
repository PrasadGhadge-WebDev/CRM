const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

exports.notify = async ({
  user_id,
  title,
  message,
  type = 'info',
  linked_entity_id,
  linked_entity_type,
  send_email = false,
}) => {
  // 1. Create In-app Notification
  const notification = await Notification.create({
    user_id,
    title,
    message,
    type,
    linked_entity_id,
    linked_entity_type,
  });

  // 2. Optional Email Notification
  if (send_email) {
    const user = await User.findById(user_id);
    if (user?.email) {
      // Check user preference (assuming they have one in settings)
      // For now, respect the send_email flag
      try {
        await sendEmail({
          to: user.email,
          subject: title,
          text: message,
          html: `<p>${message}</p>`,
        });
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    }
  }

  return notification;
};
