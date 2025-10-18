///// for MQTT auth plugin 

import User from '../models/user.model.js';
import Cart from '../models/cart.model.js';
import config from '../config/index.js';

const authClient = async (req, res) => {
  const { username, password } = req.body;

  try {
    // First, check if it's our special backend user
    if (username === config.mqtt.username && password === config.mqtt.password) {
      console.log(`[MQTT Auth] ✅ Backend user '${username}' authenticated successfully.`);
      return res.status(200).send('ok');
    }

    // If not, check if it's a provisioned cart in our database
    const cart = await Cart.findOne({ mqttUsername: username });
    if (cart && cart.mqttPassword === password) {
      console.log(`[MQTT Auth] ✅ Cart '${cart.cartId}' authenticated successfully.`);
      return res.status(200).send('ok');
    }

    // If it's neither, deny access
    console.log(`[MQTT Auth] ❌ FAILED authentication for user: '${username}'`);
    return res.status(401).send('unauthorized');

  } catch (error) {
    console.error('[MQTT Auth] ❌ Server error during authentication:', error);
    return res.status(500).send('server_error');
  }
};

export { authClient };