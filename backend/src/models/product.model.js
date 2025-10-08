import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
   mallId: {
    type: String,
    required: true,
  },
  productId: { // Store's internal product ID (e.g., FV001)
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  // You can add more fields here like imageUrl, description, stock, etc.
}, { timestamps: true });

// Ensure unique product ID within a mall
productSchema.index({ mallId: 1, productId: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);

export default Product;