import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: { type: String, required: true },
    images: [{ url: String, publicId: String }],
    isVerified: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const qaSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    question: { type: String, required: true },
    answer: String,
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answeredAt: Date,
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    godName: { type: String, required: true },
    material: {
      type: String,
      enum: ['brass', 'marble', 'wood', 'clay', 'resin', 'silver', 'copper', 'stone', 'other'],
      required: true,
    },
    height: { type: Number, required: true },
    width: Number,
    weight: Number,
    sku: { type: String, required: true, unique: true },
    barcode: String,
    costPrice: Number,
    sellingPrice: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 18 },
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    images: [{ url: String, publicId: String, alt: String }],
    video: { url: String, publicId: String },
    tags: [String],
    specifications: [{ key: String, value: String }],
    careInstructions: [String],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    reviews: [reviewSchema],
    questions: [qaSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    frequentlyBoughtTogether: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', godName: 'text', tags: 'text' });
productSchema.index({ sellingPrice: 1, stock: 1, godName: 1, material: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
