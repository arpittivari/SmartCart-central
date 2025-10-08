import path from 'path'; // 👈 Import 'path'
import { fileURLToPath } from 'url'; // 👈 Import 'fileURLToPath'
import dotenv from 'dotenv'; // 👈 ADD THIS LINE
console.log(process.env.DB_USER);
dotenv.config(); // 👈 ADD THIS LINE
import express from 'express';
import cors from 'cors';
import http from 'http'; // 👈 Import http
import { Server } from 'socket.io'; // 👈 Import Server from socket.io
import connectDB from './src/config/db.js';
import config from './src/config/index.js';

import adminRoutes from './src/api/admin.routes.js';
import cartRoutes from './src/api/cart.routes.js';
import analyticsRoutes from './src/api/analytics.routes.js';
import connectMqttClient from './src/services/mqtt.service.js';
import productRoutes from './src/routes/product.routes.js'; // 
import userRoutes from './src/api/user.routes.js'; 
// 

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
connectMqttClient(io); // 👈 Pass the 'io' instance to the MQTT client

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- WebSocket Connection Logic ---
io.on('connection', (socket) => {
  console.log('🔌 New client connected to WebSocket:', socket.id);
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
// --- 👇 VERIFY THIS SECTION EXISTS AND IS CORRECT 👇 ---
// This tells Express: "When a request comes for '/uploads',
// make the contents of the '/backend/uploads' folder public."
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
// --- 👆 END OF VERIFICATION 👆 ---
app.get('/', (req, res) => {
  res.send('SmartCart Central API is running...');
});

// --- Server Activation ---
// 👇 We now listen on the 'server' instance, not the 'app' instance
server.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});