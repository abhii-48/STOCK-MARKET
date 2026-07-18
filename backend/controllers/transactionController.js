const Transaction = require('../models/Transaction');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const createTransaction = asyncHandler(async (req, res) => {
    const { symbol, type, quantity, price } = req.body;
    const total = quantity * price;

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (type === 'buy') {
        if (user.balance < total) {
            res.status(400);
            throw new Error('Insufficient funds to place this order');
        }
        // Deduct balance immediately for 'buy' orders
        user.balance -= total;
        await user.save();
    }

    const transaction = await Transaction.create({
        user: req.user._id,
        symbol: symbol.toUpperCase(),
        type,
        quantity,
        price,
        total,
        status: 'pending'
    });

    if (transaction) {
        res.status(201).json(transaction);
    } else {
        // Refund if transaction creation fails (though unlikely with await)
        if (type === 'buy') {
            user.balance += total;
            await user.save();
        }
        res.status(400).json({ message: 'Invalid transaction data' });
    }
});

const getMyTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ user: req.user._id }).sort('-createdAt');
    res.json(transactions);
});

const getAllTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({}).populate('user', 'username email').sort('-createdAt');
    res.json(transactions);
});

const updateTransactionStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id).populate('user');

    if (transaction) {
        if (transaction.status === status) {
            return res.json(transaction);
        }

        const user = await User.findById(transaction.user._id);
        
        // Handle transitions to 'approved' or 'rejected'
        if (status === 'approved') {
            if (transaction.type === 'sell') {
                // For 'sell', we add balance only when approved
                user.balance += transaction.total;
            }
            // For 'buy', balance was already deducted
        } else if (status === 'rejected') {
            if (transaction.type === 'buy') {
                // If 'buy' is rejected, refund the balance
                user.balance += transaction.total;
            }
            // For 'sell', nothing was deducted yet
        }

        await user.save();
        transaction.status = status;
        const updatedTransaction = await transaction.save();
        res.json(updatedTransaction);
    } else {
        res.status(404).json({ message: 'Transaction not found' });
    }
});


module.exports = { createTransaction, getMyTransactions, getAllTransactions, updateTransactionStatus };
