import mqtt from 'mqtt';
import crypto from 'crypto'; // 👈 Import crypto for generating mock data
import config from '../config/index.js';
import Cart from '../models/cart.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

// No need to initialize real Razorpay for mocking
// import Razorpay from 'razorpay';
// const razorpay = new Razorpay({ ... });

const connectMqttClient = (io) => { 
  const client = mqtt.connect(config.mqtt.url, {
    username: config.mqtt.username,
    password: config.mqtt.password,
  });

  client.on('connect', () => {
    console.log('📡 MQTT Client connected to broker');
    client.subscribe('carts/register', { qos: 1 });
    client.subscribe('carts/update', { qos: 1 });
    client.subscribe('smartcart/+/+/telemetry', { qos: 1 });
    client.subscribe('smartcart/+/+/events', { qos: 1 });
  });

  client.on('error', (err) => console.error('MQTT Client Error:', err));

  client.on('message', async (topic, payload) => {
    console.log(`📥 MQTT Message [${topic}]: ${payload.toString()}`);
    const message = JSON.parse(payload.toString());

    // --- (The logic for 'carts/register', 'carts/update', and 'telemetry' remains the same) ---
    // ...

    // 4. Handle Live Events (Payment Requests) - NOW WITH MOCK LOGIC
    const eventMatch = topic.match(/smartcart\/(.+)\/(.+)\/events/);
    if (eventMatch && message.eventType === 'paymentRequest') {
      const [, mallId, cartId] = eventMatch;
      const { amount } = message;
      console.log(`💳 MOCK Payment request received from ${cartId} for amount ${amount}`);
      
      // --- 👇 MOCK LOGIC STARTS HERE 👇 ---
      // We are simulating a successful API call to Razorpay
      
      console.log('Simulating Razorpay API call...');
      
      // Create a fake payment link object
      const mockPaymentLink = {
        short_url: `https://example.com/mock-payment/${crypto.randomBytes(6).toString('hex')}`,
        id: `plink_mock_${crypto.randomBytes(8).toString('hex')}`,
      };

      console.log(`✅ Mock link created: ${mockPaymentLink.short_url}`);

      const responsePayload = JSON.stringify({
        command: 'paymentInfo',
        paymentUrl: mockPaymentLink.short_url,
        orderId: mockPaymentLink.id,
      });

      const responseTopic = `smartcart/${mallId}/${cartId}/commands`;
      client.publish(responseTopic, responsePayload);
      console.log(`📤 Sent MOCK payment URL back to ${cartId}`);
      
      // --- 👆 MOCK LOGIC ENDS HERE 👆 ---
    }
  });

  return client;
};

export default connectMqttClient;
// TO START MOSQUITTO ON PC RUN IT IN CMD
// cd "C:\Program Files\mosquitto"
//.\mosquitto.exe -c mosquitto.conf -v