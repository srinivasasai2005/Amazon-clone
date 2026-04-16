import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Search } from 'lucide-react';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import RatingStars from '../components/product/RatingStars';
import ImageCarousel from '../components/product/ImageCarousel';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    setLoading(true);
    setQty(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getProduct(id)
      .then(res => { 
        setProduct(res.product); 
        setRelated(res.related ?? []); 
        setMainImage(res.product.thumbnail);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)    return <LoadingSpinner />;
  if (!product)   return <div style={{ padding: 60, textAlign: 'center', color: '#555' }}>Product not found.</div>;

  const inWishlist = isInWishlist(product.id);
  const inStock    = (product.stock_qty ?? 0) > 0;
  const price      = Number(product.price);
  const mrp        = Math.round(price * 1.22);
  const discount   = Math.round(((mrp - price) / mrp) * 100);

  const images = product.images?.length > 0 ? product.images : [product.thumbnail];
  const specEntries = Object.entries(product.specs ?? {});

  const handleBuyNow = async () => {
    const success = await addToCart(product.id, qty);
    if (success) {
      navigate('/checkout');
    }
  };

  return (
    <div style={{ background: 'white', minHeight: '100vh', paddingBottom: 60 }}>
      {/* ── BREADCRUMB ────────────────────────────────────────── */}
      <div style={{ padding: '10px 24px', fontSize: 12, color: '#555' }}>
        <div style={{ maxWidth: 1500, margin: '0 auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Link to="/" style={{ color: '#555', textDecoration: 'none' }}>Home</Link>
          <span style={{ fontSize: 10 }}>›</span>
          <Link to={`/products?category=${product.category_slug}`} style={{ color: '#555', textDecoration: 'none' }}>
            {product.category_name}
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '10px 24px', display: 'flex', gap: 30, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* ── LEFT: IMAGES ──────────────────────────────────────── */}
        <div style={{ width: 500, flexShrink: 0, position: 'sticky', top: 120 }}>
          <ImageCarousel images={images} />
        </div>

        {/* ── CENTER: DETAILS ───────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 400, maxWidth: 640 }}>
          <h1 style={{ fontSize: 24, fontWeight: 400, color: '#0F1111', margin: '0 0 10px', lineHeight: 1.3 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #e7e7e7', paddingBottom: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: '#0F1111' }}>{Number(product.rating).toFixed(1)}</span>
            <RatingStars rating={product.rating} />
            <span style={{ fontSize: 14, color: '#007185', cursor: 'pointer' }}>
              {Number(product.review_count).toLocaleString()} ratings
            </span>
            <div style={{ width: 1, height: 14, background: '#DDD' }} />
            <Link style={{ fontSize: 14, color: '#007185', textDecoration: 'none' }}>Search this page</Link>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#CC0C39', fontSize: 24, fontWeight: 300 }}>-{discount}%</span>
              <span style={{ fontSize: 14, color: '#0F1111', alignSelf: 'flex-start', marginTop: 2 }}>₹</span>
              <span style={{ fontSize: 28, fontWeight: 500, color: '#0F1111', lineHeight: 1 }}>
                {Math.floor(price).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#555' }}>
              M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{mrp.toLocaleString('en-IN')}</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#0F1111', fontWeight: 700 }}>Inclusive of all taxes</p>
            <div style={{ fontSize: 14, color: '#0F1111', marginTop: 6 }}>
              <span style={{ fontWeight: 700 }}>EMI</span> starts at ₹{Math.round(price / 6)}. No Cost EMI available <span style={{ color: '#007185' }}>EMI options</span>
            </div>
          </div>

          {/* Offers Wrapper */}
          <div style={{ borderTop: '1px solid #e7e7e7', paddingTop: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ border: '1px solid #D5D9D9', borderRadius: 8, padding: '10px 14px', width: 140, background: 'white', boxShadow: '0 2px 5px rgba(15,17,17,.15)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Offers</div>
                <div style={{ fontSize: 13, color: '#0F1111' }}>Bank Offer</div>
                <div style={{ fontSize: 12, color: '#007185', marginTop: 4 }}>10% Instant Discount on SBI Cards</div>
              </div>
              <div style={{ border: '1px solid #D5D9D9', borderRadius: 8, padding: '10px 14px', width: 140, background: 'white', boxShadow: '0 2px 5px rgba(15,17,17,.15)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Partner Offers</div>
                <div style={{ fontSize: 13, color: '#0F1111' }}>Get GST invoice and save up to 28%</div>
                <div style={{ fontSize: 12, color: '#007185', marginTop: 4 }}>Sign in/Create a free business account</div>
              </div>
            </div>
          </div>

          {/* Icon List (Returns, Delivery, Warranty) */}
          <div style={{ display: 'flex', gap: 24, padding: '14px 0', borderTop: '1px solid #e7e7e7', borderBottom: '1px solid #e7e7e7', marginBottom: 16, justifyContent: 'center' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70, textAlign: 'center' }}>
               <img src="https://m.media-amazon.com/images/G/31/A2I-Convert/mobile/IconFarm/icon-returns._CB484059092_.png" height={35} />
               <div style={{ fontSize: 12, color: '#007185', marginTop: 4 }}>7 days Replacement</div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70, textAlign: 'center' }}>
               <img src="https://m.media-amazon.com/images/G/31/A2I-Convert/mobile/IconFarm/icon-amazon-delivered._CB485933725_.png" height={35} />
               <div style={{ fontSize: 12, color: '#007185', marginTop: 4 }}>Free Delivery</div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70, textAlign: 'center' }}>
               <img src="https://m.media-amazon.com/images/G/31/A2I-Convert/mobile/IconFarm/icon-warranty._CB485935626_.png" height={35} />
               <div style={{ fontSize: 12, color: '#007185', marginTop: 4 }}>1 Year Warranty</div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70, textAlign: 'center' }}>
               <img src="https://m.media-amazon.com/images/G/31/A2I-Convert/mobile/IconFarm/icon-top-brand._CB617044271_.png" height={35} />
               <div style={{ fontSize: 12, color: '#007185', marginTop: 4 }}>Top Brand</div>
             </div>
          </div>

          {/* Specs Table */}
          {specEntries.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <table style={{ width: '100%', fontSize: 14 }}>
                <tbody>
                  {specEntries.map(([key, val]) => (
                    <tr key={key}>
                      <td style={{ fontWeight: 700, paddingBottom: 6, width: 150, color: '#0F1111' }}>{key}</td>
                      <td style={{ color: '#0F1111', paddingBottom: 6 }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* About this item (Description bullets) */}
          <div style={{ borderTop: '1px solid #e7e7e7', paddingTop: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px', color: '#0F1111' }}>About this item</h2>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#0F1111', lineHeight: 1.5 }}>
              {product.description.split('. ').map((point, i) => (
                point.trim() && <li key={i} style={{ marginBottom: 6 }}>{point.trim()}{point.endsWith('.') ? '' : '.'}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── RIGHT: BUY BOX ────────────────────────────────────── */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ border: '1px solid #D5D9D9', borderRadius: 8, padding: '18px', background: 'white' }}>
            <div style={{ fontSize: 24, fontWeight: 500, color: '#0F1111', marginBottom: 12 }}>
              <span style={{ fontSize: 14, verticalAlign: 'top', marginTop: 2, marginRight: 2 }}>₹</span>
              {Math.floor(price).toLocaleString('en-IN')}
            </div>
            
            <div style={{ fontSize: 14, color: '#007185', marginBottom: 4 }}>
              {user?.is_prime_member ? 'Prime FREE fast delivery' : 'FREE delivery'}
            </div>
            <div style={{ fontSize: 14, color: '#0F1111', fontWeight: 700, marginBottom: 12 }}>
              Tomorrow, {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}. 
              <span style={{ color: '#007185', fontWeight: 400 }}> Order within 4 hrs 12 mins.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#007185', marginBottom: 16 }}>
              <MapPin size={16} color="#0F1111" /> Deliver to John - Bangalore 560038
            </div>

            <div style={{ fontSize: 18, fontWeight: 400, color: '#007600', marginBottom: 12 }}>
              {inStock ? 'In stock' : 'Currently unavailable'}
            </div>

            {inStock && (
              <div style={{ marginBottom: 16 }}>
                <select value={qty} onChange={e => setQty(Number(e.target.value))}
                  style={{ background: '#F0F2F2', border: '1px solid #D5D9D9', borderRadius: 8, padding: '4px 8px', fontSize: 13, color: '#0F1111', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(15,17,17,.15)' }}>
                  {Array.from({ length: Math.min(10, product.stock_qty) }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>Quantity: {n}</option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={() => addToCart(product.id, qty)} disabled={!inStock}
              style={{ width: '100%', padding: '9px 0', border: '1px solid #FCD200', borderRadius: 24,
                fontSize: 14, fontWeight: 400, cursor: inStock ? 'pointer' : 'not-allowed', textAlign: 'center',
                background: inStock ? '#FFD814' : '#EAEDED', color: '#0F1111', marginBottom: 10, boxShadow: '0 2px 5px 0 rgba(213,217,217,.5)' }}>
              Add to Cart
            </button>

            <button onClick={handleBuyNow} disabled={!inStock}
              style={{ width: '100%', padding: '9px 0', border: '1px solid #FCD200', borderRadius: 24,
                fontSize: 14, fontWeight: 400, cursor: inStock ? 'pointer' : 'not-allowed', textAlign: 'center',
                background: inStock ? '#FFA41C' : '#EAEDED', color: '#0F1111', marginBottom: 16, boxShadow: '0 2px 5px 0 rgba(213,217,217,.5)' }}>
              Buy Now
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#007185', marginBottom: 12, justifyContent: 'center' }}>
              <ShieldCheck size={16} color="#aaa" /> Secure transaction
            </div>

            <table style={{ width: '100%', fontSize: 12, color: '#555' }}>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: 4 }}>Ships from</td>
                  <td style={{ color: '#0F1111', paddingBottom: 4 }}>Amazon</td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: 4 }}>Sold by</td>
                  <td style={{ color: '#007185', paddingBottom: 4 }}>Appario Retail</td>
                </tr>
              </tbody>
            </table>

            {/* Gift option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#0F1111', marginTop: 12, paddingTop: 12, borderTop: '1px solid #D5D9D9' }}>
              <input type="checkbox" style={{ accentColor: '#007185', margin: 0, width: 14, height: 14 }} />
              Add gift options
            </div>

            {/* Add to Wishlist Bordered button */}
            <button onClick={() => toggleWishlist(product.id)}
              style={{ width: '100%', padding: '6px 0', border: '1px solid #D5D9D9', borderRadius: 4,
                fontSize: 13, cursor: 'pointer', textAlign: 'center', marginTop: 16,
                background: 'white', color: '#0F1111', boxShadow: '0 2px 5px rgba(15,17,17,.15)' }}>
              {inWishlist ? 'Remove from Wish List' : 'Add to Wish List'}
            </button>
          </div>
        </div>

      </div>

      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '0 24px', borderTop: '1px solid #e7e7e7', marginTop: 30, paddingTop: 30 }}>
        {related.length > 0 && (
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px', color: '#cc6600' }}>
              Customers who viewed this item also viewed
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 14 }}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}


