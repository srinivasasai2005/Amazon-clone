import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BANNERS = [
  'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=2000&q=80', // Shopping promo
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=2000&q=80', // Sale
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=2000&q=80', // Tech
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2000&q=80'  // Home
];

const FALLBACK_IMG = 'https://placehold.co/600x600?text=No+Image';

export default function HomePage() {
  const [slide,       setSlide]       = useState(0);
  const [categories,  setCategories]  = useState([]);
  const [topSellers,  setTopSellers]  = useState([]);
  const [electronics, setElectronics] = useState([]);
  const [books,       setBooks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const timerRef = useRef(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const goTo = useCallback((i) => {
    clearInterval(timerRef.current);
    setSlide(i);
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % BANNERS.length), 5000);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % BANNERS.length), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [catRes, topRes, elecRes, bookRes] = await Promise.all([
          getCategories(),
          getProducts({ sort: 'popular', limit: 12 }),
          getProducts({ category: 'electronics', limit: 12 }),
          getProducts({ category: 'books', limit: 12 })
        ]);
        setCategories(catRes ?? []);
        setTopSellers(topRes.products ?? []);
        setElectronics(elecRes.products ?? []);
        setBooks(bookRes.products ?? []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  // We format the categories into "cards" of 4 sub-items. Since we have a flat category list, we'll just mock this layout behavior.
  const topCategories = categories.slice(0, 4);

  return (
    <div style={{ background: '#E3E6E6', minHeight: '100vh' }}>

      {/* ── HERO BANNER ───────────────────────────────────── */}
      <section style={{ position: 'relative', height: 600, overflow: 'hidden' }}>
        {BANNERS.map((b, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0,
            transition: 'opacity 0.5s ease-in-out', opacity: i === slide ? 1 : 0,
            pointerEvents: i === slide ? 'auto' : 'none' }}>
            {/* Amazon banners have a gradient mask at the bottom so the grey background seamlessly blends into the cards */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0) 50%, #E3E6E6 100%)', zIndex: 1 }} />
            <img src={b} alt="Promo" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
          </div>
        ))}

        <button onClick={() => goTo((slide - 1 + BANNERS.length) % BANNERS.length)}
          style={{ position: 'absolute', left: 20, top: '25%', zIndex: 5,
            background: 'transparent', border: 'none', color: 'transparent', width: 80, height: 250, cursor: 'pointer', outline: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="hero-arrow">
          <span style={{ fontSize: 50, color: 'white', textShadow: '0 0 10px rgba(0,0,0,0.5)', transition: 'color 0.2s' }}>‹</span>
        </button>
        <button onClick={() => goTo((slide + 1) % BANNERS.length)}
          style={{ position: 'absolute', right: 20, top: '25%', zIndex: 5,
            background: 'transparent', border: 'none', color: 'transparent', width: 80, height: 250, cursor: 'pointer', outline: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="hero-arrow">
          <span style={{ fontSize: 50, color: 'white', textShadow: '0 0 10px rgba(0,0,0,0.5)', transition: 'color 0.2s' }}>›</span>
        </button>
      </section>

      {/* ── OVERLAPPING GRID ─────────────────────────────── */}
      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10, marginTop: '-260px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          
          {/* Card 1: 4 Sub-items (Up to 70% off) */}
          <div style={{ background: 'white', padding: 20, paddingBottom: 10 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0F1111', margin: '0 0 16px' }}>Up to 70% off | Clearance store</h2>
            <Link to="/products" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px', textDecoration: 'none' }}>
              {categories.slice(0, 4).map(c => (
                <div key={c.id}>
                  <div style={{ width: '100%', height: 110, overflow: 'hidden' }}>
                    <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#0F1111', marginTop: 4 }}>{c.name}</div>
                </div>
              ))}
            </Link>
            <div style={{ marginTop: 22 }}>
              <Link to="/products" style={{ fontSize: 13, color: '#007185', textDecoration: 'none' }}>See all offers</Link>
            </div>
          </div>

          {/* Card 2: 1 Big Image */}
          <div style={{ background: 'white', padding: 20, paddingBottom: 10 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0F1111', margin: '0 0 16px' }}>Upgrade your home | Amazon Brands</h2>
            <Link to="/products?category=home-kitchen" style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ width: '100%', height: 260, overflow: 'hidden' }}>
                <img src={categories.find(c => c.slug === 'home-kitchen')?.image_url || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
              </div>
            </Link>
            <div style={{ marginTop: 20 }}>
              <Link to="/products?category=home-kitchen" style={{ fontSize: 13, color: '#007185', textDecoration: 'none' }}>Shop now</Link>
            </div>
          </div>

          {/* Card 3: 4 Sub-items (Appliances) */}
          <div style={{ background: 'white', padding: 20, paddingBottom: 10 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0F1111', margin: '0 0 16px' }}>Revamp your style in budget</h2>
            <Link to="/products?category=clothing" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px', textDecoration: 'none' }}>
               {/* Just repeating same category mock photos to simulate a 4-grid for clothes */}
              {Array.from({length: 4}).map((_, i) => (
                <div key={i}>
                  <div style={{ width: '100%', height: 110, overflow: 'hidden' }}>
                    <img src={`https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=75`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#0F1111', marginTop: 4 }}>Clothing and Accessories</div>
                </div>
              ))}
            </Link>
            <div style={{ marginTop: 22 }}>
              <Link to="/products?category=clothing" style={{ fontSize: 13, color: '#007185', textDecoration: 'none' }}>Explore all</Link>
            </div>
          </div>

          {/* Card 4: Sign In or another promo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {user ? (
               <div style={{ background: 'white', padding: 20, paddingBottom: 10, flex: 1 }}>
                <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0F1111', margin: '0 0 16px' }}>Continue shopping for</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px' }}>
                  {books.slice(0,4).map(p => (
                    <Link key={p.id} to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ width: '100%', height: 110, overflow: 'hidden' }}>
                        <img src={p.thumbnail} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f8f8f8' }}
                          onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
                      </div>
                    </Link>
                  ))}
                </div>
               </div>
            ) : (
               <div style={{ background: 'white', padding: '20px', flexShrink: 0, border: '1px solid #D5D9D9' }}>
                <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0F1111', margin: '0 0 16px' }}>Sign in for your best experience</h2>
                <button onClick={() => navigate('/login')}
                  style={{ width: '100%', background: '#FFD814', border: '1px solid #FCD200', padding: '8px 0', borderRadius: 8, fontSize: 14, cursor: 'pointer', color: '#0F1111', boxShadow: '0 2px 5px 0 rgba(213,217,217,.5)' }}>
                  Sign in securely
                </button>
               </div>
            )}
            
            <div style={{ flex: 1 }}>
              <img src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=75" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
            </div>
          </div>

        </div>

        {/* ── HORIZONTAL CAROUSELS ───────────────────────── */}
        <div style={{ background: 'white', marginTop: 20, padding: 20, paddingBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0F1111', margin: 0 }}>Top Sellers around the world</h2>
            <Link to="/products?sort=popular" style={{ fontSize: 14, color: '#007185', textDecoration: 'none', fontWeight: 600 }}>Shop now</Link>
          </div>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'thin' }}>
            {topSellers.map(p => (
              <Link key={p.id} to={`/products/${p.id}`} style={{ flexShrink: 0, textDecoration: 'none' }}>
                <img src={p.thumbnail} alt={p.name} style={{ width: 180, height: 200, objectFit: 'contain', background: '#f8f8f8' }}
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
              </Link>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', marginTop: 20, padding: 20, paddingBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0F1111', margin: 0 }}>Electronics & Accessories</h2>
            <Link to="/products?category=electronics" style={{ fontSize: 14, color: '#007185', textDecoration: 'none', fontWeight: 600 }}>See more</Link>
          </div>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'thin' }}>
            {electronics.map(p => (
              <Link key={p.id} to={`/products/${p.id}`} style={{ flexShrink: 0, textDecoration: 'none' }}>
                <img src={p.thumbnail} alt={p.name} style={{ width: 180, height: 200, objectFit: 'contain', background: '#f8f8f8' }}
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
              </Link>
            ))}
          </div>
        </div>
        
        <div style={{ background: 'white', marginTop: 20, padding: 20, paddingBottom: 24, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#0F1111', margin: 0 }}>Discover your next Great Read</h2>
            <Link to="/products?category=books" style={{ fontSize: 14, color: '#007185', textDecoration: 'none', fontWeight: 600 }}>Shop books</Link>
          </div>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'thin' }}>
            {books.map(p => (
              <Link key={p.id} to={`/products/${p.id}`} style={{ flexShrink: 0, textDecoration: 'none' }}>
                <img src={p.thumbnail} alt={p.name} style={{ width: 180, height: 200, objectFit: 'contain', background: '#f8f8f8' }}
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
