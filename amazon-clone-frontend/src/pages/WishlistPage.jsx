import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import RatingStars from '../components/product/RatingStars';
import EmptyState from '../components/common/EmptyState';

export default function WishlistPage() {
  const { items, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <EmptyState icon="❤️" title="Your wishlist is empty"
        message="Save items you love by clicking the heart icon on any product page."
        action={{ label: 'Browse Products', onClick: () => navigate('/products') }} />
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <Heart size={26} color="#cc0000" fill="#cc0000" />
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111' }}>
          Your Wishlist
        </h1>
        <span style={{ fontSize: 14, color: '#555', alignSelf: 'flex-end', marginBottom: 2 }}>
          ({items.length} item{items.length !== 1 ? 's' : ''})
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {items.map(item => (
          <div key={item.product_id}
            style={{ background: 'white', borderRadius: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(0,0,0,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.1)'; }}>

            <Link to={`/products/${item.product_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f8f8f8', padding: 14, overflow: 'hidden' }}>
                <img src={item.thumbnail} alt={item.name} loading="lazy"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                    transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  onError={e => { e.target.src = 'https://placehold.co/200?text=No+Image'; }} />
              </div>
              <div style={{ padding: '14px 16px' }}>
                <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 500, color: '#111',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  lineHeight: 1.4 }}>
                  {item.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <RatingStars rating={Number(item.rating)} small />
                  <span style={{ fontSize: 12, color: '#007185' }}>({Number(item.review_count).toLocaleString()})</span>
                </div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F1111' }}>
                  ₹{Number(item.price).toLocaleString('en-IN')}
                </p>
                {item.stock_qty === 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#cc0000', fontWeight: 500 }}>Out of Stock</p>
                )}
              </div>
            </Link>

            {/* Actions */}
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
              <button onClick={() => addToCart(item.product_id)} disabled={item.stock_qty === 0}
                style={{ padding: '9px 0', borderRadius: 22, fontSize: 13, fontWeight: 600,
                  cursor: item.stock_qty > 0 ? 'pointer' : 'not-allowed',
                  border: item.stock_qty > 0 ? '1px solid #D5A928' : '1px solid #ccc',
                  background: item.stock_qty > 0 ? 'linear-gradient(to bottom, #FFE066, #F4C430)' : '#EAEDED',
                  color: item.stock_qty > 0 ? '#111' : '#999',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <ShoppingCart size={14} />
                {item.stock_qty > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button onClick={() => toggleWishlist(item.product_id)}
                style={{ padding: '8px 0', borderRadius: 22, border: '1px solid #ccc', fontSize: 12,
                  cursor: 'pointer', background: 'white', color: '#555',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Trash2 size={13} /> Remove from Wishlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
