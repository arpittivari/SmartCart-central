///// for MQTT auth plugin 
import express from 'express';
import { authClient } from '../controllers/mqttAuth.controller.js';

const router = express.Router();

// This is the private endpoint the broker will call
router.post('/auth', authClient);

export default router;