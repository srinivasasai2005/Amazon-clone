import { Router } from 'express';
import { query } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// ── GET /api/wishlist ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(`
      SELECT
        wi.id, wi.added_at,
        p.id AS product_id, p.name, p.price, p.thumbnail,
        p.rating, p.review_count, p.is_prime, p.stock_qty
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      WHERE wi.user_id = $1
      ORDER BY wi.added_at DESC
    `, [userId]);

    res.json({ items: result.rows.map(i => ({...i, price: Number(i.price)})) });
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// ── POST /api/wishlist — add item ──────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) return res.status(400).json({ error: 'product_id is required' });

    await query('INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING', 
      [userId, product_id]);

    res.json({ success: true, action: 'added' });
  } catch(err) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// ── DELETE /api/wishlist/:productId — remove item ──────────────────────────────
router.delete('/:productId', async (req, res) => {
  try {
    const userId = req.user.id;
    await query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', 
      [userId, req.params.productId]);
    res.json({ success: true, action: 'removed' });
  } catch(err) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;
