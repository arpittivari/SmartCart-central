import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration and Database
import connectDB from './src/config/db.js';
import config from './src/config/index.js';

// Services
import connectMqttClient from './src/services/mqtt.service.js';

// API Route Imports
import adminRoutes from './src/api/admin.routes.js';
import cartRoutes from './src/api/cart.routes.js';
import analyticsRoutes from './src/api/analytics.routes.js';
import productRoutes from './src/routes/product.routes.js'; // THIS IS THE CRITICAL FIX
import userRoutes from './src/api/user.routes.js';
import unclaimedRoutes from './src/api/unclaimed.routes.js';
import mqttRoutes from './src/api/mqtt.routes.js';

// --- ES Module Path Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Initializations ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // We will make this more secure below
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// --- Connect to Services ---
connectDB();
const mqttClient = connectMqttClient(io);
app.set('mqttClient', mqttClient); // Make MQTT client globally available

// --- Middleware ---
// This is the secure configuration for both local and production deployment
const corsOptions = {
  origin: [
    'http://localhost:5173', // Your local frontend for development
    'https://smart-cart-central-git-main-arpit-tiwari-s-projects.vercel.app' // IMPORTANT: Replace with your actual Vercel URL
  ],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- WebSocket Connection Logic ---
io.on('connection', (socket) => {
  console.log('🔌 New client connected to WebSocket:', socket.id);
  
  socket.on('joinRoom', (mallId) => { /* ... (this logic is correct) ... */ });
  socket.on('subscribeToCart', (cartId) => { /* ... (this logic is correct) ... */ });
  socket.on('unsubscribeFromCart', (cartId) => { /* ... (this logic is correct) ... */ });
  socket.on('disconnect', () => { console.log('Client disconnected:', socket.id); });
});

// --- API Routes ---
app.use('/api/admin', adminRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/unclaimed', unclaimedRoutes);
app.use('/api/internal/mqtt', mqttRoutes);

// --- Static Folder for Uploads ---
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- Test Route ---
app.get('/', (req, res) => {
  res.send('SmartCart Central API is running...');
});

// --- Server Activation ---
server.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});