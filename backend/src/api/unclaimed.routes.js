import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import UnclaimedCart from '../models/unclaimedCart.model.js';

const router = express.Router();

// This route is protected and will get a list of all carts
// that have announced themselves but have not yet been claimed.
router.get('/', requireAuth, async (req, res) => {
    try {
        // Find all documents in the UnclaimedCart collection, sorted by newest first
        const unclaimedCarts = await UnclaimedCart.find({ mallId: req.user.mallId }).sort({ createdAt: -1 });
        res.json(unclaimedCarts);
    } catch (error) {
        console.error("Error fetching unclaimed carts:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const deletedCart = await UnclaimedCart.findByIdAndDelete(req.params.id);
        if (!deletedCart) {
            return res.status(404).json({ message: 'Unclaimed cart not found.' });
        }
        res.json({ message: 'Unclaimed cart rejected successfully.' });
    } catch (error) {
        console.error("Error rejecting unclaimed cart:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});
export default router;