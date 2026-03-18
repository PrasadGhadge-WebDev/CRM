const express = require('express');
const controller = require('../controllers/leadsController');
const { validateObjectId } = require('../middleware/validateObjectId');

const router = express.Router();

router.get('/', controller.listLeads);
router.post('/', controller.createLead);
router.get('/:id', validateObjectId('id'), controller.getLead);
router.put('/:id', validateObjectId('id'), controller.updateLead);
router.delete('/:id', validateObjectId('id'), controller.deleteLead);

router.get('/:id/notes', validateObjectId('id'), controller.listLeadNotes);
router.post('/:id/notes', validateObjectId('id'), controller.addLeadNote);
router.delete(
  '/:id/notes/:noteId',
  validateObjectId('id'),
  validateObjectId('noteId'),
  controller.deleteLeadNote,
);

module.exports = router;
