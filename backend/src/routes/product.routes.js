import express from 'express';
// 👇 CHANGE this line from 'auth.middleware.js' to the correct filename
import requireAuth from '../middleware/requireAuth.js'; 
import { uploadProducts, getMallProducts, deleteProduct } from '../controllers/product.controller.js';

const router = express.Router();

// Protect all routes in this file
router.use(requireAuth); 

// The routes themselves are correct
router.post('/upload', uploadProducts);
router.get('/', getMallProducts);
router.delete('/:id', deleteProduct);

export default router;