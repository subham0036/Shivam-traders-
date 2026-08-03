import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Settings from '../models/Settings.js';

/** Normalize stored media URLs to relative /uploads/... paths when possible */
export const toRelativeUploadPath = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('/uploads/')) return url;
  const match = url.match(/(\/uploads\/[^?#]+)/);
  return match ? match[1] : url;
};

const migrateDocImages = (images = []) =>
  images.map((img) => {
    if (!img?.url) return img;
    const rel = toRelativeUploadPath(img.url);
    return rel === img.url ? img : { ...img, url: rel };
  });

export const migrateMediaUrls = async () => {
  if (mongoose.connection.readyState !== 1) return;

  let updated = 0;

  const products = await Product.find({});
  for (const product of products) {
    const images = migrateDocImages(product.images);
    const changed = JSON.stringify(images) !== JSON.stringify(product.images);
    if (changed) {
      product.images = images;
      await product.save();
      updated += 1;
    }
  }

  const categories = await Category.find({ 'image.url': { $exists: true } });
  for (const cat of categories) {
    if (!cat.image?.url) continue;
    const rel = toRelativeUploadPath(cat.image.url);
    if (rel !== cat.image.url) {
      cat.image.url = rel;
      await cat.save();
      updated += 1;
    }
  }

  const settings = await Settings.findOne();
  if (settings) {
    let settingsChanged = false;

    if (settings.payment?.upiQrCode?.url) {
      const rel = toRelativeUploadPath(settings.payment.upiQrCode.url);
      if (rel !== settings.payment.upiQrCode.url) {
        settings.payment.upiQrCode.url = rel;
        settings.markModified('payment');
        settingsChanged = true;
      }
    }

    if (settings.homeShowcase?.length) {
      const next = settings.homeShowcase.map((item) => {
        if (!item.image?.url) return item;
        const rel = toRelativeUploadPath(item.image.url);
        return rel === item.image.url ? item : { ...item, image: { ...item.image, url: rel } };
      });
      if (JSON.stringify(next) !== JSON.stringify(settings.homeShowcase)) {
        settings.homeShowcase = next;
        settings.markModified('homeShowcase');
        settingsChanged = true;
      }
    }

    if (settings.banners?.length) {
      const next = settings.banners.map((b) => {
        if (!b.image?.url) return b;
        const rel = toRelativeUploadPath(b.image.url);
        return rel === b.image.url ? b : { ...b, image: { ...b.image, url: rel } };
      });
      if (JSON.stringify(next) !== JSON.stringify(settings.banners)) {
        settings.banners = next;
        settings.markModified('banners');
        settingsChanged = true;
      }
    }

    if (settingsChanged) {
      await settings.save();
      updated += 1;
    }
  }

  if (updated > 0) {
    console.log(`Media URL migration: updated ${updated} record(s) to relative /uploads paths.`);
  }
};
