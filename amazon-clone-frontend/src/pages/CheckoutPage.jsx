import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, Shield, ChevronRight, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { placeOrder } from '../services/api';
import api from '../services/api'; // direct api handle for custom intent
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const DEFAULT_ADDR = {
  fullName: 'John Doe', phone: '+91 9876543210',
  street: '123 Main Street, Indiranagar',
  city: 'Bangalore', state: 'Karnataka',
  pincode: '560038', country: 'India',
};

function deriveDefaultAddress(user) {
  const addressText = user?.address?.trim();
  if (!addressText) {
    return {
      ...DEFAULT_ADDR,
      fullName: user?.name || DEFAULT_ADDR.fullName,
    };
  }

  const parts = addressText.split(',').map((p) => p.trim()).filter(Boolean);
  const street = parts.slice(0, Math.max(parts.length - 3, 1)).join(', ') || DEFAULT_ADDR.street;
  const city = parts[parts.length - 3] || DEFAULT_ADDR.city;
  const stateAndPin = parts[parts.length - 2] || `${DEFAULT_ADDR.state} ${DEFAULT_ADDR.pincode}`;
  const statePinParts = stateAndPin.split(' ').filter(Boolean);
  const pincode = statePinParts[statePinParts.length - 1] || DEFAULT_ADDR.pincode;
  const state = statePinParts.slice(0, -1).join(' ') || DEFAULT_ADDR.state;

  return {
    ...DEFAULT_ADDR,
    fullName: user?.name || DEFAULT_ADDR.fullName,
    street,
    city,
    state,
    pincode,
  };
}

function AddressField({
  label,
  name,
  required = true,
  half = false,
  model,
  onModelChange,
}) {
  return (
    <div style={{ marginBottom: 14, flex: half ? '0 0 calc(50% - 6px)' : '1 1 100%' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 5 }}>
        {label}
      </label>
      <input
        name={name}
        value={model[name] || ''}
        onChange={onModelChange}
        required={required}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #a6a6a6',
          borderRadius: 4,
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          boxShadow: '0 1px 2px rgba(15,17,17,.15) inset'
        }}
        onFocus={e => {
          e.target.style.borderColor = '#e77600';
          e.target.style.boxShadow = '0 0 3px 2px rgba(228,121,17,.5)';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#a6a6a6';
          e.target.style.boxShadow = '0 1px 2px rgba(15,17,17,.15) inset';
        }}
      />
    </div>
  );
}

