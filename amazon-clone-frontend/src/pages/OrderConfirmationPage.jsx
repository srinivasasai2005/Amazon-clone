import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import { getOrder } from '../services/api';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrder(orderId).then(setOrder).catch(console.error);
  }, [orderId]);

  const deliveryDate = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ background: '#EAEDED', minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Success card */}
        <div style={{ background: 'white', borderRadius: 10, padding: '44px 36px',
          textAlign: 'center', boxShadow: '0 3px 20px rgba(0,0,0,0.1)', marginBottom: 20 }}>

          {/* Check icon with animation */}
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#e8f5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            animation: 'popIn 0.4s ease' }}>
            <CheckCircle size={52} color="#1a7f1a" />
          </div>
          <style>{`@keyframes popIn { from { transform: scale(0.5); opacity:0; } to { transform: scale(1); opacity:1; } }`}</style>

          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1a7f1a', margin: '0 0 8px' }}>
            Order Placed! 🎉
          </h1>
          <p style={{ color: '#555', fontSize: 16, margin: 0 }}>
            Thank you for shopping with us, John!
          </p>

          {/* Order ID */}
          <div style={{ background: '#f7f7f7', border: '1px solid #EAEDED', borderRadius: 8,
            padding: '14px 24px', margin: '24px auto', display: 'inline-block' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Order ID</p>
            <p style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 900, color: '#111',
              letterSpacing: 2, fontFamily: 'monospace' }}>{orderId}</p>
          </div>

          {/* Delivery */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            background: '#eaf4fb', borderRadius: 8, padding: '16px 24px', margin: '0 0 28px' }}>
            <Package size={22} color="#007185" />
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#555' }}>Estimated Delivery</p>
              <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 800, color: '#007185' }}>
                {deliveryDate}
              </p>
            </div>
          </div>

          {/* Address */}
          {order?.shipping_address && (
            <div style={{ background: '#fafafa', border: '1px solid #EAEDED', borderRadius: 8,
              padding: '14px 20px', marginBottom: 28, textAlign: 'left', fontSize: 13, color: '#555' }}>
              <strong style={{ color: '#333', display: 'block', marginBottom: 6 }}>📍 Shipping to:</strong>
              {order.shipping_address.fullName}<br />
              {order.shipping_address.street}<br />
              {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px',
                background: '#131921', color: 'white', borderRadius: 26, textDecoration: 'none',
                fontSize: 14, fontWeight: 700 }}>
              <Package size={16} /> View My Orders
            </Link>
            <Link to="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px',
                background: '#FF9900', color: '#111', borderRadius: 26, textDecoration: 'none',
                fontSize: 14, fontWeight: 700 }}>
              <ShoppingBag size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Items */}
        {order?.items?.length > 0 && (
          <div style={{ background: 'white', borderRadius: 10, padding: 24,
            boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Items in This Order</h2>
            {order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 14, marginBottom: 14,
                paddingBottom: 14, borderBottom: '1px solid #f3f3f3', alignItems: 'center' }}>
                <img src={item.thumbnail} alt={item.name}
                  style={{ width: 60, height: 60, objectFit: 'contain', background: '#f8f8f8',
                    borderRadius: 5, flexShrink: 0 }}
                  onError={e => { e.target.src = 'https://placehold.co/60?text=?'; }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#111' }}>{item.name}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#555' }}>Qty: {item.quantity}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 0 0',
              fontSize: 17, fontWeight: 800 }}>
              Order Total: ₹{Number(order.total).toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
