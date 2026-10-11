const express = require('express');
const router = express.Router();
const { clickAndRedirect } = require('../controllers/clickController');

// No auth required so shared/forwarded links still work
router.get('/:productId', clickAndRedirect);

module.exports = router;
