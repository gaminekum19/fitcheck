const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { addOwnedItem, getMyClosetItems, deleteOwnedItem } = require('../controllers/ownedItemController');

router.post('/', protect, upload.single('image'), addOwnedItem);
router.get('/', protect, getMyClosetItems);
router.delete('/:id', protect, deleteOwnedItem);

module.exports = router;
