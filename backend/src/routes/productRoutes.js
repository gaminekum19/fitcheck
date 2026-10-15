const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');
const { getProducts, addProduct } = require('../controllers/productController');

router.get('/', getProducts);
router.post('/', protect, requireAdmin, addProduct);

module.exports = router;
