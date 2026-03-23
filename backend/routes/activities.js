const express = require('express');
const router = express.Router();
const {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activitiesController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', listActivities);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;
