import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Settings from '../models/Settings.js';
import slugify from 'slugify';

dotenv.config({ path: '.env' });

const gods = ['Ganesha', 'Krishna', 'Shiva', 'Lakshmi', 'Hanuman', 'Durga', 'Saraswati', 'Ram', 'Vishnu'];
const materials = ['brass', 'marble', 'wood', 'clay', 'resin', 'copper'];
const MURTI_SEED_IMAGES = [
  'https://images.unsplash.com/photo-1560420713-b279b33e9abf?w=600&q=85',
  'https://images.unsplash.com/photo-1756860750470-f6b1267fcf9c?w=600&q=85',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=85',
  'https://images.unsplash.com/photo-1567786778567-78673942-be055fed5d30?w=600&q=85',
];

const seed = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in server/.env');
    process.exit(1);
  }
  if (!adminEmail || !adminPassword) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before running seed.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected for seeding...');

  await Promise.all([
    User.deleteMany(), Category.deleteMany(), Product.deleteMany(),
    Inventory.deleteMany(), Settings.deleteMany(),
  ]);

  const admin = await User.create({
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    phone: process.env.STORE_PHONE || '',
  });
  console.log('Admin created:', admin.email);

  const categories = await Category.insertMany([
    { name: 'Brass Murtis', slug: 'brass-murtis', description: 'Premium brass idols' },
    { name: 'Marble Murtis', slug: 'marble-murtis', description: 'Elegant marble sculptures' },
    { name: 'Wooden Murtis', slug: 'wooden-murtis', description: 'Handcrafted wooden idols' },
    { name: 'Premium Collection', slug: 'premium-collection', description: 'Luxury divine collection' },
  ]);

  const products = [];
  for (let i = 0; i < 24; i++) {
    const god = gods[i % gods.length];
    const material = materials[i % materials.length];
    const height = 6 + (i % 5) * 2;
    const mrp = 1500 + i * 500;
    const discount = [0, 5, 10, 15, 20][i % 5];
    const sellingPrice = Math.round(mrp * (1 - discount / 100));
    const name = `${god} ${material.charAt(0).toUpperCase() + material.slice(1)} Murti ${height}"`;

    products.push({
      name,
      slug: slugify(name, { lower: true, strict: true }) + `-${i}`,
      description: `Exquisitely crafted ${god} murti made from premium ${material}. Perfect for home temple and gifting. Hand-finished by skilled artisans of Varanasi.`,
      shortDescription: `Premium ${god} idol in ${material}`,
      category: categories[i % 3]._id,
      godName: god,
      material,
      height,
      width: height * 0.6,
      weight: height * 200,
      sku: `ST-${1000 + i}`,
      mrp,
      sellingPrice,
      discount,
      stock: 10 + (i % 8),
      images: [{ url: MURTI_SEED_IMAGES[i % MURTI_SEED_IMAGES.length], alt: name }],
      isFeatured: i < 6,
      isTrending: i % 3 === 0,
      isBestSeller: i % 4 === 0,
      isNewArrival: i < 8,
      isPremium: i % 5 === 0,
      specifications: [
        { key: 'Material', value: material },
        { key: 'Height', value: `${height} inches` },
        { key: 'Finish', value: 'Antique Gold' },
      ],
      careInstructions: ['Wipe with soft dry cloth', 'Avoid harsh chemicals', 'Keep in dry place'],
      rating: 4 + (i % 10) / 10,
      numReviews: 5 + i,
      soldCount: i * 3,
    });
  }

  const createdProducts = await Product.insertMany(products);
  await Inventory.insertMany(createdProducts.map((p) => ({
    product: p._id,
    currentStock: p.stock,
    lowStockThreshold: 5,
  })));

  await Settings.create({
    contact: {
      phone: process.env.STORE_PHONE || '',
      whatsapp: process.env.STORE_WHATSAPP || '',
      email: process.env.STORE_EMAIL || '',
    },
    banners: [
      { title: 'Divine Collection 2026', subtitle: 'Premium Handcrafted Murtis', type: 'hero', isActive: true, image: { url: 'https://images.unsplash.com/photo-1560420713-b279b33e9abf?w=1600&q=85' } },
      { title: 'Diwali Special', subtitle: 'Up to 20% Off on Ganesha & Lakshmi', type: 'festival', isActive: true, image: { url: 'https://images.unsplash.com/photo-1756860750470-f6b1267fcf9c?w=1200&q=85' } },
    ],
    flashSale: { isActive: true, endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), discount: 15 },
    exitIntentCoupon: { code: 'WELCOME10', discount: 10, isActive: true },
  });

  console.log(`Seeded ${createdProducts.length} products, ${categories.length} categories`);
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