// ── Checkout Form Component ──────────────────────────────────────────────────
function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast  = useNotification();
  const stripe = useStripe();
  const elements = useElements();

  const [addr,    setAddr]    = useState(DEFAULT_ADDR);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to Pay on Delivery
  const [clientSecret, setClientSecret] = useState('');
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const defaultAddress = deriveDefaultAddress(user);
  const [savedAddresses, setSavedAddresses] = useState(() => ([
    { id: 'default', tag: 'Default Address', data: defaultAddress },
  ]));
  const [selectedAddressId, setSelectedAddressId] = useState('default');
  const [newAddress, setNewAddress] = useState(defaultAddress);

  const fetchPaymentIntent = async () => {
    const res = await api.post('/payments/create-payment-intent');
    const secret = res?.data?.clientSecret;
    if (!secret) {
      throw new Error('Payment intent not returned by server');
    }
    setClientSecret(secret);
    return secret;
  };

  const shipping = (user?.is_prime_member || subtotal >= 499) ? 0 : 99;
  const total    = subtotal + shipping;

  const handleChange = e => setAddr(a => ({ ...a, [e.target.name]: e.target.value }));
  const handleNewAddressChange = e => setNewAddress(a => ({ ...a, [e.target.name]: e.target.value }));

  const chooseAddress = (id) => {
    const found = savedAddresses.find((a) => a.id === id);
    if (!found) return;
    setSelectedAddressId(id);
    setAddr(found.data);
    setShowAddressOptions(false);
    setShowAddAddress(false);
  };

  const saveCurrentAddressEdits = () => {
    setSavedAddresses((prev) => prev.map((entry) => (
      entry.id === selectedAddressId ? { ...entry, data: addr } : entry
    )));
  };

  const toggleAddAddress = () => {
    setShowAddAddress((prev) => {
      const next = !prev;
      if (next) {
        setNewAddress({
          ...DEFAULT_ADDR,
          fullName: user?.name || '',
          phone: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
        });
      }
      return next;
    });
  };

  const addNewAddress = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const requiredKeys = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];
    const hasMissing = requiredKeys.some((k) => !String(newAddress[k] || '').trim());
    if (hasMissing) {
      toast.error('Please fill all required fields for the new address.');
      return;
    }

    const id = `addr-${Date.now()}`;
    const entry = {
      id,
      tag: `Address ${savedAddresses.length}`,
      data: { ...newAddress },
    };

    setSavedAddresses((prev) => [...prev, entry]);
    setSelectedAddressId(id);
    setAddr(entry.data);
    setShowAddAddress(false);
    setShowAddressOptions(false);
    toast.success('New delivery address added.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacing(true);

    try {
      if (paymentMethod === 'card') {
        if (!stripe || !elements) {
          toast.error('Card payments are not ready. Please try again.');
          setPlacing(false);
          return;
        }

        const secret = clientSecret || await fetchPaymentIntent();
        
        const cardElement = elements.getElement(CardElement);
        const { error } = await stripe.confirmCardPayment(secret, {
          payment_method: {
            card: cardElement,
            billing_details: { name: addr.fullName, phone: addr.phone }
          }
        });

        if (error) {
          toast.error(error.message);
          setPlacing(false);
          return;
        }
      }

      // 2. Insert Order into Database
      const res = await placeOrder({ shipping_address: addr });
      clearCart();
      toast.success(paymentMethod === 'cod' ? 'Order Placed Successfully!' : 'Payment Successful!');
      navigate(`/order-confirmation/${res.order_id}`);

    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to process. Please try again.';
      toast.error(message);
      setPlacing(false);
    }
  };

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      
      {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 320 }}>
        
        {/* Address */}
        <div style={{ background: 'white', border: '1px solid #D5D9D9', borderRadius: 8, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 24, color: '#c45500' }}>1</div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F1111' }}>Shipping address</h2>
          </div>
          <div style={{ paddingLeft: 22, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
              background: '#f8f9fa', border: '1px solid #D5D9D9', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 13, color: '#0F1111', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700 }}>{addr.fullName}</div>
                <div>{addr.street}</div>
                <div>{addr.city}, {addr.state} — {addr.pincode}</div>
                <div>{addr.phone}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressOptions((v) => !v)}
                style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', fontSize: 13, padding: 0 }}
              >
                {showAddressOptions ? 'Close' : 'Change'}
              </button>
            </div>
          </div>

          {showAddressOptions && (
            <div style={{ paddingLeft: 22, marginBottom: 14 }}>
              <div style={{ border: '1px solid #D5D9D9', borderRadius: 8, padding: 12, background: '#fff' }}>
                {savedAddresses.map((entry) => {
                  const active = selectedAddressId === entry.id;
                  const a = entry.data;
                  return (
                    <label
                      key={entry.id}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        border: active ? '1px solid #e77600' : '1px solid #D5D9D9',
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 10,
                        cursor: 'pointer',
                        background: active ? '#fffaf3' : '#fff'
                      }}
                    >
                      <input
                        type="radio"
                        checked={active}
                        onChange={() => chooseAddress(entry.id)}
                        style={{ marginTop: 2, accentColor: '#e77600' }}
                      />
                      <div style={{ fontSize: 13, color: '#0F1111', lineHeight: 1.45 }}>
                        <div style={{ fontWeight: 700 }}>{entry.tag}</div>
                        <div>{a.fullName}</div>
                        <div>{a.street}</div>
                        <div>{a.city}, {a.state} — {a.pincode}</div>
                        <div>{a.phone}</div>
                      </div>
                    </label>
                  );
                })}

                <button
                  type="button"
                  onClick={toggleAddAddress}
                  style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', fontSize: 13, padding: 0 }}
                >
                  {showAddAddress ? 'Cancel adding new address' : '+ Add another delivery address'}
                </button>

                {showAddAddress && (
                  <form onSubmit={addNewAddress} style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 12 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      <AddressField name="fullName" label="Full name" half required model={newAddress} onModelChange={handleNewAddressChange} />
                      <AddressField name="phone" label="Mobile number" half required model={newAddress} onModelChange={handleNewAddressChange} />
                      <AddressField name="pincode" label="PIN code" half required model={newAddress} onModelChange={handleNewAddressChange} />
                      <AddressField name="city" label="Town/City" half required model={newAddress} onModelChange={handleNewAddressChange} />
                      <AddressField name="state" label="State" half required model={newAddress} onModelChange={handleNewAddressChange} />
                      <AddressField name="street" label="Flat, House no., Building, Company, Apartment" required model={newAddress} onModelChange={handleNewAddressChange} />
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <button
                        type="submit"
                        style={{ border: '1px solid #D5A928', background: '#FFD814', color: '#111', borderRadius: 20, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
                      >
                        Save this address
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          <form id="checkout" onSubmit={handleSubmit} style={{ paddingLeft: 22 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <AddressField name="fullName" label="Full name (First and Last name)" model={addr} onModelChange={handleChange} />
              <AddressField name="phone"   label="Mobile number" half model={addr} onModelChange={handleChange} />
              <AddressField name="pincode" label="PIN code" half model={addr} onModelChange={handleChange} />
              <AddressField name="street"  label="Flat, House no., Building, Company, Apartment" model={addr} onModelChange={handleChange} />
              <AddressField name="city"    label="Town/City"    half model={addr} onModelChange={handleChange} />
              <AddressField name="state"   label="State"   half model={addr} onModelChange={handleChange} />
            </div>
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                onClick={saveCurrentAddressEdits}
                style={{ border: '1px solid #D5D9D9', background: '#f0f2f2', color: '#111', borderRadius: 20, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
              >
                Save address changes
              </button>
            </div>
          </form>
        </div>

        {/* Payment Methods */}
        <div style={{ background: 'white', border: '1px solid #D5D9D9', borderRadius: 8, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 24, color: '#c45500' }}>2</div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F1111' }}>Payment method</h2>
          </div>
          <div style={{ paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            
            {/* Pay on Delivery Option */}
            <div style={{ border: paymentMethod === 'cod' ? '1px solid #e77600' : '1px solid #D5D9D9', borderRadius: 8, background: paymentMethod === 'cod' ? '#fcfcfc' : 'white', padding: '14px 18px', cursor: 'pointer' }} onClick={() => setPaymentMethod('cod')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ accentColor: '#007185' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F1111' }}>Pay on Delivery</span>
              </div>
              {paymentMethod === 'cod' && (
                <div style={{ marginTop: 8, marginLeft: 22, fontSize: 13, color: '#555' }}>
                  Pay using Cash or UPI at your doorstep. Limit: ₹50,000.
                </div>
              )}
            </div>

            {/* Credit/Debit Option */}
            <div style={{ border: paymentMethod === 'card' ? '1px solid #e77600' : '1px solid #D5D9D9', borderRadius: 8, background: paymentMethod === 'card' ? '#fcfcfc' : 'white', padding: '14px 18px', cursor: 'pointer' }} onClick={() => setPaymentMethod('card')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: paymentMethod === 'card' ? 12 : 0 }}>
                <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ accentColor: '#007185' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F1111' }}>Credit or debit card</span>
                <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" style={{ height: 16 }} />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="MasterCard" style={{ height: 16 }} />
                </div>
              </div>
              {/* Stripe Element wrapper */}
              {paymentMethod === 'card' && (
                <div style={{ border: '1px solid #a6a6a6', padding: '12px 14px', borderRadius: 4, background: 'white', boxShadow: '0 1px 2px rgba(15,17,17,.15) inset' }} onClick={(e) => e.stopPropagation()}>
                  <CardElement options={{
                    style: { base: { fontSize: '15px', color: '#111', '::placeholder': { color: '#888' }} }
                  }} />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Review Items */}
        <div style={{ background: 'white', border: '1px solid #D5D9D9', borderRadius: 8, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 24, color: '#c45500', opacity: 0.5 }}>3</div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F1111' }}>Review items and delivery</h2>
          </div>
          <div style={{ paddingLeft: 22 }}>
            <div style={{ border: '1px solid #D5D9D9', borderRadius: 8, padding: 18 }}>
              <div style={{ color: '#007600', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Delivery: Tomorrow</div>
              <p style={{ color: '#555', fontSize: 13, marginBottom: 16 }}>Items shipped from Amazon clone base.</p>
              {items.map(item => (
                <div key={item.product_id} style={{ display: 'flex', gap: 16, marginBottom: 14,
                  paddingBottom: 14, borderBottom: '1px solid #f3f3f3', alignItems: 'flex-start' }}>
                  <img src={item.thumbnail} alt={item.name}
                    style={{ width: 80, height: 80, objectFit: 'contain', background: 'white' }}
                    onError={e => { e.currentTarget.src = 'https://placehold.co/80x80?text=No+Image'; }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0F1111', lineHeight: 1.3 }}>
                      {item.name}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: '#CC0000', fontWeight: 700 }}>
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </p>
                    <div style={{ background: '#f0f2f2', padding: '4px 8px', borderRadius: 8, display: 'inline-block',
                      marginTop: 8, fontSize: 13, color: '#0F1111', border: '1px solid #D5D9D9', boxShadow: '0 2px 5px rgba(15,17,17,.15)' }}>
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── RIGHT COLUMN (SUMMARY) ─────────────────────────────────── */}
      <div style={{ width: 300, flexShrink: 0, position: 'sticky', top: 90 }}>
        <div style={{ background: 'white', border: '1px solid #D5D9D9', borderRadius: 8, padding: 22 }}>
          <button type="submit" form="checkout" disabled={placing || (paymentMethod === 'card' && !stripe)}
            style={{ width: '100%', padding: '10px 0', border: '1px solid #FCD200', borderRadius: 8,
              fontSize: 14, fontWeight: 400, cursor: placing ? 'wait' : 'pointer',
              background: placing ? '#EAEDED' : '#FFD814', boxShadow: '0 2px 5px 0 rgba(213,217,217,.5)',
              color: placing ? '#999' : '#0F1111', transition: 'all 0.2s', textAlign: 'center' }}>
            {placing ? 'Processing...' : (paymentMethod === 'cod' ? 'Place your order' : 'Place your order and pay')}
          </button>
          
          <p style={{ textAlign: 'center', fontSize: 11, color: '#555', margin: '8px 0 16px', lineHeight: 1.4 }}>
            By placing your order, you agree to Amazon's <span style={{ color: '#007185' }}>privacy notice</span> and <span style={{ color: '#007185' }}>conditions of use</span>.
          </p>

          <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, borderTop: '1px solid #D5D9D9', paddingTop: 16 }}>
            Order Summary
          </h2>

          <table style={{ width: '100%', fontSize: 14 }}>
            <tbody>
              <tr>
                <td style={{ color: '#0f1111', paddingBottom: 6 }}>Items:</td>
                <td style={{ textAlign: 'right', paddingBottom: 6 }}>₹{subtotal.toLocaleString('en-IN')}.00</td>
              </tr>
              <tr>
                <td style={{ color: '#0f1111', paddingBottom: 6 }}>Delivery:</td>
                <td style={{ textAlign: 'right', paddingBottom: 6 }}>{shipping === 0 ? '₹0.00' : `₹${shipping}.00`}</td>
              </tr>
              <tr style={{ color: '#B12704', fontSize: 18, fontWeight: 700 }}>
                <td style={{ borderTop: '1px solid #D5D9D9', paddingTop: 10 }}>Order Total:</td>
                <td style={{ textAlign: 'right', borderTop: '1px solid #D5D9D9', paddingTop: 10 }}>
                  ₹{total.toLocaleString('en-IN')}.00
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ background: '#f3f3f3', padding: '10px 14px', borderRadius: 4, marginTop: 16, border: '1px solid #e7e7e7' }}>
            <a href="#" style={{ fontSize: 12, color: '#007185', textDecoration: 'none' }}>How are delivery costs calculated?</a>
          </div>
        </div>
      </div>
      
    </div>
  );
}

// ── Main Page Wrapper ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items } = useCart();
  const navigate = useNavigate();

  // 1. If empty, go back to cart
  useEffect(() => {
    if (!items.length) {
      navigate('/cart');
    }
  }, [items, navigate]);

  if (!items.length) return null;

  return (
    <div style={{ background: '#f3f3f3', minHeight: '100vh' }}>
      {/* ── Amazon-like minimal checkout header ── */}
      <header style={{ background: 'white', padding: '16px 0', borderBottom: '1px solid #DDD' }}>
        <div style={{ maxWidth: 1050, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, color: '#111' }}>
            amazon<span style={{ color: '#FF9900' }}>.in</span>
          </span>
          <h1 style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: 28, fontWeight: 400, color: '#111' }}>
            Checkout
          </h1>
          <Shield size={24} color="#007185" />
        </div>
      </header>
      
      {/* ── Stripe UI Elements injects the Card styles securely ── */}
      <div style={{ paddingTop: 24, paddingBottom: 40 }}>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
