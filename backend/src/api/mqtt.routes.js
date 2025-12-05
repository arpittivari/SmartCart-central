import express from 'express';
import Cart from '../models/cart.model.js';
import Transaction from '../models/transaction.model.js';
import Product from '../models/product.model.js';

const router = express.Router();

// POST /api/internal/mqtt/simulate-payment
router.post('/simulate-payment', async (req, res) => {
    const { cartId, mallId, amount, mqttUsername } = req.body;
    const io = req.app.get('io'); 
    const mqttClient = req.app.get('mqttClient');

    console.log(`💸 Simulation: Payment received for ${cartId} (₹${amount/100})`);

    try {
        // 1. Find Cart
        // We need the 'mqttUsername' to publish back to the specific cart
        const cart = await Cart.findOne({ cartId: cartId, mallId: mallId });
        
        if (!cart) {
            console.error(`❌ Cart not found: ${cartId} in mall ${mallId}`);
            return res.status(404).json({ error: 'Cart not found' });
        }

        // 2. Save Transaction
        await Transaction.create({
            mallId: mallId,
            cartId: cart._id,
            totalAmount: amount,
            items: cart.currentItems
        });

        // 3. Clear Cart Database
        cart.currentItems = [];
        cart.status = 'Idle';
        const updatedCart = await cart.save();

        // 4. Broadcast Updates to Dashboard (Socket.IO)
        if (io) {
            io.emit('cartUpdate', updatedCart);
            io.to(cart._id.toString()).emit('cartStateUpdate', updatedCart);
        }

        // 5. Notify Cart Hardware (MQTT) - CRITICAL STEP
        if (mqttClient) {
            // Topic must match what the Pi is listening to: "smartcart/{mqttUsername}/commands"
            const targetUser = mqttUsername || cart.mqttUsername;
            const topic = `smartcart/${targetUser}/commands`;
            
            const payload = JSON.stringify({
                command: 'paymentConfirmed',
                status: 'success',
                transaction_id: `sim_${Date.now()}`
            });

            mqttClient.publish(topic, payload);
            console.log(`   - 📤 Sent 'paymentConfirmed' to topic: ${topic}`);
        } else {
            console.error("❌ MQTT Client not available in request context");
        }

        res.json({ success: true });

    } catch (error) {
        console.error("Simulation Error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;