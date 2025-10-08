import Cart from '../models/cart.model.js';
import crypto from 'crypto'; // 👈 Import the crypto module
import { exec } from 'child_process'; // 👈 Import the 'exec' function
import util from 'util'; // 👈 Import 'util' to promisify exec
import sendEmail from '../utils/sendEmail.js';

/**
 *
 * @desc    Register a new cart for the logged-in admin
 * @route   POST /api/carts
 * @access  Private (requires authentication)
 */
const forgotPassword = async (req, res) => {
  // ... (find the user by mallId)
  
  try {
    const user = await User.findOne({ mallId });
    if (!user || !user.recoveryEmail) {
      // We send a success response even if the user is not found
      // to prevent people from guessing valid mall IDs.
      return res.status(200).json({ success: true, data: 'Email sent if user exists.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    
    try {
        await sendEmail({
            email: user.recoveryEmail,
            subject: 'SmartCart Central Password Reset',
            message,
        });
        res.status(200).json({ success: true, data: 'Email sent.' });
    } catch (err) {
        console.error('Email could not be sent:', err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const registerCart = async (req, res) => {
  const { cartId, macAddress, firmwareVersion } = req.body;

  // Basic validation
  if (!cartId || !macAddress) {
    return res.status(400).json({ message: 'Please provide a Cart ID and MAC Address.' });
  }

  try {
    // Check if a cart with this MAC address already exists anywhere
    const macExists = await Cart.findOne({ macAddress });
    if (macExists) {
      return res.status(400).json({ message: 'A cart with this MAC address already exists.' });
    }

    // Check if the cartId is already in use for this specific mall
    const cartIdExists = await Cart.findOne({ cartId, mallId: req.user.mallId });
    if(cartIdExists) {
        return res.status(400).json({ message: `Cart ID "${cartId}" is already in use in your mall.`})
    }
 // --- 👇 GENERATE UNIQUE CREDENTIALS 👇 ---
    const mqttUsername = `cart-${crypto.randomBytes(6).toString('hex')}`;
    const mqttPassword = crypto.randomBytes(12).toString('hex');
    // --- 👆 END OF GENERATION 👆 ---

    // Create the new cart object
    const newCart = new Cart({
      cartId,
      macAddress,
      firmwareVersion,
    
      // This is the secure linking. We get the mallId and user._id
      // from the req.user object, which was securely added by our
      // authentication middleware. We do NOT trust the frontend for this info.
      mallId: req.user.mallId,
      createdBy: req.user._id,
      mqttUsername, // 👈 Add to new cart object
      mqttPassword, // 
    });

    const savedCart = await newCart.save();
    try {
      // Define the paths to your mosquitto tools and password file
      const mosquittoPath = '"C:\\Program Files\\mosquitto\\mosquitto_passwd.exe"';
      const passwordFilePath = '"C:\\Program Files\\mosquitto\\passwordfile.txt"';
      
      // Construct the command to add/update the password.
      // The -b flag runs it in batch mode.
      const command = `${mosquittoPath} -b ${passwordFilePath} ${mqttUsername} ${mqttPassword}`;
      
      console.log(`Executing command: ${command}`);
      const { stdout, stderr } = await execPromise(command);

      if (stderr) {
        console.error('Error updating Mosquitto password file:', stderr);
        // This is a non-fatal error for the user, but should be logged for the admin.
        // The cart is still created, but MQTT auth will fail until fixed manually.
      } else {
        console.log(`✅ Successfully added/updated user '${mqttUsername}' in Mosquitto password file.`);
      }

    } catch (error) {
        console.error('CRITICAL: Failed to execute mosquitto_passwd command.', error);
    }
    res.status(201).json(savedCart);
  } catch (error) {
    console.error('Error registering cart:', error);
    res.status(500).json({ message: 'Server error while registering cart.' });
  }
};

/**
 * @desc    Get all carts for the currently logged-in admin
 * @route   GET /api/carts
 * @access  Private
 */
const getAdminCarts = async (req, res) => {
  try {
    // Find all carts that were created by this specific user
    const carts = await Cart.find({ createdBy: req.user._id });
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

    // CRITICAL SECURITY CHECK:
    // Ensure the admin trying to delete the cart is the one who created it.
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