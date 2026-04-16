import { Router } from 'express';
import { query } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// ── GET /api/cart ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(`
      SELECT
        ci.id, ci.quantity, ci.added_at,
        p.id AS product_id, p.name, p.price, p.thumbnail,
        p.stock_qty, p.is_prime, p.rating
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC
    `, [userId]);

    const items = result.rows.map(i => ({...i, price: Number(i.price)}));
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count    = items.reduce((sum, i) => sum + i.quantity, 0);

    res.json({ items, subtotal, count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// ── POST /api/cart — add item (or increment if exists) ─────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) return res.status(400).json({ error: 'product_id is required' });

    const pRes = await query('SELECT id, stock_qty FROM products WHERE id = $1', [product_id]);
    if (!pRes.rows[0]) return res.status(404).json({ error: 'Product not found' });

    const existingRes = await query(
      'SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existingRes.rows.length > 0) {
      await query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3',
        [quantity, userId, product_id]
      );
    } else {
      await query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [userId, product_id, quantity]
      );
    }

    res.json({ success: true, message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// ── PUT /api/cart/:productId — set exact quantity ──────────────────────────────
router.put('/:productId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || Number(quantity) < 1) {
      await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);
      return res.json({ success: true, message: 'Item removed' });
    }

    await query(
      'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
      [Number(quantity), userId, productId]
    );

    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: 'Failed to update item quantity' });
  }
});

// ── DELETE /api/cart/:productId — remove single item ──────────────────────────
router.delete('/:productId', async (req, res) => {
  try {
    const userId = req.user.id;
    await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, req.params.productId]);
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// ── DELETE /api/cart — clear entire cart ──────────────────────────────────────
router.delete('/', async (req, res) => {
  try {
    const userId = req.user.id;
    await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
