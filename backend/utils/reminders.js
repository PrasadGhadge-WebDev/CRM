const cron = require('node-cron');
const Activity = require('../models/Activity');
const { notify } = require('./notifier');

const setupReminders = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running task reminders check...');
    const now = new Date();
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next 24 hours

    const activities = await Activity.find({
      due_date: { $gte: now, $lte: future },
      reminder_sent: false,
      status: 'planned',
    });

    for (const activity of activities) {
      if (activity.created_by) {
        await notify({
          user_id: activity.created_by,
          title: 'Upcoming Task Reminder',
          message: `Reminder: You have a ${activity.activity_type} scheduled for ${activity.due_date.toLocaleString()}.`,
          type: 'warning',
          linked_entity_id: activity.related_to,
          linked_entity_type: activity.related_type,
          send_email: true,
        });

        activity.reminder_sent = true;
        await activity.save();
      }
    }
  });
};

module.exports = setupReminders;
