const express = require('express');
const controller = require('../controllers/usersController');
const { validateObjectId } = require('../middleware/validateObjectId');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/', controller.listUsers);
router.post('/', controller.createUser);
router.get('/:id', validateObjectId('id'), controller.getUser);
router.put('/:id', validateObjectId('id'), controller.updateUser);
router.delete('/:id', validateObjectId('id'), controller.deleteUser);

module.exports = router;
