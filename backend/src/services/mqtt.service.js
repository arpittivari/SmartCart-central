import mqtt from 'mqtt';
import crypto from 'crypto';
import config from '../config/index.js';
import Cart from '../models/cart.model.js';
import UnclaimedCart from '../models/unclaimedCart.model.js';
import Transaction from '../models/transaction.model.js';
import Product from '../models/product.model.js';
import { createPaymentLink } from './payment.service.js';

/**
 * A background task that runs periodically to detect and mark stale carts as 'Offline'.
 * @param {object} io The global Socket.IO instance.
 */
const checkStaleCarts = (io) => {
  console.log('⏰ Starting heartbeat monitor to check for stale carts...');
  
  setInterval(async () => {
    const STALE_TIMEOUT = 65 * 1000; // 65 seconds
    const staleTime = new Date(Date.now() - STALE_TIMEOUT);
    try {
      const staleCarts = await Cart.find({
        lastSeen: { $lt: staleTime },
        status: { $ne: 'Offline' }
      });
      if (staleCarts.length > 0) {
        console.log(`   - ❗ Found ${staleCarts.length} stale cart(s). Marking as Offline.`);
        for (const cart of staleCarts) {
          cart.status = 'Offline';
          await cart.save();
          // Broadcast to dashboard
          io.emit('cartUpdate', cart);
          // Also emit to the specific room so Live View updates
          io.to(cart._id.toString()).emit('cartUpdate', cart); 
        }
      }
    } catch (error) {
      console.error('Error in heartbeat monitor:', error);
    }
  }, 30 * 1000); 
};

const connectMqttClient = (io) => { 
  const client = mqtt.connect(config.mqtt.url, {
    username: config.mqtt.username,
    password: config.mqtt.password,
  });

  client.on('connect', () => {
    console.log('📡 MQTT Client connected to broker');
    client.subscribe('smartcart/provisioning/announce/#');
    client.subscribe('smartcart/#');
  });

  checkStaleCarts(io);

  client.on('error', (err) => console.error('MQTT Client Error:', err));

  client.on('message', async (topic, payload) => {
    try {
      const message = JSON.parse(payload.toString());

      // --- 1. Handle New Cart Announcements ---
      if (topic.startsWith('smartcart/provisioning/announce/')) {
        const mallId = topic.split('/')[3];
        const { macAddress } = message;
        if (!macAddress || !mallId) return;

        const newUnclaimedCart = await UnclaimedCart.findOneAndUpdate(
          { macAddress }, { macAddress, mallId }, { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        io.to(mallId).emit('newUnclaimedCart', newUnclaimedCart);
        return;
      }
      
      // --- 2. Handle Authenticated Cart Messages ---
      const secureTopicMatch = topic.match(/smartcart\/(cart-[a-f0-9]+)\/(.*)/);
      if (secureTopicMatch) {
        const username = secureTopicMatch[1];
        const eventType = secureTopicMatch[2];
        
        const cart = await Cart.findOne({ mqttUsername: username });
        if (!cart) return;

        // A. Telemetry
        if (eventType === 'telemetry') {
            const { battery, status } = message;
            cart.battery = battery;
            cart.status = status;
            cart.lastSeen = new Date();
            const updatedCart = await cart.save();
            io.emit('cartUpdate', updatedCart);
        }
        
        // B. Events
        if (eventType.startsWith('events/')) {
            
            // B.1 - Item Added
            if (eventType === 'events/item_added') {
                const { item } = message;
                let updatedCart;
                if (cart.status === 'Idle') {
                    updatedCart = await Cart.findOneAndUpdate(
                        { mqttUsername: username },
                        { $set: { currentItems: [item], status: 'Shopping' } },
                        { new: true }
                    );
                } else {
                    updatedCart = await Cart.findOneAndUpdate(
                        { mqttUsername: username },
                        { $push: { currentItems: item } },
                        { new: true }
                    );
                }
                if (updatedCart) {
                    io.to(cart._id.toString()).emit('cartStateUpdate', updatedCart);
                }
            }

            // B.2 - Payment Request (Real Simulator Logic)
            if (eventType === 'events/payment_request') {
                const { amount, mqtt_username } = message; 
                console.log(`   - 💳 Payment request from ${cart.cartId} (User: ${mqtt_username || username})`);
                const responseTopic = `smartcart/${username}/commands`;

                try {
                    const serverIp = "10.49.252.33"; // 👈 UPDATED FROM IPCONFIG
                    
                    // Generate the Simulator Link
                    const paymentUrl = `http://${serverIp}:5000/pay/simulator.html?cartId=${cart.cartId}&mallId=${cart.mallId}&amount=${amount}&mqttUser=${mqtt_username || username}`;
                    
                     const transactionId = `txn_${Date.now()}`;

                     const responsePayload = JSON.stringify({ 
                        command: 'paymentInfo', 
                        paymentUrl: paymentUrl,
                        transactionId: transactionId
                    });
                    client.publish(responseTopic, responsePayload);
                    console.log(`   - 📤 Payment Simulator Link Sent to ${cart.cartId}`);

                    // NOTE: We REMOVED the setTimeout() auto-confirmation.
                    // We now wait for you to actually click "Pay" on the phone/simulator page.

                } catch (error) {
                    console.error(`   - ❌ Payment Error:`, error.message);
                    client.publish(responseTopic, JSON.stringify({ command: 'paymentFailed', reason: 'Gateway Error' }));
                }
            }

            // B.3 - Security Alert (The "Red Light" Feature)
            if (eventType === 'events/alert') {
                const { reason, product_id } = message;
                console.log(`🚨 SECURITY ALERT: ${cart.cartId} - ${reason}`);
                
                // Broadcast to Admin Dashboard immediately
                io.to(cart.mallId).emit('securityAlert', {
                    cartId: cart.cartId,
                    cartName: cart.cartId, // Or a friendly name if you have one
                    reason: reason,
                    productId: product_id,
                    timestamp: new Date()
                });
            }
        }
      }
    } catch (error) {
      console.error(`Error processing MQTT message:`, error);
    }
  });

  return client;
};

export default connectMqttClient;