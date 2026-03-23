const express = require('express');
const router = express.Router();
const {
  listMasterData,
  createMasterData,
  updateMasterData,
  deleteMasterData,
} = require('../controllers/masterDataController');
const { protect, authorize } = require('../middleware/auth');

// All master data routes protected and Admin-only for management
// But maybe list should be open to all authenticated users
router.use(protect);

router.get('/:type', listMasterData);

router.use(authorize('Admin'));
router.post('/:type', createMasterData);
router.put('/:type/:id', updateMasterData);
router.delete('/:type/:id', deleteMasterData);

module.exports = router;
