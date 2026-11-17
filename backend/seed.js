const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const { initialProducts } = require('./data/store');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wardrobe');
    console.log('Connected to MongoDB for seeding...');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    await Product.insertMany(initialProducts);
    console.log(`Successfully seeded ${initialProducts.length} luxury products with 3D/PBR metadata.`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
