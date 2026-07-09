import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['stock_in', 'stock_out', 'adjustment', 'sale', 'return'], required: true },
  quantity: { type: Number, required: true },
  previousStock: Number,
  newStock: Number,
  reason: String,
  supplier: String,
  purchasePrice: Number,
  reference: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    currentStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    supplier: {
      name: String,
      contact: String,
      email: String,
      address: String,
    },
    logs: [inventoryLogSchema],
    lastRestocked: Date,
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
