import mqtt from 'mqtt';
import crypto from 'crypto';
import config from '../config/index.js';
import Cart from '../models/cart.model.js';
import UnclaimedCart from '../models/unclaimedCart.model.js';
import Transaction from '../models/transaction.model.js';
import Product from '../models/product.model.js'; // This was the missing import

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
          const updatedCart = await cart.save();
          io.emit('cartUpdate', updatedCart);
        }
      }
    } catch (error) {
      console.error('Error in heartbeat monitor:', error);
    }
  }, 30 * 1000); // Run this check every 30 seconds
};

const connectMqttClient = (io) => { 
  const client = mqtt.connect(config.mqtt.url, {
    username: config.mqtt.username,
    password: config.mqtt.password,
  });

  client.on('connect', () => {
    console.log('📡 MQTT Client connected to broker');
    console.log('   - Subscribing to topics...');
    
    client.subscribe('smartcart/provisioning/announce/#', (err) => {
      if (!err) console.log('   - ✅ Subscribed to [smartcart/provisioning/announce/#]');
    });
    client.subscribe('smartcart/#', (err) => {
      if (!err) console.log('   - ✅ Subscribed to [smartcart/#] for all authenticated events');
    });
  });

  // Start the watchdog timer
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
        
        io.to(mallId).emit('newUnclaimedCart', newUnclaimedCart);
        console.log(`   - 📤 PUSHED 'newUnclaimedCart' notification to room: ${mallId}`);
        return;
      }
      
      // --- 2. Handle All Authenticated Cart Messages (V3.2 - Final & Secure) ---
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
            io.emit('cartUpdate', updatedCart);
            console.log(`   - ✔️  Telemetry for ${cart.cartId} updated. Pushed 'cartUpdate' via WebSocket.`);
        }
        
        // B. Handle Live Events (for the Live Cart View and Payment Flow)
        if (eventType.startsWith('events/')) {
            
            // B.1 - Item Added (Stateful Logic)
            if (eventType === 'events/item_added') {
                const { item } = message;
                let updatedCart;
                if (cart.status === 'Idle') {
                    console.log(`   - 🚀 New shopping session started for ${cart.cartId}. Overwriting old items.`);
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
                    console.log(`   - 🛒 Item added to ${cart.cartId}: ${item.product_name}. Cart now has ${updatedCart.currentItems.length} items.`);
                    io.to(cart._id.toString()).emit('cartStateUpdate', updatedCart);
                    console.log(`   - 📤 Pushed 'cartStateUpdate' to room: ${cart._id.toString()}`);
                }
            }

            // B.2 - Payment Request (Mock Logic)
            if (eventType === 'events/payment_request') {
                const { amount } = message;
                console.log(`   - 💳 Mock Payment request from ${cart.cartId} for amount ${amount}`);
                
                setTimeout(async () => { // 👈 Make sure this is 'async'
                    const isSuccess = Math.random() > 0.2; // 80% success chance
                    const responseTopic = `smartcart/${username}/commands`;
                    let responsePayload;

                    if (isSuccess) {
                        const mockPaymentLink = { short_url: `https://mock.smartcart.com/pay/${crypto.randomBytes(8).toString('hex')}`, id: `txn_mock_${crypto.randomBytes(10).toString('hex')}` };
                        responsePayload = JSON.stringify({ command: 'paymentInfo', paymentUrl: mockPaymentLink.short_url });
                        console.log(`   - ✅ Mock Payment for ${cart.cartId} SUCCEEDED.`);
                        
                        try {
                            // --- Step 1: Save the Transaction for Analytics ---
                            const newTransaction = new Transaction({
                                mallId: cart.mallId,
                                cartId: cart._id,
                                totalAmount: amount,
                                items: cart.currentItems
                            });
                            await newTransaction.save();
                            console.log(`   - 📈 Transaction saved for ${cart.cartId}. Analytics are updated.`);

                            // --- Step 2: Update the Product Inventory ---
                            const itemCounts = {};
                            for (const item of cart.currentItems) {
                                itemCounts[item.product_id] = (itemCounts[item.product_id] || 0) + 1;
                            }
                            const stockUpdates = Object.keys(itemCounts).map(productId => ({
                                updateOne: {
                                    filter: { productId: productId, mallId: cart.mallId },
                                    update: { $inc: { quantity: -itemCounts[productId] } }
                                }
                            }));
                            if (stockUpdates.length > 0) {
                                await Product.bulkWrite(stockUpdates);
                                console.log(`   - 📦 Inventory updated for ${Object.keys(itemCounts).length} product(s).`);
                            }

                            // --- Step 3: Reset the Cart (The Cleanup) ---
                            cart.currentItems = [];
                            cart.status = 'Idle';
                            const updatedCart = await cart.save();
                            io.emit('cartUpdate', updatedCart);
                            console.log(`   - 🧹 Cart ${cart.cartId} state has been reset to Idle.`);
                        } catch (dbError) {
                            console.error(`   - ❌ CRITICAL: Failed to save transaction or update inventory:`, dbError);
                        }
                        
                        // --- Step 4: Send confirmation to cart ---
                        setTimeout(() => {
                            const confirmPayload = JSON.stringify({
                                command: 'paymentConfirmed',
                                status: 'success',
                                transaction_id: mockPaymentLink.id,
                            });
                            client.publish(responseTopic, confirmPayload);
                            console.log(`   - 🏁 Sent 'paymentConfirmed' status back to ${cart.cartId}.`);
                        }, 10000);

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