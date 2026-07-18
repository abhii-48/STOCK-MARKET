const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const addToWatchlist = asyncHandler(async (req, res) => {
    const { symbol, name } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        if (user.watchlist.some(s => s.symbol === symbol.toUpperCase())) {
            return res.status(400).json({ message: 'Already in watchlist' });
        }
        user.watchlist.push({ symbol: symbol.toUpperCase(), name });
        await user.save();
        res.status(201).json(user.watchlist);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

const removeFromWatchlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.watchlist = user.watchlist.filter(s => s.symbol !== req.params.symbol.toUpperCase());
        await user.save();
        res.json(user.watchlist);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

module.exports = { addToWatchlist, removeFromWatchlist };
