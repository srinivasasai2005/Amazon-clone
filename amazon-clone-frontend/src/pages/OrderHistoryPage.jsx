import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { getOrders } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const STATUS = {
  confirmed: { bg:'#e8f5e9', text:'#1a7f1a', label:'Confirmed' },
  shipped:   { bg:'#fff3e0', text:'#e65100', label:'Shipped'   },
  delivered: { bg:'#e3f2fd', text:'#0d47a1', label:'Delivered' },
  cancelled: { bg:'#ffebee', text:'#c62828', label:'Cancelled' },
};

export default function OrderHistoryPage() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getOrders()
      .then(r => setOrders(r ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!orders.length) {
    return (
      <EmptyState icon="📦" title="No orders yet"
        message="You haven't placed any orders. Browse our products and find something you love!"
        action={{ label: 'Start Shopping', onClick: () => navigate('/products') }} />
    );
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <Package size={26} color="#FF9900" />
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111' }}>Your Orders</h1>
        <span style={{ fontSize: 14, color: '#555', alignSelf: 'flex-end', marginBottom: 2 }}>
          ({orders.length} order{orders.length !== 1 ? 's' : ''})
        </span>
      </div>

      {orders.map(order => {
        const st   = STATUS[order.status] ?? STATUS.confirmed;
        const open = expanded === order.id;
        return (
          <div key={order.id} style={{ background: 'white', borderRadius: 10, marginBottom: 14,
            boxShadow: '0 1px 6px rgba(0,0,0,0.08)', overflow: 'hidden',
            border: open ? '1px solid #FF9900' : '1px solid transparent',
            transition: 'border-color 0.2s' }}>

            {/* Header row */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                {[
                  { label: 'ORDER PLACED', value: new Date(order.created_at).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'}) },
                  { label: 'TOTAL',        value: `₹${Number(order.total).toLocaleString('en-IN')}` },
                  { label: 'ORDER ID',     value: order.id, mono: true },
                ].map(f => (
                  <div key={f.label}>
                    <p style={{ margin: 0, fontSize: 10, color: '#888', fontWeight: 700, letterSpacing: 0.8 }}>{f.label}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: f.mono ? '#007185' : '#111',
                      fontFamily: f.mono ? 'monospace' : 'inherit', letterSpacing: f.mono ? 0.5 : 0 }}>
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: st.bg, color: st.text }}>{st.label}</span>
                <button onClick={() => setExpanded(open ? null : order.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none',
                    border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer',
                    color: '#555', fontSize: 13, padding: '5px 10px' }}>
                  {open ? <><ChevronUp size={14}/> Hide</> : <><ChevronDown size={14}/> Details</>}
                </button>
              </div>
            </div>

            {/* Expanded items */}
            {open && (
              <div style={{ borderTop: '1px solid #EAEDED', padding: '18px 20px', background: '#fafafa' }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 14, marginBottom: 14,
                    paddingBottom: 14, borderBottom: '1px solid #eee', alignItems: 'center' }}>
                    <img src={item.thumbnail} alt={item.name}
                      style={{ width: 68, height: 68, objectFit: 'contain', background: 'white',
                        borderRadius: 6, border: '1px solid #EAEDED', flexShrink: 0 }}
                      onError={e => { e.currentTarget.src = 'https://placehold.co/68x68?text=No+Image'; }} />
                    <div style={{ flex: 1 }}>
                      <Link to={`/products/${item.product_id}`}
                        style={{ color: '#007185', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                        {item.name}
                      </Link>
                      <p style={{ margin: '5px 0 0', fontSize: 13, color: '#555' }}>
                        Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                      ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}

                {/* Totals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 280,
                  marginLeft: 'auto', fontSize: 13, background: 'white', borderRadius: 8,
                  padding: '14px 18px', border: '1px solid #EAEDED' }}>
                  {[
                    { l:'Subtotal',  v:`₹${Number(order.subtotal).toLocaleString('en-IN')}` },
                    { l:'Shipping',  v: order.shipping_cost === 0 ? 'FREE' : `₹${order.shipping_cost}`, green: order.shipping_cost === 0 },
                    { l:'Total',     v:`₹${Number(order.total).toLocaleString('en-IN')}`, bold: true },
                  ].map(r => (
                    <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#555' }}>{r.l}</span>
                      <span style={{ fontWeight: r.bold ? 800 : 400, fontSize: r.bold ? 15 : 13,
                        color: r.green ? '#007600' : '#111' }}>{r.v}</span>
                    </div>
                  ))}
                </div>

                <p style={{ margin: '12px 0 0', fontSize: 13, color: '#555' }}>
                  <strong>Shipped to:</strong>{' '}
                  {order.shipping_address?.fullName}, {order.shipping_address?.city},
                  {' '}{order.shipping_address?.state} — {order.shipping_address?.pincode}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
