// Placeholder for cart.routes.js
import express from 'express';
import {
  registerCart,
  getAdminCarts,
  deleteCart,
} from '../controllers/cart.controller.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// Apply the auth middleware to all routes in this file
router.use(requireAuth);

router.route('/').post(registerCart).get(getAdminCarts);
router.route('/:id').delete(deleteCart);

export default router;