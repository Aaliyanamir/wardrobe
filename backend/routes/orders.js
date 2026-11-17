const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { store } = require('../data/store');
const auth = require('../middleware/auth');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/orders
// @desc    Create a new order from checkout
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, paymentInfo, subtotal, shippingCost, tax, total, promoCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const userId = req.user ? req.user.id : 'guest-user';

    if (isMongoConnected()) {
      const order = new Order({
        user: userId,
        orderNumber,
        items,
        shippingAddress,
        paymentInfo: {
          method: paymentInfo?.method || 'card',
          status: 'completed',
          transactionId: 'txn_' + Date.now(),
        },
        subtotal: subtotal || 0,
        shippingCost: shippingCost || 0,
        tax: tax || 0,
        total: total || subtotal,
        promoCode,
        status: 'processing',
      });
      await order.save();
      return res.status(201).json({ message: 'Order placed successfully', order });
    } else {
      const newOrder = {
        _id: 'ord-' + Date.now(),
        orderNumber,
        user: userId,
        items,
        shippingAddress,
        paymentInfo: {
          method: paymentInfo?.method || 'card',
          status: 'completed',
          transactionId: 'txn_' + Date.now(),
        },
        subtotal,
        shippingCost,
        tax,
        total,
        promoCode,
        status: 'processing',
        createdAt: new Date().toISOString(),
      };
      store.orders.unshift(newOrder);
      return res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    }
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// @route   GET /api/orders
// @desc    Get orders list
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      return res.json(store.orders);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details by ID or orderNumber
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let order = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findById(id);
      }
      if (!order) {
        order = await Order.findOne({ orderNumber: id });
      }
      if (!order) return res.status(404).json({ error: 'Order not found.' });
      return res.json(order);
    } else {
      const order = store.orders.find((o) => o._id === id || o.orderNumber === id);
      if (!order) return res.status(404).json({ error: 'Order not found.' });
      return res.json(order);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

module.exports = router;
