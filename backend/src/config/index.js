// Placeholder for index.js
import dotenv from 'dotenv';

// Load .env file contents into process.env
dotenv.config();

const config = {
  // 👇 ADD THIS NEW OBJECT 👇
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  mqtt: {
    url: process.env.MQTT_BROKER_URL,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  },
};

export default config;