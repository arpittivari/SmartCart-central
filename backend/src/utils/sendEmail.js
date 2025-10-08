import nodemailer from 'nodemailer';
import config from '../config/index.js'; // We read from the secure config

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      // These values are now safely read from your .env file via the config
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  const message = {
    from: `${config.email.fromName} <${config.email.fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('✅ Message sent successfully: %s', info.messageId);
  } catch (error) {
    console.error('🔥🔥 EMAIL SENDING ERROR 🔥🔥:', error);
    throw error;
  }
};

export default sendEmail;