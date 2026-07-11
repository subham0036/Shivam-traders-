import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';

dotenv.config({ path: '.env' });

const MURTI_IMAGES = [
  'https://images.unsplash.com/photo-1560420713-b279b33e9abf?w=600&q=85',
  'https://images.unsplash.com/photo-1756860750470-f6b1267fcf9c?w=600&q=85',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=85',
  'https://images.unsplash.com/photo-1567786778567-78673942-be055fed5d30?w=600&q=85',
];

const HERO_IMAGE = 'https://images.unsplash.com/photo-1560420713-b279b33e9abf?w=1600&q=85';

const isPlaceholder = (url = '') => /picsum\.photos/i.test(url);

const fix = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Fixing placeholder images...');

  const products = await Product.find({});
  let productUpdates = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const url = p.images?.[0]?.url;
    if (isPlaceholder(url)) {
      p.images = [{ url: MURTI_IMAGES[i % MURTI_IMAGES.length], alt: p.name }];
      await p.save();
      productUpdates++;
    }
  }

  const settings = await Settings.findOne();
  if (settings) {
    settings.banners = settings.banners.map((b) => {
      if (b.type === 'hero' && isPlaceholder(b.image?.url)) {
        return { ...b.toObject?.() || b, image: { url: HERO_IMAGE } };
      }
      if (isPlaceholder(b.image?.url)) {
        return { ...b.toObject?.() || b, image: { url: MURTI_IMAGES[1] } };
      }
      return b;
    });
    await settings.save();
    console.log('Settings banners updated.');
  }

  console.log(`Updated ${productUpdates} product images.`);
  process.exit(0);
};

fix().catch((err) => {
  console.error(err);
  process.exit(1);
});
