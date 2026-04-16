import { useMemo, useState } from 'react';
import { CheckCircle2, Crown, Zap, Truck, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { createPrimePaymentIntent, subscribePrime } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

function PrimeContent() {
  const stripe = useStripe();
  const elements = useElements();
  const { user, setUser, refreshUser } = useAuth();
  const toast = useNotification();
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const isPrime = Boolean(user?.is_prime_member);
  const plan = user?.prime_plan || 'monthly';
  const startedAt = user?.prime_member_since ? new Date(user.prime_member_since) : null;
  const expiresAt = user?.prime_expires_at ? new Date(user.prime_expires_at) : null;

  const renewalLabel = useMemo(() => {
    if (!expiresAt) return 'Not active';
    return expiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [expiresAt]);

  const activate = async () => {
    try {
      if (!stripe || !elements) {
        toast.error('Secure payment is not ready yet. Please try again.');
        return;
      }

      setLoadingPlan(true);

      const intentRes = await createPrimePaymentIntent(selectedPlan);
      if (!intentRes?.clientSecret) {
        toast.error('Unable to initialize Prime payment.');
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast.error('Please enter your card details.');
        return;
      }

      const { paymentIntent, error } = await stripe.confirmCardPayment(intentRes.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: user?.name || 'Prime Customer' },
        },
      });

      if (error) {
        toast.error(error.message || 'Prime payment failed');
        return;
      }
      if (!paymentIntent?.id || paymentIntent.status !== 'succeeded') {
        toast.error('Prime payment was not completed.');
        return;
      }

      const data = await subscribePrime(selectedPlan, paymentIntent.id);
      if (data?.user) {
        setUser(data.user);
      } else {
        await refreshUser();
      }
      toast.success('Prime membership activated successfully');
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to activate Prime membership';
      toast.error(message);
    } finally {
      setLoadingPlan(false);
    }
  };

  return (
    <div style={{ background: '#f3f5f7', minHeight: '100vh', paddingBottom: 40 }}>
      <section style={{
        background: 'linear-gradient(135deg, #0f1c2e 0%, #132b4f 55%, #1f4d86 100%)',
        color: 'white',
        padding: '46px 20px 54px'
      }}>
        <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <div style={{ flex: '1 1 520px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.14)', borderRadius: 999, padding: '8px 14px', marginBottom: 14 }}>
              <Crown size={16} color="#ffcc66" />
              <span style={{ fontSize: 12, letterSpacing: 0.5, fontWeight: 700 }}>amazon prime</span>
            </div>
            <h1 style={{ margin: '0 0 10px', fontSize: 46, lineHeight: 1.05, fontWeight: 800 }}>
              More speed, more savings, more Prime.
            </h1>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, color: '#d8e8ff', maxWidth: 760 }}>
              Join Prime to unlock FREE faster delivery, exclusive deals, early access drops, and premium membership perks across your shopping experience.
            </p>
          </div>

          <div style={{
            flex: '1 1 320px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 14,
            padding: 22,
            backdropFilter: 'blur(2px)'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
              {isPrime ? 'Prime Active' : 'Membership Status'}
            </h3>
            <p style={{ margin: '0 0 10px', color: '#dce8ff', fontSize: 14 }}>
              {isPrime ? `Your ${plan} plan is active.` : 'You are currently on a non-Prime account.'}
            </p>
            <div style={{ fontSize: 13, color: '#c7dbff', lineHeight: 1.6 }}>
              <div>Member since: {startedAt ? startedAt.toLocaleDateString('en-IN') : '—'}</div>
              <div>Renews on: {renewalLabel}</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1150, margin: '-28px auto 0', padding: '0 20px' }}>
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #d8dee6', boxShadow: '0 12px 30px rgba(16,40,72,0.12)', padding: '24px 22px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 24 }}>Prime Benefits</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { icon: <Truck size={18} color="#0d4f8f" />, title: 'FREE Fast Delivery', text: 'Unlimited same-day or next-day delivery on eligible items.' },
              { icon: <Zap size={18} color="#0d4f8f" />, title: 'Prime-Only Deals', text: 'Exclusive lightning deals and early access shopping windows.' },
              { icon: <ShieldCheck size={18} color="#0d4f8f" />, title: 'Priority Support', text: 'Faster customer support resolution for Prime customers.' },
            ].map((b) => (
              <div key={b.title} style={{ border: '1px solid #dfe5ec', borderRadius: 10, padding: 14, background: '#fbfdff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {b.icon}
                  <strong style={{ fontSize: 15 }}>{b.title}</strong>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#2f3d4d', lineHeight: 1.5 }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1150, margin: '20px auto 0', padding: '0 20px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 24, color: '#0f1111' }}>Choose your plan</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { key: 'monthly', name: 'Monthly Prime', price: '₹199/month', desc: 'Flexible monthly membership, cancel anytime.' },
            { key: 'yearly', name: 'Yearly Prime', price: '₹1499/year', desc: 'Best value. Save more with annual billing.' },
          ].map((p) => {
            const active = isPrime && plan === p.key;
            return (
              <div key={p.key} style={{ background: 'white', borderRadius: 12, border: (active || selectedPlan === p.key) ? '2px solid #0d4f8f' : '1px solid #d9dee6', padding: 18, position: 'relative' }}>
                {active && (
                  <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, background: '#0d4f8f', color: 'white', padding: '4px 8px', borderRadius: 999 }}>
                    ACTIVE
                  </div>
                )}

                <h3 style={{ margin: '0 0 6px', fontSize: 22, color: '#0f1111' }}>{p.name}</h3>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0d4f8f', marginBottom: 8 }}>{p.price}</div>
                <p style={{ margin: '0 0 14px', fontSize: 14, color: '#4d5a68' }}>{p.desc}</p>

                <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 8, marginBottom: 14 }}>
                  {['FREE fast delivery', 'Prime-only offers', 'Priority support'].map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1c2d3f' }}>
                      <CheckCircle2 size={14} color="#0d4f8f" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPlan(p.key)}
                  disabled={active}
                  style={{
                    width: '100%',
                    borderRadius: 999,
                    border: '1px solid #b8cce5',
                    background: active ? '#e8f0fb' : (selectedPlan === p.key ? '#eff6ff' : '#fff'),
                    color: '#0d4f8f',
                    padding: '10px 14px',
                    fontWeight: 700,
                    cursor: active ? 'default' : 'pointer'
                  }}
                >
                  {active ? 'Current Plan' : (selectedPlan === p.key ? 'Selected Plan' : 'Select Plan')}
                </button>
              </div>
            );
          })}
        </div>

        {!isPrime && (
          <div style={{ marginTop: 18, background: 'white', border: '1px solid #d9dee6', borderRadius: 12, padding: 18 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, color: '#0f1111' }}>Pay with card to activate Prime</h3>
            <p style={{ margin: '0 0 14px', color: '#445365', fontSize: 14 }}>
              Selected plan: <strong>{selectedPlan === 'yearly' ? 'Yearly Prime (₹1499)' : 'Monthly Prime (₹199)'}</strong>
            </p>
            <div style={{ border: '1px solid #a6a6a6', borderRadius: 6, padding: '12px 14px', maxWidth: 460, background: 'white' }}>
              <CardElement options={{ style: { base: { fontSize: '15px', color: '#111', '::placeholder': { color: '#777' } } } }} />
            </div>
            <button
              onClick={activate}
              disabled={loadingPlan || !stripe}
              style={{ marginTop: 14, borderRadius: 999, border: '1px solid #f0b73f', background: '#ffd979', color: '#111', padding: '10px 16px', fontWeight: 700, cursor: loadingPlan ? 'wait' : 'pointer' }}
            >
              {loadingPlan ? 'Processing Payment...' : 'Pay & Activate Prime'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function PrimePage() {
  return (
    <Elements stripe={stripePromise}>
      <PrimeContent />
    </Elements>
  );
}
