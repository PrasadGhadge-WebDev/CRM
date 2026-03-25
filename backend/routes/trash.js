const express = require('express');
const controller = require('../controllers/trashController');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validateObjectId');

const router = express.Router();

router.use(protect);

router.get('/', controller.listTrash);
router.post('/:id/restore', validateObjectId('id'), controller.restoreTrashItem);
router.delete('/:id', validateObjectId('id'), controller.deleteTrashItem);

module.exports = router;
