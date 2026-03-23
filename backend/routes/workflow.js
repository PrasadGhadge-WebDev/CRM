const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/convert-to-deal', workflowController.convertToDeal);
router.post('/convert-to-customer', workflowController.convertToCustomer);
router.post('/create-order', workflowController.createOrder);
router.post('/create-support-ticket', workflowController.createSupportTicket);
router.post('/assign-lead', workflowController.assignLead);
router.patch('/update-lead-status', workflowController.updateLeadStatus);

module.exports = router;
