// Placeholder for cart.model.js
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    cartId: {
      type: String,
      required: true,
      trim: true,
    },
    mallId: { // We'll store this for easy querying
      type: String,
      required: true,
    },
    macAddress: {
      type: String,
      required: true,
      unique: true,
    },
    currentItems: [{
        product_id: String,
        product_name: String,
        price: Number
    }],
      // 👇 ADD THESE NEW FIELDS 👇
    mqttUsername: { type: String, required: true, unique: true },
    mqttPassword: { type: String, required: true },
    // 👆 END OF ADDITION 👆
    firmwareVersion: {
      type: String,
      default: '1.0.0',
    },
    status: {
      type: String,
      enum: ['Idle', 'Shopping', 'Payment', 'Offline'],
      default: 'Offline',
    },
    battery: {
      type: Number,
      default: 100,
    },
    location: {
      // Storing as a GeoJSON Point is best for map features later
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    // This links the cart to the admin who registered it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    
    timestamps: true,
    // 👇 This index ensures a cartId is unique ONLY within the same mallId 👇
    indexes: [{ fields: { cartId: 1, mallId: 1 }, unique: true }],
  }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;