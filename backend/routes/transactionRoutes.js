const express = require('express');
const router = express.Router();
const { createTransaction, getMyTransactions, getAllTransactions, updateTransactionStatus } = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createTransaction);
router.get('/my', protect, getMyTransactions);
router.get('/all', protect, admin, getAllTransactions);
router.put('/:id', protect, admin, updateTransactionStatus);

module.exports = router;
