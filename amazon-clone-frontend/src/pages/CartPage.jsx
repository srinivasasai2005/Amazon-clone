import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CartPage() {
  const { items, subtotal, count, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading && !items.length) {
    return <LoadingSpinner />;
  }

  const freeShipping = Boolean(user?.is_prime_member) || subtotal >= 499;

  return (
    <div style={{ background: '#EAEDED', minHeight: '100vh', padding: '14px 18px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1500, width: '100%', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* ── LEFT: Shopping Cart ────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, background: 'white', padding: '20px', paddingBottom: 0 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 400, color: '#0F1111', paddingBottom: 4 }}>
            Shopping Cart
          </h1>
          {items.length > 0 && (
            <button onClick={clearCart} style={{ color: '#007185', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14 }}>
              Deselect all items
            </button>
          )}
          <div style={{ textAlign: 'right', color: '#555', fontSize: 13, borderBottom: '1px solid #DDD', paddingBottom: 4, marginTop: 4 }}>
            Price
          </div>

          {!items.length ? (
            <div style={{ padding: '40px 0', borderBottom: '1px solid #DDD' }}>
              <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700 }}>Your Amazon Cart is empty.</h2>
              <p style={{ margin: 0, fontSize: 14, color: '#0F1111' }}>
                Your shopping cart is waiting. Give it purpose – fill it with groceries, clothing, household supplies, electronics and more.
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 14 }}>
                Continue shopping on the <Link to="/" style={{ color: '#007185', textDecoration: 'none' }}>Amazon.in homepage</Link>.
              </p>
            </div>
          ) : (
            <div>
              {items.map(item => (
                <div key={item.product_id} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: '1px solid #DDD' }}>
                  
                  {/* Checkbox (Mock) */}
                  <div style={{ paddingTop: 6 }}>
                    <input type="checkbox" checked readOnly style={{ accentColor: '#007185', width: 16, height: 16 }} />
                  </div>

                  {/* Image */}
                  <Link to={`/products/${item.product_id}`} style={{ flexShrink: 0 }}>
                    <img src={item.thumbnail} alt={item.name}
                      style={{ width: 180, height: 180, objectFit: 'contain', background: 'white' }}
                      onError={e => { e.currentTarget.src = 'https://placehold.co/180x180?text=No+Image'; }} />
                  </Link>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      
                      <div style={{ paddingRight: 10 }}>
                        <Link to={`/products/${item.product_id}`} style={{ textDecoration: 'none' }}>
                          <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 400, color: '#0F1111', lineHeight: 1.3,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.name}
                          </h3>
                        </Link>
                        <div style={{ color: '#007600', fontSize: 12, marginBottom: 4 }}>In stock</div>
                        <div style={{ color: '#555', fontSize: 12, marginBottom: 4 }}>Eligible for FREE Shipping</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                          <input type="checkbox" style={{ accentColor: '#007185', margin: 0 }} /> 
                          <span style={{ fontSize: 12, color: '#0F1111' }}>This will be a gift</span>
                          <span style={{ fontSize: 12, color: '#007185' }}>Learn more</span>
                        </div>
                      </div>

                      {/* Price (Right aligned) */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#0F1111' }}>
                          ₹{Number(item.price).toLocaleString('en-IN')}.00
                        </span>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
                      <div style={{ background: '#F0F2F2', border: '1px solid #D5D9D9', borderRadius: 8, padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 5px rgba(15,17,17,.15)' }}>
                        <select
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product_id, Number(e.target.value))}
                          style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#0F1111', cursor: 'pointer' }}
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>Qty: {n}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ width: 1, height: 14, background: '#DDD' }} />
                      
                      <button onClick={() => removeItem(item.product_id)} style={{ color: '#007185', fontSize: 12, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                        Delete
                      </button>

                      <div style={{ width: 1, height: 14, background: '#DDD' }} />

                      <button style={{ color: '#007185', fontSize: 12, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                        Save for later
                      </button>

                      <div style={{ width: 1, height: 14, background: '#DDD' }} />

                      <button style={{ color: '#007185', fontSize: 12, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div style={{ textAlign: 'right', padding: '16px 0', fontSize: 18 }}>
                Subtotal ({count} item{count !== 1 ? 's' : ''}): <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}.00</span>
              </div>
            </div>
          )}
          
          {/* Post content spacer so the white box matches Amazon */}
          <div style={{ height: 20 }}></div>
        </div>

        {/* ── RIGHT: Summary Box ─────────────────────────────────────── */}
        {items.length > 0 && (
          <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Free shipping eligibility banner */}
            <div style={{ background: 'white', padding: 14 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ color: '#007600', paddingTop: 2 }}><ShieldCheck size={20} /></div>
                <div>
                  <span style={{ fontSize: 13, color: '#007600' }}>
                    {freeShipping
                      ? (user?.is_prime_member ? 'Prime benefit active: FREE Delivery on your order.' : 'Your order is eligible for FREE Delivery.')
                      : 'Add items worth ₹499 for FREE Delivery.'}
                  </span>
                  <div style={{ fontSize: 14, color: '#0F1111', marginTop: 4 }}>
                    Select this option at checkout. <span style={{ color: '#007185', fontSize: 12 }}>Details</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtotal & Checkout Box */}
            <div style={{ background: 'white', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 18 }}>
                Subtotal ({count} item{count !== 1 ? 's' : ''}): <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}.00</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#0F1111' }}>
                <input type="checkbox" style={{ accentColor: '#007185', margin: 0, width: 14, height: 14 }} />
                This order contains a gift
              </div>

              <button
                onClick={() => navigate('/checkout')}
                style={{ width: '100%', padding: '9px 0', border: '1px solid #FCD200', borderRadius: 8,
                  fontSize: 14, fontWeight: 400, cursor: 'pointer', textAlign: 'center',
                  background: '#FFD814', boxShadow: '0 2px 5px 0 rgba(213,217,217,.5)', color: '#0F1111' }}
              >
                Proceed to Buy
              </button>
              
              <div style={{ background: '#f3f3f3', border: '1px solid #D5D9D9', borderRadius: 8, padding: 14, marginTop: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>EMI Available</div>
                <div style={{ fontSize: 12, color: '#555' }}>Your order qualifies for EMI with valid credit cards.</div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
