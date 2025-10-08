import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import sendEmail from '../utils/sendEmail.js'; // 👈 Import the email utility

// Helper function to generate a JWT
const generateToken = (id, mallId, role) => {
  return jwt.sign({ id, mallId, role }, config.jwtSecret, {
    expiresIn: '1d',
  });
};

// Controller for admin registration
const registerAdmin = async (req, res) => {
  const { mallId, password, recoveryEmail } = req.body;
  try {
    if (!mallId || !password) {
      return res.status(400).json({ message: 'Please provide both a Mall ID and a password.' });
    }
    const userExists = await User.findOne({ mallId });
    if (userExists) {
      return res.status(400).json({ message: 'Mall ID already exists.' });
    }
    if (recoveryEmail) {
      const emailExists = await User.findOne({ recoveryEmail });
      if (emailExists) {
        return res.status(400).json({ message: 'Recovery email is already in use.' });
      }
    }
    const user = await User.create({ mallId, password, recoveryEmail });
    const userObject = user.toObject();
    delete userObject.password;
    res.status(201).json({
      ...userObject,
      token: generateToken(user._id, user.mallId, user.role),
    });
  } catch (error) {
    console.error('🔥🔥 REGISTRATION ERROR 🔥🔥:', error);
    res.status(500).json({ message: 'Internal Server Error. Check server logs for details.' });
  }
};

// Controller for admin login
const loginAdmin = async (req, res) => {
  const { mallId, password } = req.body;
  try {
    const user = await User.findOne({ mallId });
    if (user && (await user.matchPassword(password))) {
      const userObject = user.toObject();
      delete userObject.password;
      res.json({
        ...userObject,
        token: generateToken(user._id, user.mallId, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid Mall ID or password' });
    }
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller for initiating a password reset
const forgotPassword = async (req, res) => {
  const { mallId } = req.body;
  try {
    const user = await User.findOne({ mallId });

    if (!user || !user.recoveryEmail) {
      // Security: Always send a success-like response to prevent guessing valid IDs.
      return res.status(200).json({ success: true, data: 'If an account with that email exists, a reset link has been sent.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL that points to your frontend application
    const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested to reset the password for your SmartCart Central account.\n\nPlease click the link below, or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
    
    try {
      await sendEmail({
        email: user.recoveryEmail,
        subject: 'SmartCart Central - Password Reset Request',
        message,
      });
      res.status(200).json({ success: true, data: 'Email sent successfully.' });
    } catch (err) {
      console.error('🔥🔥 EMAIL SENDING ERROR 🔥🔥:', err);
      // Clear the token if email fails, so it can be re-tried
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: 'Email could not be sent. Check server logs.' });
    }
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller for resetting the password with a token
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    const userObject = user.toObject();
    delete userObject.password;
    res.status(200).json({
      ...userObject,
      token: generateToken(user._id, user.mallId, user.role),
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { registerAdmin, loginAdmin, forgotPassword, resetPassword };