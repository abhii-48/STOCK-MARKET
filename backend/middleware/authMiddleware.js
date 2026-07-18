const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            // BUG FIX: If the user was deleted from DB but token is still valid,
            // findById returns null — guard against that
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            return next();
        } catch (error) {
            // BUG FIX: Added `return` to prevent fall-through to the second
            // response below, which would trigger "headers already sent" crash
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // BUG FIX: Guard is now only reached when the Authorization header is missing
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
