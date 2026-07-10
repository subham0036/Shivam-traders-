import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Shivam Traders' },
    tagline: { type: String, default: 'Premium Hindu God Murtis' },
    logo: { url: String, publicId: String },
    favicon: { url: String, publicId: String },
    contact: {
      phone: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: 'Shivam Traders, Jogbani, Ashok Cinema Road, Ward No. 5, Gupta Market, Araria (Bihar) — 854328' },
      businessHours: { type: String, default: 'Mon-Sat: 9AM - 8PM' },
    },
    social: {
      instagram: String,
      facebook: String,
      youtube: String,
      twitter: String,
    },
    shipping: {
      freeShippingThreshold: { type: Number, default: 2000 },
      standardShippingCharge: { type: Number, default: 99 },
      expressShippingCharge: { type: Number, default: 199 },
      gstRate: { type: Number, default: 18 },
      giftWrappingCharge: { type: Number, default: 50 },
    },
    banners: [{
      title: String,
      subtitle: String,
      image: { url: String, publicId: String },
      link: String,
      type: { type: String, enum: ['hero', 'festival', 'popup', 'flash_sale'], default: 'hero' },
      isActive: { type: Boolean, default: true },
      startDate: Date,
      endDate: Date,
      couponCode: String,
    }],
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      googleAnalyticsId: String,
    },
    flashSale: {
      isActive: { type: Boolean, default: false },
      endTime: Date,
      discount: Number,
    },
    exitIntentCoupon: {
      code: String,
      discount: Number,
      isActive: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
