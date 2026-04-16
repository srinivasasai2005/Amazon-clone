import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import RatingStars from './RatingStars';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const id          = product.product_id ?? product.id;
  const price       = Number(product.price);
  const rating      = Number(product.rating);
  const reviewCount = Number(product.review_count ?? 0);
  const inWishlist  = isInWishlist(id);
  const inStock     = (product.stock_qty ?? 1) > 0;

  return (
    <div
      className="product-card"
      style={{ background: 'white', borderRadius: 4, border: '1px solid #DDD',
        overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
        height: '100%', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.querySelector('.wl-btn').style.opacity = '1';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.transform = '';
        e.currentTarget.querySelector('.wl-btn').style.opacity = '0';
      }}>

      {/* Wishlist button */}
      <button
        className="wl-btn"
        onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(id); }}
        title={inWishlist ? 'Remove from wishlist' : 'Save for later'}
        style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, background: 'white',
          border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)', opacity: 0, transition: 'opacity 0.2s' }}>
        <Heart size={16} color={inWishlist ? '#cc0000' : '#666'} fill={inWishlist ? '#cc0000' : 'none'} />
      </button>

      <Link to={`/products/${id}`}
        style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f8f8f8', padding: 12, overflow: 'hidden' }}>
          <img src={product.thumbnail} alt={product.name} loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200?text=No+Image'; }}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
              transition: 'transform 0.3s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
        </div>

        {/* Info */}
        <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h3 style={{ fontSize: 13.5, color: '#0F1111', margin: 0, fontWeight: 400, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <RatingStars rating={rating} small />
            <span style={{ fontSize: 12, color: '#007185' }}>({reviewCount.toLocaleString()})</span>
          </div>

          <div style={{ marginTop: 2 }}>
            <span style={{ fontSize: 13, color: '#555' }}>₹</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#0F1111' }}>
              {Math.floor(price).toLocaleString('en-IN')}
            </span>
          </div>

          {product.is_prime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ background: '#002f6c', color: 'white', fontSize: 10, fontWeight: 700,
                padding: '1px 5px', borderRadius: 2, letterSpacing: 0.5 }}>prime</span>
              <span style={{ fontSize: 11, color: '#565959' }}>
                {user?.is_prime_member ? 'FREE Same-Day Delivery' : 'FREE Delivery'}
              </span>
            </div>
          )}

          {!inStock && (
            <p style={{ color: '#cc0000', fontSize: 12, margin: 0 }}>Out of Stock</p>
          )}
        </div>
      </Link>

      {/* Add to Cart */}
      <div style={{ padding: '0 12px 12px' }}>
        <button
          onClick={() => addToCart(id)}
          disabled={!inStock || loading}
          style={{ width: '100%', padding: '8px 0', borderRadius: 20, fontSize: 13, fontWeight: 500,
            cursor: inStock && !loading ? 'pointer' : 'not-allowed', opacity: loading ? 0.7 : 1,
            border: inStock ? '1px solid #D5A928' : '1px solid #ccc',
            background: inStock ? 'linear-gradient(to bottom, #FFE066, #F4C430)' : '#EAEDED',
            color: inStock ? '#111' : '#999', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}>
          <ShoppingCart size={14} />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
