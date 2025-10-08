import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';
import User from '../models/user.model.js'; // 👈 Import User model
import requireAuth from '../middleware/requireAuth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// --- Image Upload Logic with Multer ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // We use the user's unique ID for a consistent filename
    cb(null, `user-${req.user._id}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });
// ------------------------------------


// --- Main Profile Routes ---
router.route('/profile')
  .get(requireAuth, getUserProfile)
  .put(requireAuth, updateUserProfile);

// --- New, More Robust Avatar Upload Route ---
// This single endpoint handles both the file upload and saving the path to the database.
router.put('/profile/avatar', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.imageUrl = `/${req.file.path.replace(/\\/g, "/")}`;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in avatar upload route:', error);
    res.status(500).json({ message: 'Server error during avatar upload.' });
  }
});


export default router;