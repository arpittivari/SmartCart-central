import express from 'express';
import { uploadProducts, getMallProducts, deleteProduct } from '../controllers/product.controller.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// All routes are protected
router.use(requireAuth);

// GET all products for the mall
router.get('/', getMallProducts);

// POST a JSON array to upload/update products
// This route is now simple and just expects a JSON body.
router.post('/upload', uploadProducts);

// DELETE a specific product by its MongoDB _id
router.delete('/:id', deleteProduct);

export default router;

