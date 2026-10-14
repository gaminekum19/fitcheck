const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { tryOn } = require('../controllers/tryonController');

router.post('/', protect, tryOn);

module.exports = router;
