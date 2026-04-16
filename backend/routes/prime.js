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

const PLAN_PRICES = {
  monthly: 199,
  yearly: 1499,
};

const router = Router();
router.use(authMiddleware);

router.post('/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error: 'Prime card payment is currently unavailable. Configure Stripe keys to continue.',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    const { plan = 'monthly' } = req.body || {};
    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Use monthly or yearly.' });
    }

    const amount = PLAN_PRICES[plan];

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
      metadata: {
        type: 'prime-membership',
        user_id: String(req.user.id),
        plan,
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      plan,
    });
  } catch (err) {
    console.error('Prime payment intent error:', err);
    res.status(500).json({ error: 'Failed to create Prime payment intent' });
  }
});

router.get('/status', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, is_prime_member, prime_plan, prime_member_since, prime_expires_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      prime: {
        is_prime_member: user.is_prime_member,
        prime_plan: user.prime_plan,
        prime_member_since: user.prime_member_since,
        prime_expires_at: user.prime_expires_at,
      },
    });
  } catch (err) {
    console.error('Prime status error:', err);
    res.status(500).json({ error: 'Failed to fetch Prime status' });
  }
});

router.post('/subscribe', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error: 'Prime card payment is currently unavailable. Configure Stripe keys to continue.',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    const { plan = 'monthly', payment_intent_id } = req.body || {};
    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Use monthly or yearly.' });
    }
    if (!payment_intent_id) {
      return res.status(400).json({ error: 'payment_intent_id is required to activate Prime.' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    const expectedAmount = PLAN_PRICES[plan] * 100;
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Prime payment not completed.' });
    }
    if (paymentIntent.amount !== expectedAmount) {
      return res.status(400).json({ error: 'Prime payment amount mismatch.' });
    }
    if (paymentIntent.metadata?.type !== 'prime-membership') {
      return res.status(400).json({ error: 'Invalid payment intent for Prime activation.' });
    }
    if (paymentIntent.metadata?.user_id !== String(req.user.id)) {
      return res.status(403).json({ error: 'Payment intent does not belong to this user.' });
    }

    const result = await query(
      `UPDATE users
       SET is_prime_member = true,
           prime_plan = $1::varchar,
           prime_member_since = CURRENT_TIMESTAMP,
           prime_expires_at = CASE
             WHEN $1::text = 'yearly' THEN CURRENT_TIMESTAMP + INTERVAL '1 year'
             ELSE CURRENT_TIMESTAMP + INTERVAL '1 month'
           END
       WHERE id = $2
       RETURNING id, name, email, address, avatar_url,
                 is_prime_member, prime_plan, prime_member_since, prime_expires_at`,
      [plan, req.user.id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });

    res.json({
      success: true,
      message: 'Prime activated successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Prime subscribe error:', err);
    res.status(500).json({ error: 'Failed to activate Prime membership' });
  }
});

export default router;
