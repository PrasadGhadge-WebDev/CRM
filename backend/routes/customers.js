const express = require('express');
const controller = require('../controllers/customersController');
const { validateObjectId } = require('../middleware/validateObjectId');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/export', controller.exportCustomersCsv);
router.post('/import', controller.importCustomersCsv);
router.get('/', controller.listCustomers);
router.post('/', controller.createCustomer);
router.get('/:id', validateObjectId('id'), controller.getCustomer);
router.put('/:id', validateObjectId('id'), controller.updateCustomer);
router.delete('/:id', validateObjectId('id'), controller.deleteCustomer);

module.exports = router;
