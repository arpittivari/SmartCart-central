import express from 'express';
import { getAnalyticsSummary } from '../controllers/analytics.controller.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// Protect all analytics routes
router.use(requireAuth);
router.get('/summary', getAnalyticsSummary);
export default router;