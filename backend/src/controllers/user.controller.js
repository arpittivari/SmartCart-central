import User from '../models/user.model.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  res.json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.mallName = req.body.mallName || user.mallName;
    user.brandName = req.body.brandName || user.brandName;
    user.location = req.body.location || user.location;
    user.imageUrl = req.body.imageUrl || user.imageUrl;
    user.recoveryEmail = req.body.email || user.recoveryEmail;
    user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
    // You can add more fields like email here if needed

    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export { getUserProfile, updateUserProfile };