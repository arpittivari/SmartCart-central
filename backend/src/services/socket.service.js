/**
 * Initializes the Socket.IO logic.
 * @param {object} io - The Socket.IO server instance.
 */
const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected to WebSocket:', socket.id);

    // Room Management for Multi-tenancy (Admins join their Mall's room)
    socket.on('joinRoom', (mallId) => {
      socket.join(mallId);
      console.log(`   - Client ${socket.id} joined Mall Room: ${mallId}`);
    });

    // Specific Cart Monitoring (For Live View Modal)
    socket.on('subscribeToCart', (cartId) => {
      socket.join(cartId);
      console.log(`   - Client ${socket.id} subscribed to Cart: ${cartId}`);
    });

    socket.on('unsubscribeFromCart', (cartId) => {
      socket.leave(cartId);
      console.log(`   - Client ${socket.id} unsubscribed from Cart: ${cartId}`);
    });

    // v4.0 Feature: Assistance Request from Dashboard (Optional Reverse Flow)
    // or listening to dashboard-generated alerts
    socket.on('requestAssistance', (data) => {
        console.log(`   - 🆘 Help requested by ${data.cartId}`);
        io.to(data.mallId).emit('assistanceAlert', data);
    });

    socket.on('disconnect', () => {
      // console.log('Client disconnected:', socket.id);
    });
  });
};

export default initSocket;