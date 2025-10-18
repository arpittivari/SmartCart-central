import mqtt from 'mqtt';
import crypto from 'crypto';
import config from '../config/index.js';
import Cart from '../models/cart.model.js';
import UnclaimedCart from '../models/unclaimedCart.model.js';
import Transaction from '../models/transaction.model.js';
/**
 * A background task that runs periodically to detect and mark stale carts as 'Offline'.
 * @param {object} io The global Socket.IO instance.
 */
const checkStaleCarts = (io) => {
  console.log('⏰ Starting heartbeat monitor to check for stale carts...');
  
  setInterval(async () => {
    // A cart is considered stale if its 'lastSeen' is older than this timeout (e.g., 65 seconds)
    const STALE_TIMEOUT = 65 * 1000; 
    const staleTime = new Date(Date.now() - STALE_TIMEOUT);

    try {
      const staleCarts = await Cart.find({
        lastSeen: { $lt: staleTime },
        status: { $ne: 'Offline' } // Only find carts that are not already marked as offline
      });

      if (staleCarts.length > 0) {
        console.log(`   - ❗ Found ${staleCarts.length} stale cart(s). Marking as Offline.`);
        for (const cart of staleCarts) {
          cart.status = 'Offline';
          const updatedCart = await cart.save();
          // Push the "Offline" status update to the live dashboard
          io.emit('cartUpdate', updatedCart);
        }
      }
    } catch (error) {
      console.error('Error in heartbeat monitor:', error);
    }
  }, 30 * 1000); // Run this check every 30 seconds
};
// 👆 END OF ADDITION 👆

const connectMqttClient = (io) => { 
  const client = mqtt.connect(config.mqtt.url, {
    username: config.mqtt.username,
    password: config.mqtt.password,
  });

  client.on('connect', () => {
    console.log('📡 MQTT Client connected to broker');
    console.log('   - Subscribing to topics...');
    
    // Subscribe to the provisioning topic for new, anonymous carts
    client.subscribe('smartcart/provisioning/announce/#', (err) => {
      if (!err) console.log('   - ✅ Subscribed to [smartcart/provisioning/announce/#]');
    });

    // Subscribe to the master topic for all authenticated cart messages
    client.subscribe('smartcart/#', (err) => {
      if (!err) console.log('   - ✅ Subscribed to [smartcart/#] for all authenticated events');
    });
  });
    checkStaleCarts(io);
  client.on('error', (err) => console.error('MQTT Client Error:', err));

  client.on('message', async (topic, payload) => {
    console.log(`\n📥 MQTT Message Received on topic: [${topic}]`);
    try {
      const message = JSON.parse(payload.toString());

      // --- 1. Handle New Cart Announcements (V3.1 - Secure & Targeted) ---
      if (topic.startsWith('smartcart/provisioning/announce/')) {
        const mallId = topic.split('/')[3];
        const { macAddress } = message;
        if (!macAddress || !mallId) return;

        console.log(`   - 📢 Announcement received for MAC: ${macAddress} for Mall: ${mallId}`);
        const newUnclaimedCart = await UnclaimedCart.findOneAndUpdate(
          { macAddress }, { macAddress, mallId }, { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`   - 💾 Unclaimed cart saved for ${mallId}.`);
        
        // This is the security fix that sends the notification ONLY to the correct mall's admin.
        io.to(mallId).emit('newUnclaimedCart', newUnclaimedCart);
        console.log(`   - 📤 PUSHED 'newUnclaimedCart' notification to room: ${mallId}`);
        return;
      }
      
      // --- 2. Handle All Authenticated Cart Messages (V3.2 - Final & Secure) ---
      // This regex captures the unique username (e.g., 'cart-abcdef') from the topic.
      const secureTopicMatch = topic.match(/smartcart\/(cart-[a-f0-9]+)\/(.*)/);
      if (secureTopicMatch) {
        const username = secureTopicMatch[1];
        const eventType = secureTopicMatch[2];
        
        const cart = await Cart.findOne({ mqttUsername: username });
        if (!cart) {
            console.warn(`   - ⚠️ Message ignored: No cart found with username [${username}]`);
            return;
        }

        // A. Handle Live Telemetry (for the main dashboard)
        if (eventType === 'telemetry') {
            const { battery, status } = message;
            cart.battery = battery;
            cart.status = status;
            cart.lastSeen = new Date();
            const updatedCart = await cart.save();
            // Broadcast this update to all users (for the main dashboard table)
            io.emit('cartUpdate', updatedCart);
            console.log(`   - ✔️  Telemetry for ${cart.cartId} updated. Pushed 'cartUpdate' via WebSocket.`);
        }
        
        // B. Handle Live Events (for the Live Cart View and Payment Flow)
        if (eventType.startsWith('events/')) {
            
            // B.1 - Item Added (Stateful Logic)
             if (eventType === 'events/item_added') {
                const { item } = message;
                try {
                    // Find the cart and push the new item into its 'currentItems' array
                    const updatedCart = await Cart.findOneAndUpdate(
                        { mqttUsername: username },
                        { $push: { currentItems: item } },
                        { new: true } // This option returns the updated document
                    );

                    if (updatedCart) {
                        console.log(`   - 🛒 Item added to ${cart.cartId}: ${item.product_name}. Cart now has ${updatedCart.currentItems.length} items.`);
                        // Push the ENTIRE updated cart object to the frontend's private room
                        io.to(cart._id.toString()).emit('cartStateUpdate', updatedCart);
                        console.log(`   - 📤 Pushed 'cartStateUpdate' to room: ${cart._id.toString()}`);
                    }
                } catch (error) {
                    console.error(`Error processing item_added for ${cart.cartId}:`, error);
                }
            }

            // B.2 - Payment Request (Mock Logic)
            if (eventType === 'events/payment_request') {
                const { amount } = message;
                console.log(`   - 💳 Mock Payment request from ${cart.cartId} for amount ${amount}`);
                
                setTimeout(() => { // Simulate an API call delay
                    const isSuccess = Math.random() > 0.2; // 80% chance of success
                    const responseTopic = `smartcart/${username}/commands`;
                    let responsePayload;

                    if (isSuccess) {
                        const mockPaymentLink = { short_url: `https://mock.smartcart.com/pay/${crypto.randomBytes(8).toString('hex')}` };
                        responsePayload = JSON.stringify({ command: 'paymentInfo', paymentUrl: mockPaymentLink.short_url });
                        console.log(`   - ✅ Mock Payment for ${cart.cartId} SUCCEEDED.`);
                        setTimeout(() => {
                            const confirmPayload = JSON.stringify({
                                command: 'paymentConfirmed',
                                status: 'success',
                                transaction_id: mockPaymentLink.id,
                            });
                            client.publish(responseTopic, confirmPayload);
                            console.log(`   - 🏁 Sent 'paymentConfirmed' status back to ${cart.cartId}.`);
                        }, 10000); // 10-second delay
                    } else {
                        responsePayload = JSON.stringify({ command: 'paymentFailed', reason: 'Simulated gateway failure.' });
                        console.log(`   - ❌ Mock Payment for ${cart.cartId} FAILED.`);
                    }
                    client.publish(responseTopic, responsePayload);
                    console.log(`   - 📤 Sent payment response back to ${cart.cartId}`);
                }, 2000);
            }
        }
      }
    } catch (error) {
      console.error(`Error processing MQTT message on topic ${topic}:`, error);
    }
  });

  return client;
  
};
export default connectMqttClient;
//python mock_cart.py