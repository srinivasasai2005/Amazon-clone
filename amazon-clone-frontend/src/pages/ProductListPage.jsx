import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'rating',     label: 'Avg. Customer Review' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest',     label: 'Newest Arrivals' },
];

const PRICE_MIN_LIMIT = 0;
const PRICE_MAX_LIMIT = 100000;
const PRICE_STEP = 500;

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);

  const q        = searchParams.get('q')        ?? '';
  const category = searchParams.get('category') ?? '';
  const sort     = searchParams.get('sort')     ?? 'popular';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const minPriceNum = minPrice ? Number(minPrice) : PRICE_MIN_LIMIT;
  const maxPriceNum = maxPrice ? Number(maxPrice) : PRICE_MAX_LIMIT;

  const [draftMinPrice, setDraftMinPrice] = useState(minPriceNum);
  const [draftMaxPrice, setDraftMaxPrice] = useState(maxPriceNum);

  useEffect(() => {
    setDraftMinPrice(minPriceNum);
    setDraftMaxPrice(maxPriceNum);
  }, [minPriceNum, maxPriceNum]);

  const setPriceRange = (nextMin, nextMax) => {
    const boundedMin = Math.max(PRICE_MIN_LIMIT, Math.min(nextMin, PRICE_MAX_LIMIT));
    const boundedMax = Math.max(PRICE_MIN_LIMIT, Math.min(nextMax, PRICE_MAX_LIMIT));
    const safeMin = Math.min(boundedMin, boundedMax);
    const safeMax = Math.max(boundedMin, boundedMax);

    setDraftMinPrice(safeMin);
    setDraftMaxPrice(safeMax);
  };

  const applyPriceFilter = () => {
    const p = new URLSearchParams(searchParams);
    if (draftMinPrice <= PRICE_MIN_LIMIT) p.delete('minPrice');
    else p.set('minPrice', String(draftMinPrice));

    if (draftMaxPrice >= PRICE_MAX_LIMIT) p.delete('maxPrice');
    else p.set('maxPrice', String(draftMaxPrice));

    setSearchParams(p);
  };

  const hasPendingPriceChanges = draftMinPrice !== minPriceNum || draftMaxPrice !== maxPriceNum;


  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProducts({ q: q||undefined, category: category||undefined, sort,
        minPrice: minPrice||undefined, maxPrice: maxPrice||undefined }),
      getCategories(),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.products ?? []);
        setTotal(prodRes.total ?? 0);
        setCategories(catRes ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q, category, sort, minPrice, maxPrice]);

  const clearFilters = () => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    setSearchParams(p);
  };

  const hasFilters = category || minPrice || maxPrice;

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', padding: '16px', display: 'flex', gap: 18, alignItems: 'flex-start' }}>

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside style={{ width: 210, flexShrink: 0, position: 'sticky', top: 100 }}>
        <div style={{ background: 'white', borderRadius: 6, padding: '16px 18px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 14, borderBottom: '1px solid #EAEDED', paddingBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Filters</h3>
            {hasFilters && (
              <button onClick={clearFilters}
                style={{ background: 'none', border: 'none', color: '#cc0000',
                  cursor: 'pointer', fontSize: 12, padding: 0, fontWeight: 500 }}>
                Clear all
              </button>
            )}
          </div>

          {/* Category */}
          <div style={{ marginBottom: 18 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#333',
              textTransform: 'uppercase', letterSpacing: 0.5 }}>Department</h4>
            {[{ id: 'all', name: 'All Departments', slug: '' }, ...categories].map(cat => {
              const active = cat.slug === category;
              return (
                <button key={cat.id} onClick={() => setParam('category', cat.slug)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none',
                    border: 'none', cursor: 'pointer', padding: '5px 6px', borderRadius: 4,
                    fontSize: 13, color: active ? '#c45500' : '#007185', fontWeight: active ? 700 : 400,
                    background: active ? '#fff3e0' : 'transparent', transition: 'background 0.15s' }}>
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Price range */}
          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#333',
              textTransform: 'uppercase', letterSpacing: 0.5 }}>Price</h4>
            <div style={{ background: '#f7f8f8', border: '1px solid #E3E6E6', borderRadius: 8, padding: '10px 10px 8px' }}>
              <div style={{ fontSize: 12, color: '#565959', marginBottom: 6 }}>
                Min: ₹{draftMinPrice.toLocaleString('en-IN')}
              </div>
              <input
                type="range"
                min={PRICE_MIN_LIMIT}
                max={PRICE_MAX_LIMIT}
                step={PRICE_STEP}
                value={Math.min(draftMinPrice, draftMaxPrice)}
                onChange={(e) => setPriceRange(Number(e.target.value), draftMaxPrice)}
                style={{ width: '100%', accentColor: '#FF9900', marginBottom: 10 }}
              />

              <div style={{ fontSize: 12, color: '#565959', marginBottom: 6 }}>
                Max: ₹{draftMaxPrice.toLocaleString('en-IN')}
              </div>
              <input
                type="range"
                min={PRICE_MIN_LIMIT}
                max={PRICE_MAX_LIMIT}
                step={PRICE_STEP}
                value={Math.max(draftMaxPrice, draftMinPrice)}
                onChange={(e) => setPriceRange(draftMinPrice, Number(e.target.value))}
                style={{ width: '100%', accentColor: '#FF9900' }}
              />

              <button
                onClick={applyPriceFilter}
                disabled={!hasPendingPriceChanges}
                style={{
                  width: '100%',
                  marginTop: 10,
                  border: '1px solid #D5A928',
                  background: hasPendingPriceChanges ? '#FFD814' : '#f3f3f3',
                  color: hasPendingPriceChanges ? '#111' : '#888',
                  borderRadius: 18,
                  padding: '7px 12px',
                  cursor: hasPendingPriceChanges ? 'pointer' : 'not-allowed',
                  fontSize: 12,
                  fontWeight: 700
                }}
              >
                Apply price filter
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#777' }}>
                <span>₹{PRICE_MIN_LIMIT.toLocaleString('en-IN')}</span>
                <span>₹{PRICE_MAX_LIMIT.toLocaleString('en-IN')}</span>
              </div>
            </div>
            {(minPrice || maxPrice) && (
              <button onClick={() => {
                setDraftMinPrice(PRICE_MIN_LIMIT);
                setDraftMaxPrice(PRICE_MAX_LIMIT);
                setParam('minPrice','');
                setParam('maxPrice','');
              }}
                style={{ background:'none', border:'none', color:'#cc0000',
                  cursor:'pointer', fontSize:12, padding:'4px 6px', marginTop:4 }}>
                Clear price filter
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: 6, padding: '12px 18px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 14, color: '#555' }}>
            {q && <><strong style={{ color: '#111' }}>"{q}"</strong> — </>}
            {loading ? 'Searching…' : `${total.toLocaleString()} result${total !== 1 ? 's' : ''}`}
            {category && !loading && <span style={{ color: '#c45500', marginLeft: 6 }}>in selected category</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>Sort by:</label>
            <select value={sort} onChange={e => setParam('sort', e.target.value)}
              style={{ border: '1px solid #ccc', borderRadius: 6, padding: '6px 10px',
                fontSize: 13, cursor: 'pointer', outline: 'none', background: 'white' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <EmptyState icon="🔍" title="No results found"
            message={q ? `We couldn't find anything matching "${q}". Try different keywords.` : 'No products in this category.'}
            action={{ label: 'Browse all products', onClick: () => setSearchParams({}) }} />
        ) : (
          <div style={{ display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 14 }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
