const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const { store } = require('../data/store');
const auth = require('../middleware/auth');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @route   PUT /api/users/profile
// @desc    Update user profile & preferences
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, preferences, addresses } = req.body;

    if (isMongoConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (preferences) user.preferences = { ...user.preferences, ...preferences };
      if (addresses) user.addresses = addresses;

      await user.save();
      return res.json({ message: 'Profile updated', user });
    } else {
      const user = store.users.find((u) => u._id === req.user.id) || store.users[0];
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (preferences) user.preferences = { ...user.preferences, ...preferences };
      if (addresses) user.addresses = addresses;

      return res.json({ message: 'Profile updated', user });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
