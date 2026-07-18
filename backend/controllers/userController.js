const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Update user funds
// @route   PUT /api/users/:id/funds
// @access  Private/Admin
const updateUserFunds = asyncHandler(async (req, res) => {
    const { amount, type } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
        if (type === 'add') {
            user.balance += Number(amount);
        } else if (type === 'withdraw') {
            if (user.balance < amount) {
                res.status(400);
                throw new Error('Insufficient funds');
            }
            user.balance -= Number(amount);
        }
        await user.save();
        res.json({ message: 'Funds updated successfully', balance: user.balance });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update own funds
// @route   PUT /api/users/profile/funds
// @access  Private
const updateOwnFunds = asyncHandler(async (req, res) => {
    const { amount, type } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        if (type === 'add') {
            user.balance += Number(amount);
        } else if (type === 'withdraw') {
            if (user.balance < amount) {
                res.status(400);
                throw new Error('Insufficient funds');
            }
            user.balance -= Number(amount);
        }
        await user.save();
        res.json({ message: 'Funds updated successfully', balance: user.balance });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getAllUsers,
    updateUserFunds,
    updateOwnFunds
};
