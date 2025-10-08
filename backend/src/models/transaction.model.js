// Placeholder for transaction.model.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  mallId: { type: String, required: true },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  totalAmount: { type: Number, required: true },
  items: [{
    // Assuming the structure from your RPi will be something like this.
    // We can adjust if needed.
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
  }],
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;