import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: String,
  sku: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  gst: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestEmail: String,
    guestPhone: String,
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    deliveryInstructions: String,
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod', 'upi', 'card', 'netbanking'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'],
      default: 'pending',
    },
    statusHistory: [{
      status: String,
      note: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedAt: { type: Date, default: Date.now },
    }],
    itemsPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
    giftWrapping: { type: Boolean, default: false },
    giftWrappingCharge: { type: Number, default: 0 },
    giftMessage: String,
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    trackingNumber: String,
    courierName: String,
    shippingDate: Date,
    estimatedDelivery: Date,
    upiTransactionId: String,
    paymentScreenshot: { url: String, publicId: String },
    paymentVerificationHistory: [{
      action: { type: String, enum: ['submitted', 'approved', 'rejected'] },
      note: String,
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      at: { type: Date, default: Date.now },
    }],
    adminNotes: String,
    invoiceNumber: String,
    notes: String,
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, paymentMethod: 1 });
orderSchema.index({ guestEmail: 1 });
orderSchema.index({ guestPhone: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
