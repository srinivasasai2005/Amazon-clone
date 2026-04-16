import { Router } from 'express';
import Stripe from 'stripe';
import { query } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = Boolean(
  stripeSecret &&
  /^sk_(test|live)_/.test(stripeSecret) &&
  !stripeSecret.includes('dummy')
);
const stripe = isStripeConfigured ? new Stripe(stripeSecret) : null;
const router = Router();

router.use(authMiddleware);

router.post('/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error: 'Card payments are currently unavailable. Please use Pay on Delivery.',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    const userId = req.user.id;

    const userRes = await query(
      'SELECT is_prime_member FROM users WHERE id = $1',
      [userId]
    );
    const isPrimeMember = Boolean(userRes.rows[0]?.is_prime_member);
    
    // Fetch user cart to calculate subtotal server-side securely
    const cartRes = await query(`
      SELECT p.price, ci.quantity 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
    `, [userId]);

    const items = cartRes.rows;
    if (!items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const shipping_cost = (isPrimeMember || subtotal >= 499) ? 0 : 99;
    const total = subtotal + shipping_cost;

    // Minimum amount for Stripe in INR is 50 paise. 
    // Multiply by 100 since Stripe requires amount in smallest currency unit (paise).
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Payment intent error:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

export default router;
