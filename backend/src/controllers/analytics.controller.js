// Placeholder for analytics.controller.js
import Transaction from '../models/transaction.model.js';
import Cart from '../models/cart.model.js';

// @desc    Get analytics summary for an admin's mall
// @route   GET /api/analytics/summary
// @access  Private
const getAnalyticsSummary = async (req, res) => {
  try {
    const { mallId } = req.user;

    // Aggregation for transaction data
    const transactionData = await Transaction.aggregate([
      { $match: { mallId: mallId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);
    
    // Count carts by status
    const cartStatusData = await Cart.aggregate([
        { $match: { mallId: mallId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const cartCounts = {
        total: 0,
        Idle: 0,
        Shopping: 0,
        Payment: 0,
        Offline: 0,
    };

    cartStatusData.forEach(status => {
        if (cartCounts.hasOwnProperty(status._id)) {
            cartCounts[status._id] = status.count;
        }
        cartCounts.total += status.count;
    });

    const summary = {
      totalRevenue: transactionData[0]?.totalRevenue || 0,
      totalTransactions: transactionData[0]?.totalTransactions || 0,
      cartCounts: cartCounts,
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getAnalyticsSummary };