import dotenv from 'dotenv';
dotenv.config(); // This MUST be the first thing to run
import path from 'path'; // 👈 Import 'path'
import { fileURLToPath } from 'url'; // 👈 Import 'fileURLToPath'E
import express from 'express';
import cors from 'cors';
import http from 'http'; // 👈 Import http
import { Server } from 'socket.io'; // 👈 Import Server from socket.io
import connectDB from './src/config/db.js';
import config from './src/config/index.js';
import mqttRoutes from './src/api/mqtt.routes.js';
import adminRoutes from './src/api/admin.routes.js';
import cartRoutes from './src/api/cart.routes.js';
import analyticsRoutes from './src/api/analytics.routes.js';
import connectMqttClient from './src/services/mqtt.service.js';
import productRoutes from './src/routes/product.routes.js'; // 
import userRoutes from './src/api/user.routes.js'; 
import unclaimedRoutes from './src/api/unclaimed.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Initializations ---
const app = express();
const server = http.createServer(app); // 👈 Create an HTTP server from the Express app
const io = new Server(server, { // 👈 Initialize Socket.IO server
  cors: {
    origin: "*", // Adjust for production for security
    methods: ["GET", "POST"]
  }
});

connectDB();
const mqttClient = connectMqttClient(io); // 👈 Capture the client instance
app.set('mqttClient', mqttClient); //

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- WebSocket Connection Logic ---
io.on('connection', (socket) => {
  console.log('🔌 New client connected to WebSocket:', socket.id);
  socket.on('joinRoom', (mallId) => {
    socket.join(mallId);
    console.log(`   - Client ${socket.id} joined room: ${mallId}`);
  });
  socket.on('subscribeToCart', (cartId) => {
    socket.join(cartId);
    console.log(`   - Client ${socket.id} is now listening for live updates from cart: ${cartId}`);
  });

  socket.on('unsubscribeFromCart', (cartId) => {
    socket.leave(cartId);
    console.log(`   - Client ${socket.id} stopped listening to cart: ${cartId}`);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- API Routes ---
app.use('/api/admin', adminRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products', productRoutes); 
app.use('/api/users', userRoutes); // 
app.use('/api/unclaimed', unclaimedRoutes);
app.use('/api/internal/mqtt', mqttRoutes);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/api/unclaimed', unclaimedRoutes);
app.get('/', (req, res) => {
  res.send('SmartCart Central API is running...');
});

// --- Server Activation ---
// 👇 We now listen on the 'server' instance, not the 'app' instance
server.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});