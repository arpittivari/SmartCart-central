import crypto from 'crypto';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import Cart from '../models/cart.model.js';
import UnclaimedCart from '../models/unclaimedCart.model.js';

// Create a promise-based version of the exec command
const execPromise = util.promisify(exec);

/**
 * @desc    Claims a new cart and registers it to the logged-in admin
 * @route   POST /api/carts
 * @access  Private
 */
const registerCart = async (req, res) => {
  // THIS IS THE FIX #1: We ONLY expect cartId and macAddress from the frontend.
  const { cartId, macAddress } = req.body;

  if (!cartId || !macAddress) {
    return res.status(400).json({ message: 'Cart ID and MAC Address are required.' });
  }

  try {
    // THIS IS THE FIX #2: We now correctly GENERATE the credentials here on the backend.
    const mqttUsername = `cart-${crypto.randomBytes(4).toString('hex')}`;
    const mqttPassword = crypto.randomBytes(4).toString('hex');

    const newCart = new Cart({
      cartId,
      macAddress,
      mqttUsername, // Use the newly generated username
      mqttPassword, // Use the newly generated password
      mallId: req.user.mallId,
      createdBy: req.user._id,
    });
    const savedCart = await newCart.save();
    try {
      // This is the final, correct path to your password file.
      const passwordFilePath = `"${path.join(projectRoot, 'mosquitto', 'config', 'mosquitto.pwd')}"`;
      const command = `.\\mosquitto_passwd.exe -b ${passwordFilePath} ${mqttUsername} ${mqttPassword}`;
      
      await execPromise(command, { cwd: 'C:\\Program Files (x86)\\mosquitto' });
      console.log(`✅ User '${mqttUsername}' automatically added to Mosquitto.`);
    } catch (error) {
      console.error('CRITICAL: Failed to execute mosquitto_passwd command.', error);
    }
    const client = req.app.get('mqttClient');
    if (client) {
        // This is the topic your Python script is actually listening on
        const claimedTopic = `smartcart/provisioning/claimed/${macAddress}`;
        
        // This is the simple confirmation message it is expecting
        client.publish(claimedTopic, JSON.stringify({ status: "claimed" }));
        
        console.log(`📤 PUSHED 'claimed' confirmation to waiting cart on topic: ${claimedTopic}`);
    }

    // Per our V5.0 design, we no longer need to publish credentials back.
    // The user gets them from the UI.
    
    // Clean up the unclaimed cart record if it exists
    await UnclaimedCart.deleteOne({ macAddress });

    res.status(201).json(savedCart);

  } catch (error) {
    console.error('Error registering cart:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A cart with this ID or MAC address already exists.' });
    }
    res.status(500).json({ message: 'Server error while registering cart.' });
  }
}

/**
 * @desc    Get all carts for the currently logged-in admin
 * @route   GET /api/carts
 * @access  Private
 */
const getAdminCarts = async (req, res) => {
  try {
    const carts = await Cart.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(carts);
  } catch (error) {
    console.error('Error fetching carts:', error);
    res.status(500).json({ message: 'Server error while fetching carts.' });
  }
};

/**
 * @desc    Delete a cart owned by the logged-in admin
 * @route   DELETE /api/carts/:id
 * @access  Private
 */
const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }
    if (cart.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this cart.' });
    }
    await Cart.deleteOne({ _id: req.params.id });
    res.json({ message: 'Cart removed successfully.' });
  } catch (error) {
    console.error('Error deleting cart:', error);
    res.status(500).json({ message: 'Server error while deleting cart.' });
  }
};

export { registerCart, getAdminCarts, deleteCart };