// We no longer need dotenv here because server.js handles it.

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  mqtt: {
    url: process.env.MQTT_BROKER_URL,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  },
  email: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      fromName: 'SmartCart Central',
      fromEmail: process.env.EMAIL_USER,
  }
};

export default config;