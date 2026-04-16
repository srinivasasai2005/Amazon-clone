import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, MapPin, ChevronDown, Menu } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('All');
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Sync search box with URL
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    setQuery(q ?? '');
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category !== 'All') params.set('category', category);
    navigate(`/products?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, fontFamily: 'Arial, sans-serif' }}>
      {/* ── Primary bar (Nav Belt) ────────────────────────────────── */}
      <nav style={{ backgroundColor: '#131921', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 12, height: 60, boxSizing: 'border-box' }}>
        
        {/* Amazon Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, padding: '6px 8px', border: '1px solid transparent', borderRadius: 2, textDecoration: 'none', transition: 'border-color 0.1s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor='white'}
          onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 24, letterSpacing: -0.5, lineHeight: 1, marginTop: 4 }}>
            amazon<span style={{ color: '#FF9900' }}>.in</span>
          </span>
        </Link>

        {/* Deliver to */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', cursor: 'pointer', padding: '4px 6px', border: '1px solid transparent', borderRadius: 2, transition: 'border-color 0.1s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor='white'}
          onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
          <span style={{ color: '#ccc', fontSize: 12, paddingLeft: 18, lineHeight: 1, height: 14 }}>
            Delivering to {user ? user.name.split(' ')[0] : 'Guest'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MapPin size={16} color="white" style={{ marginTop: -2 }} />
            <span style={{ color: 'white', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>
              Update location
            </span>
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', height: 40, borderRadius: 4, overflow: 'hidden', minWidth: 200, margin: '0 4px', position: 'relative' }}>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ background: '#f3f3f3', color: '#555', fontSize: 12, padding: '0 8px 0 12px', border: 'none', borderRight: '1px solid #cdcdcd', cursor: 'pointer', outline: 'none', width: 'auto' }}>
            <option value="All">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="books">Books</option>
            <option value="clothing">Clothing & Apparel</option>
            <option value="home-kitchen">Home & Kitchen</option>
            <option value="sports">Sports</option>
            <option value="beauty">Beauty</option>
            <option value="toys-games">Toys & Games</option>
            <option value="grocery">Grocery</option>
            <option value="office-supplies">Office Supplies</option>
            <option value="pet-supplies">Pet Supplies</option>
          </select>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Amazon.in"
            style={{ flex: 1, padding: '0 10px', fontSize: 15, color: '#111', background: '#ffffff', outline: 'none', border: 'none', minWidth: 0 }} 
            onFocus={e => { e.target.parentElement.style.boxShadow = '0 0 0 2px #FF9900'; }}
            onBlur={e => { e.target.parentElement.style.boxShadow = 'none'; }} />
          <button type="submit" style={{ backgroundColor: '#F3A847', border: 'none', cursor: 'pointer', flexShrink: 0, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={20} color="#333" />
          </button>
        </form>

        {/* Right Nav Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>

          {/* Account & Lists */}
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setShowAccountMenu(true)}
            onMouseLeave={() => setShowAccountMenu(false)}>
            
            <Link to={user ? "#" : "/login"} style={{ display: 'flex', flexDirection: 'column', padding: '6px 8px', border: '1px solid transparent', borderRadius: 2, cursor: 'pointer', textDecoration: 'none', color: 'white', transition: 'border-color 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='white'}
              onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
              <span style={{ fontSize: 12, lineHeight: 1, height: 14 }}>Hello, {user ? user.name.split(' ')[0] : 'sign in'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>Account & Lists</span>
                <ChevronDown size={14} color="#a1aaba" />
              </div>
              {user?.is_prime_member && (
                <span style={{ fontSize: 10, marginTop: 2, color: '#ffcc66', fontWeight: 700 }}>Prime Member</span>
              )}
            </Link>

            {/* Mega Dropdown */}
            {showAccountMenu && (
              <>
                <div style={{ position: 'absolute', top: 38, left: '50%', transform: 'translateX(-50%)', borderStyle: 'solid', borderWidth: '0 8px 8px 8px', borderColor: 'transparent transparent white transparent', zIndex: 1001 }} />
                <div style={{ position: 'absolute', top: 46, right: -40, width: 420, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: 4, padding: '16px 0', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', cursor: 'default', zIndex: 1000, display: 'flex' }}>
                  
                  {/* Lists Side */}
                  <div style={{ flex: 1, borderRight: '1px solid #eee', padding: '0 20px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: '#111' }}>Your Lists</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Link to="/wishlist" style={{ fontSize: 13, color: '#444', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color='#FF9900'} onMouseLeave={e => e.target.style.color='#444'}>Shopping List</Link>
                      <Link to="/wishlist" style={{ fontSize: 13, color: '#444', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color='#FF9900'} onMouseLeave={e => e.target.style.color='#444'}>Create a Wish List</Link>
                    </div>
                  </div>

                  {/* Account Side */}
                  <div style={{ flex: 1, padding: '0 20px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: '#111' }}>Your Account</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Link to="/orders" style={{ fontSize: 13, color: '#444', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color='#FF9900'} onMouseLeave={e => e.target.style.color='#444'}>Your Orders</Link>
                      <Link to="/wishlist" style={{ fontSize: 13, color: '#444', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color='#FF9900'} onMouseLeave={e => e.target.style.color='#444'}>Your Wish List</Link>
                      <Link to="/products?sort=popular" style={{ fontSize: 13, color: '#444', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color='#FF9900'} onMouseLeave={e => e.target.style.color='#444'}>Your Recommendations</Link>
                      <Link to="/prime" style={{ fontSize: 13, color: '#444', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color='#FF9900'} onMouseLeave={e => e.target.style.color='#444'}>
                        {user?.is_prime_member ? 'Manage Prime Membership' : 'Your Prime Membership'}
                      </Link>
                      
                      {user ? (
                        <div onClick={handleLogout} style={{ fontSize: 13, color: '#444', cursor: 'pointer', marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }} onMouseEnter={e => e.target.style.color='#FF9900'} onMouseLeave={e => e.target.style.color='#444'}>Sign Out</div>
                      ) : (
                        <Link to="/login" style={{ fontSize: 13, color: '#444', textDecoration: 'none', marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }} onMouseEnter={e => e.target.style.color='#FF9900'} onMouseLeave={e => e.target.style.color='#444'}>Sign In</Link>
                      )}
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>

          {/* Returns & Orders */}
          <Link to={user ? "/orders" : "/login"} style={{ display: 'flex', flexDirection: 'column', padding: '6px 8px', border: '1px solid transparent', borderRadius: 2, cursor: 'pointer', textDecoration: 'none', color: 'white', transition: 'border-color 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='white'}
            onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
            <span style={{ fontSize: 12, lineHeight: 1, height: 14 }}>Returns</span>
            <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>& Orders</span>
          </Link>

          {/* Cart */}
          <Link to={user ? "/cart" : "/login"} style={{ display: 'flex', alignItems: 'flex-end', padding: '6px 8px', border: '1px solid transparent', borderRadius: 2, cursor: 'pointer', textDecoration: 'none', color: 'white', transition: 'border-color 0.1s', position: 'relative' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='white'}
            onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
            <div style={{ position: 'relative', display: 'flex' }}>
              <ShoppingCart size={32} />
              <span style={{ position: 'absolute', top: -5, left: 14, color: '#F3A847', fontSize: 16, fontWeight: 800, width: 22, textAlign: 'center' }}>
                {count > 99 ? '99+' : count}
              </span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>Cart</span>
          </Link>
        </div>
      </nav>

      {/* ── Secondary Nav (Subnav) ─────────────────────────────────── */}
      <div style={{ backgroundColor: '#232F3E', padding: '4px 16px', display: 'flex', alignItems: 'center', gap: 4, height: 40, boxSizing: 'border-box', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', border: '1px solid transparent', borderRadius: 2, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14, flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.borderColor='white'} onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
          <Menu size={18} /> All
        </Link>
        
        {[
          { label: 'Prime', path: '/prime' },
          { label: 'Fashion', path: '/products?category=clothing' },
          { label: 'Best Sellers', path: '/products?sort=popular' },
          { label: "Today's Deals", path: '/products?maxPrice=2000&sort=popular' },
          { label: 'Mobiles', path: '/products?category=electronics' },
          { label: 'Electronics', path: '/products?category=electronics' },
          { label: 'Customer Service', path: '/customer-service' },
          { label: 'New Releases', path: '/products?sort=newest' },
          { label: 'Home & Kitchen', path: '/products?category=home-kitchen' },
          { label: 'Grocery', path: '/products?category=grocery' }
        ].map(item => (
          <Link key={item.label} to={item.path} style={{ padding: '4px 8px', border: '1px solid transparent', borderRadius: 2, color: 'white', textDecoration: 'none', fontSize: 14, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.borderColor='white'} onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
