const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SavedLook = require('../models/SavedLook');
const { store } = require('../data/store');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/looks
// @desc    Get all saved 3D looks
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const looks = await SavedLook.find().populate('items.product').sort({ createdAt: -1 });
      return res.json(looks);
    } else {
      return res.json(store.looks);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved looks.' });
  }
});

// @route   POST /api/looks
// @desc    Save a new 3D outfit combination
router.post('/', async (req, res) => {
  try {
    const { name, items, lightingPreset, thumbnail, isPublic } = req.body;

    if (!name || !items || items.length === 0) {
      return res.status(400).json({ error: 'Look must have a name and items.' });
    }

    if (isMongoConnected()) {
      const look = new SavedLook({
        user: req.user ? req.user.id : new mongoose.Types.ObjectId(),
        name,
        items,
        lightingPreset: lightingPreset || 'daylight',
        thumbnail,
        isPublic: !!isPublic,
      });
      await look.save();
      return res.status(201).json(look);
    } else {
      const newLook = {
        _id: 'look-' + Date.now(),
        name,
        items,
        lightingPreset: lightingPreset || 'daylight',
        thumbnail,
        isPublic: !!isPublic,
        likes: 0,
        createdAt: new Date().toISOString(),
      };
      store.looks.unshift(newLook);
      return res.status(201).json(newLook);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to save look.' });
  }
});

// @route   DELETE /api/looks/:id
// @desc    Delete a saved look
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      await SavedLook.findByIdAndDelete(id);
      return res.json({ message: 'Look deleted.' });
    } else {
      store.looks = store.looks.filter((l) => l._id !== id);
      return res.json({ message: 'Look deleted.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete look.' });
  }
});

module.exports = router;
