const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const { getProducts, addProduct } = require('../controllers/productController');

router.get('/', getProducts);
router.post('/', protect, adminOnly, addProduct); // was open to anyone before

module.exports = router;
