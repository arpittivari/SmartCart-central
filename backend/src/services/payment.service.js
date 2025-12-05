import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../config/index.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

/**
 * Creates a payment link for the cart checkout.
 * @param {number} amount - Amount in lowest denomination (e.g., paise for INR).
 * @param {string} cartId - The ID of the cart requesting payment.
 * @param {string} mallId - The ID of the mall.
 * @returns {Promise<object>} - The payment link object.
 */
export const createPaymentLink = async (amount, cartId, mallId) => {
  try {
    // Create a unique reference ID for this transaction
    const referenceId = `txn_${cartId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Razorpay expects timestamp in seconds for expiry (e.g., 15 mins from now)
    // const expireBy = Math.floor(Date.now() / 1000) + 15 * 60; 

    const options = {
      amount: amount,
      currency: "INR",
      accept_partial: false,
      reference_id: referenceId,
      description: `SmartCart Checkout - ${cartId}`,
      customer: {
        name: "SmartCart Shopper", // Placeholder: In v5.0, fetch this from User Profile
        contact: "+919999999999", 
        email: "shopper@example.com"
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: {
        mall_id: mallId,
        cart_id: cartId
      },
      // callback_url: "https://your-domain.com/payment-success", // Optional: Redirect after payment
      // callback_method: "get"
    };

    const paymentLink = await razorpay.paymentLink.create(options);
    return paymentLink;

  } catch (error) {
    console.error("Razorpay Error:", error);
    throw new Error("Payment gateway initialization failed");
  }
};

export default { createPaymentLink };