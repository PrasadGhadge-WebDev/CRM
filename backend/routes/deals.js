const express = require('express');
const router = express.Router();
const {
  listDeals,
  createDeal,
  getDeal,
  updateDeal,
  deleteDeal,
} = require('../controllers/dealsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', listDeals);
router.post('/', createDeal);
router.get('/:id', getDeal);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

module.exports = router;
