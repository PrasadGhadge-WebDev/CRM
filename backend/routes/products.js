const express = require('express');
const productsController = require('../controllers/productsController');
const { validateObjectId } = require('../middleware/validateObjectId');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', productsController.listProducts);
router.post('/', productsController.createProduct);
router.get('/:id', productsController.getProduct);
router.patch('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
