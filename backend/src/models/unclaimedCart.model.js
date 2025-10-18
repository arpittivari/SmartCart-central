import mongoose from 'mongoose';

const unclaimedCartSchema = new mongoose.Schema(
  {
    // The unique hardware ID of the ESP device.
    // We make it unique to prevent the same cart from being listed multiple times.
    macAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    // This automatically adds `createdAt` and `updatedAt` fields.
    // We can use `createdAt` to see when the cart was first detected.
    timestamps: true,
  }
);

const UnclaimedCart = mongoose.model('UnclaimedCart', unclaimedCartSchema);

export default UnclaimedCart;