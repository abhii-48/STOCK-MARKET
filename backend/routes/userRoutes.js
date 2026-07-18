const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserFunds, updateOwnFunds } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getAllUsers);

router.route('/profile/funds')
    .put(protect, updateOwnFunds);

router.route('/:id/funds')
    .put(protect, admin, updateUserFunds);

module.exports = router;


