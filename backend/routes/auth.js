const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { store } = require('../data/store');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'wardrobe-luxury-jwt-secret-key-2025';
const isMongoConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    if (isMongoConnected()) {
      let existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
      });
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '30d',
      });

      return res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // In-memory fallback
      const exists = store.users.find((u) => u.email === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'usr-' + Date.now(),
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role: 'user',
        preferences: {
          emailNotifications: true,
          smsUpdates: false,
          hd3DPreview: true,
          saveTryOnSessions: true,
        },
        createdAt: new Date().toISOString(),
      };
      store.users.push(newUser);

      const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
        expiresIn: '30d',
      });

      return res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password.' });
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '30d',
      });

      return res.json({
        message: 'Signed in successfully',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // In-memory fallback
      const user = store.users.find((u) => u.email === email.toLowerCase());
      if (!user) {
        // Allow demo login for fast testing
        if (password.length >= 6) {
          const demoUser = {
            _id: 'usr-' + Date.now(),
            firstName: email.split('@')[0],
            lastName: 'Client',
            email: email.toLowerCase(),
            role: 'user',
          };
          store.users.push(demoUser);
          const token = jwt.sign({ id: demoUser._id, email: demoUser.email, role: demoUser.role }, JWT_SECRET, {
            expiresIn: '30d',
          });
          return res.json({
            message: 'Signed in successfully',
            token,
            user: demoUser,
          });
        }
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '30d',
      });

      return res.json({
        message: 'Signed in successfully',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently authenticated user
router.get('/me', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      return res.json(user);
    } else {
      const user = store.users.find((u) => u._id === req.user.id) || store.users[0];
      return res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

module.exports = router;
