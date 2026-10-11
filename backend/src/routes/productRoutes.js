const express = require('express');
const router = express.Router();
const { getProducts, addProduct } = require('../controllers/productController');

router.get('/', getProducts);
router.post('/', addProduct); // in production, protect this with an admin-only check

module.exports = router;
