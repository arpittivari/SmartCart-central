import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/forgotpassword', forgotPassword); // 👈 New forgot password route
router.put('/resetpassword/:resetToken', resetPassword); // 👈 New reset password route

export default router;