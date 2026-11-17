const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { store } = require('../data/store');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/products
// @desc    Get all products with filtering, search, sorting
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, featured } = req.query;

    if (isMongoConnected()) {
      let query = { isActive: true };

      if (category) query.category = category;
      if (featured === 'true') query.isFeatured = true;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { material: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      let sortOptions = {};
      if (sort === 'price-asc') sortOptions = { price: 1 };
      else if (sort === 'price-desc') sortOptions = { price: -1 };
      else if (sort === 'rating') sortOptions = { rating: -1 };
      else if (sort === 'newest') sortOptions = { createdAt: -1 };
      else sortOptions = { isFeatured: -1, createdAt: -1 };

      const products = await Product.find(query).sort(sortOptions);
      return res.json({ count: products.length, products });
    } else {
      // In-memory store
      let list = [...store.products].filter((p) => p.isActive);

      if (category) {
        list = list.filter((p) => p.category === category);
      }
      if (featured === 'true') {
        list = list.filter((p) => p.isFeatured);
      }
      if (minPrice) {
        list = list.filter((p) => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        list = list.filter((p) => p.price <= Number(maxPrice));
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.material.toLowerCase().includes(q) ||
            p.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }

      if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
      else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
      else if (sort === 'newest') list.sort((a, b) => (a.isNew ? -1 : 1));
      else list.sort((a, b) => (a.isFeatured ? -1 : 1));

      return res.json({ count: list.length, products: list });
    }
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured luxury pieces
router.get('/featured', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const featured = await Product.find({ isFeatured: true, isActive: true }).limit(8);
      return res.json(featured);
    } else {
      const featured = store.products.filter((p) => p.isFeatured && p.isActive).slice(0, 8);
      return res.json(featured);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured pieces.' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product details by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({ $or: [{ slug: id }, { _id: id }] });
      }
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      return res.json(product);
    } else {
      const product = store.products.find((p) => p.id === id || p._id === id || p.slug === id);
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      return res.json(product);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

// @route   POST /api/products
// @desc    Create a new product (with 3D asset metadata)
router.post('/', async (req, res) => {
  try {
    const productData = req.body;

    if (isMongoConnected()) {
      const product = new Product(productData);
      await product.save();
      return res.status(201).json(product);
    } else {
      const newProduct = {
        _id: 'prod-' + Date.now(),
        id: 'prod-' + Date.now(),
        isActive: true,
        ...productData,
      };
      store.products.push(newProduct);
      return res.status(201).json(newProduct);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

module.exports = router;
