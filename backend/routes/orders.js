import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getClient } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// ── GET /api/orders ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const ordersRes = await query(
      'SELECT id, status, subtotal, shipping_cost, total, shipping_address, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    // To prevent N+1 issues ideally we'd join but this is fine for small limits
    const result = [];
    for (const order of ordersRes.rows) {
      const itemsRes = await query(`
        SELECT oi.id, oi.quantity, oi.unit_price, p.name, p.thumbnail, p.id as product_id
        FROM order_items oi JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [order.id]);
      
      let shipAddr = order.shipping_address;
      try { shipAddr = JSON.parse(shipAddr); } catch(e){}
      
      result.push({ 
        ...order, 
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        shipping_cost: Number(order.shipping_cost),
        shipping_address: shipAddr, 
        items: itemsRes.rows.map(i => ({...i, unit_price: Number(i.unit_price)}))
      });
    }

    res.json({ orders: result });
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ── GET /api/orders/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const db = await getClient();
    try {
      const orderRes = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
      const order = orderRes.rows[0];
      if (!order) return res.status(404).json({ error: 'Order not found' });

      const itemsRes = await db.query(`
        SELECT oi.*, p.name, p.thumbnail, p.price
        FROM order_items oi JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [order.id]);

      let shipAddr = order.shipping_address;
      try { shipAddr = JSON.parse(shipAddr); } catch(e){}

      res.json({ 
        order: { 
          ...order, 
          total: Number(order.total),
          subtotal: Number(order.subtotal),
          shipping_cost: Number(order.shipping_cost),
          shipping_address: shipAddr, 
          items: itemsRes.rows.map(i => ({...i, unit_price: Number(i.unit_price), price: Number(i.price)}))
        } 
      });
    } finally {
      db.release();
    }
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ── POST /api/orders ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { shipping_address } = req.body;
  const userId = req.user.id;

  if (!shipping_address) return res.status(400).json({ error: 'shipping_address is required' });

  let client;
  try {
    client = await getClient();
    
    // Begin explicit transaction
    await client.query('BEGIN');

    const cartRes = await client.query(`
      SELECT ci.quantity, p.id AS product_id, p.price, p.name, p.stock_qty
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      FOR UPDATE OF p
    `, [userId]);

    const cartItems = cartRes.rows;
    if (!cartItems.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const userRes = await client.query(
      'SELECT is_prime_member FROM users WHERE id = $1',
      [userId]
    );
    const isPrimeMember = Boolean(userRes.rows[0]?.is_prime_member);

    const subtotal      = cartItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const shipping_cost = (isPrimeMember || subtotal >= 499) ? 0 : 99;
    const total         = subtotal + shipping_cost;
    const orderId       = `AMZ-${uuidv4().split('-')[0].toUpperCase()}`;

    const addrStr = typeof shipping_address === 'string' ? shipping_address : JSON.stringify(shipping_address);

    await client.query(`
      INSERT INTO orders (id, user_id, subtotal, shipping_cost, total, shipping_address, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
    `, [orderId, userId, subtotal, shipping_cost, total, addrStr]);

    for (const item of cartItems) {
      if (item.stock_qty < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Not enough stock for ${item.name}` });
      }

      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      await client.query(
        'UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    await client.query('COMMIT');

    res.status(201).json({ success: true, order_id: orderId, subtotal, shipping_cost, total });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Order creation failed', err);
    res.status(500).json({ error: 'Order placement failed' });
  } finally {
    if (client) client.release();
  }
});

export default router;
